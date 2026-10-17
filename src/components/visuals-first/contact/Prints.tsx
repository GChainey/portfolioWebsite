'use client'

import { useEffect, useRef, useState, useCallback, type CSSProperties } from 'react'
import { AnimatePresence, motion, useInView, useScroll, useSpring, useTransform } from 'framer-motion'
import { CASE_STUDIES, PRODUCTS, type WorkItem } from '@/content/work'
import { WorkLink, WorkReel, pad } from '@/components/showcase/shared'
import { FRAMES, frameNo } from './Sheet'
import { Bracket, Circled, Dash } from './pen'

// The work, lifted off the sheet as prints: the three AI case studies big, the products smaller,
// three across. Each has the editor's notes beside it in red pen: the numbers circled, the
// features ticked off, the thinking bracketed in the margin. Only one reel plays at a time.

// The frame on the sheet each piece was printed from
const fromFrame = (w: WorkItem) => {
  const project = w.id === 'html-brand-website' ? 'Enterprise AI' : w.name
  const i = FRAMES.findIndex((f) => f.project === project && f.best)
  return i < 0 ? null : frameNo(i)
}

// A print: white border, sitting on the sheet, then lifted and turned a little as it scrolls in
function Print({ item, live, rotate, progress, onCycle, size = 'lg', reduced }: { item: WorkItem; live: boolean; rotate: number; progress: ReturnType<typeof useSpring>; onCycle?: () => void; size?: 'lg' | 'sm'; reduced: boolean }) {
  const r = useTransform(progress, [0, 1], [0, rotate])
  const y = useTransform(progress, [0, 1], [size === 'lg' ? 70 : 40, 0])
  const scale = useTransform(progress, [0, 1], [0.955, 1])
  const lift = useTransform(progress, [0, 1], [0.15, 1])
  const frame = fromFrame(item)
  const border = size === 'lg' ? 'p-[10px] pb-[34px] sm:p-[14px] sm:pb-[40px]' : 'p-[8px] pb-[28px] sm:p-[10px] sm:pb-[30px]'
  return (
    <motion.div className="relative" style={reduced ? { rotate } : { rotate: r, y, scale }}>
      {/* Lifted: a soft shadow that grows as the print leaves the sheet */}
      <motion.div aria-hidden className="absolute inset-0" style={{ boxShadow: 'var(--lift)', opacity: reduced ? 1 : lift }} />
      <div className={`relative bg-white ${border}`} style={{ boxShadow: 'var(--rest)' }}>
        <div className="relative overflow-hidden bg-[#f6f6f5]" style={{ aspectRatio: '16 / 10' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.poster} alt={`${item.name}: ${item.title}`} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover" />
          <AnimatePresence>
            {live && (
              <motion.div key="reel" className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }}>
                <WorkReel item={item} theme="light" onCycle={onCycle} />
              </motion.div>
            )}
          </AnimatePresence>
          <WorkLink item={item} className="absolute inset-0 z-10" tabIndex={-1}>
            <span className="sr-only">{item.cta}</span>
          </WorkLink>
        </div>
        {/* Written on the border */}
        <div className={`absolute inset-x-0 bottom-0 flex items-center justify-between ${size === 'lg' ? 'h-[34px] px-[10px] sm:h-[40px] sm:px-[14px]' : 'h-[28px] px-[8px] sm:h-[30px] sm:px-[10px]'}`}>
          <span className="flex items-center gap-2 font-mono text-[9.5px] uppercase tracking-[0.14em] text-[#8f8f8a]">
            <span className="h-1.5 w-1.5 rounded-full transition-colors duration-500" style={{ background: live ? '#22c55e' : '#d4d4d0' }} />
            {live ? 'Playing' : item.kicker}
          </span>
          {frame && <span className="text-[19px] leading-none" style={{ fontFamily: 'var(--font-signature), cursive', color: '#d4322a', transform: 'rotate(-3deg)' }}>{frame}</span>}
        </div>
      </div>
    </motion.div>
  )
}

// How far a piece has lifted off the sheet, 0 to 1, with a little give
function useLift(target: React.RefObject<HTMLElement>, offset: [string, string] = ['start end', 'start 0.3']) {
  const { scrollYProgress } = useScroll({ target, offset: offset as never })
  return useSpring(scrollYProgress, { stiffness: 140, damping: 26, mass: 0.6 })
}

