import { Redis } from 'ioredis'
import { prisma } from '@algoarena/db'
import { logger } from '@algoarena/logger'
import type { SubmissionVerdict } from '@algoarena/shared-types'

interface JudgeResult {
  submissionId: string
  verdict: SubmissionVerdict
  runtimeMs: number | null
  memoryMb: number | null
  testCasesPassed: number
  totalTestCases: number
  errorMessage: string | null
  failingTestCase: {
    input: string
    expectedOutput: string
    actualOutput: string
  } | null
}

class JudgeResultWorker {
  private subscriber: Redis | null = null

  start() {
    const redis = new Redis(process.env['REDIS_URL'] ?? 'redis://localhost:6379')
    this.subscriber = redis

    redis.psubscribe('submission:result:*')
    redis.on('pmessage', async (_pattern: string, channel: string, message: string) => {
      const submissionId = channel.replace('submission:result:', '')
      if (submissionId.startsWith('run_')) return // Run results handled differently

      try {
        const result: JudgeResult = JSON.parse(message)
        await this.processResult(result)
      } catch (err) {
        logger.error({ err, submissionId }, 'Failed to process judge result')
      }
    })

    logger.info('Judge result worker started')
  }

  private async processResult(result: JudgeResult) {
    const { submissionId, verdict, runtimeMs, memoryMb, testCasesPassed, totalTestCases, errorMessage, failingTestCase } = result

    await prisma.submission.update({
      where: { id: submissionId },
      data: {
        verdict,
        runtimeMs,
        memoryMb,
        testCasesPassed,
        totalTestCases,
        errorMessage,
        failingTestCase: failingTestCase ? (failingTestCase as object) : undefined,
      },
    })

    if (verdict === 'accepted') {
      // Update problem acceptance stats
      await prisma.$transaction([
        prisma.problem.updateMany({
          where: {
            submissions: { some: { id: submissionId } },
          },
          data: {
            totalSubmissions: { increment: 1 },
            totalAccepted: { increment: 1 },
          },
        }),
      ])
    } else if (verdict !== 'pending' && verdict !== 'running') {
      await prisma.problem.updateMany({
        where: { submissions: { some: { id: submissionId } } },
        data: { totalSubmissions: { increment: 1 } },
      })
    }

    logger.info({ submissionId, verdict }, 'Submission result persisted')
  }

  stop() {
    this.subscriber?.quit().catch(() => {})
  }
}

export const judgeResultWorker = new JudgeResultWorker()
