import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '@algoarena/db'
import { format, subDays } from 'date-fns'

const UpdateProfileSchema = z.object({
  displayName: z.string().min(1).max(50).optional(),
  bio: z.string().max(300).optional(),
  location: z.string().max(100).optional(),
  company: z.string().max(100).optional(),
  githubUrl: z.string().url().optional().or(z.literal('')),
  linkedinUrl: z.string().url().optional().or(z.literal('')),
  website: z.string().url().optional().or(z.literal('')),
})

export async function userRoutes(fastify: FastifyInstance) {
  fastify.get('/me', async (request, reply) => {
    const userId = request.headers['x-user-id'] as string
    if (!userId) return reply.status(401).send({ error: 'UNAUTHORIZED' })

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, email: true, username: true, displayName: true,
        role: true, bio: true, location: true, company: true,
        githubUrl: true, linkedinUrl: true, website: true,
        rating: true, createdAt: true,
      },
    })
    if (!user) return reply.status(404).send({ error: 'NOT_FOUND' })
    return reply.send(user)
  })

  fastify.patch('/me', async (request, reply) => {
    const userId = request.headers['x-user-id'] as string
    if (!userId) return reply.status(401).send({ error: 'UNAUTHORIZED' })

    const body = UpdateProfileSchema.safeParse(request.body)
    if (!body.success) return reply.status(400).send({ error: 'VALIDATION_ERROR' })

    const user = await prisma.user.update({
      where: { id: userId },
      data: body.data,
      select: { id: true, username: true, displayName: true, bio: true },
    })
    return reply.send(user)
  })

  fastify.get('/:username', async (request, reply) => {
    const { username } = request.params as { username: string }

    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true, username: true, displayName: true, bio: true,
        location: true, company: true, githubUrl: true, linkedinUrl: true,
        website: true, rating: true, createdAt: true,
        _count: { select: { submissions: { where: { verdict: 'accepted' } } } },
      },
    })
    if (!user || user['deletedAt' as keyof typeof user]) {
      return reply.status(404).send({ error: 'USER_NOT_FOUND' })
    }

    // Solve counts by difficulty
    const solveCounts = await prisma.submission.groupBy({
      by: ['problemId'],
      where: { userId: user.id, verdict: 'accepted' },
      _count: true,
    })

    const solvedProblemIds = solveCounts.map((s) => s.problemId)
    const difficulties = await prisma.problem.findMany({
      where: { id: { in: solvedProblemIds } },
      select: { difficulty: true },
    })

    const solvedEasy = difficulties.filter((p) => p.difficulty === 'easy').length
    const solvedMedium = difficulties.filter((p) => p.difficulty === 'medium').length
    const solvedHard = difficulties.filter((p) => p.difficulty === 'hard').length

    // Heatmap: last 365 days of accepted submissions
    const since = subDays(new Date(), 365)
    const submissions = await prisma.submission.findMany({
      where: { userId: user.id, verdict: 'accepted', createdAt: { gte: since } },
      select: { createdAt: true },
    })

    const heatmapMap: Record<string, number> = {}
    for (const sub of submissions) {
      const date = format(sub.createdAt, 'yyyy-MM-dd')
      heatmapMap[date] = (heatmapMap[date] ?? 0) + 1
    }
    const heatmap = Object.entries(heatmapMap).map(([date, count]) => ({ date, count }))

    return reply.send({
      ...user,
      solvedCount: solvedProblemIds.length,
      solvedEasy,
      solvedMedium,
      solvedHard,
      heatmap,
    })
  })

  fastify.get('/me/heatmap', async (request, reply) => {
    const userId = request.headers['x-user-id'] as string
    if (!userId) return reply.status(401).send({ error: 'UNAUTHORIZED' })

    const since = subDays(new Date(), 365)
    const submissions = await prisma.submission.findMany({
      where: { userId, verdict: 'accepted', createdAt: { gte: since } },
      select: { createdAt: true },
    })

    const heatmap: Record<string, number> = {}
    for (const sub of submissions) {
      const date = format(sub.createdAt, 'yyyy-MM-dd')
      heatmap[date] = (heatmap[date] ?? 0) + 1
    }

    return reply.send(Object.entries(heatmap).map(([date, count]) => ({ date, count })))
  })
}
