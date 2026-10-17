'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { WORK } from '@/content/work'
import { WorkReel, WorkLink, WorkRead, pad, ease, SectionLabel } from './shared'

// Variant 3, Scroll story: the read is the page. Each piece is a chapter that scrolls past on
// the left, features and thinking included, while the stage on the right stays put and plays
// whichever chapter is in the middle of the screen. Nothing to click to see the work.
//
// It runs the full width of the window, out of the page's column: the text stays lined up with
// the rest of the page and the stage takes everything to its right. While it passes, it sits
// over the chat sidebar.

// How far the page's column is from the window's left edge, and the window's width
function useBleed(ref: React.RefObject<HTMLElement>) {
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

export function ScrollyShowcase({ borders }: { borders: boolean }) {
  const [active, setActive] = useState(0)
  const chapters = useRef<(HTMLElement | null)[]>([])
  const section = useRef<HTMLElement>(null)
  const { gutter, width } = useBleed(section)
  const item = WORK[active]
  // The text column: the page's gutter, then a readable measure
  const inset = gutter + 32

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.index)) }),
      { rootMargin: '-45% 0px -45% 0px' },
    )
    chapters.current.forEach((el) => el && io.observe(el))
    return () => io.disconnect()
  }, [])

  return (
    <section
      ref={section}
      className="relative z-20 border-y border-border bg-background"
      style={width ? { marginLeft: -gutter, width } : undefined}
      aria-label="The work"
    >
      <div style={{ paddingLeft: gutter, paddingRight: gutter }}>
        <SectionLabel borders={borders} right={<span className="text-xs font-mono text-muted tabular-nums">{pad(active + 1)} / {pad(WORK.length)}</span>}>
          <p className="text-xs text-muted uppercase tracking-widest truncate">Products, then three AI case studies</p>
        </SectionLabel>
      </div>

      <div className={`relative md:grid ${borders ? 'border-t border-border' : ''}`} style={{ gridTemplateColumns: `min(${inset + 488}px, 46%) minmax(0, 1fr)` }}>
        {/* Chapters */}
        <div className="md:border-r border-border">
          {WORK.map((w, i) => (
            <article
              key={w.id}
              ref={(el) => { chapters.current[i] = el }}
              data-index={i}
              className={`px-8 md:pl-[var(--inset)] py-16 md:min-h-[85vh] flex flex-col justify-center border-b border-border last:border-b-0 transition-opacity duration-500 ${i === active ? 'opacity-100' : 'md:opacity-35'}`}
              style={{ ['--inset' as string]: `${inset}px` }}
            >
              {/* On a phone the stage can't stick beside the text, so each chapter has its own */}
              <div className="md:hidden mb-6 overflow-hidden rounded-xl border border-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={w.poster} alt="" className="block w-full" />
              </div>
              <p className="text-xs uppercase tracking-widest mb-3 flex items-center gap-2" style={{ color: w.accent }}>
                <span className="font-mono">{pad(i + 1)}</span>
                <span className="h-px w-6" style={{ background: w.accent }} />
                {w.kind === 'product' ? 'Product' : 'Case study'}
              </p>
              <h3 className="text-3xl font-medium tracking-tight text-foreground mb-3 text-balance">{w.title}</h3>
              <p className="text-muted mb-8">{w.summary}</p>
              <WorkRead item={w} compact />
              <WorkLink item={w} className="mt-8 self-start inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border text-sm text-foreground hover:border-accent hover:text-accent transition-colors" />
            </article>
          ))}
        </div>

        {/* The stage, stuck to the screen while the chapters pass */}
        <div className="hidden md:block">
          <div className="sticky top-14 h-[calc(100vh-56px)] flex flex-col justify-center px-8 lg:px-12 py-8">
            {/* As wide as the column, but never taller than the screen */}
            <div className="relative mx-auto w-full" style={{ maxWidth: 'calc((100vh - 220px) * 1.6)' }}>
              {/* The piece's colour, glowing behind the stage */}
              <motion.div
                className="absolute -inset-10 rounded-[40px] blur-3xl"
                animate={{ background: `radial-gradient(closest-side, ${item.accent}55, transparent)` }}
                transition={{ duration: 0.8 }}
              />
              <div className="relative overflow-hidden rounded-xl border border-border bg-card shadow-2xl" style={{ aspectRatio: '16 / 10' }}>
                <AnimatePresence initial={false}>
                  <motion.div key={item.id} className="absolute inset-0" initial={{ opacity: 0, scale: 1.03 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5, ease }}>
                    <WorkReel item={item} />
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
            {/* Where you are in the story */}
            <div className="relative mx-auto mt-6 flex w-full gap-1.5" style={{ maxWidth: 'calc((100vh - 220px) * 1.6)' }}>
              {WORK.map((w, i) => (
                <button
                  key={w.id}
                  onClick={() => chapters.current[i]?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                  className="group flex-1 text-left"
                  aria-label={w.name}
                >
                  <span className="block h-0.5 rounded-full transition-colors" style={{ background: i === active ? w.accent : 'var(--border)' }} />
                  <span className={`mt-2 block truncate text-[11px] transition-colors ${i === active ? 'text-foreground' : 'text-muted group-hover:text-foreground'}`}>{w.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
