'use client'

import { Fragment, useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ArrowUpRight, ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react'
import { ShowcaseReel, type ShowcaseScene } from '@/components/showcase/ShowcaseReel'
import { useOverlay, pad, ease } from '@/components/showcase/shared'
import { useTheme } from '@/context/ThemeContext'
import { useFeatureFlags } from '@/context/FeatureFlagContext'
import { VISUALS, VISUAL_SECTIONS, KIND_WORDS, type Visual } from '@/content/visuals'
import { CASE_STUDY_SIZZLE } from '@/content/sizzle'
import { TESTIMONIALS } from '@/content/testimonials'
import { KindWord } from '@/components/KindWord'

// The visuals (content/visuals.ts), one after another: what it is and what it did, then the
// piece across the whole column. Click a piece to open it as big as the screen allows.

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

// Live sites and rebuilt replays sit in iframes, and a page in one can scroll this one (Shader
// Wall's does as it loads, jumping the homepage down to it). Undo any jump that didn't come from
// the visitor: a wheel, touch, key or click in the last second, or the tail of a scroll already
// under way (momentum, a smooth scroll to the top).
function useNoScrollJumps() {
  useEffect(() => {
    let lastY = window.scrollY
    let intent = -Infinity
    let moved = -Infinity
    const mark = () => { intent = performance.now() }
    const onScroll = () => {
      const now = performance.now()
      const dy = window.scrollY - lastY
      if (dy === 0) return
      if (now - intent < 1000 || (now - moved < 200 && Math.abs(dy) < 200)) {
        lastY = window.scrollY
        moved = now
        return
      }
      window.scrollTo({ top: lastY, behavior: 'instant' })
    }
    const inputs = ['wheel', 'touchstart', 'touchmove', 'keydown', 'mousedown'] as const
    inputs.forEach((e) => window.addEventListener(e, mark, { passive: true, capture: true }))
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      inputs.forEach((e) => window.removeEventListener(e, mark, { capture: true }))
      window.removeEventListener('scroll', onScroll)
    }
  }, [])
}

// The piece itself, on the reel's 16:10 stage
function Media({ v, theme, playing = true }: { v: Visual; theme: 'light' | 'dark'; playing?: boolean }) {
  const [ref, near] = useNear<HTMLDivElement>()
  // A live site stays once loaded: loading it again would jump the page again
  const [loaded, setLoaded] = useState(false)
  useEffect(() => { if (near && v.scene.site) setLoaded(true) }, [near, v.scene.site])
  return (
    <div ref={ref} className="relative aspect-[16/10] w-full" style={{ background: theme === 'dark' ? '#09090b' : '#fafafa' }}>
      {(near || loaded) && <ShowcaseReel scenes={SCENES[v.id]} captions={false} theme={theme} playing={playing} />}
    </div>
  )
}

// Who a piece is for. A product's name is already its title
function Project({ v, dark = false }: { v: Visual; dark?: boolean }) {
  if (v.product) return null
  return <p className={`mb-2 text-xs uppercase tracking-widest ${dark ? 'text-white/50' : 'text-muted'}`}>{v.project}</p>
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

function Row({ v, theme, playing, onOpen, panels }: { v: Visual; theme: 'light' | 'dark'; playing: boolean; onOpen: () => void; panels: boolean }) {
  return (
    <article className={`px-8 ${panels ? 'py-12 border-b border-border' : 'py-16'}`}>
      <div className="mb-6 grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
        <div className="min-w-0">
          <Project v={v} />
          <h3 className="font-medium tracking-tight text-foreground text-balance text-3xl">{v.title}</h3>
          <p className="mt-1.5 text-muted">{v.summary}</p>
        </div>
        {(v.impact || v.href) && (
          <div className="flex flex-wrap items-baseline gap-x-8 gap-y-2 md:justify-end">
            <Impact v={v} />
            <VisualLink v={v} className="text-muted hover:text-accent" />
          </div>
        )}
      </div>
      <Piece v={v} theme={theme} playing={playing} onOpen={onOpen} />
    </article>
  )
}

// The case studies cut together, captions on, playing ahead of them
function Sizzle({ theme, playing, panels }: { theme: 'light' | 'dark'; playing: boolean; panels: boolean }) {
  const [ref, near] = useNear<HTMLDivElement>()
  return (
    <div className={`px-8 ${panels ? 'py-12 border-b border-border' : 'pt-8 pb-16'}`}>
      <div ref={ref} className="relative aspect-[16/10] w-full overflow-hidden rounded-xl border border-border shadow-lg" style={{ background: theme === 'dark' ? '#09090b' : '#fafafa' }}>
        {near && <ShowcaseReel scenes={CASE_STUDY_SIZZLE} theme={theme} playing={playing} />}
      </div>
    </div>
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
            <Project v={v} dark />
            <p className="text-lg font-medium tracking-tight text-white">{v.title}</p>
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
  const [open, setOpen] = useState<number | null>(null)
  const { flags } = useFeatureFlags()
  useNoScrollJumps()

  const close = useCallback(() => setOpen(null), [])
  const step = useCallback((by: number) => setOpen((i) => (i === null ? i : (i + by + VISUALS.length) % VISUALS.length)), [])

  return (
    <div>
      {VISUAL_SECTIONS.map((section) => (
        <section key={section.id} aria-labelledby={`visuals-${section.id}`}>
          <header className={`px-8 ${flags.panels ? 'pt-20' : 'pt-24 pb-4'}`}>
            <h2 id={`visuals-${section.id}`} className="text-4xl md:text-5xl font-medium tracking-tight text-foreground text-balance">{section.title}</h2>
          </header>
          {section.id === 'ai' && <Sizzle theme={theme} playing={open === null} panels={flags.panels} />}
          {VISUALS.map((v, i) => {
            if (v.section !== section.id) return null
            const kind = TESTIMONIALS.find((t) => t.name === KIND_WORDS[v.id])
            return (
              <Fragment key={v.id}>
                <Row v={v} theme={theme} playing={open === null} onOpen={() => setOpen(i)} panels={flags.panels} />
                {kind && <KindWord t={kind} panels={flags.panels} />}
              </Fragment>
            )
          })}
        </section>
      ))}

      <AnimatePresence>{open !== null && <Open key="open" index={open} onStep={step} onClose={close} />}</AnimatePresence>
    </div>
  )
}
