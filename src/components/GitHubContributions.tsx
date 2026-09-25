'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ExternalLink } from 'lucide-react'
import { AnimatedCounter } from './AnimatedCounter'
import type { ContributionDay, GitHubContributionsResponse } from '@/app/api/github/route'

// Each column is a month, each row a weekday (Sun–Sat) summed across that month.
interface ContributionMonth {
  key: string // YYYY-MM
  counts: number[]
}

// Real snapshot (Oct 2024 – Sep 2026), shown until /api/github responds or if it fails.
// Regenerate with: gh api graphql (viewer.contributionsCollection) grouped by month + weekday.
const SNAPSHOT_MONTHS: ContributionMonth[] = ([
  ['2024-10', [0, 0, 0, 0, 0, 0, 0]],
  ['2024-11', [0, 0, 0, 0, 0, 0, 0]],
  ['2024-12', [0, 0, 0, 0, 0, 0, 0]],
  ['2025-01', [0, 0, 0, 0, 0, 0, 0]],
  ['2025-02', [0, 0, 0, 0, 0, 0, 0]],
  ['2025-03', [1, 4, 0, 0, 0, 0, 0]],
  ['2025-04', [0, 0, 2, 2, 3, 0, 0]],
  ['2025-05', [1, 9, 3, 2, 0, 9, 0]],
  ['2025-06', [0, 0, 0, 0, 0, 0, 0]],
  ['2025-07', [0, 0, 0, 0, 3, 1, 0]],
  ['2025-08', [1, 28, 8, 4, 4, 8, 0]],
  ['2025-09', [0, 180, 249, 133, 136, 120, 3]],
  ['2025-10', [11, 60, 43, 55, 30, 25, 0]],
  ['2025-11', [0, 38, 50, 44, 30, 42, 0]],
  ['2025-12', [0, 56, 32, 55, 10, 18, 0]],
  ['2026-01', [11, 19, 38, 51, 21, 35, 40]],
  ['2026-02', [23, 43, 77, 22, 107, 108, 0]],
  ['2026-03', [2, 19, 12, 19, 53, 28, 25]],
  ['2026-04', [0, 0, 14, 90, 66, 1, 0]],
  ['2026-05', [9, 41, 26, 61, 47, 50, 7]],
  ['2026-06', [4, 33, 47, 36, 28, 25, 0]],
  ['2026-07', [0, 11, 12, 3, 16, 78, 4]],
  ['2026-08', [35, 11, 19, 35, 13, 7, 45]],
  ['2026-09', [31, 33, 38, 65, 36, 42, 0]],
] as const).map(([key, counts]) => ({ key, counts: [...counts] }))
const SNAPSHOT_TOTAL = 2471

function monthsFromDays(days: ContributionDay[]): ContributionMonth[] {
  const byMonth = new Map<string, number[]>()
  for (const { date, count } of days) {
    const key = date.slice(0, 7)
    const counts = byMonth.get(key) ?? new Array(7).fill(0)
    counts[new Date(`${date}T00:00:00Z`).getUTCDay()] += count
    byMonth.set(key, counts)
  }
  return Array.from(byMonth, ([key, counts]) => ({ key, counts }))
}

// GitHub-style levels: 0 for none, then quartiles of the non-zero cells shown
function levelScale(months: ContributionMonth[]) {
  const values = months.flatMap(m => m.counts).filter(c => c > 0).sort((a, b) => a - b)
  const q = (p: number) => values[Math.floor((values.length - 1) * p)] ?? 0
  const [t1, t2, t3] = [q(0.25), q(0.5), q(0.75)]
  return (count: number) => (count === 0 ? 0 : count <= t1 ? 1 : count <= t2 ? 2 : count <= t3 ? 3 : 4)
}

const levelOpacity = (level: number) => (level === 0 ? 0.1 : 0.3 + level * 0.175)

function formatMonth(key: string, withYear = false) {
  return new Date(`${key}-01T00:00:00Z`).toLocaleString('en-US', {
    month: 'short',
    year: withYear ? 'numeric' : undefined,
    timeZone: 'UTC',
  })
}

// One request shared by every instance on the page
let request: Promise<GitHubContributionsResponse | null> | null = null

