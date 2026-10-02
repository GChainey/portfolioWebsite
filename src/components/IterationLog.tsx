'use client'

import { useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { ROUNDS, ROUND_THEMES, MIGRATIONS, type RoundTheme } from '@/content/add-document-rounds'

interface IterationLogProps {
  commits?: number
}

const ease = [0.22, 1, 0.36, 1] as const

// Tailwind can't apply opacity to the CSS-variable colours, so mix them here.
const mix = (pct: number) => `color-mix(in srgb, var(--foreground) ${pct}%, transparent)`

// Every round of feedback as a column of squares, one square per change.
export function IterationLog({ commits }: IterationLogProps) {
  const [selected, setSelected] = useState(ROUNDS.length - 1)
  const [hovered, setHovered] = useState<number | null>(null)
  const [theme, setTheme] = useState<RoundTheme | null>(null)
  const chartRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(chartRef, { once: true, margin: '-100px' })

  const totalChanges = ROUNDS.reduce((sum, r) => sum + r.changes.length, 0)
  const maxChanges = Math.max(...ROUNDS.map((r) => r.changes.length))
  const round = ROUNDS[selected]
  const peek = hovered !== null ? ROUNDS[hovered] : null

  const stats = [
    { value: ROUNDS.length, label: 'rounds of feedback' },
    { value: totalChanges, label: 'changes' },
    ...(commits ? [{ value: commits, label: 'commits' }] : []),
    { value: 1, label: 'dialog' },
  ]

  return (
    <div className="not-prose my-8 rounded-xl border border-border p-4 sm:p-6">
      {/* Headline numbers */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {stats.map((s) => (
          <div key={s.label}>
            <div className="text-3xl font-medium text-foreground tabular-nums">{s.value}</div>
            <div className="text-sm text-muted">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Theme filter */}
      <div className="flex flex-wrap gap-2 mb-4">
        {[null, ...ROUND_THEMES].map((t) => {
          const count = t ? ROUNDS.filter((r) => r.theme === t).length : ROUNDS.length
          const active = theme === t
          return (
            <button
              key={t ?? 'all'}
              type="button"
              onClick={() => setTheme(t)}
              className={`h-7 px-3 rounded-full text-xs border transition-colors ${
                active
                  ? 'bg-foreground text-background border-foreground'
                  : 'text-muted border-border hover:text-foreground hover:border-foreground/30'
              }`}
            >
              {t ?? 'All'} <span className="tabular-nums opacity-60">{count}</span>
            </button>
          )
        })}
      </div>

      {/* Columns: one per round, one square per change */}
      <div ref={chartRef} className="relative">
        <div className="h-5 mb-2 text-xs text-muted truncate" aria-hidden>
          {peek ? (
            <>
              <span className="text-foreground">Round {peek.n}</span> · {peek.title} · {peek.changes.length}{' '}
              {peek.changes.length === 1 ? 'change' : 'changes'}
            </>
          ) : (
            'Each square is one change. Pick a round to read the feedback.'
          )}
        </div>
        <div className="flex items-end gap-[2px] sm:gap-1" onMouseLeave={() => setHovered(null)}>
          {ROUNDS.map((r, i) => {
            const isSelected = i === selected
            const inTheme = !theme || r.theme === theme
            return (
              <button
                key={r.n}
                type="button"
                onClick={() => setSelected(i)}
                onMouseEnter={() => setHovered(i)}
                onFocus={() => setHovered(i)}
                onBlur={() => setHovered(null)}
                aria-label={`Round ${r.n}: ${r.title}, ${r.changes.length} changes`}
                aria-pressed={isSelected}
                className="flex-1 min-w-0 flex flex-col items-center gap-1 pt-2 focus-visible:outline-none"
              >
                <div
                  className="w-full flex flex-col-reverse gap-[2px]"
                  style={{ height: maxChanges * 14 }}
                >
                  {r.changes.map((_, j) => (
                    <motion.div
                      key={j}
                      className="w-full h-3 rounded-[3px] transition-colors"
                      style={{ backgroundColor: isSelected ? 'var(--accent)' : mix(!inTheme ? 12 : i === hovered ? 90 : 55) }}
                      initial={{ opacity: 0, y: 8 }}
                      animate={isInView ? { opacity: 1, y: 0 } : {}}
                      transition={{ delay: i * 0.03 + j * 0.04, duration: 0.4, ease }}
                    />
                  ))}
                </div>
                <span
                  className={`text-[10px] tabular-nums ${isSelected ? 'text-accent' : 'text-muted'} ${
                    r.n % 2 === 0 ? 'hidden sm:block' : ''
                  }`}
                >
                  {r.n}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Selected round */}
      <div className="mt-6 pt-6 border-t border-border">
        <div className="flex items-center justify-between gap-4 mb-3">
          <div className="text-xs text-muted">
            Round {round.n} of {ROUNDS.length} · {round.theme}
          </div>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => setSelected((s) => Math.max(0, s - 1))}
              disabled={selected === 0}
              aria-label="Previous round"
              className="p-1.5 rounded-md border border-border text-muted hover:text-foreground disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setSelected((s) => Math.min(ROUNDS.length - 1, s + 1))}
              disabled={selected === ROUNDS.length - 1}
              aria-label="Next round"
              className="p-1.5 rounded-md border border-border text-muted hover:text-foreground disabled:opacity-30"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        <h4 className="text-lg font-medium text-foreground mb-3">{round.title}</h4>
        <blockquote className="mb-4 px-4 py-3 rounded-lg font-mono text-sm text-foreground" style={{ backgroundColor: mix(6) }}>
          “{round.feedback}”
        </blockquote>
        <ul className="space-y-1.5">
          {round.changes.map((c) => (
            <li key={c} className="flex gap-2 text-sm text-muted">
              <span className="mt-[7px] w-1.5 h-1.5 rounded-[2px] bg-accent shrink-0" />
              {c}
            </li>
          ))}
        </ul>
      </div>

      {/* Decisions that moved before they settled */}
      <div className="mt-6 pt-6 border-t border-border">
        <div className="text-xs text-muted mb-3">Where things moved before they settled</div>
        <div className="space-y-2">
          {MIGRATIONS.map((m) => (
            <div key={m.label} className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4 text-sm">
              <div className="sm:w-36 shrink-0 text-foreground">{m.label}</div>
              <div className="text-muted">
                {m.path.map((step, i) => (
                  <span key={step}>
                    {i > 0 && <span className="mx-1.5 opacity-50">→</span>}
                    <span className={i === m.path.length - 1 ? 'text-foreground' : ''}>{step}</span>
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
