'use client'

import { useEffect, useRef, useState } from 'react'
import { animate, motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { CASE_STUDIES, PRODUCTS, type WorkItem } from '@/content/work'
import { WorkReel, WorkLink, pad } from '@/components/showcase/shared'
import { useInView } from '../shared'

// The work that mattered: the three case studies singled out of the mosaic, each opened into a
// bento of its own (the live reel, its number, what AI made possible, the thinking), then the
// three products, smaller. Only one reel plays at a time: the one nearest the middle of the screen.

const line = 'var(--border)'

// A number that counts up the first time it's seen. Words and arrows stay as written.
export function Count({ value, className, style }: { value: string; className?: string; style?: React.CSSProperties }) {
  const [ref, inView] = useInView<HTMLSpanElement>('-15% 0px', true)
  const parts = value.split(/(\d+(?:\.\d+)?)/)
  const nums = useRef<(HTMLSpanElement | null)[]>([])
  useEffect(() => {
    if (!inView) return
    const stops = parts.map((part, i) => {
      if (!/^\d/.test(part)) return null
      const el = nums.current[i]
      const to = Number(part)
      if (!el) return null
      return animate(0, to, { duration: to > 3 ? 1.4 : 0.8, ease: [0.16, 1, 0.3, 1], onUpdate: (v) => { el.textContent = String(Math.round(v)) } })
    })
    return () => stops.forEach((s) => s?.stop())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView])
  return (
    <span ref={ref} className={className} style={style} aria-label={value}>
      {parts.map((part, i) => /^\d/.test(part)
        ? <span key={i} ref={(el) => { nums.current[i] = el }} aria-hidden className="tabular-nums">0</span>
        : <span key={i} aria-hidden>{part}</span>)}
    </span>
  )
}

function CaseStudy({ item, index, playing, onNear }: { item: WorkItem; index: number; playing: boolean; onNear: (i: number, near: boolean) => void }) {
  const stage = useRef<HTMLDivElement>(null)
  // The reel opens out as it arrives, like the tile it was in the mosaic
  const { scrollYProgress } = useScroll({ target: stage, offset: ['start end', 'start 0.35'] })
  const scale = useTransform(scrollYProgress, [0, 1], [0.86, 1])
  const radius = useTransform(scrollYProgress, [0, 1], [20, 10])

  useEffect(() => {
    const el = stage.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => onNear(index, e.isIntersecting), { rootMargin: '-35% 0px -35% 0px' })
    io.observe(el)
    return () => io.disconnect()
  }, [index, onNear])

  const tint = (pct: number) => `color-mix(in srgb, ${item.accent} ${pct}%, var(--background))`
  const [first, ...rest] = item.stats ?? []

  return (
    <article className="border-b border-border" aria-labelledby={`mz-cs-${item.id}`}>
      <div className="grid lg:grid-cols-12" style={{ gap: 1, background: line }}>
        {/* Title */}
        <div className="lg:col-span-4 bg-background p-8 flex flex-col">
          <p className="flex items-center gap-2 text-xs uppercase tracking-widest mb-5" style={{ color: item.accent }}>
            <span className="font-mono">{pad(index + 1)}</span>
            <span className="h-px w-6" style={{ background: item.accent }} />
            {item.kicker}
          </p>
          <h3 id={`mz-cs-${item.id}`} className="text-3xl font-medium tracking-tight text-foreground text-balance leading-[1.1] mb-4">{item.title}</h3>
          <p className="text-muted leading-relaxed">{item.summary}</p>
          <div className="mt-auto pt-8">
            <WorkLink item={item} className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-white transition-[filter] hover:brightness-110" style={{ background: item.accent }} />
          </div>
        </div>

        {/* The reel */}
        <div className="lg:col-span-8 lg:row-span-2 bg-background p-3 sm:p-4 flex items-center" style={{ background: `radial-gradient(120% 90% at 50% 100%, ${tint(9)}, var(--background) 70%)` }}>
          <motion.div ref={stage} className="relative w-full overflow-hidden" style={{ aspectRatio: '16 / 10', scale, borderRadius: radius, boxShadow: `0 0 0 1px ${tint(30)}, 0 30px 80px -30px ${item.accent}66` }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.poster} alt={item.title} className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
            <AnimatePresence>
              {playing && (
                <motion.div key="reel" className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
                  <WorkReel item={item} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* The number */}
        <div className="lg:col-span-4 bg-background p-8 flex flex-col justify-end" style={{ background: tint(6) }}>
          {first && (
            <>
              <Count value={first.value} className={`block font-medium tracking-tighter text-foreground leading-none ${first.value.length > 5 ? 'text-5xl xl:text-6xl' : 'text-6xl xl:text-7xl'}`} />
              <p className="mt-3 text-sm text-muted max-w-[22ch]">{first.label}</p>
            </>
          )}
          {rest.length > 0 && (
            <div className="mt-6 flex gap-8 border-t pt-5" style={{ borderColor: tint(25) }}>
              {rest.map((s) => (
                <div key={s.label}>
                  <Count value={s.value} className="block text-2xl font-medium tracking-tight text-foreground" />
                  <p className="text-xs text-muted">{s.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* What AI made possible */}
        <div className="lg:col-span-7 bg-background p-8">
          <p className="text-xs text-muted uppercase tracking-widest mb-5">What AI made possible</p>
          <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-4">
            {item.features.map((f, i) => (
              <li key={f} className="flex gap-3 text-sm leading-relaxed text-foreground">
                <span className="mt-0.5 shrink-0 font-mono text-xs" style={{ color: item.accent }}>{pad(i + 1)}</span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* The thinking */}
        <div className="lg:col-span-5 bg-background p-8 flex flex-col">
          <p className="text-xs text-muted uppercase tracking-widest mb-5">The thinking</p>
          <blockquote className="border-l-2 pl-5 text-lg leading-snug tracking-tight text-foreground text-pretty" style={{ borderColor: item.accent }}>
            {item.thinking}
          </blockquote>
        </div>
      </div>
    </article>
  )
}

function Product({ item }: { item: WorkItem }) {
  const Arrow = item.external ? ArrowUpRight : ArrowRight
  const stat = item.stats?.[0]
  return (
    <WorkLink item={item} className="bg-background p-6 flex flex-col">
      <span className="relative block overflow-hidden rounded-lg mb-5" style={{ aspectRatio: '16 / 10', boxShadow: `0 0 0 1px color-mix(in srgb, ${item.accent} 22%, var(--border))` }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={item.poster} alt={item.title} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]" loading="lazy" />
      </span>
      <span className="flex items-center gap-2 text-xs text-muted mb-2">
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: item.accent }} />
        {item.kicker}
      </span>
      <span className="block text-lg font-medium tracking-tight text-foreground mb-1.5 text-balance">{item.title}</span>
      <span className="block text-sm text-muted leading-relaxed mb-5">{item.summary}</span>
      <span className="mt-auto flex items-end justify-between gap-4">
        {stat ? (
          <span>
            <span className="block text-2xl font-medium tracking-tight text-foreground">{stat.value}</span>
            <span className="block text-xs text-muted">{stat.label}</span>
          </span>
        ) : <span />}
        <span className="inline-flex items-center gap-1.5 text-sm text-foreground group-hover:text-accent transition-colors">
          {item.cta}
          <Arrow className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      </span>
    </WorkLink>
  )
}

export function Work() {
  // The case study nearest the middle of the screen plays its reel; the others show a still
  const [near, setNear] = useState<boolean[]>(() => CASE_STUDIES.map(() => false))
  const onNear = useRef((i: number, v: boolean) => setNear((n) => (n[i] === v ? n : n.map((x, k) => (k === i ? v : x))))).current
  const playing = near.indexOf(true)

  return (
    <section aria-label="The work" className="relative bg-background">
      <div className="flex items-center justify-between gap-4 px-8 py-4 border-y border-border">
        <p className="text-xs text-muted uppercase tracking-widest">The work that mattered most</p>
        <p className="hidden sm:block text-xs text-muted">Three case studies in building with AI</p>
      </div>
      {CASE_STUDIES.map((w, i) => (
        <CaseStudy key={w.id} item={w} index={i} playing={playing === i} onNear={onNear} />
      ))}

      <div className="flex items-center justify-between gap-4 px-8 py-4 border-b border-border">
        <p className="text-xs text-muted uppercase tracking-widest">Products</p>
        <p className="text-xs text-muted">Built and shipped</p>
      </div>
      <div className="grid md:grid-cols-3 border-b border-border" style={{ gap: 1, background: line }}>
        {PRODUCTS.map((p) => <Product key={p.id} item={p} />)}
      </div>
    </section>
  )
}
