'use client'

import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion, useInView, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { ArrowRight, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { SCREENS, mixed, type Screen } from '@/content/screens'
import { ScreenTile, colourOf, PROJECT_COLOURS } from '../shared'
import { useOverlay } from '@/components/showcase/shared'
import { Arrow, Stroke, Tick, hash, loopPath, rng } from './pen'

// The eye test, as a contact sheet: every screen as a frame on strips of film, printed on one
// sheet, with the editor's selects circled in red. The cursor is a loupe; a frame opens on click.

// The sheet's order: mixed() for the rest, with the selects spread through it at an even pace
// and a little jitter, so the red pen turns up on every strip, never in the same column twice
// running. Deterministic, so the sheet is the same on every visit.
function spread(list: Screen[]): Screen[] {
  const picks = mixed(list.filter((s) => s.best))
  const rest = mixed(list.filter((s) => !s.best))
  const n = list.length, k = picks.length
  const r = rng(hash('contact-sheet'))
  const slots: number[] = []
  // Columns are judged on the 10-across sheet most laptops see
  const C = 10
  const usedIn = (row: number) => slots.filter((x) => Math.floor(x / C) === row).map((x) => x % C)
  for (let j = 0; j < k; j++) {
    const ideal = Math.round(((j + 0.5) * n) / k + (r() - 0.5) * 2.4)
    const min = j === 0 ? 0 : slots[j - 1] + 2
    const max = n - (k - j - 1) * 2 - 1
    const fits = (x: number) => x >= min && x <= max && !usedIn(Math.floor(x / C) - 1).includes(x % C)
    const pick = [0, 1, -1, 2, -2, 3].map((d) => ideal + d).find(fits)
    slots.push(pick ?? Math.min(max, Math.max(min, ideal)))
  }
  const out: Screen[] = []
  let p = 0, q = 0
  for (let i = 0; i < n; i++) out.push(slots[p] === i ? picks[p++] : rest[q++])
  return out
}

export const FRAMES = spread(SCREENS)
export const frameNo = (i: number) => `${String(i + 1).padStart(2, '0')}A`
const PROJECTS = Object.keys(PROJECT_COLOURS).filter((p) => FRAMES.some((f) => f.project === p))
const SELECTS = FRAMES.filter((f) => f.best).length
const ZOOM = 2.75

type Layout = { cols: number; fw: number; fh: number; gap: number; pad: number; label: number; stripGap: number; small: boolean }

function layoutFor(W: number): Layout {
  const small = W < 560
  const cols = small ? 3 : W < 900 ? 5 : W < 1200 ? 8 : W < 1640 ? 10 : 12
  const gap = small ? 5 : 9
  const pad = small ? 5 : 9
  const fw = (W - pad * 2 - gap * (cols - 1)) / cols
  return { cols, fw, fh: (fw * 10) / 16, gap, pad, label: small ? 16 : 20, stripGap: small ? 10 : 16, small }
}

const portrait = (s: Screen) => s.h > s.w

// The frame's picture: cropped to the frame, or a phone stood up in it
function Picture({ s, clone }: { s: Screen; clone: boolean }) {
  if (clone) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={s.src} alt="" draggable={false} className={`absolute inset-0 h-full w-full ${portrait(s) ? 'object-contain' : 'object-cover object-top'}`} />
    )
  }
  if (portrait(s)) {
    return (
      <div className="absolute inset-0 flex justify-center" style={{ background: 'var(--fill)' }}>
        <ScreenTile screen={s} fit="natural" className="!bg-transparent" style={{ height: '100%', width: 'auto' }} />
      </div>
    )
  }
  return <ScreenTile screen={s} fit="cover" className="!absolute inset-0" />
}

// A select's loop, sized to the frame
function Loop({ s, L, z, on, delay, reduced }: { s: Screen; L: Layout; z: number; on: boolean; delay: number; reduced: boolean }) {
  const w = L.fw * z, h = L.fh * z
  const d = useMemo(() => loopPath(w, h, hash(s.id), { pad: (L.small ? 2.5 : 4) * z }), [w, h, s.id, L.small, z])
  return (
    <svg aria-hidden className="pointer-events-none absolute left-0 top-0 z-10 overflow-visible" width={w} height={h}>
      <Stroke d={d} on={on} delay={delay} duration={0.62} width={(L.small ? 1.6 : 2) * z} reduced={reduced} />
    </svg>
  )
}

