import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import type { ProblemWithSamples } from '@algoarena/shared-types'
import { ProblemWorkspace } from '@/components/editor/ProblemWorkspace'

// Server-side fetch uses internal service URL (not the browser-facing NEXT_PUBLIC one)
const PROBLEM_SERVICE = process.env['PROBLEM_SERVICE_URL'] ?? 'http://localhost:4003'

async function fetchProblem(slug: string): Promise<ProblemWithSamples | null> {
  try {
    const res = await fetch(`${PROBLEM_SERVICE}/problems/${slug}`, {
      next: { revalidate: 60 },
    })
    if (!res.ok) return null
    return res.json() as Promise<ProblemWithSamples>
  } catch {
    return null
  }
}

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const problem = await fetchProblem(slug)
  if (!problem) return { title: 'Problem Not Found' }
  return {
    title: `${problem.number}. ${problem.title}`,
    description: `Solve ${problem.title} — ${problem.difficulty} difficulty`,
  }
}

export default async function ProblemPage({ params }: Props) {
  const { slug } = await params
  const problem = await fetchProblem(slug)
  if (!problem) notFound()
  return <ProblemWorkspace problem={problem} />
}