function useContributions() {
  const [data, setData] = useState<GitHubContributionsResponse | null>(null)

  useEffect(() => {
    if (!request) {
      request = fetch('/api/github')
        .then(res => (res.ok ? res.json() : null))
        .catch(() => null) // Silently fall back to the snapshot
    }
    let active = true
    request.then(result => {
      if (active && result?.days?.length) setData(result)
    })
    return () => { active = false }
  }, [])

  return {
    months: data ? monthsFromDays(data.days) : SNAPSHOT_MONTHS,
    total: data?.totalContributions ?? SNAPSHOT_TOTAL,
  }
}

interface GitHubContributionsProps {
  variant?: 'full' | 'compact' | 'card'
  animate?: boolean
  monthsToShow?: number
}

export function GitHubContributions({
  variant = 'compact',
  animate = false,
  monthsToShow,
}: GitHubContributionsProps) {
  const { months: allMonths, total } = useContributions()
  const months = allMonths.slice(-(monthsToShow ?? (variant === 'full' ? 24 : 12)))
  const levelOf = levelScale(months)

  // Compact variant for cards
  if (variant === 'card') {
    return (
      <div className="flex gap-[2px] p-4">
        {months.map(month => (
          <div key={month.key} className="flex flex-col gap-[2px]">
            {month.counts.map((count, di) => (
              <div
                key={di}
                className="w-2.5 h-2.5 rounded-sm bg-accent"
                style={{ opacity: levelOpacity(levelOf(count)) }}
              />
            ))}
          </div>
        ))}
      </div>
    )
  }

  // Compact variant without labels
  if (variant === 'compact') {
    return (
      <div className="flex gap-[3px]">
        {months.map(month => (
          <div key={month.key} className="flex flex-col gap-[3px]">
            {month.counts.map((count, di) => (
              <div
                key={di}
                className="w-4 h-4 rounded-sm bg-accent"
                style={{ opacity: levelOpacity(levelOf(count)) }}
              />
            ))}
          </div>
        ))}
      </div>
    )
  }

  const cellClass = 'w-[11px] h-[11px] sm:w-4 sm:h-4 rounded-sm bg-accent'

  // Full variant with labels and animation
  return (
    <div className="flex flex-col items-center">
      {/* Contribution count - live from GitHub API */}
      {animate ? (
        <motion.a
          href="https://github.com/GChainey"
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="inline-flex items-center gap-1.5 text-sm text-muted mb-3 hover:text-foreground transition-colors"
        >
          <AnimatedCounter value={total} className="text-foreground font-medium" duration={2} /> contributions in the last 12 months
          <ExternalLink className="w-3 h-3" />
        </motion.a>
      ) : (
        <a
          href="https://github.com/GChainey"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-muted mb-3 hover:text-foreground transition-colors"
        >
          <span className="text-foreground font-medium">{total.toLocaleString()}</span> contributions in the last 12 months
          <ExternalLink className="w-3 h-3" />
        </a>
      )}

      <div className="inline-flex flex-col">
        {/* Range markers */}
        <div className="flex justify-between mb-1 px-1">
          <span className="text-xs text-muted">{months.length > 0 && formatMonth(months[0].key, true)}</span>
          <span className="text-xs text-muted">Now</span>
        </div>

        {/* Real activity: one column per month, one row per weekday */}
        <div className="flex gap-[2px] sm:gap-[3px]">
          {months.map((month, mi) => {
            const monthTotal = month.counts.reduce((sum, c) => sum + c, 0)
            return (
              <div
                key={month.key}
                className="flex flex-col gap-[2px] sm:gap-[3px]"
                title={`${formatMonth(month.key, true)}: ${monthTotal.toLocaleString()} contributions`}
              >
                {month.counts.map((count, di) => (
                  animate ? (
                    <motion.div
                      key={di}
                      className={cellClass}
                      initial={{ opacity: 0.1 }}
                      animate={{ opacity: levelOpacity(levelOf(count)) }}
                      transition={{ delay: 0.8 + (mi * 7 + di) * 0.012, duration: 0.3 }}
                    />
                  ) : (
                    <div
                      key={di}
                      className={cellClass}
                      style={{ opacity: levelOpacity(levelOf(count)) }}
                    />
                  )
                ))}
              </div>
            )
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 text-xs text-muted">
        <span>Less</span>
        <div className="flex gap-1">
          {[0, 1, 2, 3, 4].map((level) => (
            <div
              key={level}
              className="w-3 h-3 rounded-sm bg-accent"
              style={{ opacity: levelOpacity(level) }}
            />
          ))}
        </div>
        <span>More</span>
      </div>
    </div>
  )
}
