import type { FastifyInstance } from 'fastify'
import { prisma } from '@algoarena/db'
import { logger } from '@algoarena/logger'
import { generateAccessToken, generateRefreshToken } from '../services/token'
import { storeRefreshToken } from '../services/redis-store'

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env['NODE_ENV'] === 'production',
  sameSite: 'strict' as const,
  path: '/',
  maxAge: 30 * 24 * 60 * 60,
}

// OAuth callback handler — called by API gateway after OAuth exchange
export async function oauthRoutes(fastify: FastifyInstance) {
  fastify.post('/callback', async (request, reply) => {
    const body = request.body as {
      provider: 'google' | 'github'
      providerId: string
      email: string
      name: string
    }

    const { provider, providerId, email, name } = body

    // Find existing OAuth account
    let oauthAccount = await prisma.oAuthAccount.findUnique({
      where: { provider_providerId: { provider, providerId } },
      include: { user: { select: { id: true, email: true, role: true, deletedAt: true } } },
    })

    if (oauthAccount) {
      if (oauthAccount.user.deletedAt) {
        return reply.status(403).send({ error: 'ACCOUNT_DELETED' })
      }
      const user = oauthAccount.user
      const accessToken = generateAccessToken({ sub: user.id, email: user.email, role: user.role })
      const refreshToken = generateRefreshToken()
      await storeRefreshToken(user.id, refreshToken)
      reply.setCookie('refresh_token', refreshToken, COOKIE_OPTIONS)
      return reply.send({ accessToken, expiresIn: 900 })
    }

    // Link to existing user by email or create new one
    let user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, role: true },
    })

    if (!user) {
      const baseUsername = name.toLowerCase().replace(/[^a-z0-9]/g, '') || 'user'
      let username = baseUsername
      let suffix = 1
      while (await prisma.user.findUnique({ where: { username } })) {
        username = `${baseUsername}${suffix++}`
      }

      user = await prisma.user.create({
        data: {
          email,
          username,
          displayName: name,
          emailVerified: true,
          oauthAccounts: { create: { provider, providerId } },
        },
        select: { id: true, email: true, role: true },
      })
    } else {
      await prisma.oAuthAccount.create({
        data: { userId: user.id, provider, providerId },
      })
    }

    const accessToken = generateAccessToken({ sub: user.id, email: user.email, role: user.role })
    const refreshToken = generateRefreshToken()
    await storeRefreshToken(user.id, refreshToken)
    reply.setCookie('refresh_token', refreshToken, COOKIE_OPTIONS)
    logger.info({ userId: user.id, provider }, 'OAuth login')
    return reply.send({ accessToken, expiresIn: 900 })
  })
}
