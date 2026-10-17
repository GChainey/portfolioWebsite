'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react'
import { ReplayReel, type ReelScene } from '@/components/replay/ReplayReel'

// The homepage shows the work instead of listing it: one large preview at a time, playing,
// with the others a click (or a swipe) away. Every preview fills the same 16:10 stage and
// slides cross-fade on top of each other, so nothing below moves when the slide changes. Only
// the slide on screen (and the one fading out) is mounted, so one reel, clip or site runs at a time.

export type ShowcaseMedia =
  | { type: 'reel'; scenes: ReelScene[] }
  | { type: 'video'; src: string; poster?: string }
  | { type: 'site'; src: string } // the live site itself, scaled down and not interactive

export interface ShowcaseSlide {
  id: string
  kicker: string
  title: string
  tab?: string // a shorter name for the row of tabs under the slide
  description: string
  href: string
  cta: string
  external?: boolean
  media: ShowcaseMedia
}

const ease = [0.25, 0.1, 0.25, 1] as const
const FADE = 0.4

// Everything is drawn at 16:10: the reels' stage, the website recording and a desktop browser
const STAGE = '16 / 10'
const SITE_W = 1440
const SITE_H = 900

// A live site drawn at desktop size and scaled to fill the stage. It fades in once loaded,
// so there is no white flash while it arrives.
function SitePreview({ src, title }: { src: string; title: string }) {
  const box = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const el = box.current
    if (!el) return
    const fit = () => setScale(el.clientWidth / SITE_W)
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <div ref={box} className="absolute inset-0 overflow-hidden">
      {scale > 0 && (
        <iframe
          src={src}
          title={`${title}, live`}
          tabIndex={-1}
          aria-hidden
          onLoad={() => setLoaded(true)}
          className="absolute left-0 top-0 origin-top-left border-0 pointer-events-none transition-opacity duration-500"
          style={{ width: SITE_W, height: SITE_H, transform: `scale(${scale})`, opacity: loaded ? 1 : 0 }}
        />
      )}
    </div>
  )
}

function SlideMedia({ slide }: { slide: ShowcaseSlide }) {
  const { media } = slide
  switch (media.type) {
    case 'reel':
      return <ReplayReel scenes={media.scenes} />
    case 'video':
      return (
        <video src={media.src} poster={media.poster} aria-label={slide.title} autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover" />
      )
    case 'site':
      return <SitePreview src={media.src} title={slide.title} />
  }
}

// The whole preview and the button both go to the slide's page
function SlideLink({ slide, className, tabIndex, children }: { slide: ShowcaseSlide; className?: string; tabIndex?: number; children: ReactNode }) {
  return slide.external ? (
    <a href={slide.href} target="_blank" rel="noopener noreferrer" className={className} tabIndex={tabIndex}>{children}</a>
  ) : (
    <Link href={slide.href} className={className} tabIndex={tabIndex}>{children}</Link>
  )
}

const pad = (n: number) => String(n).padStart(2, '0')

