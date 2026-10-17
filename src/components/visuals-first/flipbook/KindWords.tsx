'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, motionValue, useMotionValueEvent, useTransform, type MotionValue } from 'framer-motion'
import { Linkedin } from 'lucide-react'
import { Facehash, stringHash } from 'facehash'
import { TESTIMONIALS, type Testimonial } from '@/content/testimonials'
import { CompanyLogo } from '@/components/CompanyLogo'
import { pad } from '@/components/showcase/shared'
import { Highlighted } from '../shared'

// Kind words as pull quotes. Each colleague's line is set enormous, one per screen, and the
// cards stack: the next rises over the last, which sinks back a little. The words come up one by
// one as the card arrives, and the phrases worth pointing at in the full quote get a marker
// pulled through them.

const AVATAR = ['#d97706', '#0891b2', '#16a34a', '#7c3aed', '#db2777', '#2563eb']
const STEP = 14 // how far each card sits below the last, so the stack shows

function Word({ w, i, n, enter }: { w: string; i: number; n: number; enter: MotionValue<number> }) {
  const from = 0.3 + (0.62 * i) / n
  const opacity = useTransform(enter, [from, from + 0.14], [0.14, 1])
  const y = useTransform(enter, [from, from + 0.14], ['0.18em', '0em'])
  return (
    <>
      <motion.span className="inline-block" style={{ opacity, y }}>{w}</motion.span>{' '}
    </>
  )
}

function Card({ t, i, n, enter, covered, reduced }: { t: Testimonial; i: number; n: number; enter: MotionValue<number>; covered: MotionValue<number>; reduced: boolean }) {
  const words = t.pull.split(' ')
  // Short lines set bigger, so every card carries the same weight
  const size = t.pull.length < 32 ? 'clamp(40px, 7.4vw, 116px)' : t.pull.length < 64 ? 'clamp(36px, 6vw, 92px)' : 'clamp(32px, 5.2vw, 80px)'
  const [marked, setMarked] = useState(reduced)
  useMotionValueEvent(enter, 'change', (v) => { if (v > 0.92 && !marked) setMarked(true) })
  // Arriving: rises and settles. Covered: sinks back and dims
  const scaleIn = useTransform(enter, [0, 1], [0.9, 1])
  const scaleOut = useTransform(covered, [0, 1], [1, 0.94])
  const scale = useTransform([scaleIn, scaleOut], ([a, b]: number[]) => a * b)
  const rotateX = useTransform(enter, [0, 0.8, 1], [10, 1, 0])
  const dim = useTransform(covered, [0, 1], [0, 0.55])
  const color = AVATAR[stringHash(t.name) % AVATAR.length]

  return (
    <motion.article
      className="fbk-card relative h-full overflow-hidden rounded-2xl flex flex-col p-6 sm:p-10 lg:p-12"
      style={reduced ? undefined : { scale, rotateX, transformPerspective: 1600, transformOrigin: '50% 0%' }}
      aria-label={`${t.name}, ${t.role}`}
    >
      <div className="flex items-start justify-between gap-4">
        <span className="block font-semibold leading-none text-accent select-none" style={{ fontSize: 'clamp(64px, 7vw, 112px)', height: '0.5em', letterSpacing: '-0.05em' }} aria-hidden>“</span>
        <span className="font-mono text-xs text-muted tabular-nums">{pad(i + 1)} / {pad(n)}</span>
      </div>

      <blockquote className="flex-1 min-h-0 flex items-center py-6 sm:py-8">
        <p className="font-medium text-foreground text-balance" style={{ fontSize: size, lineHeight: 1.02, letterSpacing: '-0.045em' }}>
          {reduced ? t.pull : words.map((w, k) => <Word key={k} w={w} i={k} n={words.length} enter={enter} />)}
        </p>
      </blockquote>

      <div className="mt-8 grid gap-6 border-t border-border pt-6 md:grid-cols-12 md:gap-10">
        <div className="md:col-span-4 flex items-center gap-3 min-w-0">
          <Facehash
            name={t.name}
            size={44}
            showInitial
            enableBlink
            interactive={false}
            intensity3d="subtle"
            style={{ backgroundColor: `color-mix(in srgb, ${color} 60%, var(--background))`, borderRadius: '9999px', flexShrink: 0 }}
          />
          <div className="min-w-0">
            {t.linkedIn ? (
              <a href={t.linkedIn} target="_blank" rel="noopener noreferrer" className="group inline-flex items-center gap-1.5 font-medium text-foreground hover:text-accent transition-colors" aria-label={`${t.name} on LinkedIn`}>
                {t.name}
                <Linkedin className="w-3.5 h-3.5 text-muted group-hover:text-accent transition-colors" />
              </a>
            ) : (
              <p className="font-medium text-foreground">{t.name}</p>
            )}
            <p className="text-xs text-muted truncate">{t.role} · {t.company}</p>
            {t.logo && <CompanyLogo id={t.logo} className="mt-2.5 text-muted" />}
          </div>
        </div>
        <p className={`md:col-span-8 text-[15px] leading-relaxed text-muted text-pretty ${marked || reduced ? 'fbk-on' : ''}`}>
          <Highlighted t={t} mark={(text, k) => <mark className="fbk-mark" style={{ transitionDelay: `${150 + k * 420}ms` }}>{text}</mark>} />
        </p>
      </div>

      {!reduced && <motion.div className="pointer-events-none absolute inset-0 bg-background" style={{ opacity: dim }} aria-hidden />}
    </motion.article>
  )
}

