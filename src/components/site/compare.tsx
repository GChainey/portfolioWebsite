'use client'

import { type ReactNode, useCallback, useEffect, useRef } from 'react'
import { INK } from './style'

// Before and after, one over the other: drag anywhere on the work (or the handle) to wipe between
// them, or focus the handle and use the arrow keys. The new design is the base and sets the size;
// the old one sits on top, clipped from the right with clip-path, so the wipe never lays anything
// out again. Position is written straight to the DOM (no React render per pointer move).
//
// Keys jump, they don't animate (a keyboard action is repeated, so motion would only slow it down).
// The page still scrolls on a phone: touch-action pan-y leaves vertical swipes to the browser.

const STEP = 5
const BIG = 25

export function Compare({ before, after, beforeLabel = 'Before', afterLabel = 'Now', start = 50, label = 'Compare before and after' }: {
  before: ReactNode
  after: ReactNode
  beforeLabel?: string
  afterLabel?: string
  start?: number
  label?: string
}) {
  const box = useRef<HTMLDivElement>(null)
  const top = useRef<HTMLDivElement>(null)
  const bar = useRef<HTMLDivElement>(null)
  const knob = useRef<HTMLDivElement>(null)
  const at = useRef(start)
  const dragging = useRef<number | null>(null)

  const set = useCallback((p: number) => {
    const v = Math.min(100, Math.max(0, p))
    at.current = v
    if (top.current) top.current.style.clipPath = `inset(0 ${100 - v}% 0 0)`
    if (bar.current) bar.current.style.left = `${v}%`
    if (knob.current) knob.current.setAttribute('aria-valuenow', String(Math.round(v)))
  }, [])
  useEffect(() => set(start), [set, start])

  const fromPointer = (x: number) => {
    const r = box.current?.getBoundingClientRect()
    if (r) set(((x - r.left) / r.width) * 100)
  }

  return (
    <div
      ref={box}
      className="relative select-none overflow-hidden"
      style={{ touchAction: 'pan-y', cursor: 'ew-resize' }}
      onPointerDown={(e) => {
        // One finger at a time: a second touch mid-drag doesn't make the wipe jump
        if (dragging.current !== null || (e.pointerType === 'mouse' && e.button !== 0)) return
        // Without this the mousedown that follows blurs the handle again (the frame isn't focusable),
        // so the arrow keys wouldn't carry on from a drag
        e.preventDefault()
        dragging.current = e.pointerId
        e.currentTarget.setPointerCapture(e.pointerId)
        fromPointer(e.clientX)
        knob.current?.focus({ preventScroll: true })
      }}
      onPointerMove={(e) => { if (dragging.current === e.pointerId) fromPointer(e.clientX) }}
      onPointerUp={(e) => { if (dragging.current === e.pointerId) dragging.current = null }}
      onPointerCancel={() => { dragging.current = null }}
    >
      {/* The new design: in flow, so it sets the frame's size. Not interactive while comparing */}
      <div className="pointer-events-none" aria-hidden>{after}</div>
      <div ref={top} className="pointer-events-none absolute inset-0" style={{ clipPath: `inset(0 ${100 - start}% 0 0)` }} aria-hidden>{before}</div>

      <Tag side="left">{beforeLabel}</Tag>
      <Tag side="right">{afterLabel}</Tag>

      <div ref={bar} className="pointer-events-none absolute inset-y-0 w-0" style={{ left: `${start}%` }}>
        <div className="absolute inset-y-0 -left-px w-[2px] bg-white" style={{ boxShadow: '0 0 0 0.5px rgba(0,0,0,0.12)' }} />
        <div
          ref={knob}
          role="slider"
          tabIndex={0}
          aria-label={label}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={start}
          aria-valuetext={`${beforeLabel} on the left, ${afterLabel} on the right`}
          onKeyDown={(e) => {
            const k = e.key
            const by = e.shiftKey ? BIG : STEP
            const next = k === 'ArrowLeft' || k === 'ArrowDown' ? at.current - by
              : k === 'ArrowRight' || k === 'ArrowUp' ? at.current + by
              : k === 'PageDown' ? at.current - BIG : k === 'PageUp' ? at.current + BIG
              : k === 'Home' ? 0 : k === 'End' ? 100 : null
            if (next === null) return
            e.preventDefault()
            set(next)
          }}
          className="compare-knob pointer-events-auto absolute left-0 top-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white outline-none"
          style={{ color: INK, boxShadow: '0 1px 2px rgba(0,0,0,0.08), 0 4px 14px rgba(0,0,0,0.16)' }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M5.5 4.5 2 8l3.5 3.5M10.5 4.5 14 8l-3.5 3.5" />
          </svg>
        </div>
      </div>
      <style>{'.compare-knob{transition:transform 160ms cubic-bezier(.23,1,.32,1)}.compare-knob:active{transform:translate(-50%,-50%) scale(.94)}.compare-knob:focus-visible{box-shadow:0 0 0 2px #fff,0 0 0 4px ' + INK + '!important}'}</style>
    </div>
  )
}

function Tag({ side, children }: { side: 'left' | 'right'; children: ReactNode }) {
  return (
    <span
      className="pointer-events-none absolute top-3 rounded-full px-2.5 text-[12px] leading-[20px] text-white"
      style={{ [side]: 12, background: 'rgba(24,24,24,0.72)', backdropFilter: 'blur(6px)' }}
    >{children}</span>
  )
}
