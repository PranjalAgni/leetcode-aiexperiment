'use client'

import { useState } from 'react'
import type { ProblemFilters, Difficulty } from '@algoarena/shared-types'
import { Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  filters: ProblemFilters
  onFiltersChange: (filters: Partial<ProblemFilters>) => void
}

const DIFFICULTIES: { value: Difficulty; label: string }[] = [
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
]

export function ProblemFilter({ filters, onFiltersChange }: Props) {
  const [searchInput, setSearchInput] = useState(filters.search ?? '')

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onFiltersChange({ search: searchInput || undefined })
    }
  }

  const toggleDifficulty = (difficulty: Difficulty) => {
    const current = filters.difficulty ?? []
    const isSelected = current.length === 1 && current[0] === difficulty
    onFiltersChange({ difficulty: isSelected ? undefined : [difficulty] })
  }

  const clearFilters = () => {
    setSearchInput('')
    onFiltersChange({ difficulty: undefined, search: undefined, tags: undefined })
  }

  const hasActiveFilters = !!(filters.difficulty?.length || filters.search || filters.tags?.length)

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search problems..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={handleSearchKeyDown}
          onBlur={() => onFiltersChange({ search: searchInput || undefined })}
          className="w-full pl-9 pr-4 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      {/* Difficulty filters */}
      <div className="flex gap-2">
        {DIFFICULTIES.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => toggleDifficulty(value)}
            className={cn(
              'px-3 py-1.5 rounded-full text-sm font-medium transition-all border',
              filters.difficulty?.includes(value)
                ? value === 'easy'
                  ? 'bg-easy/10 text-easy border-easy'
                  : value === 'medium'
                    ? 'bg-medium/10 text-medium border-medium'
                    : 'bg-hard/10 text-hard border-hard'
                : 'border-transparent hover:border-border text-muted-foreground'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-3 h-3" />
          Clear
        </button>
      )}
    </div>
  )
}
