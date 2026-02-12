'use client'

import { motion } from 'framer-motion'
import { Thinker } from '@/content/thinkers'
import { Facehash, stringHash } from 'facehash'

// All 16 theme accent colors (light-mode values) — color-mix with background adapts to light/dark
const THEME_ACCENT_COLORS = [
  '#d97706', '#ea580c', '#dc2626', '#e11d48', '#db2777', '#c026d3',
  '#9333ea', '#7c3aed', '#4f46e5', '#2563eb', '#0891b2', '#0d9488',
  '#059669', '#16a34a', '#65a30d', '#ca8a04',
]

function getAvatarColor(name: string): string {
  return THEME_ACCENT_COLORS[stringHash(name) % THEME_ACCENT_COLORS.length]
}

interface ThinkerCardProps {
  thinker: Thinker
  index?: number
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
        <Facehash
          name={thinker.name}
          size={40}
          showInitial
          enableBlink
          interactive={false}
          intensity3d="subtle"
          style={{
            backgroundColor: `color-mix(in srgb, ${getAvatarColor(thinker.name)} 60%, var(--background))`,
            borderRadius: '9999px',
          }}
        />
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
