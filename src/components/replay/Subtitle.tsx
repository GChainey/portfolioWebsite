import type { CSSProperties } from 'react'

export type Note = { at: number; text: string }

// A recording's narration: a white pill with the current line, each line fading in over the
// last. Every line is laid in the same grid cell, so the pill keeps the size of the longest and
// doesn't jump. `className` sets the type size and padding for where it sits.
export function Subtitle({ notes, line, className = '', style }: { notes: Note[]; line: number; className?: string; style?: CSSProperties }) {
  return (
    <div className={`relative grid rounded-full bg-white shadow-[0_0_0_1px_rgba(9,9,11,.08),0_12px_32px_-12px_rgba(9,9,11,.22)] ${className}`} style={style}>
      {notes.map((n, i) => (
        <div
          key={i}
          className="col-start-1 row-start-1 whitespace-nowrap text-center tracking-[-0.015em] text-zinc-700"
          style={{ opacity: i === line ? 1 : 0, transform: `translateY(${i === line ? 0 : i < line ? -10 : 10}px)`, transition: 'opacity 400ms ease, transform 500ms cubic-bezier(.2,.8,.2,1)' }}
        >
          {n.text}
        </div>
      ))}
    </div>
  )
}

// The line that is on at `t` seconds
export const lineAt = (notes: Note[], t: number) => Math.max(0, notes.findLastIndex((n) => n.at <= t))
