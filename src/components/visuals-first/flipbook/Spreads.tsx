'use client'

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { CASE_STUDIES, PRODUCTS, type WorkItem } from '@/content/work'
import { WorkReel, WorkLink, pad } from '@/components/showcase/shared'
import { useTheme } from '@/context/ThemeContext'
import { Bleed } from '../shared'

// The work as magazine spreads: three AI case studies, each laid out differently so the section
// reads like turning pages. A folio along the top, the title huge, the number set like a pull
// figure, the reel running off the edge of the page, the features as numbered deck copy and the
// thinking as a pull quote with a drop cap. Then the products, smaller, as "also made".

type Reel = { active: string | null; set: (fn: (cur: string | null) => string | null) => void }

// The label row the rest of the page uses, kept inside the column
export function LabelRow({ gutter, left, right }: { gutter: number; left: string; right?: ReactNode }) {
  return (
    <div className="border-b border-border" style={{ marginLeft: gutter, marginRight: gutter }}>
      <div className="flex items-center justify-between gap-4 px-8 py-4">
        <p className="text-xs text-muted uppercase tracking-widest">{left}</p>
        {right && <p className="text-xs text-muted truncate">{right}</p>}
      </div>
    </div>
  )
}

// Counts the figures in a stat up from zero when it comes into view, each at the same pace, so
// "6s vs 21s" reads as a race
function Figure({ value, reduced, className, style }: { value: string; reduced: boolean; className?: string; style?: CSSProperties }) {
  const ref = useRef<HTMLSpanElement>(null)
  const parts = value.split(/(\d+)/)
  useEffect(() => {
    const el = ref.current
    if (!el || reduced) return
    const nums = parts.filter((_, i) => i % 2 === 1).map(Number)
    const max = Math.max(...nums, 1)
    if (max < 2) return
    let raf = 0
    const run = () => {
      const t0 = performance.now()
      const total = Math.min(1600, 500 + max * 60)
      const spans = Array.from(el.querySelectorAll<HTMLSpanElement>('[data-n]'))
      const tick = (now: number) => {
        const k = Math.min(1, (now - t0) / total)
        spans.forEach((s) => {
          const target = Number(s.dataset.n)
          // Same speed for every figure: the small one lands first
          const v = Math.min(target, Math.round(max * (1 - Math.pow(1 - k, 2.2)) ))
          s.textContent = String(Math.min(target, v))
        })
        if (k < 1) raf = requestAnimationFrame(tick)
      }
      spans.forEach((s) => { s.textContent = '0' })
      raf = requestAnimationFrame(tick)
    }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { run(); io.disconnect() } }, { rootMargin: '0px 0px -25% 0px' })
    io.observe(el)
    return () => { io.disconnect(); cancelAnimationFrame(raf) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, reduced])
  return (
    <span ref={ref} className={`tabular-nums ${className ?? ''}`} style={style} aria-label={value}>
      {parts.map((p, i) => (i % 2 === 1 ? <span key={i} data-n={p} aria-hidden>{p}</span> : <span key={i} aria-hidden>{p}</span>))}
    </span>
  )
}

// The poster, with the live replay over it while it's the one in the middle of the screen
function Media({ item, reel, side, className = '' }: { item: WorkItem; reel: Reel; side: 'left' | 'right' | 'none'; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const { resolvedMode } = useTheme()
  const [mounted, setMounted] = useState(false)
  const on = reel.active === item.id
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) reel.set(() => item.id)
      else reel.set((cur) => (cur === item.id ? null : cur))
    }, { rootMargin: '-30% 0px -30% 0px' })
    io.observe(el)
    return () => io.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.id])
  // Mount a beat after it arrives, so scrolling straight past doesn't start a replay
  useEffect(() => {
    if (!on) { setMounted(false); return }
    const t = setTimeout(() => setMounted(true), 300)
    return () => clearTimeout(t)
  }, [on])
  const round = side === 'right' ? 'rounded-l-2xl' : side === 'left' ? 'rounded-r-2xl' : 'rounded-2xl'
  return (
    <div ref={ref} className={`fbs-media relative overflow-hidden ${round} ${className}`} style={{ aspectRatio: '16 / 10' }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={item.poster} alt={`${item.name}: ${item.title}`} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover" />
      {mounted && (
        <div className="absolute inset-0 fbs-fade">
          <WorkReel item={item} theme={resolvedMode === 'dark' ? 'dark' : 'light'} />
        </div>
      )}
      <span className="absolute left-4 top-4 z-10 inline-flex items-center gap-2 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-md">
        <span className={`h-1.5 w-1.5 rounded-full ${mounted ? 'bg-green-400 fbs-pulse' : 'bg-white/60'}`} />
        {mounted ? 'Live replay' : 'Replay'}
      </span>
    </div>
  )
}

