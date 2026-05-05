import type { Difficulty } from './problem'
import type { Language, SubmissionVerdict } from './submission'

export type ContestStatus = 'upcoming' | 'ongoing' | 'ended'

export interface Contest {
  id: string
  title: string
  slug: string
  description: string
  startsAt: string
  endsAt: string
  status: ContestStatus
  durationMinutes: number
  participantCount: number
  problems?: ContestProblem[]
}

export interface ContestProblem {
  contestId: string
  problemId: string
  problemTitle: string
  problemSlug: string
  difficulty: Difficulty
  orderIndex: number
  solvedCount?: number
}

export interface ContestParticipant {
  userId: string
  username: string
  displayName: string
  ratingBefore: number
  ratingAfter: number | null
  rank: number | null
  registeredAt: string
}

export interface LeaderboardEntry {
  rank: number
  userId: string
  username: string
  displayName: string
  totalPenalty: number
  solvedCount: number
  problemResults: ProblemResult[]
}

export interface ProblemResult {
  problemId: string
  solved: boolean
  attempts: number
  solvedAt: number | null // minutes from contest start
  penalty: number
}

export interface ContestSubmission {
  id: string
  userId: string
  contestId: string
  problemId: string
  language: Language
  code: string
  verdict: SubmissionVerdict
  runtimeMs: number | null
  createdAt: string
  minutesFromStart: number
}

export interface RatingChange {
  userId: string
  contestId: string
  oldRating: number
  newRating: number
  delta: number
  rank: number
  participantCount: number
}
