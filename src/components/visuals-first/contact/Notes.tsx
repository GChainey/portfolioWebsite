'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { ExternalLink } from 'lucide-react'
import { Facehash } from 'facehash'
import { TESTIMONIALS, type Testimonial } from '@/content/testimonials'
import { CompanyLogo } from '@/components/CompanyLogo'
import { Highlighted } from '../shared'
import { hash, rng } from './pen'

// Kind words, taped onto the sheet: the line that carries each one large, the whole quote under
// it with the best phrases underlined in red as the note settles.

// Where each note sits on a wide sheet: its columns, how far down, and its tilt
const PLACES = [
  { col: '1 / span 4', mt: 24, rot: -1.4 },
  { col: '5 / span 4', mt: 0, rot: 0.9 },
  { col: '9 / span 4', mt: 64, rot: -0.6 },
  { col: '2 / span 5', mt: -12, rot: 1.1 },
  { col: '7 / span 5', mt: 36, rot: -1.0 },
]

const AVATAR = ['#d97706', '#0891b2', '#16a34a', '#7c3aed', '#e11d48']

// A strip of tape, its ends torn
function Tape({ seed, rot }: { seed: string; rot: number }) {
  const r = rng(hash(seed))
  const tear = (n: number) => Array.from({ length: n }, (_, i) => `${(r() * 6).toFixed(1)}% ${((i / (n - 1)) * 100).toFixed(0)}%`)
  const left = tear(5)
  const right = tear(5).map((p) => { const [x, y] = p.split(' '); return `${(100 - parseFloat(x)).toFixed(1)}% ${y}` }).reverse()
  return (
    <span
      aria-hidden
      className="absolute -top-3 left-1/2 h-6 w-24"
      style={{
        transform: `translateX(-50%) rotate(${(-rot * 2.2 + (r() - 0.5) * 3).toFixed(2)}deg)`,
        background: 'linear-gradient(100deg, var(--tape), color-mix(in srgb, var(--tape) 70%, transparent) 55%, var(--tape))',
        boxShadow: '0 0 0 0.5px var(--tape-edge), 0 1px 2px rgba(0,0,0,0.06)',
        clipPath: `polygon(${[...left, ...right].join(', ')})`,
        backdropFilter: 'blur(1px)',
      }}
    />
  )
}

function Note({ t, i, place, reduced }: { t: Testimonial; i: number; place: { col: string; mt: number; rot: number } | null; reduced: boolean }) {
  const ref = useRef<HTMLElement>(null)
  const on = useInView(ref, { once: true, margin: '0px 0px -20% 0px' })
  const rot = place?.rot ?? (i % 2 ? 0.8 : -0.8)
  return (
    <motion.figure
      ref={ref}
      className={`relative ${on || reduced ? 'cs-on' : ''}`}
      style={place ? { gridColumn: place.col, marginTop: place.mt } : undefined}
      initial={reduced ? false : { opacity: 0, y: 46, scale: 0.94, rotate: rot * 4 }}
      animate={on || reduced ? { opacity: 1, y: 0, scale: 1, rotate: rot } : undefined}
      transition={{ type: 'spring', stiffness: 190, damping: 17, mass: 0.9, delay: place ? (i % 3) * 0.08 : 0 }}
    >
      <div className="relative px-6 pb-6 pt-8" style={{ background: 'var(--note)', boxShadow: '0 0 0 0.5px var(--paper-line), var(--lift)', borderRadius: 2 }}>
        <Tape seed={t.name} rot={rot} />
        <blockquote>
          <p className="text-balance text-[22px] font-medium leading-snug tracking-tight text-foreground">“{t.pull}”</p>
          <p className="mt-4 text-sm leading-relaxed text-muted">
            <Highlighted t={t} mark={(text, n) => <span className="cs-hl" style={{ transitionDelay: `${0.55 + n * 0.45}s` }}>{text}</span>} />
          </p>
        </blockquote>
        <figcaption className="mt-5 flex items-center gap-3 pt-4" style={{ borderTop: '1px dashed var(--paper-line)' }}>
          <Facehash
            name={t.name}
            size={34}
            showInitial
            interactive={false}
            intensity3d="subtle"
            style={{ backgroundColor: `color-mix(in srgb, ${AVATAR[i % AVATAR.length]} 60%, var(--background))`, borderRadius: '9999px' }}
          />
          <div className="min-w-0">
            {t.linkedIn ? (
              <a href={t.linkedIn} target="_blank" rel="noopener noreferrer" className="group inline-flex items-center gap-1 text-sm font-medium text-foreground hover:text-accent">
                {t.name}
                <ExternalLink className="h-3 w-3 text-muted group-hover:text-accent" />
                <span className="sr-only">on LinkedIn</span>
              </a>
            ) : (
              <p className="text-sm font-medium text-foreground">{t.name}</p>
            )}
            <p className="truncate text-xs text-muted">{t.role} · {t.company}</p>
          </div>
          {t.logo && <CompanyLogo id={t.logo} className="ml-auto text-muted" />}
        </figcaption>
      </div>
    </motion.figure>
  )
}

export function Notes({ gutter, width, reduced }: { gutter: number; width: number; reduced: boolean }) {
  const wide = width >= 1100
  const two = width >= 700 && !wide
  const inset = width < 640 ? 20 : gutter + 32
  const head = useRef<HTMLDivElement>(null)
  const headOn = useInView(head, { once: true, margin: '0px 0px -15% 0px' })
  return (
    <div style={{ paddingLeft: inset, paddingRight: inset, borderTop: '1px solid var(--paper-line)' }}>
      <div className="mx-auto max-w-[1216px] pb-24 pt-16 sm:pb-32 sm:pt-24">
        <div ref={head} className="mb-14 flex items-end justify-between gap-6">
          <div>
            <p className="mb-4 text-xs uppercase tracking-widest text-muted">Kind words</p>
            <h2 className="text-2xl font-medium tracking-tight text-foreground sm:text-3xl">From the people I’ve worked with</h2>
          </div>
          <span className="cs-hand hidden shrink-0 text-[24px] sm:inline-block" style={{ transform: 'rotate(-3deg)', opacity: headOn || reduced ? 1 : 0, transition: 'opacity .6s .4s' }}>word for word, from LinkedIn</span>
        </div>
        <div className={wide ? 'grid grid-cols-12 items-start gap-x-8 gap-y-12' : two ? 'grid grid-cols-2 items-start gap-x-8 gap-y-12' : 'flex flex-col gap-12'}>
          {TESTIMONIALS.map((t, i) => (
            <Note key={t.name} t={t} i={i} place={wide ? PLACES[i] : two ? { col: 'auto', mt: i % 2 ? 40 : 0, rot: PLACES[i].rot } : null} reduced={reduced} />
          ))}
        </div>
      </div>
    </div>
  )
}