function Folio({ item, n }: { item: WorkItem; n: number }) {
  return (
    <div className="flex items-center gap-4 text-xs uppercase tracking-widest text-muted">
      <span className="font-mono text-foreground">{pad(n)}</span>
      <span className="h-px w-8" style={{ background: item.accent }} />
      <span className="truncate">{item.kicker}</span>
      <span className="h-px flex-1 bg-border" />
      <span className="hidden sm:inline font-mono normal-case tracking-normal">{pad(n)} / {pad(CASE_STUDIES.length)}</span>
    </div>
  )
}

function Title({ item, className = '', narrow = false }: { item: WorkItem; className?: string; narrow?: boolean }) {
  return (
    <h3 className={`font-semibold text-foreground text-balance ${className}`} style={{ fontSize: narrow ? 'clamp(40px, 4.4vw, 68px)' : 'clamp(40px, 6.2vw, 96px)', lineHeight: 0.96, letterSpacing: '-0.05em' }}>
      {item.title}
    </h3>
  )
}

function Stat({ item, reduced, align = 'left', size = 'big' }: { item: WorkItem; reduced: boolean; align?: 'left' | 'right'; size?: 'big' | 'banner' }) {
  const [lead, ...rest] = item.stats ?? []
  if (!lead) return null
  const short = lead.value.length <= 3
  const fontSize = size === 'banner' ? 'clamp(80px, 15vw, 240px)' : short ? 'clamp(120px, 17vw, 260px)' : 'clamp(72px, 9vw, 150px)'
  return (
    <div className={align === 'right' ? 'text-right' : ''}>
      <p className="font-semibold leading-none" style={{ fontSize, letterSpacing: '-0.07em', color: item.accent }}>
        <Figure value={lead.value} reduced={reduced} />
      </p>
      <p className={`mt-3 text-lg sm:text-xl leading-snug text-foreground text-balance max-w-[18ch] ${align === 'right' ? 'ml-auto' : ''}`}>{lead.label}</p>
      {rest.map((s) => (
        <p key={s.label} className={`mt-4 flex items-baseline gap-2 text-sm text-muted ${align === 'right' ? 'justify-end' : ''}`}>
          <span className="font-mono text-foreground tabular-nums">{s.value}</span> {s.label}
        </p>
      ))}
    </div>
  )
}

