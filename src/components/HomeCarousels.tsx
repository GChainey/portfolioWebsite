'use client'

import { Fragment, useCallback, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { ShowcaseReel } from '@/components/showcase/ShowcaseReel'
import { KindWord } from '@/components/KindWord'
import { useNear, useNoScrollJumps } from '@/components/Visuals'
import { useTheme } from '@/context/ThemeContext'
import { HOME_SECTIONS, type HomeClip, type HomePiece } from '@/content/home-sections'
import { TESTIMONIALS } from '@/content/testimonials'

// The horizontal homepage, a screen per section: each section is one carousel of every clip in
// it, and the title, line and links above it follow whichever piece is showing. Three fits:
//   full  - a slide is the whole window, edge to edge, the piece centred in it
//   bleed - a slide is a panel the content's width, the next one showing at the window's edge
//   cards - a few to a screen on desktop, each with its own title, like components on a sheet

export type CarouselFit = 'full' | 'bleed' | 'cards'

interface Slide { piece: HomePiece; clip: HomeClip; n: number; of: number }

function ClipFrame({ clip, theme, className = '' }: { clip: HomeClip; theme: 'light' | 'dark'; className?: string }) {
  const [ref, near] = useNear<HTMLDivElement>()
  const scenes = useMemo(() => [clip.scene], [clip])
  return (
    <div ref={ref} className={`relative aspect-[16/10] w-full overflow-hidden rounded-xl shadow-[0_10px_30px_-10px_rgba(0,0,0,0.18)] ${className}`} style={{ background: theme === 'dark' ? '#09090b' : '#fafafa' }}>
      {near && <ShowcaseReel scenes={scenes} captions={false} theme={theme} />}
    </div>
  )
}

function Links({ piece }: { piece: HomePiece }) {
  const cls = 'text-sm leading-[18px] text-muted transition-colors hover:text-foreground'
  return (
    <div className="flex flex-wrap gap-2">
      {piece.caseStudy && <Link href={piece.caseStudy} className={cls}>Read case study</Link>}
      {piece.visit && <a href={piece.visit.href} target="_blank" rel="noopener noreferrer" className={cls}>{piece.visit.label} ↗</a>}
    </div>
  )
}

const ARROW = 'flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-foreground shadow-md transition-opacity'

function SectionCarousel({ slides, fit, theme }: { slides: Slide[]; fit: CarouselFit; theme: 'light' | 'dark' }) {
  const row = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)
  const [atEnd, setAtEnd] = useState(false)

  const stride = () => {
    const el = row.current
    const first = el?.querySelector<HTMLElement>('[data-slide]')
    if (!el || !first) return 1
    const second = el.querySelectorAll<HTMLElement>('[data-slide]')[1]
    return second ? second.offsetLeft - first.offsetLeft : first.offsetWidth
  }
  const onScroll = useCallback(() => {
    const el = row.current
    if (!el) return
    setActive(Math.min(slides.length - 1, Math.round(el.scrollLeft / stride())))
    setAtEnd(el.scrollLeft + el.clientWidth > el.scrollWidth - 8)
  }, [slides.length])
  const go = (i: number) => row.current?.scrollTo({ left: i * stride(), behavior: 'smooth' })

  const now = slides[active]
  const single = slides.length === 1
  const lastReached = fit === 'cards' ? atEnd : active === slides.length - 1

  // The piece showing: shared above the carousel in full and bleed; each card carries its own
  const header = fit !== 'cards' && (
    <div className="flex min-h-[116px] items-end justify-between gap-8">
      <div className="flex max-w-3xl flex-col gap-2">
        <h3 key={now.piece.id} className="animate-in fade-in text-[24px] font-medium leading-[30px] tracking-[-0.01em] text-foreground text-balance duration-300">{now.piece.title}</h3>
        <p className="text-base leading-[26px] text-muted">{now.piece.summary}</p>
        <Links piece={now.piece} />
      </div>
    </div>
  )

  const controls = !single && (
    <div className="flex items-center justify-between gap-6">
      <p className="text-sm leading-[18px] text-muted">
        {/* A case study's clip and where it sits in it; a one-clip piece's caption would repeat its title */}
        {fit !== 'cards' && now.of > 1 && <>{now.clip.caption}<span className="tabular-nums"> · {now.n} of {now.of}</span></>}
      </p>
      <div className="flex shrink-0 items-center gap-4">
        <div className="flex gap-1.5" aria-hidden>
          {slides.map((s, i) => (
            <button key={i} tabIndex={-1} onClick={() => go(i)} className={`h-1.5 rounded-full transition-all ${i === active ? 'w-6 bg-foreground' : 'w-1.5 bg-border hover:bg-muted'}`} />
          ))}
        </div>
        <div className="flex gap-2">
          <button onClick={() => go(Math.max(0, active - 1))} aria-label="Previous" disabled={active === 0} className={`${ARROW} disabled:opacity-30`}><ChevronLeft className="h-4 w-4" /></button>
          <button onClick={() => go(Math.min(slides.length - 1, active + 1))} aria-label="Next" disabled={lastReached} className={`${ARROW} disabled:opacity-30`}><ChevronRight className="h-4 w-4" /></button>
        </div>
      </div>
    </div>
  )

  if (fit === 'cards') {
    return (
      <div className="flex flex-col gap-8">
        <div ref={row} onScroll={onScroll} className="scrollbar-hide flex snap-x snap-mandatory gap-8 overflow-x-auto">
          {slides.map((s, i) => (
            <article key={i} data-slide className="flex w-[calc((100%-64px)/3)] min-w-[300px] shrink-0 snap-start flex-col gap-4">
              <ClipFrame clip={s.clip} theme={theme} />
              <div className="flex flex-col gap-1.5">
                <h3 className="text-base font-medium leading-[22px] text-foreground">{s.of > 1 ? s.clip.caption : s.piece.title}</h3>
                <p className="line-clamp-2 text-sm leading-[20px] text-muted">{s.of > 1 ? s.piece.title : s.piece.summary}</p>
                <Links piece={s.piece} />
              </div>
            </article>
          ))}
        </div>
        {controls}
      </div>
    )
  }

  // full and bleed run out of the page's column to the window's edges, sized so the section
  // (title, the piece's text, the slide, the controls) fits in one screen
  const full = fit === 'full'
  // The piece's height; each slide is a panel 64px taller with the piece centred in it. Full: the
  // panel is the window's width. Bleed: the content's width, lined up with the text above, the
  // next panel showing at the window's edge
  const SLIDE_H = 'max(360px, calc(100vh - 520px))'
  const panelW = full ? '100vw' : 'min(1232px, 88vw)'
  const inset = full ? '0px' : `calc((100vw - ${panelW}) / 2)`
  return (
    <div className="flex flex-col gap-6">
      {header}
      <div ref={row} onScroll={onScroll} className={`scrollbar-hide flex snap-x snap-mandatory overflow-x-auto ${full ? '' : 'gap-6'}`} style={{ width: '100vw', marginLeft: 'calc(50% - 50vw)', paddingInline: inset, scrollPaddingInline: inset }}>
        {slides.map((s, i) => (
          <div key={i} data-slide className={`flex shrink-0 snap-start items-center justify-center bg-secondary ${full ? '' : 'rounded-2xl'}`} style={{ width: panelW, height: `calc(${SLIDE_H} + 64px)` }}>
            <div style={{ height: SLIDE_H, aspectRatio: '16 / 10', maxWidth: 'calc(100% - 64px)' }}><ClipFrame clip={s.clip} theme={theme} /></div>
          </div>
        ))}
      </div>
      {controls}
    </div>
  )
}

