# Security Architecture — AlgoArena

**Version:** 1.0  
**Date:** 2026-05-04

---

## 1. Threat Model

| Threat | Risk | Mitigation |
|--------|------|------------|
| Malicious code execution (fork bomb, infinite loop) | Critical | isolate cgroup limits: max 1 PID, CPU time limit |
| Container escape from judge sandbox | Critical | Linux namespaces + seccomp + dedicated nodes |
| Network access from user code | Critical | Network namespace isolation (no network interface) |
| Filesystem access from user code | High | Read-only rootfs mount, tmpfs for /tmp |
| SQL injection | High | Prisma parameterized queries, Zod input validation |
| XSS via problem description | High | DOMPurify for rendered Markdown, strict CSP |
| JWT forgery | High | RS256 signing, short expiry, key rotation policy |
| Auth brute force | Medium | Rate limiting: 10 req/min/IP on auth endpoints |
| Submission flooding (DoS) | Medium | 30 submissions/hour/user rate limit, queue depth alerts |
| CSRF on state mutations | Medium | SameSite=Strict cookies + CSRF token for non-cookie flows |
| Secrets leakage in logs | Medium | Pino redaction config: never log passwords/tokens |
| Dependency vulnerabilities | Medium | Dependabot + npm audit + govulncheck in CI |
| Unauthorized admin access | High | Role-based middleware, admin routes protected |

---

## 2. Code Execution Security (isolate)

### Sandbox Configuration

```bash
# isolate run command template
isolate \
  --box-id=$BOX_ID \
  --time=$CPU_LIMIT \        # CPU time (seconds)
  --wall-time=$WALL_LIMIT \  # Wall clock (2x CPU limit)
  --mem=$MEM_LIMIT_KB \      # Memory in KB
  --fsize=65536 \            # Max output file 64MB
  --processes=1 \            # No fork (prevents fork bombs)
  --stdin=$INPUT_FILE \
  --stdout=$OUTPUT_FILE \
  --stderr=$STDERR_FILE \
  --meta=$META_FILE \        # Resource usage written here
  --no-default-dirs \        # No /proc, /sys mounting
  --dir=/usr:ro \            # Read-only /usr
  --dir=/tmp:rw \            # Writable /tmp (tmpfs)
  --run \
  -- $COMMAND $ARGS
```

### Blocked Syscalls (seccomp allowlist — deny by default)

Critical blocked syscalls:
- `ptrace` — cannot inspect other processes
- `clone` with `CLONE_NEWUSER` — cannot create user namespaces
- `socket`, `connect`, `bind` — no network access
- `mount`, `umount2` — cannot modify filesystem mounts
- `syslog`, `sysfs` — no kernel log access
- `perf_event_open` — no hardware performance monitoring
- `kexec_load` — cannot load new kernel
- `init_module`, `delete_module` — no kernel module loading

### Node Pool Isolation

Judge service pods run on dedicated EC2 nodes with taint `role=judge:NoSchedule`. No other workloads schedule on these nodes. This means:

- A container escape from isolate can only affect other judge pods on the same node
- Judge nodes have no IAM roles beyond what is needed to pull images and write to CloudWatch
- Network policy blocks all ingress to judge pods except from submission-service
- Judge pods cannot reach the RDS database directly (only submission-service can)

---

## 3. Authentication & Authorization

### JWT Token Design

```typescript
// Access Token payload (RS256, 15-minute TTL)
{
  sub: "user-uuid",
  email: "user@example.com",
  role: "user" | "admin",
  iat: 1234567890,
  exp: 1234567890 + 900,  // 15 minutes
  jti: "unique-token-id"
}

// Refresh Token
// - Opaque random string (32 bytes, hex encoded)
// - Stored in Redis: refresh:{userId} → { tokenHash, jti }
// - HttpOnly + Secure + SameSite=Strict cookie
// - TTL: 30 days
// - Rotated on every use
```

### Authorization Middleware

```
Route Access Levels:
  Public:         GET /problems, GET /contests, GET /u/:username
  Authenticated:  POST /submissions, PATCH /users/me, etc.
  Admin only:     POST /admin/*, PATCH /admin/*
```

API Gateway verifies JWT on every request to authenticated routes by checking RS256 signature against the public key (loaded at startup, no Redis/DB lookup needed for valid tokens).

### OAuth2 Security

- PKCE flow enforced for Google/GitHub OAuth
- State parameter validated to prevent CSRF on OAuth callback
- OAuth tokens never stored — only used to fetch user info then discarded
- Account linking: if OAuth email matches existing account, link silently

---

## 4. Input Validation

All API request bodies validated with **Zod** schemas before reaching business logic:

