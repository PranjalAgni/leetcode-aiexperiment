# Product Requirements Document — AlgoArena (LeetCode Clone)

**Version:** 1.0  
**Date:** 2026-05-04  
**Status:** Approved for Implementation

---

## 1. Overview

AlgoArena is a production-grade competitive programming and technical interview preparation platform. Users solve algorithmic problems in an in-browser code editor, submit solutions that are judged in a secure sandbox, participate in timed contests, and track their progress over time.

**Core value proposition:** The fastest, most reliable online judge with the cleanest UI and the best contest experience.

---

## 2. Goals & Success Metrics

| Goal | Metric | Target (6 months) |
|------|--------|-------------------|
| User adoption | Registered users | 50,000 |
| Engagement | Problems solved per user per week | 5+ |
| Reliability | Submission judge latency (p95) | < 5s |
| Uptime | Platform availability | 99.9% |
| Contest participation | Users per contest | 2,000+ |
| Retention | D30 retention | 40%+ |

---

## 3. User Personas

### 3.1 Job Seeker (Primary)
- Preparing for software engineering interviews at FAANG/top tech companies
- Needs: curated problem sets by company, difficulty tracking, progress heatmap
- Session length: 45–90 min focused practice

### 3.2 Competitive Programmer (Primary)
- Participates in weekly/biweekly contests to improve rating
- Needs: fast judge, real-time leaderboard, accurate rating system, editorial posts
- Session length: 90 min during contests, 30 min casual

### 3.3 Student (Secondary)
- Learning data structures and algorithms as part of coursework
- Needs: structured learning paths, clear problem explanations, hints
- Session length: 30–60 min

### 3.4 Problem Setter / Admin (Internal)
- Creates and manages problems, test cases, contests
- Needs: rich problem editor, test case management, contest scheduling

---

## 4. Feature Requirements

### 4.1 P0 — Must Have (MVP)

#### 4.1.1 Authentication
- **F-AUTH-001:** Email + password registration with email verification
- **F-AUTH-002:** OAuth2 login via Google and GitHub
- **F-AUTH-003:** JWT-based sessions (15-min access token + 30-day refresh token in HttpOnly cookie)
- **F-AUTH-004:** Password reset via email link
- **F-AUTH-005:** Account deletion (GDPR compliance)

#### 4.1.2 Problem Management
- **F-PROB-001:** Problem list page with pagination (default 50/page)
- **F-PROB-002:** Filter by: difficulty (Easy/Medium/Hard), status (Solved/Attempted/Todo), tags, search by title
- **F-PROB-003:** Problem detail page with: description, examples (input/output/explanation), constraints, hints (collapsed)
- **F-PROB-004:** Problem tags (Arrays, Dynamic Programming, Trees, Graphs, Strings, etc. — 30+ tags)
- **F-PROB-005:** Difficulty labels with color coding (Easy=green, Medium=yellow, Hard=red)
- **F-PROB-006:** Acceptance rate display
- **F-PROB-007:** Problem number and title slug for stable URLs (`/problems/two-sum`)

#### 4.1.3 Code Editor
- **F-EDIT-001:** Monaco Editor (same engine as VS Code) embedded in problem page
- **F-EDIT-002:** Language selector supporting: Python 3, JavaScript, TypeScript, Java, C++, Go, Rust
- **F-EDIT-003:** Syntax highlighting and basic IntelliSense per language
- **F-EDIT-004:** Default solution template per language per problem (function signature pre-filled)
- **F-EDIT-005:** Resizable editor/problem split panel (drag to resize)
- **F-EDIT-006:** Font size adjustment
- **F-EDIT-007:** Code persistence in localStorage between sessions per problem per language
- **F-EDIT-008:** Keyboard shortcuts: Run (Ctrl+Enter), Submit (Ctrl+Shift+Enter)