// The strips. Drawn once for the page, and again, bigger, inside the loupe.
const Strips = memo(function Strips({ frames, L, z = 1, clone = false, dim, drawn, reduced, onOpen }: { frames: Screen[]; L: Layout; z?: number; clone?: boolean; dim: string | null; drawn: boolean[]; reduced: boolean; onOpen?: (i: number) => void }) {
  const rows: Screen[][] = []
  for (let i = 0; i < frames.length; i += L.cols) rows.push(frames.slice(i, i + L.cols))
  const showProject = !L.small
  return (
    <div className="flex flex-col items-start" style={{ gap: L.stripGap * z }}>
      {rows.map((row, r) => {
        let k = 0
        return (
          <div key={r} data-strip={clone ? undefined : r} className="flex" style={{ gap: L.gap * z, padding: `${L.pad * z}px ${L.pad * z}px 0`, background: 'var(--strip)', boxShadow: clone ? undefined : '0 0 0 0.5px rgba(0,0,0,0.25)' }}>
            {row.map((s, c) => {
              const i = r * L.cols + c
              const faded = dim !== null && s.project !== dim
              const order = s.best ? k++ : 0
              const delay = 0.15 + order * 0.16
              const Tag = clone ? 'div' : 'button'
              return (
                <div key={s.id} className="flex flex-col transition-opacity duration-300" style={{ width: L.fw * z, opacity: faded ? 0.16 : 1 }}>
                  <Tag
                    {...(clone ? {} : { type: 'button' as const, onClick: () => onOpen?.(i), 'aria-label': `Frame ${frameNo(i)}: ${s.title}, ${s.project}`, 'data-i': i })}
                    className="cs-frame relative block overflow-visible p-0 text-left"
                    style={{ width: L.fw * z, height: L.fh * z, cursor: 'inherit' }}
                  >
                    <span className="absolute inset-0 overflow-hidden" style={{ background: 'var(--fill)' }}>
                      <Picture s={s} clone={clone} />
                    </span>
                    {s.best && <Loop s={s} L={L} z={z} on={drawn[r]} delay={delay} reduced={reduced || clone} />}
                  </Tag>
                  <span className="flex items-center font-mono" style={{ height: L.label * z, gap: 5 * z, fontSize: (L.small ? 8 : 9) * z, color: 'var(--edge)', letterSpacing: '0.04em' }}>
                    <span className="tabular-nums shrink-0">{frameNo(i)}</span>
                    {s.best && (
                      <span className="shrink-0" style={{ transform: `scale(${z * (L.small ? 0.7 : 0.8)})`, transformOrigin: 'left center', width: 12 * z }}>
                        <Tick seed={s.id} on={drawn[r] || clone} delay={delay + 0.55} reduced={reduced || clone} />
                      </span>
                    )}
                    {showProject && (
                      <span className="ml-auto flex min-w-0 items-center uppercase" style={{ gap: 4 * z, fontSize: 7.5 * z, letterSpacing: '0.14em', opacity: 0.8 }}>
                        <span className="truncate">{s.project}</span>
                        <span className="shrink-0 rounded-full" style={{ width: 4 * z, height: 4 * z, background: colourOf(s.project) }} />
                      </span>
                    )}
                  </span>
                </div>
              )
            })}
          </div>
        )
      })}
    </div>
  )
})

// One strip watching for itself, so its selects are circled as it comes into view
function useStripsDrawn(root: React.RefObject<HTMLDivElement>, count: number) {
  const [drawn, setDrawn] = useState<boolean[]>(() => Array(count).fill(false))
  useEffect(() => {
    setDrawn((d) => (d.length === count ? d : Array.from({ length: count }, (_, i) => d[i] ?? false)))
    const el = root.current
    if (!el) return
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return
        const r = Number((e.target as HTMLElement).dataset.strip)
        setDrawn((d) => (d[r] ? d : d.map((v, i) => (i === r ? true : v))))
        io.unobserve(e.target)
      })
    }, { rootMargin: '0px 0px -18% 0px', threshold: 0.6 })
    el.querySelectorAll('[data-strip]').forEach((s) => io.observe(s))
    return () => io.disconnect()
  }, [root, count])
  return drawn
}