```typescript
// Example: submission validation
const SubmitSchema = z.object({
  problemId: z.string().uuid(),
  language: z.enum(['python3', 'javascript', 'typescript', 'java', 'cpp17', 
                     'go', 'rust', 'csharp', 'kotlin', 'ruby']),
  code: z.string()
    .min(1, 'Code cannot be empty')
    .max(65536, 'Code too large (max 64KB)'),
  contestId: z.string().uuid().optional()
})
```

**Code size limit:** 64KB per submission (prevents memory exhaustion from large code strings).

---

## 5. Content Security Policy

```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'unsafe-eval';    # Monaco requires unsafe-eval
  style-src 'self' 'unsafe-inline';   # Monaco requires inline styles
  img-src 'self' data: https:;
  connect-src 'self' wss://algoarena.com;
  font-src 'self';
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
```

Note: `unsafe-eval` required for Monaco Editor. The risk is mitigated by:
- No user-generated content injected into script context
- DOMPurify sanitizing all rendered Markdown
- Problem descriptions rendered in sandboxed iframe (if needed)

---

## 6. Rate Limiting

Implemented at API Gateway level using Redis sliding window:

| Endpoint | Limit | Window |
|----------|-------|--------|
| POST /auth/login | 10 req | 1 minute (per IP) |
| POST /auth/register | 5 req | 1 minute (per IP) |
| POST /auth/forgot-password | 3 req | 15 minutes (per IP) |
| POST /submissions | 30 req | 1 hour (per user) |
| POST /submissions/run | 60 req | 1 hour (per user) |
| POST /posts | 20 req | 1 hour (per user) |
| GET /problems | 300 req | 1 minute (per IP) |

Rate limit headers returned: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

---

## 7. Secrets Management

- All secrets stored in **AWS Secrets Manager**
- Injected as environment variables at pod startup via External Secrets Operator
- Never committed to git (enforced by `.gitignore` + `git-secrets` pre-commit hook)
- Secrets rotated automatically: database passwords (30 days), JWT signing keys (90 days)
- CI/CD uses separate secrets with minimal permissions (read ECR, deploy to EKS)

```
Required secrets:
  DATABASE_URL          → RDS PostgreSQL connection string
  REDIS_URL             → ElastiCache Redis URL
  JWT_PRIVATE_KEY       → RS256 private key (Auth Service only)
  JWT_PUBLIC_KEY        → RS256 public key (all services)
  GOOGLE_CLIENT_ID      → OAuth2
  GOOGLE_CLIENT_SECRET  → OAuth2
  GITHUB_CLIENT_ID      → OAuth2
  GITHUB_CLIENT_SECRET  → OAuth2
  AWS_SES_REGION        → Email sending
  SENTRY_DSN            → Error tracking
```

---

## 8. OWASP Top 10 Coverage

| OWASP Category | Mitigation |
|----------------|------------|
| A01: Broken Access Control | Role-based middleware, JWT auth on all protected routes |
| A02: Cryptographic Failures | HTTPS everywhere, RS256 JWT, bcrypt for passwords (cost 12) |
| A03: Injection | Prisma ORM parameterized queries, Zod input validation |
| A04: Insecure Design | Threat modeling documented, least-privilege service accounts |
| A05: Security Misconfiguration | Helmet.js, secure headers, no default creds, CSP |
| A06: Vulnerable Components | Dependabot, npm audit, govulncheck in CI |
| A07: Auth Failures | Rate limiting, token rotation, HttpOnly cookies |
| A08: Software Integrity | SBOM generation, signed container images (cosign) |
| A09: Logging Failures | Structured logging, no sensitive data in logs, audit trail |
| A10: SSRF | No user-controlled URLs fetched by backend; allow-list validation |

---

## 9. Dependency Scanning

CI pipeline runs on every PR:
```yaml
- name: npm audit
  run: pnpm audit --audit-level=high
  
- name: Go vulnerability check  
  run: govulncheck ./...
  
- name: Container scan
  uses: aquasecurity/trivy-action
  with:
    severity: 'CRITICAL,HIGH'
    exit-code: '1'
```

Dependabot enabled for all `package.json` and `go.mod` files with weekly update schedule.

---

## 10. Incident Response

### Severity Levels

| Level | Example | Response Time |
|-------|---------|---------------|
| P0 | Sandbox escape, data breach | 15 minutes |
| P1 | Auth bypass, judge down during contest | 1 hour |
| P2 | Performance degradation, feature outage | 4 hours |
| P3 | Minor bug, cosmetic issue | Next sprint |

### P0 Runbook (Sandbox Escape)

1. Immediately cordon and drain all judge nodes: `kubectl cordon judge-node-*`
2. Scale judge deployment to 0: `kubectl scale deploy/judge-service --replicas=0`
3. Preserve forensic evidence: capture container logs, `kubectl debug` session
4. Notify security team and escalate
5. Review isolate version and patch
6. Re-enable only after root cause identified and fixed
