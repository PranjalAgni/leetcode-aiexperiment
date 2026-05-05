import type { FastifyInstance } from 'fastify'
import { prisma } from '@algoarena/db'

export async function rankingRoutes(fastify: FastifyInstance) {
  fastify.get('/', async (request, reply) => {
    const page = parseInt((request.query as Record<string, string>)['page'] ?? '1')
    const limit = 50

    const users = await prisma.user.findMany({
      where: { deletedAt: null },
      select: {
        id: true, username: true, displayName: true, rating: true,
        _count: { select: { submissions: { where: { verdict: 'accepted' } } } },
      },
      orderBy: { rating: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    })

    const ranked = users.map((u, i) => ({
      rank: (page - 1) * limit + i + 1,
      userId: u.id,
      username: u.username,
      displayName: u.displayName,
      rating: u.rating,
      solvedCount: u._count.submissions,
    }))

    return reply.send({ data: ranked, page })
  })
}
