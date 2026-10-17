'use client'

import { useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { motion } from 'framer-motion'

// The editor's red grease pencil: loops round the selects, ticks, dashes and brackets. Every mark
// is generated from a seed, so each one is a little different but never changes between renders.
// The wobble is low frequency and small, so it reads as a steady hand, not a scribble.

export const hash = (s: string) => {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619)
  return h >>> 0
}

export function rng(seed: number) {
  let s = seed >>> 0 || 1
  return () => {
    s ^= s << 13; s >>>= 0
    s ^= s >>> 17
    s ^= s << 5; s >>>= 0
    return (s % 100000) / 100000
  }
}

type Pt = [number, number]

// A smooth path through the points (Catmull-Rom, as cubic Béziers)
function smooth(pts: Pt[]) {
  const f = (n: number) => n.toFixed(2)
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] ?? p2
    const c1: Pt = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6]
    const c2: Pt = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6]
    d += ` C${f(c1[0])} ${f(c1[1])} ${f(c2[0])} ${f(c2[1])} ${f(p2[0])} ${f(p2[1])}`
  }
  return d
}

// A loop drawn by hand round a w×h box: started at the upper left, carried round clockwise and
// past where it began, landing a touch outside the start. `box` is how square the corners are.
export function loopPath(w: number, h: number, seed: number, { pad = 4, box = true }: { pad?: number; box?: boolean } = {}) {
  const r = rng(seed)
  const cx = w / 2, cy = h / 2, rx = w / 2 + pad, ry = h / 2 + pad
  const n = box ? 3.6 + r() * 2.2 : 2.1 + r() * 0.3
  const e = 2 / n
  const start = -Math.PI * 0.68 + (r() - 0.5) * 0.7
  const turns = 1.07 + r() * 0.09
  const p1 = r() * 6.28, p2 = r() * 6.28
  const a1 = 0.008 + r() * 0.01, a2 = 0.006 + r() * 0.008
  const tilt = (r() - 0.5) * (box ? 0.03 : 0.08)
  const drift = 0.035 + r() * 0.03
  const steps = 72
  const pts: Pt[] = []
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const a = start + turns * Math.PI * 2 * t
    const ca = Math.cos(a), sa = Math.sin(a)
    const x = Math.sign(ca) * Math.abs(ca) ** e, y = Math.sign(sa) * Math.abs(sa) ** e
    const k = 1 + a1 * Math.sin(2 * a + p1) + a2 * Math.sin(3 * a + p2) + drift * (t - 0.45)
    const X = x * rx * k, Y = y * ry * k
    pts.push([cx + X * Math.cos(tilt) - Y * Math.sin(tilt), cy + X * Math.sin(tilt) + Y * Math.cos(tilt)])
  }
  return smooth(pts)
}

// A tick, about 12 wide, its short stroke first
export function tickPath(seed: number, s = 1) {
  const r = rng(seed)
  const j = () => (r() - 0.5) * 1.2
  return `M${0 + j()} ${5.5 * s + j()} C${1.6 * s} ${7 * s} ${2.6 * s} ${8.4 * s} ${3.6 * s + j()} ${9.6 * s} C${5.6 * s} ${5.4 * s} ${8.2 * s} ${2.2 * s} ${12 * s + j()} ${-0.4 * s + j()}`
}

// One stroke of grease pencil, drawn on when `on`, with a fainter second pass beside it for grain
export function Stroke({ d, on, delay = 0, duration = 0.6, width = 2, reduced = false }: { d: string; on: boolean; delay?: number; duration?: number; width?: number; reduced?: boolean }) {
  const shown = reduced ? { pathLength: 1, opacity: 1 } : on ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }
  const t = { pathLength: { delay, duration, ease: [0.55, 0.05, 0.3, 1] as const }, opacity: { delay, duration: 0.01 } }
  return (
    <>
      <g opacity={0.9}>
        <motion.path d={d} fill="none" stroke="var(--pen)" strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" initial={false} animate={shown} transition={t} />
      </g>
      <g opacity={0.35} transform="translate(0.7 0.5)">
        <motion.path d={d} fill="none" stroke="var(--pen)" strokeWidth={width * 0.45} strokeLinecap="round" initial={false} animate={shown} transition={t} />
      </g>
    </>
  )
}

