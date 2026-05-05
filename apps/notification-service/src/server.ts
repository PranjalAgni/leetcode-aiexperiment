import Fastify from 'fastify'
import helmet from '@fastify/helmet'
import cors from '@fastify/cors'
import nodemailer from 'nodemailer'
import { logger } from '@algoarena/logger'
import { z } from 'zod'

const app = Fastify({ logger: false, trustProxy: true })

const transporter = nodemailer.createTransport({
  host: process.env['SMTP_HOST'] ?? 'smtp.mailtrap.io',
  port: parseInt(process.env['SMTP_PORT'] ?? '587'),
  auth: {
    user: process.env['SMTP_USER'],
    pass: process.env['SMTP_PASS'],
  },
})

const EmailSchema = z.object({
  to: z.string().email(),
  subject: z.string(),
  html: z.string(),
  text: z.string().optional(),
})

async function bootstrap() {
  await app.register(helmet, { contentSecurityPolicy: false })
  await app.register(cors, {
    origin: process.env['ALLOWED_ORIGINS']?.split(',') ?? ['http://localhost:4000'],
  })

  // Internal endpoint — called by other services
  app.post('/send-email', async (request, reply) => {
    const internalKey = request.headers['x-internal-key']
    if (internalKey !== process.env['INTERNAL_API_KEY']) {
      return reply.status(401).send({ error: 'UNAUTHORIZED' })
    }

    const body = EmailSchema.safeParse(request.body)
    if (!body.success) return reply.status(400).send({ error: 'VALIDATION_ERROR' })

    await transporter.sendMail({
      from: process.env['EMAIL_FROM'] ?? 'noreply@algoarena.dev',
      to: body.data.to,
      subject: body.data.subject,
      html: body.data.html,
      text: body.data.text,
    })

    return reply.send({ success: true })
  })

  app.get('/health', async () => ({ status: 'ok', service: 'notification-service' }))

  const port = parseInt(process.env['PORT'] ?? '4007')
  await app.listen({ port, host: '0.0.0.0' })
  logger.info({ port }, 'notification-service started')
}

bootstrap().catch((err) => { logger.error(err); process.exit(1) })
