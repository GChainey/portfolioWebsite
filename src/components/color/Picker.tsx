'use client'

import { useRef, type KeyboardEvent, type PointerEvent } from 'react'
import { hsvToHex } from '@/lib/color'

export interface HSV {
  h: number
  s: number
  v: number
}

const clamp = (n: number) => Math.min(1, Math.max(0, n))

// Saturation and brightness on a square, hue on a strip: the picker every designer already knows,
// so the exercise tests memory rather than the tool.
export function Picker({ value, onChange }: { value: HSV; onChange: (v: HSV) => void }) {
  const square = useRef<HTMLDivElement>(null)
  const strip = useRef<HTMLDivElement>(null)

  const fromSquare = (e: PointerEvent) => {
    const r = square.current!.getBoundingClientRect()
    onChange({ ...value, s: clamp((e.clientX - r.left) / r.width), v: clamp(1 - (e.clientY - r.top) / r.height) })
  }
  const fromStrip = (e: PointerEvent) => {
    const r = strip.current!.getBoundingClientRect()
    onChange({ ...value, h: clamp((e.clientX - r.left) / r.width) * 360 })
  }
  const drag = (handler: (e: PointerEvent) => void) => ({
    onPointerDown: (e: PointerEvent) => {
      ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
      handler(e)
    },
    onPointerMove: (e: PointerEvent) => {
      if (e.buttons) handler(e)
    },
  })

  const step = 0.02
  const squareKeys = (e: KeyboardEvent) => {
    const d = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, step], ArrowDown: [0, -step] }[e.key]
    if (!d) return
    e.preventDefault()
    onChange({ ...value, s: clamp(value.s + d[0]), v: clamp(value.v + d[1]) })
  }
  const stripKeys = (e: KeyboardEvent) => {
    const d = { ArrowLeft: -2, ArrowRight: 2 }[e.key]
    if (!d) return
    e.preventDefault()
    onChange({ ...value, h: (value.h + d + 360) % 360 })
  }

  return (
    <div className="w-full max-w-xs select-none touch-none">
      <div
        ref={square}
        {...drag(fromSquare)}
        onKeyDown={squareKeys}
        tabIndex={0}
        role="slider"
        aria-label="Saturation and brightness"
        aria-valuetext={`saturation ${Math.round(value.s * 100)}%, brightness ${Math.round(value.v * 100)}%`}
        className="relative aspect-square w-full cursor-crosshair rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-accent"
        style={{
          background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, ${hsvToHex(value.h, 1, 1)})`,
        }}
      >
        <span
          className="pointer-events-none absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.4)]"
          style={{ left: `${value.s * 100}%`, top: `${(1 - value.v) * 100}%` }}
        />
      </div>
      <div
        ref={strip}
        {...drag(fromStrip)}
        onKeyDown={stripKeys}
        tabIndex={0}
        role="slider"
        aria-label="Hue"
        aria-valuemin={0}
        aria-valuemax={360}
        aria-valuenow={Math.round(value.h)}
        className="relative mt-3 h-4 w-full cursor-ew-resize rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-accent"
        style={{ background: 'linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)' }}
      >
        <span
          className="pointer-events-none absolute top-1/2 h-6 w-2 -translate-x-1/2 -translate-y-1/2 rounded-sm border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.4)]"
          style={{ left: `${(value.h / 360) * 100}%` }}
        />
      </div>
    </div>
  )
}

export const hsvHex = ({ h, s, v }: HSV) => hsvToHex(h, s, v)
