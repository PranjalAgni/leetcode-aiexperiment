/**
 * Dev-only judge worker — runs code locally using child_process.
 * Replaces the Go+isolate judge in development so Run/Submit works without Docker.
 * Never use in production: no sandbox isolation.
 */
import { Worker } from 'bullmq'
import { Redis } from 'ioredis'
import { prisma } from '@algoarena/db'
import { logger } from '@algoarena/logger'
import { runCode } from './runner'
import { wrapCode } from './wrapper'
import type { JudgeMeta } from './wrapper'
import type { JudgeJobData } from '@algoarena/queue'
import { QUEUE_NAMES } from '@algoarena/queue'

function getConnection() {
  return new Redis(process.env['REDIS_URL'] ?? 'redis://localhost:6379', {
    maxRetriesPerRequest: null,
  })
}

function normalizeOutput(s: string) {
  return s.replace(/\r\n/g, '\n').trimEnd()
}

export function startDevJudge() {
  const worker = new Worker<JudgeJobData>(
    QUEUE_NAMES.JUDGE,
    async (job) => {
      const { submissionId, language, code, timeLimitMs, memoryLimitMb, problemId, isRun, customInput } = job.data
      logger.info({ submissionId, language }, '[dev-judge] processing job')

      // Fetch judge metadata from DB (same data that generated the starter code)
      const problemRecord = await prisma.problem.findUnique({
        where: { id: problemId },
        select: { judgeMetadata: true },
      })
      const judgeMeta = problemRecord?.judgeMetadata as JudgeMeta | null
      const execCode = judgeMeta?.functionName ? wrapCode(language, code, judgeMeta) : code

      // Fetch test cases from DB
      let testCases: Array<{ input: string; expectedOutput: string }> = []

      if (isRun) {
        if (customInput !== undefined && customInput !== null) {
          testCases = [{ input: customInput, expectedOutput: '' }]
        } else {
          const p = await prisma.problem.findUnique({
            where: { id: problemId },
            include: { testCases: { where: { isSample: true }, orderBy: { orderIndex: 'asc' }, take: 3 } },
          })
          testCases = (p?.testCases ?? []).map((tc) => ({
            input: tc.input,
            expectedOutput: tc.expectedOutput,
          }))
        }
      } else {
        const p = await prisma.problem.findUnique({
          where: { id: problemId },
          include: { testCases: { orderBy: { orderIndex: 'asc' } } },
        })
        testCases = (p?.testCases ?? []).map((tc) => ({
          input: tc.input,
          expectedOutput: tc.expectedOutput,
        }))
      }

      if (testCases.length === 0) {
        await publishResult(submissionId, {
          verdict: 'system_error',
          errorMessage: 'No test cases found for this problem',
          runtimeMs: 0, memoryMb: 0, testCasesPassed: 0,
          totalTestCases: 0, failingTestCase: null,
        })
        return
      }

      let testCasesPassed = 0
      let maxRuntimeMs = 0
      let verdict: string = 'accepted'
      let errorMessage: string | null = null
      let failingTestCase: { input: string; expectedOutput: string; actualOutput: string } | null = null

      for (const tc of testCases) {
        const result = await runCode({ language, code: execCode, stdin: tc.input, timeLimitMs })
        maxRuntimeMs = Math.max(maxRuntimeMs, result.runtimeMs)

        if (result.timedOut) {
          verdict = 'time_limit_exceeded'
          failingTestCase = { input: tc.input, expectedOutput: tc.expectedOutput, actualOutput: '' }
          break
        }

        if (result.exitCode !== 0) {
          // Distinguish compile error (caught in runner, exitCode=1, no stdout) vs runtime error
          verdict = result.stderr.includes('error:') || result.stderr.includes('SyntaxError')
            ? 'compile_error'
            : 'runtime_error'
          errorMessage = result.stderr.slice(0, 2000)
          failingTestCase = { input: tc.input, expectedOutput: tc.expectedOutput, actualOutput: result.stdout }
          break
        }

        // In run mode with custom input there's no expected output — just show the output
        if (isRun && tc.expectedOutput === '') {
          testCasesPassed++
          verdict = 'accepted'
          // We'll surface stdout as the "result"
          failingTestCase = { input: tc.input, expectedOutput: '(custom input)', actualOutput: result.stdout }
          continue
        }

        if (normalizeOutput(result.stdout) === normalizeOutput(tc.expectedOutput)) {
          testCasesPassed++
        } else {
          verdict = 'wrong_answer'
          failingTestCase = {
            input: tc.input,
            expectedOutput: tc.expectedOutput,
            actualOutput: result.stdout,
          }
          break
        }
      }

      const payload = {
        verdict,
        runtimeMs: maxRuntimeMs,
        memoryMb: Math.floor(Math.random() * 30) + 10, // dev: fake memory (no sandbox)
        testCasesPassed,
        totalTestCases: testCases.length,
        errorMessage,
        failingTestCase,
      }

      // Update DB for real submissions (not run_ jobs)
      if (!isRun && !submissionId.startsWith('run_')) {
        await prisma.submission.update({
          where: { id: submissionId },
          data: {
            verdict: verdict as never,
            runtimeMs: payload.runtimeMs,
            memoryMb: payload.memoryMb,
            testCasesPassed,
            totalTestCases: testCases.length,
            errorMessage,
            failingTestCase: failingTestCase ?? undefined,
          },
        })
      }

      await publishResult(submissionId, payload)
      logger.info({ submissionId, verdict, runtimeMs: maxRuntimeMs }, '[dev-judge] done')
    },
    {
      connection: getConnection(),
      concurrency: 4,
    }
  )

  worker.on('failed', (job, err) => {
    logger.error({ jobId: job?.id, err }, '[dev-judge] job failed')
  })

  logger.info('[dev-judge] worker started (dev mode — no sandbox isolation)')
  return worker
}

async function publishResult(submissionId: string, payload: Record<string, unknown>) {
  const redis = new Redis(process.env['REDIS_URL'] ?? 'redis://localhost:6379')
  await redis.publish(`submission:result:${submissionId}`, JSON.stringify({ submissionId, ...payload }))
  await redis.quit()
}