#### 4.1.4 Code Execution & Judging
- **F-JUDGE-001:** "Run Code" — execute against visible example test cases, return output in < 3s
- **F-JUDGE-002:** "Submit" — execute against all hidden test cases, return verdict
- **F-JUDGE-003:** Verdict types: Accepted, Wrong Answer, Time Limit Exceeded, Memory Limit Exceeded, Runtime Error, Compile Error
- **F-JUDGE-004:** Display: execution time (ms), memory used (MB), comparison to other users' stats
- **F-JUDGE-005:** For WA: show failing test case input, expected output, actual output
- **F-JUDGE-006:** For CE/RE: show error message with line number
- **F-JUDGE-007:** Rate limiting: max 30 submissions per problem per hour per user
- **F-JUDGE-008:** Per-problem time and memory limits configurable (default: 2s CPU / 256MB memory)

#### 4.1.5 User Profile
- **F-USER-001:** Public profile page at `/u/{username}`
- **F-USER-002:** Stats: total solved, solved by difficulty (Easy/Medium/Hard counts)
- **F-USER-003:** Submission calendar heatmap (GitHub-style, 365 days)
- **F-USER-004:** Recent accepted submissions list
- **F-USER-005:** Profile customization: display name, bio, location, company, GitHub URL, LinkedIn URL, website

#### 4.1.6 Submission History
- **F-SUB-001:** Per-problem submission history tab (most recent 20)
- **F-SUB-002:** Global submission history page at `/submissions`
- **F-SUB-003:** Click submission to view code, verdict, runtime, memory
- **F-SUB-004:** Filter submissions by status, language

#### 4.1.7 Admin Panel
- **F-ADMIN-001:** Create problem with rich Markdown editor for description
- **F-ADMIN-002:** Manage test cases (add/edit/delete input-output pairs, mark as sample vs hidden)
- **F-ADMIN-003:** Set per-language time and memory limits
- **F-ADMIN-004:** Set difficulty, tags, company tags
- **F-ADMIN-005:** Draft/Published/Deprecated problem states
- **F-ADMIN-006:** User management (ban, role assignment)

---

### 4.2 P1 — Important (Post-MVP Sprint 1)

#### 4.2.1 Contest System
- **F-CONTEST-001:** Contest listing page (upcoming, ongoing, past)
- **F-CONTEST-002:** 4-problem contests (Easy, Medium, Medium, Hard) with 90-minute duration
- **F-CONTEST-003:** Registration (before contest start) and immediate join (if already started, timer counts from join)
- **F-CONTEST-004:** Real-time leaderboard: ranked by problems solved, then by total penalty time
- **F-CONTEST-005:** Contest-specific submission tracking (separate from practice submissions)
- **F-CONTEST-006:** Post-contest: rating delta display, rank, percentile
- **F-CONTEST-007:** Rating system: Elo-based, initial rating 1500
  - Rating tiers: Unrated (<1200), Bronze (1200–1399), Silver (1400–1599), Gold (1600–1799), Platinum (1800–1999), Diamond (2000–2199), Master (2200–2499), Grandmaster (2500+)
- **F-CONTEST-008:** Contest archive with problem access after contest ends
- **F-CONTEST-009:** Virtual contest: replay any past contest as if live

#### 4.2.2 Discussion Forum
- **F-DISC-001:** Per-problem discussion tab
- **F-DISC-002:** Create post with Markdown support and code blocks
- **F-DISC-003:** Upvote/downvote posts
- **F-DISC-004:** Comment threads (2 levels deep)
- **F-DISC-005:** Sort by: Most Votes, Most Recent, Most Views
- **F-DISC-006:** Tag posts as: Question, Solution, Discussion

#### 4.2.3 Study Plans
- **F-STUDY-001:** Curated problem lists: "Top 75", "Top 150 Interview Questions", "Blind 75"
- **F-STUDY-002:** Progress tracking per study plan (X/75 completed)
- **F-STUDY-003:** Structured 30-day/60-day challenge plans with daily problem assignments

#### 4.2.4 Notifications
- **F-NOTIF-001:** Email notification for: contest reminders (1 hour before), submission result (optional toggle)
- **F-NOTIF-002:** In-app notification bell for: upvotes on posts, contest results posted

---

### 4.3 P2 — Nice to Have (Future Sprints)

