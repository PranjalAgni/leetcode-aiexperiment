# System Architecture — AlgoArena

**Version:** 1.0  
**Date:** 2026-05-04

---

## 1. Architecture Overview

AlgoArena is a microservices-based platform hosted on AWS EKS. Services communicate synchronously via gRPC for internal calls and via REST for external (client-facing) calls. Asynchronous work (code execution) flows through BullMQ on Redis.

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CloudFront CDN                              │
│                    (static assets, Next.js ISR)                     │
└──────────────────────────────┬──────────────────────────────────────┘
                               │ HTTPS
┌──────────────────────────────▼──────────────────────────────────────┐
│                    Next.js 14 (App Router)                          │
│              Server Components + Client Components                  │
│                   Deployed on AWS EKS                               │
└──────────────────────────────┬──────────────────────────────────────┘
                               │ HTTPS (REST + SSE)
┌──────────────────────────────▼──────────────────────────────────────┐
│                     API Gateway (Fastify)                           │
│  • JWT verification (RS256)      • Rate limiting (Redis)            │
│  • Request routing               • CORS                             │
│  • WebSocket proxy               • OpenAPI docs                     │
└────┬───────┬──────┬──────┬──────┬──────┬──────────────────────────┘
     │ gRPC  │      │      │      │      │
     ▼       ▼      ▼      ▼      ▼      ▼
  Auth    User   Problem  Sub  Contest  Notif
  Svc     Svc    Svc      Svc   Svc     Svc
     │                    │
     │              BullMQ Queue
     │              (Redis)
     │                    │
     │            ┌───────▼────────┐
     │            │  Judge Service │
     │            │    (Go)        │
     │            │  isolate       │
     │            └────────────────┘
     │
  PostgreSQL 16       Redis 7
  (Primary DB)        (Cache/Queue/Leaderboard)
```

---

## 2. Service Inventory

| Service | Language | Port | Responsibility |
|---------|----------|------|----------------|
| web | Next.js (TypeScript) | 3000 | Frontend — SSR/SSG/CSR |
| api-gateway | Node.js + Fastify | 4000 | Routing, auth middleware, rate limiting |
| auth-service | Node.js + Fastify | 4001 | OAuth2, JWT issuance, token refresh |
| user-service | Node.js + Fastify | 4002 | Profiles, rankings, heatmap data |
| problem-service | Node.js + Fastify | 4003 | Problem CRUD, test cases, editorial |
| submission-service | Node.js + Fastify | 4004 | Accept submissions, enqueue, status |
| judge-service | Go | 4005 | Execute code, compare output, return verdict |
| contest-service | Node.js + Fastify | 4006 | Contest lifecycle, leaderboard |
| notification-service | Node.js + Fastify | 4007 | Email, in-app notifications, SSE hub |

---

## 3. Data Flow: Code Submission

```
Client                  API GW          Sub Svc         Redis        Judge Svc
  │                       │               │               │              │
  │─── POST /submit ──────▶               │               │              │
  │    { code, lang,      │               │               │              │
  │      problemId }      │               │               │              │
  │                       │─── gRPC ──────▶               │              │
  │                       │  SubmitCode() │               │              │
  │                       │               │               │              │
  │                       │               │─── BullMQ ────▶              │
  │                       │               │  Add job       │              │
  │                       │               │               │              │
  │◀── 202 { subId } ─────│               │               │              │
  │                       │               │               │◀── Poll ─────│
  │─── GET /sub/{id}/     │               │               │  job         │
  │    events (SSE) ──────▶               │               │              │
  │                       │               │               │──── job ─────▶
  │                       │               │               │              │
  │                       │               │               │  Execute in  │
  │                       │               │               │  isolate     │
  │                       │               │               │              │
  │                       │               │               │◀── result ───│
  │                       │               │               │              │
  │                       │               │◀── PubSub ────│              │
  │                       │               │  result event │              │
  │                       │               │               │              │
  │◀── SSE event ─────────│               │               │              │
  │  { verdict, time, mem }│              │               │              │
