import { Redis } from 'ioredis'

let client: Redis | null = null

export function getRedis(): Redis {
  if (!client) {
    client = new Redis(process.env['REDIS_URL'] ?? 'redis://localhost:6379')
  }
  return client
}

const REFRESH_TOKEN_TTL = 30 * 24 * 60 * 60 // 30 days

export async function storeRefreshToken(userId: string, token: string): Promise<void> {
  await getRedis().setex(`refresh:${userId}:${token}`, REFRESH_TOKEN_TTL, '1')
}

export async function validateAndRotateRefreshToken(
  userId: string,
  token: string,
  newToken: string
): Promise<boolean> {
  const redis = getRedis()
  const key = `refresh:${userId}:${token}`
  const exists = await redis.get(key)
  if (!exists) return false
  // Atomic: delete old token and store new one in a pipeline
  const pipe = redis.pipeline()
  pipe.del(key)
  pipe.setex(`refresh:${userId}:${newToken}`, REFRESH_TOKEN_TTL, '1')
  await pipe.exec() // executes the queued commands atomically
  return true
}

export async function revokeRefreshToken(userId: string, token: string): Promise<void> {
  await getRedis().del(`refresh:${userId}:${token}`)
}

export async function storeEmailVerificationToken(userId: string, token: string): Promise<void> {
  await getRedis().setex(`email_verify:${token}`, 24 * 60 * 60, userId)
}

export async function validateEmailVerificationToken(token: string): Promise<string | null> {
  const redis = getRedis()
  const userId = await redis.get(`email_verify:${token}`)
  if (userId) await redis.del(`email_verify:${token}`)
  return userId
}

export async function storePasswordResetToken(userId: string, token: string): Promise<void> {
  await getRedis().setex(`pwd_reset:${token}`, 15 * 60, userId)
}

export async function validatePasswordResetToken(token: string): Promise<string | null> {
  const redis = getRedis()
  const userId = await redis.get(`pwd_reset:${token}`)
  if (userId) await redis.del(`pwd_reset:${token}`)
  return userId
}
