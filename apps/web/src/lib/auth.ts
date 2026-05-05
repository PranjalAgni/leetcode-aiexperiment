import type { NextAuthOptions, Provider } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GithubProvider from 'next-auth/providers/github'
import GoogleProvider from 'next-auth/providers/google'

const AUTH_SERVICE = process.env['AUTH_SERVICE_URL'] ?? 'http://localhost:4001'

const providers: Provider[] = [
  CredentialsProvider({
    name: 'credentials',
    credentials: {
      email: { label: 'Email', type: 'email' },
      password: { label: 'Password', type: 'password' },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) return null
      try {
        const res = await fetch(`${AUTH_SERVICE}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: credentials.email, password: credentials.password }),
        })
        if (!res.ok) return null
        const data = (await res.json()) as { accessToken: string }
        return { id: 'user', accessToken: data.accessToken } as Record<string, string>
      } catch {
        return null
      }
    },
  }),
]

// Only add OAuth providers when credentials are actually configured
if (process.env['GITHUB_CLIENT_ID'] && process.env['GITHUB_CLIENT_SECRET']) {
  providers.push(GithubProvider({
    clientId: process.env['GITHUB_CLIENT_ID'],
    clientSecret: process.env['GITHUB_CLIENT_SECRET'],
  }))
}

if (process.env['GOOGLE_CLIENT_ID'] && process.env['GOOGLE_CLIENT_SECRET']) {
  providers.push(GoogleProvider({
    clientId: process.env['GOOGLE_CLIENT_ID'],
    clientSecret: process.env['GOOGLE_CLIENT_SECRET'],
  }))
}

export const authOptions: NextAuthOptions = {
  providers,
  callbacks: {
    async jwt({ token, user }) {
      if (user && 'accessToken' in user) {
        token['accessToken'] = user.accessToken as string
      }
      return token
    },
    async session({ session, token }) {
      if (token['accessToken']) {
        ;(session.user as Record<string, unknown>)['accessToken'] = token['accessToken']
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: { strategy: 'jwt' },
}
