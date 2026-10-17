'use client'

import { createContext, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { WorkReel } from '@/components/showcase/shared'
import { projects } from '@/content/projects'
import { SCREENS, mixed } from '@/content/screens'
import type { Testimonial } from '@/content/testimonials'
import type { WorkItem } from '@/content/work'
import { QuoteCell } from '../mosaic/Quote'
import { useReducedMotion } from '../shared'

// The pieces of the products page: the reel that plays one at a time, the app icon, a quote
// called out beside the work, and a slim strip of screens.

// ---------------------------------------------------------------------------------------------
// One reel at a time. The card under the pointer plays; otherwise the first one near the middle
// of the screen does. Everything else shows its poster.

interface Reels { active: string | null; hover: (id: string | null) => void; near: (id: string, on: boolean) => void }
const ReelContext = createContext<Reels>({ active: null, hover: () => {}, near: () => {} })

export function ReelHost({ order, children }: { order: string[]; children: ReactNode }) {
  const [hovered, setHovered] = useState<string | null>(null)
  const [nearby, setNearby] = useState<Record<string, boolean>>({})
  const value = useMemo<Reels>(() => ({
    active: hovered ?? order.find((id) => nearby[id]) ?? null,
    hover: setHovered,
    near: (id, on) => setNearby((n) => (n[id] === on ? n : { ...n, [id]: on })),
  }), [hovered, nearby, order])
  return <ReelContext.Provider value={value}>{children}</ReelContext.Provider>
}

export const useReels = () => useContext(ReelContext)

// The piece's reel, or its poster while another one plays
export function Stage({ item, className = '', radius = 12, glow = true }: { item: WorkItem; className?: string; radius?: number; glow?: boolean }) {
  const { active, near } = useReels()
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => near(item.id, e.isIntersecting), { rootMargin: '-30% 0px -30% 0px' })
    io.observe(el)
    return () => { io.disconnect(); near(item.id, false) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.id])
  // With reduced motion the still stands in for the reel
  const reduced = useReducedMotion()
  const playing = active === item.id && !reduced
  return (
    <div ref={ref} className={`relative w-full overflow-hidden ${className}`} style={{
      aspectRatio: '16 / 10',
      borderRadius: radius,
      boxShadow: `0 0 0 1px color-mix(in srgb, ${item.accent} 26%, var(--border))${glow ? `, 0 28px 70px -30px ${item.accent}77` : ''}`,
    }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={item.poster} alt={item.title} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
      <AnimatePresence>
        {playing && (
          <motion.div key="reel" className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
            <WorkReel item={item} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ---------------------------------------------------------------------------------------------
// The product's app icon, Mac App Store style: a rounded square with a hairline and a soft shadow

export const productOf = (item: WorkItem) => projects.find((p) => p.id === item.id)

export function AppIcon({ item, size = 52 }: { item: WorkItem; size?: number }) {
  const logo = productOf(item)?.logo
  if (!logo) return null
  return (
    <span
      className="relative block shrink-0 overflow-hidden"
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.225,
        boxShadow: `0 1px 2px rgba(0,0,0,.18), 0 8px 20px -8px ${item.accent}99, 0 4px 12px -6px rgba(0,0,0,.35)`,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={logo} alt={`${item.name} app icon`} width={size} height={size} className="block h-full w-full" />
      <span aria-hidden className="pointer-events-none absolute inset-0" style={{ borderRadius: 'inherit', boxShadow: 'inset 0 0 0 1px color-mix(in srgb, var(--foreground) 12%, transparent)' }} />
    </span>
  )
}

// Live, or on the waitlist: as the product's own page says
export function Status({ item }: { item: WorkItem }) {
  const status = productOf(item)?.status
  if (!status) return null
  const live = status === 'Live'
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] leading-4 text-muted" style={{ boxShadow: 'inset 0 0 0 1px var(--border)' }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: live ? '#22c55e' : 'var(--muted)' }} />
      {status}
    </span>
  )
}

// ---------------------------------------------------------------------------------------------
// A colleague's words, called out beside the work. It pops and its best phrases get a marker as
// it scrolls into view; hover, focus or tap opens the whole quote.

export function Callout({ t, colour, font = 24, anchor = { x: 'left', y: 'top' }, reduced, className = '', minHeight, popWidth = 420 }: {
  t: Testimonial
  colour: string
  font?: number
  anchor?: { x: 'left' | 'right'; y: 'top' | 'bottom' }
  reduced: boolean
  className?: string
  minHeight?: number
  popWidth?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ w: 0, h: 0 })
  const [seen, setSeen] = useState(reduced)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const measure = () => setSize({ w: el.clientWidth, h: el.clientHeight })
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  useEffect(() => {
    const el = ref.current
    if (!el || seen) return
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect() } }, { rootMargin: '0px 0px -12% 0px' })
    io.observe(el)
    return () => io.disconnect()
  }, [seen])
  useEffect(() => { if (reduced) setSeen(true) }, [reduced])
  return (
    <div
      ref={ref}
      className={`pk-callout pk-reveal relative ${className}`}
      style={{ minHeight }}
      data-marked={seen}
      data-seen={seen || reduced}
    >
      {size.w > 0 && (
        <QuoteCell
          t={t}
          colour={colour}
          w={size.w}
          h={size.h}
          size="lg"
          font={font}
          detail
          pad={size.w > 600 ? 32 : 24}
          anchor={anchor}
          locked={seen}
          delay={0.2}
          pop={!reduced}
          popWidth={Math.min(popWidth, Math.max(size.w, 320))}
        />
      )}
    </div>
  )
}

