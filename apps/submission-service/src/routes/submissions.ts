import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '@algoarena/db'
import { getJudgeQueue } from '@algoarena/queue'
import { logger } from '@algoarena/logger'
import { LANGUAGES } from '@algoarena/shared-types'
import type { Language } from '@algoarena/shared-types'
import { Redis } from 'ioredis'

const SubmitSchema = z.object({
  problemId: z.string().uuid(),
  language: z.enum([...LANGUAGES] as [Language, ...Language[]]),
  code: z.string().min(1).max(65536),
  contestId: z.string().uuid().optional(),
})

const RunSchema = z.object({
  problemId: z.string().uuid(),
  language: z.enum([...LANGUAGES] as [Language, ...Language[]]),
  code: z.string().min(1).max(65536),
  customInput: z.string().max(65536).optional(),
})

let redis: Redis | null = null
function getRedis() {
  if (!redis) redis = new Redis(process.env['REDIS_URL'] ?? 'redis://localhost:6379')
  return redis
}

export async function submissionRoutes(fastify: FastifyInstance) {
  fastify.post(
    '/',
    {
      config: { rateLimit: { max: 30, timeWindow: '1 hour', keyGenerator: (req: { headers: Record<string, unknown> }) => req.headers['x-user-id'] as string } },
    },
    async (request, reply) => {
      const userId = request.headers['x-user-id'] as string
      if (!userId) return reply.status(401).send({ error: 'UNAUTHORIZED' })

      const body = SubmitSchema.safeParse(request.body)
      if (!body.success) {
        return reply.status(400).send({ error: 'VALIDATION_ERROR', details: body.error.flatten() })
      }

      const { problemId, language, code, contestId } = body.data

      // Verify problem exists and is published
      const problem = await prisma.problem.findUnique({
        where: { id: problemId, status: 'published' },
        select: { id: true, timeLimitMs: true, memoryLimitMb: true, languageLimits: true },
      })
      if (!problem) return reply.status(404).send({ error: 'PROBLEM_NOT_FOUND' })

      // Get language-specific limits
      const langLimit = problem.languageLimits.find((l) => l.language === language)
      const timeLimitMs = langLimit?.timeLimitMs ?? problem.timeLimitMs
      const memoryLimitMb = langLimit?.memoryLimitMb ?? problem.memoryLimitMb

      const submission = await prisma.submission.create({
        data: {
          userId,
          problemId,
          contestId: contestId ?? null,
          language,
          code,
          verdict: 'pending',
        },
      })

      const queue = getJudgeQueue()
      await queue.add(
        'judge',
        {
          submissionId: submission.id,
          userId,
          problemId,
          contestId: contestId ?? null,
          language,
          code,
          timeLimitMs,
          memoryLimitMb,
        },
        {
          priority: contestId ? 1 : 2, // Contest submissions get higher priority
          jobId: submission.id,
        }
      )

      logger.info({ submissionId: submission.id, userId, language }, 'Submission queued')
      return reply.status(202).send({ submissionId: submission.id })
    }
  )

  fastify.post('/run', async (request, reply) => {
    const userId = request.headers['x-user-id'] as string
    if (!userId) return reply.status(401).send({ error: 'UNAUTHORIZED' })

    const body = RunSchema.safeParse(request.body)
    if (!body.success) {
      return reply.status(400).send({ error: 'VALIDATION_ERROR' })
    }

    const { problemId, language, code, customInput } = body.data

    const problem = await prisma.problem.findUnique({
      where: { id: problemId, status: 'published' },
      select: {
        id: true,
        timeLimitMs: true,
        memoryLimitMb: true,
        testCases: {
          where: { isSample: true },
          orderBy: { orderIndex: 'asc' },
          take: 3,
        },
      },
    })
    if (!problem) return reply.status(404).send({ error: 'PROBLEM_NOT_FOUND' })

    // For run, we use a ephemeral submission ID and don't persist
    const runId = `run_${Date.now()}_${userId}`

    const queue = getJudgeQueue()
    await queue.add(
      'run',
      {
        submissionId: runId,
        userId,
        problemId,
        contestId: null,
        language,
        code,
        timeLimitMs: problem.timeLimitMs,
        memoryLimitMb: problem.memoryLimitMb,
        isRun: true,
        customInput,
      },
      { priority: 3, jobId: runId }
    )

    return reply.status(202).send({ runId })
  })

  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const userId = request.headers['x-user-id'] as string

    const submission = await prisma.submission.findUnique({
      where: { id },
      include: {
        problem: { select: { slug: true, title: true } },
      },
    })

    if (!submission) return reply.status(404).send({ error: 'NOT_FOUND' })

    // Users can only see their own submissions (admins can see all)
    const userRole = request.headers['x-user-role'] as string
    if (submission.userId !== userId && userRole !== 'admin') {
      return reply.status(403).send({ error: 'FORBIDDEN' })
    }

    return reply.send(submission)
  })

  // SSE endpoint for real-time submission/run result
  fastify.get('/:id/events', async (request, reply) => {
    const { id } = request.params as { id: string }
    const userId = request.headers['x-user-id'] as string

    const isRunJob = id.startsWith('run_')

    if (!isRunJob) {
      // Persisted submission — verify ownership and check if already done
      const submission = await prisma.submission.findUnique({
        where: { id },
        select: { userId: true, verdict: true },
      })

      if (!submission) return reply.status(404).send({ error: 'NOT_FOUND' })
      if (submission.userId !== userId) return reply.status(403).send({ error: 'FORBIDDEN' })

      // Already completed — flush immediately
      if (submission.verdict !== 'pending' && submission.verdict !== 'running') {
        const full = await prisma.submission.findUnique({ where: { id } })
        reply.raw.writeHead(200, {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        })
        reply.raw.write(`data: ${JSON.stringify({ type: 'result', ...full })}\n\n`)
        reply.raw.end()
        return reply
      }
    }
    // run_ jobs are ephemeral — just subscribe to Redis directly, no DB check needed

    reply.raw.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    })
    reply.raw.write(`data: ${JSON.stringify({ type: 'queued', submissionId: id })}\n\n`)

    // Subscribe to Redis pub/sub for result
    const subscriber = getRedis().duplicate()
    const channel = `submission:result:${id}`

    const cleanup = () => {
      subscriber.unsubscribe(channel).catch(() => {})
      subscriber.quit().catch(() => {})
    }

    request.raw.on('close', cleanup)

    await subscriber.subscribe(channel)
    subscriber.on('message', (_chan: string, message: string) => {
      reply.raw.write(`data: ${JSON.stringify({ type: 'result', ...JSON.parse(message) })}\n\n`)
      reply.raw.end()
      cleanup()
    })

    // Timeout after 60 seconds
    const timeout = setTimeout(() => {
      reply.raw.write(`data: ${JSON.stringify({ type: 'timeout' })}\n\n`)
      reply.raw.end()
      cleanup()
    }, 60000)

    request.raw.on('close', () => clearTimeout(timeout))
    return reply
  })

  fastify.get('/', async (request, reply) => {
    const userId = request.headers['x-user-id'] as string
    if (!userId) return reply.status(401).send({ error: 'UNAUTHORIZED' })

    const query = z
      .object({
        page: z.coerce.number().default(1),
        limit: z.coerce.number().max(50).default(20),
        verdict: z.string().optional(),
        language: z.string().optional(),
        problemId: z.string().optional(),
      })
      .parse(request.query)

    const where = {
      userId,
      ...(query.verdict && { verdict: query.verdict as never }),
      ...(query.language && { language: query.language as never }),
      ...(query.problemId && { problemId: query.problemId }),
    }

    const [submissions, total] = await Promise.all([
      prisma.submission.findMany({
        where,
        select: {
          id: true,
          language: true,
          verdict: true,
          runtimeMs: true,
          memoryMb: true,
          createdAt: true,
          problem: { select: { slug: true, title: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      prisma.submission.count({ where }),
    ])

    return reply.send({
      data: submissions,
      total,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(total / query.limit),
    })
  })
}
