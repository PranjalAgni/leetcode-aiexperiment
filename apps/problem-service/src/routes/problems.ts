import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '@algoarena/db'
import { getCache, setCache } from '../services/cache'

const ListQuerySchema = z.object({
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  tags: z.string().optional(), // comma-separated tag slugs
  status: z.enum(['not_attempted', 'attempted', 'solved']).optional(),
  search: z.string().max(100).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
})

export async function problemRoutes(fastify: FastifyInstance) {
  fastify.get('/', async (request, reply) => {
    const query = ListQuerySchema.safeParse(request.query)
    if (!query.success) {
      return reply.status(400).send({ error: 'INVALID_QUERY', details: query.error.flatten() })
    }

    const { difficulty, tags, search, page, limit } = query.data
    const cacheKey = `problem_list:${JSON.stringify(query.data)}`
    const cached = await getCache(cacheKey)
    if (cached) return reply.send(cached)

    const where: Record<string, unknown> = {
      status: 'published',
      ...(difficulty && { difficulty }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { number: { equals: parseInt(search) || undefined } },
        ],
      }),
      ...(tags && {
        problemTags: {
          some: {
            tag: { slug: { in: tags.split(',') } },
          },
        },
      }),
    }

    const [problems, total] = await Promise.all([
      prisma.problem.findMany({
        where,
        select: {
          id: true,
          number: true,
          title: true,
          slug: true,
          difficulty: true,
          acceptanceRate: true,
          problemTags: {
            select: { tag: { select: { id: true, name: true, slug: true } } },
          },
        },
        orderBy: { number: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.problem.count({ where }),
    ])

    const formatted = problems.map((p) => ({
      ...p,
      tags: p.problemTags.map((pt) => pt.tag),
      problemTags: undefined,
    }))

    const response = {
      data: formatted,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }

    await setCache(cacheKey, response, 120)
    return reply.send(response)
  })

  fastify.get('/:slug', async (request, reply) => {
    const { slug } = request.params as { slug: string }
    const cacheKey = `problem:${slug}`
    const cached = await getCache(cacheKey)
    if (cached) return reply.send(cached)

    const problem = await prisma.problem.findUnique({
      where: { slug, status: 'published' },
      include: {
        problemTags: { include: { tag: true } },
        testCases: {
          where: { isSample: true },
          orderBy: { orderIndex: 'asc' },
        },
        languageLimits: true,
      },
    })

    if (!problem) return reply.status(404).send({ error: 'PROBLEM_NOT_FOUND' })

    const formatted = {
      ...problem,
      hints: Array.isArray(problem.hints) ? problem.hints as string[] : [],
      starterCode: (problem.starterCode ?? {}) as Record<string, string>,
      judgeMetadata: (problem.judgeMetadata ?? {}) as object,
      tags: problem.problemTags.map((pt) => pt.tag),
      sampleTestCases: problem.testCases,
      problemTags: undefined,
      testCases: undefined,
    }

    await setCache(cacheKey, formatted, 300)
    return reply.send(formatted)
  })

  fastify.get('/:slug/test-cases', async (request, reply) => {
    // Internal route — called by judge service (not exposed publicly)
    const { slug } = request.params as { slug: string }
    const internalKey = request.headers['x-internal-key']
    if (internalKey !== process.env['INTERNAL_API_KEY']) {
      return reply.status(401).send({ error: 'UNAUTHORIZED' })
    }

    const problem = await prisma.problem.findUnique({
      where: { slug },
      select: { id: true, timeLimitMs: true, memoryLimitMb: true },
    })
    if (!problem) return reply.status(404).send({ error: 'NOT_FOUND' })

    const testCases = await prisma.testCase.findMany({
      where: { problemId: problem.id },
      orderBy: { orderIndex: 'asc' },
    })

    return reply.send({ problem, testCases })
  })
}
