import Fastify from 'fastify'
import helmet from '@fastify/helmet'
import cors from '@fastify/cors'
import rateLimit from '@fastify/rate-limit'
import cookie from '@fastify/cookie'
import { Redis } from 'ioredis'
import { logger } from '@algoarena/logger'
import { authRoutes } from './routes/auth'
import { oauthRoutes } from './routes/oauth'

const app = Fastify({
  logger: false,
  trustProxy: true,
})

async function bootstrap() {
  await app.register(helmet, {
    contentSecurityPolicy: false,
  })

  await app.register(cors, {
    origin: process.env['ALLOWED_ORIGINS']?.split(',') ?? ['http://localhost:3000'],
    credentials: true,
  })

  await app.register(cookie, {
    secret: process.env['COOKIE_SECRET'] ?? 'dev-cookie-secret-change-in-production',
  })

  const redis = new Redis(process.env['REDIS_URL'] ?? 'redis://localhost:6379')
  await app.register(rateLimit, {
    global: false,
    redis,
  })

  await app.register(authRoutes, { prefix: '/auth' })
  await app.register(oauthRoutes, { prefix: '/auth/oauth' })

  app.get('/health', async () => ({ status: 'ok', service: 'auth-service' }))

  const port = parseInt(process.env['PORT'] ?? '4001')
  const host = process.env['HOST'] ?? '0.0.0.0'

  await app.listen({ port, host })
  logger.info({ port }, 'auth-service started')
}

bootstrap().catch((err) => {
  logger.error(err, 'Failed to start auth-service')
  process.exit(1)
})
