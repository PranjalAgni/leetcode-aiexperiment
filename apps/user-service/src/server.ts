import Fastify from 'fastify'
import helmet from '@fastify/helmet'
import cors from '@fastify/cors'
import { logger } from '@algoarena/logger'
import { userRoutes } from './routes/users'
import { rankingRoutes } from './routes/rankings'
import { studyPlanRoutes } from './routes/study-plans'

const app = Fastify({ logger: false, trustProxy: true })

async function bootstrap() {
  await app.register(helmet, { contentSecurityPolicy: false })
  await app.register(cors, {
    origin: process.env['ALLOWED_ORIGINS']?.split(',') ?? ['http://localhost:4000'],
  })

  await app.register(userRoutes, { prefix: '/users' })
  await app.register(rankingRoutes, { prefix: '/rankings' })
  await app.register(studyPlanRoutes, { prefix: '/study-plans' })

  app.get('/health', async () => ({ status: 'ok', service: 'user-service' }))

  const port = parseInt(process.env['PORT'] ?? '4002')
  await app.listen({ port, host: '0.0.0.0' })
  logger.info({ port }, 'user-service started')
}

bootstrap().catch((err) => { logger.error(err); process.exit(1) })