- **F-P2-001:** Premium tier with gated problems and official editorials
- **F-P2-002:** Company-tagged problems filterable by company
- **F-P2-003:** Mock interview mode (random problem with timed session)
- **F-P2-004:** Code sharing (public links to specific submissions)
- **F-P2-005:** Friends system and friend leaderboard
- **F-P2-006:** Streak tracking with rewards (streak freeze items)
- **F-P2-007:** ICPC/team contests
- **F-P2-008:** Plagiarism detection for contest submissions
- **F-P2-009:** Interactive debugger
- **F-P2-010:** AI-powered hints (using Claude API)

---

## 5. Non-Functional Requirements

### 5.1 Performance
| Metric | Requirement |
|--------|-------------|
| Page load (LCP) | < 2.5s on 4G |
| API response (p50) | < 100ms |
| API response (p95) | < 500ms |
| Submission result (p50) | < 3s |
| Submission result (p95) | < 8s |
| Leaderboard refresh | Real-time (< 1s lag) |

### 5.2 Scalability
- Support 100,000 concurrent users during peak contests
- Handle 10,000 submissions per minute during contest bursts
- Problem catalog: up to 3,000 problems
- Test cases: up to 1,000 test cases per problem, up to 10MB total per problem

### 5.3 Availability
- Uptime SLA: 99.9% (< 8.7 hours downtime/year)
- Zero-downtime deployments via rolling updates
- Multi-AZ database with automatic failover
- Contest outages during active contests: incident P0, response < 5 min

### 5.4 Security
- All user code executes in isolated sandbox (no network, no host filesystem access)
- No user code can escape sandbox (cgroup + namespace + seccomp enforcement)
- HTTPS everywhere, HSTS enabled
- JWT RS256 signing, short-lived access tokens
- Rate limiting on all endpoints (auth: 10 req/min, submissions: 30/hour)
- SQL injection prevention via parameterized queries (ORM enforced)
- XSS prevention via Content Security Policy
- CSRF tokens for state-changing mutations
- Secrets in environment variables, never committed to repo
- Dependency scanning in CI (npm audit, govulncheck)

### 5.5 Observability
- Structured JSON logging (Pino) shipped to CloudWatch
- Distributed tracing with OpenTelemetry → Jaeger
- Metrics: Prometheus + Grafana dashboards
- Alerting: PagerDuty for P0/P1 incidents
- Error tracking: Sentry for frontend and backend services

### 5.6 Developer Experience
- Local dev with single command: `pnpm dev` starts all services
- Docker Compose for infrastructure (Postgres, Redis)
- E2E tests: Playwright
- Unit tests: Vitest (Node.js), Go test
- Test coverage minimum: 80% for critical paths (auth, submission, judge)
- CI/CD: GitHub Actions with PR checks (lint, test, build, security scan)

---

## 6. Out of Scope (V1)

- Mobile native apps (iOS/Android)
- Video courses or tutorials
- Live pair-coding interview tool
- Team contests (ICPC format)
- Proctored assessment mode
- LLM-powered code explanation
- Marketplace for user-created problem sets
- Payments / subscription billing infrastructure

---

## 7. Assumptions & Constraints

- **Assumption:** Users have modern browsers (Chrome 100+, Firefox 100+, Safari 15+)
- **Assumption:** Problems initially seeded from open-source problem databases + manually created
- **Constraint:** Code execution requires Linux (isolate uses Linux namespaces) — macOS dev uses Docker for judge service
- **Constraint:** Privileged containers required for judge service in Kubernetes
- **Constraint:** Budget for infrastructure: optimize for cost, use KEDA to scale judge to zero between contests

---

## 8. Milestones

| Milestone | Scope | Target |
|-----------|-------|--------|
| M1: MVP | Auth + Problems + Editor + Judge (5 languages) | Week 4 |
| M2: Contests | Contest system + Rating + Real-time leaderboard | Week 8 |
| M3: Community | Discussions + Study Plans + Notifications | Week 12 |
| M4: Polish | Performance optimization + Premium tier foundation | Week 16 |
