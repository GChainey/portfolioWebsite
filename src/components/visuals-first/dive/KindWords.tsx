'use client'

import { useMemo, useRef, type MouseEvent } from 'react'
import { motion, useScroll, useSpring, useTransform, type MotionValue } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { Facehash, stringHash } from 'facehash'
import { TESTIMONIALS, type Testimonial } from '@/content/testimonials'
import { CompanyLogo } from '@/components/CompanyLogo'
import { Bleed, Highlighted } from '../shared'

// Kind words, in a dark band. Each card springs up out of the page as it arrives; its pull line
// is set huge, and the phrases worth pointing at sweep into the accent colour as the card
// reaches the middle of the screen. The whole quote sits under it, small, word for word.

const AVATAR = ['#d97706', '#ea580c', '#e11d48', '#c026d3', '#7c3aed', '#2563eb', '#0891b2', '#0d9488', '#16a34a']
const DIM = 'rgba(255,255,255,0.32)'

// The pull line split into plain and highlighted runs (highlights that fall inside it)
function pullRuns(t: Testimonial) {
  const pull = t.pull
  const lower = pull.toLowerCase()
  const ranges = t.highlights
    .map((h) => { const i = lower.indexOf(h.toLowerCase()); return i < 0 ? null : ([i, i + h.length] as const) })
    .filter((r): r is readonly [number, number] => r !== null)
    .sort((a, b) => a[0] - b[0])
  const out: { text: string; hit: boolean }[] = []
  let at = 0
  for (const [from, to] of ranges) {
    if (from < at) continue
    if (from > at) out.push({ text: pull.slice(at, from), hit: false })
    out.push({ text: pull.slice(from, to), hit: true })
    at = to
  }
  if (at < pull.length) out.push({ text: pull.slice(at), hit: false })
  // The pull starts mid-sentence: say so, rather than pass it off as the start
  const start = t.content.indexOf(pull)
  const midSentence = start > 0 && !/[.!?]\s*$/.test(t.content.slice(0, start))
  return { runs: out, midSentence }
}

function Mark({ text, lit, i }: { text: string; lit: MotionValue<number>; i: number }) {
  const from = 0.3 + i * 0.1
  const pos = useTransform(lit, [from, from + 0.45], [100, 0])
  const backgroundPosition = useTransform(pos, (v) => `${v}% 0`)
  const filter = useTransform(lit, (v) => `drop-shadow(0 0 22px color-mix(in srgb, var(--accent) ${Math.round(smoothstep(from + 0.2, from + 0.55, v) * 55)}%, transparent))`)
  return (
    <motion.span
      style={{
        backgroundImage: `linear-gradient(90deg, var(--accent) 0%, var(--accent) 46%, ${DIM} 54%, ${DIM} 100%)`,
        backgroundSize: '220% 100%',
        backgroundPosition,
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        color: 'transparent',
        WebkitBoxDecorationBreak: 'clone',
        boxDecorationBreak: 'clone',
        filter,
      }}
    >
      {text}
    </motion.span>
  )
}

const smoothstep = (a: number, b: number, v: number) => Math.min(1, Math.max(0, (v - a) / (b - a)))

