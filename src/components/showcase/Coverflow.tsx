'use client'

import { useState } from 'react'
import { motion, AnimatePresence, type PanInfo } from 'framer-motion'
import { ArrowLeft, ArrowRight, ChevronDown } from 'lucide-react'
import { WORK, type WorkItem } from '@/content/work'
import { WorkReel, WorkLink, WorkRead, useAutoAdvance, itemSeconds, pad, ease, SectionLabel, Progress, SHOWCASE_CSS } from './shared'

// Variant 2, Coverflow: all six pieces on one track. The one in the middle plays; its
// neighbours wait either side as stills, a drag or a click away. Filter to products or case
// studies. "Read" opens the features and thinking under the stage.

const FILTERS = [
  { id: 'all', label: 'All work' },
  { id: 'product', label: 'Products' },
  { id: 'case-study', label: 'AI case studies' },
] as const

function Track({ items }: { items: WorkItem[] }) {
  const { index, go, step, onCycle, setHold } = useAutoAdvance(items.length)
  const [reading, setReading] = useState(false)
  const item = items[index]

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (Math.abs(info.offset.x) > 60 || Math.abs(info.velocity.x) > 400) { setReading(false); step(info.offset.x < 0 ? 1 : -1) }
  }

  // Each card's offset from the middle, wrapping so there is always one either side
  const offset = (i: number) => {
    let d = i - index
    if (d > items.length / 2) d -= items.length
    if (d < -items.length / 2) d += items.length
    return d
  }

  return (
    <>
      <div className="relative overflow-hidden py-8" style={{ perspective: 1600 }}>
        <motion.div className="relative mx-auto w-[78%] cursor-grab active:cursor-grabbing" style={{ aspectRatio: '16 / 10' }} drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.18} onDragEnd={onDragEnd}>
          {items.map((s, i) => {
            const d = offset(i)
            const centre = d === 0
            if (Math.abs(d) > 1) return null
            return (
              <motion.div
                key={s.id}
                className="absolute inset-0 overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
                initial={false}
                animate={{ x: `${d * 92}%`, scale: centre ? 1 : 0.82, rotateY: d * -18, opacity: centre ? 1 : 0.45, zIndex: centre ? 2 : 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 32 }}
                onClick={() => { if (!centre) { setReading(false); go(i) } }}
                style={{ cursor: centre ? undefined : 'pointer' }}
              >
                {centre ? (
                  <WorkReel item={s} onCycle={onCycle} />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={s.poster} alt="" draggable={false} className="absolute inset-0 w-full h-full object-cover" />
                )}
              </motion.div>
            )
          })}
        </motion.div>

        {/* Arrows over the neighbours */}
        {[{ by: -1, Icon: ArrowLeft, name: 'Previous', side: 'left-3' }, { by: 1, Icon: ArrowRight, name: 'Next', side: 'right-3' }].map(({ by, Icon, name, side }) => (
          <button key={name} onClick={() => { setReading(false); step(by) }} aria-label={name} className={`absolute ${side} top-1/2 -translate-y-1/2 z-10 p-2.5 rounded-full bg-background backdrop-blur border border-border text-foreground hover:scale-110 transition-transform`}>
            <Icon className="w-4 h-4" />
          </button>
        ))}
      </div>

      {/* Dots with progress */}
      <div className="flex justify-center gap-2 pb-6">
        {items.map((s, i) => (
          <button key={s.id} onClick={() => { setReading(false); go(i) }} aria-label={s.name} className={`relative h-1.5 overflow-hidden rounded-full bg-border transition-all ${i === index ? 'w-10' : 'w-1.5 hover:bg-muted'}`}>
            {i === index && <Progress key={`${s.id}-${index}`} seconds={itemSeconds(s)} active color={s.accent} className={reading ? '[animation-play-state:paused]' : ''} />}
          </button>
        ))}
      </div>

      {/* What's playing, and the read beneath it */}
      <div className="border-t border-border px-8 py-6">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={item.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25, ease }}>
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="min-w-0 max-w-xl">
                <p className="text-xs uppercase tracking-wide mb-1.5" style={{ color: item.accent }}>{pad(index + 1)} · {item.kicker}</p>
                <h3 className="text-2xl font-medium text-foreground mb-1">{item.title}</h3>
                <p className="text-sm text-muted">{item.summary}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button onClick={() => { setReading(!reading); setHold(!reading) }} aria-expanded={reading} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-border text-sm text-foreground hover:border-foreground/40 transition-colors">
                  Read
                  <ChevronDown className={`w-4 h-4 transition-transform ${reading ? 'rotate-180' : ''}`} />
                </button>
                <WorkLink item={item} style={{ background: item.accent }} className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-white transition-[filter] hover:brightness-110" />
              </div>
            </div>
            <AnimatePresence initial={false}>
              {reading && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.35, ease }} className="overflow-hidden">
                  <div className="pt-6"><WorkRead item={item} /></div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  )
}

export function CoverflowShowcase({ borders }: { borders: boolean }) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]['id']>('all')
  const items = filter === 'all' ? WORK : WORK.filter((w) => w.kind === filter)
  return (
    <section className="border-b border-border overflow-hidden" aria-label="Coverflow">
      <style dangerouslySetInnerHTML={{ __html: SHOWCASE_CSS }} />
      <SectionLabel
        borders={borders}
        right={
          <div className="flex gap-1 bg-[color-mix(in_srgb,var(--border)_40%,transparent)] rounded-full p-0.5">
            {FILTERS.map((f) => (
              <button key={f.id} onClick={() => setFilter(f.id)} aria-pressed={filter === f.id} className={`px-3 py-1 text-xs rounded-full transition-colors ${filter === f.id ? 'bg-foreground text-background font-medium' : 'text-muted hover:text-foreground'}`}>
                {f.label}
              </button>
            ))}
          </div>
        }
      >
        <p className="text-xs text-muted uppercase tracking-widest truncate">The work</p>
      </SectionLabel>
      <Track key={filter} items={items} />
    </section>
  )
}
