'use client'

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { motion, useMotionValue, useScroll, useSpring } from 'framer-motion'
import { ScreenTile } from '../shared'
import { CELLS, COLS, ROWS, seeded, type Cell } from './layout'
import { QuoteCell } from './Quote'

// The eye test. Every screen starts out thrown on the table like a pile of prints: turned,
// overlapping, a few still sliding. Scroll and they fly, nearest the middle first, into their
// slots in the mosaic and lock. Then the clips start playing and the quotes pop.
//
// One scroll value drives everything: a spring on it gives the flight some weight, and a single
// animation frame loop writes every tile's transform straight to the DOM, so scrolling never
// re-renders fifty components.

const HEADER = 56

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
// Past zero and back: the small settle as a print lands
const easeBack = (t: number, k = 1.9) => 1 + (k + 1) * Math.pow(t - 1, 3) + k * Math.pow(t - 1, 2)

interface Rect { x: number; y: number; w: number; h: number }
interface Pose { dx: number; dy: number; rot: number; sc: number; delay: number; drift: number; ph: number; z: number }

// Where every tile sits in the mosaic, for this window
function geometry(W: number, vh: number) {
  const stageH = Math.max(560, vh - HEADER)
  const big = W >= 1680
  const gap = big ? 10 : 8
  const padX = big ? 16 : 12
  const padY = big ? 20 : 16
  const colFull = (W - 2 * padX - (COLS - 1) * gap) / COLS
  const rowIdeal = (2 * colFull + gap) / 1.6
  const rowFit = (stageH - 2 * padY - (ROWS - 1) * gap) / ROWS
  // As big as fits the screen. A wide, short window narrows the wall rather than squash the
  // screens past about 2:1; only a very short one gets a wall taller than the screen.
  const row = Math.max(Math.min(rowFit, rowIdeal), 56)
  const col = Math.min(colFull, (1.9 * row - gap) / 2)
  const mw = COLS * col + (COLS - 1) * gap
  const mh = ROWS * row + (ROWS - 1) * gap
  const h = Math.max(stageH, Math.ceil(mh + 2 * padY))
  const x0 = (W - mw) / 2
  const y0 = (h - mh) / 2
  // Both edges rounded the same way, so every gutter is exactly `gap`
  const rects: Rect[] = CELLS.map((c) => {
    const x = Math.round(x0 + c.c * (col + gap))
    const y = Math.round(y0 + c.r * (row + gap))
    const x1 = Math.round(x0 + (c.c + c.w) * (col + gap)) - gap
    const y1 = Math.round(y0 + (c.r + c.h) * (row + gap)) - gap
    return { x, y, w: x1 - x, h: y1 - y }
  })
  return { W, stageH, h, gap, rects, mw, mh, x0, y0, big }
}

// Where every tile lands on the table, and how it gets to its slot
function poses(g: ReturnType<typeof geometry>): Pose[] {
  const rnd = seeded(11)
  const n = CELLS.length
  const gc = Math.ceil(Math.sqrt(n * 2.2))
  const gr = Math.ceil(n / gc)
  // Shuffle which spot on the table each tile gets
  const spots = Array.from({ length: gc * gr }, (_, i) => i)
  for (let i = spots.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [spots[i], spots[j]] = [spots[j], spots[i]] }
  const cx = g.W / 2
  const cy = g.h / 2
  const maxD = Math.hypot(g.mw / 2, g.mh / 2)
  const tableW = Math.min(g.W * 0.94, g.mw * 1.04)
  const tableT = g.h * 0.04
  const tableH = g.h * 0.8
  return CELLS.map((cell, i) => {
    const r = g.rects[i]
    const spot = spots[i]
    const gx = spot % gc
    const gy = Math.floor(spot / gc)
    const sx = cx - tableW / 2 + ((gx + 0.5 + (rnd() - 0.5) * 0.95) / gc) * tableW
    const sy = tableT + ((gy + 0.5 + (rnd() - 0.5) * 0.9) / gr) * tableH
    const area = cell.w * cell.h
    // Big prints are held back a little, small ones a little bigger, so the pile reads evenly
    const sc = (area >= 8 ? 0.6 : area >= 6 ? 0.66 : area >= 4 ? 0.82 : area === 3 ? 0.86 : 1) * (0.9 + rnd() * 0.22)
    const sign = rnd() < 0.5 ? -1 : 1
    const rot = sign * (2 + rnd() * 10)
    const mx = r.x + r.w / 2
    const my = r.y + r.h / 2
    const d = Math.hypot(mx - cx, (my - cy) * 1.4) / maxD
    return {
      dx: sx - mx,
      dy: sy - my,
      rot,
      sc,
      delay: clamp(d * 0.38 + rnd() * 0.06, 0, 0.46),
      drift: rnd() < 0.24 ? 1 : 0,
      ph: rnd() * Math.PI * 2,
      z: cell.quote ? 30 + Math.floor(rnd() * 20) : Math.floor(rnd() * 40),
    }
  })
}

