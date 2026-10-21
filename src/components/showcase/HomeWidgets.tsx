'use client'

import { useEffect, useRef, useState } from 'react'
import { FunnelDiagram } from '@/components/FunnelDiagram'
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

// SEEK: the funnel from the case study, as it's drawn there
function SeekFunnel() {
  return (
    // No box round it: the diagram sits on the card's colour
    <div className="flex h-full w-full items-center justify-center p-6 [&>figure]:my-0 [&>figure]:w-full [&_figure>div]:border-0">
      <FunnelDiagram stages={[
        { label: 'Impressions' },
        { label: 'Find the right course (tabs)', highlight: true, assumption: 'Too much friction to find a course' },
        { label: 'Select a course', highlight: true, assumption: 'Missing design details' },
        { label: 'Course information' },
        { label: 'Lead/Link', highlight: true, assumption: 'Too long to make a connection' },
      ]} />
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
  if (kind === 'seek-funnel') return <Scaled w={820} h={512}><SeekFunnel /></Scaled>
  if (kind === 'seek-ab') return <Scaled w={640} h={400}><SeekAB /></Scaled>
  return <ShaderWallInner kind={kind} />
}
