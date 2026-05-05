'use client'

import { marked } from 'marked'
import type { ProblemWithSamples } from '@algoarena/shared-types'
import { getDifficultyBg, cn } from '@/lib/utils'
import { useState, useEffect, useRef } from 'react'

interface Props {
  problem: ProblemWithSamples
}

// DOMPurify is browser-only — this hook safely sanitizes HTML client-side only
function useSafeHtml(markdown: string) {
  const [html, setHtml] = useState('')
  useEffect(() => {
    const raw = marked.parse(markdown) as string
    import('dompurify').then(({ default: DOMPurify }) => {
      setHtml(DOMPurify.sanitize(raw))
    }).catch(() => setHtml(''))
  }, [markdown])
  return html
}

function SafeMarkdown({ markdown, className }: { markdown: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!ref.current) return
    const raw = marked.parse(markdown) as string
    import('dompurify').then(({ default: DOMPurify }) => {
      if (ref.current) {
        // Safe: DOMPurify removes all scripts/event handlers before setting
        const clean = DOMPurify.sanitize(raw, { USE_PROFILES: { html: true } })
        ref.current.innerHTML = clean
      }
    }).catch(() => {})
  }, [markdown])
  return <div ref={ref} className={cn('prose prose-sm dark:prose-invert max-w-none', className)} />
}

export function ProblemDescription({ problem }: Props) {
  const [hintsVisible, setHintsVisible] = useState<number[]>([])

  const toggleHint = (i: number) => {
    setHintsVisible((prev) =>
      prev.includes(i) ? prev.filter((h) => h !== i) : [...prev, i]
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-xl font-bold">
            {problem.number}. {problem.title}
          </h1>
          <span
            className={cn(
              'text-xs px-2 py-1 rounded-full font-medium capitalize',
              getDifficultyBg(problem.difficulty)
            )}
          >
            {problem.difficulty}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {problem.tags.map((tag) => (
            <span
              key={tag.id}
              className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
            >
              {tag.name}
            </span>
          ))}
        </div>
      </div>

      {/* Description */}
      <SafeMarkdown markdown={problem.description} />

      {/* Sample test cases */}
      {problem.sampleTestCases.map((tc, i) => (
        <div key={tc.id}>
          <p className="font-semibold text-sm mb-2">Example {i + 1}:</p>
          <div className="bg-muted rounded-md p-3 space-y-1 font-mono text-sm">
            <div>
              <span className="font-semibold">Input:</span> {tc.input}
            </div>
            <div>
              <span className="font-semibold">Output:</span> {tc.expectedOutput}
            </div>
          </div>
        </div>
      ))}

      {/* Constraints */}
      <div>
        <p className="font-semibold text-sm mb-2">Constraints:</p>
        <SafeMarkdown markdown={problem.constraints} />
      </div>

      {/* Hints */}
      {problem.hints.length > 0 && (
        <div>
          <p className="font-semibold text-sm mb-2">Hints:</p>
          <div className="space-y-2">
            {problem.hints.map((hint, i) => (
              <div key={i}>
                <button
                  onClick={() => toggleHint(i)}
                  className="text-sm text-primary hover:underline"
                >
                  {hintsVisible.includes(i) ? 'Hide' : 'Show'} Hint {i + 1}
                </button>
                {hintsVisible.includes(i) && (
                  <p className="mt-1 text-sm text-muted-foreground border-l-2 border-primary/30 pl-3">
                    {hint}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