export function ShowcaseCarousel({ label, note, slides, titleBorders }: { label: string; note?: string; slides: ShowcaseSlide[]; titleBorders: boolean }) {
  const [index, setIndex] = useState(0)
  const touchX = useRef<number | null>(null)

  const step = (by: number) => setIndex((i) => (i + by + slides.length) % slides.length)
  const slide = slides[index]

  return (
    <section
      className="border-b border-border"
      aria-roledescription="carousel"
      aria-label={label}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') step(1)
        if (e.key === 'ArrowLeft') step(-1)
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.6, ease }}
      >
        <div className={`flex items-center justify-between gap-4 px-8 ${titleBorders ? 'py-4 border-b border-border' : 'pt-8 pb-4'}`}>
          <div className="flex items-baseline gap-3 min-w-0">
            <p className="text-xs text-muted uppercase tracking-widest truncate">{label}</p>
            {note && <p className="hidden sm:block text-xs text-muted truncate">{note}</p>}
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className="hidden sm:inline text-xs font-mono text-muted tabular-nums">
              {pad(index + 1)} / {pad(slides.length)}
            </span>
            <div className="flex gap-1">
              {[
                { by: -1, Icon: ArrowLeft, name: 'Previous' },
                { by: 1, Icon: ArrowRight, name: 'Next' },
              ].map(({ by, Icon, name }) => (
                <button
                  key={name}
                  onClick={() => step(by)}
                  aria-label={name}
                  className="p-1.5 rounded-full border border-border text-muted hover:text-foreground hover:border-foreground/30 transition-colors"
                >
                  <Icon className="w-3.5 h-3.5" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* The stage: a fixed 16:10 box the previews fill, cross-fading in place */}
        <SlideLink slide={slide} className="block">
          <div
            className="relative w-full overflow-hidden bg-[color-mix(in_srgb,var(--border)_30%,transparent)]"
            style={{ aspectRatio: STAGE }}
            onTouchStart={(e) => { touchX.current = e.touches[0].clientX }}
            onTouchEnd={(e) => {
              if (touchX.current === null) return
              const dx = e.changedTouches[0].clientX - touchX.current
              touchX.current = null
              if (Math.abs(dx) > 50) { e.preventDefault(); step(dx < 0 ? 1 : -1) }
            }}
          >
            <AnimatePresence initial={false}>
              <motion.div
                key={slide.id}
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: FADE, ease }}
                aria-roledescription="slide"
                aria-label={`${index + 1} of ${slides.length}: ${slide.title}`}
              >
                <SlideMedia slide={slide} />
              </motion.div>
            </AnimatePresence>
          </div>
        </SlideLink>

        {/* Every caption sits in the same cell, so the block is as tall as the longest and
            doesn't change height between slides */}
        <div className="grid border-t border-border">
          {slides.map((s, i) => {
            const active = i === index
            const Arrow = s.external ? ArrowUpRight : ArrowRight
            return (
              <div
                key={s.id}
                aria-hidden={!active}
                className={`[grid-area:1/1] flex flex-col sm:flex-row sm:items-start justify-between gap-4 px-8 py-5 transition-opacity duration-300 ${active ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
              >
                <div className="min-w-0 max-w-2xl">
                  <p className="text-xs text-muted uppercase tracking-wide mb-1.5">{s.kicker}</p>
                  <h3 className="text-xl font-medium text-foreground mb-1">{s.title}</h3>
                  <p className="text-sm text-muted">{s.description}</p>
                </div>
                <SlideLink
                  slide={s}
                  tabIndex={active ? undefined : -1}
                  className="group shrink-0 self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border text-sm text-foreground hover:border-accent hover:text-accent transition-colors"
                >
                  {s.cta}
                  <Arrow className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </SlideLink>
              </div>
            )
          })}
        </div>

        {/* Every slide by name: the bar over the one showing */}
        <div role="tablist" aria-label={`${label} slides`} className="grid border-t border-border" style={{ gridTemplateColumns: `repeat(${slides.length}, minmax(0, 1fr))` }}>
          {slides.map((s, i) => (
            <button
              key={s.id}
              role="tab"
              aria-selected={i === index}
              onClick={() => setIndex(i)}
              className={`group relative text-left px-4 sm:px-5 py-4 ${i < slides.length - 1 ? 'border-r border-border' : ''}`}
            >
              <span className={`absolute left-0 right-0 top-0 h-0.5 transition-colors ${i === index ? 'bg-accent' : 'bg-transparent'}`} />
              <span className="block text-xs font-mono text-muted mb-1">{pad(i + 1)}</span>
              <span className={`block text-sm line-clamp-2 transition-colors ${i === index ? 'text-foreground font-medium' : 'text-muted group-hover:text-foreground'}`}>
                {s.tab ?? s.title}
              </span>
            </button>
          ))}
        </div>
      </motion.div>
    </section>
  )
}
