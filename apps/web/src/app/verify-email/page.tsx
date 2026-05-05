'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Code2, CheckCircle2, XCircle, Loader2 } from 'lucide-react'

function VerifyContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('No verification token provided.')
      return
    }

    const apiBase = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:4000/api/v1'
    fetch(`${apiBase}/auth/verify-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
      .then((r) => r.json())
      .then((data: { message?: string; error?: string }) => {
        if (data.error) {
          setStatus('error')
          setMessage(data.error === 'INVALID_OR_EXPIRED_TOKEN'
            ? 'This verification link has expired or already been used. Please register again.'
            : 'Verification failed. Please try again.')
        } else {
          setStatus('success')
          setMessage('Your email has been verified! You can now sign in.')
          setTimeout(() => router.push('/login'), 3000)
        }
      })
      .catch(() => {
        setStatus('error')
        setMessage('Something went wrong. Please try again.')
      })
  }, [token, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2 font-bold text-xl mb-8 justify-center">
          <Code2 className="w-7 h-7 text-primary" />
          AlgoArena
        </Link>

        {status === 'loading' && (
          <div className="space-y-4">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
            <p className="text-muted-foreground">Verifying your email...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4">
            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto" />
            <h1 className="text-2xl font-bold">Email Verified!</h1>
            <p className="text-muted-foreground">{message}</p>
            <p className="text-sm text-muted-foreground">Redirecting to login...</p>
            <Link href="/login" className="inline-block mt-2 text-primary hover:underline font-medium">
              Go to login now →
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <XCircle className="w-12 h-12 text-red-500 mx-auto" />
            <h1 className="text-2xl font-bold">Verification Failed</h1>
            <p className="text-muted-foreground">{message}</p>
            <Link href="/register" className="inline-block mt-2 text-primary hover:underline font-medium">
              Register again →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyContent />
    </Suspense>
  )
}