// A loop round whatever it wraps, measured so the stroke is never stretched
export function Circled({ children, on, seed, delay = 0, pad = 10, width = 2.2, className = '', reduced, box = false, style }: { children: ReactNode; on: boolean; seed: string; delay?: number; pad?: number; width?: number; className?: string; reduced?: boolean; box?: boolean; style?: CSSProperties }) {
  const ref = useRef<HTMLSpanElement>(null)
  const [size, setSize] = useState({ w: 0, h: 0 })
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const measure = () => setSize({ w: el.offsetWidth, h: el.offsetHeight })
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  const d = useMemo(() => (size.w ? loopPath(size.w, size.h, hash(seed), { pad, box }) : ''), [size.w, size.h, seed, pad, box])
  return (
    <span ref={ref} className={`relative inline-block ${className}`} style={style}>
      {children}
      {d && (
        <svg aria-hidden className="pointer-events-none absolute left-0 top-0 overflow-visible" width={size.w} height={size.h}>
          <Stroke d={d} on={on} delay={delay} duration={0.75} width={width} reduced={reduced} />
        </svg>
      )}
    </span>
  )
}

// A short dash for a bullet, drawn left to right
export function Dash({ seed, on, delay = 0, reduced }: { seed: string; on: boolean; delay?: number; reduced?: boolean }) {
  const r = rng(hash(seed))
  const d = `M1 ${5 + (r() - 0.5) * 1.4} C5 ${4 + r() * 1.5} 9 ${5.5 - r() * 1.5} ${13 + r() * 2} ${4.5 + (r() - 0.5) * 1.6}`
  return (
    <svg aria-hidden width="16" height="10" viewBox="0 0 16 10" className="overflow-visible shrink-0">
      <Stroke d={d} on={on} delay={delay} duration={0.25} width={1.8} reduced={reduced} />
    </svg>
  )
}

// A tick, drawn after whatever it's ticking
export function Tick({ seed, on, delay = 0, size = 1, reduced }: { seed: string; on: boolean; delay?: number; size?: number; reduced?: boolean }) {
  return (
    <svg aria-hidden width={13 * size} height={11 * size} viewBox={`-1 -2 ${14 * size} ${13 * size}`} className="overflow-visible shrink-0">
      <Stroke d={tickPath(hash(seed), size)} on={on} delay={delay} duration={0.28} width={1.7} reduced={reduced} />
    </svg>
  )
}

// A tall bracket down the margin, for a note that applies to a whole paragraph
export function Bracket({ seed, on, delay = 0, height, reduced }: { seed: string; on: boolean; delay?: number; height: number; reduced?: boolean }) {
  const r = rng(hash(seed))
  const h = Math.max(24, height)
  const x = 6 + (r() - 0.5) * 1.5
  const d = `M${x + 5} ${1 + r()} C${x + 1} ${2} ${x - 0.5} ${4} ${x} ${10} C${x + 0.8} ${h * 0.35} ${x - 1.2} ${h * 0.65} ${x + 0.3} ${h - 10} C${x} ${h - 4} ${x + 2} ${h - 1} ${x + 5.5} ${h - 0.5}`
  return (
    <svg aria-hidden width="14" height={h} viewBox={`0 0 14 ${h}`} className="overflow-visible">
      <Stroke d={d} on={on} delay={delay} duration={0.7} width={1.8} reduced={reduced} />
    </svg>
  )
}

