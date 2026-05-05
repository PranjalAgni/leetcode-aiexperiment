import Fastify from 'fastify'
import helmet from '@fastify/helmet'
import cors from '@fastify/cors'
import { logger } from '@algoarena/logger'
import { problemRoutes } from './routes/problems'
import { adminProblemRoutes } from './routes/admin'

const app = Fastify({ logger: false, trustProxy: true })

async function bootstrap() {
  await app.register(helmet, { contentSecurityPolicy: false })
  await app.register(cors, {
    origin: process.env['ALLOWED_ORIGINS']?.split(',') ?? ['http://localhost:4000'],
  })

  await app.register(problemRoutes, { prefix: '/problems' })
  await app.register(adminProblemRoutes, { prefix: '/admin/problems' })

  app.get('/health', async () => ({ status: 'ok', service: 'problem-service' }))

  const port = parseInt(process.env['PORT'] ?? '4003')
  await app.listen({ port, host: '0.0.0.0' })
  logger.info({ port }, 'problem-service started')
}

bootstrap().catch((err) => {
  logger.error(err)
  process.exit(1)
})