// Rises into place the first time it scrolls into view. Plain CSS, so with reduced motion it is
// simply there.
export function Reveal({ children, className = '', delay = 0, reduced, style, onMouseEnter, onMouseLeave }: {
  children: ReactNode
  className?: string
  delay?: number
  reduced: boolean
  style?: React.CSSProperties
  onMouseEnter?: () => void
  onMouseLeave?: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [seen, setSeen] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el || seen) return
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect() } }, { rootMargin: '0px 0px -60px 0px' })
    io.observe(el)
    return () => io.disconnect()
  }, [seen])
  return (
    <div ref={ref} className={`pk-reveal ${className}`} data-seen={seen || reduced} style={{ ...style, transitionDelay: `${delay}s` }} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      {children}
    </div>
  )
}

// ---------------------------------------------------------------------------------------------
// The eye test, kept short: a strip of screens drifting past, every project in the mix

const STRIP = mixed(SCREENS.filter((s) => !s.video)).slice(0, 34)

export function Strip({ height, reduced }: { height: number; reduced: boolean }) {
  const tiles = reduced ? STRIP : [...STRIP, ...STRIP]
  return (
    <div
      className="pk-strip relative overflow-hidden"
      role="img"
      aria-label={`A strip of ${STRIP.length} screens from the work`}
      style={{ maskImage: 'linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent)', WebkitMaskImage: 'linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent)' }}
    >
      <div className="pk-strip-track flex w-max gap-3" style={{ animation: reduced ? undefined : 'pk-marquee 150s linear infinite' }}>
        {tiles.map((s, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={`${s.id}-${i}`}
            src={s.src}
            alt=""
            width={Math.round((height * s.w) / s.h)}
            height={height}
            loading={i < 16 ? 'eager' : 'lazy'}
            decoding="async"
            draggable={false}
            className="block shrink-0 rounded-lg object-cover"
            style={{ height, width: Math.round((height * s.w) / s.h), boxShadow: '0 0 0 1px color-mix(in srgb, var(--foreground) 9%, transparent)' }}
          />
        ))}
      </div>
    </div>
  )
}

export const PARTS_CSS = `
  @keyframes pk-marquee { from { transform: translateX(0) } to { transform: translateX(-50%) } }
  .pk-strip:hover .pk-strip-track { animation-play-state: paused; }
  .pk-callout:has(.mz-quote[data-open="true"]) { z-index: 40; }
  .pk-reveal { transition: opacity .7s cubic-bezier(.2,.8,.2,1), transform .7s cubic-bezier(.2,.8,.2,1); }
  .pk-reveal[data-seen="false"] { opacity: 0; transform: translateY(24px); }
  @media (prefers-reduced-motion: reduce) { .pk-reveal { transition: none; } .pk-reveal[data-seen="false"] { opacity: 1; transform: none; } }
`
