'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ExternalLink } from 'lucide-react'
import { AnimatedCounter } from './AnimatedCounter'

// Contribution data showing transformation - shared across the site
export const CONTRIBUTION_MONTHS = [
  { label: 'Jan 2024', data: [0, 0, 0, 0, 0, 0, 0] },
  { label: 'Feb', data: [0, 0, 1, 0, 0, 0, 0] },
  { label: 'Mar', data: [0, 1, 0, 0, 1, 0, 0] },
  { label: 'Apr', data: [0, 0, 1, 0, 0, 1, 0] },
  { label: 'May', data: [1, 0, 0, 1, 0, 0, 1] },
  { label: 'Jun', data: [0, 1, 1, 0, 1, 0, 1] },
  { label: 'Jul', data: [1, 0, 1, 1, 0, 2, 1] },
  { label: 'Aug', data: [1, 2, 1, 0, 2, 1, 1] },
  { label: 'Sep', data: [2, 1, 2, 1, 1, 2, 0] },
  { label: 'Oct', data: [1, 2, 3, 2, 1, 2, 2] },
  { label: 'Nov', data: [2, 3, 2, 3, 2, 1, 3] },
  { label: 'Dec', data: [3, 2, 4, 2, 3, 2, 2] },
  { label: 'Jan 2025', data: [2, 3, 3, 4, 2, 3, 3] },
  { label: 'Feb', data: [3, 4, 3, 2, 4, 3, 4] },
  { label: 'Mar', data: [4, 3, 4, 3, 4, 4, 3] },
  { label: 'Apr', data: [3, 4, 4, 4, 3, 4, 4] },
  { label: 'May', data: [4, 4, 3, 4, 4, 4, 4] },
  { label: 'Jun', data: [4, 4, 4, 4, 4, 3, 4] },
]

interface GitHubContributionsProps {
  variant?: 'full' | 'compact' | 'card'
  animate?: boolean
  monthsToShow?: number
}

export function GitHubContributions({
  variant = 'compact',
  animate = false,
  monthsToShow = 12
}: GitHubContributionsProps) {
  const months = CONTRIBUTION_MONTHS.slice(0, monthsToShow)

  // Compact variant for cards
  if (variant === 'card') {
    return (
      <div className="flex gap-[2px] p-4">
        {months.map((month, mi) => (
          <div key={mi} className="flex flex-col gap-[2px]">
            {month.data.map((level, di) => (
              <div
                key={`${mi}-${di}`}
                className="w-2.5 h-2.5 rounded-sm bg-accent"
                style={{ opacity: level === 0 ? 0.1 : 0.3 + level * 0.175 }}
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
        {months.map((month, mi) => (
          <div key={mi} className="flex flex-col gap-[3px]">
            {month.data.map((level, di) => (
              <div
                key={`${mi}-${di}`}
                className="w-4 h-4 rounded-sm bg-accent"
                style={{ opacity: level === 0 ? 0.1 : 0.3 + level * 0.175 }}
              />
            ))}
          </div>
        ))}
      </div>
    )
  }

  // Calculate total commits from last 12 months (static fallback)
  // Each cell represents a day-of-week across ~4 weeks in a month
  const totalCommits = CONTRIBUTION_MONTHS.slice(-12).reduce((total, month) =>
    total + month.data.reduce((sum, level) => sum + level, 0), 0
  ) * 4

  // Fetch real commit count from GitHub API
  const [commitCount, setCommitCount] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/github')
      .then(res => res.ok ? res.json() : Promise.reject(res))
      .then(data => setCommitCount(data.totalContributions))
      .catch(() => {
        // Silently fall back to static count
      })
  }, [])

  const displayCount = commitCount ?? totalCommits

  // Full variant with labels and animation
  return (
    <div className="flex flex-col items-center">
      {/* Commit count */}
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
          <AnimatedCounter value={displayCount} className="text-foreground font-medium" duration={2} /> commits in the last 12 months
          <ExternalLink className="w-3 h-3" />
        </motion.a>
      ) : (
        <a
          href="https://github.com/GChainey"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-muted mb-3 hover:text-foreground transition-colors"
        >
          <span className="text-foreground font-medium">{displayCount.toLocaleString()}</span> commits in the last 12 months
          <ExternalLink className="w-3 h-3" />
        </a>
      )}

      {/* Year markers */}
      <div className="flex justify-between mb-1 px-1" style={{ width: `${CONTRIBUTION_MONTHS.length * 19}px` }}>
        <span className="text-xs text-muted">2024</span>
        <span className="text-xs text-muted">2025</span>
      </div>

      {/* Grid */}
      <div className="flex gap-[3px]">
        {CONTRIBUTION_MONTHS.map((month, mi) => (
          <div key={mi} className="flex flex-col gap-[3px]">
            {month.data.map((level, di) => (
              animate ? (
                <motion.div
                  key={`${mi}-${di}`}
                  className="w-4 h-4 rounded-sm bg-accent"
                  initial={{ opacity: 0.1 }}
                  animate={{ opacity: level === 0 ? 0.1 : 0.3 + level * 0.175 }}
                  transition={{ delay: 0.8 + (mi * 7 + di) * 0.015, duration: 0.3 }}
                />
              ) : (
                <div
                  key={`${mi}-${di}`}
                  className="w-4 h-4 rounded-sm bg-accent"
                  style={{ opacity: level === 0 ? 0.1 : 0.3 + level * 0.175 }}
                />
              )
            ))}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 text-xs text-muted">
        <span>Less</span>
        <div className="flex gap-1">
          {[0, 1, 2, 3, 4].map((level) => (
            <div
              key={level}
              className="w-3 h-3 rounded-sm bg-accent"
              style={{ opacity: level === 0 ? 0.1 : 0.3 + level * 0.175 }}
            />
          ))}
        </div>
        <span>More</span>
      </div>
    </div>
  )
}