function Features({ item, cols = 2 }: { item: WorkItem; cols?: 1 | 2 | 4 }) {
  const grid = cols === 4 ? 'sm:grid-cols-2 lg:grid-cols-4' : cols === 2 ? 'sm:grid-cols-2' : ''
  return (
    <div>
      <p className="text-xs text-muted uppercase tracking-widest mb-5">What AI made possible</p>
      <ol className={`grid gap-x-8 gap-y-6 ${grid}`}>
        {item.features.map((f, i) => (
          <li key={f} className="border-t border-border pt-4">
            <span className="block font-mono text-xs mb-2" style={{ color: item.accent }}>{pad(i + 1)}</span>
            <span className="block text-[15px] leading-relaxed text-foreground text-pretty">{f}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}

function Thinking({ item }: { item: WorkItem }) {
  return (
    <figure>
      <p className="text-xs text-muted uppercase tracking-widest mb-5">The thinking</p>
      <blockquote
        className="fbs-dropcap text-xl sm:text-2xl leading-snug tracking-tight text-foreground text-pretty"
        style={{ ['--acc' as string]: item.accent }}
      >
        {item.thinking}
      </blockquote>
      <WorkLink
        item={item}
        className="mt-8 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-white transition-[filter] hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        style={{ background: item.accent }}
      />
    </figure>
  )
}

function Summary({ item }: { item: WorkItem }) {
  return <p className="mt-6 text-lg sm:text-xl leading-snug text-muted max-w-[34ch] text-pretty">{item.summary}</p>
}

// Three layouts, one per spread
function Spread({ item, i, reel, reduced, gutter, phone }: { item: WorkItem; i: number; reel: Reel; reduced: boolean; gutter: number; phone: boolean }) {
  const inset = gutter + (phone ? 16 : 32)
  const box: CSSProperties = { paddingLeft: inset, paddingRight: inset }
  const bleedR: CSSProperties = phone ? {} : { marginRight: -inset }
  const bleedL: CSSProperties = phone ? {} : { marginLeft: -inset }
  const layout = i % 3

  return (
    <article className="relative py-16 sm:py-24" style={box} aria-label={item.name}>
      <Folio item={item} n={i + 1} />

      {layout === 0 && (
        // Number top right, image running off the right edge
        <>
          <div className="mt-10 sm:mt-14 grid gap-10 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-8">
              <Title item={item} />
              <Summary item={item} />
            </div>
            <div className="lg:col-span-4 lg:pb-2"><Stat item={item} reduced={reduced} align={phone ? 'left' : 'right'} /></div>
          </div>
          <div className="mt-12 sm:mt-16 grid lg:grid-cols-12 gap-6">
            <p className="hidden lg:block lg:col-span-2 self-end pb-2 text-xs leading-relaxed text-muted">
              <span className="font-mono" style={{ color: item.accent }}>Fig. {pad(i + 1)}</span><br />{item.name}, replayed from a recording.
            </p>
            <div className="lg:col-span-10" style={bleedR}><Media item={item} reel={reel} side={phone ? 'none' : 'right'} /></div>
          </div>
          <div className="mt-14 sm:mt-20 grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-7"><Features item={item} /></div>
            <div className="lg:col-span-4 lg:col-start-9"><Thinking item={item} /></div>
          </div>
        </>
      )}

      {layout === 1 && (
        // Image running off the left edge, number at the bottom
        <>
          <div className="mt-10 sm:mt-14 grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-9 lg:col-start-4">
              <Title item={item} />
              <Summary item={item} />
            </div>
          </div>
          <div className="mt-12 sm:mt-16 grid gap-10 lg:grid-cols-12 lg:items-start">
            <div className="lg:col-span-8" style={bleedL}><Media item={item} reel={reel} side={phone ? 'none' : 'left'} /></div>
            <div className="lg:col-span-4"><Features item={item} cols={1} /></div>
          </div>
          <div className="mt-14 sm:mt-20 grid gap-12 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-6"><Thinking item={item} /></div>
            <div className="lg:col-span-5 lg:col-start-8"><Stat item={item} reduced={reduced} align={phone ? 'left' : 'right'} /></div>
          </div>
        </>
      )}

      {layout === 2 && (
        // The number as a banner across the top, then title and image side by side
        <>
          <div className="mt-10 sm:mt-14 grid gap-6 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-12"><Stat item={item} reduced={reduced} size="banner" /></div>
          </div>
          <div className="mt-12 sm:mt-16 grid gap-10 lg:grid-cols-12 lg:items-start">
            <div className="lg:col-span-5">
              <Title item={item} narrow />
              <Summary item={item} />
            </div>
            <div className="lg:col-span-7" style={bleedR}><Media item={item} reel={reel} side={phone ? 'none' : 'right'} /></div>
          </div>
          <div className="mt-14 sm:mt-20 grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-8"><Features item={item} cols={2} /></div>
            <div className="lg:col-span-4"><Thinking item={item} /></div>
          </div>
        </>
      )}
    </article>
  )
}

// The products: smaller, three across
function AlsoMade({ gutter }: { gutter: number }) {
  return (
    <div>
      <LabelRow gutter={gutter} left="Also made" right="Three products, built and shipped" />
      <div className="grid sm:grid-cols-3" style={{ marginLeft: gutter, marginRight: gutter }}>
        {PRODUCTS.map((p, i) => (
          <WorkLink
            key={p.id}
            item={p}
            className={`group block p-6 sm:p-8 border-border ${i < PRODUCTS.length - 1 ? 'border-b sm:border-b-0 sm:border-r' : ''} focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2`}
          >
            <div className="relative overflow-hidden rounded-lg fbs-media" style={{ aspectRatio: '16 / 10' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.poster} alt={`${p.name}: ${p.title}`} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]" />
            </div>
            <p className="mt-5 flex items-center gap-2 text-xs uppercase tracking-widest" style={{ color: p.accent }}>
              <span className="font-mono">{pad(i + 1)}</span>
              <span className="h-px w-4" style={{ background: p.accent }} />
              {p.name}
            </p>
            <p className="mt-2 text-lg font-medium leading-snug tracking-tight text-foreground text-balance">{p.title}</p>
            <p className="mt-1.5 text-sm text-muted leading-relaxed">{p.summary}</p>
            <p className="mt-4 flex items-center justify-between gap-4 text-sm">
              {p.stats?.[0] ? (
                <span className="text-muted"><span className="font-mono text-foreground">{p.stats[0].value}</span> {p.stats[0].label}</span>
              ) : <span />}
              <span className="inline-flex items-center gap-1 text-foreground group-hover:text-accent transition-colors">
                {p.cta}
                {p.external ? <ArrowUpRight className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </span>
            </p>
          </WorkLink>
        ))}
      </div>
    </div>
  )
}

export function Spreads({ reduced }: { reduced: boolean }) {
  const [active, setActive] = useState<string | null>(null)
  const reel: Reel = { active, set: setActive }
  const [phone, setPhone] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1023px)')
    const on = () => setPhone(mq.matches)
    on()
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return (
    <Bleed className="border-b border-border overflow-x-clip" label="The work">
      {({ gutter }) => (
        <>
          <style>{CSS}</style>
          <LabelRow gutter={gutter} left="The work" right="Three AI case studies, then three products" />
          {CASE_STUDIES.map((w, i) => (
            <div key={w.id} className={i > 0 ? 'relative' : ''}>
              {i > 0 && <div className="border-t border-border" style={{ marginLeft: gutter, marginRight: gutter }} />}
              <Spread item={w} i={i} reel={reel} reduced={reduced} gutter={gutter} phone={phone} />
            </div>
          ))}
          <div className="border-t border-border" style={{ marginLeft: gutter, marginRight: gutter }} />
          <AlsoMade gutter={gutter} />
        </>
      )}
    </Bleed>
  )
}

const CSS = `
  .fbs-media { background: var(--card); box-shadow: 0 0 0 1px color-mix(in srgb, var(--foreground) 10%, transparent), 0 40px 80px -40px rgba(0,0,0,.5); }
  .fbs-fade { animation: fbs-fade .6s ease both; }
  @keyframes fbs-fade { from { opacity: 0 } to { opacity: 1 } }
  .fbs-pulse { box-shadow: 0 0 0 0 rgba(74,222,128,.6); animation: fbs-pulse 1.8s ease-out infinite; }
  @keyframes fbs-pulse { 70% { box-shadow: 0 0 0 6px rgba(74,222,128,0) } 100% { box-shadow: 0 0 0 0 rgba(74,222,128,0) } }
  .fbs-dropcap::first-letter {
    float: left; font-size: 3.6em; line-height: .82; font-weight: 600; letter-spacing: -0.04em;
    margin: .06em .1em 0 -.02em; color: var(--acc);
  }
  @media (prefers-reduced-motion: reduce) { .fbs-fade, .fbs-pulse { animation: none } }
`
