import type { Language } from '@algoarena/shared-types'

export interface JudgeJobData {
  submissionId: string
  userId: string
  problemId: string
  contestId: string | null
  language: Language
  code: string
  timeLimitMs: number
  memoryLimitMb: number
  isRun?: boolean
  customInput?: string
}

export interface JudgeJobResult {
  submissionId: string
  verdict: string
  runtimeMs: number | null
  memoryMb: number | null
  testCasesPassed: number
  totalTestCases: number
  errorMessage: string | null
  failingTestCase: {
    input: string
    expectedOutput: string
    actualOutput: string
  } | null
}

export const QUEUE_NAMES = {
  JUDGE: 'judge',
} as const