```

---

## 4. Database Schema (Core Tables)

### PostgreSQL

```sql
-- Users
users (id UUID PK, email VARCHAR UNIQUE, username VARCHAR UNIQUE, 
       password_hash VARCHAR, role ENUM('user','admin'), 
       display_name, bio, location, company, github_url, 
       website, rating INT DEFAULT 1500,
       created_at, updated_at, deleted_at)

-- Problems
problems (id UUID PK, number INT UNIQUE, title VARCHAR, slug VARCHAR UNIQUE,
          difficulty ENUM('easy','medium','hard'), description TEXT,
          constraints TEXT, hints JSONB, status ENUM('draft','published','deprecated'),
          acceptance_rate DECIMAL, total_submissions INT, total_accepted INT,
          time_limit_ms INT DEFAULT 2000, memory_limit_mb INT DEFAULT 256,
          created_by UUID FK, created_at, updated_at)

problem_tags (problem_id UUID FK, tag_id UUID FK)
tags (id UUID PK, name VARCHAR UNIQUE, slug VARCHAR UNIQUE)

-- Test Cases
test_cases (id UUID PK, problem_id UUID FK, input TEXT, expected_output TEXT,
            is_sample BOOL, order_index INT, created_at)

-- Per-language limits override
problem_language_limits (problem_id UUID FK, language VARCHAR,
                         time_limit_ms INT, memory_limit_mb INT)

-- Submissions
submissions (id UUID PK, user_id UUID FK, problem_id UUID FK,
             contest_id UUID FK NULLABLE,
             language VARCHAR, code TEXT,
             verdict ENUM('pending','accepted','wrong_answer','tle','mle','re','ce'),
             runtime_ms INT, memory_mb INT,
             test_cases_passed INT, total_test_cases INT,
             error_message TEXT, created_at)

-- Contests
contests (id UUID PK, title VARCHAR, slug VARCHAR UNIQUE,
          starts_at TIMESTAMPTZ, ends_at TIMESTAMPTZ,
          status ENUM('upcoming','ongoing','ended'),
          description TEXT, created_by UUID FK, created_at)

contest_problems (contest_id UUID FK, problem_id UUID FK, order_index INT)

contest_participants (contest_id UUID FK, user_id UUID FK, 
                      registered_at TIMESTAMPTZ, rating_before INT, rating_after INT)

-- Discussion
posts (id UUID PK, problem_id UUID FK, user_id UUID FK,
       title VARCHAR, body TEXT, post_type ENUM('question','solution','discussion'),
       upvotes INT DEFAULT 0, views INT DEFAULT 0,
       created_at, updated_at)

comments (id UUID PK, post_id UUID FK, parent_id UUID FK NULLABLE,
          user_id UUID FK, body TEXT, upvotes INT DEFAULT 0,
          created_at, updated_at)

-- Study Plans
study_plans (id UUID PK, title VARCHAR, description TEXT, 
             difficulty_level VARCHAR, duration_days INT, created_at)

study_plan_problems (plan_id UUID FK, problem_id UUID FK, day_number INT, order_index INT)

user_study_progress (user_id UUID FK, plan_id UUID FK, 
                     problem_id UUID FK, completed_at TIMESTAMPTZ)
```

### Redis Key Patterns

```
# Sessions
session:{userId}:{tokenJti}        → token metadata (TTL: 30d)
refresh_blocklist:{jti}            → revoked tokens (TTL: 30d)

# Rate limiting
ratelimit:auth:{ip}                → request count (TTL: 1m, window)
ratelimit:submit:{userId}          → submission count (TTL: 1h)

# Caching
cache:problem:{slug}               → serialized problem JSON (TTL: 5m)
cache:problem_list:{filters_hash}  → paginated problem list (TTL: 2m)
cache:user:{userId}:profile        → user profile JSON (TTL: 5m)

# Leaderboard (contest real-time)
leaderboard:{contestId}            → Redis Sorted Set (score: penalty, member: userId)
leaderboard:{contestId}:{userId}   → per-user solve times Hash

# BullMQ
bull:submissions:wait              → job queue list
bull:submissions:active            → in-progress jobs
bull:submissions:completed         → completed jobs (TTL auto-cleanup)
bull:submissions:failed            → failed jobs (for retry/alerting)