// A curling arrow from a note down to what it's about
export function Arrow({ on, delay = 0, reduced, flip = false }: { on: boolean; delay?: number; reduced?: boolean; flip?: boolean }) {
  return (
    <svg aria-hidden width="34" height="30" viewBox="0 0 34 30" className="overflow-visible" style={flip ? { transform: 'scaleX(-1)' } : undefined}>
      <Stroke d="M3 3 C14 2 26 6 27.5 20.5" on={on} delay={delay} duration={0.4} width={1.7} reduced={reduced} />
      <Stroke d="M22.5 15.5 C24.6 18 26.4 20.6 27.6 22.6 C28.6 20 30.2 17.6 32 15.6" on={on} delay={delay + 0.38} duration={0.2} width={1.7} reduced={reduced} />
    </svg>
  )
}

// Hand-drawn underline, as a background image so it follows the words across line breaks
const underline = (c: string) =>
  `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 14' preserveAspectRatio='none'><path d='M3 9.2 C70 6.4 140 8.6 210 7.4 S330 6.2 397 7.8' fill='none' stroke='${c}' stroke-width='3.4' stroke-linecap='round'/><path d='M8 11.4 C90 9.6 190 10.8 300 9.8 S370 9.4 392 10.2' fill='none' stroke='${c}' stroke-opacity='0.45' stroke-width='1.6' stroke-linecap='round'/></svg>`)}")`

// Colours, surfaces and the marker for the whole variant, for light and dark
export const CONTACT_CSS = `
  .cs-root {
    --paper: #f2efe8;
    --paper-line: rgba(40, 30, 10, 0.09);
    --strip: #131211;
    --edge: rgba(255, 238, 214, 0.62);
    --fill: #2a2927;
    --pen: #d4322a;
    --note: #fffefb;
    --tape: rgba(255, 251, 236, 0.72);
    --tape-edge: rgba(0, 0, 0, 0.06);
    --rest: 0 1px 1px rgba(30, 20, 0, 0.10), 0 2px 6px -2px rgba(30, 20, 0, 0.12);
    --lift: 0 30px 60px -18px rgba(30, 20, 0, 0.32), 0 14px 26px -12px rgba(30, 20, 0, 0.22);
    --grain: 0.55;
  }
  .dark .cs-root {
    --paper: #171614;
    --paper-line: rgba(255, 245, 225, 0.07);
    --strip: #040404;
    --edge: rgba(255, 228, 196, 0.48);
    --fill: #1f1e1c;
    --pen: #ff5446;
    --note: #1c1b19;
    --tape: rgba(255, 250, 235, 0.11);
    --tape-edge: rgba(255, 255, 255, 0.05);
    --rest: 0 1px 1px rgba(0, 0, 0, 0.5), 0 2px 8px -2px rgba(0, 0, 0, 0.6);
    --lift: 0 36px 70px -18px rgba(0, 0, 0, 0.85), 0 16px 30px -12px rgba(0, 0, 0, 0.7);
    --grain: 0.35;
  }
  .cs-hand { font-family: var(--font-signature), cursive; color: var(--pen); font-weight: 500; line-height: 1; }
  .cs-hl {
    background-image: ${underline('#d4322a')};
    background-repeat: no-repeat;
    background-position: 0 100%;
    background-size: 0% 0.5em;
    padding-bottom: 0.12em;
    color: var(--foreground);
    transition: background-size 0.9s cubic-bezier(0.6, 0.05, 0.3, 1);
  }
  .dark .cs-hl { background-image: ${underline('#ff5446')}; }
  .cs-on .cs-hl { background-size: 100% 0.5em; }
  .cs-frame:focus-visible { outline: 2px solid var(--pen); outline-offset: 3px; }
  .cs-grain {
    background-image: url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.5  0 0 0 0 0.45  0 0 0 0 0.38  0 0 0 0.09 0'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>`)}");
    opacity: var(--grain);
  }
  @media (prefers-reduced-motion: reduce) { .cs-hl { transition: none; } }
`
