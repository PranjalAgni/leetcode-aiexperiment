import type { FastifyRequest, FastifyReply } from 'fastify'
import jwt from 'jsonwebtoken'

interface JWTPayload {
  sub: string
  email: string
  role: string
  exp: number
}

// Routes that don't require authentication
const PUBLIC_ROUTES = new Set([
  'GET /api/v1/problems',
  'GET /api/v1/contests',
  'GET /api/v1/study-plans',
  'GET /api/v1/rankings',
  'POST /api/v1/auth/register',
  'POST /api/v1/auth/login',
  'POST /api/v1/auth/refresh',
  'POST /api/v1/auth/forgot-password',
  'POST /api/v1/auth/reset-password',
  'POST /api/v1/auth/verify-email',
  'GET /api/v1/health',
  'GET /health',
])

function isPublicRoute(method: string, url: string): boolean {
  const path = url.split('?')[0] ?? ''

  // Exact match
  if (PUBLIC_ROUTES.has(`${method} ${path}`)) return true

  // Pattern matches
  if (method === 'GET' && /^\/api\/v1\/problems\/[^/]+$/.test(path)) return true
  if (method === 'GET' && /^\/api\/v1\/contests\/[^/]+$/.test(path)) return true
  if (method === 'GET' && /^\/api\/v1\/u\/[^/]+$/.test(path)) return true
  if (method === 'GET' && /^\/api\/v1\/study-plans\/[^/]+$/.test(path)) return true

  return false
}

export async function authMiddleware(request: FastifyRequest, reply: FastifyReply) {
  const { method, url } = request
  if (isPublicRoute(method, url)) return

  // SSE connections (EventSource) cannot send custom headers — accept token as query param
  const queryToken = (request.query as Record<string, string>)['token']
  const authHeader = request.headers.authorization

  let token: string | null = null
  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.slice(7)
  } else if (queryToken) {
    token = queryToken
  } else {
    return reply.status(401).send({ error: 'UNAUTHORIZED', message: 'Missing authorization token' })
  }

  try {
    const publicKey = process.env['JWT_PUBLIC_KEY']!.replace(/\\n/g, '\n')
    const payload = jwt.verify(token, publicKey, { algorithms: ['RS256'] }) as JWTPayload

    // Inject user context as headers for downstream services
    request.headers['x-user-id'] = payload.sub
    request.headers['x-user-email'] = payload.email
    request.headers['x-user-role'] = payload.role

    // Admin route protection
    if (url.includes('/admin/') && payload.role !== 'admin') {
      return reply.status(403).send({ error: 'FORBIDDEN', message: 'Admin access required' })
    }
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return reply.status(401).send({ error: 'TOKEN_EXPIRED', message: 'Access token expired' })
    }
    return reply.status(401).send({ error: 'INVALID_TOKEN', message: 'Invalid token' })
  }
}
