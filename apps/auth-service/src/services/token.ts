import jwt from 'jsonwebtoken'
import { nanoid } from 'nanoid'
import type { UserRole } from '@algoarena/shared-types'

interface TokenPayload {
  sub: string
  email: string
  role: UserRole
  jti: string
}

export function generateAccessToken(payload: Omit<TokenPayload, 'jti'>): string {
  const privateKey = process.env['JWT_PRIVATE_KEY']!.replace(/\\n/g, '\n')
  return jwt.sign({ ...payload, jti: nanoid() }, privateKey, {
    algorithm: 'RS256',
    expiresIn: '15m',
  })
}

export function verifyAccessToken(token: string): TokenPayload {
  const publicKey = process.env['JWT_PUBLIC_KEY']!.replace(/\\n/g, '\n')
  return jwt.verify(token, publicKey, { algorithms: ['RS256'] }) as TokenPayload
}

export function generateRefreshToken(): string {
  return nanoid(64)
}
