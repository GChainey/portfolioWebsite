'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

interface ProjectCardProps {
  id: string
  title: string
  description: string
  category: string
  year?: string
  tags?: string[]
  showGitHubActivity?: boolean
  contributionData?: { data: number[] }[]
  variant?: 'default' | 'compact' | 'grid'
  index?: number
}

export function ProjectCard({
  id,
  title,
  description,
  category,
  year,
  tags,
  showGitHubActivity,
  contributionData,
  variant = 'default',
  index = 0,
}: ProjectCardProps) {
  const isCompact = variant === 'compact'
  const isGrid = variant === 'grid'

  return (
    <Link href={`/projects/${id}`} className="group block">
      <motion.div
        className={`border border-border rounded-lg overflow-hidden hover:border-foreground/30 transition-colors ${
          isCompact ? 'flex-shrink-0 w-72' : isGrid ? '' : 'flex-shrink-0 w-72'
        }`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
      >
        {/* Card visual */}
        <div className={`bg-border/50 flex items-center justify-center overflow-hidden ${isGrid ? 'h-48' : 'h-40'}`}>
          {showGitHubActivity && contributionData ? (
            <div className="flex gap-[2px] p-4">
              {contributionData.slice(0, 12).map((month, mi) => (
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
          ) : (
            <div className="font-mono text-[8px] leading-none text-foreground/20 group-hover:text-foreground/40 transition-colors whitespace-pre select-none">
{`    ╔══════════════════╗
    ║  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓  ║
    ║  ▓            ▓  ║
    ║  ▓   ${id.slice(0, 6).toUpperCase().padEnd(6)}   ▓  ║
    ║  ▓            ▓  ║
    ║  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓  ║
    ╚══════════════════╝`}
            </div>
          )}
        </div>

        <div className={isGrid ? 'p-5' : 'p-4'}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted uppercase tracking-wide">{category}</span>
              {year && (
                <>
                  <span className="text-xs text-muted">•</span>
                  <span className="text-xs text-muted">{year}</span>
                </>
              )}
            </div>
            <ArrowRight className="w-4 h-4 text-muted group-hover:text-accent group-hover:translate-x-1 transition-all" />
          </div>
          <h3 className={`font-medium text-foreground group-hover:text-accent transition-colors ${isGrid ? 'text-lg mb-2' : 'mb-1'}`}>
            {title}
          </h3>
          <p className={`text-muted ${isGrid ? 'text-sm' : 'text-sm line-clamp-2'}`}>{description}</p>

          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 text-xs border border-border rounded text-muted"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </Link>
  )
}
