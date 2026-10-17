'use client'

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import type { Screen } from '@/content/screens'
import { splitHighlights, type Testimonial } from '@/content/testimonials'

// Pieces the five "visuals first" homepages share: running out of the page's column to the
// window's edges, a screen tile (a still, or a muted loop that only plays on screen), and a
// testimonial with its best phrases marked.

// How far the page's column is from the window's left edge, and the window's width
export function useBleed(ref: React.RefObject<HTMLElement>) {
  const [bleed, setBleed] = useState({ gutter: 0, width: 0 })
  useLayoutEffect(() => {
    const parent = ref.current?.parentElement
    if (!parent) return
    const measure = () => setBleed({ gutter: Math.max(0, Math.round(parent.getBoundingClientRect().left)), width: document.documentElement.clientWidth })
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(parent)
    window.addEventListener('resize', measure)
    return () => { ro.disconnect(); window.removeEventListener('resize', measure) }
  }, [ref])
  return bleed
}

// A section that runs the full width of the window, out of the page's bordered column. The
// gutter is passed to children so they can line text up with the rest of the page.
export function Bleed({ children, className = '', style, as: Tag = 'section', label }: { children: (b: { gutter: number; width: number }) => ReactNode; className?: string; style?: CSSProperties; as?: 'section' | 'div'; label?: string }) {
  const ref = useRef<HTMLElement>(null)
  const b = useBleed(ref)
  return (
    <Tag
      ref={ref as React.RefObject<HTMLDivElement>}
      aria-label={label}
      className={`relative ${className}`}
      style={{ ...(b.width ? { marginLeft: -b.gutter, width: b.width } : {}), ...style }}
    >
      {children(b)}
    </Tag>
  )
}

// True while the element is within `margin` of the viewport
export function useInView<T extends HTMLElement>(margin = '0px', once = false) {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => {
      setInView(e.isIntersecting)
      if (once && e.isIntersecting) io.disconnect()
    }, { rootMargin: margin })
    io.observe(el)
    return () => io.disconnect()
  }, [margin, once])
  return [ref, inView] as const
}

export function useReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mq.matches)
    const on = () => setReduced(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return reduced
}

// One screen. A clip shows its poster until it is on screen, then plays muted on a loop.
// `fit`: cover crops to the box the parent gives it; natural keeps the screen's own shape.
export function ScreenTile({ screen, fit = 'natural', className = '', style, play = true, eager = false }: { screen: Screen; fit?: 'cover' | 'natural'; className?: string; style?: CSSProperties; play?: boolean; eager?: boolean }) {
  const [ref, inView] = useInView<HTMLDivElement>('200px')
  const video = useRef<HTMLVideoElement>(null)
  useEffect(() => {
    const v = video.current
    if (!v) return
    if (inView && play) v.play().catch(() => {})
    else v.pause()
  }, [inView, play])

  const media = fit === 'cover' ? 'absolute inset-0 h-full w-full object-cover object-top' : 'block h-auto w-full'
  return (
    <div
      ref={ref}
      className={`relative overflow-hidden bg-card ${className}`}
      style={{ ...(fit === 'natural' ? { aspectRatio: `${screen.w} / ${screen.h}` } : {}), ...style }}
    >
      {screen.video ? (
        <video ref={video} src={screen.video} poster={screen.src} muted loop playsInline preload="none" className={media} aria-label={screen.title} />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={screen.src} alt={screen.title} width={screen.w} height={screen.h} loading={eager ? 'eager' : 'lazy'} decoding="async" className={media} draggable={false} />
      )}
    </div>
  )
}

// The quote, its highlights wrapped in whatever the variant wants
export function Highlighted({ t, mark }: { t: Pick<Testimonial, 'content' | 'highlights'>; mark: (text: string, i: number) => ReactNode }) {
  let n = 0
  return (
    <>
      {splitHighlights(t).map((run, i) => (run.hit ? <span key={i}>{mark(run.text, n++)}</span> : <span key={i}>{run.text}</span>))}
    </>
  )
}

// The project colours (content/visuals.ts), plus the earlier jobs
export const PROJECT_COLOURS: Record<string, string> = {
  'Daisy Assess': '#16a34a',
  Configurator: '#ea580c',
  'Enterprise AI': '#0891b2',
  'Shader Wall': '#c026d3',
  Dispatch: '#2563eb',
  Thesis: '#f59e0b',
  Wallbounce: '#e11d48',
  SEEK: '#db2777',
  'Best Practice': '#7c3aed',
}
export const colourOf = (project: string) => PROJECT_COLOURS[project] ?? 'var(--accent)'
