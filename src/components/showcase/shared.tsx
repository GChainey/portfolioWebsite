'use client'

import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import Link from 'next/link'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { ShowcaseReel, reelDuration } from './ShowcaseReel'
import type { WorkItem } from '@/content/work'

// Pieces every homepage showcase variant shares: the reel, the read (features and thinking),
// the link out, and auto-advance.

export const ease = [0.25, 0.1, 0.25, 1] as const
export const pad = (n: number) => String(n).padStart(2, '0')
export const itemSeconds = (item: WorkItem) => reelDuration(item.reel)

// The piece's reel. Without captions it is the work alone, for when the variant writes its own.
export function WorkReel({ item, captions = true, theme, onCycle, playing }: { item: WorkItem; captions?: boolean; theme?: 'light' | 'dark'; onCycle?: () => void; playing?: boolean }) {
  return <ShowcaseReel scenes={item.reel} captions={captions} theme={theme} onCycle={onCycle} playing={playing} />
}

// Goes to the case study, or out to the product
export function WorkLink({ item, className, children, tabIndex, style }: { item: WorkItem; className?: string; children?: ReactNode; tabIndex?: number; style?: CSSProperties }) {
  const Arrow = item.external ? ArrowUpRight : ArrowRight
  const body = children ?? (
    <>
      {item.cta}
      <Arrow className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
    </>
  )
  return item.external ? (
    <a href={item.href} target="_blank" rel="noopener noreferrer" className={`group ${className ?? ''}`} tabIndex={tabIndex} style={style}>{body}</a>
  ) : (
    <Link href={item.href} className={`group ${className ?? ''}`} tabIndex={tabIndex} style={style}>{body}</Link>
  )
}

// What it does and why: the features, the thinking and the numbers, in the site's own type.
// tone: 'site' follows the theme; 'dark' is for the variants that are always dark.
export function WorkRead({ item, tone = 'site', compact = false }: { item: WorkItem; tone?: 'site' | 'dark'; compact?: boolean }) {
  const dark = tone === 'dark'
  const muted = dark ? 'text-white/60' : 'text-muted'
  const ink = dark ? 'text-white' : 'text-foreground'
  const line = dark ? 'border-white/10' : 'border-border'
  return (
    <div className={compact ? 'space-y-5' : 'space-y-7'}>
      <div>
        <p className={`text-xs uppercase tracking-widest mb-3 ${muted}`}>{item.kind === 'product' ? 'What it does' : 'What AI made possible'}</p>
        <ul className="space-y-2.5">
          {item.features.map((f, i) => (
            <li key={f} className={`flex gap-3 text-sm leading-relaxed ${ink}`}>
              <span className="mt-0.5 shrink-0 font-mono text-xs" style={{ color: item.accent }}>{pad(i + 1)}</span>
              <span>{f}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className={`border-l-2 pl-4 ${line}`} style={{ borderColor: item.accent }}>
        <p className={`text-xs uppercase tracking-widest mb-2 ${muted}`}>The thinking</p>
        <p className={`text-sm leading-relaxed ${dark ? 'text-white/85' : 'text-foreground'}`}>{item.thinking}</p>
      </div>
      {item.stats && (
        <div className="flex flex-wrap gap-6">
          {item.stats.map((s) => (
            <div key={s.label}>
              <p className={`text-2xl font-medium tracking-tight ${ink}`}>{s.value}</p>
              <p className={`text-xs ${muted}`}>{s.label}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Steps through the items: each moves on when its reel has played through, unless the visitor
// is reading or hovering, in which case the reel loops and waits for them.
export function useAutoAdvance(count: number) {
  const [index, setIndex] = useState(0)
  const [hold, setHold] = useState(false)
  const holdRef = useRef(hold)
  holdRef.current = hold
  const go = useCallback((i: number) => setIndex(((i % count) + count) % count), [count])
  const step = useCallback((by: number) => setIndex((i) => (((i + by) % count) + count) % count), [count])
  const onCycle = useCallback(() => { if (!holdRef.current) setIndex((i) => (i + 1) % count) }, [count])
  return { index, go, step, onCycle, hold, setHold }
}

// Esc closes an overlay, and the page behind it doesn't scroll
export function useOverlay(open: boolean, close: () => void) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
    window.addEventListener('keydown', onKey)
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = overflow }
  }, [open, close])
}

// The muted section label the homepage uses
export function SectionLabel({ children, right, borders }: { children: ReactNode; right?: ReactNode; borders: boolean }) {
  return (
    <div className={`flex items-center justify-between gap-4 px-8 ${borders ? 'py-4 border-b border-border' : 'pt-8 pb-4'}`}>
      <div className="flex items-baseline gap-3 min-w-0">{children}</div>
      {right}
    </div>
  )
}

// A progress bar that fills over `seconds`, restarting when its key changes
export function Progress({ seconds, active, color, className = '' }: { seconds: number; active: boolean; color?: string; className?: string }) {
  return (
    <span className={`block h-full origin-left ${className}`} style={{
      background: color ?? 'var(--accent)',
      transform: active ? undefined : 'scaleX(0)',
      animation: active ? `showcase-progress ${seconds}s linear forwards` : undefined,
    }} />
  )
}

export const SHOWCASE_CSS = `
  @keyframes showcase-progress { from { transform: scaleX(0) } to { transform: scaleX(1) } }
  @keyframes showcase-marquee { from { transform: translateX(0) } to { transform: translateX(-50%) } }
`