function Card({ t, i, reduced, phone }: { t: Testimonial; i: number; reduced: boolean; phone: boolean }) {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.95', 'center 0.5'] })
  const lit = useSpring(scrollYProgress, { stiffness: 140, damping: 26, restDelta: 0.001 })
  const ink = useTransform(lit, [0, 0.55], [DIM, 'rgba(255,255,255,0.94)'])
  const rx = useSpring(0, { stiffness: 160, damping: 16 })
  const ry = useSpring(0, { stiffness: 160, damping: 16 })
  const tilt = !reduced && !phone
  const { runs, midSentence } = useMemo(() => pullRuns(t), [t])
  const right = i % 2 === 1
  let n = 0

  const onMove = (e: MouseEvent) => {
    if (!tilt || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    ry.set(((e.clientX - r.left) / r.width - 0.5) * 7)
    rx.set(-((e.clientY - r.top) / r.height - 0.5) * 7)
  }
  const onLeave = () => { rx.set(0); ry.set(0) }

  return (
    <motion.figure
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.92, y: 56 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={reduced ? { duration: 0.4 } : { type: 'spring', stiffness: 150, damping: 13, mass: 1 }}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 1400 }}
      className={`dv-card relative rounded-3xl p-7 md:p-12 lg:w-[80%] ${right ? 'lg:ml-auto' : ''}`}
    >
      <div className="flex items-start justify-between gap-6">
        <span className="font-mono text-xs tabular-nums text-white/35">{String(i + 1).padStart(2, '0')}</span>
        {t.logo && <CompanyLogo id={t.logo} className="text-white/45" />}
      </div>
      <blockquote className="mt-6 text-[30px] font-medium leading-[1.1] tracking-[-0.03em] md:mt-8 md:text-[52px] md:leading-[1.06]">
        <motion.span style={{ color: ink }}>
          <span className="-ml-[0.4em] inline-block w-[0.4em] text-right">“</span>
          {midSentence && '…'}
          {runs.map((r, k) => (r.hit ? <Mark key={k} text={r.text} lit={lit} i={n++} /> : <span key={k}>{r.text}</span>))}
          ”
        </motion.span>
      </blockquote>
      <p className="mt-8 max-w-[680px] text-[15px] leading-relaxed text-white/40 text-pretty">
        <Highlighted t={t} mark={(text) => <span className="text-white/80">{text}</span>} />
      </p>
      <figcaption className="mt-8 flex items-center gap-4 border-t border-white/10 pt-6">
        <Facehash
          name={t.name}
          size={44}
          showInitial
          interactive={false}
          intensity3d="subtle"
          style={{ backgroundColor: `color-mix(in srgb, ${AVATAR[stringHash(t.name) % AVATAR.length]} 65%, #09090b)`, borderRadius: '9999px', flexShrink: 0 }}
        />
        <div className="min-w-0">
          {t.linkedIn ? (
            <a href={t.linkedIn} target="_blank" rel="noopener noreferrer" className="group inline-flex items-center gap-1 text-sm font-medium text-white transition-colors hover:text-[color:var(--accent)]">
              {t.name}
              <ArrowUpRight className="h-3.5 w-3.5 text-white/40 transition-colors group-hover:text-[color:var(--accent)]" />
            </a>
          ) : (
            <p className="text-sm font-medium text-white">{t.name}</p>
          )}
          <p className="text-xs text-white/50">{t.role} · {t.company}</p>
        </div>
      </figcaption>
    </motion.figure>
  )
}

export function KindWords({ reduced, phone }: { reduced: boolean; phone: boolean }) {
  return (
    <Bleed label="Kind words" className="dv-band overflow-hidden text-white">
      {({ gutter }) => (
        <div className="relative" style={{ paddingLeft: gutter, paddingRight: gutter }}>
          <div className="px-6 pb-10 pt-24 md:px-8 md:pt-36">
            <p className="text-xs uppercase tracking-widest text-white/45">Kind words</p>
            <h2 className="mt-4 max-w-[680px] text-[30px] font-medium leading-[1.1] tracking-[-0.025em] text-white md:text-[40px]">
              From the people I&rsquo;ve worked with.
            </h2>
            <p className="mt-4 text-sm text-white/45">Word for word from LinkedIn.</p>
          </div>
          <div className="space-y-8 px-4 pb-28 md:space-y-16 md:px-8 md:pb-40">
            {TESTIMONIALS.map((t, i) => <Card key={t.name} t={t} i={i} reduced={reduced} phone={phone} />)}
          </div>
        </div>
      )}
    </Bleed>
  )
}

export const KIND_CSS = `
  .dv-band { background: radial-gradient(1200px 600px at 15% 0%, color-mix(in srgb, var(--accent) 9%, transparent), transparent 70%), radial-gradient(900px 700px at 90% 60%, color-mix(in srgb, var(--accent) 6%, transparent), transparent 70%), #09090b; }
  .dv-card { background: linear-gradient(180deg, rgba(255,255,255,0.045), rgba(255,255,255,0.015)); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.08), 0 40px 100px -50px rgba(0,0,0,0.9); transform-style: preserve-3d; }
`
