import Link from 'next/link'
import { Code2, Trophy, BookOpen, Users, ChevronRight } from 'lucide-react'

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="py-24 px-4 text-center bg-gradient-to-b from-primary/5 to-background">
        <h1 className="text-5xl font-extrabold tracking-tight mb-4">
          Master Algorithms.
          <br />
          <span className="text-primary">Ace Your Interviews.</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          Practice coding problems, compete in weekly contests, and land your dream job at top tech companies.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/problems"
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            Start Solving <ChevronRight className="w-4 h-4" />
          </Link>
          <Link
            href="/register"
            className="px-6 py-3 border rounded-lg font-semibold hover:bg-muted transition-colors"
          >
            Create Free Account
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-y bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { label: 'Problems', value: '3,000+' },
            { label: 'Active Users', value: '50K+' },
            { label: 'Contests', value: 'Weekly' },
            { label: 'Languages', value: '10+' },
          ].map(({ label, value }) => (
            <div key={label}>
              <div className="text-3xl font-bold text-primary">{value}</div>
              <div className="text-sm text-muted-foreground mt-1">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Everything you need to succeed</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Code2,
                title: 'Rich Code Editor',
                description: 'Monaco editor with syntax highlighting, 10+ languages, and instant feedback.',
              },
              {
                icon: Trophy,
                title: 'Weekly Contests',
                description: 'Compete against thousands of developers. Track your rating and climb the leaderboard.',
              },
              {
                icon: BookOpen,
                title: 'Study Plans',
                description: 'Structured learning paths for interviews. Blind 75, Top 150, and more.',
              },
              {
                icon: Users,
                title: 'Community',
                description: 'Discuss solutions, share approaches, and learn from the community.',
              },
            ].map(({ icon: Icon, title, description }) => (
              <div key={title} className="p-6 rounded-xl border hover:border-primary/50 transition-colors">
                <Icon className="w-8 h-8 text-primary mb-3" />
                <h3 className="font-semibold mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
