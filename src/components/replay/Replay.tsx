'use client'

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { GeistSans } from 'geist/font/sans'
import { Backdrop } from '@/components/ClipFrame'

// Replays: a prototype's component rebuilt in the page and played like a clip, with a cursor.
// The page draws the text, so it is sharp at any size and its colours are exact, where a
// recording is pixels. A replay plays only while it is on screen, and people who prefer less
// motion get its finished state.
//
// A replay is a component with its own state and a script that drives it: useReplay runs the
// script, ReplayFrame draws the backdrop, the scaled component and the cursor.

export type Point = { x: number; y: number }
type Target = Point | HTMLElement | null

export interface ReplayScript {
  sleep: (ms: number) => Promise<void>
  // Glide the cursor to a point or to the centre of an element
  move: (to: Target, ms?: number) => Promise<void>
  // A press where the cursor is, or at a target
  click: (at?: Target) => Promise<void>
  hideCursor: () => void
}

const CANCELLED = Symbol('cancelled')

export function useReplay({ width, height, script, still }: {
  width: number
  height: number
  script: (r: ReplayScript) => Promise<void>
  // The finished state, for reduced motion
  still: () => void
}) {
  const box = useRef<HTMLDivElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [cursor, setCursor] = useState<{ at: Point; visible: boolean; ms: number }>({ at: { x: width * 0.8, y: height * 0.7 }, visible: false, ms: 0 })
  const [ring, setRing] = useState<{ at: Point; n: number } | null>(null)
  const run = useRef(0)
  const pos = useRef<Point>({ x: width * 0.8, y: height * 0.7 })
  const scriptRef = useRef(script)
  scriptRef.current = script
  const stillRef = useRef(still)
  stillRef.current = still

  // Scale the component as a whole to fit its box: text stays vector-sharp
  useEffect(() => {
    const el = box.current
    if (!el) return
    const fit = () => setScale(Math.min(el.clientWidth / width, el.clientHeight / height))
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(el)
    return () => ro.disconnect()
  }, [width, height])

  // A target in the component's own (unscaled) coordinates
  const toPoint = useCallback((t: Target): Point => {
    if (!t || !(t instanceof HTMLElement)) return t ?? pos.current
    const s = stage.current?.getBoundingClientRect()
    if (!s) return pos.current
    const b = t.getBoundingClientRect()
    const k = s.width / width
    return { x: (b.left - s.left + b.width / 2) / k, y: (b.top - s.top + b.height / 2) / k }
  }, [width])

  const start = useCallback(async () => {
    const id = ++run.current
    const sleep = (ms: number) => new Promise<void>((res, rej) => setTimeout(() => (run.current === id ? res() : rej(CANCELLED)), ms))
    const api: ReplayScript = {
      sleep,
      move: async (to, ms = 650) => {
        const p = toPoint(to)
        pos.current = p
        setCursor({ at: p, visible: true, ms })
        await sleep(ms + 120)
      },
      click: async (at) => {
        if (at) await api.move(at)
        setRing({ at: pos.current, n: Date.now() })
        await sleep(260)
      },
      hideCursor: () => setCursor((c) => ({ ...c, visible: false })),
    }
    try {
      for (;;) await scriptRef.current(api)
    } catch (e) {
      if (e !== CANCELLED) throw e
    }
  }, [toPoint])

  useEffect(() => {
    const el = box.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      stillRef.current()
      return
    }
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) start()
      else run.current++
    }, { threshold: 0.35 })
    io.observe(el)
    return () => { io.disconnect(); run.current++ }
  }, [start])

  return { box, stage, scale, cursor, ring, width, height }
}

export function ReplayFrame({ replay, aspectRatio = '16 / 10', label, children }: {
  replay: ReturnType<typeof useReplay>
  aspectRatio?: string
  label?: string
  children: ReactNode
}) {
  const { box, stage, scale, cursor, ring, width, height } = replay
  return (
    <figure className="my-8 not-prose" aria-label={label}>
      <style>{`
        @keyframes replay-ring { from { opacity: .9; transform: translate(-50%, -50%) scale(.4) } to { opacity: 0; transform: translate(-50%, -50%) scale(1.5) } }
        @keyframes replay-blink { 50% { opacity: 0 } }
        @keyframes replay-shimmer { 0% { background-position: -1200px 0 } 100% { background-position: 1200px 0 } }
        @keyframes replay-bounce { 0%, 100% { transform: translateY(0) } 50% { transform: translateY(-4px) } }
      `}</style>
      <Backdrop className="p-6 sm:p-12" style={{ aspectRatio }}>
        <div ref={box} className="flex h-full w-full items-center justify-center">
          <div style={{ width: width * scale, height: height * scale }}>
            <div
              ref={stage}
              aria-hidden
              className={`${GeistSans.className} pointer-events-none relative origin-top-left select-none overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-black/10`}
              style={{ width, height, transform: `scale(${scale})` }}
            >
              {children}
              {ring && (
                <span key={ring.n} className="absolute h-7 w-7 rounded-full bg-zinc-900/20"
                  style={{ left: ring.at.x, top: ring.at.y, animation: 'replay-ring .35s ease-out forwards' }} />
              )}
              <svg
                width="22" height="22" viewBox="0 0 24 24"
                className="absolute left-0 top-0 drop-shadow"
                style={{
                  opacity: cursor.visible ? 1 : 0,
                  transform: `translate(${cursor.at.x - 4}px, ${cursor.at.y - 2}px)`,
                  transition: `transform ${cursor.ms}ms cubic-bezier(.45,0,.2,1), opacity .25s`,
                }}
              >
                <path d="M5 3l14 8.5-6.2 1.4L16.5 20l-2.8 1.3-3.6-7.1L5 18z" fill="#111" stroke="#fff" strokeWidth="1.5" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </div>
      </Backdrop>
    </figure>
  )
}

// A typing caret
export function Caret() {
  return <span className="ml-px inline-block h-[1.1em] w-px translate-y-[0.2em] bg-zinc-900" style={{ animation: 'replay-blink 1s steps(1) infinite' }} />
}

// Type text out a character at a time, pausing a little longer at spaces and line breaks
export async function typeOut(r: ReplayScript, text: string, set: (s: string) => void, speed = 26) {
  for (let i = 1; i <= text.length; i++) {
    set(text.slice(0, i))
    const ch = text[i - 1]
    await r.sleep(ch === '\n' ? speed * 8 : ch === ' ' ? speed * 1.8 : speed)
  }
}
