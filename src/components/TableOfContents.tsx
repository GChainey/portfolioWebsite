'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ContentBlock } from '@/content/projects'

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export interface TocHeading {
  id: string
  text: string
  level: 2 | 3
}

export function extractHeadings(blocks: ContentBlock[]): TocHeading[] {
  return blocks
    .filter((b): b is ContentBlock & { type: 'heading' } => b.type === 'heading')
    .map(b => ({
      id: slugify(b.content),
      text: b.content,
      level: b.level,
    }))
}

interface TableOfContentsProps {
  blocks: ContentBlock[]
}

export function TableOfContents({ blocks }: TableOfContentsProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const headings = extractHeadings(blocks)
  const h2Headings = headings.filter(h => h.level === 2)

  const handleScrollTo = useCallback((id: string) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setTimeout(() => setIsExpanded(false), 300)
    }
  }, [])

  if (h2Headings.length < 2) return null

  return (
    <div className="mb-8">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-[11px] uppercase tracking-[0.15em] text-muted/60 hover:text-muted font-medium transition-colors"
      >
        <span>Contents</span>
        <motion.span
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-[10px]"
        >
          ▼
        </motion.span>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.ul
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden mt-2 flex flex-col gap-0.5"
          >
            {headings.map((h) => (
              <li key={h.id}>
                <button
                  onClick={() => handleScrollTo(h.id)}
                  className={`text-left text-[13px] leading-[1.5] py-[2px] transition-colors duration-150 ${
                    h.level === 3 ? 'pl-3 text-[12px]' : ''
                  } text-muted/50 hover:text-foreground`}
                >
                  {h.text}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}
