# Testing Strategy — AlgoArena

**Version:** 1.0  
**Date:** 2026-05-04

---

## 1. Testing Philosophy

- **Test behavior, not implementation** — tests should survive refactors
- **Critical paths at 80%+ coverage** — auth, submission flow, judge execution
- **Integration over unit for services** — test against real Postgres/Redis in CI
- **E2E for user journeys** — register, solve problem, submit, see result

---

## 2. Test Pyramid

```
          ┌───────────┐
          │    E2E    │  ~20 tests (Playwright, full user journeys)
          │   tests   │
         ─┴───────────┴─
        ┌───────────────┐
        │  Integration  │  ~200 tests (API routes + DB + Redis)
        │    tests      │
       ─┴───────────────┴─
      ┌───────────────────┐
      │    Unit tests     │  ~500 tests (business logic, utils, components)
      └───────────────────┘
```

---

## 3. Unit Tests

**Framework:** Vitest (Node.js services), Go test (judge service), Vitest + React Testing Library (Next.js)

### Node.js Services

```typescript
// Example: auth service token generation
describe('generateAccessToken', () => {
  it('includes userId, email, role in payload', () => {
    const token = generateAccessToken({ 
      userId: 'abc', email: 'test@test.com', role: 'user' 
    })
    const payload = verifyToken(token)
    expect(payload.sub).toBe('abc')
    expect(payload.role).toBe('user')
  })

  it('expires in 15 minutes', () => {
    const token = generateAccessToken({ userId: 'abc', email: 'x', role: 'user' })
    const payload = verifyToken(token)
    expect(payload.exp - payload.iat).toBe(900)
  })
})
```

### Go Judge Service

```go
// Example: output comparison
func TestExactMatch(t *testing.T) {
    result := CompareOutput("42\n", "42\n")
    assert.Equal(t, Accepted, result)
}

func TestTrailingNewlineIgnored(t *testing.T) {
    result := CompareOutput("42\n", "42")
    assert.Equal(t, Accepted, result)
}

func TestWrongAnswer(t *testing.T) {
    result := CompareOutput("42\n", "43\n")
    assert.Equal(t, WrongAnswer, result)
}
```

### Frontend Components

```typescript
// Example: ProblemCard component
describe('ProblemCard', () => {
  it('shows difficulty badge with correct color', () => {
    render(<ProblemCard problem={mockProblem({ difficulty: 'hard' })} />)
    const badge = screen.getByText('Hard')
    expect(badge).toHaveClass('text-red-500')
  })

  it('shows accepted checkmark for solved problems', () => {
    render(<ProblemCard problem={mockProblem({ status: 'solved' })} />)
    expect(screen.getByTestId('solved-icon')).toBeInTheDocument()
  })
})
```

---

## 4. Integration Tests

**Framework:** Vitest + real PostgreSQL + real Redis (via Docker in CI)

### API Route Tests

```typescript
// Example: POST /submissions integration test
describe('POST /api/v1/submissions', () => {
  let db: PrismaClient
  let redis: Redis
  
  beforeAll(async () => {
    db = new PrismaClient({ datasourceUrl: process.env.TEST_DATABASE_URL })
    redis = new Redis(process.env.TEST_REDIS_URL)
    await db.$migrate()
    await seedTestData(db)
  })

  afterAll(async () => {
    await db.$disconnect()
    await redis.quit()
  })

  it('returns 202 with submissionId for valid submission', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/submissions',
      headers: { authorization: `Bearer ${validToken}` },
      payload: {
        problemId: seedProblemId,
        language: 'python3',
        code: 'def twoSum(nums, target): return [0, 1]'
      }
    })
    expect(res.statusCode).toBe(202)
    expect(res.json().submissionId).toMatch(/^[0-9a-f-]{36}$/)
  })

  it('returns 429 when rate limit exceeded', async () => {
    // Submit 31 times — 31st should be rate limited
    for (let i = 0; i < 30; i++) {
      await submitCode(validToken, { ... })
    }
    const res = await submitCode(validToken, { ... })
    expect(res.statusCode).toBe(429)
  })

  it('returns 401 for unauthenticated request', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/submissions',
      payload: { ... }
    })
    expect(res.statusCode).toBe(401)
  })
})
```

### Judge Service Integration Tests

```go
// Test full execution cycle with real isolate (runs in CI Linux container)
func TestPythonExecution(t *testing.T) {
    if testing.Short() {
        t.Skip("Skipping judge integration test in short mode")
    }
    
    result := RunCode(RunRequest{
        Language: "python3",
        Code:     "print(int(input()) + int(input()))",
        Stdin:    "3\n4\n",
        TimeLimit: 2000,
        MemLimit:  262144,
    })
    
    assert.Equal(t, "7\n", result.Stdout)
    assert.Equal(t, Accepted, result.Verdict)
}

func TestTimeLimitExceeded(t *testing.T) {
    result := RunCode(RunRequest{
        Language:  "python3",
        Code:      "while True: pass",
        TimeLimit: 1000,
        MemLimit:  262144,
    })
    assert.Equal(t, TimeLimitExceeded, result.Verdict)
}

func TestMemoryLimitExceeded(t *testing.T) {
    result := RunCode(RunRequest{
        Language:  "python3",
        Code:      "x = [0] * 10**9",
        TimeLimit: 5000,
        MemLimit:  65536, // 64MB
    })
    assert.Equal(t, MemoryLimitExceeded, result.Verdict)
}
```

