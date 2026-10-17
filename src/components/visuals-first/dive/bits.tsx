'use client'

import { useEffect, useMemo, useState } from 'react'
import { animate } from 'framer-motion'
import { SCREENS } from '@/content/screens'
import type { WorkItem } from '@/content/work'
import { WorkLink, pad } from '@/components/showcase/shared'
import { useInView } from '../shared'

// Small pieces the Dive variant shares between its desktop scene and its phone layout.

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v))
export const smooth = (a: number, b: number, v: number) => clamp((v - a) / (b - a))
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t
export const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

const projects = new Set(SCREENS.map((s) => s.project)).size
export const KICKER = `${SCREENS.length} screens, ${projects} projects, one designer`

// The about line, shortened but in his words
export const ABOUT = 'I help scale-ups create high quality prototypes to win deals.'
export const ABOUT_SUB = 'My role has changed. I now orchestrate AI tools to multiply output.'

// true / false once known; null before the first paint, so nothing renders twice
export function useMedia(query: string) {
  const [match, setMatch] = useState<boolean | null>(null)
  useEffect(() => {
    const mq = window.matchMedia(query)
    setMatch(mq.matches)
    const on = () => setMatch(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [query])
  return match
}

// A stat whose numbers count up from zero the first time it is seen. "6s vs 21s" counts both.
export function CountUp({ value, reduced, className }: { value: string; reduced: boolean; className?: string }) {
  const [ref, seen] = useInView<HTMLSpanElement>('0px 0px -15% 0px', true)
  const parts = useMemo(() => value.split(/(\d+(?:\.\d+)?)/), [value])
  const [t, setT] = useState(0)
  useEffect(() => {
    if (!seen) return
    if (reduced) { setT(1); return }
    const c = animate(0, 1, { duration: 1.6, ease: [0.16, 1, 0.3, 1], onUpdate: setT })
    return () => c.stop()
  }, [seen, reduced])
  return (
    <span ref={ref} className={className}>
      <span className="sr-only">{value}</span>
      <span aria-hidden>
        {parts.map((p, i) => (i % 2 ? <span key={i}>{p.includes('.') ? (Number(p) * t).toFixed(1) : Math.round(Number(p) * t)}</span> : <span key={i}>{p}</span>))}
      </span>
    </span>
  )
}

// A case study's text: what it is, its numbers big, three things AI made possible, the way in
export function ChapterText({ item, index, reduced, size = 'lg' }: { item: WorkItem; index: number; reduced: boolean; size?: 'lg' | 'sm' }) {
  const lg = size === 'lg'
  return (
    <>
      <p className="flex items-center gap-3 text-xs uppercase tracking-widest" style={{ color: item.accent }}>
        <span className="font-mono tabular-nums">{pad(index + 1)}</span>
        <span className="h-px w-8" style={{ background: item.accent }} />
        <span className="truncate">{item.kicker}</span>
      </p>
      <h3 className={`mt-5 font-medium text-foreground text-balance ${lg ? 'text-[40px] leading-[1.06] tracking-[-0.028em]' : 'text-[30px] leading-[1.1] tracking-[-0.022em]'}`}>{item.title}</h3>
      <p className={`mt-4 text-muted text-pretty ${lg ? 'text-lg leading-relaxed' : 'text-base leading-relaxed'}`}>{item.summary}</p>

      {item.stats && (
        <div className={`flex flex-wrap gap-x-12 gap-y-6 ${lg ? 'mt-10' : 'mt-8'}`}>
          {item.stats.map((s) => (
            <div key={s.label} className="min-w-0">
              <CountUp
                value={s.value}
                reduced={reduced}
                className={`block font-medium tabular-nums text-foreground whitespace-nowrap ${lg ? 'text-[88px] leading-[0.9] tracking-[-0.05em]' : 'text-[64px] leading-[0.9] tracking-[-0.045em]'}`}
              />
              <p className="mt-3 flex items-start gap-2 text-sm text-muted max-w-[220px] leading-snug">
                <span className="mt-[7px] h-px w-3 shrink-0" style={{ background: item.accent }} />
                {s.label}
              </p>
            </div>
          ))}
        </div>
      )}

      <ul className={`space-y-3 ${lg ? 'mt-10' : 'mt-8'}`}>
        {item.features.slice(0, 3).map((f, i) => (
          <li key={f} className="flex gap-3 text-sm leading-relaxed text-foreground">
            <span className="mt-[3px] shrink-0 font-mono text-xs tabular-nums" style={{ color: item.accent }}>{pad(i + 1)}</span>
            <span className="text-pretty">{f}</span>
          </li>
        ))}
      </ul>

      <WorkLink
        item={item}
        className={`self-start inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${lg ? 'mt-10' : 'mt-8'}`}
        style={{ outlineColor: item.accent }}
      />
    </>
  )
}
