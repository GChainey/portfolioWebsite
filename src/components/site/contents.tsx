'use client'

import { useEffect, useRef, useState } from 'react'
import { GREY, INK, LINE, SHADOW } from './style'

// The table of contents that shows once you scroll past the headline: the old article one
// (FixedTableOfContents), redrawn in the site's tones. At rest it's a short line per section to the
// left of the column, the one you're reading longer and darker; point at it (or click, or focus it)
// for the list, click a section to go there. It sits in the margin outside the work's 720px column and opens leftwards,
// so it never covers a recording: only on screens wide enough for that (xl, 1280+).

export type Section = { id: string; label: string }

const EASE_OUT = 'cubic-bezier(0.23, 1, 0.32, 1)'

export function Contents({ sections, after }: { sections: Section[]; after: string }) {
  const [shown, setShown] = useState(false)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState<string | null>(null)
  const panel = useRef<HTMLDivElement>(null)
  const leave = useRef<ReturnType<typeof setTimeout>>(undefined)
  // Hover opens it; leaving closes it after a beat, so a slightly wide path to a section doesn't drop it
  const enter = () => { clearTimeout(leave.current); setOpen(true) }
  const exit = () => { clearTimeout(leave.current); leave.current = setTimeout(() => setOpen(false), 180) }

  // Show once the headline (#after) has scrolled off
  useEffect(() => {
    const el = document.getElementById(after)
    if (!el) return
    const io = new IntersectionObserver(([e]) => setShown(!e.isIntersecting && e.boundingClientRect.bottom < 0))
    io.observe(el)
    return () => io.disconnect()
  }, [after])

  // The section in the top part of the screen is the one you're reading
  useEffect(() => {
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) setActive(e.target.id)
    }, { rootMargin: '-80px 0px -60% 0px' })
    sections.forEach((s) => { const el = document.getElementById(s.id); if (el) io.observe(el) })
    return () => io.disconnect()
  }, [sections])

  // Close on Escape or a click elsewhere
  useEffect(() => {
    if (!open) return
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    const click = (e: MouseEvent) => { if (panel.current && !panel.current.contains(e.target as Node)) setOpen(false) }
    window.addEventListener('keydown', key)
    const t = setTimeout(() => document.addEventListener('click', click), 0)
    return () => { window.removeEventListener('keydown', key); clearTimeout(t); document.removeEventListener('click', click) }
  }, [open])

  if (sections.length < 2) return null

  const go = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setTimeout(() => setOpen(false), 200)
  }

  return (
    <nav
      aria-label="Contents"
      onPointerEnter={(e) => { if (e.pointerType === 'mouse') enter() }}
      onPointerLeave={(e) => { if (e.pointerType === 'mouse') exit() }}
      className="fixed top-1/2 z-40 hidden flex-col items-end xl:flex"
      style={{
        // Its right edge 32px outside the 720px work column
        right: 'calc(50% + 360px + 32px)',
        opacity: shown ? 1 : 0,
        transform: `translateY(-50%) translateX(${shown ? 0 : 8}px)`,
        pointerEvents: shown ? 'auto' : 'none',
        transition: `opacity 200ms ease, transform 200ms ${EASE_OUT}`,
      }}
    >
      {!open ? (
        <button onClick={() => setOpen(true)} onFocus={() => setOpen(true)} aria-label="Open contents" className="flex flex-col items-end gap-[6px] px-1 py-2">
          {sections.map((s, i) => (
            <span key={s.id} className="block h-[2px] rounded-full" style={{
              width: s.id === active ? 24 : 12,
              background: INK,
              opacity: s.id === active ? 0.7 : 0.2,
              transition: `width 200ms ${EASE_OUT}, opacity 200ms ease`,
              transitionDelay: shown ? `${i * 30}ms` : '0ms',
            }} />
          ))}
        </button>
      ) : (
        <div ref={panel} className="w-[240px] rounded-[16px] bg-white p-2 text-[13px] leading-[20px]" style={{ boxShadow: SHADOW, outline: `1px solid ${LINE}` }}>
          <ul className="flex flex-col">
            {sections.map((s) => (
              <li key={s.id}>
                <button onClick={() => go(s.id)} className="block w-full rounded-[8px] px-2 py-1 text-left text-pretty transition-colors duration-150 hover:bg-[#F4F4F4]"
                  style={{ color: s.id === active ? INK : GREY }}>
                  {s.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  )
}