# Submission result pub/sub
submission:result:{submissionId}   → result payload (TTL: 60s, read once by SSE handler)
```

---

## 5. Judge Service Architecture (Go)

```
judge-service/
├── main.go
├── worker/
│   ├── pool.go          # Worker pool — goroutines consuming BullMQ jobs
│   └── processor.go     # Single job processor
├── sandbox/
│   ├── isolate.go       # isolate CLI wrapper
│   ├── runner.go        # Compile + execute per language
│   └── limits.go        # Resource limit configurations
├── judge/
│   ├── comparator.go    # Output comparison (exact match + special judge)
│   └── verdicts.go      # Verdict enum and mapping
├── languages/
│   └── registry.go      # Language → compiler/interpreter commands
└── config/
    └── config.go        # ENV-based config
```

**Worker pool sizing:** `GOMAXPROCS * 2` workers per judge pod. Each worker processes one submission at a time (isolate is synchronous). Judge pods scale via KEDA based on queue depth.

**Execution flow per submission:**
1. Pull job from BullMQ via `go-redis`
2. Create temp directory under `/tmp/judge/{submissionId}/`
3. Write source file (e.g., `solution.py`)
4. If compiled language: invoke compiler, check for compile error
5. For each test case (in parallel up to N=4 goroutines):
   - Invoke `isolate --run --stdin=input.txt --stdout=output.txt ...`
   - Parse exit code and meta file for resource usage
   - Compare stdout to expected output
6. Aggregate results: first failing test case determines verdict
7. Publish result to Redis pub/sub channel `submission:result:{id}`
8. Update submission record in PostgreSQL

**Language support matrix:**

| Language | Compile Command | Run Command | Typical Limit |
|----------|----------------|-------------|---------------|
| C++17 | `g++ -O2 -std=c++17 -o sol sol.cpp` | `./sol` | 2s / 256MB |
| Python 3 | (none) | `python3 solution.py` | 5s / 256MB |
| Java 21 | `javac Solution.java` | `java -Xmx256m Solution` | 4s / 256MB |
| JavaScript | (none) | `node solution.js` | 5s / 256MB |
| TypeScript | `npx tsc --outDir /out` | `node /out/solution.js` | 6s / 256MB |
| Go | `go build -o sol .` | `./sol` | 3s / 256MB |
| Rust | `rustc -O -o sol sol.rs` | `./sol` | 5s / 256MB |
| C# | `dotnet build -o /out` | `dotnet /out/sol.dll` | 6s / 256MB |
| Kotlin | `kotlinc Solution.kt -include-runtime -d sol.jar` | `java -jar sol.jar` | 8s / 256MB |
| Ruby | (none) | `ruby solution.rb` | 8s / 256MB |

---

## 6. API Gateway Routes

All routes prefixed with `/api/v1`

```
# Auth
POST   /auth/register
POST   /auth/login
POST   /auth/logout
POST   /auth/refresh
GET    /auth/oauth/google
GET    /auth/oauth/github
POST   /auth/forgot-password
POST   /auth/reset-password

# Users
GET    /users/:username                    # Public profile
GET    /users/me                           # Authenticated user
PATCH  /users/me                           # Update profile
GET    /users/me/submissions               # Submission history
GET    /users/me/heatmap                   # Calendar data
GET    /users/rankings                     # Global rankings

# Problems
GET    /problems                           # List + filter
GET    /problems/:slug                     # Problem detail
GET    /problems/:slug/submissions         # User's submissions for problem

# Submissions
POST   /submissions                        # Submit code
POST   /submissions/run                    # Run (no persist)
GET    /submissions/:id                    # Get submission
GET    /submissions/:id/events             # SSE stream for result

# Contests
GET    /contests                           # List contests
GET    /contests/:slug                     # Contest detail
POST   /contests/:slug/register            # Register
GET    /contests/:slug/leaderboard         # Real-time leaderboard
GET    /contests/:slug/problems            # Contest problems

