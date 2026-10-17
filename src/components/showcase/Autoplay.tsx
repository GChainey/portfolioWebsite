'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ArrowRight, BookOpen, X } from 'lucide-react'
import { PRODUCTS, CASE_STUDIES, type WorkItem } from '@/content/work'
import { WorkReel, WorkLink, WorkRead, useAutoAdvance, itemSeconds, pad, ease, SectionLabel, Progress, SHOWCASE_CSS } from './shared'

// Variant 1, Autoplay: the carousel, made to run by itself. Each reel plays through and hands
// over to the next, with a progress bar in its tab. "Read the case study" slides the features
// and thinking over the stage while the reel keeps playing behind.

function AutoplayStage({ label, note, items, borders }: { label: string; note: string; items: WorkItem[]; borders: boolean }) {
  const { index, go, step, onCycle, setHold } = useAutoAdvance(items.length)
  const [reading, setReading] = useState(false)
  const [hover, setHover] = useState(false)
  const item = items[index]
  const held = reading || hover

  const select = (i: number) => { setReading(false); go(i) }

  return (
    <section
      className="border-b border-border"
      aria-roledescription="carousel"
      aria-label={label}
      onMouseEnter={() => { setHover(true); setHold(true) }}
      onMouseLeave={() => { setHover(false); setHold(reading) }}
    >
      <SectionLabel
        borders={borders}
        right={
          <div className="flex gap-1">
            {[{ by: -1, Icon: ArrowLeft, name: 'Previous' }, { by: 1, Icon: ArrowRight, name: 'Next' }].map(({ by, Icon, name }) => (
              <button key={name} onClick={() => { setReading(false); step(by) }} aria-label={name} className="p-1.5 rounded-full border border-border text-muted hover:text-foreground hover:border-foreground/30 transition-colors">
                <Icon className="w-3.5 h-3.5" />
              </button>
            ))}
          </div>
        }
      >
        <p className="text-xs text-muted uppercase tracking-widest truncate">{label}</p>
        <p className="hidden sm:block text-xs text-muted truncate">{note}</p>
      </SectionLabel>

      {/* The stage: a fixed 16:10 box, reels cross-fading in place */}
      <div className="relative w-full overflow-hidden bg-[color-mix(in_srgb,var(--border)_30%,transparent)]" style={{ aspectRatio: '16 / 10' }}>
        <AnimatePresence initial={false}>
          <motion.div key={item.id} className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.45, ease }}>
            <WorkReel item={item} onCycle={onCycle} />
          </motion.div>
        </AnimatePresence>

        {/* The read slides in over the right of the stage */}
        <AnimatePresence>
          {reading && (
            <motion.aside
              key={`read-${item.id}`}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.45, ease }}
              className="absolute inset-y-0 right-0 w-full sm:w-[46%] overflow-y-auto bg-background backdrop-blur-md border-l border-border p-6 sm:p-8"
            >
              <button onClick={() => { setReading(false); setHold(hover) }} aria-label="Close" className="absolute top-4 right-4 p-1.5 rounded-full text-muted hover:text-foreground hover:bg-border transition-colors">
                <X className="w-4 h-4" />
              </button>
              <p className="text-xs text-muted uppercase tracking-wide mb-1.5">{item.kicker}</p>
              <h3 className="text-xl font-medium text-foreground mb-6 pr-8">{item.title}</h3>
              <WorkRead item={item} compact />
              <WorkLink item={item} className="mt-7 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity" />
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      {/* Caption: every one in the same cell, so the height never changes */}
      <div className="grid border-t border-border">
        {items.map((s, i) => {
          const active = i === index
          return (
            <div key={s.id} aria-hidden={!active} className={`[grid-area:1/1] flex flex-col sm:flex-row sm:items-start justify-between gap-4 px-8 py-5 transition-opacity duration-300 ${active ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
              <div className="min-w-0 max-w-xl">
                <p className="text-xs text-muted uppercase tracking-wide mb-1.5">{s.kicker}</p>
                <h3 className="text-xl font-medium text-foreground mb-1">{s.title}</h3>
                <p className="text-sm text-muted">{s.summary}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  onClick={() => { const next = !reading; setReading(next); setHold(next || hover) }}
                  tabIndex={active ? undefined : -1}
                  aria-pressed={reading}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm transition-colors ${reading ? 'border-foreground bg-foreground text-background' : 'border-border text-foreground hover:border-foreground/40'}`}
                >
                  <BookOpen className="w-4 h-4" />
                  {s.kind === 'product' ? 'How it works' : 'Read the case study'}
                </button>
                <WorkLink item={s} tabIndex={active ? undefined : -1} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border text-sm text-foreground hover:border-accent hover:text-accent transition-colors">
                  {s.external ? 'Visit' : 'Open'}
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </WorkLink>
              </div>
            </div>
          )
        })}
      </div>

      {/* Tabs with a progress bar: the reel playing now, and how long until the next */}
      <div role="tablist" className="grid border-t border-border" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
        {items.map((s, i) => (
          <button key={s.id} role="tab" aria-selected={i === index} onClick={() => select(i)} className={`group relative text-left px-4 sm:px-5 py-4 ${i < items.length - 1 ? 'border-r border-border' : ''}`}>
            <span className="absolute left-0 right-0 top-0 h-0.5 bg-border overflow-hidden">
              {i === index && <Progress key={`${s.id}-${index}`} seconds={itemSeconds(s)} active className={held ? '[animation-play-state:paused]' : ''} />}
            </span>
            <span className="block text-xs font-mono text-muted mb-1">{pad(i + 1)}</span>
            <span className={`block text-sm line-clamp-1 transition-colors ${i === index ? 'text-foreground font-medium' : 'text-muted group-hover:text-foreground'}`}>{s.name}</span>
          </button>
        ))}
      </div>
    </section>
  )
}

export function AutoplayShowcase({ borders }: { borders: boolean }) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: SHOWCASE_CSS }} />
      <AutoplayStage label="Products" note="Things I've built and shipped" items={PRODUCTS} borders={borders} />
      <AutoplayStage label="How design has changed with AI" note="Three case studies" items={CASE_STUDIES} borders={borders} />
    </>
  )
}
