import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import jwt from 'jsonwebtoken'
import { prisma } from '@algoarena/db'
import { logger } from '@algoarena/logger'
import { hashPassword, verifyPassword } from '../services/password'
import { generateAccessToken, generateRefreshToken, verifyAccessToken } from '../services/token'
import {
  storeRefreshToken,
  validateAndRotateRefreshToken,
  revokeRefreshToken,
  storeEmailVerificationToken,
  validateEmailVerificationToken,
  storePasswordResetToken,
  validatePasswordResetToken,
} from '../services/redis-store'
import { sendVerificationEmail, sendPasswordResetEmail } from '../services/email'
import { nanoid } from 'nanoid'

const isDev = process.env['NODE_ENV'] !== 'production'

const RegisterSchema = z.object({
  username: z
    .string()
    .min(3)
    .max(20)
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, hyphens'),
  email: z.string().email(),
  password: z
    .string()
    .min(8)
    .regex(/[A-Z]/, 'Must contain uppercase')
    .regex(/[0-9]/, 'Must contain number'),
})

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env['NODE_ENV'] === 'production',
  sameSite: 'strict' as const,
  path: '/',
  maxAge: 30 * 24 * 60 * 60,
}

export async function authRoutes(fastify: FastifyInstance) {
  fastify.post(
    '/register',
    {
      config: {
        rateLimit: { max: 5, timeWindow: '1 minute' },
      },
    },
    async (request, reply) => {
      const body = RegisterSchema.safeParse(request.body)
      if (!body.success) {
        return reply.status(400).send({ error: 'VALIDATION_ERROR', details: body.error.flatten() })
      }

      const { username, email, password } = body.data

      const existing = await prisma.user.findFirst({
        where: { OR: [{ email }, { username }] },
        select: { email: true, username: true },
      })

      if (existing?.email === email) {
        return reply.status(409).send({ error: 'EMAIL_TAKEN', message: 'Email already in use' })
      }
      if (existing?.username === username) {
        return reply
          .status(409)
          .send({ error: 'USERNAME_TAKEN', message: 'Username already taken' })
      }

      const passwordHash = await hashPassword(password)

      // In dev mode, auto-verify so developers can sign in immediately without email setup
      const user = await prisma.user.create({
        data: { username, email, passwordHash, displayName: username, emailVerified: isDev },
      })

      if (isDev) {
        logger.info({ userId: user.id }, 'User registered (auto-verified in dev mode)')
        return reply.status(201).send({ message: 'Registration successful. You can now sign in.' })
      }

      const verifyToken = nanoid(32)
      await storeEmailVerificationToken(user.id, verifyToken)
      await sendVerificationEmail(email, verifyToken)

      logger.info({ userId: user.id }, 'User registered — verification email sent')
      return reply.status(201).send({ message: 'Registration successful. Please check your email to verify your account.' })
    }
  )

  fastify.post(
    '/login',
    {
      config: {
        rateLimit: { max: 10, timeWindow: '1 minute' },
      },
    },
    async (request, reply) => {
      const body = LoginSchema.safeParse(request.body)
      if (!body.success) {
        return reply.status(400).send({ error: 'VALIDATION_ERROR' })
      }

      const { email, password } = body.data

      const user = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          username: true,
          passwordHash: true,
          role: true,
          emailVerified: true,
          deletedAt: true,
        },
      })

      if (!user || !user.passwordHash || !(await verifyPassword(password, user.passwordHash))) {
        return reply.status(401).send({ error: 'INVALID_CREDENTIALS', message: 'Invalid email or password' })
      }

      if (user.deletedAt) {
        return reply.status(403).send({ error: 'ACCOUNT_DELETED' })
      }

      if (!user.emailVerified) {
        return reply.status(403).send({
          error: 'EMAIL_NOT_VERIFIED',
          message: 'Please verify your email before signing in. Check your inbox for the verification link.',
        })
      }

      const accessToken = generateAccessToken({ sub: user.id, email: user.email, role: user.role })
      const refreshToken = generateRefreshToken()
      await storeRefreshToken(user.id, refreshToken)

      reply.setCookie('refresh_token', refreshToken, COOKIE_OPTIONS)
      return reply.send({ accessToken, expiresIn: 900 })
    }
  )

  fastify.post('/logout', async (request, reply) => {
    const refreshToken = request.cookies['refresh_token']
    if (refreshToken) {
      const authHeader = request.headers.authorization
      if (authHeader?.startsWith('Bearer ')) {
        try {
          const payload = verifyAccessToken(authHeader.slice(7))
          await revokeRefreshToken(payload.sub, refreshToken)
        } catch {
          // Token already expired — just clear cookie
        }
      }
    }
    reply.clearCookie('refresh_token', { path: '/' })
    return reply.send({ message: 'Logged out' })
  })

  fastify.post('/refresh', async (request, reply) => {
    const oldRefreshToken = request.cookies['refresh_token']
    if (!oldRefreshToken) {
      return reply.status(401).send({ error: 'NO_REFRESH_TOKEN' })
    }

    const authHeader = request.headers.authorization
    let userId: string | null = null

    if (authHeader?.startsWith('Bearer ')) {
      try {
        const payload = verifyAccessToken(authHeader.slice(7))
        userId = payload.sub
      } catch {
        // Expected — token may be expired, try decoding without verification
        try {
          const decoded = jwt.decode(authHeader.slice(7)) as { sub?: string } | null
          userId = decoded?.sub ?? null
        } catch {
          // ignore
        }
      }
    }

    if (!userId) {
      return reply.status(401).send({ error: 'CANNOT_IDENTIFY_USER' })
    }

    const newRefreshToken = generateRefreshToken()
    const valid = await validateAndRotateRefreshToken(userId, oldRefreshToken, newRefreshToken)
    if (!valid) {
      reply.clearCookie('refresh_token', { path: '/' })
      return reply.status(401).send({ error: 'INVALID_REFRESH_TOKEN' })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, role: true },
    })

    if (!user) {
      return reply.status(401).send({ error: 'USER_NOT_FOUND' })
    }

    const accessToken = generateAccessToken({ sub: user.id, email: user.email, role: user.role })
    reply.setCookie('refresh_token', newRefreshToken, COOKIE_OPTIONS)
    return reply.send({ accessToken, expiresIn: 900 })
  })

  fastify.post(
    '/verify-email',
    {
      config: { rateLimit: { max: 10, timeWindow: '1 minute' } },
    },
    async (request, reply) => {
      const body = z.object({ token: z.string() }).safeParse(request.body)
      if (!body.success) return reply.status(400).send({ error: 'INVALID_TOKEN' })

      const userId = await validateEmailVerificationToken(body.data.token)
      if (!userId) return reply.status(400).send({ error: 'INVALID_OR_EXPIRED_TOKEN' })

      await prisma.user.update({ where: { id: userId }, data: { emailVerified: true } })
      return reply.send({ message: 'Email verified successfully' })
    }
  )

  fastify.post(
    '/forgot-password',
    {
      config: { rateLimit: { max: 3, timeWindow: '15 minutes' } },
    },
    async (request, reply) => {
      const body = z.object({ email: z.string().email() }).safeParse(request.body)
      if (!body.success) return reply.status(400).send({ error: 'VALIDATION_ERROR' })

      const user = await prisma.user.findUnique({
        where: { email: body.data.email },
        select: { id: true },
      })

      // Always return success to prevent email enumeration
      if (user) {
        const resetToken = nanoid(32)
        await storePasswordResetToken(user.id, resetToken)
        await sendPasswordResetEmail(body.data.email, resetToken)
        logger.info({ userId: user.id }, 'Password reset email sent')
      }

      return reply.send({ message: 'If that email exists, a reset link has been sent.' })
    }
  )

  fastify.post(
    '/reset-password',
    {
      config: { rateLimit: { max: 5, timeWindow: '15 minutes' } },
    },
    async (request, reply) => {
      const body = z
        .object({
          token: z.string(),
          password: z
            .string()
            .min(8)
            .regex(/[A-Z]/)
            .regex(/[0-9]/),
        })
        .safeParse(request.body)

      if (!body.success) return reply.status(400).send({ error: 'VALIDATION_ERROR' })

      const userId = await validatePasswordResetToken(body.data.token)
      if (!userId) return reply.status(400).send({ error: 'INVALID_OR_EXPIRED_TOKEN' })

      const passwordHash = await hashPassword(body.data.password)
      await prisma.user.update({ where: { id: userId }, data: { passwordHash } })

      return reply.send({ message: 'Password reset successful' })
    }
  )
}
