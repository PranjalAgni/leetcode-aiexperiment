export type UserRole = 'user' | 'admin'

export interface User {
  id: string
  email: string
  username: string
  displayName: string
  role: UserRole
  bio: string | null
  location: string | null
  company: string | null
  githubUrl: string | null
  linkedinUrl: string | null
  website: string | null
  rating: number
  createdAt: string
}

export interface UserProfile extends User {
  solvedCount: number
  solvedEasy: number
  solvedMedium: number
  solvedHard: number
  submissionCount: number
  heatmap: HeatmapEntry[]
  recentSubmissions: RecentSubmission[]
}

export interface HeatmapEntry {
  date: string // ISO date string YYYY-MM-DD
  count: number
}

export interface RecentSubmission {
  id: string
  problemSlug: string
  problemTitle: string
  verdict: SubmissionVerdict
  language: Language
  createdAt: string
}

export interface RankingEntry {
  rank: number
  userId: string
  username: string
  displayName: string
  rating: number
  solvedCount: number
}

export type RatingTier =
  | 'unrated'
  | 'bronze'
  | 'silver'
  | 'gold'
  | 'platinum'
  | 'diamond'
  | 'master'
  | 'grandmaster'

export function getRatingTier(rating: number): RatingTier {
  if (rating < 1200) return 'unrated'
  if (rating < 1400) return 'bronze'
  if (rating < 1600) return 'silver'
  if (rating < 1800) return 'gold'
  if (rating < 2000) return 'platinum'
  if (rating < 2200) return 'diamond'
  if (rating < 2500) return 'master'
  return 'grandmaster'
}

import type { SubmissionVerdict, Language } from './submission'
