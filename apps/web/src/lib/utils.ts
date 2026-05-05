import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { Difficulty } from '@algoarena/shared-types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getDifficultyColor(difficulty: Difficulty): string {
  switch (difficulty) {
    case 'easy':
      return 'text-easy'
    case 'medium':
      return 'text-medium'
    case 'hard':
      return 'text-hard'
  }
}

export function getDifficultyBg(difficulty: Difficulty): string {
  switch (difficulty) {
    case 'easy':
      return 'bg-easy/10 text-easy'
    case 'medium':
      return 'bg-medium/10 text-medium'
    case 'hard':
      return 'bg-hard/10 text-hard'
  }
}

export function formatRuntime(ms: number | null): string {
  if (ms === null) return '--'
  if (ms < 1000) return `${ms} ms`
  return `${(ms / 1000).toFixed(2)} s`
}

export function formatMemory(mb: number | null): string {
  if (mb === null) return '--'
  return `${mb} MB`
}

export function formatAcceptanceRate(rate: number | string): string {
  return `${parseFloat(String(rate)).toFixed(1)}%`
}

export function getVerdictColor(verdict: string): string {
  switch (verdict) {
    case 'accepted':
      return 'text-green-500'
    case 'wrong_answer':
    case 'runtime_error':
    case 'compile_error':
      return 'text-red-500'
    case 'time_limit_exceeded':
    case 'memory_limit_exceeded':
      return 'text-yellow-500'
    case 'pending':
    case 'running':
      return 'text-blue-500'
    default:
      return 'text-muted-foreground'
  }
}

export function getVerdictLabel(verdict: string): string {
  const labels: Record<string, string> = {
    accepted: 'Accepted',
    wrong_answer: 'Wrong Answer',
    time_limit_exceeded: 'Time Limit Exceeded',
    memory_limit_exceeded: 'Memory Limit Exceeded',
    runtime_error: 'Runtime Error',
    compile_error: 'Compile Error',
    system_error: 'System Error',
    pending: 'Pending',
    running: 'Running',
  }
  return labels[verdict] ?? verdict
}
