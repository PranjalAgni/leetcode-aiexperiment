import type { FastifyInstance } from 'fastify'
import { prisma } from '@algoarena/db'

export async function studyPlanRoutes(fastify: FastifyInstance) {
  fastify.get('/', async (_request, reply) => {
    const plans = await prisma.studyPlan.findMany({
      include: { _count: { select: { problems: true } } },
      orderBy: { title: 'asc' },
    })
    return reply.send(plans)
  })

  fastify.get('/:slug', async (request, reply) => {
    const { slug } = request.params as { slug: string }
    const userId = request.headers['x-user-id'] as string | undefined

    const plan = await prisma.studyPlan.findUnique({
      where: { slug },
      include: {
        problems: {
          include: { problem: { select: { id: true, title: true, slug: true, difficulty: true } } },
          orderBy: [{ dayNumber: 'asc' }, { orderIndex: 'asc' }],
        },
      },
    })

    if (!plan) return reply.status(404).send({ error: 'NOT_FOUND' })

    let completedIds: string[] = []
    if (userId) {
      const progress = await prisma.userStudyProgress.findMany({
        where: { userId, planId: plan.id },
        select: { problemId: true },
      })
      completedIds = progress.map((p) => p.problemId)
    }

    const formatted = {
      ...plan,
      problems: plan.problems.map((sp) => ({
        problemId: sp.problem.id,
        problemSlug: sp.problem.slug,
        problemTitle: sp.problem.title,
        difficulty: sp.problem.difficulty,
        dayNumber: sp.dayNumber,
        orderIndex: sp.orderIndex,
        completed: completedIds.includes(sp.problem.id),
      })),
    }

    return reply.send(formatted)
  })

  fastify.patch('/:slug/progress', async (request, reply) => {
    const userId = request.headers['x-user-id'] as string
    if (!userId) return reply.status(401).send({ error: 'UNAUTHORIZED' })

    const { slug } = request.params as { slug: string }
    const { problemId } = request.body as { problemId: string }

    const plan = await prisma.studyPlan.findUnique({ where: { slug } })
    if (!plan) return reply.status(404).send({ error: 'NOT_FOUND' })

    await prisma.userStudyProgress.upsert({
      where: { userId_planId_problemId: { userId, planId: plan.id, problemId } },
      update: {},
      create: { userId, planId: plan.id, problemId },
    })

    return reply.send({ success: true })
  })
}
