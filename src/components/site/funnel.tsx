'use client'

import { useEffect, useRef, useState } from 'react'
import { GREY, INK, LINE, SHELL } from '@/components/site/style'

// The funnel, redrawn from the long SEEK case study for the short template: a funnel of stages,
// the steps where people dropped out in ink, the assumption about why beside each (the site's tones, no hue). One switch flips it from the first
// release to after the fixes: those steps close (the funnel widens and they turn white like the rest), each assumption becomes its fix,
// and the result at the bottom goes from one number to the other. A card links to its section.
// It draws itself in once, the first time it scrolls into view.

export type FunnelStage = { label: string; assumption?: string; fix?: string; href?: string } // assumption: why people dropped out here
export type FunnelState = { label: string; result: string; widths: number[] } // widths: % of the column, one per stage
export type FunnelData = { stages: FunnelStage[]; before: FunnelState; after: FunnelState }

const EASE = 'cubic-bezier(0.77, 0, 0.175, 1)' // on-screen morph
const EASE_OUT = 'cubic-bezier(0.23, 1, 0.32, 1)' // entering

// A stage as a trapezoid: its own width at the top, the next stage's at the bottom
function shape(widths: number[], i: number) {
  const t = widths[i] / 2
  const b = (widths[i + 1] ?? widths[i] * 0.9) / 2
  return `polygon(${50 - t}% 0, ${50 + t}% 0, ${50 + b}% 100%, ${50 - b}% 100%)`
}

export function Funnel({ data }: { data: FunnelData }) {
  const [fixed, setFixed] = useState(false)
  const [shown, setShown] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setShown(true); io.disconnect() } }, { rootMargin: '-80px' })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const state = fixed ? data.after : data.before
  const leaks = data.stages.map((s, i) => ({ s, i })).filter(({ s }) => s.assumption)
  const side = (i: number) => (leaks.findIndex((l) => l.i === i) % 2 === 0 ? 'right' : 'left')
  const enter = (delay: number) => ({
    opacity: shown ? 1 : 0,
    transform: shown ? 'none' : 'translateY(8px)',
    transition: `opacity 400ms ${EASE_OUT} ${delay}ms, transform 400ms ${EASE_OUT} ${delay}ms`,
  })

  const card = (s: FunnelStage, n: number) => (
    <a href={s.href} className="block rounded-[12px] bg-white px-3 py-2 text-[13px] leading-[20px] transition-transform duration-150 ease-out active:scale-[0.97]" style={{ boxShadow: `0 0 0 1px ${LINE}` }}>
      <span style={{ color: GREY }}>{fixed ? `Fix ${n}` : `Assumption ${n}`}</span>
      <span className="block text-pretty" style={{ color: INK }}>{fixed ? s.fix : s.assumption}</span>
    </a>
  )

  return (
    <div ref={ref} className="flex flex-col items-center gap-6 rounded-[20px] px-3 py-8 min-[600px]:px-8" style={{ background: SHELL }}>
      {/* The switch: first release, or after the fixes, with the result each got */}
      <div role="tablist" aria-label="Funnel" className="grid grid-cols-2 rounded-full bg-white p-1 text-[13px] leading-[20px]" style={{ boxShadow: `0 0 0 1px ${LINE}` }}>
        {[data.before, data.after].map((st, k) => {
          const on = fixed === (k === 1)
          return (
            <button key={st.label} role="tab" aria-selected={on} onClick={() => setFixed(k === 1)}
              className="rounded-full px-3 py-1 transition-[background-color,color,transform] duration-150 ease-out active:scale-[0.97]"
              style={{ background: on ? INK : 'transparent', color: on ? '#fff' : GREY }}>
              {st.label} <span className="tabular-nums" style={{ opacity: 0.7 }}>{st.result}</span>
            </button>
          )
        })}
      </div>

      <div className="grid w-full grid-cols-1 gap-y-1 min-[600px]:grid-cols-[1fr_minmax(0,280px)_1fr] min-[600px]:gap-x-6">
        {data.stages.map((s, i) => {
          const n = leaks.findIndex((l) => l.i === i) + 1
          const leak = !!s.assumption
          return (
            <div key={s.label} className="contents">
              <div className="relative hidden h-14 min-[600px]:block" style={enter(500 + i * 60)}>{leak && side(i) === 'left' && <div className="absolute inset-x-0 top-1/2 -translate-y-1/2">{card(s, n)}</div>}</div>
              <div className="relative flex h-14 items-center justify-center" style={enter(i * 60)}>
                <div aria-hidden className="absolute inset-0" style={{
                  clipPath: shape(state.widths, i),
                  background: leak && !fixed ? INK : '#fff',
                  transition: `clip-path 500ms ${EASE}, background-color 300ms ease`,
                }} />
                <span className="relative text-center text-[13px] leading-[16px]" style={{ color: leak ? (fixed ? INK : '#fff') : GREY, transition: 'color 300ms ease' }}>
                  {s.label}{leak && <span className="min-[600px]:hidden"> · {n}</span>}
                </span>
              </div>
              <div className="relative hidden h-14 min-[600px]:block" style={enter(500 + i * 60)}>{leak && side(i) === 'right' && <div className="absolute inset-x-0 top-1/2 -translate-y-1/2">{card(s, n)}</div>}</div>
            </div>
          )
        })}
      </div>

      {/* Phones: no room beside the funnel, so the cards follow it */}
      <div className="grid w-full gap-2 min-[600px]:hidden">
        {leaks.map(({ s }, k) => <div key={s.label}>{card(s, k + 1)}</div>)}
      </div>
    </div>
  )
}
