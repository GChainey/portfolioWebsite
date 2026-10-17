'use client'

import { createRef, useEffect, useMemo, useState, type RefObject } from 'react'
import { motion, useScroll, useSpring } from 'framer-motion'
import { Play } from 'lucide-react'
import { CASE_STUDIES, PRODUCTS, type WorkItem } from '@/content/work'
import { WorkLink, WorkReel, pad } from '@/components/showcase/shared'
import { useInView } from '../shared'

// The work that mattered, presented: each case study a slide, its frame selected the way a
// Figma frame is, the live replay playing in it while it's the one on screen. Then the three
// products, smaller, as a row of frames.

export const DOTS = {
  backgroundColor: 'color-mix(in srgb, var(--foreground) 2.5%, var(--background))',
  backgroundImage: 'radial-gradient(circle, color-mix(in srgb, var(--foreground) 15%, transparent) 1px, transparent 1.3px)',
  backgroundSize: '20px 20px',
} as const

// A frame's name above it, as the canvas shows one
function FrameLabel({ item, right }: { item: WorkItem; right: string }) {
  return (
    <div className="mb-2 flex items-center justify-between gap-3 text-[11px]">
      <span className="flex min-w-0 items-center gap-1.5 text-muted">
        <svg viewBox="0 0 12 12" className="h-2.5 w-2.5 shrink-0" aria-hidden><path d="M3 0v12M9 0v12M0 3h12M0 9h12" stroke="currentColor" strokeWidth="1.2" fill="none" /></svg>
        <span className="truncate">{item.name}</span>
      </span>
      <span className="shrink-0 font-mono text-[10px] text-muted">{right}</span>
    </div>
  )
}

// Figma's selection: an outline in the piece's colour, square handles, and the size under it
function Selection({ colour, on }: { colour: string; on: boolean }) {
  return (
    <motion.div className="pointer-events-none absolute inset-0" initial={false} animate={{ opacity: on ? 1 : 0 }} transition={{ duration: 0.35 }} aria-hidden>
      <div className="absolute -inset-px" style={{ boxShadow: `0 0 0 1.5px ${colour}` }} />
      {[[0, 0], [1, 0], [0, 1], [1, 1]].map(([x, y]) => (
        <span key={`${x}${y}`} className="absolute h-2 w-2 bg-white" style={{ left: `calc(${x * 100}% - 4px)`, top: `calc(${y * 100}% - 4px)`, boxShadow: `0 0 0 1.5px ${colour}` }} />
      ))}
      <span className="absolute left-1/2 top-[calc(100%+10px)] -translate-x-1/2 rounded-[4px] px-1.5 py-px font-mono text-[10px] text-white" style={{ background: colour }}>1600 × 1000</span>
    </motion.div>
  )
}

function Slide({ item, index, active, near, at }: { item: WorkItem; index: number; active: boolean; near: boolean; at: RefObject<HTMLElement> }) {
  return (
    <article
      id={`cv-${item.id}`}
      ref={at}
      data-index={index}
      className="grid scroll-mt-[112px] border-b border-border lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]"
    >
      {/* The frame, on the canvas */}
      <div className="relative flex flex-col justify-center border-b border-border px-5 pb-12 pt-8 sm:px-10 lg:border-b-0 lg:border-r lg:px-12 lg:pb-16 lg:pt-12" style={DOTS}>
        <FrameLabel item={item} right={`Case study ${pad(index + 1)}`} />
        <div className="relative">
          <div className="relative overflow-hidden bg-card" style={{ aspectRatio: '16 / 10', boxShadow: '0 0 0 1px color-mix(in srgb, var(--foreground) 10%, transparent), 0 30px 60px -30px rgba(0,0,0,0.5)' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.poster} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" decoding="async" />
            {active && near && (
              <motion.div className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.3 }}>
                <WorkReel item={item} />
              </motion.div>
            )}
          </div>
          <Selection colour={item.accent} on={active} />
        </div>
      </div>

      {/* The read */}
      <div className="flex flex-col justify-center px-6 py-10 sm:px-10 lg:px-12 lg:py-14">
        <p className="mb-4 flex items-center gap-2 text-xs uppercase tracking-widest" style={{ color: item.accent }}>
          <span className="font-mono">{pad(index + 1)}</span>
          <span className="h-px w-6" style={{ background: item.accent }} />
          <span className="truncate">{item.kicker}</span>
        </p>
        <h3 className="mb-3 text-balance text-3xl font-medium tracking-tight text-foreground xl:text-[2.125rem] xl:leading-[1.15]">{item.title}</h3>
        <p className="mb-8 text-muted">{item.summary}</p>
        {item.stats && (
          <div className="mb-8 flex flex-wrap gap-x-10 gap-y-5">
            {item.stats.map((s) => (
              <div key={s.label} className="min-w-0">
                <p className="text-5xl font-medium tracking-tight text-foreground tabular-nums">{s.value}</p>
                <p className="mt-1.5 max-w-[16rem] text-xs text-muted">{s.label}</p>
              </div>
            ))}
          </div>
        )}
        <ul className="mb-9 space-y-2.5 border-t border-border pt-6">
          {item.features.map((f, i) => (
            <li key={f} className="flex gap-3 text-sm leading-relaxed text-foreground">
              <span className="mt-0.5 shrink-0 font-mono text-xs" style={{ color: item.accent }}>{pad(i + 1)}</span>
              <span>{f}</span>
            </li>
          ))}
        </ul>
        <WorkLink item={item} className="inline-flex items-center gap-2 self-start rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-85" />
      </div>
    </article>
  )
}