// A case study: the print big, the notes beside it
function Chapter({ item, index, live, register, reduced, wide, inset }: { item: WorkItem; index: number; live: boolean; register: (el: HTMLElement | null) => void; reduced: boolean; wide: boolean; inset: number }) {
  const ref = useRef<HTMLElement>(null)
  const notes = useRef<HTMLDivElement>(null)
  const on = useInView(notes, { once: true, margin: '0px 0px -22% 0px' })
  const thinking = useRef<HTMLDivElement>(null)
  const [tH, setTH] = useState(80)
  useEffect(() => {
    const el = thinking.current
    if (!el) return
    const ro = new ResizeObserver(() => setTH(el.offsetHeight))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  const progress = useLift(ref)
  const flip = index % 2 === 1
  const rotate = [-1, 0.9, -0.7][index] ?? -0.8

  // On a wide screen the print stays in the middle of the screen while its notes pass, and
  // reaches out past the page's column towards the window's edge
  const reach = wide ? Math.max(0, inset - 48) : 0
  return (
    <article
      ref={(el) => { (ref as React.MutableRefObject<HTMLElement | null>).current = el; register(el) }}
      className={`grid gap-10 py-14 sm:py-20 lg:gap-16 lg:py-0 ${wide ? (flip ? 'lg:grid-cols-[minmax(300px,400px)_minmax(0,1fr)]' : 'lg:grid-cols-[minmax(0,1fr)_minmax(300px,400px)]') : ''}`}
    >
      <div className={wide && flip ? 'lg:order-2' : ''} style={wide ? (flip ? { marginRight: -reach } : { marginLeft: -reach }) : undefined}>
        <div className={wide ? 'sticky top-14 flex h-[calc(100vh-56px)] items-center' : ''}>
          <div className="w-full">
            <Print item={item} live={live} rotate={wide ? rotate : rotate * 0.6} progress={progress} reduced={reduced} />
          </div>
        </div>
      </div>

      <div ref={notes} className={`min-w-0 ${wide ? 'lg:py-[22vh]' : ''} ${wide && flip ? 'lg:order-1' : ''}`}>
        <p className="mb-4 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em]" style={{ color: item.accent }}>
          <span>{pad(index + 1)}</span>
          <span className="h-px w-6" style={{ background: item.accent }} />
          {item.kicker}
        </p>
        <h3 className="text-balance text-3xl font-medium tracking-tight text-foreground sm:text-[34px] sm:leading-[1.15]">{item.title}</h3>
        <p className="mt-3 text-muted">{item.summary}</p>

        {item.stats && (
          <div className="mt-9 flex flex-wrap gap-x-12 gap-y-8">
            {item.stats.map((s, i) => (
              <div key={s.label} className="max-w-[220px]">
                <Circled on={on} seed={`${item.id}-${s.label}`} delay={0.2 + i * 0.35} pad={12} width={2.2} reduced={reduced}>
                  <span className="block whitespace-nowrap px-1 text-5xl font-medium tracking-tight text-foreground tabular-nums">{s.value}</span>
                </Circled>
                <p className="mt-4 text-sm text-muted">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        <ul className="mt-9 space-y-3">
          {item.features.map((f, i) => (
            <li key={f} className="flex gap-3 text-[15px] leading-relaxed text-foreground">
              <span className="mt-[7px]"><Dash seed={`${item.id}-${i}`} on={on} delay={0.7 + i * 0.12} reduced={reduced} /></span>
              <span>{f}</span>
            </li>
          ))}
        </ul>

        <div className="relative mt-9 pl-6">
          <span className="absolute left-0 top-0"><Bracket seed={`${item.id}-b`} on={on} delay={1.2} height={tH} reduced={reduced} /></span>
          <div ref={thinking}>
            <p className="cs-hand mb-2 text-[22px]" style={{ transform: 'rotate(-2deg)', transformOrigin: 'left' }}>the thinking</p>
            <p className="text-[15px] leading-relaxed text-muted">{item.thinking}</p>
          </div>
        </div>

        <WorkLink item={item} className="mt-9 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm text-foreground transition-colors hover:text-accent" style={{ boxShadow: 'inset 0 0 0 1px var(--paper-line), 0 1px 0 var(--paper-line)', background: 'color-mix(in srgb, var(--paper) 60%, var(--background))' } as CSSProperties} />
      </div>
    </article>
  )
}

// A product: a smaller print, its notes under it
function ProductCard({ item, index, live, progress, onCycle, onHover, register, reduced, row }: { item: WorkItem; index: number; live: boolean; progress: ReturnType<typeof useSpring>; onCycle: () => void; onHover: (i: number | null) => void; register: (el: HTMLElement | null) => void; reduced: boolean; row: boolean }) {
  const notes = useRef<HTMLDivElement>(null)
  const on = useInView(notes, { once: true, margin: '0px 0px -12% 0px' })
  const p = useTransform(progress, (v) => Math.min(1, Math.max(0, (v - index * 0.1) / 0.8)))
  const rotate = [-1.2, 0.8, -0.5][index] ?? 0
  return (
    <article ref={register} onMouseEnter={() => onHover(index)} onMouseLeave={() => onHover(null)} className="min-w-0">
      <Print item={item} live={live} rotate={row ? rotate : rotate * 0.6} progress={p as ReturnType<typeof useSpring>} onCycle={onCycle} size="sm" reduced={reduced} />
      <div ref={notes} className="mt-7 px-1">
        <p className="mb-2 font-mono text-[10.5px] uppercase tracking-[0.16em]" style={{ color: item.accent }}>{item.kicker}</p>
        <h3 className="text-xl font-medium tracking-tight text-foreground">{item.name}</h3>
        <p className="mt-1 text-[15px] text-foreground">{item.title}</p>
        <p className="mt-2 text-sm leading-relaxed text-muted">{item.summary}</p>
        {item.stats?.map((s, i) => (
          <div key={s.label} className="mt-6 flex items-center gap-4">
            <Circled on={on} seed={`${item.id}-${s.label}`} delay={0.3 + i * 0.3} pad={9} width={2} reduced={reduced}>
              <span className="block whitespace-nowrap px-0.5 text-2xl font-medium tracking-tight text-foreground tabular-nums">{s.value}</span>
            </Circled>
            <span className="text-sm text-muted">{s.label}</span>
          </div>
        ))}
        <WorkLink item={item} className="mt-6 inline-flex items-center gap-1.5 text-sm text-foreground transition-colors hover:text-accent" />
      </div>
    </article>
  )
}

export function Prints({ gutter, width, reduced }: { gutter: number; width: number; reduced: boolean }) {
  const wide = width >= 1024
  const row = width >= 768
  const inset = width < 640 ? 20 : gutter + 32

  // Which piece is nearest the middle of the screen: the only one whose reel is mounted
  const els = useRef<(HTMLElement | null)[]>([])
  const [active, setActive] = useState(-1)
  useEffect(() => {
    let raf = 0
    const tick = () => {
      raf = 0
      const mid = innerHeight / 2
      let best = -1, dist = Infinity
      els.current.forEach((el, i) => {
        if (!el) return
        const r = el.getBoundingClientRect()
        const d = Math.abs(r.top + r.height / 2 - mid)
        if (r.bottom > innerHeight * 0.15 && r.top < innerHeight * 0.85 && d < dist) { best = i; dist = d }
      })
      setActive(best)
    }
    const on = () => { if (!raf) raf = requestAnimationFrame(tick) }
    on()
    window.addEventListener('scroll', on, { passive: true })
    window.addEventListener('resize', on)
    return () => { window.removeEventListener('scroll', on); window.removeEventListener('resize', on); cancelAnimationFrame(raf) }
  }, [])

  // The products take turns, one reel after another, unless you're pointing at one
  const [turn, setTurn] = useState(0)
  const [hovered, setHovered] = useState<number | null>(null)
  const next = useCallback(() => setTurn((t) => (t + 1) % PRODUCTS.length), [])
  const productsActive = active >= 3
  const liveProduct = !productsActive ? -1 : row ? hovered ?? turn : active - 3

  const productsRef = useRef<HTMLDivElement>(null)
  const productsLift = useLift(productsRef, ['start end', 'start 0.35'])

  return (
    <div style={{ paddingLeft: inset, paddingRight: inset }}>
      <div className="mx-auto max-w-[1216px] pt-16 sm:pt-24">
        <p className="mb-6 text-xs uppercase tracking-widest text-muted">The selects, printed</p>
        <h2 className="max-w-3xl text-balance text-3xl font-medium tracking-tight text-foreground sm:text-[40px] sm:leading-[1.12]">I help scale-ups create high quality prototypes to win deals.</h2>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">My role has transformed—I now orchestrate AI tools to multiply output and deliver 10× the impact.</p>

        <div className="mt-6 sm:mt-10">
          {CASE_STUDIES.map((w, i) => (
            <Chapter key={w.id} item={w} index={i} live={active === i} register={(el) => { els.current[i] = el }} reduced={reduced} wide={wide} inset={inset} />
          ))}
        </div>

        <div className="pb-20 pt-10 sm:pb-28 sm:pt-16">
          <div className="mb-10 flex items-baseline justify-between gap-6" style={{ borderTop: '1px solid var(--paper-line)', paddingTop: 20 }}>
            <p className="text-xs uppercase tracking-widest text-muted">Three products I built and shipped</p>
          </div>
          <div ref={productsRef} className={`grid gap-14 ${row ? 'grid-cols-3 gap-8 lg:gap-12' : ''}`}>
            {PRODUCTS.map((w, i) => (
              <ProductCard
                key={w.id}
                item={w}
                index={i}
                live={liveProduct === i}
                progress={productsLift}
                onCycle={next}
                onHover={(h) => { setHovered(h); if (h !== null) setTurn(h) }}
                register={(el) => { els.current[3 + i] = el }}
                reduced={reduced}
                row={row}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