export function KindWords({ reduced }: { reduced: boolean }) {
  const n = TESTIMONIALS.length
  const enter = useMemo(() => TESTIMONIALS.map(() => motionValue(reduced ? 1 : 0)), [reduced])
  const none = useMemo(() => motionValue(0), [])
  const marks = useRef<(HTMLDivElement | null)[]>([])

  // One listener for the stack: how far each card has come in, from the bottom of the screen to
  // its place in the stack
  useEffect(() => {
    if (reduced) return
    let raf = 0
    const run = () => {
      raf = 0
      const vh = window.innerHeight
      marks.current.forEach((m, i) => {
        if (!m) return
        const top = m.getBoundingClientRect().top
        const rest = 56 + 32 + i * STEP
        enter[i].set(Math.min(1, Math.max(0, (vh - top) / (vh - rest))))
      })
    }
    const on = () => { if (!raf) raf = requestAnimationFrame(run) }
    run()
    window.addEventListener('scroll', on, { passive: true })
    window.addEventListener('resize', on)
    return () => { window.removeEventListener('scroll', on); window.removeEventListener('resize', on); cancelAnimationFrame(raf) }
  }, [enter, reduced])

  return (
    <section className="border-b border-border" aria-label="Kind words">
      <style>{CSS}</style>
      <div className="flex items-center justify-between gap-4 px-8 py-4 border-b border-border">
        <p className="text-xs text-muted uppercase tracking-widest">Kind words</p>
        <p className="text-xs text-muted">{n} colleagues, word for word</p>
      </div>
      <div className="px-4 sm:px-8 pt-8 pb-16 sm:pb-24">
        {TESTIMONIALS.map((t, i) => (
          <div key={t.name} className="contents">
            {/* Where the card would be if it didn't stick: measured to drive it */}
            <div ref={(el) => { marks.current[i] = el }} aria-hidden />
            <div
              className={reduced ? 'mb-6' : 'sticky'}
              style={reduced ? undefined : { top: 56 + 32 + i * STEP, height: `min(640px, calc(100svh - ${56 + 32 + 24 + (n - 1) * STEP}px))`, marginBottom: i < n - 1 ? '42vh' : '2vh' }}
            >
              <Card t={t} i={i} n={n} enter={enter[i]} covered={enter[i + 1] ?? none} reduced={reduced} />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

const CSS = `
  .fbk-card {
    background: color-mix(in srgb, var(--foreground) 3%, var(--background));
    box-shadow: 0 0 0 1px color-mix(in srgb, var(--foreground) 10%, transparent), 0 1px 0 0 color-mix(in srgb, var(--foreground) 6%, transparent) inset, 0 -24px 60px -30px rgba(0,0,0,.35), 0 40px 80px -40px rgba(0,0,0,.4);
    will-change: transform;
  }
  html:not(.dark) .fbk-card { background: #fff; }
  .fbk-mark {
    color: var(--foreground);
    background-color: transparent;
    background-image: linear-gradient(color-mix(in srgb, var(--accent) 38%, transparent), color-mix(in srgb, var(--accent) 38%, transparent));
    background-repeat: no-repeat;
    background-position: 0 88%;
    background-size: 0% 62%;
    padding: 0 .08em;
    margin: 0 -.08em;
    border-radius: 2px;
    transition: background-size 1s cubic-bezier(.6,.1,.2,1);
  }
  .fbk-on .fbk-mark { background-size: 100% 62%; }
  @media (prefers-reduced-motion: reduce) { .fbk-mark { transition: none } }
`
