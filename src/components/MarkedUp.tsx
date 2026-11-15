'use client'

import { useRef } from 'react'
import { useInView, useReducedMotion } from 'framer-motion'
import { Permanent_Marker } from 'next/font/google'
import styles from './MarkedUp.module.css'

// A screenshot marked up the way you would on a whiteboard: a ring round the part that matters and
// a few words in red marker beside it. Everything is placed in the screenshot's own pixels (the
// frame), so the notes stay on their targets at any width. Below 480px of frame the words would be
// too small to read, so they become numbers on the picture and a list underneath.

const marker = Permanent_Marker({ weight: '400', subsets: ['latin'] })

// Whiteboard red: the one colour on a page that otherwise has none
const RED = '#E0352B'
const EASE = 'cubic-bezier(0.23, 1, 0.32, 1)'

export type Ring = { cx: number; cy: number; rx: number; ry: number }
export type Arrow = { from: [number, number]; to: [number, number] }

export interface Note {
  text: string
  // Top-left of the words, in frame pixels
  at: [number, number]
  // Wrap width in frame pixels; one line if left out
  width?: number
  align?: 'left' | 'right'
  ring?: Ring
  arrow?: Arrow
}

interface MarkedUpProps {
  src: string
  alt: string
  // The screenshot's size in CSS pixels (the image itself is 2x)
  frame: [width: number, height: number]
  notes: Note[]
}

// A hand-drawn ring: one loop and a bit, so the ends overlap like a pen that didn't lift, with a
// slight wobble in the radius. Seeded by its position, so it draws the same every time
function ringPath({ cx, cy, rx, ry }: Ring) {
  const seed = (cx * 7 + cy * 13) % 360
  const start = (-2.2 + (seed % 10) / 20)
  const steps = 64
  const sweep = Math.PI * 2 + 0.45
  const pts: string[] = []
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const a = start + sweep * t
    const wobble = 1 + 0.025 * Math.sin(a * 3 + seed) + 0.03 * t
    pts.push(`${(cx + Math.cos(a) * rx * wobble).toFixed(1)},${(cy + Math.sin(a) * ry * wobble).toFixed(1)}`)
  }
  return `M${pts.join(' L')}`
}

// A slightly bowed line with an open head
function arrowPath({ from: [x1, y1], to: [x2, y2] }: Arrow) {
  const mx = (x1 + x2) / 2 - (y2 - y1) * 0.18
  const my = (y1 + y2) / 2 + (x2 - x1) * 0.18
  const angle = Math.atan2(y2 - my, x2 - mx)
  const head = 14
  const h1 = [x2 - head * Math.cos(angle - 0.5), y2 - head * Math.sin(angle - 0.5)]
  const h2 = [x2 - head * Math.cos(angle + 0.5), y2 - head * Math.sin(angle + 0.5)]
  return `M${x1},${y1} Q${mx},${my} ${x2},${y2} M${h1[0]},${h1[1]} L${x2},${y2} L${h2[0]},${h2[1]}`
}

export function MarkedUp({ src, alt, frame: [fw, fh], notes }: MarkedUpProps) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-120px' })
  const reduce = useReducedMotion()
  const shown = inView || reduce

  // Each note draws its ring, then its arrow, then its words, a beat after the one before
  const delay = (i: number, step = 0) => `${i * 220 + step * 160}ms`

  return (
    <div className={styles.root}>
      <div ref={ref} className="relative" style={{ aspectRatio: `${fw} / ${fh}` }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} className="absolute inset-0 h-full w-full" />

        <svg viewBox={`0 0 ${fw} ${fh}`} className="pointer-events-none absolute inset-0 h-full w-full" fill="none" aria-hidden>
          {notes.map((n, i) => (
            <g key={i} stroke={RED} strokeWidth={4.5} strokeLinecap="round" strokeLinejoin="round">
              {[n.ring && ringPath(n.ring), n.arrow && arrowPath(n.arrow)].map((d, step) => d && (
                <path
                  key={step}
                  d={d}
                  pathLength={1}
                  style={{
                    strokeDasharray: 1,
                    strokeDashoffset: shown ? 0 : 1,
                    transition: reduce ? 'none' : `stroke-dashoffset 600ms ${EASE} ${delay(i, step)}`,
                  }}
                />
              ))}
            </g>
          ))}
        </svg>

        {notes.map((n, i) => (
          <p
            key={i}
            className={`${marker.className} ${styles.note}`}
            style={{
              left: `${(n.at[0] / fw) * 100}%`,
              top: `${(n.at[1] / fh) * 100}%`,
              width: n.width ? `${(n.width / fw) * 100}%` : undefined,
              textAlign: n.align ?? 'left',
              color: RED,
              opacity: shown ? 1 : 0,
              transform: shown ? 'none' : 'translateY(4px)',
              transition: reduce ? 'opacity 200ms ease' : `opacity 300ms ease-out ${delay(i, 2)}, transform 300ms ${EASE} ${delay(i, 2)}`,
              // Frame pixels to container width: 28px on a 1200px frame
              ['--fs' as string]: `${(28 / fw) * 100}cqw`,
            }}
          >
            <span className={styles.words}>{n.text}</span>
            <span className={styles.number} style={n.align === 'right' ? { marginLeft: 'auto' } : undefined}>{i + 1}</span>
          </p>
        ))}
      </div>

      <ol className={`${marker.className} ${styles.list}`} style={{ color: RED }}>
        {notes.map((n, i) => <li key={i}>{n.text}</li>)}
      </ol>
    </div>
  )
}
