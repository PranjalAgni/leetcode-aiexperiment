import Fastify from 'fastify'
import helmet from '@fastify/helmet'
import cors from '@fastify/cors'
import rateLimit from '@fastify/rate-limit'
import cookie from '@fastify/cookie'
import { Redis } from 'ioredis'
import { logger } from '@algoarena/logger'
import { registerProxies } from './plugins/proxy'
import { authMiddleware } from './middleware/auth'

const app = Fastify({ logger: false, trustProxy: true })

async function bootstrap() {
  await app.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'", 'wss:'],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
    crossOriginEmbedderPolicy: false,
  })

  await app.register(cors, {
    origin: process.env['ALLOWED_ORIGINS']?.split(',') ?? ['http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  })

  await app.register(cookie)

  const redis = new Redis(process.env['REDIS_URL'] ?? 'redis://localhost:6379')
  await app.register(rateLimit, {
    global: true,
    max: 300,
    timeWindow: '1 minute',
    redis,
    keyGenerator: (req) => {
      const userId = (req as { userId?: string }).userId
      return userId ?? req.ip
    },
  })

  // Auth middleware — runs on all requests before proxying
  app.addHook('preHandler', authMiddleware)

  // Register service proxies
  await registerProxies(app)

  app.get('/health', async () => ({ status: 'ok', service: 'api-gateway' }))
  app.get('/api/v1/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }))

  const port = parseInt(process.env['PORT'] ?? '4000')
  await app.listen({ port, host: '0.0.0.0' })
  logger.info({ port }, 'api-gateway started')
}

bootstrap().catch((err) => {
  logger.error(err)
  process.exit(1)
})
