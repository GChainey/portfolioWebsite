'use client'

import { useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { FrameDialog } from '@/components/FrameDialog'

interface ImageGridItem {
  src: string
  title: string
  note?: string
  // A live prototype behind the picture: clicking opens it in a dialog to use
  live?: string
}

interface ImageGridProps {
  items: ImageGridItem[]
  // Columns from the small breakpoint up; phones get two
  columns?: 2 | 3 | 4 | 5
  // cover: every picture cropped to the same screen shape. natural: each at its own shape
  fit?: 'cover' | 'natural'
}

const COLS = { 2: 'sm:grid-cols-2', 3: 'sm:grid-cols-3', 4: 'sm:grid-cols-4', 5: 'sm:grid-cols-5' }

// Screens side by side, each with a short name: a set of variations, or the few that were picked.
// A screen with a live prototype behind it opens in a dialog.
export function ImageGrid({ items, columns = 3, fit = 'cover' }: ImageGridProps) {
  const [open, setOpen] = useState<ImageGridItem | null>(null)

  return (
    <figure className="my-8 not-prose">
      <div className={`grid grid-cols-2 ${COLS[columns]} gap-3 sm:gap-4 ${fit === 'natural' ? 'items-end' : ''}`}>
        {items.map((item) => {
          const picture = (
            <div className={`relative overflow-hidden rounded-lg border border-border bg-white shadow-sm transition-colors ${fit === 'cover' ? 'aspect-[16/10]' : ''} ${item.live ? 'group-hover:border-accent' : ''}`}>
              <img
                src={item.src}
                alt={item.title}
                loading="lazy"
                className={`block w-full ${fit === 'cover' ? 'h-full object-cover object-top' : 'h-auto'} ${item.live ? 'group-hover:scale-[1.03] transition-transform duration-500' : ''}`}
              />
              {item.live && (
                <span className="absolute bottom-2 right-2 inline-flex items-center gap-0.5 rounded-full bg-white/95 px-2 py-0.5 text-[11px] font-medium text-[#1d1d1f] shadow opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity">
                  Open it
                  <ArrowUpRight className="w-3 h-3" />
                </span>
              )}
            </div>
          )
          const words = (
            <>
              <p className={`mt-2 text-sm font-medium text-foreground leading-snug ${item.live ? 'group-hover:text-accent transition-colors' : ''}`}>{item.title}</p>
              {item.note && <p className="text-xs text-muted leading-snug">{item.note}</p>}
            </>
          )
          return item.live ? (
            <button key={item.src} type="button" onClick={() => setOpen(item)} className="group min-w-0 text-left" aria-label={`Open ${item.title}`}>
              {picture}
              {words}
            </button>
          ) : (
            <div key={item.src} className="min-w-0">
              {picture}
              {words}
            </div>
          )
        })}
      </div>

      <FrameDialog
        src={open?.live ?? null}
        title={open ? `${open.title}, running` : ''}
        hint="It’s the real page. Scroll it, click it, type into it."
        onClose={() => setOpen(null)}
      />
    </figure>
  )
}
