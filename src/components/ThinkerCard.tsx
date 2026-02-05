'use client'

import { motion } from 'framer-motion'
import { Thinker } from '@/content/thinkers'

interface ThinkerCardProps {
  thinker: Thinker
  index?: number
}

function getInitials(thinker: Thinker): string {
  if (thinker.initials) return thinker.initials
  return thinker.name
    .split(' ')
    .map((n) => n[0])
    .join('')
}

export function ThinkerCard({ thinker, index = 0 }: ThinkerCardProps) {
  return (
    <motion.div
      className="group"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-full bg-border flex items-center justify-center text-foreground font-medium text-sm flex-shrink-0">
          {getInitials(thinker)}
        </div>
        <div className="min-w-0">
          <h3 className="font-medium text-foreground group-hover:text-accent transition-colors text-sm">
            {thinker.name}
          </h3>
          <p className="text-xs text-muted">{thinker.role}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 mt-3">
        {thinker.tags.map((tag) => (
          <span
            key={tag}
            className="px-2 py-0.5 text-xs border border-border rounded text-muted"
          >
            {tag}
          </span>
        ))}
      </div>
    </motion.div>
  )
}
