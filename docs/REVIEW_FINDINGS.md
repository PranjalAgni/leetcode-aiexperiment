# AlgoArena — Plan Review Findings

**Reviewed by:** Claude Code  
**Date:** 2026-05-04  
**Scope:** PRD.md, ARCHITECTURE.md, SECURITY.md, TESTING.md  
**Status:** Awaiting remediation

---

## Priority Legend

| Priority | Meaning |
|----------|---------|
| CRITICAL | Blocks implementation — will cause runtime errors, security holes, or irreconcilable conflicts |
| HIGH | Must be resolved before the affected milestone starts |
| MEDIUM | Should be resolved; risk of bugs or regressions if deferred |
| LOW | Cleanup / polish — can be addressed in a later pass |

---

## 1. PRD.md Issues

### CRITICAL

**[PRD-C1] Rating tier system conflict**  
PRD §4.2.1 F-CONTEST-007 defines tiers as Bronze/Silver/Gold/Platinum/Diamond/Master/Grandmaster.  
REQUIREMENTS.md §4.3 defines a Codeforces-inspired system: Newbie/Pupil/Specialist/Expert/Candidate Master/Master/International Master/Grandmaster/International Grandmaster/Legendary Grandmaster with different rating breakpoints.  
These are completely different systems. Must be reconciled to a single canonical table before the contest service is built.

**[PRD-C2] Subscription/billing scope conflict**  
PRD §6 Out of Scope: "Payments / subscription billing infrastructure" excluded from V1.  
REQUIREMENTS.md §7.2: Subscription management (Stripe, monthly/annual tiers) is all-P1 — targeted for Phase 1 (Month 4–6).  
This is a material scope conflict that affects milestone planning.

**[PRD-C3] F-AUTH-003 ambiguous token storage**  
"15-min access token + 30-day refresh token in HttpOnly cookie" reads as both tokens in cookies.  
SECURITY.md §3 clarifies access token = Bearer (in-memory), only refresh token in HttpOnly cookie.  
Ambiguous wording will mislead frontend implementation. Needs explicit clarification.

### HIGH

**[PRD-H1] Peak submission rate inconsistency**  
PRD §5.2: 10,000 submissions/minute during contest bursts.  
REQUIREMENTS.md §11.2.2: 5,000+ submissions/minute.  
Must converge before judge worker pool sizing and KEDA autoscaling targets can be specified.

**[PRD-H2] Leaderboard latency target conflict**  
PRD §5.1: "Real-time (< 1s lag)" for leaderboard refresh.  
REQUIREMENTS.md §11.1.5: "< 60s delay".  
ARCHITECTURE.md §7: "updates every ~60s".  
PRD target is 60× more aggressive and changes the SSE/WebSocket implementation significantly.

**[PRD-H3] Discussion tab priority mismatch**  
PRD §4.2.1 F-DISC-001: P1 (post-MVP).  
REQUIREMENTS.md §5.1.1: P0 (must have at launch).  
Affects MVP scope.

**[PRD-H4] GDPR deletion priority mismatch**  
PRD §4.1.1 F-AUTH-005: P0.  
REQUIREMENTS.md §3.1.9: P1.  
Affects MVP checklist and legal risk framing.

**[PRD-H5] Missing OLE/ILE verdicts**  
PRD §4.1.4 F-JUDGE-003 lists 6 verdict types.  
REQUIREMENTS.md §2.4: Output Limit Exceeded (OLE) and Idleness Limit Exceeded (ILE) are P1.  
These are also missing from the DB schema verdict ENUM in ARCHITECTURE.md.

**[PRD-H6] Penalty time undefined**  
PRD F-CONTEST-004 ranks by "problems solved, then by total penalty time" but never defines penalty per wrong submission.  
REQUIREMENTS.md §4.2.6: +5 minutes per WA (ICPC-style). Must be made explicit.

### MEDIUM

**[PRD-M1] Cloud code persistence silently dropped**  
PRD §4.1.3 F-EDIT-007: localStorage only.  
REQUIREMENTS.md §2.1.10 (P0): "Auto-save draft to localStorage / cloud on every keystroke".  
Cloud save path is missing from PRD.

**[PRD-M2] Daily Challenge feature absent**  
REQUIREMENTS.md §1.1.11: Daily Challenge is P1. Not mentioned in PRD P0, P1, or P2 sections.

**[PRD-M3] Admin moderator role missing**  
REQUIREMENTS.md §8.4.4 requires admin/moderator/regular-user RBAC.  
PRD F-ADMIN-006 says "role assignment" without enumerating roles.

