import Link from 'next/link'
import { CHANGELOG } from '@/content/changelog'

/** Recent shipped work from the site changelog — not invented metrics. */
export function VelocityStrip() {
  const recent = CHANGELOG.slice(0, 5)

  return (
    <section className="rounded-2xl border border-border bg-card/50 overflow-hidden">
      <div className="px-4 sm:px-5 py-3 border-b border-border flex items-center justify-between gap-2">
        <h2 className="text-sm font-medium text-foreground">Velocity</h2>
        <Link href="/changelog" className="text-xs text-muted hover:text-accent underline-offset-4 hover:underline">
          Full changelog
        </Link>
      </div>
      <ul className="divide-y divide-border">
        {recent.map((entry) => (
          <li key={entry.version} className="px-4 sm:px-5 py-3 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-sm">
            <span className="font-mono text-xs text-accent tabular-nums">v{entry.version}</span>
            <span className="text-muted text-xs">{entry.date}</span>
            <span className="text-foreground min-w-0 flex-1">{entry.title}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
