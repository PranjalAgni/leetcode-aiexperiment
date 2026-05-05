export type Difficulty = 'easy' | 'medium' | 'hard'

export type ProblemStatus = 'not_attempted' | 'attempted' | 'solved'

export type ProblemPublishStatus = 'draft' | 'published' | 'deprecated'

export const PROBLEM_TAGS = [
  'array',
  'string',
  'hash-table',
  'dynamic-programming',
  'math',
  'sorting',
  'greedy',
  'depth-first-search',
  'binary-search',
  'breadth-first-search',
  'tree',
  'matrix',
  'two-pointers',
  'bit-manipulation',
  'stack',
  'heap-priority-queue',
  'graph',
  'backtracking',
  'prefix-sum',
  'sliding-window',
  'union-find',
  'linked-list',
  'trie',
  'recursion',
  'divide-and-conquer',
  'queue',
  'binary-tree',
  'binary-search-tree',
  'monotonic-stack',
  'segment-tree',
] as const

export type ProblemTag = (typeof PROBLEM_TAGS)[number]

export interface Tag {
  id: string
  name: string
  slug: string
}

export interface TestCase {
  id: string
  input: string
  expectedOutput: string
  isSample: boolean
  orderIndex: number
}

export interface Problem {
  id: string
  number: number
  title: string
  slug: string
  difficulty: Difficulty
  description: string
  constraints: string
  hints: string[]
  tags: Tag[]
  status: ProblemPublishStatus
  acceptanceRate: number
  totalSubmissions: number
  totalAccepted: number
  timeLimitMs: number
  memoryLimitMb: number
  createdAt: string
  updatedAt: string
}

export interface ProblemListItem {
  id: string
  number: number
  title: string
  slug: string
  difficulty: Difficulty
  acceptanceRate: number
  tags: Tag[]
  userStatus?: ProblemStatus
}

export interface ProblemFilters {
  difficulty?: Difficulty[]
  tags?: string[]
  status?: ProblemStatus[]
  search?: string
  page?: number
  limit?: number
}

export interface ProblemWithSamples extends Problem {
  sampleTestCases: TestCase[]
  languageLimits: LanguageLimit[]
  starterCode: Record<string, string>  // language → starter code string
  judgeMetadata: {
    functionName: string
    inputSchema: string[]
    outputSchema: string
  }
}

export interface LanguageLimit {
  language: string
  timeLimitMs: number
  memoryLimitMb: number
}

export interface StudyPlan {
  id: string
  title: string
  slug: string
  description: string
  difficultyLevel: string
  durationDays: number
  problems: StudyPlanProblem[]
}

export interface StudyPlanProblem {
  problemId: string
  problemSlug: string
  problemTitle: string
  difficulty: Difficulty
  dayNumber: number
  orderIndex: number
  completed?: boolean
}
