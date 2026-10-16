'use client'

import { useEffect, useRef, useState } from 'react'
import { Backdrop } from '@/components/ClipFrame'
import { FONT, REPORTS, type Report } from './wallbounce-data'

// Wallbounce's frame strip, drawn by the page instead of the game's canvas, large enough to read.
// It plays three real slides from the game's own movement code, in turn: a press too late, one
// too early, and a bounce. Each slide fills in frame by frame, then the input the verdict is
// about is boxed and the verdict comes up. Same palette, font and layout as the game.

const PAL = { bg: '#0a0808', dim: '#4b4340', fg: '#ece4d6', accent: '#c9151e' }
const CELL = 4
const LABEL = 20
const VIEW_W = 132
const VIEW_H = 46
const FRAME_MS = 110 // one game frame, slowed down so you can follow it
const HOLD_MS = 2600

// Text in the game's 3x5 font, centred on cx, as one path
function glyphs(text: string, cx: number, y: number): string {
  const x0 = Math.round(cx - (text.length * 4 - 1) / 2)
  let d = ''
  for (let i = 0; i < text.length; i++) {
    const bits = FONT[text[i]]
    if (!bits) continue
    for (let gy = 0; gy < 5; gy++) for (let gx = 0; gx < 3; gx++) {
      if (bits[gy * 3 + gx] === '#') d += `M${x0 + i * 4 + gx} ${y + gy}h1v1h-1z`
    }
  }
  return d
}

function Strip({ report, shown, verdict }: { report: Report; shown: number; verdict: boolean }) {
  const cells = report.cells.slice(-36)
  const skipped = report.cells.length - cells.length
  const width = LABEL + cells.length * CELL
  const x = Math.round(VIEW_W / 2 - width / 2)
  const y = 20
  const colour = report.good ? PAL.fg : PAL.accent
  const rows: [string, (i: number) => string][] = [
    ['WALL', (i) => (cells[i][0] === 'o' ? PAL.fg : cells[i][0] === 'h' ? PAL.accent : PAL.dim)],
    ['A', (i) => (cells[i][1] ? PAL.fg : PAL.dim)],
    ['BACK', (i) => (cells[i][2] ? PAL.fg : PAL.dim)],
  ]
  const mark = report.mark - skipped
  const mx = x + LABEL + mark * CELL - 1
  return (
    <g>
      {verdict && (
        <>
          <path d={glyphs(report.headline, VIEW_W / 2, 4)} fill={colour} />
          <path d={glyphs(report.detail, VIEW_W / 2, 11)} fill={PAL.fg} />
        </>
      )}
      {rows.map(([name, fill], row) => {
        const ry = y + 2 + row * 8
        return (
          <g key={name}>
            <path d={glyphs(name, x + LABEL / 2 - 2, ry)} fill={PAL.fg} />
            {cells.slice(0, shown).map((_, i) => (
              <rect key={i} x={x + LABEL + i * CELL} y={ry} width={CELL - 1} height={5} fill={fill(i)} />
            ))}
          </g>
        )
      })}
      {verdict && mark >= 0 && (
        <path d={`M${mx} ${y}h1v23h-1zM${mx + CELL} ${y}h1v23h-1zM${mx} ${y}h${CELL}v1h-${CELL}zM${mx} ${y + 22}h${CELL + 1}v1h-${CELL + 1}z`} fill={colour} />
      )}
    </g>
  )
}

export function FrameStripReplay({ bare = false }: { bare?: boolean }) {
  const box = useRef<HTMLDivElement>(null)
  const [index, setIndex] = useState(REPORTS.length - 1)
  const [shown, setShown] = useState(REPORTS[REPORTS.length - 1].cells.length)
  const [verdict, setVerdict] = useState(true)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = box.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.35 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  // Play: each slide fills in a frame at a time, then the verdict, then the next slide
  useEffect(() => {
    if (!visible || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let gone = false
    const timers: ReturnType<typeof setTimeout>[] = []
    const at = (ms: number, fn: () => void) => timers.push(setTimeout(() => { if (!gone) fn() }, ms))
    const play = (i: number, t0: number) => {
      const r = REPORTS[i]
      const n = Math.min(36, r.cells.length)
      at(t0, () => { setIndex(i); setShown(0); setVerdict(false) })
      for (let k = 1; k <= n; k++) at(t0 + 300 + k * FRAME_MS, () => setShown(k))
      const end = t0 + 300 + n * FRAME_MS + 250
      at(end, () => setVerdict(true))
      at(end + HOLD_MS, () => play((i + 1) % REPORTS.length, 0))
    }
    play(0, 0)
    return () => { gone = true; timers.forEach(clearTimeout) }
  }, [visible])

  const strip = (
    <div ref={box} className="overflow-hidden rounded-xl shadow-2xl ring-1 ring-black/20" style={{ background: PAL.bg }}>
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        className="block w-full"
        shapeRendering="crispEdges"
        role="img"
        aria-label="The frame strip judging three slides: two frames late, four frames early, then a bounce on frame four of five"
      >
        <Strip report={REPORTS[index]} shown={shown} verdict={verdict} />
      </svg>
    </div>
  )
  if (bare) return strip
  return (
    <figure className="my-8 not-prose">
      <Backdrop className="p-6 sm:p-12">{strip}</Backdrop>
    </figure>
  )
}