export function HomeCarousels({ fit }: { fit: CarouselFit }) {
  const { resolvedMode } = useTheme()
  const theme = resolvedMode === 'dark' ? 'dark' : 'light'
  useNoScrollJumps()

  return (
    <div className="flex flex-col px-6">
      {HOME_SECTIONS.map((section) => {
        const slides: Slide[] = section.pieces.flatMap((piece) => piece.clips.map((clip, i) => ({ piece, clip, n: i + 1, of: piece.clips.length })))
        const quote = TESTIMONIALS.find((t) => t.name === section.quote)
        return (
          <Fragment key={section.id}>
            {/* A screen to itself */}
            <section aria-labelledby={`home-${section.id}`} className="flex min-h-[calc(100vh-56px)] flex-col justify-center gap-8 py-16">
              <h2 id={`home-${section.id}`} className="text-[36px] font-medium leading-[40px] tracking-[-0.02em] text-foreground">{section.title}</h2>
              <SectionCarousel slides={slides} fit={fit} theme={theme} />
            </section>
            {quote && (
              <div className="flex min-h-[70vh] items-center py-24">
                <KindWord t={quote} plain />
              </div>
            )}
          </Fragment>
        )
      })}

      <section aria-labelledby="home-onward" className="flex min-h-[60vh] flex-col justify-center gap-6 py-24">
        <h2 id="home-onward" className="text-[36px] font-medium leading-[40px] tracking-[-0.02em] text-foreground">Keep going</h2>
        <div className="flex flex-wrap gap-x-8 gap-y-3 text-base">
          <Link href="/essays" className="text-foreground transition-colors hover:text-accent">Read the essays →</Link>
          <Link href="/cv" className="text-foreground transition-colors hover:text-accent">See the CV →</Link>
          <Link href="/contact" className="text-foreground transition-colors hover:text-accent">Get in touch →</Link>
        </div>
      </section>
    </div>
  )
}
