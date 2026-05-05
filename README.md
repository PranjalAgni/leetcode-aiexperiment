# AlgoArena — Production-Grade LeetCode Clone

A full-stack competitive programming platform built with a Turborepo monorepo, Next.js frontend, Node.js/Go microservices, and a secure code execution engine.

## Architecture

```
apps/
├── web/                    # Next.js 14 (App Router) — SSR + client components
├── api-gateway/            # Fastify — routing, JWT auth, rate limiting
├── auth-service/           # Fastify — email/password + OAuth2 (Google, GitHub)
├── user-service/           # Fastify — profiles, rankings, study plans
├── problem-service/        # Fastify — problem CRUD, test cases
├── submission-service/     # Fastify — submit code, SSE result streaming
├── judge-service/          # Go — isolate sandbox, code execution
├── contest-service/        # Fastify — contests, real-time leaderboard
└── notification-service/   # Fastify — email via nodemailer

packages/
├── shared-types/           # TypeScript interfaces shared across all services
├── db/                     # Prisma schema + client
├── queue/                  # BullMQ queue definitions
├── ui/                     # Shared React components
└── logger/                 # Pino structured logging
```

## Prerequisites

- Node.js 20+
- pnpm 9+
- Docker + Docker Compose (for Postgres, Redis, Judge service)
- Go 1.23+ (only needed if developing judge service natively)

## Quick Start

```bash
# 1. Copy environment config
cp .env.example .env
# Edit .env — generate JWT keys and set OAuth credentials

# 2. Start infrastructure (Postgres, Redis, Judge service)
docker compose up -d

# 3. Install dependencies
pnpm install

# 4. Set up database
pnpm db:generate
pnpm --filter @algoarena/db db:migrate:dev
pnpm --filter @algoarena/db db:seed

# 5. Start all services
pnpm dev
```

Services will start on:
| Service | URL |
|---------|-----|
| Web (Next.js) | http://localhost:3000 |
| API Gateway | http://localhost:4000 |
| Auth Service | http://localhost:4001 |
| User Service | http://localhost:4002 |
| Problem Service | http://localhost:4003 |
| Submission Service | http://localhost:4004 |
| Contest Service | http://localhost:4006 |
| Notification Service | http://localhost:4007 |
| Bull Board (queue) | http://localhost:9001 |

## Generating JWT Keys

```bash
node -e "
const {generateKeyPairSync} = require('crypto');
const {privateKey, publicKey} = generateKeyPairSync('rsa', {modulusLength: 2048});
console.log('JWT_PRIVATE_KEY=' + JSON.stringify(privateKey.export({type:'pkcs8',format:'pem'})));
console.log('JWT_PUBLIC_KEY=' + JSON.stringify(publicKey.export({type:'spki',format:'pem'})));
"
```

## Key Technical Decisions

| Concern | Choice | Reason |
|---------|--------|--------|
| Code sandbox | isolate (IOI sandbox) | Linux namespaces + cgroup, gold standard for competitive programming |
| Judge language | Go | Goroutines for parallel test case execution, low overhead |
| Message queue | BullMQ (Redis) | Job priorities, retries, dashboard — no extra infra beyond Redis |
| Database | PostgreSQL + Prisma | Single source of truth, JSONB for flexible metadata |
| Real-time results | Server-Sent Events | One-directional (server→client), works with standard proxies |
| Internal auth | RS256 JWT | Stateless verification — no Redis hit per request |
| Monorepo | Turborepo | Remote caching, parallel builds, workspace protocol |

## Documentation

- [Product Requirements (PRD)](docs/PRD.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Security](docs/SECURITY.md)
- [Testing Strategy](docs/TESTING.md)

## Development

```bash
pnpm dev          # Start all services
pnpm build        # Build all services
pnpm test         # Run all tests
pnpm lint         # Lint all packages
```

## Judge Service (macOS)

The judge service requires Linux namespaces (isolate) and **must run in Docker** on macOS:

```bash
docker compose up judge-service
```

For judge service development, use a Linux VM (Lima/Colima) or test in the container.

## Default Credentials (seed data)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@algoarena.dev | Admin123! |
| User | user@algoarena.dev | User123! |

## Production Deployment

See [infra/k8s/](infra/k8s/) for Kubernetes manifests. Key points:
- Judge service runs on dedicated tainted node pool (`role=judge:NoSchedule`)
- KEDA autoscales judge pods based on BullMQ queue depth (0→50 pods)
- RDS PostgreSQL Multi-AZ for HA
- ElastiCache Redis cluster for leaderboards during contests
