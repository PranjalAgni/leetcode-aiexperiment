export const LANGUAGES = [
  'python3',
  'javascript',
  'typescript',
  'java',
  'cpp17',
  'go',
  'rust',
  'csharp',
  'kotlin',
  'ruby',
] as const

export type Language = (typeof LANGUAGES)[number]

export const LANGUAGE_DISPLAY_NAMES: Record<Language, string> = {
  python3: 'Python 3',
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  java: 'Java',
  cpp17: 'C++17',
  go: 'Go',
  rust: 'Rust',
  csharp: 'C#',
  kotlin: 'Kotlin',
  ruby: 'Ruby',
}

export type SubmissionVerdict =
  | 'pending'
  | 'running'
  | 'accepted'
  | 'wrong_answer'
  | 'time_limit_exceeded'
  | 'memory_limit_exceeded'
  | 'runtime_error'
  | 'compile_error'
  | 'system_error'

export interface Submission {
  id: string
  userId: string
  problemId: string
  problemSlug: string
  problemTitle: string
  contestId: string | null
  language: Language
  code: string
  verdict: SubmissionVerdict
  runtimeMs: number | null
  memoryMb: number | null
  testCasesPassed: number | null
  totalTestCases: number | null
  errorMessage: string | null
  failingTestCase: FailingTestCase | null
  createdAt: string
}

export interface FailingTestCase {
  input: string
  expectedOutput: string
  actualOutput: string
}

export interface SubmissionListItem {
  id: string
  problemSlug: string
  problemTitle: string
  language: Language
  verdict: SubmissionVerdict
  runtimeMs: number | null
  memoryMb: number | null
  createdAt: string
}

export interface SubmitRequest {
  problemId: string
  language: Language
  code: string
  contestId?: string
}

export interface RunRequest {
  problemId: string
  language: Language
  code: string
  customInput?: string
}

export interface RunResult {
  stdout: string
  stderr: string
  runtimeMs: number
  memoryMb: number
  verdict: SubmissionVerdict
}

export interface SubmissionResultEvent {
  submissionId: string
  verdict: SubmissionVerdict
  runtimeMs: number | null
  memoryMb: number | null
  testCasesPassed: number | null
  totalTestCases: number | null
  errorMessage: string | null
  failingTestCase: FailingTestCase | null
  runtimePercentile?: number
  memoryPercentile?: number
}
