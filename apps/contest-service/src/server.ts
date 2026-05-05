import Fastify from 'fastify'
import helmet from '@fastify/helmet'
import cors from '@fastify/cors'
import { logger } from '@algoarena/logger'
import { contestRoutes } from './routes/contests'

const app = Fastify({ logger: false, trustProxy: true })

async function bootstrap() {
  await app.register(helmet, { contentSecurityPolicy: false })
  await app.register(cors, {
    origin: process.env['ALLOWED_ORIGINS']?.split(',') ?? ['http://localhost:4000'],
  })
  await app.register(contestRoutes, { prefix: '/contests' })
  app.get('/health', async () => ({ status: 'ok', service: 'contest-service' }))

  const port = parseInt(process.env['PORT'] ?? '4006')
  await app.listen({ port, host: '0.0.0.0' })
  logger.info({ port }, 'contest-service started')
}

bootstrap().catch((err) => { logger.error(err); process.exit(1) })
