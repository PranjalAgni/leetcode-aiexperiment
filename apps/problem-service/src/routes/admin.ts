import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '@algoarena/db'
import { invalidateCache } from '../services/cache'

const CreateProblemSchema = z.object({
  number: z.number().int().positive(),
  title: z.string().min(1).max(200),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  description: z.string().min(1),
  constraints: z.string(),
  hints: z.array(z.string()).default([]),
  tags: z.array(z.string()),
  timeLimitMs: z.number().int().default(2000),
  memoryLimitMb: z.number().int().default(256),
})

const TestCaseSchema = z.object({
  input: z.string(),
  expectedOutput: z.string(),
  isSample: z.boolean().default(false),
  orderIndex: z.number().int(),
})

export async function adminProblemRoutes(fastify: FastifyInstance) {
  // All admin routes require admin role — validated by API gateway
  // The API gateway passes x-user-role header

  fastify.addHook('preHandler', async (request, reply) => {
    const role = request.headers['x-user-role']
    if (role !== 'admin') {
      return reply.status(403).send({ error: 'FORBIDDEN' })
    }
  })

  fastify.post('/', async (request, reply) => {
    const body = CreateProblemSchema.safeParse(request.body)
    if (!body.success) {
      return reply.status(400).send({ error: 'VALIDATION_ERROR', details: body.error.flatten() })
    }

    const { tags, ...problemData } = body.data
    const userId = request.headers['x-user-id'] as string

    const slug = problemData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')

    const tagRecords = await Promise.all(
      tags.map((slug) =>
        prisma.tag.upsert({
          where: { slug },
          update: {},
          create: { name: slug.replace(/-/g, ' '), slug },
        })
      )
    )

    const problem = await prisma.problem.create({
      data: {
        ...problemData,
        slug,
        hints: JSON.stringify(problemData.hints),
        createdBy: userId,
        problemTags: {
          create: tagRecords.map((tag) => ({ tagId: tag.id })),
        },
      },
    })

    return reply.status(201).send(problem)
  })

  fastify.patch('/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const body = CreateProblemSchema.partial().safeParse(request.body)
    if (!body.success) {
      return reply.status(400).send({ error: 'VALIDATION_ERROR' })
    }

    const { tags: _tags, ...updateData } = body.data
    const problem = await prisma.problem.update({
      where: { id },
      data: {
        ...updateData,
        ...(updateData.hints && { hints: JSON.stringify(updateData.hints) }),
      },
    })

    await invalidateCache(`problem:${problem.slug}`)
    return reply.send(problem)
  })

  fastify.post('/:id/test-cases', async (request, reply) => {
    const { id } = request.params as { id: string }
    const body = z.array(TestCaseSchema).safeParse(request.body)
    if (!body.success) {
      return reply.status(400).send({ error: 'VALIDATION_ERROR' })
    }

    const testCases = await prisma.testCase.createMany({
      data: body.data.map((tc) => ({ ...tc, problemId: id })),
    })

    return reply.status(201).send({ created: testCases.count })
  })

  fastify.patch('/:id/publish', async (request, reply) => {
    const { id } = request.params as { id: string }
    const problem = await prisma.problem.update({
      where: { id },
      data: { status: 'published' },
    })
    await invalidateCache(`problem:${problem.slug}`)
    return reply.send(problem)
  })
}
