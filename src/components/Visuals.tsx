'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ArrowUpRight, ChevronLeft, ChevronRight, Columns2, Maximize2, RectangleHorizontal, X } from 'lucide-react'
import { ShowcaseReel, type ShowcaseScene } from '@/components/showcase/ShowcaseReel'
import { useOverlay, pad, ease } from '@/components/showcase/shared'
import { useTheme } from '@/context/ThemeContext'
import { VISUALS, accentOf, type Visual } from '@/content/visuals'

// The visuals (content/visuals.ts), one after another: what it is and what it did, then the
// piece. Two layouts while we choose: full width, the text above and the piece across the whole
// column, or side by side. Click a piece to open it as big as the screen allows.

type Layout = 'full' | 'side'
const LAYOUTS = [
  { id: 'full', label: 'Full width', icon: RectangleHorizontal },
  { id: 'side', label: 'Side by side', icon: Columns2 },
] as const
const STORE = 'visuals-layout'

// Built once: the reel restarts whenever its scenes change
const SCENES: Record<string, ShowcaseScene[]> = Object.fromEntries(VISUALS.map((v) => [v.id, [v.scene]]))

// True while the element is within a screen or so of the viewport. A replay is a whole page
// rebuilt in an iframe, so only the ones near the screen are kept.
function useNear<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [near, setNear] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setNear(e.isIntersecting), { rootMargin: '100% 0px' })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return [ref, near] as const
}

// The piece itself, on the reel's 16:10 stage
function Media({ v, theme, playing = true }: { v: Visual; theme: 'light' | 'dark'; playing?: boolean }) {
  const [ref, near] = useNear<HTMLDivElement>()
  return (
    <div ref={ref} className="relative aspect-[16/10] w-full" style={{ background: theme === 'dark' ? '#09090b' : '#fafafa' }}>
      {near && <ShowcaseReel scenes={SCENES[v.id]} captions={false} theme={theme} playing={playing} />}
    </div>
  )
}

function Project({ v }: { v: Visual }) {
  return (
    <p className="flex items-center gap-2 text-xs uppercase tracking-widest" style={{ color: accentOf(v) }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: accentOf(v) }} />
      {v.project}
    </p>
  )
}

function Impact({ v, dark = false }: { v: Visual; dark?: boolean }) {
  if (!v.impact) return null
  return (
    <p className="flex items-baseline gap-2">
      {v.impact.value && <span className={`text-2xl font-medium tracking-tight ${dark ? 'text-white' : 'text-foreground'}`}>{v.impact.value}</span>}
      <span className={`text-sm ${dark ? 'text-white/60' : 'text-muted'}`}>{v.impact.label}</span>
    </p>
  )
}

function VisualLink({ v, className }: { v: Visual; className: string }) {
  if (!v.href) return null
  const body = (
    <>
      {v.external ? `Visit ${v.project}` : 'Read the story'}
      {v.external ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />}
    </>
  )
  const cls = `group inline-flex items-center gap-1.5 text-sm transition-colors ${className}`
  return v.external ? (
    <a href={v.href} target="_blank" rel="noopener noreferrer" className={cls}>{body}</a>
  ) : (
    <Link href={v.href} className={cls}>{body}</Link>
  )
}

function Piece({ v, theme, playing, onOpen }: { v: Visual; theme: 'light' | 'dark'; playing: boolean; onOpen: () => void }) {
  return (
    <button onClick={onOpen} className="group relative block w-full overflow-hidden rounded-xl border border-border shadow-lg text-left" aria-label={`Open ${v.title}`}>
      <Media v={v} theme={theme} playing={playing} />
      <span className="absolute top-3 right-3 rounded-full bg-black/50 p-2 text-white opacity-0 backdrop-blur transition-opacity group-hover:opacity-100">
        <Maximize2 className="w-3.5 h-3.5" />
      </span>
    </button>
  )
}

