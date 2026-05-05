import { Redis } from 'ioredis'

let redis: Redis | null = null

function getRedis(): Redis {
  if (!redis) {
    redis = new Redis(process.env['REDIS_URL'] ?? 'redis://localhost:6379')
  }
  return redis
}

export async function getCache<T>(key: string): Promise<T | null> {
  const value = await getRedis().get(key)
  if (!value) return null
  return JSON.parse(value) as T
}

export async function setCache(key: string, value: unknown, ttlSeconds: number): Promise<void> {
  await getRedis().setex(key, ttlSeconds, JSON.stringify(value))
}

export async function invalidateCache(key: string): Promise<void> {
  await getRedis().del(key)
}