---

## 2. ARCHITECTURE.md Issues

### CRITICAL

**[ARCH-C1] `npx tsc` in network-isolated sandbox**  
ARCHITECTURE.md §5 TypeScript compile command: `npx tsc --outDir /out`  
SECURITY.md §2 seccomp allowlist blocks `socket`, `connect`, `bind`.  
`npx` will attempt an npm registry fetch if `tsc` is not cached — this will silently fail or throw inside the sandbox.  
Fix: use a pre-installed `tsc` binary, e.g. `/usr/local/bin/tsc --outDir /out`.

**[ARCH-C2] DB schema missing OLE/ILE verdicts**  
`submissions.verdict ENUM('pending','accepted','wrong_answer','tle','mle','re','ce')` is missing `ole` and `ile`.  
Must be added before judge service and submission service are built.

**[ARCH-C3] DB schema missing moderator role**  
`users.role ENUM('user','admin')` missing `moderator`.  
Required by REQUIREMENTS.md §8.4.4.

### HIGH

**[ARCH-H1] Language matrix version drift**  
Architecture §5 shows stale versions vs. REQUIREMENTS.md §2.2:
- Java 21 → should be OpenJDK 25
- C++17 → should be C++23 (Clang 19)
- TypeScript unversioned → should be TS 5.7.3 + Node 22
- Python, Go, Rust unversioned

**[ARCH-H2] Language matrix includes P1 languages without labeling**  
Matrix shows 10 languages as if all launch-day. PRD MVP specifies 7; C#, Kotlin, Ruby are P1.  
Add a P0/P1 column to the matrix to prevent premature implementation.

**[ARCH-H3] `--fsize` conflicts with output limit spec**  
SECURITY.md (sourced from ARCHITECTURE.md sandbox config): `--fsize=65536` = 64MB.  
REQUIREMENTS.md §2.6: max output file size = 1,024 KB (1MB).  
Should be `--fsize=1024`.

**[ARCH-H4] Test case storage — no S3 strategy**  
`test_cases` table stores `input TEXT` and `expected_output TEXT` in PostgreSQL.  
REQUIREMENTS.md §8.2.4: large test cases must go to S3.  
No `s3_key` reference column exists; no routing strategy for large vs. small payloads.

**[ARCH-H5] Missing API endpoints**  
The route list omits:
- `DELETE /users/me` — GDPR deletion (P0 per PRD)
- `GET /users/me/export` — GDPR data export (REQUIREMENTS §3.1.9)
- `GET /health` / `GET /ready` — health checks (P0 per REQUIREMENTS §11.5.5)

**[ARCH-H6] No read replicas in infrastructure**  
REQUIREMENTS.md §11.2.4: at least 2 read replicas for problem queries.  
ARCHITECTURE.md §10 mentions Multi-AZ but not read replicas.

**[ARCH-H7] No full-text search strategy**  
Problem search is P0 (REQUIREMENTS §1.1.7). REQUIREMENTS.md §12.2 proposes Elasticsearch or Postgres FTS.  
ARCHITECTURE.md has no FTS index on the `problems` table and names no search approach.

### MEDIUM

**[ARCH-M1] Architecture diagram missing Discussion Service**  
§2 service inventory lists discussion behavior in problem-service or as part of another service. The ASCII diagram in §1 shows Auth, User, Problem, Sub, Contest, Notif — but Discussion is not represented.

**[ARCH-M2] SSE result TTL too short**  
Redis key `submission:result:{submissionId}` TTL = 60s.  
If SSE connection drops and reconnects after 60s, the result is gone and UI is stuck.  
Increase TTL or document that the SSE handler falls back to the `submissions` table (already updated per §5 step 8).

**[ARCH-M3] Test case parallelism hardcoded**  
"For each test case (in parallel up to N=4 goroutines)".  
With 1,000 test cases per problem (max per REQUIREMENTS), N=4 is slow and should be an ENV-configurable value per judge pod, especially given KEDA autoscaling.

---

## 3. SECURITY.md Issues

### CRITICAL

**[SEC-C1] `--fsize=65536` (64MB) — same as ARCH-H3**  
Should be `--fsize=1024` (1MB per REQUIREMENTS.md §2.6).

**[SEC-C2] Missing `--stack` flag**  
isolate supports `--stack=<kb>` to cap stack size.  
REQUIREMENTS.md §2.6: stack limit = 64,000 KB.  
Omitting this flag leaves stack exhaustion as an unconstrained attack vector.

