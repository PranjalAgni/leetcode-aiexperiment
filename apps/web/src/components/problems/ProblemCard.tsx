import Link from 'next/link'
import type { ProblemListItem } from '@algoarena/shared-types'
import { cn, getDifficultyColor, formatAcceptanceRate } from '@/lib/utils'
import { CheckCircle2, Circle, MinusCircle } from 'lucide-react'

interface Props {
  problem: ProblemListItem
}

export function ProblemCard({ problem }: Props) {
  return (
    <Link
      href={`/problems/${problem.slug}`}
      className="flex items-center gap-4 px-4 py-3 hover:bg-muted/50 transition-colors group"
    >
      <StatusIcon status={problem.userStatus} />

      <span className="w-12 text-sm text-muted-foreground shrink-0">{problem.number}</span>

      <span className="flex-1 font-medium group-hover:text-primary transition-colors line-clamp-1">
        {problem.title}
      </span>

      <div className="hidden md:flex items-center gap-2 shrink-0">
        {problem.tags.slice(0, 3).map((tag) => (
          <span
            key={tag.id}
            className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
          >
            {tag.name}
          </span>
        ))}
      </div>

      <span
        className={cn(
          'text-sm font-medium shrink-0 capitalize',
          getDifficultyColor(problem.difficulty)
        )}
        data-testid="difficulty-badge"
      >
        {problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1)}
      </span>

      <span className="w-16 text-sm text-muted-foreground text-right shrink-0 hidden sm:block">
        {formatAcceptanceRate(problem.acceptanceRate)}
      </span>
    </Link>
  )
}

function StatusIcon({ status }: { status?: string }) {
  switch (status) {
    case 'solved':
      return <CheckCircle2 className="w-4 h-4 text-easy shrink-0" data-testid="solved-icon" />
    case 'attempted':
      return <MinusCircle className="w-4 h-4 text-medium shrink-0" />
    default:
      return <Circle className="w-4 h-4 text-muted-foreground/30 shrink-0" />
  }
}
