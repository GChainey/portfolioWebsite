'use client'

import { motion } from 'framer-motion'

export interface Study {
  left: string
  right: string
  inner: string
}

// Albers' plate for chapter IV: two large grounds side by side, the same small rectangle on each.
// `joined` draws a strip of the small colour across the seam, which proves the two are one colour.
// `rightInner` breaks the rule on purpose, for the test where you set the right one yourself.
export function Plate({
  study,
  joined = false,
  rightInner,
  className = '',
}: {
  study: Study
  joined?: boolean
  rightInner?: string
  className?: string
}) {
  return (
    <div className={`relative flex overflow-hidden rounded-sm ring-1 ring-border ${className}`}>
      {[study.left, study.right].map((ground, i) => (
        <div key={i} className="relative aspect-[4/5] flex-1" style={{ background: ground }}>
          <div className="absolute left-1/2 top-1/2 h-[26%] w-[14%] -translate-x-1/2 -translate-y-1/2" style={{ background: i && rightInner ? rightInner : study.inner }} />
        </div>
      ))}
      <motion.div
        className="absolute left-1/4 top-[47%] h-[6%] w-1/2"
        style={{ background: study.inner }}
        initial={false}
        animate={{ scaleX: joined ? 1 : 0, opacity: joined ? 1 : 0 }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
      />
    </div>
  )
}

// The same colours interlocked as tiles, the way Albers says not to show them: every small
// rectangle has both grounds around it, so the two pulls cancel out.
export function Tiles({ study, className = '' }: { study: Study; className?: string }) {
  const cols = 6
  const rows = 4
  return (
    <div className={`grid overflow-hidden rounded-sm ring-1 ring-border ${className}`} style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
      {Array.from({ length: cols * rows }, (_, i) => (
        <div
          key={i}
          className="relative aspect-square"
          style={{ background: (Math.floor(i / cols) + i) % 2 ? study.right : study.left }}
        >
          <div className="absolute left-1/2 top-1/2 h-[40%] w-[22%] -translate-x-1/2 -translate-y-1/2" style={{ background: study.inner }} />
        </div>
      ))}
    </div>
  )
}