function Row({ v, layout, theme, playing, onOpen }: { v: Visual; layout: Layout; theme: 'light' | 'dark'; playing: boolean; onOpen: () => void }) {
  const text = (
    <div className="min-w-0">
      <Project v={v} />
      <h3 className={`mt-2 font-medium tracking-tight text-foreground text-balance ${layout === 'full' ? 'text-3xl' : 'text-2xl'}`}>{v.title}</h3>
      <p className="mt-1.5 text-muted">{v.summary}</p>
    </div>
  )
  const aside = (v.impact || v.href) && (
    <div className={`flex flex-wrap items-baseline gap-x-8 gap-y-2 ${layout === 'full' ? 'md:justify-end' : ''}`}>
      <Impact v={v} />
      <VisualLink v={v} className="text-muted hover:text-accent" />
    </div>
  )

  if (layout === 'full') {
    return (
      <article className="px-8 py-12 border-b border-border last:border-b-0">
        <div className="mb-6 grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
          {text}
          {aside}
        </div>
        <Piece v={v} theme={theme} playing={playing} onOpen={onOpen} />
      </article>
    )
  }
  return (
    <article className="grid gap-8 px-8 py-12 border-b border-border last:border-b-0 md:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] md:items-center">
      <div className="space-y-5">
        {text}
        {aside}
      </div>
      <Piece v={v} theme={theme} playing={playing} onOpen={onOpen} />
    </article>
  )
}

// One piece, as big as the screen allows, its title and impact in a line underneath. Arrows
// step through the rest.
function Open({ index, onStep, onClose }: { index: number; onStep: (by: number) => void; onClose: () => void }) {
  const v = VISUALS[index]
  useOverlay(true, onClose)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') onStep(1)
      if (e.key === 'ArrowLeft') onStep(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onStep])

  return (
    <motion.div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      {/* 16:10, as wide as the window, but never taller than it with room for the line below */}
      <motion.div
        style={{ width: 'min(96vw, calc((100vh - 136px) * 1.6))' }}
        onClick={(e) => e.stopPropagation()}
        initial={{ scale: 0.97, y: 12 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ duration: 0.35, ease }}
      >
        <div className="overflow-hidden rounded-2xl ring-1 ring-white/10 shadow-2xl">
          <Media key={v.id} v={v} theme="dark" />
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-x-8 gap-y-3">
          <div className="min-w-0">
            <Project v={v} />
            <p className="mt-1 text-lg font-medium tracking-tight text-white">{v.title}</p>
          </div>
          <div className="flex flex-wrap items-center gap-x-8 gap-y-2">
            <Impact v={v} dark />
            <VisualLink v={v} className="text-white/60 hover:text-white" />
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-white/50 tabular-nums">{pad(index + 1)} / {pad(VISUALS.length)}</span>
              <button onClick={() => onStep(-1)} aria-label="Previous" className="p-2 rounded-full border border-white/15 text-white/60 hover:text-white"><ChevronLeft className="w-4 h-4" /></button>
              <button onClick={() => onStep(1)} aria-label="Next" className="p-2 rounded-full border border-white/15 text-white/60 hover:text-white"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        </div>
      </motion.div>
      <button onClick={onClose} aria-label="Close" className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20">
        <X className="w-5 h-5" />
      </button>
    </motion.div>
  )
}

export function Visuals() {
  const { resolvedMode } = useTheme()
  const theme = resolvedMode === 'dark' ? 'dark' : 'light'
  const [layout, setLayout] = useState<Layout>('full')
  const [open, setOpen] = useState<number | null>(null)

  // The last layout picked sticks
  useEffect(() => {
    const saved = localStorage.getItem(STORE)
    if (saved === 'full' || saved === 'side') setLayout(saved)
  }, [])
  const choose = (id: Layout) => { setLayout(id); localStorage.setItem(STORE, id) }

  const close = useCallback(() => setOpen(null), [])
  const step = useCallback((by: number) => setOpen((i) => (i === null ? i : (i + by + VISUALS.length) % VISUALS.length)), [])

  return (
    <div>
      <div className="flex items-center justify-between gap-4 px-8 py-4 border-b border-border">
        <p className="text-xs text-muted uppercase tracking-widest">{VISUALS.length} pieces</p>
        <div className="flex bg-[color-mix(in_srgb,var(--border)_40%,transparent)] rounded-full p-0.5" role="group" aria-label="Layout">
          {LAYOUTS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => choose(id)}
              aria-pressed={layout === id}
              className={`flex items-center gap-1.5 px-3.5 py-1 text-sm rounded-full transition-all ${layout === id ? 'bg-foreground text-background font-medium' : 'text-muted hover:text-foreground'}`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {VISUALS.map((v, i) => (
        <Row key={v.id} v={v} layout={layout} theme={theme} playing={open === null} onOpen={() => setOpen(i)} />
      ))}

      <AnimatePresence>{open !== null && <Open key="open" index={open} onStep={step} onClose={close} />}</AnimatePresence>
    </div>
  )
}
