'use client'

import { useEffect, useRef, useState } from 'react'
import { ShaderWallInner } from '@/components/showcase/ShaderWallWidgets'
import type { Widget } from '@/content/home-showcase'

// The homepage's hand-built details: small live pieces for what a recording can't show (Shader
// Wall's canvas) or what the case study draws itself (SEEK's funnel). Each is laid out at one
// size and scaled to its card, like the replays, so it looks the same at any width.

function Scaled({ w, h, children }: { w: number; h: number; children: React.ReactNode }) {
  const box = useRef<HTMLDivElement>(null)
  const [k, setK] = useState(0)
  useEffect(() => {
    const el = box.current
    if (!el) return
    const fit = () => setK(el.clientWidth / w)
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(el)
    return () => ro.disconnect()
  }, [w])
  return (
    <div ref={box} className="absolute inset-0 overflow-hidden">
      <div className="absolute left-0 top-0 origin-top-left" style={{ width: w, height: h, transform: `scale(${k})` }}>{children}</div>
    </div>
  )
}

// SEEK: the funnel from the case study, redrawn for a card a third of the page wide. The case
// study's diagram shrank to unreadable there, so this one has big type and solid colour: each
// stage a bar narrowing down the page, the three leaks in SEEK pink with what was wrong beside them
const FUNNEL = [
  { label: 'Impressions' },
  { label: 'Find a course', leak: 'Too much friction to find one' },
  { label: 'Select a course', leak: 'Missing design details' },
  { label: 'Course information' },
  { label: 'Lead / link', leak: 'Too long to make a connection' },
]
const SEEK_PINK = '#E60278'

function SeekFunnel() {
  const top = 290, bottom = 130, row = 62, gap = 8
  const width = (i: number) => top - (i / FUNNEL.length) * (top - bottom)
  return (
    <div className="absolute inset-0 flex flex-col justify-center px-8" style={{ gap }}>
      {FUNNEL.map((s, i) => {
        const w0 = width(i), w1 = width(i + 1), inset = (w0 - w1) / 2
        return (
          <div key={s.label} className="flex items-center" style={{ height: row }}>
            {/* The bar, centred in its column and narrowing to the next one */}
            <div className="flex w-[300px] shrink-0 justify-center">
              <div
                className="flex items-center justify-center"
                style={{
                  width: w0, height: row,
                  clipPath: `polygon(0 0, 100% 0, ${w0 - inset}px 100%, ${inset}px 100%)`,
                  background: s.leak ? SEEK_PINK : '#fff',
                }}
              >
                <span className={`text-[20px] leading-6 ${s.leak ? 'font-semibold text-white' : 'font-medium text-zinc-500'}`}>{s.label}</span>
              </div>
            </div>
            {s.leak && (
              <div className="ml-5 flex items-center gap-3">
                <span className="h-[2px] w-6 shrink-0" style={{ background: SEEK_PINK }} />
                <span className="text-[20px] font-medium leading-[26px] text-zinc-900">{s.leak}</span>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// SEEK: the original course card against the improved one, taking turns in the spotlight
function SeekAB() {
  const [b, setB] = useState(false)
  useEffect(() => {
    const id = setInterval(() => setB((x) => !x), 2200)
    return () => clearInterval(id)
  }, [])
  const label = (on: boolean, letter: string, text: string) => (
    <div className={`flex items-center gap-2 rounded-full border px-3 py-1 text-[13px] transition-colors duration-500 ${on ? 'border-foreground bg-foreground text-background' : 'border-border bg-background text-muted'}`}>
      <span className="font-semibold">{letter}</span>{text}
    </div>
  )
  const half = (side: 'left' | 'right', on: boolean) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/case-studies/seek-learning/select-a-course.webp"
      alt=""
      className="absolute inset-x-0 top-0 h-[86%] w-full object-contain transition-opacity duration-500"
      style={{ clipPath: side === 'left' ? 'inset(0 50% 0 0)' : 'inset(0 0 0 50%)', opacity: on ? 1 : 0.4 }}
    />
  )
  // The two phones straight on the card; the side not in the spotlight fades back
  return (
    <div className="relative h-full w-full">
      {half('left', !b)}
      {half('right', b)}
      <div className="absolute inset-x-0 bottom-4 flex justify-around">
        {label(!b, 'A', 'The first card')}
        {label(b, 'B', 'Logo, course name first')}
      </div>
    </div>
  )
}

export function HomeWidget({ kind }: { kind: Widget }) {
  if (kind === 'seek-funnel') return <Scaled w={704} h={440}><SeekFunnel /></Scaled>
  if (kind === 'seek-ab') return <Scaled w={640} h={400}><SeekAB /></Scaled>
  return <ShaderWallInner kind={kind} />
}
