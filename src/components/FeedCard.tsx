'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { type FeedItem } from '@/content/feed'

const TYPE_LABELS: Record<string, string> = {
  essay: 'Essay',
  'case-study': 'Case Study',
  thinker: 'Thinker',
  update: 'Update',
}

interface FeedCardProps {
  item: FeedItem
  index: number
}

export function FeedCard({ item, index }: FeedCardProps) {
  const isExternal = item.href?.startsWith('http')

  const content = (
    <motion.div
      className="border border-border rounded-lg overflow-hidden hover:border-foreground/30 transition-colors"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.05, 0.4) }}
    >
      <div className="p-5">
        {/* Header: type badge + year */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-xs font-medium rounded bg-accent/10 text-accent">
              {TYPE_LABELS[item.type]}
            </span>
            <span className="text-xs text-muted">{item.year}</span>
          </div>
          {item.href && (
            isExternal ? (
              <ArrowUpRight className="w-4 h-4 text-muted group-hover:text-accent transition-colors" />
            ) : (
              <ArrowRight className="w-4 h-4 text-muted group-hover:text-accent group-hover:translate-x-1 transition-all" />
            )
          )}
        </div>

        {/* Title */}
        <h3 className="font-medium text-lg text-foreground group-hover:text-accent transition-colors mb-2">
          {item.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-muted mb-1">{item.description}</p>

        {/* Preview text (truncated) */}
        {item.previewText && item.type !== 'update' && (
          <p className="text-sm text-muted/70 line-clamp-2 mt-2">
            {item.previewText}
          </p>
        )}

        {/* Update-specific: show changes as bullets */}
        {item.type === 'update' && item.previewText && (
          <div className="mt-2 space-y-1">
            {item.previewText.split(' · ').map((change, i) => (
              <div key={i} className="text-xs text-muted flex items-start gap-2">
                <span className="text-foreground/50 mt-0.5">•</span>
                <span>{change}</span>
              </div>
            ))}
          </div>
        )}

        {/* Tags */}
        {item.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {item.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 text-xs border border-border rounded text-muted"
              >
                {tag}
              </span>
            ))}
            {item.tags.length > 4 && (
              <span className="px-2 py-0.5 text-xs text-muted">
                +{item.tags.length - 4}
              </span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )

  if (!item.href) {
    return <div className="group">{content}</div>
  }

  if (isExternal) {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        className="group block"
      >
        {content}
      </a>
    )
  }

  return (
    <Link href={item.href} className="group block">
      {content}
    </Link>
  )
}
