'use client'

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Media, Lightbox, Links, heroItem, itemsOf, type Item } from '@/components/HomeShowcase'
import { useNoScrollJumps } from '@/components/Visuals'
import { ImpactSentence } from '@/components/ImpactSentence'
import { SHOWCASE_SECTIONS, type ShowcasePiece } from '@/content/home-showcase'
import { TESTIMONIALS, type Testimonial } from '@/content/testimonials'

// The homepage as one strip (?design=strip), after nickpyl.space: every piece, one screen each, in a
// single row across the window, pictures only. Scrolling down moves the row sideways; the tile at
// the left edge is the one in focus, and the right of the row softens out of focus. The section's
// title (top left) changes as a new one reaches the edge. A colleague's words close each section as
// a tile of their own. Click a tile to bring it to the edge; click it again for its words (title,
// impact, the way in), and from there see it big with its details.

const HEADER = 56 // the fixed header
const PAD = 'max(24px, calc((100vw - 80rem) / 2 + 24px))' // the page column's left edge
const TILE_H = 'min(40dvh, calc((100vw - 48px) * 0.56))' // a tile's height; it's 16:10
const ease = [0.23, 1, 0.32, 1] as const

type Tile =
  | { kind: 'item'; key: string; section: number; first: boolean; piece: ShowcasePiece; item: Item; at: number }
  | { kind: 'quote'; key: string; section: number; first: boolean; t: Testimonial }

function useTiles() {
  return useMemo(() => {
    const tiles: Tile[] = []
    SHOWCASE_SECTIONS.forEach((s, section) => {
      let first = true
      // One screen per piece, its hero; the details are a click away, in the lightbox
      s.pieces.forEach((piece) => {
        tiles.push({ kind: 'item', key: piece.id, section, first, piece, item: heroItem(piece), at: 0 })
        first = false
      })
      const t = TESTIMONIALS.find((x) => x.name === s.quote)
      if (t) tiles.push({ kind: 'quote', key: `${s.id}-quote`, section, first: false, t })
    })
    return tiles
  }, [])
}

// One tile: the hero or a detail on the piece's colour, or a colleague's words
function TileView({ tile, active, near }: { tile: Tile; active: boolean; near: boolean }) {
  if (tile.kind === 'quote') {
    return (
      <figure className="flex aspect-[5/4] h-full flex-col justify-between rounded-xl border border-border bg-background p-[7%]">
        <blockquote className="text-[clamp(15px,2.2dvh,22px)] leading-[1.35] tracking-[-0.01em] text-foreground text-pretty">&ldquo;{tile.t.pull}&rdquo;</blockquote>
        <figcaption className="text-sm leading-5 text-muted">{tile.t.name}<br />{tile.t.role}, {tile.t.company}</figcaption>
      </figure>
    )
  }
  const { piece, item, at } = tile
  // A showcase hero stands bare; a demo, and every detail, sits on the piece's colour
  const bare = at === 0 && !piece.framed
  const media = <Media item={item} near={near} playing={active} />
  return (
    <div className={`relative flex aspect-[16/10] h-full items-center justify-center overflow-hidden rounded-xl ${bare ? 'bg-[#fafafa] shadow-[0_0_0_1px_var(--border)]' : ''}`} style={bare ? undefined : { background: piece.tint }}>
      {bare ? media : <div className="relative aspect-[16/10] w-[86%] overflow-hidden rounded-lg bg-[#fafafa] shadow-[0_10px_30px_-12px_rgba(0,0,0,0.2)]">{media}</div>}
    </div>
  )
}

// Only once a tile in focus is clicked: the piece's title, what it did, the way in, and its details
function Caption({ piece, onDetails }: { piece: ShowcasePiece; onDetails: () => void }) {
  return (
    <div className="flex max-w-[640px] flex-col gap-3">
      <h3 className="text-[20px] font-medium leading-[26px] tracking-[-0.01em] text-foreground text-balance">{piece.title}</h3>
      {piece.impact
        ? <ImpactSentence impact={piece.impact} className="hidden text-base leading-[24px] md:block" />
        : <p className="hidden text-base leading-[24px] text-muted md:block">{piece.summary}</p>}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
        <Links piece={piece} />
        <button onClick={onDetails} className="text-sm leading-5 text-muted transition-colors hover:text-foreground">See it big →</button>
      </div>
    </div>
  )
}

