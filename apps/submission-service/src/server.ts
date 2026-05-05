import Fastify from 'fastify'
import helmet from '@fastify/helmet'
import cors from '@fastify/cors'
import { logger } from '@algoarena/logger'
import { submissionRoutes } from './routes/submissions'
import { judgeResultWorker } from './workers/judge-result'
import { startDevJudge } from './dev-judge/worker'

const app = Fastify({ logger: false, trustProxy: true })

async function bootstrap() {
  await app.register(helmet, { contentSecurityPolicy: false })
  await app.register(cors, {
    origin: process.env['ALLOWED_ORIGINS']?.split(',') ?? ['http://localhost:4000'],
  })

  await app.register(submissionRoutes, { prefix: '/submissions' })
  app.get('/health', async () => ({ status: 'ok', service: 'submission-service' }))

  judgeResultWorker.start()

  // In dev: run a local judge worker so submissions are executed without Docker/isolate
  if (process.env['NODE_ENV'] !== 'production') {
    startDevJudge()
  }

  const port = parseInt(process.env['PORT'] ?? '4004')
  await app.listen({ port, host: '0.0.0.0' })
  logger.info({ port }, 'submission-service started')
}

bootstrap().catch((err) => {
  logger.error(err)
  process.exit(1)
})
