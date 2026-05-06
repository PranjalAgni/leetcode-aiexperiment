'use client'

import { useState, useEffect, useCallback } from 'react'
import type { ProblemWithSamples, Language, SubmissionResultEvent } from '@algoarena/shared-types'
import { LANGUAGES, LANGUAGE_DISPLAY_NAMES, getDefaultTemplate } from '@algoarena/shared-types'
import { CodeEditor } from './CodeEditor'
import { ProblemDescription } from './ProblemDescription'
import { SubmissionPanel } from './SubmissionPanel'
import { useSession } from 'next-auth/react'
import { api } from '@/lib/api'
import { getVerdictLabel, getVerdictColor, formatRuntime, formatMemory } from '@/lib/utils'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

interface Submission {
  id: string
  language: string
  verdict: string
  runtimeMs: number | null
  memoryMb: number | null
  createdAt: string
}

interface Props {
  problem: ProblemWithSamples
}

export function ProblemWorkspace({ problem }: Props) {
  const { data: session, status: sessionStatus } = useSession()
  const [language, setLanguage] = useState<Language>('python3')

  const getStarterCode = (lang: Language) =>
    problem.starterCode?.[lang] ?? getDefaultTemplate(lang)

  const [code, setCode] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`code:${problem.slug}:${language}`)
      if (saved) return saved
    }
    return getStarterCode(language)
  })
  const [submitting, setSubmitting] = useState(false)
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState<SubmissionResultEvent | null>(null)
  const [activeTab, setActiveTab] = useState<'description' | 'submissions'>('description')
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [submissionsLoading, setSubmissionsLoading] = useState(false)

  // Persist code to localStorage
  useEffect(() => {
    localStorage.setItem(`code:${problem.slug}:${language}`, code)
  }, [code, problem.slug, language])

  // Load saved code when language changes
  const handleLanguageChange = useCallback(
    (lang: Language) => {
      setLanguage(lang)
      const saved = localStorage.getItem(`code:${problem.slug}:${lang}`)
      setCode(saved ?? getStarterCode(lang))
      setResult(null)
    },
    [problem.slug]
  )

  const handleRun = useCallback(async () => {
    if (sessionStatus === 'loading') return
    // @ts-expect-error — session type extension
    const token = session?.user?.accessToken as string | undefined
    if (!token) {
      toast.error('Please log in to run code')
      return
    }
    setRunning(true)
    setResult(null)
    try {
      const { runId } = await api.post<{ runId: string }>(
        '/submissions/run',
        { problemId: problem.id, language, code },
        { token }
      )
      await pollResult(runId)
    } catch {
      toast.error('Failed to run code')
    } finally {
      setRunning(false)
    }
  }, [session, problem.id, language, code])

  const fetchSubmissions = useCallback(async () => {
    // @ts-expect-error — session type extension
    const token = session?.user?.accessToken as string | undefined
    if (!token) return
    setSubmissionsLoading(true)
    try {
      const data = await api.get<{ data: Submission[] }>(
        `/submissions?problemId=${problem.id}&limit=20`,
        { token }
      )
      setSubmissions(data.data ?? [])
    } catch {
      // silently fail — user may not have any submissions
    } finally {
      setSubmissionsLoading(false)
    }
  }, [session, problem.id])

  useEffect(() => {
    if (activeTab === 'submissions') {
      fetchSubmissions()
    }
  }, [activeTab, fetchSubmissions])

  // EventSource cannot send headers — pass JWT as query param
  const getToken = () =>
    // @ts-expect-error — session type extension
    (session?.user?.accessToken as string | undefined) ?? ''

  const openEventStream = (id: string, onResult: (data: SubmissionResultEvent) => void) => {
    const API_BASE = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:4000/api/v1'
    const token = getToken()
    const url = `${API_BASE}/submissions/${id}/events${token ? `?token=${encodeURIComponent(token)}` : ''}`
    const es = new EventSource(url)
    es.onmessage = (event) => {
      const data = JSON.parse(event.data as string) as { type: string } & SubmissionResultEvent
      if (data.type === 'result') {
        onResult(data)
        es.close()
      }
    }
    es.onerror = () => es.close()
    return es
  }

  const subscribeToResult = (submissionId: string) =>
    new Promise<void>((resolve) => {
      openEventStream(submissionId, (data) => {
        setResult(data)
        if (data.verdict === 'accepted') {
          toast.success('Accepted!')
        } else {
          toast.error(getVerdictLabel(data.verdict ?? ''))
        }
        resolve()
      })
    })

  const pollResult = (runId: string) =>
    new Promise<void>((resolve) => {
      openEventStream(runId, (data) => {
        setResult(data)
        resolve()
      })
    })

  const handleSubmit = useCallback(async () => {
    if (sessionStatus === 'loading') return
    // @ts-expect-error — session type extension
    const token = session?.user?.accessToken as string | undefined
    if (!token) {
      toast.error('Please log in to submit')
      return
    }
    setSubmitting(true)
    setResult(null)
    setActiveTab('submissions')
    try {
      const { submissionId } = await api.post<{ submissionId: string }>(
        '/submissions',
        { problemId: problem.id, language, code },
        { token }
      )
      await subscribeToResult(submissionId)
      fetchSubmissions()
    } catch {
      toast.error('Failed to submit')
    } finally {
      setSubmitting(false)
    }
  }, [session, sessionStatus, problem.id, language, code, fetchSubmissions])

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleRun()
      }
      if (e.ctrlKey && e.shiftKey && e.key === 'Enter') {
        e.preventDefault()
        handleSubmit()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [handleRun, handleSubmit])

  return (
    <div className="flex h-[calc(100vh-56px)] overflow-hidden">
      {/* Left panel: problem description */}
      <div className="w-[45%] border-r flex flex-col overflow-hidden">
        <div className="flex border-b">
          {(['description', 'submissions'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm font-medium capitalize transition-colors ${
                activeTab === tab
                  ? 'border-b-2 border-primary text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'description' ? (
            <ProblemDescription problem={problem} />
          ) : (
            <div className="p-4">
              {!session ? (
                <p className="text-muted-foreground text-sm">Log in to view your submissions.</p>
              ) : submissionsLoading ? (
                <p className="text-muted-foreground text-sm">Loading...</p>
              ) : submissions.length === 0 ? (
                <p className="text-muted-foreground text-sm">No submissions yet.</p>
              ) : (
                <div className="space-y-2">
                  {submissions.map((s) => (
                    <div key={s.id} className="rounded-lg border p-3 text-sm">
                      <div className="flex items-center justify-between">
                        <span className={cn('font-semibold', getVerdictColor(s.verdict))}>
                          {getVerdictLabel(s.verdict)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(s.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <div className="mt-1 flex gap-4 text-xs text-muted-foreground">
                        <span>{s.language}</span>
                        {s.runtimeMs != null && <span>{formatRuntime(s.runtimeMs)}</span>}
                        {s.memoryMb != null && <span>{formatMemory(s.memoryMb)}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right panel: editor + submission panel */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Language selector */}
        <div className="flex items-center gap-3 px-4 py-2 border-b bg-background">
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value as Language)}
            className="text-sm bg-muted border rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary"
            data-testid="language-select"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang} value={lang}>
                {LANGUAGE_DISPLAY_NAMES[lang]}
              </option>
            ))}
          </select>
        </div>

        {/* Code editor */}
        <div className="flex-1 overflow-hidden">
          <CodeEditor language={language} value={code} onChange={setCode} />
        </div>

        {/* Submit panel */}
        <SubmissionPanel
          result={result}
          running={running}
          submitting={submitting}
          onRun={handleRun}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  )
}