// Text that changes as the strip moves: the new words rise in, softly, over the old ones leaving
function Swap({ k, children, className = '' }: { k: string; children: React.ReactNode; className?: string }) {
  const still = useReducedMotion()
  const from = still ? { opacity: 0 } : { opacity: 0, transform: 'translateY(8px)', filter: 'blur(4px)' }
  const to = still ? { opacity: 0 } : { opacity: 0, transform: 'translateY(-8px)', filter: 'blur(4px)' }
  return (
    <div className={`grid ${className}`}>
      <AnimatePresence initial={false}>
        <motion.div
          key={k}
          className="col-start-1 row-start-1"
          initial={from}
          animate={{ opacity: 1, transform: 'translateY(0px)', filter: 'blur(0px)' }}
          exit={{ ...to, transition: { duration: 0.15, ease: 'easeOut' } }}
          transition={{ duration: 0.3, ease }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

const pad2 = (n: number) => String(n).padStart(2, '0')

export function HomeStrip() {
  useNoScrollJumps()
  const tiles = useTiles()
  const outer = useRef<HTMLDivElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const offsets = useRef<number[]>([]) // each tile's distance along the strip from the first
  const [height, setHeight] = useState<number>()
  const [active, setActive] = useState(0)
  const activeRef = useRef(0)
  const [lightbox, setLightbox] = useState<{ items: Item[]; start: number } | null>(null)
  const [about, setAbout] = useState(false) // the words for the tile in focus, shown once it's clicked

  // Where the strip is: the page's scroll past the top of the strip, as distance along it
  const update = useCallback(() => {
    const el = outer.current, row = track.current, at = offsets.current
    if (!el || !row || !at.length) return
    const travel = at[at.length - 1]
    const x = Math.min(travel, Math.max(0, HEADER - el.getBoundingClientRect().top))
    row.style.transform = `translate3d(${-x}px, 0, 0)`
    // In focus: the tile whose left edge is nearest the column's
    let best = 0
    for (let i = 1; i < at.length; i++) if (Math.abs(at[i] - x) < Math.abs(at[best] - x)) best = i
    if (best !== activeRef.current) { activeRef.current = best; setActive(best); setAbout(false) }
  }, [])

  // The strip's length sets how tall its stretch of page is: one pixel down is one pixel along
  useLayoutEffect(() => {
    const row = track.current
    if (!row) return
    const measure = () => {
      const els = Array.from(row.querySelectorAll<HTMLElement>('[data-tile]'))
      const x0 = els[0]?.offsetLeft ?? 0
      offsets.current = els.map((e) => e.offsetLeft - x0)
      setHeight(window.innerHeight - HEADER + (offsets.current[offsets.current.length - 1] ?? 0))
      update()
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(row)
    window.addEventListener('resize', measure)
    return () => { ro.disconnect(); window.removeEventListener('resize', measure) }
  }, [update])

  // When the scrolling stops with the strip pinned, it settles on the nearest tile, so one is
  // always square on the edge rather than half off it
  useEffect(() => {
    let frame = 0
    let rest: ReturnType<typeof setTimeout>
    const settle = () => {
      const el = outer.current, at = offsets.current
      if (!el || !at.length) return
      const x = HEADER - el.getBoundingClientRect().top
      if (x <= 0 || x >= at[at.length - 1]) return
      const off = at[activeRef.current] - x
      if (Math.abs(off) > 2) window.scrollBy({ top: off, behavior: 'smooth' })
    }
    const onScroll = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(update)
      clearTimeout(rest)
      rest = setTimeout(settle, 180)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(frame); clearTimeout(rest) }
  }, [update])

  // Bring a tile to the edge: scroll the page to its place along the strip
  const goTo = useCallback((i: number) => {
    const el = outer.current
    if (!el) return
    const to = Math.min(tiles.length - 1, Math.max(0, i))
    window.scrollTo({ top: window.scrollY + el.getBoundingClientRect().top - HEADER + offsets.current[to], behavior: 'smooth' })
  }, [tiles.length])

  // While the strip is pinned: a sideways swipe on a trackpad moves it too, and the arrow keys step it
  useEffect(() => {
    const el = stage.current
    if (!el) return
    const pinned = () => {
      const r = outer.current?.getBoundingClientRect()
      return !!r && r.top <= HEADER + 1 && r.bottom >= window.innerHeight - 1
    }
    const wheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return
      e.preventDefault()
      window.scrollBy(0, e.deltaX)
    }
    const key = (e: KeyboardEvent) => {
      if (lightbox || !pinned() || (e.target as HTMLElement).closest('input, textarea, [contenteditable]')) return
      if (e.key === 'ArrowRight') { e.preventDefault(); goTo(activeRef.current + 1) }
      if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(activeRef.current - 1) }
    }
    el.addEventListener('wheel', wheel, { passive: false })
    window.addEventListener('keydown', key)
    return () => { el.removeEventListener('wheel', wheel); window.removeEventListener('keydown', key) }
  }, [goTo, lightbox])

  const tile = tiles[active]
  const section = SHOWCASE_SECTIONS[tile.section]
  const sectionStarts = SHOWCASE_SECTIONS.map((_, s) => tiles.findIndex((t) => t.section === s))

  return (
    <>
      {/* Full width, out of the page's column */}
      <div ref={outer} className="relative ml-[calc(50%-50vw)] w-screen" style={{ height: height ?? '100dvh' }}>
        <div ref={stage} className="sticky flex flex-col justify-between overflow-hidden" style={{ top: HEADER, height: `calc(100dvh - ${HEADER}px)` }}>

          {/* The section, and the others to jump to */}
          <div className="flex items-start justify-between gap-8 pt-8 md:pt-12" style={{ paddingLeft: PAD, paddingRight: PAD }}>
            <div className="flex flex-col gap-2">
              <span className="text-sm tabular-nums text-muted">{pad2(tile.section + 1)} / {pad2(SHOWCASE_SECTIONS.length)}</span>
              <Swap k={section.id}>
                <h2 className="text-[28px] font-medium leading-[34px] tracking-[-0.02em] text-foreground text-balance md:text-[36px] md:leading-[40px]">{section.title}</h2>
              </Swap>
            </div>
            <nav aria-label="Sections" className="hidden shrink-0 flex-col items-end gap-1 pt-7 lg:flex">
              {SHOWCASE_SECTIONS.map((s, i) => (
                <button key={s.id} onClick={() => goTo(sectionStarts[i])} aria-current={i === tile.section} className={`text-sm leading-6 transition-colors duration-200 ${i === tile.section ? 'text-foreground' : 'text-muted hover:text-foreground'}`}>
                  {s.title}
                </button>
              ))}
            </nav>
          </div>

          {/* The strip */}
          <div className="relative" style={{ height: TILE_H }}>
            <div ref={track} className="flex h-full will-change-transform" style={{ paddingLeft: PAD }}>
              {tiles.map((t, i) => {
                const focus = i === active
                const live = focus && t.kind === 'item' && !!t.item.widget
                return (
                  <div key={t.key} data-tile className="relative h-full shrink-0" style={{ marginLeft: i === 0 ? 0 : t.first ? 96 : 12 }}>
                    <TileView tile={t} active={focus} near={Math.abs(i - active) <= 5} />
                    {!live && (
                      <button
                        onClick={() => focus ? t.kind === 'item' && setAbout((a) => !a) : goTo(i)}
                        aria-label={t.kind === 'item' ? (focus ? `About ${t.piece.title}` : `Go to ${t.piece.title}`) : `Go to ${t.t.name}'s words`}
                        aria-expanded={focus && t.kind === 'item' ? about : undefined}
                        className={`absolute inset-0 rounded-xl ${focus && t.kind === 'quote' ? 'cursor-default' : 'cursor-pointer'}`}
                      />
                    )}
                  </div>
                )
              })}
              {/* Room past the last tile, so it can reach the edge */}
              <div aria-hidden className="shrink-0" style={{ width: '100vw' }} />
            </div>
            {/* Further right, further out of focus: layers of blur, each a little stronger and further in.
                It starts past the tile in focus, so on a phone that one stays sharp */}
            <div aria-hidden className="pointer-events-none absolute inset-y-[-8%] right-0" style={{ left: `max(58%, calc(${PAD} + ${TILE_H} * 1.6 + 12px))` }}>
              {[1, 2, 4, 8].map((px, n) => (
                <div
                  key={px}
                  className="absolute inset-0"
                  style={{
                    backdropFilter: `blur(${px}px)`,
                    WebkitBackdropFilter: `blur(${px}px)`,
                    maskImage: `linear-gradient(to right, transparent ${n * 22}%, black ${n * 22 + 30}%)`,
                    WebkitMaskImage: `linear-gradient(to right, transparent ${n * 22}%, black ${n * 22 + 30}%)`,
                  }}
                />
              ))}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,transparent_55%,var(--background))]" />
            </div>
          </div>

          {/* The strip is pictures only; a click on the tile in focus brings its words in here. The
              room is kept, so the strip doesn't move when they come */}
          <div className="flex h-[160px] items-end pb-8 md:h-[200px] md:pb-12" style={{ paddingLeft: PAD, paddingRight: PAD }}>
            <Swap k={about && tile.kind === 'item' ? tile.piece.id : 'none'} className="min-w-0 flex-1">
              {about && tile.kind === 'item' ? <Caption piece={tile.piece} onDetails={() => setLightbox({ items: itemsOf(tile.piece), start: 0 })} /> : <div />}
            </Swap>
          </div>
        </div>
      </div>

      <section aria-labelledby="home-onward" className="flex flex-col gap-6 px-6 py-24">
        <h2 id="home-onward" className="text-[36px] font-medium leading-[40px] tracking-[-0.02em] text-foreground">Keep going</h2>
        <div className="flex flex-wrap gap-x-8 gap-y-3 text-base">
          <Link href="/essays" className="text-foreground transition-colors hover:text-accent">Read the essays →</Link>
          <Link href="/cv" className="text-foreground transition-colors hover:text-accent">See the CV →</Link>
          <Link href="/contact" className="text-foreground transition-colors hover:text-accent">Get in touch →</Link>
        </div>
      </section>

      <AnimatePresence>{lightbox && <Lightbox key="lightbox" items={lightbox.items} start={lightbox.start} onClose={() => setLightbox(null)} />}</AnimatePresence>
    </>
  )
}
