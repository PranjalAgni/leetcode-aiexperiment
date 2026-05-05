'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Code2 } from 'lucide-react'
import toast from 'react-hot-toast'

const HAS_GITHUB = !!(process.env['NEXT_PUBLIC_HAS_GITHUB_OAUTH'] === 'true')
const HAS_GOOGLE = !!(process.env['NEXT_PUBLIC_HAS_GOOGLE_OAUTH'] === 'true')

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') ?? '/problems'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      // Pre-check via API to surface specific errors (e.g. unverified email)
      // NextAuth swallows all auth errors into a generic message
      const apiBase = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:4000/api/v1'
      const preCheck = await fetch(`${apiBase}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      if (!preCheck.ok) {
        const err = await preCheck.json() as { error?: string; message?: string }
        if (err.error === 'EMAIL_NOT_VERIFIED') {
          toast.error('Please verify your email first. Check your inbox for the verification link.')
        } else {
          toast.error(err.message ?? 'Invalid email or password')
        }
        return
      }

      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
        callbackUrl,
      })
      if (result?.error) {
        toast.error('Sign in failed. Please try again.')
      } else {
        router.push(callbackUrl)
        router.refresh()
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 font-bold text-xl mb-6">
            <Code2 className="w-7 h-7 text-primary" />
            AlgoArena
          </Link>
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="text-muted-foreground mt-1">Sign in to your account</p>
        </div>

        {(HAS_GITHUB || HAS_GOOGLE) && (
          <>
            <div className="space-y-3 mb-6">
              {HAS_GITHUB && (
                <button
                  onClick={() => signIn('github', { callbackUrl })}
                  className="w-full flex items-center justify-center gap-3 py-2.5 px-4 border rounded-lg font-medium hover:bg-muted transition-colors text-sm"
                >
                  Continue with GitHub
                </button>
              )}
              {HAS_GOOGLE && (
                <button
                  onClick={() => signIn('google', { callbackUrl })}
                  className="w-full flex items-center justify-center gap-3 py-2.5 px-4 border rounded-lg font-medium hover:bg-muted transition-colors text-sm"
                >
                  Continue with Google
                </button>
              )}
            </div>
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs text-muted-foreground">
                <span className="bg-background px-2">or continue with email</span>
              </div>
            </div>
          </>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Email</label>
            <input
              type="email"
              name="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="user@algoarena.dev"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-medium">Password</label>
              <Link href="/forgot-password" className="text-xs text-primary hover:underline">
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-primary hover:underline font-medium">
            Sign up
          </Link>
        </p>

        {/* Dev hint */}
        {process.env.NODE_ENV === 'development' && (
          <p className="text-center text-xs text-muted-foreground mt-4 border-t pt-4">
            Dev: <code>user@algoarena.dev</code> / <code>User123!</code>
          </p>
        )}
      </div>
    </div>
  )
}