**[SEC-C3] Silent OAuth account linking — account takeover risk**  
§3: "if OAuth email matches existing account, link silently".  
This is a classic OAuth account takeover vector: attacker registers an OAuth identity at a permissive provider using the victim's email, and silently gains access to their account.  
Fix: require the existing account owner to confirm linking via an email prompt before the link is completed.

### HIGH

**[SEC-H1] Missing `io_uring` syscalls in seccomp blocklist**  
`io_uring_setup`, `io_uring_enter`, `io_uring_register` are not listed in the blocked syscalls.  
These have had multiple container escape CVEs on Linux kernels ≥5.1 (e.g., CVE-2022-29582, CVE-2023-2598).  
Must be explicitly blocked.

**[SEC-H2] No CSP report-uri / report-to directive**  
§5 CSP has no reporting endpoint.  
Without CSP violation reporting, policy violations in production go undetected.  
Add `report-uri` or `report-to` directive pointing to an internal or third-party collector.

**[SEC-H3] Banned user access token still valid 15 min**  
§3: "Blocklist checked only on access token validation failure".  
An admin-banned user retains a valid access token for up to 15 minutes.  
Document this as an explicit known constraint, or add ban status to a short-lived Redis set checked on every authenticated request.

### MEDIUM

**[SEC-M1] CSP iframe sandboxing is conditional**  
§5: "Problem descriptions rendered in sandboxed iframe (if needed)" is not a firm decision.  
Given `unsafe-eval` is present, DOMPurify alone does not cover all XSS vectors.  
Make the iframe sandboxing of user-generated content definitive.

**[SEC-M2] JWT_PUBLIC_KEY in AWS Secrets Manager**  
A public key is not a secret. Storing it in Secrets Manager adds unnecessary latency at pod startup and consumes secret rotation quotas.  
Move `JWT_PUBLIC_KEY` to a Kubernetes ConfigMap. Only `JWT_PRIVATE_KEY` needs Secrets Manager.

**[SEC-M3] Missing P0/P1 incident runbooks**  
Only a sandbox escape runbook exists.  
The severity table lists "data breach" as P0 and "auth bypass" as P1 — both need at least stub runbooks alongside the sandbox escape runbook.

**[SEC-M4] Admin-authored content not server-side sanitized**  
Input validation covers user-submitted code (Zod schema shown).  
Problem descriptions are created by admins and rendered as Markdown to all users.  
Defense in depth requires server-side sanitization even for trusted roles — a compromised admin account otherwise becomes a stored XSS vector.

---

## 4. TESTING.md Issues

### CRITICAL

**[TEST-C1] `await db.$migrate()` — invalid Prisma API**  
Prisma Client has no `$migrate()` method.  
As written, all integration tests in `beforeAll` will throw and the entire suite will fail.  
Fix: use `execSync('npx prisma migrate deploy')` in `beforeAll`, or use `prisma.$executeRawUnsafe` with migration SQL.

**[TEST-C2] Monaco E2E input will be flaky**  
`page.locator('.monaco-editor').click()` + `page.keyboard.type(...)` is unreliable.  
Monaco uses a virtualized textarea — characters drop or reorder with standard Playwright input.  
Fix: `page.evaluate(() => monaco.editor.getModels()[0].setValue(code))` or use a Monaco Playwright helper.

### HIGH

**[TEST-H1] `isolate` version unpinned in CI**  
`git clone https://github.com/ioi/isolate` clones HEAD.  
CI will silently pick up breaking upstream changes.  
Fix: pin to a specific tag, e.g. `git checkout v1.10.1`.

**[TEST-H2] Load test validates 202 only, not judge throughput**  
k6 script checks `status is 202` but does not verify jobs are actually judged within SLA under load.  
Add a second phase: poll `GET /submissions/:id` until verdict != pending, assert p95 latency < target.

**[TEST-H3] No sandbox security regression tests**  
No tests verify that malicious code patterns are safely handled:
- Fork bomb → returns TLE/RE, worker does not crash
- Network call attempt → returns RE with permission denied
- `/etc/passwd` read attempt → returns empty or RE  
These are the primary security guarantee of the platform and must be in the judge integration test suite.

### MEDIUM

**[TEST-M1] Contest E2E "mocked in test env" — no implementation**  
Test comment says "(mocked in test env)" for contest start but provides no seeding approach.  
The pre-start countdown → start transition has no coverage. Seed contests with `starts_at` in the past for "ongoing" state; document how the transition is tested.