# Discussion
GET    /problems/:slug/posts               # List posts
POST   /problems/:slug/posts               # Create post
GET    /posts/:postId                      # Get post with comments
POST   /posts/:postId/comments             # Add comment
POST   /posts/:postId/vote                 # Upvote/downvote

# Study Plans
GET    /study-plans                        # List plans
GET    /study-plans/:slug                  # Plan detail + progress
POST   /study-plans/:slug/enroll           # Enroll
PATCH  /study-plans/:slug/progress         # Update progress

# Admin (role: admin)
POST   /admin/problems                     # Create problem
PATCH  /admin/problems/:id                 # Update problem
POST   /admin/problems/:id/test-cases      # Add test cases
POST   /admin/contests                     # Create contest
GET    /admin/users                        # User management
```

---

## 7. Frontend Architecture (Next.js 14)

```
apps/web/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (main)/
│   │   ├── layout.tsx           # Main nav + sidebar
│   │   ├── page.tsx             # Landing/dashboard
│   │   ├── problems/
│   │   │   ├── page.tsx         # Problem list (SSR, filtered)
│   │   │   └── [slug]/
│   │   │       └── page.tsx     # Problem detail + editor (Client Component)
│   │   ├── submissions/
│   │   │   └── page.tsx
│   │   ├── contests/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/
│   │   │       └── page.tsx
│   │   ├── u/
│   │   │   └── [username]/
│   │   │       └── page.tsx     # User profile (SSR)
│   │   └── study-plans/
│   │       └── page.tsx
│   ├── admin/
│   │   ├── layout.tsx           # Admin auth guard
│   │   ├── problems/page.tsx
│   │   └── contests/page.tsx
│   └── api/
│       └── auth/[...nextauth]/  # Auth.js handler
├── components/
│   ├── editor/
│   │   ├── CodeEditor.tsx       # Monaco wrapper
│   │   ├── LanguageSelector.tsx
│   │   └── SubmitPanel.tsx      # Run/Submit buttons + results
│   ├── problems/
│   │   ├── ProblemList.tsx
│   │   ├── ProblemCard.tsx
│   │   └── ProblemFilter.tsx
│   ├── contest/
│   │   ├── Leaderboard.tsx      # Real-time via SSE
│   │   └── ContestTimer.tsx
│   └── profile/
│       ├── Heatmap.tsx
│       └── StatsCard.tsx
├── lib/
│   ├── api.ts                   # API client (fetch wrapper)
│   ├── auth.ts                  # Auth.js config
│   └── sse.ts                   # SSE hook for submission results
└── middleware.ts                 # Route protection
```

**Rendering strategy:**
- Problem list: SSR (filter params from URL search params)
- Problem detail: SSR for metadata, Client Component for editor
- User profile: SSR (cacheable, ISR with 60s revalidation)
- Contest leaderboard: Client Component (SSE for live updates)
- Admin panel: Client Components (dynamic, not cacheable)

---

## 8. Turborepo Monorepo Structure

```
algoarena/
├── apps/
│   ├── web/                     # Next.js 14
│   ├── api-gateway/             # Fastify
│   ├── auth-service/            # Fastify
│   ├── user-service/            # Fastify
│   ├── problem-service/         # Fastify
│   ├── submission-service/      # Fastify
│   ├── judge-service/           # Go
│   ├── contest-service/         # Fastify
│   └── notification-service/    # Fastify
├── packages/
│   ├── shared-types/            # TypeScript interfaces
│   ├── proto/                   # .proto files + generated stubs
│   ├── ui/                      # Shared React components (shadcn/ui base)
│   ├── db/                      # Prisma schema + client
│   ├── queue/                   # BullMQ queue definitions + job types
│   ├── logger/                  # Pino logger wrapper
│   └── config/
│       ├── eslint/
│       ├── tsconfig/
│       └── tailwind/
├── infra/
│   ├── docker/                  # Per-service Dockerfiles
│   ├── k8s/                     # Kubernetes manifests
│   └── terraform/               # AWS EKS + RDS + ElastiCache
├── docs/                        # All documentation
├── docker-compose.yml           # Local dev infra
├── docker-compose.judge.yml     # Judge service local dev
├── turbo.json
├── package.json                 # Root workspace
└── pnpm-workspace.yaml
```

---

## 9. Security Architecture

### Code Execution Isolation

```
┌──────────────────────────────────────────┐
│ Kubernetes Pod (judge-service)            │
│  ┌────────────────────────────────────┐  │
│  │ Go worker process                  │  │
│  │  ┌──────────────────────────────┐  │  │
│  │  │ isolate sandbox (per run)    │  │  │
│  │  │  • PID namespace (max 1 PID) │  │  │
│  │  │  • Network namespace (none)  │  │  │
│  │  │  • Mount namespace (read-only│  │  │
│  │  │    rootfs + tmpfs for /tmp)  │  │  │
│  │  │  • cgroup v2 limits          │  │  │
│  │  │    (CPU, memory, pids)       │  │  │
│  │  │  • seccomp-bpf allowlist     │  │  │
│  │  │  • no capabilities           │  │  │
│  │  │  • User code runs here       │  │  │
│  │  └──────────────────────────────┘  │  │
│  └────────────────────────────────────┘  │
│  Node taint: role=judge:NoSchedule       │
│  Dedicated EC2 c5.2xlarge node pool      │
└──────────────────────────────────────────┘
```

### Auth Security

- **RS256 JWT**: Auth Service holds private key, all services verify with public key
- **Token rotation**: Refresh token rotates on every use (prevents token reuse)
- **Token revocation**: Blocklist in Redis for logged-out users (checked only on access token validation failure)
- **PKCE** for OAuth2 flows via Auth.js
- **HttpOnly + Secure + SameSite=Strict** cookies for refresh tokens

### API Security

- **Rate limiting**: Redis token bucket — auth endpoints (10 req/min/IP), submissions (30/hr/user)
- **Input validation**: Zod schemas on all API request bodies
- **SQL injection**: Prisma parameterized queries (no raw SQL in application code)
- **XSS**: CSP header blocking inline scripts, Monaco sanitizes output display
- **CORS**: Explicit allowlist of origins
- **Helmet.js** on all Fastify services

---

## 10. Infrastructure & Deployment

### AWS Services Used

| Service | Purpose |
|---------|---------|
| EKS | Container orchestration |
| RDS PostgreSQL 16 | Primary database (Multi-AZ) |
| ElastiCache Redis 7 | Cache + queue + leaderboard |
| S3 | Test case files, static assets |
| CloudFront | CDN for Next.js ISR + static assets |
| SES | Transactional email |
| ECR | Container registry |
| ALB | Load balancer in front of EKS |
| Route53 | DNS |
| ACM | TLS certificates |
| CloudWatch | Logs + metrics |
| Secrets Manager | Credentials and secrets |

### Kubernetes Namespaces

```
platform-prod:         API services (api-gateway, auth, user, problem, submission, contest, notification)
judge-prod:            Judge service (isolated node pool, tainted)
monitoring:            Prometheus, Grafana, Jaeger
infra:                 PgBouncer, Redis (if not ElastiCache)
```

### CI/CD Pipeline (GitHub Actions)

```
PR:
  lint → test → build → security-scan → docker-build (no push)

main merge:
  lint → test → build → docker-build → push to ECR → deploy to staging → smoke-test → deploy to prod (rolling update)

On tag (vX.Y.Z):
  Full pipeline + integration tests + prod deploy
```

---

## 11. Observability Stack

- **Structured logging**: Pino (JSON) → CloudWatch Logs Insights
- **Metrics**: Prometheus scraping all services → Grafana dashboards
  - Key dashboards: submission throughput, judge latency p50/p95/p99, queue depth, error rates
- **Distributed tracing**: OpenTelemetry SDK in all services → Jaeger
- **Error tracking**: Sentry (frontend + backend)
- **Uptime monitoring**: AWS Route53 health checks + external pinger
- **Alerting**: PagerDuty integration via Grafana alerts
  - P0: judge queue > 500 depth for > 2 min, error rate > 5%, p95 latency > 10s
  - P1: disk usage > 80%, memory > 85%