---

## 5. E2E Tests

**Framework:** Playwright

### Key User Journeys

```typescript
// tests/e2e/solve-problem.spec.ts
test('user can solve a problem end-to-end', async ({ page }) => {
  // Login
  await page.goto('/login')
  await page.fill('[name=email]', 'test@example.com')
  await page.fill('[name=password]', 'password123')
  await page.click('[type=submit]')
  await expect(page).toHaveURL('/problems')

  // Navigate to a problem
  await page.click('text=Two Sum')
  await expect(page).toHaveURL('/problems/two-sum')

  // Select language
  await page.selectOption('[data-testid=language-select]', 'python3')

  // Write code in Monaco editor
  await page.locator('.monaco-editor').click()
  await page.keyboard.type(`
def twoSum(self, nums, target):
    seen = {}
    for i, n in enumerate(nums):
        if target - n in seen:
            return [seen[target-n], i]
        seen[n] = i
  `)

  // Run code
  await page.click('[data-testid=run-button]')
  await expect(page.locator('[data-testid=run-result]')).toContainText('Accepted', { timeout: 15000 })

  // Submit
  await page.click('[data-testid=submit-button]')
  await expect(page.locator('[data-testid=verdict-badge]')).toContainText('Accepted', { timeout: 15000 })
  await expect(page.locator('[data-testid=runtime-display]')).toBeVisible()
})
```

```typescript
// tests/e2e/auth.spec.ts
test('user can register and login', async ({ page }) => {
  await page.goto('/register')
  await page.fill('[name=username]', 'newuser123')
  await page.fill('[name=email]', 'new@example.com')
  await page.fill('[name=password]', 'SecurePass123!')
  await page.click('[type=submit]')
  
  // Email verification (in test, auto-verify)
  await expect(page.locator('text=Verify your email')).toBeVisible()
})
```

```typescript
// tests/e2e/contest.spec.ts
test('user can participate in contest', async ({ page, context }) => {
  // Register for contest
  await page.goto('/contests/test-contest')
  await page.click('text=Register')
  
  // Contest starts (mocked in test env)
  await page.goto('/contests/test-contest')
  await expect(page.locator('[data-testid=contest-timer]')).toBeVisible()
  
  // Solve first problem
  await page.click('[data-testid=contest-problem-1]')
  // ... solve and submit ...
  
  // Check leaderboard
  await page.goto('/contests/test-contest/leaderboard')
  await expect(page.locator(`text=testuser`)).toBeVisible()
})
```

---

## 6. Test Environment

### CI Database Setup

```yaml
# .github/workflows/test.yml
services:
  postgres:
    image: postgres:16-alpine
    env:
      POSTGRES_PASSWORD: test
      POSTGRES_DB: algoarena_test
    options: >-
      --health-cmd pg_isready
      --health-interval 10s

  redis:
    image: redis:7-alpine
    options: >-
      --health-cmd "redis-cli ping"
```

### Judge Service CI

Judge integration tests only run on Linux (not macOS) because isolate requires Linux namespaces:

```yaml
judge-tests:
  runs-on: ubuntu-latest
  steps:
    - name: Install isolate
      run: |
        sudo apt-get install -y libcap-dev
        git clone https://github.com/ioi/isolate
        cd isolate && sudo make install
    - name: Run judge tests
      run: cd apps/judge-service && go test -v -run TestJudge ./...
```

---

## 7. Coverage Requirements

| Service | Minimum Coverage |
|---------|-----------------|
| auth-service | 85% |
| submission-service | 80% |
| judge-service | 80% |
| problem-service | 75% |
| user-service | 70% |
| contest-service | 75% |
| web (components) | 60% |

Coverage enforced in CI — builds fail below threshold.

```json
// vitest.config.ts
coverage: {
  thresholds: {
    lines: 80,
    functions: 80,
    branches: 75
  }
}
```

---

## 8. Load Testing

**Tool:** k6

```javascript
// load-tests/submission-burst.js — simulates contest start
import http from 'k6/http'
import { check, sleep } from 'k6'

export const options = {
  stages: [
    { duration: '30s', target: 100 },   // ramp up
    { duration: '2m', target: 1000 },   // contest burst
    { duration: '30s', target: 0 }       // ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],    // 95% of requests under 500ms
    http_req_failed: ['rate<0.01']       // < 1% error rate
  }
}

export default function () {
  const res = http.post('/api/v1/submissions', JSON.stringify({
    problemId: __ENV.PROBLEM_ID,
    language: 'python3',
    code: 'def solve(): return 42'
  }), { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${__ENV.TOKEN}` } })
  
  check(res, { 'status is 202': (r) => r.status === 202 })
  sleep(1)
}
```

Run before each major release against staging environment.
