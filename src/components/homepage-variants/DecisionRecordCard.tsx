import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import type { DecisionRecord } from '@/content/homepage-variant-data'

export function DecisionRecordCard({ record }: { record: DecisionRecord }) {
  return (
    <Link
      href={record.href}
      className="group flex flex-col rounded-2xl border border-border bg-card p-5 sm:p-6 hover:border-accent/40 hover:-translate-y-0.5 transition-all duration-300"
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <h3 className="text-lg font-medium text-foreground group-hover:text-accent transition-colors">{record.title}</h3>
        <ArrowUpRight className="w-4 h-4 shrink-0 text-muted group-hover:text-accent" />
      </div>
      <dl className="space-y-3 text-sm flex-1">
        <div>
          <dt className="text-xs uppercase tracking-widest text-muted mb-1">Problem</dt>
          <dd className="text-foreground/90 leading-relaxed">{record.problem}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-widest text-muted mb-1">What AI did</dt>
          <dd className="text-muted leading-relaxed">{record.aiDid}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-widest text-muted mb-1">What I rejected</dt>
          <dd className="text-muted leading-relaxed">{record.rejected}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-widest text-muted mb-1">Outcome</dt>
          <dd className="text-foreground leading-relaxed">{record.outcome}</dd>
        </div>
      </dl>
    </Link>
  )
}
