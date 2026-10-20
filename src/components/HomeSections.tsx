'use client'

import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { ShowcaseReel } from '@/components/showcase/ShowcaseReel'
import { KindWord } from '@/components/KindWord'
import { useNear, useNoScrollJumps } from '@/components/Visuals'
import { useTheme } from '@/context/ThemeContext'
import { HOME_SECTIONS, type HomeClip, type HomePiece } from '@/content/home-sections'
import { TESTIMONIALS } from '@/content/testimonials'

// The homepage from the Paper frames "website vertical scroll all" and "website section
// horizontal scroll": sections of pieces, a colleague's words between sections, then where to go
// next. A piece with several clips runs them down the page (vertical) or sideways in a track you
// can scroll or step through (horizontal).

type Layout = 'vertical' | 'horizontal'

// One clip, playing once it's near the screen
function ClipFrame({ clip, theme }: { clip: HomeClip; theme: 'light' | 'dark' }) {
  const [ref, near] = useNear<HTMLDivElement>()
  const scenes = useMemo(() => [clip.scene], [clip])
  return (
    <div ref={ref} className="relative aspect-[16/10] w-full overflow-hidden rounded-xl shadow-[0_10px_30px_-10px_rgba(0,0,0,0.18)]" style={{ background: theme === 'dark' ? '#09090b' : '#fafafa' }}>
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

// The clips in a row that scrolls sideways: the first on the left, the next peeking in from the
// right. Arrows on the frames' edges step one at a time; a trackpad or shift-wheel scrolls freely.
function Track({ clips, theme }: { clips: HomeClip[]; theme: 'light' | 'dark' }) {
  const row = useRef<HTMLDivElement>(null)
  const [edge, setEdge] = useState({ start: true, end: false })

  const measure = useCallback(() => {
    const el = row.current
    if (!el) return
    setEdge({ start: el.scrollLeft < 8, end: el.scrollLeft + el.clientWidth > el.scrollWidth - 8 })
  }, [])
  useEffect(() => { measure() }, [measure])

  const step = (by: number) => {
    const el = row.current
    const slide = el?.firstElementChild as HTMLElement | null
    if (el && slide) el.scrollBy({ left: by * (slide.offsetWidth + 16), behavior: 'smooth' })
  }

  const arrow = 'absolute top-[calc(min(760px,80vw)*0.3125-20px)] z-10 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-foreground shadow-md transition-opacity'
  return (
    <div className="relative">
      <div ref={row} onScroll={measure} className="scrollbar-hide flex snap-x snap-mandatory gap-4 overflow-x-auto">
        {clips.map((c) => (
          <figure key={c.caption} className="w-[min(760px,80vw)] shrink-0 snap-start">
            <ClipFrame clip={c} theme={theme} />
            <figcaption className="mt-3 text-sm leading-[18px] text-muted">{c.caption}</figcaption>
          </figure>
        ))}
        {/* Lets the last clip scroll all the way to the left edge */}
        <div className="w-[calc(100%-min(760px,80vw)-16px)] shrink-0" aria-hidden />
      </div>
      <button onClick={() => step(-1)} aria-label="Previous" className={`${arrow} left-3 ${edge.start ? 'pointer-events-none opacity-0' : 'opacity-100'}`}><ChevronLeft className="h-4 w-4" /></button>
      <button onClick={() => step(1)} aria-label="Next" className={`${arrow} right-3 ${edge.end ? 'pointer-events-none opacity-0' : 'opacity-100'}`}><ChevronRight className="h-4 w-4" /></button>
    </div>
  )
}

function Piece({ piece, layout, theme }: { piece: HomePiece; layout: Layout; theme: 'light' | 'dark' }) {
  const single = piece.clips.length === 1
  return (
    <article className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <h3 className="text-[24px] font-medium leading-[30px] tracking-[-0.01em] text-foreground text-balance">{piece.title}</h3>
        <p className="text-base leading-[26px] text-muted">{piece.summary}</p>
        <Links piece={piece} />
      </div>
      {single ? (
        <ClipFrame clip={piece.clips[0]} theme={theme} />
      ) : layout === 'horizontal' ? (
        <Track clips={piece.clips} theme={theme} />
      ) : (
        <div className="flex flex-col gap-10">
          {piece.clips.map((c) => (
            <figure key={c.caption}>
              <ClipFrame clip={c} theme={theme} />
              <figcaption className="mt-3 text-sm leading-[18px] text-muted">{c.caption}</figcaption>
            </figure>
          ))}
        </div>
      )}
    </article>
  )
}

export function HomeSections({ layout }: { layout: Layout }) {
  const { resolvedMode } = useTheme()
  const theme = resolvedMode === 'dark' ? 'dark' : 'light'
  useNoScrollJumps()

  return (
    <div className="flex flex-col gap-24 px-6 pt-16 pb-24">
      {HOME_SECTIONS.map((section) => {
        const quote = TESTIMONIALS.find((t) => t.name === section.quote)
        return (
          <Fragment key={section.id}>
            <section aria-labelledby={`home-${section.id}`} className="flex flex-col gap-12">
              <h2 id={`home-${section.id}`} className="text-[36px] font-medium leading-[40px] tracking-[-0.02em] text-foreground">{section.title}</h2>
              <div className="flex flex-col gap-16">
                {section.pieces.map((p) => <Piece key={p.id} piece={p} layout={layout} theme={theme} />)}
              </div>
            </section>
            {quote && <KindWord t={quote} plain />}
          </Fragment>
        )
      })}

      {/* Where to go next */}
      <section aria-labelledby="home-onward" className="flex flex-col gap-6">
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
