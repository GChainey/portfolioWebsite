'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Facehash } from 'facehash'
import { ArrowUpRight } from 'lucide-react'
import { CompanyLogo } from '@/components/CompanyLogo'
import type { Testimonial } from '@/content/testimonials'
import { Highlighted } from '../shared'

// A colleague's words as a tile of the mosaic: the line that carries the quote, big, on a tint of
// the work beside it. When the mosaic locks it pops and the best phrases get a marker. Hover,
// focus or tap and the whole quote grows out of the tile.

const tint = (colour: string, pct: number, base = 'var(--background)') => `color-mix(in srgb, ${colour} ${pct}%, ${base})`

export function QuoteCell({ t, colour, w, h, size, anchor, locked, delay = 0, popWidth = 400, font, pop = true, detail = false, pad }: {
  t: Testimonial
  colour: string
  w: number
  h: number
  size: 'lg' | 'sm'
  anchor: { x: 'left' | 'right'; y: 'top' | 'bottom' }
  locked: boolean
  delay?: number
  popWidth?: number
  font?: number
  pop?: boolean // the little overshoot when the mosaic locks
  detail?: boolean // a bigger callout: avatar, name and role under the line
  pad?: number
}) {
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  // The pull, marked where it holds one of the highlights
  const pull = { content: t.pull, highlights: t.highlights }
  const lg = size === 'lg'
  const pw = Math.max(w, popWidth)

  // A tap outside closes it
  useEffect(() => {
    if (!open) return
    const off = (e: PointerEvent) => { if (!root.current?.contains(e.target as Node)) setOpen(false) }
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('pointerdown', off)
    window.addEventListener('keydown', key)
    return () => { window.removeEventListener('pointerdown', off); window.removeEventListener('keydown', key) }
  }, [open])

  // The popover starts clipped to the tile's own box, at the same corner, and opens out
  const hidden = anchor.x === 'left'
    ? `inset(${anchor.y === 'top' ? '0px' : `calc(100% - ${h}px)`} calc(100% - ${w}px) ${anchor.y === 'top' ? `calc(100% - ${h}px)` : '0px'} 0px round 8px)`
    : `inset(${anchor.y === 'top' ? '0px' : `calc(100% - ${h}px)`} 0px ${anchor.y === 'top' ? `calc(100% - ${h}px)` : '0px'} calc(100% - ${w}px) round 8px)`

  return (
    <div
      ref={root}
      className="mz-quote absolute inset-0"
      data-open={open}
      onMouseEnter={() => locked && setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => locked && setOpen(true)}
      onBlur={(e) => { if (!root.current?.contains(e.relatedTarget as Node)) setOpen(false) }}
    >
      <motion.button
        type="button"
        aria-expanded={open}
        aria-label={`${t.name}, ${t.role}: “${t.pull}” Show the whole quote`}
        onClick={() => setOpen((o) => !o)}
        className="absolute inset-0 flex flex-col justify-between overflow-hidden rounded-lg text-left outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        style={{
          background: tint(colour, 13),
          boxShadow: `inset 0 0 0 1px ${tint(colour, 28)}`,
          padding: pad ?? (lg ? Math.round(Math.min(22, h * 0.12)) : Math.round(Math.min(16, h * 0.09))),
          ['--tw-ring-color' as string]: colour,
          ['--tw-ring-offset-color' as string]: 'var(--background)',
        }}
        animate={locked && pop ? { scale: [1, 1.045, 0.99, 1] } : { scale: 1 }}
        transition={locked ? { duration: 0.75, times: [0, 0.35, 0.7, 1], ease: 'easeOut', delay } : { duration: 0.2 }}
      >
        <span aria-hidden className="block leading-none font-serif" style={{ color: colour, fontSize: detail ? 48 : lg ? 30 : 24, height: detail ? 22 : lg ? 14 : 11 }}>“</span>
        <span
          className="block text-foreground tracking-tight text-balance"
          style={{ fontSize: font ?? (lg ? Math.round(Math.min(21, Math.max(15, w / 17))) : Math.round(Math.min(16, Math.max(13, w / 10.5)))), lineHeight: 1.25, fontWeight: 500 }}
        >
          <Highlighted t={pull} mark={(text, i) => (
            <span className="mz-mark" style={{ ['--mark' as string]: tint(colour, 42, 'transparent'), ['--d' as string]: `${delay + 0.25 + i * 0.15}s` }}>{text}</span>
          )} />
        </span>
        {detail ? (
          <span className="flex items-center gap-3">
            <Facehash name={t.name} size={32} showInitial interactive={false} intensity3d="subtle" style={{ backgroundColor: tint(colour, 55), borderRadius: '9999px', flexShrink: 0 }} />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-foreground">{t.name}</span>
              <span className="block truncate text-xs text-muted">{t.role}</span>
            </span>
            {t.logo && <CompanyLogo id={t.logo} className="shrink-0 text-muted opacity-80" />}
          </span>
        ) : (
          <span className="flex items-center justify-between gap-2 text-muted" style={{ fontSize: 12 }}>
            <span className="truncate">{t.name}</span>
            {t.logo && lg && <CompanyLogo id={t.logo} className="opacity-70 scale-[0.8] origin-right" />}
          </span>
        )}
      </motion.button>

      {/* The whole quote, grown out of the tile */}
      <div
        className="mz-pop absolute z-10 rounded-xl"
        aria-hidden={!open}
        style={{
          width: pw,
          [anchor.x]: 0,
          [anchor.y]: 0,
          background: tint(colour, 10, 'var(--background)'),
          boxShadow: `inset 0 0 0 1px ${tint(colour, 30)}, 0 24px 60px -12px rgba(0,0,0,.45), 0 8px 20px -8px rgba(0,0,0,.25)`,
          clipPath: open ? 'inset(0px 0px 0px 0px round 12px)' : hidden,
          opacity: open ? 1 : 0,
          visibility: open ? 'visible' : 'hidden',
          transition: open
            ? 'clip-path .45s cubic-bezier(.2,.8,.2,1), opacity .15s linear, visibility 0s'
            : 'clip-path .3s cubic-bezier(.4,0,.2,1), opacity .25s linear .05s, visibility 0s linear .3s',
        }}
      >
        <div className="p-6" style={{ minHeight: h }}>
          <div className="flex items-center gap-3 mb-4">
            <Facehash
              name={t.name}
              size={36}
              showInitial
              interactive={false}
              intensity3d="subtle"
              style={{ backgroundColor: tint(colour, 55), borderRadius: '9999px', flexShrink: 0 }}
            />
            <div className="min-w-0 flex-1">
              {t.linkedIn ? (
                <a href={t.linkedIn} target="_blank" rel="noopener noreferrer" tabIndex={open ? 0 : -1} className="group/l inline-flex items-center gap-1 text-sm font-medium text-foreground hover:underline underline-offset-4">
                  {t.name}
                  <ArrowUpRight className="w-3.5 h-3.5 text-muted group-hover/l:text-foreground transition-colors" />
                </a>
              ) : (
                <p className="text-sm font-medium text-foreground">{t.name}</p>
              )}
              <p className="text-xs text-muted">{t.role} · {t.company}</p>
            </div>
          </div>
          <p className="text-[15px] leading-relaxed text-muted">
            <Highlighted t={t} mark={(text) => <span className="text-foreground font-medium">{text}</span>} />
          </p>
          {t.logo && (
            <div className="mt-5 pt-4 border-t text-muted" style={{ borderColor: tint(colour, 22) }}>
              <CompanyLogo id={t.logo} className="opacity-80" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export const QUOTE_CSS = `
  .mz-mark {
    background-image: linear-gradient(var(--mark), var(--mark));
    background-repeat: no-repeat;
    background-position: 0 92%;
    background-size: 0% 0.42em;
    box-decoration-break: clone;
    -webkit-box-decoration-break: clone;
    transition: background-size .8s cubic-bezier(.2,.7,.2,1) var(--d, 0s);
  }
  [data-marked="true"] .mz-mark { background-size: 100% 0.42em; }
  .mz-quote[data-open="true"] { z-index: 70; }
`
