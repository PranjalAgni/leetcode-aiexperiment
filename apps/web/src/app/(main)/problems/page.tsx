import type { Metadata } from 'next'
import { ProblemList } from '@/components/problems/ProblemList'
import type { ProblemFilters, PaginatedResponse, ProblemListItem } from '@algoarena/shared-types'

export const metadata: Metadata = { title: 'Problems' }

const PROBLEM_SERVICE = process.env['PROBLEM_SERVICE_URL'] ?? 'http://localhost:4003'

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function ProblemsPage({ searchParams }: Props) {
  const params = await searchParams
  const filters: ProblemFilters = {
    difficulty: params['difficulty'] as ProblemFilters['difficulty'],
    tags: typeof params['tags'] === 'string' ? params['tags'].split(',') : undefined,
    search: typeof params['search'] === 'string' ? params['search'] : undefined,
    page: typeof params['page'] === 'string' ? parseInt(params['page']) : 1,
    limit: 50,
  }

  const queryParams = new URLSearchParams()
  if (filters.difficulty) queryParams.set('difficulty', filters.difficulty.join(','))
  if (filters.search) queryParams.set('search', filters.search)
  if (filters.page) queryParams.set('page', String(filters.page))

  const problems = await fetch(`${PROBLEM_SERVICE}/problems?${queryParams}`, {
    next: { revalidate: 30 },
  })
    .then((r) => r.json() as Promise<PaginatedResponse<ProblemListItem>>)
    .catch(() => ({
      data: [],
      total: 0,
      page: 1,
      limit: 50,
      totalPages: 0,
    }))

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Problems</h1>
      <ProblemList initialData={problems} initialFilters={filters} />
    </div>
  )
}
