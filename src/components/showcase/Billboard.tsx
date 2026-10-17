'use client'

import { useCallback, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, BookOpen, Play, X } from 'lucide-react'
import { WORK, type WorkItem } from '@/content/work'
import { WorkReel, WorkLink, WorkRead, useAutoAdvance, useOverlay, itemSeconds, pad, ease, Progress, SHOWCASE_CSS } from './shared'

// Variant 4, Billboard: maximal. A dark, full-width stage where the work plays behind huge type,
// washed in each piece's own colour. The headline lands word by word, a giant numeral counts
// the pieces, and a rail of stills underneath shows what's next. "Read" opens the whole piece:
// the reel with its captions, the features as cards, and the thinking as a pull quote.

function Words({ text, id }: { text: string; id: string }) {
  return (
    <span key={id} className="inline">
      {text.split(' ').map((w, i) => (
        <motion.span
          key={`${id}-${i}`}
          className="inline-block mr-[0.24em]"
          initial={{ opacity: 0, y: '0.5em', filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.55, delay: 0.15 + i * 0.06, ease }}
        >
          {w}
        </motion.span>
      ))}
    </span>
  )
}

function ReadSheet({ item, onClose }: { item: WorkItem; onClose: () => void }) {
  useOverlay(true, onClose)
  return (
    <motion.div className="fixed inset-0 z-[70] overflow-y-auto bg-black/70 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div
        className="relative mx-auto my-10 w-[min(1100px,92vw)] overflow-hidden rounded-3xl bg-[#0b0b0d] text-white ring-1 ring-white/10 shadow-2xl"
        initial={{ y: 40, scale: 0.97 }} animate={{ y: 0, scale: 1 }} exit={{ y: 40, scale: 0.97 }} transition={{ duration: 0.45, ease }}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} aria-label="Close" className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 text-white/80 hover:text-white backdrop-blur">
          <X className="w-4 h-4" />
        </button>
        <WorkReel item={item} theme="dark" />
        <div className="grid gap-10 p-8 sm:p-12 md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
          <div>
            <p className="text-xs uppercase tracking-widest mb-3" style={{ color: item.accent }}>{item.kicker}</p>
            <h3 className="text-4xl font-semibold tracking-tight mb-4 text-balance">{item.title}</h3>
            <p className="text-white/60 mb-8">{item.summary}</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {item.features.map((f, i) => (
                <div key={f} className="rounded-2xl bg-white/[0.04] ring-1 ring-white/10 p-4">
                  <p className="font-mono text-xs mb-2" style={{ color: item.accent }}>{pad(i + 1)}</p>
                  <p className="text-sm leading-relaxed text-white/85">{f}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-8">
            <blockquote className="text-xl leading-snug tracking-tight text-white/90">
              <span className="block text-5xl leading-none mb-2" style={{ color: item.accent }}>“</span>
              {item.thinking}
            </blockquote>
            {item.stats && (
              <div className="flex flex-wrap gap-8">
                {item.stats.map((s) => (
                  <div key={s.label}>
                    <p className="text-4xl font-semibold tracking-tight" style={{ color: item.accent }}>{s.value}</p>
                    <p className="text-xs text-white/50 mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
            )}
            <WorkLink item={item} style={{ background: item.accent }} className="mt-auto self-start inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium text-white hover:brightness-110" />
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export function BillboardShowcase() {
  const { index, go, onCycle, setHold } = useAutoAdvance(WORK.length)
  const [reading, setReading] = useState(false)
  const item = WORK[index]
  const close = useCallback(() => { setReading(false); setHold(false) }, [setHold])

  return (
    <section className="relative overflow-hidden border-b border-border bg-[#050506] text-white" style={{ containerType: 'inline-size' }} aria-label="The work">
      <style dangerouslySetInnerHTML={{ __html: SHOWCASE_CSS }} />

      {/* The piece's colour, washing the whole section */}
      <motion.div className="pointer-events-none absolute inset-0" animate={{ background: `radial-gradient(ellipse 70% 60% at 75% 35%, ${item.accent}40, transparent 70%), radial-gradient(ellipse 50% 50% at 10% 100%, ${item.accent}26, transparent 70%)` }} transition={{ duration: 1 }} />

      <div className="relative">
        {/* The work, playing behind the type */}
        {/* 16:10 on wider screens; a tall fixed stage on a phone, so the type has room */}
        <div className="relative h-[600px] sm:h-auto sm:aspect-[16/10]">
          <AnimatePresence initial={false}>
            <motion.div key={item.id} className="absolute inset-0" initial={{ opacity: 0, scale: 1.06, x: "22%" }} animate={{ opacity: 1, scale: 1, x: "22%" }} exit={{ opacity: 0 }} transition={{ duration: 0.9, ease }}>
              <WorkReel item={item} captions={false} theme="dark" onCycle={onCycle} />
            </motion.div>
          </AnimatePresence>
          {/* Scrims: the type sits on dark, and the stage fades into the rail */}
          <div className="pointer-events-none absolute inset-0" style={{ background: 'linear-gradient(to right, #050506 0%, rgba(5,5,6,.92) 22%, rgba(5,5,6,.55) 42%, transparent 62%)' }} />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#050506] to-transparent" />

          {/* A giant numeral, outlined */}
          <AnimatePresence mode="wait">
            <motion.span
              key={`n-${item.id}`}
              className="pointer-events-none absolute right-6 top-2 font-semibold leading-none tracking-tighter select-none"
              style={{ fontSize: 'clamp(80px, 18cqw, 200px)', WebkitTextStroke: `1.5px ${item.accent}`, color: 'transparent' }}
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 0.6, y: 0 }} exit={{ opacity: 0, y: -30 }} transition={{ duration: 0.5, ease }}
            >
              {pad(index + 1)}
            </motion.span>
          </AnimatePresence>

          {/* The headline, word by word */}
          <div className="absolute left-0 bottom-0 w-full sm:w-[62%] p-6 sm:p-10">
            <AnimatePresence mode="wait">
              <motion.div key={item.id} initial={{ opacity: 1 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3 }}>
                <p className="mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ring-1 ring-white/15 bg-white/5 backdrop-blur">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: item.accent, boxShadow: `0 0 12px ${item.accent}` }} />
                  {item.kicker}
                </p>
                <h2 className="font-semibold leading-[0.98] tracking-[-0.035em] text-balance" style={{ fontSize: 'clamp(30px, 6.2cqw, 68px)' }}>
                  <Words text={item.title} id={item.id} />
                </h2>
                <motion.p className="mt-4 max-w-md text-white/65" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>{item.summary}</motion.p>
                <motion.div className="mt-6 flex flex-wrap gap-2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.75, ease }}>
                  <button onClick={() => { setReading(true); setHold(true) }} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-black text-sm font-medium hover:bg-white/90">
                    <BookOpen className="w-4 h-4" />
                    {item.kind === 'product' ? 'How it works' : 'Read the case study'}
                  </button>
                  <WorkLink item={item} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 ring-1 ring-white/20 text-sm font-medium hover:bg-white/15 backdrop-blur">
                    {item.external ? `Visit ${item.name}` : 'Open it'}
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                  </WorkLink>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Rail: every piece, a progress line over the one playing */}
        <div className="relative grid grid-cols-3 sm:grid-cols-6 gap-2 px-6 sm:px-10 pb-8 pt-2">
          {WORK.map((w, i) => (
            <button key={w.id} onClick={() => { close(); go(i) }} className="group text-left" aria-label={w.name}>
              <span className="block h-0.5 mb-2 overflow-hidden rounded-full bg-white/15">
                {i === index && <Progress key={`${w.id}-${index}`} seconds={itemSeconds(w)} active color={w.accent} className={reading ? '[animation-play-state:paused]' : ''} />}
              </span>
              <span className={`relative block overflow-hidden rounded-lg ring-1 transition-all duration-300 ${i === index ? 'ring-white/50' : 'ring-white/10 opacity-50 group-hover:opacity-100'}`} style={{ aspectRatio: '16 / 10' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={w.poster} alt="" className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              </span>
              <span className={`mt-2 block truncate text-xs ${i === index ? 'text-white' : 'text-white/50'}`}>{w.name}</span>
            </button>
          ))}
        </div>

        <div className="relative flex items-center justify-between border-t border-white/10 px-6 sm:px-10 py-4 text-xs text-white/50">
          <span>Three products, three AI case studies</span>
          <Link href="/reel" className="inline-flex items-center gap-1.5 text-white/80 hover:text-white">
            <Play className="w-3.5 h-3.5" /> Watch the reel
          </Link>
        </div>
      </div>

      <AnimatePresence>{reading && <ReadSheet key={item.id} item={item} onClose={close} />}</AnimatePresence>
    </section>
  )
}