export function Wall({ width, reduced, onFocus }: { width: number; reduced: boolean; onFocus?: (f: number) => void }) {
  const track = useRef<HTMLDivElement>(null)
  const tiles = useRef<(HTMLDivElement | null)[]>([])
  const shades = useRef<(HTMLDivElement | null)[]>([])
  const labels = useRef<(HTMLDivElement | null)[]>([])
  const [vh, setVh] = useState(900)
  const [top, setTop] = useState(0)
  const [locked, setLocked] = useState(reduced)
  const lockedRef = useRef(locked)
  const g = useMemo(() => geometry(width, vh), [width, vh])
  const p = useMemo(() => poses(g), [g])
  const PIN = reduced ? 0 : Math.round(vh * 0.95)

  // Where the wall is on the page
  useLayoutEffect(() => {
    const measure = () => {
      setVh(window.innerHeight)
      if (track.current) setTop(track.current.getBoundingClientRect().top + window.scrollY)
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(document.body)
    window.addEventListener('resize', measure)
    return () => { ro.disconnect(); window.removeEventListener('resize', measure) }
  }, [])

  // Scroll: the assembly, then the three case studies singled out
  const { scrollY } = useScroll()
  const raw = useMotionValue(reduced ? 1 : 0)
  const focus = useMotionValue(0)
  const spring = useSpring(raw, { stiffness: 70, damping: 18, mass: 0.9, restDelta: 0.0004 })
  useEffect(() => {
    const pinAt = top - HEADER
    const s0 = Math.max(0, top - vh * 0.95)
    const s1 = pinAt + PIN * 0.5
    const f0 = pinAt + PIN * 0.68
    const f1 = pinAt + PIN * 0.96
    const on = (y: number) => {
      if (!reduced) raw.set(clamp((y - s0) / Math.max(1, s1 - s0)))
      // Without motion there's no pinned moment to single them out in, so the wall stays as it is
      focus.set(reduced ? 0 : clamp((y - f0) / Math.max(1, f1 - f0)))
      onFocus?.(focus.get())
    }
    on(scrollY.get())
    return scrollY.on('change', on)
  }, [top, vh, PIN, reduced, raw, focus, scrollY, onFocus])
  useEffect(() => { if (reduced) { raw.set(1); spring.jump(1) } }, [reduced, raw, spring])

  // Every tile's transform, written straight to the DOM
  const write = (pv: number, fv: number, t: number) => {
    for (let i = 0; i < CELLS.length; i++) {
      const el = tiles.current[i]
      if (!el) continue
      const q = p[i]
      const cell = CELLS[i]
      const local = clamp((pv - q.delay) / (1 - 0.46))
      const e = easeInOut(local)
      const er = easeBack(local)
      const lift = Math.sin(Math.PI * local) * 0.07
      const away = 1 - e
      let x = q.dx * away
      let y = q.dy * away
      let r = q.rot * (1 - er)
      if (q.drift && away > 0.001) {
        x += Math.sin(t * 0.35 + q.ph) * 14 * away
        y += Math.cos(t * 0.27 + q.ph) * 9 * away
        r += Math.sin(t * 0.21 + q.ph) * 1.6 * away
      }
      // The three case studies step forward as the rest recedes
      // Configurator's three tiles sit shoulder to shoulder, so they stay lit without growing into the gutters
      const lead = !!cell.featured?.lead && cell.featured.item.id !== 'configurator'
      const s = q.sc + (1 - q.sc) * e + lift + (lead ? 0.03 * fv : 0)
      el.style.transform = away < 0.0005 && Math.abs(r) < 0.01 && s === 1 ? '' : `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) rotate(${r.toFixed(2)}deg) scale(${s.toFixed(4)})`
      if (cell.lit) el.style.zIndex = fv > 0 ? (lead ? '56' : '55') : String(q.z)
      const sh = shades.current[i]
      if (sh) sh.style.opacity = String(Math.max(0, away * 1.2 - 0.05, lead ? fv : 0).toFixed(3))
      // The rest steps back so the three case studies stand out
      const dim = cell.lit ? 0 : cell.quote ? 0.35 : 0.78
      el.style.opacity = fv > 0 ? String((1 - dim * fv).toFixed(3)) : ''
      const lab = labels.current[i]
      if (lab) lab.style.opacity = String(clamp(fv * 1.6).toFixed(3))
    }
  }

  useLayoutEffect(() => {
    if (reduced) { write(1, focus.get(), 0); return }
    write(spring.get(), focus.get(), performance.now() / 1000)
    let raf = 0
    let running = false
    let lastP = -1
    let lastF = -1
    const tick = (now: number) => {
      const pv = spring.get()
      const fv = focus.get()
      if (pv < 0.9999 || pv !== lastP || fv !== lastF) {
        write(pv, fv, now / 1000)
        lastP = pv
        lastF = fv
      }
      const isLocked = pv > 0.995
      if (isLocked !== lockedRef.current && (isLocked || pv < 0.95)) {
        lockedRef.current = isLocked
        setLocked(isLocked)
      }
      if (running) raf = requestAnimationFrame(tick)
    }
    const io = new IntersectionObserver(([en]) => {
      if (en.isIntersecting && !running) { running = true; raf = requestAnimationFrame(tick) }
      else if (!en.isIntersecting) { running = false; cancelAnimationFrame(raf) }
    }, { rootMargin: '300px 0px' })
    if (track.current) io.observe(track.current)
    return () => { running = false; io.disconnect(); cancelAnimationFrame(raf) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [g, p, reduced])

  return (
    <div ref={track} className="relative" style={{ height: g.h + PIN }}>
      <div className="mz-wall sticky overflow-visible" style={{ top: HEADER, height: g.h, isolation: 'isolate' }} data-locked={locked} data-marked={locked}>
        {CELLS.map((cell, i) => {
          const r = g.rects[i]
          return (
            <div
              key={cell.key}
              ref={(el) => { tiles.current[i] = el }}
              className="mz-tile absolute"
              data-quote={cell.quote ? '' : undefined}
              style={{ left: r.x, top: r.y, width: r.w, height: r.h, zIndex: p[i].z, willChange: reduced ? undefined : 'transform' }}
            >
              <div ref={(el) => { shades.current[i] = el }} aria-hidden className="mz-shade absolute inset-0 rounded-lg pointer-events-none" style={{ opacity: reduced ? 0 : 1 }} />
              <div className="mz-inner absolute inset-0 rounded-lg">
                {cell.quote ? (
                  <QuoteCell
                    t={cell.quote}
                    colour={cell.colour}
                    w={r.w}
                    h={r.h}
                    size={cell.w >= 4 ? 'lg' : 'sm'}
                    anchor={{ x: cell.c + cell.w / 2 <= COLS / 2 ? 'left' : 'right', y: cell.r + cell.h > ROWS / 2 + 1 ? 'bottom' : 'top' }}
                    locked={locked}
                    delay={p[i].delay * 0.6}
                    popWidth={g.big ? 460 : 400}
                    pop={!reduced}
                  />
                ) : (
                  <ScreenCell cell={cell} play={locked} />
                )}
              </div>
              {cell.featured?.lead && (
                <div ref={(el) => { labels.current[i] = el }} aria-hidden className="pointer-events-none absolute left-3 bottom-3 flex items-center gap-2 rounded-full pl-1.5 pr-3 py-1 text-xs font-medium text-white shadow-lg" style={{ background: cell.featured.item.accent, opacity: 0 }}>
                  <span className="rounded-full bg-black/20 px-1.5 font-mono text-[10px] leading-4">0{cell.featured.index + 1}</span>
                  {cell.featured.item.name}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// A screen in the wall: links to its case study, and says what it is on hover
function ScreenCell({ cell, play }: { cell: Cell; play: boolean }) {
  const s = cell.screen!
  const body = (
    <>
      <ScreenTile screen={s} fit="cover" play={play} className="h-full w-full rounded-lg" style={{ background: 'color-mix(in srgb, var(--foreground) 5%, var(--background))' }} />
      <span aria-hidden className="mz-ring pointer-events-none absolute inset-0 rounded-lg" />
      <span aria-hidden className="mz-cap pointer-events-none absolute left-2 bottom-2 flex max-w-[calc(100%-16px)] items-center gap-1.5 rounded-full py-1 pl-2 pr-2.5 text-[11px] leading-none text-foreground">
        <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: cell.colour }} />
        <span className="truncate">{s.title}</span>
      </span>
    </>
  )
  return s.href ? (
    <a href={s.href} className="mz-link absolute inset-0 rounded-lg outline-none" aria-label={`${s.title}, ${s.project}`}>{body}</a>
  ) : (
    <div className="absolute inset-0 rounded-lg">{body}</div>
  )
}

export const WALL_CSS = `
  .mz-shade { box-shadow: 0 18px 40px -14px rgba(0,0,0,.55), 0 3px 10px -2px rgba(0,0,0,.22); }
  .mz-ring { box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--foreground) 9%, transparent); }
  .mz-inner { transition: transform .4s cubic-bezier(.2,.8,.2,1), box-shadow .4s cubic-bezier(.2,.8,.2,1); }
  .mz-cap {
    background: color-mix(in srgb, var(--background) 88%, transparent);
    box-shadow: 0 0 0 1px color-mix(in srgb, var(--foreground) 10%, transparent), 0 4px 12px -4px rgba(0,0,0,.3);
    opacity: 0; transform: translateY(4px);
    transition: opacity .2s ease, transform .3s cubic-bezier(.2,.8,.2,1);
  }
  .mz-wall[data-locked="true"] .mz-tile:not([data-quote]):hover .mz-inner,
  .mz-wall[data-locked="true"] .mz-tile:not([data-quote]):focus-within .mz-inner {
    transform: translateY(-4px) scale(1.035);
    box-shadow: 0 22px 44px -16px rgba(0,0,0,.6), 0 0 0 1px color-mix(in srgb, var(--foreground) 14%, transparent);
  }
  .mz-wall[data-locked="true"] .mz-tile:hover .mz-cap,
  .mz-wall[data-locked="true"] .mz-tile:focus-within .mz-cap { opacity: 1; transform: none; }
  .mz-wall[data-locked="true"] .mz-tile:hover,
  .mz-wall[data-locked="true"] .mz-tile:focus-within { z-index: 60 !important; opacity: 1 !important; }
  .mz-link:focus-visible { box-shadow: 0 0 0 2px var(--background), 0 0 0 4px var(--foreground); }
`

// The same pieces for a phone or a small tablet: a dense grid, each tile fading in as it arrives
export function SmallGrid({ cells, cols, reduced }: { cells: Cell[]; cols: number; reduced: boolean }) {
  return (
    <div
      className="mz-wall grid gap-2 px-3 py-3"
      data-locked="true"
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, gridAutoRows: `calc((100vw - 24px - ${(cols - 1) * 8}px) / ${cols} / 1.6)`, gridAutoFlow: 'dense' }}
    >
      {cells.map((cell, i) => (
        <motion.div
          key={cell.key}
          className="mz-tile relative"
          data-quote={cell.quote ? '' : undefined}
          style={{ gridColumn: `span ${Math.min(cols, cell.w)}`, gridRow: `span ${cell.h}` }}
          initial={reduced ? false : { opacity: 0, y: 16, scale: 0.97 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1], delay: (i % cols) * 0.06 }}
        >
          <div className="mz-inner absolute inset-0 rounded-lg">
            {cell.quote ? (
              <SmallQuote cell={cell} reduced={reduced} />
            ) : (
              <ScreenCell cell={cell} play />
            )}
          </div>
        </motion.div>
      ))}
    </div>
  )
}

function SmallQuote({ cell, reduced }: { cell: Cell; reduced: boolean }) {
  const [w, setW] = useState(320)
  const ref = useRef<HTMLDivElement>(null)
  const [seen, setSeen] = useState(reduced)
  useEffect(() => {
    const el = ref.current
    if (!el || seen) return
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect() } }, { rootMargin: '0px 0px -25% 0px' })
    io.observe(el)
    return () => io.disconnect()
  }, [seen])
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(() => setW(el.clientWidth))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return (
    <div ref={ref} className="absolute inset-0" data-marked={seen}>
      <QuoteCell t={cell.quote!} colour={cell.colour} w={w} h={ref.current?.clientHeight ?? 200} size="lg" font={cell.h === 1 ? 17 : 19} anchor={{ x: 'left', y: 'top' }} locked={seen} delay={0.15} pop={!reduced} popWidth={w} />
    </div>
  )
}
