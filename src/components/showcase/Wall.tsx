'use client'

import { useCallback, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Maximize2, Play, X } from 'lucide-react'
import { WORK, type WorkItem } from '@/content/work'
import { WorkReel, WorkLink, WorkRead, useOverlay, ease, SHOWCASE_CSS } from './shared'

// Variant 5, The wall: maximal. Every piece plays at once in a bento grid, between two
// marquees of what the work does. Hover one and the rest fall back; click it and it grows out
// of the grid into the whole piece, its reel with captions beside the features and thinking.

// Small tiles are 16:10 and set the row height; the lead spans two rows and fills them
const LAYOUT = [
  'aspect-[16/10] md:aspect-auto md:col-span-4 md:row-span-2',
  'aspect-[16/10] md:col-span-2',
  'aspect-[16/10] md:col-span-2',
  'aspect-[16/10] md:col-span-2',
  'aspect-[16/10] md:col-span-2',
  'aspect-[16/10] md:col-span-2',
]

// Products lead with Shader Wall, then the case studies fill the grid
const ORDER = ['shader-wall', 'rfp', 'dispatch', 'configurator', 'thesis', 'html-brand-website']
const TILES = ORDER.map((id) => WORK.find((w) => w.id === id)!)

function Marquee({ reverse = false }: { reverse?: boolean }) {
  const words = WORK.flatMap((w) => [{ t: w.name, c: w.accent, strong: true }, ...w.features.slice(0, 1).map((f) => ({ t: f.split(/[,:.]/)[0], c: w.accent, strong: false }))])
  const run = [...words, ...words]
  return (
    <div className="overflow-hidden border-y border-border py-3 select-none" aria-hidden>
      <div className="flex w-max gap-8 whitespace-nowrap" style={{ animation: `showcase-marquee 60s linear infinite${reverse ? ' reverse' : ''}` }}>
        {run.map((w, i) => (
          <span key={i} className={`inline-flex items-center gap-3 ${w.strong ? 'text-2xl font-semibold tracking-tight text-foreground' : 'text-lg text-muted'}`}>
            <span className="h-2 w-2 rounded-full" style={{ background: w.c }} />
            {w.t}
          </span>
        ))}
      </div>
    </div>
  )
}

function Tile({ item, className, lead, dim, onOpen, onHover }: { item: WorkItem; className: string; lead: boolean; dim: boolean; onOpen: () => void; onHover: (on: boolean) => void }) {
  return (
    <motion.button
      layoutId={`tile-${item.id}`}
      onClick={onOpen}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      className={`group relative overflow-hidden rounded-2xl bg-[#09090b] text-left ring-1 ring-border ${className}`}
      animate={{ opacity: dim ? 0.35 : 1, scale: dim ? 0.985 : 1 }}
      transition={{ duration: 0.35, ease }}
    >
      <div className="absolute inset-0">
        <WorkReel item={item} captions={false} theme="dark" />
      </div>
      {/* Its colour, ringing the tile on hover */}
      <span className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ boxShadow: `inset 0 0 0 2px ${item.accent}, 0 0 60px -10px ${item.accent}` }} />
      <span className={`pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent text-white ${lead ? 'p-5 pt-16' : 'p-3 pt-10'}`}>
        <span className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-white/70">
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: item.accent, boxShadow: `0 0 10px ${item.accent}` }} />
          {item.kind === 'product' ? 'Product' : 'Case study'}
        </span>
        <span className={`mt-1 block font-semibold tracking-tight leading-tight ${lead ? 'text-2xl' : 'text-base'}`}>{item.name}</span>
        {lead && <span className="mt-1 block text-sm text-white/70 line-clamp-1 max-w-md">{item.summary}</span>}
      </span>
      <span className="absolute top-3 right-3 rounded-full bg-black/50 p-2 text-white opacity-0 backdrop-blur transition-opacity group-hover:opacity-100">
        <Maximize2 className="w-3.5 h-3.5" />
      </span>
    </motion.button>
  )
}

function Expanded({ item, onClose }: { item: WorkItem; onClose: () => void }) {
  useOverlay(true, onClose)
  return (
    <motion.div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div
        layoutId={`tile-${item.id}`}
        className="relative grid max-h-[92vh] w-[min(1240px,96vw)] overflow-hidden rounded-3xl bg-background ring-1 ring-border shadow-2xl lg:grid-cols-[minmax(0,8fr)_minmax(0,4fr)]"
        onClick={(e) => e.stopPropagation()}
        transition={{ duration: 0.5, ease }}
      >
        <div className="relative flex items-center bg-[#09090b]">
          <div className="w-full">
          <WorkReel item={item} theme="dark" />
          </div>
        </div>
        <motion.div className="overflow-y-auto p-6 sm:p-8" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25, duration: 0.4, ease }}>
          <p className="text-xs uppercase tracking-widest mb-2" style={{ color: item.accent }}>{item.kicker}</p>
          <h3 className="text-2xl font-semibold tracking-tight text-foreground mb-2 text-balance">{item.title}</h3>
          <p className="text-sm text-muted mb-7">{item.summary}</p>
          <WorkRead item={item} compact />
          <WorkLink item={item} style={{ background: item.accent }} className="mt-7 inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium text-white hover:brightness-110" />
        </motion.div>
        <button onClick={onClose} aria-label="Close" className="absolute top-3 right-3 z-10 p-2 rounded-full bg-black/50 text-white backdrop-blur hover:bg-black/70">
          <X className="w-4 h-4" />
        </button>
      </motion.div>
    </motion.div>
  )
}

export function WallShowcase() {
  const [open, setOpen] = useState<string | null>(null)
  const [hover, setHover] = useState<string | null>(null)
  const close = useCallback(() => setOpen(null), [])
  const openItem = TILES.find((t) => t.id === open)

  return (
    <section className="border-b border-border overflow-hidden" aria-label="The work">
      <style dangerouslySetInnerHTML={{ __html: SHOWCASE_CSS }} />
      <div className="px-8 pt-10 pb-6 flex flex-wrap items-end justify-between gap-4">
        <h2 className="font-semibold tracking-[-0.035em] leading-[0.95] text-foreground" style={{ fontSize: 'clamp(36px, 5vw, 60px)' }}>
          Everything,<br /><span className="text-muted">playing at once.</span>
        </h2>
        <Link href="/reel" className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-foreground text-background text-sm font-medium hover:opacity-90">
          <Play className="w-4 h-4" /> Watch the reel
        </Link>
      </div>
      <Marquee />
      <div className="grid grid-cols-1 md:grid-cols-6 gap-3 p-3 md:auto-rows-auto">
        {TILES.map((t, i) =>
          // The open one leaves its place in the grid and grows into the overlay
          open === t.id ? (
            <div key={t.id} className={`rounded-2xl bg-[color-mix(in_srgb,var(--border)_30%,transparent)] ${LAYOUT[i]}`} />
          ) : (
            <Tile key={t.id} item={t} className={LAYOUT[i]} lead={i === 0} dim={!!hover && hover !== t.id} onOpen={() => { setHover(null); setOpen(t.id) }} onHover={(on) => setHover(on ? t.id : null)} />
          ),
        )}
      </div>
      <Marquee reverse />
      <AnimatePresence>{openItem && <Expanded key={openItem.id} item={openItem} onClose={close} />}</AnimatePresence>
    </section>
  )
}