function useFinePointer() {
  const [fine, setFine] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)')
    setFine(mq.matches)
    const on = () => setFine(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return fine
}

export function Sheet({ width, reduced }: { width: number; reduced: boolean }) {
  const margin = width < 640 ? 16 : 32
  const W = Math.max(0, width - margin * 2)
  const L = useMemo(() => layoutFor(W), [W])
  const [expanded, setExpanded] = useState(false)
  const frames = L.small && !expanded ? FRAMES.slice(0, 30) : FRAMES
  const rows = Math.ceil(frames.length / L.cols)

  const [pinned, setPinned] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const dim = preview ?? pinned

  const box = useRef<HTMLDivElement>(null)
  const drawn = useStripsDrawn(box, rows)
  const noteRef = useRef<HTMLDivElement>(null)
  const noteOn = useInView(noteRef, { once: true, margin: '0px 0px -10% 0px' })

  // The loupe
  const fine = useFinePointer()
  const loupe = fine && !L.small
  const D = width >= 1700 ? 228 : 200
  const [lens, setLens] = useState(false)
  const [armed, setArmed] = useState(false)
  const [hover, setHover] = useState<number | null>(null)
  const last = useRef<{ x: number; y: number } | null>(null)
  const lastShown = useRef<{ i: number; s: Screen } | null>(null)
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const sx = useSpring(mx, { stiffness: 520, damping: 44, mass: 0.55 })
  const sy = useSpring(my, { stiffness: 520, damping: 44, mass: 0.55 })
  const lx = useTransform(sx, (v) => v - D / 2)
  const ly = useTransform(sy, (v) => v - D / 2)
  const cx = useTransform(sx, (v) => D / 2 - v * ZOOM)
  const cy = useTransform(sy, (v) => D / 2 - v * ZOOM)

  const place = useCallback((jump = false) => {
    const el = box.current
    if (!el || !last.current) return
    const r = el.getBoundingClientRect()
    const x = last.current.x - r.left, y = last.current.y - r.top
    mx.set(x); my.set(y)
    if (jump || reduced) { sx.jump(x); sy.jump(y) }
  }, [mx, my, sx, sy, reduced])

  const onMove = (e: React.PointerEvent) => {
    if (!loupe || e.pointerType !== 'mouse') return
    last.current = { x: e.clientX, y: e.clientY }
    if (!lens) { setArmed(true); setLens(true); place(true) } else place()
    const t = (e.target as HTMLElement).closest('[data-i]') as HTMLElement | null
    const i = t ? Number(t.dataset.i) : null
    if (i !== hover) setHover(i)
  }
  const onLeave = () => { setLens(false); last.current = null }

  // Scrolling under a still mouse moves the sheet, not the loupe
  useEffect(() => {
    if (!lens) return
    const on = () => place(true)
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [lens, place])

  // A frame, opened
  const [open, setOpen] = useState<number | null>(null)

  const counts = useMemo(() => Object.fromEntries(PROJECTS.map((p) => [p, FRAMES.filter((f) => f.project === p).length])), [])

  const hovered = hover !== null ? FRAMES[hover] : null
  if (hover !== null) lastShown.current = { i: hover, s: FRAMES[hover] }
  const shown = lastShown.current

  return (
    <div style={{ padding: `0 ${margin}px` }}>
      {/* The rail across the top of the sheet: what's on it, and a key you can filter by */}
      <div className="flex flex-col gap-3 pb-5 pt-6 sm:flex-row sm:items-end sm:justify-between sm:gap-8" style={{ paddingTop: L.small ? 20 : 28 }}>
        <div className="min-w-0">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-foreground">
            Contact sheet
            <span className="text-muted"> · {FRAMES.length} frames · {PROJECTS.length} projects · {SELECTS} selects</span>
          </p>
          <div className="-mx-1 mt-3 flex gap-1 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible sm:pb-0" role="group" aria-label="Show one project" onMouseLeave={() => setPreview(null)}>
            {PROJECTS.map((p) => {
              const on = dim === p
              return (
                <button
                  key={p}
                  type="button"
                  aria-pressed={pinned === p}
                  onClick={() => setPinned((v) => (v === p ? null : p))}
                  onMouseEnter={() => setPreview(p)}
                  onFocus={() => setPreview(p)}
                  onBlur={() => setPreview(null)}
                  className={`group flex shrink-0 items-center gap-1.5 rounded-full px-2 py-1 text-[11px] transition-colors ${on ? 'text-foreground' : 'text-muted hover:text-foreground'}`}
                  style={{ background: pinned === p ? 'color-mix(in srgb, var(--foreground) 8%, transparent)' : undefined, opacity: dim && !on ? 0.55 : 1 }}
                >
                  <span className="h-1.5 w-1.5 rounded-full transition-transform group-hover:scale-125" style={{ background: colourOf(p) }} />
                  {p}
                  <span className="font-mono text-[10px] tabular-nums opacity-60">{counts[p]}</span>
                </button>
              )
            })}
            {pinned && (
              <button type="button" onClick={() => setPinned(null)} className="flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-[11px] text-muted hover:text-foreground">
                <X className="h-3 w-3" /> All
              </button>
            )}
          </div>
        </div>

        {/* The editor's note: these are the picks */}
        <div ref={noteRef} className={`flex shrink-0 items-end gap-1 ${L.small ? 'self-start' : 'self-end pr-2'}`} aria-hidden>
          <span className="cs-hand text-[22px] sm:text-[26px]" style={{ transform: 'rotate(-4deg)', display: 'inline-block', opacity: noteOn || reduced ? 1 : 0, transition: 'opacity .5s' }}>
            circled ones are the selects
          </span>
          {!L.small && (
            <span className="relative top-4">
              <Arrow on={noteOn} delay={0.3} reduced={reduced} />
            </span>
          )}
        </div>
      </div>

      {/* The sheet itself */}
      <div
        ref={box}
        className="relative"
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        style={{ cursor: loupe && lens ? 'none' : undefined }}
      >
        <Strips frames={frames} L={L} dim={dim} drawn={drawn} reduced={reduced} onOpen={setOpen} />

        {loupe && armed && (
          <motion.div
            aria-hidden
            className="pointer-events-none absolute left-0 top-0 z-30"
            style={{ x: lx, y: ly, width: D, height: D }}
            initial={false}
            animate={{ opacity: lens ? 1 : 0, scale: lens ? 1 : 0.7 }}
            transition={{ type: 'spring', stiffness: 420, damping: 30 }}
          >
            <div
              className="relative h-full w-full overflow-hidden rounded-full"
              style={{
                background: 'var(--paper)',
                boxShadow: '0 0 0 1px rgba(0,0,0,0.55), 0 0 0 3px rgba(255,255,255,0.14), 0 22px 48px -10px rgba(0,0,0,0.55), 0 6px 14px -4px rgba(0,0,0,0.35)',
              }}
            >
              <motion.div className="absolute left-0 top-0" style={{ x: cx, y: cy, width: W * ZOOM, willChange: 'transform' }}>
                <Strips frames={frames} L={L} z={ZOOM} clone dim={dim} drawn={drawn} reduced />
              </motion.div>
              {/* The glass */}
              <div className="absolute inset-0 rounded-full" style={{ boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.22), inset 0 0 28px rgba(0,0,0,0.28)', background: 'radial-gradient(circle at 30% 24%, rgba(255,255,255,0.16), transparent 42%)' }} />
              <div className="absolute left-1/2 top-1/2 h-[9px] w-px -translate-x-1/2 -translate-y-1/2 bg-white/70 mix-blend-difference" />
              <div className="absolute left-1/2 top-1/2 h-px w-[9px] -translate-x-1/2 -translate-y-1/2 bg-white/70 mix-blend-difference" />
            </div>
            <div
              className="absolute left-1/2 top-full mt-3 flex max-w-[300px] -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full bg-[#0a0a0a]/90 px-3 py-1.5 text-[11px] text-white shadow-lg backdrop-blur transition-opacity duration-200"
              style={{ opacity: hovered ? 1 : 0 }}
            >
              {shown && (
                <>
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: colourOf(shown.s.project) }} />
                  <span className="font-mono text-white/55">{frameNo(shown.i)}</span>
                  <span className="truncate">{shown.s.title}</span>
                </>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* Foot of the sheet */}
      <div className="flex items-center justify-between gap-4 pb-6 pt-4 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
        <span>{loupe ? 'Hover to look closer. Click a frame to open it.' : 'Tap a frame to open it.'}</span>
        {L.small && !expanded ? (
          <button type="button" onClick={() => setExpanded(true)} className="rounded-full px-3 py-1.5 text-[11px] normal-case tracking-normal text-foreground" style={{ background: 'color-mix(in srgb, var(--foreground) 8%, transparent)' }}>
            Show all {FRAMES.length}
          </button>
        ) : (
          <span className="hidden sm:inline">{FRAMES.length} frames</span>
        )}
      </div>

      <Lightbox index={open} setIndex={setOpen} />
    </div>
  )
}

// A frame, opened over the page
function Lightbox({ index, setIndex }: { index: number | null; setIndex: (i: number | null) => void }) {
  const close = useCallback(() => setIndex(null), [setIndex])
  useOverlay(index !== null, close)
  useEffect(() => {
    if (index === null) return
    const on = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') setIndex((index + 1) % FRAMES.length)
      if (e.key === 'ArrowLeft') setIndex((index - 1 + FRAMES.length) % FRAMES.length)
    }
    window.addEventListener('keydown', on)
    return () => window.removeEventListener('keydown', on)
  }, [index, setIndex])
  const s = index !== null ? FRAMES[index] : null
  return (
    <AnimatePresence>
      {s && index !== null && (
        <motion.div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm sm:p-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-label={`Frame ${frameNo(index)}: ${s.title}`}
        >
          <motion.figure
            key={s.id}
            className="relative flex max-h-full w-min flex-col bg-white p-2 sm:p-3"
            style={{ boxShadow: '0 40px 90px -20px rgba(0,0,0,0.7)' }}
            initial={{ opacity: 0, scale: 0.94, rotate: -0.6, y: 12 }}
            animate={{ opacity: 1, scale: 1, rotate: 0, y: 0 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
          >
            {s.video ? (
              <video src={s.video} poster={s.src} autoPlay muted loop playsInline className="block max-h-[72vh] w-auto max-w-[min(1100px,88vw)]" aria-label={s.title} />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={s.src} alt={s.title} className="block max-h-[72vh] w-auto max-w-[min(1100px,88vw)]" />
            )}
            <figcaption className="flex items-center gap-3 px-1 pb-0.5 pt-3 text-[13px] text-[#0a0a0a]" style={{ width: 0, minWidth: '100%' }}>
              <span className="font-mono text-[11px] text-[#8a8a8a]">{frameNo(index)}</span>
              <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: colourOf(s.project) }} />
              <span className="min-w-0 flex-1 truncate"><span className="text-[#737373]">{s.project} · </span>{s.title}</span>
              {s.href && (
                <Link href={s.href} className="ml-auto inline-flex shrink-0 items-center gap-1 whitespace-nowrap text-[12px] text-[#0a0a0a] hover:underline">
                  See the work <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              )}
            </figcaption>
          </motion.figure>
          <button type="button" aria-label="Previous frame" onClick={(e) => { e.stopPropagation(); setIndex((index - 1 + FRAMES.length) % FRAMES.length) }} className="absolute left-3 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 sm:block">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button type="button" aria-label="Next frame" onClick={(e) => { e.stopPropagation(); setIndex((index + 1) % FRAMES.length) }} className="absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 sm:block">
            <ChevronRight className="h-5 w-5" />
          </button>
          <button type="button" aria-label="Close" onClick={close} className="absolute right-3 top-3 rounded-full bg-white/10 p-2 text-white hover:bg-white/20">
            <X className="h-5 w-5" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