**[TEST-M2] E2E happy-path only — missing key journeys**  
Current E2E covers only: login + solve, register, contest overview.  
Missing:
- Wrong Answer / TLE verdict display
- Rate limiting UX (31st submission returns 429)
- Admin: create problem → add test case → publish
- User profile heatmap after submission
- Contest leaderboard SSE live update
- OAuth login smoke test

**[TEST-M3] Coverage targets missing for api-gateway and notification-service**  
§7 coverage table omits these two services.  
api-gateway handles JWT verification and rate limiting (security-critical); both need minimum coverage targets.

**[TEST-M4] `verifyToken` in unit test couples to implementation keys**  
Test calls `verifyToken(token)` to assert on generated token payload.  
The test private key must be explicitly documented as separate from production keys, or the test is a credentials exposure risk.

---

## 5. Cross-Document Inconsistencies (Summary Table)

| # | Issue | Documents Affected | Resolution Needed |
|---|-------|--------------------|-------------------|
| XD-1 | `--fsize=65536` (64MB) vs 1MB output limit spec | SECURITY.md, ARCHITECTURE.md, REQUIREMENTS.md | Set `--fsize=1024` |
| XD-2 | Rating tier names are two entirely different systems | PRD.md, REQUIREMENTS.md | Pick one system, update both docs |
| XD-3 | MVP language count: 7 in PRD vs 10 in ARCHITECTURE matrix | PRD.md, ARCHITECTURE.md | Add P0/P1 column to matrix |
| XD-4 | Leaderboard latency: <1s (PRD) vs <60s (REQUIREMENTS + ARCHITECTURE) | PRD.md, REQUIREMENTS.md, ARCHITECTURE.md | Decide and unify |
| XD-5 | Peak submission rate: 10,000/min (PRD) vs 5,000/min (REQUIREMENTS) | PRD.md, REQUIREMENTS.md | Decide and set KEDA targets accordingly |
| XD-6 | Discussion priority: P0 (REQUIREMENTS) vs P1 (PRD) | PRD.md, REQUIREMENTS.md | Unify to single priority |
| XD-7 | GDPR deletion priority: P0 (PRD) vs P1 (REQUIREMENTS) | PRD.md, REQUIREMENTS.md | Unify to single priority |
| XD-8 | Subscription/billing: out of scope (PRD) vs P1 (REQUIREMENTS) | PRD.md, REQUIREMENTS.md | Explicit scope decision |
| XD-9 | `npx tsc` in network-isolated sandbox | ARCHITECTURE.md, SECURITY.md | Use pre-installed `tsc` binary |
| XD-10 | No moderator role in DB schema despite REQUIREMENTS requiring it | ARCHITECTURE.md, REQUIREMENTS.md | Add to ENUM, add middleware level |

---

## 6. Recommended Fix Order

**Before any coding starts (CRITICAL blockers):**
1. XD-2 — Reconcile rating tier system (stakeholder decision)
2. XD-8 — Resolve subscription scope (stakeholder decision)
3. PRD-C3 — Clarify JWT token storage in PRD
4. ARCH-C1 / XD-9 — Fix TypeScript sandbox compile command
5. ARCH-C2 — Add OLE/ILE to verdict ENUM
6. ARCH-C3 / XD-10 — Add moderator role to DB schema
7. SEC-C1 / XD-1 — Fix `--fsize` to 1024
8. SEC-C2 — Add `--stack` flag to isolate config
9. SEC-C3 — Fix OAuth silent account linking
10. TEST-C1 — Fix `db.$migrate()` to valid Prisma API
11. TEST-C2 — Fix Monaco E2E input strategy

**Before Phase 1 milestone (HIGH):**
12. XD-4 — Reconcile leaderboard latency target
13. XD-5 — Reconcile peak submission rate
14. ARCH-H1 — Update language runtime versions
15. ARCH-H4 — Add S3 strategy for large test cases
16. ARCH-H5 — Add missing API endpoints (GDPR delete, health checks)
17. ARCH-H6 — Add read replicas to infrastructure plan
18. ARCH-H7 — Choose and document FTS strategy
19. SEC-H1 — Add io_uring to seccomp blocklist
20. TEST-H1 — Pin isolate version in CI
21. TEST-H2 — Extend load test to verify judge throughput
22. TEST-H3 — Add sandbox security regression tests