// One segment of the "presenting" progress, filling as its slide passes
function Segment({ target, colour }: { target: RefObject<HTMLElement>; colour: string }) {
  const { scrollYProgress } = useScroll({ target, offset: ['start 0.6', 'end 0.6'] })
  const x = useSpring(scrollYProgress, { stiffness: 260, damping: 40 })
  return (
    <span className="relative block h-[3px] w-8 overflow-hidden rounded-full sm:w-12" style={{ background: 'color-mix(in srgb, var(--foreground) 12%, transparent)' }}>
      <motion.span className="absolute inset-0 origin-left rounded-full" style={{ background: colour, scaleX: x }} />
    </span>
  )
}

function ProductFrame({ item, index }: { item: WorkItem; index: number }) {
  const [hover, setHover] = useState(false)
  const [play, setPlay] = useState(false)
  useEffect(() => {
    if (!hover) { setPlay(false); return }
    const t = setTimeout(() => setPlay(true), 350)
    return () => clearTimeout(t)
  }, [hover])
  return (
    <div className="flex flex-col border-b border-border sm:border-b-0 sm:[&:not(:last-child)]:border-r" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <div className="px-5 pb-8 pt-6 sm:px-6" style={DOTS}>
        <FrameLabel item={item} right={`Product ${pad(index + 1)}`} />
        <WorkLink item={item} className="relative block">
          <div className="relative overflow-hidden bg-card" style={{ aspectRatio: '16 / 10', boxShadow: '0 0 0 1px color-mix(in srgb, var(--foreground) 10%, transparent), 0 20px 40px -24px rgba(0,0,0,0.5)' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.poster} alt={item.title} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]" loading="lazy" decoding="async" />
            {play && <div className="pointer-events-none absolute inset-0"><WorkReel item={item} captions={false} /></div>}
          </div>
          <Selection colour={item.accent} on={hover} />
        </WorkLink>
      </div>
      <div className="flex flex-1 flex-col border-t border-border px-5 py-6 sm:px-6">
        <h4 className="text-lg font-medium tracking-tight text-foreground text-balance">{item.title}</h4>
        <p className="mt-1.5 text-sm text-muted">{item.summary}</p>
        {item.stats && (
          <p className="mt-4 flex items-baseline gap-2">
            <span className="text-2xl font-medium tracking-tight text-foreground">{item.stats[0].value}</span>
            <span className="text-xs text-muted">{item.stats[0].label}</span>
          </p>
        )}
        <WorkLink item={item} className="mt-auto inline-flex items-center gap-1.5 self-start pt-5 text-sm text-foreground hover:text-accent transition-colors" />
      </div>
    </div>
  )
}

export function Presented() {
  const refs = useMemo(() => CASE_STUDIES.map(() => createRef<HTMLElement>()), [])
  const [active, setActive] = useState(0)
  const [wrap, near] = useInView<HTMLDivElement>('300px')

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.index)) }),
      { rootMargin: '-45% 0px -45% 0px' },
    )
    refs.forEach((r) => r.current && io.observe(r.current))
    return () => io.disconnect()
  }, [refs])

  const item = CASE_STUDIES[active]

  return (
    <>
      <section id="work" aria-label="Case studies" className="border-b border-border">
        {/* Presenting: where you are in the three */}
        <div className="sticky top-14 z-20 flex items-center justify-between gap-4 border-b border-border bg-background px-8 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-[5px]" style={{ background: item.accent }}>
              <Play className="h-2.5 w-2.5 fill-white text-white" />
            </span>
            <p className="truncate text-xs uppercase tracking-widest text-muted">
              Presenting <span className="hidden sm:inline">· three AI case studies</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              {CASE_STUDIES.map((w, i) => (
                <button key={w.id} type="button" onClick={() => refs[i].current?.scrollIntoView({ behavior: 'smooth', block: 'start' })} aria-label={w.name} className="py-2">
                  <Segment target={refs[i]} colour={w.accent} />
                </button>
              ))}
            </div>
            <span className="font-mono text-xs tabular-nums text-muted">{pad(active + 1)} / {pad(CASE_STUDIES.length)}</span>
          </div>
        </div>
        <div ref={wrap}>
          {CASE_STUDIES.map((w, i) => (
            <Slide key={w.id} item={w} index={i} active={active === i} near={near} at={refs[i]} />
          ))}
        </div>
      </section>

      <section aria-label="Products" className="border-b border-border">
        <div className="flex items-center justify-between gap-4 border-b border-border px-8 py-4">
          <p className="text-xs uppercase tracking-widest text-muted">Products</p>
          <p className="text-xs text-muted">Three I built</p>
        </div>
        <div className="grid sm:grid-cols-3">
          {PRODUCTS.map((w, i) => <ProductFrame key={w.id} item={w} index={i} />)}
        </div>
      </section>
    </>
  )
}

