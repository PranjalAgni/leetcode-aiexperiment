import type { FastifyInstance } from 'fastify'
import httpProxy from '@fastify/http-proxy'

const SERVICES = {
  AUTH: process.env['AUTH_SERVICE_URL'] ?? 'http://localhost:4001',
  USER: process.env['USER_SERVICE_URL'] ?? 'http://localhost:4002',
  PROBLEM: process.env['PROBLEM_SERVICE_URL'] ?? 'http://localhost:4003',
  SUBMISSION: process.env['SUBMISSION_SERVICE_URL'] ?? 'http://localhost:4004',
  CONTEST: process.env['CONTEST_SERVICE_URL'] ?? 'http://localhost:4006',
  NOTIFICATION: process.env['NOTIFICATION_SERVICE_URL'] ?? 'http://localhost:4007',
}

export async function registerProxies(app: FastifyInstance) {
  await app.register(httpProxy, {
    upstream: SERVICES.AUTH,
    prefix: '/api/v1/auth',
    rewritePrefix: '/auth',
    http2: false,
  })

  await app.register(httpProxy, {
    upstream: SERVICES.USER,
    prefix: '/api/v1/users',
    rewritePrefix: '/users',
    http2: false,
  })

  await app.register(httpProxy, {
    upstream: SERVICES.USER,
    prefix: '/api/v1/rankings',
    rewritePrefix: '/rankings',
    http2: false,
  })

  await app.register(httpProxy, {
    upstream: SERVICES.PROBLEM,
    prefix: '/api/v1/problems',
    rewritePrefix: '/problems',
    http2: false,
  })

  await app.register(httpProxy, {
    upstream: SERVICES.SUBMISSION,
    prefix: '/api/v1/submissions',
    rewritePrefix: '/submissions',
    http2: false,
  })

  await app.register(httpProxy, {
    upstream: SERVICES.CONTEST,
    prefix: '/api/v1/contests',
    rewritePrefix: '/contests',
    http2: false,
  })

  await app.register(httpProxy, {
    upstream: SERVICES.PROBLEM,
    prefix: '/api/v1/admin/problems',
    rewritePrefix: '/admin/problems',
    http2: false,
  })

  await app.register(httpProxy, {
    upstream: SERVICES.CONTEST,
    prefix: '/api/v1/admin/contests',
    rewritePrefix: '/admin/contests',
    http2: false,
  })

  await app.register(httpProxy, {
    upstream: SERVICES.USER,
    prefix: '/api/v1/study-plans',
    rewritePrefix: '/study-plans',
    http2: false,
  })
}
