'use client'

import { X } from 'lucide-react'
import { FEED_TYPES, type FeedItemType } from '@/content/feed'

interface FeedFilterBarProps {
  activeType: FeedItemType | 'all'
  activeTags: string[]
  allTags: string[]
  onTypeChange: (type: FeedItemType | 'all') => void
  onTagToggle: (tag: string) => void
  onClearTags: () => void
}

export function FeedFilterBar({
  activeType,
  activeTags,
  allTags,
  onTypeChange,
  onTagToggle,
  onClearTags,
}: FeedFilterBarProps) {
  return (
    <div className="sticky top-14 z-30 bg-background/80 backdrop-blur-sm border-b border-border">
      {/* Type filter pills */}
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex gap-2 px-6 py-3">
          {FEED_TYPES.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => onTypeChange(value)}
              className={`px-3 py-1.5 text-sm rounded-full border whitespace-nowrap transition-colors ${
                activeType === value
                  ? 'bg-accent text-white border-accent'
                  : 'border-border text-muted hover:text-foreground hover:border-foreground/30'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Tag filter pills */}
      {allTags.length > 0 && (
        <div className="overflow-x-auto scrollbar-hide border-t border-border">
          <div className="flex items-center gap-2 px-6 py-2">
            {activeTags.length > 0 && (
              <button
                onClick={onClearTags}
                className="flex items-center gap-1 px-2 py-1 text-xs rounded-full border border-border text-muted hover:text-foreground hover:border-foreground/30 transition-colors whitespace-nowrap"
              >
                <X className="w-3 h-3" />
                Clear
              </button>
            )}
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => onTagToggle(tag)}
                className={`px-2 py-1 text-xs rounded-full border whitespace-nowrap transition-colors ${
                  activeTags.includes(tag)
                    ? 'bg-accent text-white border-accent'
                    : 'border-border text-muted hover:text-foreground hover:border-foreground/30'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
