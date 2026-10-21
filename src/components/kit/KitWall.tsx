'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ArrowUpRight, X } from 'lucide-react'
import { KIT, KIT_APPS, type KitCard } from '@/content/kit'
import { KIT_CARDS, SkeletonCard } from '@/components/kit/cards'
import { RecordingReplay } from '@/components/replay/RecordingReplay'
import { ScaledFrame } from '@/components/ScaledFrame'

const COL = 268 // a column's width
const GAP = 16
const COLLAPSED = 820 // how much of the wall shows before "Show all"

// Ghost columns at either edge, where the stack runs off the page
const GHOSTS = [[180, 240, 150, 260, 200], [230, 160, 280, 190, 220]]

// Deal the cards into columns, each going under the shortest so the bottoms stay level
function deal(cards: KitCard[], cols: number) {
  const columns: KitCard[][] = Array.from({ length: cols }, () => [])
  const heights = new Array(cols).fill(0)
  for (const card of cards) {
    const i = heights.indexOf(Math.min(...heights))
    columns[i].push(card)
    heights[i] += card.h + GAP
  }
  return columns
}

// Pieces of the Enterprise AI products, stacked like a component library. Hovering one picks
// out the rest of its app; clicking it shows the piece working in that app.
export function KitWall() {
  const box = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)
  const [hovered, setHovered] = useState<string | null>(null)
  const [open, setOpen] = useState<KitCard | null>(null)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    const el = box.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setWidth(e.contentRect.width))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // As many whole columns as fit with room for the ghosts to peek in at the sides
  const cols = width < 600 ? 1 : Math.max(2, Math.min(5, Math.floor((width - 96) / (COL + GAP))))
  const colWidth = cols === 1 ? Math.max(0, width - 32) : COL
  const columns = useMemo(() => deal(KIT, cols), [cols])
  const ghosts = cols > 1

  return (
    <div ref={box} className="relative">
      <div
        className="relative overflow-hidden transition-[max-height] duration-700 ease-out"
        style={{
          maxHeight: expanded ? 4000 : COLLAPSED,
          maskImage: ghosts ? 'linear-gradient(to right, transparent, black 9%, black 91%, transparent)' : undefined,
        }}
      >
        <div className="flex justify-center gap-4 px-4 py-8" style={{ visibility: width ? 'visible' : 'hidden' }}>
          {ghosts && <Ghosts heights={GHOSTS[0]} width={colWidth} />}
          {columns.map((column, c) => (
            <div key={c} className="flex shrink-0 flex-col gap-4" style={{ width: colWidth }}>
              {column.map((card, i) => (
                <Piece
                  key={card.id}
                  card={card}
                  delay={(c + i) * 0.05}
                  dim={hovered !== null && hovered !== card.app}
                  onHover={setHovered}
                  onOpen={() => setOpen(card)}
                />
              ))}
            </div>
          ))}
          {ghosts && <Ghosts heights={GHOSTS[1]} width={colWidth} />}
        </div>
      </div>

      {!expanded && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex h-48 items-end justify-center bg-gradient-to-t from-background via-background to-transparent pb-8">
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="pointer-events-auto rounded-full border border-border bg-background px-4 py-2 text-sm text-foreground transition-colors hover:border-accent hover:text-accent"
          >
            Show all
          </button>
        </div>
      )}

      <KitDialog card={open} onPick={setOpen} onClose={() => setOpen(null)} />
    </div>
  )
}

function Ghosts({ heights, width }: { heights: number[]; width: number }) {
  return (
    <div className="flex shrink-0 flex-col gap-4" style={{ width }}>
      {heights.map((h, i) => <SkeletonCard key={i} h={h} />)}
    </div>
  )
}

function Piece({ card, delay, dim, onHover, onOpen }: {
  card: KitCard
  delay: number
  dim: boolean
  onHover: (app: string | null) => void
  onOpen: () => void
}) {
  const Card = KIT_CARDS[card.id]
  const app = KIT_APPS[card.app]
  return (
    <motion.button
      type="button"
      onClick={onOpen}
      onPointerEnter={(e) => e.pointerType === 'mouse' && onHover(card.app)}
      onPointerLeave={() => onHover(null)}
      onFocus={() => onHover(card.app)}
      onBlur={() => onHover(null)}
      aria-label={`${card.title}, from ${app.name}. See it in the app`}
      className="group relative block w-full rounded-xl text-left outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <div
        className="pointer-events-none select-none rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-[opacity,transform,box-shadow,filter] duration-300 group-hover:-translate-y-0.5 group-hover:shadow-[0_12px_32px_-12px_rgba(0,0,0,0.25)]"
        style={{ opacity: dim ? 0.35 : 1, filter: dim ? 'grayscale(1)' : undefined }}
        aria-hidden
      >
        <Card />
      </div>
      <span className="pointer-events-none absolute -bottom-2.5 left-1/2 z-10 inline-flex -translate-x-1/2 translate-y-1 items-center gap-1 whitespace-nowrap rounded-full bg-foreground px-2.5 py-1 text-[11px] font-medium text-background opacity-0 shadow-lg transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
        {app.name}<ArrowUpRight className="h-3 w-3" />
      </span>
    </motion.button>
  )
}

// The piece in its app: a recording of it working there, or the live prototype
function KitDialog({ card, onPick, onClose }: { card: KitCard | null; onPick: (c: KitCard) => void; onClose: () => void }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (!card) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [card, onClose])

  if (!mounted) return null
  const app = card && KIT_APPS[card.app]
  // The app's pieces, one per clip, with this one standing in for any that share its clip
  const same = (a: KitCard, b: KitCard) => JSON.stringify(a.clip) === JSON.stringify(b.clip)
  const siblings = card
    ? KIT.filter((c) => c.app === card.app)
        .filter((c, i, all) => all.findIndex((o) => same(o, c)) === i)
        .map((c) => (same(c, card) ? card : c))
    : []

  return createPortal(
    <AnimatePresence>
      {card && app && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-label={`${app.name}: ${card.title}`}
        >
          <div className="absolute inset-0 backdrop-blur-sm" style={{ background: 'color-mix(in srgb, var(--background) 85%, transparent)' }} onClick={onClose} />
          <motion.div
            className="relative flex max-h-full w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl"
            initial={{ scale: 0.96, y: 12 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.96, y: 12 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
          >
            <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-widest text-muted">{app.name}</p>
                <p className="mt-1 font-medium text-foreground">{card.title}</p>
              </div>
              <button type="button" onClick={onClose} aria-label="Close" className="rounded-full p-1.5 text-muted transition-colors hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto">
              <div className="[&_figure]:my-0">
                {'replay' in card.clip ? (
                  <RecordingReplay key={card.id} src={card.clip.replay} region={card.clip.region} bar={false} />
                ) : (
                  <div className="p-4 sm:p-6"><ScaledFrame key={card.id} src={card.clip.frame} title={card.title} width={card.clip.width} height={card.clip.height} /></div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-1.5">
                {siblings.length > 1 && siblings.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => onPick(s)}
                    className={`rounded-full border px-2.5 py-1 text-xs transition-colors ${s === card ? 'border-foreground text-foreground' : 'border-border text-muted hover:border-accent hover:text-accent'}`}
                  >
                    {s.title}
                  </button>
                ))}
              </div>
              <Link href={app.href} className="group inline-flex shrink-0 items-center gap-1 text-sm text-foreground hover:text-accent">
                Read the case study <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}
