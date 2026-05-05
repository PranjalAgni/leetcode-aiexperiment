import pino from 'pino'

const isDev = process.env['NODE_ENV'] !== 'production'

export const logger = pino({
  level: process.env['LOG_LEVEL'] ?? 'info',
  ...(isDev
    ? {
        transport: {
          target: 'pino-pretty',
          options: { colorize: true, translateTime: 'SYS:standard' },
        },
      }
    : {}),
  redact: {
    paths: ['req.headers.authorization', 'password', 'passwordHash', 'token', 'refreshToken'],
    censor: '[REDACTED]',
  },
  base: {
    service: process.env['SERVICE_NAME'] ?? 'unknown',
    env: process.env['NODE_ENV'] ?? 'development',
  },
})

export function createChildLogger(bindings: Record<string, unknown>) {
  return logger.child(bindings)
}

export type Logger = typeof logger
