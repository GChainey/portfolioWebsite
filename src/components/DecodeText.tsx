'use client'

import { useEffect, useRef, useState } from 'react'
import { useInView } from 'framer-motion'

// Text that decodes in from binary the first time it scrolls into view, like the readouts in
// Ghost in the Shell: every letter starts as a flickering 0 or 1 and settles into place, left to
// right. Each letter keeps its real width underneath (the bit sits over it), so nothing reflows
// while it plays. Once per text per visit; people who ask for less motion get the words at once.

export type Segment = { text: string; ink?: boolean }

const DURATION = 700 // ms for the sweep to cross the whole text
const JITTER = 160 // ms each letter may settle late, so the front is ragged, not a wipe
const FLICKER = 50 // ms between bit changes

const played = new Set<string>()

export function DecodeText({ segments, className }: { segments: Segment[]; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -15% 0px' })
  const key = segments.map((s) => s.text).join('')
  const [t, setT] = useState<number | null>(() => (played.has(key) ? null : 0)) // ms in, or null when settled
  const [tick, setTick] = useState(0)

  // When each letter settles: its place along the text, plus a little chance
  const settle = useRef<number[]>([])
  if (settle.current.length !== key.length) settle.current = Array.from(key, (_, i) => (i / key.length) * DURATION + Math.random() * JITTER)

  useEffect(() => {
    if (t === null || !inView) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { played.add(key); setT(null); return }
    const start = performance.now()
    let raf = 0
    let last = 0
    const frame = (now: number) => {
      const ms = now - start
      if (ms >= DURATION + JITTER) { played.add(key); setT(null); return }
      setT(ms)
      if (now - last > FLICKER) { last = now; setTick((n) => n + 1) }
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
    // Starts once, when it comes into view
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView])

  const settled = t === null
  let i = 0
  return (
    <span ref={ref} className={className}>
      {/* Screen readers get the words, not the bits */}
      {!settled && <span className="sr-only">{key}</span>}
      {segments.map((s, n) => (
        <span key={n} className={s.ink ? 'font-medium text-foreground' : undefined} aria-hidden={settled ? undefined : true}>
          {settled
            ? s.text
            : Array.from(s.text, (c) => {
                const at = i++
                if (c === ' ' || t >= settle.current[at]) return c
                // The letter holds its width, invisible; its bit sits on top
                return (
                  <span key={at} className="relative">
                    <span className="invisible">{c}</span>
                    <span className="absolute inset-0 text-center font-mono text-[0.85em] opacity-50">{(at * 7 + tick * 13) % 3 ? '1' : '0'}</span>
                  </span>
                )
              })}
        </span>
      ))}
    </span>
  )
}
