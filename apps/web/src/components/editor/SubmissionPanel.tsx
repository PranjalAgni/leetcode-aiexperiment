'use client'

import type { SubmissionResultEvent } from '@algoarena/shared-types'
import { cn, getVerdictColor, getVerdictLabel, formatRuntime, formatMemory } from '@/lib/utils'
import { Play, Send, Loader2 } from 'lucide-react'

interface Props {
  result: SubmissionResultEvent | null
  running: boolean
  submitting: boolean
  onRun: () => void
  onSubmit: () => void
}

export function SubmissionPanel({ result, running, submitting, onRun, onSubmit }: Props) {
  const isLoading = running || submitting

  return (
    <div className="border-t bg-background">
      {/* Result display */}
      {result && (
        <div className="px-4 py-3 border-b bg-muted/30">
          <div className="flex items-center justify-between">
            <span
              className={cn('font-semibold text-sm', getVerdictColor(result.verdict ?? ''))}
              data-testid="verdict-badge"
            >
              {getVerdictLabel(result.verdict ?? '')}
            </span>
            {result.verdict === 'accepted' && (
              <div className="flex gap-6 text-sm text-muted-foreground">
                <span data-testid="runtime-display">
                  Runtime: <span className="text-foreground font-medium">{formatRuntime(result.runtimeMs)}</span>
                </span>
                <span>
                  Memory: <span className="text-foreground font-medium">{formatMemory(result.memoryMb)}</span>
                </span>
              </div>
            )}
          </div>

          {/* Error message */}
          {result.errorMessage && (
            <pre className="mt-2 text-xs text-red-400 bg-red-950/20 rounded p-2 overflow-x-auto whitespace-pre-wrap">
              {result.errorMessage}
            </pre>
          )}

          {/* Failing test case */}
          {result.failingTestCase && (
            <div className="mt-2 text-xs space-y-1 font-mono">
              <div className="text-muted-foreground">
                <span className="font-semibold text-foreground">Input:</span>{' '}
                {result.failingTestCase.input}
              </div>
              <div className="text-muted-foreground">
                <span className="font-semibold text-foreground">Expected:</span>{' '}
                {result.failingTestCase.expectedOutput}
              </div>
              <div className="text-red-400">
                <span className="font-semibold">Got:</span> {result.failingTestCase.actualOutput}
              </div>
            </div>
          )}

          {/* Progress */}
          {result.totalTestCases && (
            <div className="mt-1 text-xs text-muted-foreground">
              {result.testCasesPassed}/{result.totalTestCases} test cases passed
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="text-xs text-muted-foreground hidden sm:block">
          <kbd className="px-1.5 py-0.5 rounded bg-muted text-xs">Ctrl</kbd>
          {' + '}
          <kbd className="px-1.5 py-0.5 rounded bg-muted text-xs">Enter</kbd>
          {' Run · '}
          <kbd className="px-1.5 py-0.5 rounded bg-muted text-xs">Ctrl</kbd>
          {' + '}
          <kbd className="px-1.5 py-0.5 rounded bg-muted text-xs">Shift</kbd>
          {' + '}
          <kbd className="px-1.5 py-0.5 rounded bg-muted text-xs">Enter</kbd>
          {' Submit'}
        </div>

        <div className="flex gap-3 ml-auto">
          <button
            onClick={onRun}
            disabled={isLoading}
            data-testid="run-button"
            className="flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-muted transition-colors text-sm font-medium disabled:opacity-50"
          >
            {running ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            Run
          </button>
          <button
            onClick={onSubmit}
            disabled={isLoading}
            data-testid="submit-button"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium disabled:opacity-50"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            Submit
          </button>
        </div>
      </div>
    </div>
  )
}
