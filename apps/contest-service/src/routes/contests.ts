import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '@algoarena/db'
import { Redis } from 'ioredis'

let redis: Redis | null = null
function getRedis() {
  if (!redis) redis = new Redis(process.env['REDIS_URL'] ?? 'redis://localhost:6379')
  return redis
}

export async function contestRoutes(fastify: FastifyInstance) {
  fastify.get('/', async (request, reply) => {
    const query = z
      .object({
        status: z.enum(['upcoming', 'ongoing', 'ended']).optional(),
        page: z.coerce.number().default(1),
        limit: z.coerce.number().max(20).default(10),
      })
      .parse(request.query)

    const contests = await prisma.contest.findMany({
      where: query.status ? { status: query.status } : undefined,
      orderBy: { startsAt: 'desc' },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
      include: {
        _count: { select: { participants: true } },
      },
    })

    return reply.send(contests)
  })

  fastify.get('/:slug', async (request, reply) => {
    const { slug } = request.params as { slug: string }

    const contest = await prisma.contest.findUnique({
      where: { slug },
      include: {
        problems: {
          include: { problem: { select: { id: true, title: true, slug: true, difficulty: true } } },
          orderBy: { orderIndex: 'asc' },
        },
        _count: { select: { participants: true } },
      },
    })

    if (!contest) return reply.status(404).send({ error: 'NOT_FOUND' })
    return reply.send(contest)
  })

  fastify.post('/:slug/register', async (request, reply) => {
    const userId = request.headers['x-user-id'] as string
    if (!userId) return reply.status(401).send({ error: 'UNAUTHORIZED' })

    const { slug } = request.params as { slug: string }
    const contest = await prisma.contest.findUnique({
      where: { slug },
      select: { id: true, status: true },
    })
    if (!contest) return reply.status(404).send({ error: 'NOT_FOUND' })
    if (contest.status === 'ended') return reply.status(400).send({ error: 'CONTEST_ENDED' })

    const user = await prisma.user.findUnique({ where: { id: userId }, select: { rating: true } })
    if (!user) return reply.status(404).send({ error: 'USER_NOT_FOUND' })

    await prisma.contestParticipant.upsert({
      where: { contestId_userId: { contestId: contest.id, userId } },
      update: {},
      create: { contestId: contest.id, userId, ratingBefore: user.rating },
    })

    return reply.send({ success: true })
  })

  // Real-time leaderboard (SSE)
  fastify.get('/:slug/leaderboard', async (request, reply) => {
    const { slug } = request.params as { slug: string }
    const accept = request.headers['accept'] ?? ''

    const contest = await prisma.contest.findUnique({
      where: { slug },
      select: { id: true, status: true, startsAt: true },
    })
    if (!contest) return reply.status(404).send({ error: 'NOT_FOUND' })

    if (accept.includes('text/event-stream') && contest.status === 'ongoing') {
      // SSE real-time leaderboard
      reply.raw.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      })

      const sendLeaderboard = async () => {
        const entries = await getLeaderboard(contest.id)
        reply.raw.write(`data: ${JSON.stringify(entries)}\n\n`)
      }

      await sendLeaderboard()

      const interval = setInterval(sendLeaderboard, 5000) // refresh every 5 seconds
      request.raw.on('close', () => clearInterval(interval))

      return reply
    }

    // Regular JSON response
    const entries = await getLeaderboard(contest.id)
    return reply.send(entries)
  })
}

async function getLeaderboard(contestId: string) {
  // Try Redis sorted set first (real-time during contest)
  const redis = getRedis()
  const cached = await redis.get(`leaderboard:${contestId}:snapshot`)
  if (cached) return JSON.parse(cached)

  // Fallback: compute from DB
  const submissions = await prisma.submission.findMany({
    where: { contestId, verdict: 'accepted' },
    select: { userId: true, problemId: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  })

  const contest = await prisma.contest.findUnique({
    where: { id: contestId },
    select: { startsAt: true, problems: { select: { problemId: true } } },
  })
  if (!contest) return []

  const participants = await prisma.contestParticipant.findMany({
    where: { contestId },
    include: { user: { select: { username: true, displayName: true } } },
  })

  const leaderboard = participants.map((p) => {
    const userSubs = submissions.filter((s) => s.userId === p.userId)
    const solved = contest.problems.filter((cp) =>
      userSubs.some((s) => s.problemId === cp.problemId)
    )

    let totalPenalty = 0
    const problemResults = contest.problems.map((cp) => {
      const firstAC = userSubs.find((s) => s.problemId === cp.problemId)
      if (!firstAC) return { problemId: cp.problemId, solved: false, attempts: 0, solvedAt: null, penalty: 0 }

      const minutesFromStart = Math.floor(
        (firstAC.createdAt.getTime() - contest.startsAt.getTime()) / 60000
      )
      const wrongAttempts = submissions.filter(
        (s) => s.userId === p.userId && s.problemId === cp.problemId && s.createdAt < firstAC.createdAt
      ).length

      const penalty = minutesFromStart + wrongAttempts * 20
      totalPenalty += penalty

      return {
        problemId: cp.problemId,
        solved: true,
        attempts: wrongAttempts + 1,
        solvedAt: minutesFromStart,
        penalty,
      }
    })

    return {
      userId: p.userId,
      username: p.user.username,
      displayName: p.user.displayName,
      solvedCount: solved.length,
      totalPenalty,
      problemResults,
      rank: 0,
    }
  })

  // Sort by solved count desc, then penalty asc
  leaderboard.sort((a, b) => {
    if (b.solvedCount !== a.solvedCount) return b.solvedCount - a.solvedCount
    return a.totalPenalty - b.totalPenalty
  })

  leaderboard.forEach((entry, i) => {
    entry.rank = i + 1
  })

  return leaderboard
}
