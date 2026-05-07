'use client'

import { useState, useCallback } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import type { ProblemFilters, ProblemListItem, PaginatedResponse } from '@algoarena/shared-types'
import { ProblemCard } from './ProblemCard'
import { ProblemFilter } from './ProblemFilter'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

interface Props {
  initialData: PaginatedResponse<ProblemListItem>
  initialFilters: ProblemFilters
}

export function ProblemList({ initialData, initialFilters }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [filters, setFilters] = useState(initialFilters)

  const queryKey = ['problems', filters]
  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filters.difficulty?.length) params.set('difficulty', filters.difficulty.join(','))
      if (filters.search) params.set('search', filters.search)
      if (filters.page) params.set('page', String(filters.page))
      if (filters.tags?.length) params.set('tags', filters.tags.join(','))
      return api.get<PaginatedResponse<ProblemListItem>>(`/problems?${params}`)
    },
    initialData,
    initialDataUpdatedAt: 0,
    staleTime: 0,
  })

  const updateFilters = useCallback(
    (newFilters: Partial<ProblemFilters>) => {
      const updated = { ...filters, ...newFilters, page: 1 }
      setFilters(updated)

      const params = new URLSearchParams(searchParams.toString())
      if (updated.difficulty?.length) {
        params.set('difficulty', updated.difficulty.join(','))
      } else {
        params.delete('difficulty')
      }
      if (updated.search) {
        params.set('search', updated.search)
      } else {
        params.delete('search')
      }
      router.replace(`${pathname}?${params}`, { scroll: false })
    },
    [filters, pathname, router, searchParams]
  )

  return (
    <div>
      <ProblemFilter filters={filters} onFiltersChange={updateFilters} />

      <div className="mt-6">
        <div className="flex items-center justify-between mb-3 text-sm text-muted-foreground">
          <span>{data?.total ?? 0} problems</span>
          <span>
            Page {data?.page ?? 1} of {data?.totalPages ?? 1}
          </span>
        </div>

        {isLoading ? (
          <ProblemListSkeleton />
        ) : (
          <div className="border rounded-lg divide-y">
            {data?.data.map((problem) => (
              <ProblemCard key={problem.id} problem={problem} />
            ))}
            {data?.data.length === 0 && (
              <div className="p-12 text-center text-muted-foreground">
                No problems match your filters
              </div>
            )}
          </div>
        )}

        {(data?.totalPages ?? 0) > 1 && (
          <div className="flex gap-2 justify-center mt-6">
            <button
              onClick={() => updateFilters({ page: (filters.page ?? 1) - 1 })}
              disabled={(filters.page ?? 1) <= 1}
              className="px-4 py-2 rounded border disabled:opacity-40 hover:bg-muted transition-colors"
            >
              Previous
            </button>
            <span className="px-4 py-2">
              {filters.page ?? 1} / {data?.totalPages}
            </span>
            <button
              onClick={() => updateFilters({ page: (filters.page ?? 1) + 1 })}
              disabled={(filters.page ?? 1) >= (data?.totalPages ?? 1)}
              className="px-4 py-2 rounded border disabled:opacity-40 hover:bg-muted transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function ProblemListSkeleton() {
  return (
    <div className="border rounded-lg divide-y">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="p-4 flex items-center gap-4 animate-pulse">
          <div className="w-12 h-4 bg-muted rounded" />
          <div className="flex-1 h-4 bg-muted rounded" />
          <div className="w-20 h-4 bg-muted rounded" />
          <div className="w-16 h-4 bg-muted rounded" />
        </div>
      ))}
    </div>
  )
}
