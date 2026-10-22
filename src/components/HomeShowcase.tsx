'use client'

import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { ShowcaseReel, type ShowcaseScene } from '@/components/showcase/ShowcaseReel'
import { HomeWidget } from '@/components/showcase/HomeWidgets'
import { Shader } from '@/components/showcase/ShaderWallWidgets'
import { KindWord } from '@/components/KindWord'
import { useNear, useNoScrollJumps } from '@/components/Visuals'
import { SHOWCASE_SECTIONS, type ShowcaseDetail, type ShowcasePiece, type ShowcaseSection } from '@/content/home-showcase'
import { TESTIMONIALS } from '@/content/testimonials'
import { getProjectById, hrefIsLive } from '@/content/projects'

// The homepage as the Paper frame "website · products hero + 3 details" (?design=showcase).
// Each section shows one piece at a time: what it is (and, for the work, what it did), the piece
// as big as the column, then three details of how it works. The arrows either side of the piece
// move the whole lot on to the next one. Creative tools run as a ¾ track that bleeds off the
// window instead. Click any of them to see it big.

const ease = [0.25, 0.1, 0.25, 1] as const

// Something that can be opened big: a clip or one of Shader Wall's widgets
type Item = ShowcaseDetail & { matte?: string }
const heroItem = (p: ShowcasePiece): Item => ({ title: p.title, scene: p.hero, backdrop: p.backdrop, plain: p.heroPlain, matte: p.matte ? p.tint : undefined })
const itemsOf = (p: ShowcasePiece): Item[] => [heroItem(p), ...p.details]

// A live site at its own size. Shrinking one with a transform (as the reel does) makes Chrome
// draw its frosted glass wrong: Shader Wall's dock got a second, wider pane behind it
function LiveSite({ src }: { src: string }) {
  return <iframe src={src} title="" tabIndex={-1} aria-hidden loading="lazy" className="pointer-events-none absolute inset-0 h-full w-full border-0 bg-white" />
}

// A clip, drawn only while it's near the screen. A track works that out for its slides (they
// sit off to the side, clipped, so they'd never count as near on their own)
function Media({ item, near: given }: { item: Item; near?: boolean }) {
  const [ref, seen] = useNear<HTMLDivElement>()
  const near = given ?? seen
  const scenes = useMemo(() => (item.scene ? [item.scene] : []), [item.scene])
  const clip = item.widget ? <HomeWidget kind={item.widget} />
    : near && item.scene?.site ? <LiveSite src={item.scene.site} />
    : near && scenes.length > 0 && <ShowcaseReel scenes={scenes} captions={false} theme="light" onScreen={given} clear={item.plain || !!item.matte} />
  // On a plain mat of the piece's colour: the clip's own page is cleared, so only the app sits on it
  if (item.matte) return <div ref={ref} className="absolute inset-0" style={{ background: item.matte }}>{clip}</div>
  if (item.backdrop === undefined) return <div ref={ref} className="absolute inset-0">{clip}</div>
  // On a shader: the clip inset like a window on a desktop
  return (
    <div ref={ref} className="absolute inset-0">
      <Shader p={{ speed: 0.35, swirl: 0.5, grain: 0.35, hue: 0, palette: item.backdrop }} />
      <div className="absolute inset-[6%] overflow-hidden rounded-xl shadow-[0_30px_80px_-20px_rgba(0,0,0,0.55)]">{clip}</div>
    </div>
  )
}

// The 16:10 window a clip plays in, and the button that opens it big
function Frame({ item, onOpen, className = '' }: { item: Item; onOpen: () => void; className?: string }) {
  return (
    <div className={`relative aspect-[16/10] w-full overflow-hidden bg-[#fafafa] ${className}`}>
      <Media item={item} />
      {/* Over the clip, so a replay or a site can't swallow the click. A widget stays hands-on */}
      {!item.widget && <button onClick={onOpen} aria-label={`Open ${item.title}`} className="absolute inset-0 cursor-zoom-in" />}
    </div>
  )
}

const ARROW = 'flex h-11 w-11 items-center justify-center rounded-full border border-border bg-background text-foreground shadow-[0_6px_20px_-6px_rgba(0,0,0,0.25)] transition-[opacity,transform] hover:scale-105'

// Either side of the piece, halfway down it. The one with nowhere to go is hidden
function SideArrows({ at, of, onStep, label }: { at: number; of: number; onStep: (by: number) => void; label: string }) {
  if (of < 2) return null
  return (
    <>
      <button onClick={() => onStep(-1)} aria-label={`Previous ${label}`} className={`${ARROW} absolute left-3 top-1/2 z-10 -translate-y-1/2 md:-left-[22px] ${at === 0 ? 'pointer-events-none opacity-0' : ''}`}><ChevronLeft className="h-4 w-4" /></button>
      <button onClick={() => onStep(1)} aria-label={`Next ${label}`} className={`${ARROW} absolute right-3 top-1/2 z-10 -translate-y-1/2 md:-right-[22px] ${at === of - 1 ? 'pointer-events-none opacity-0' : ''}`}><ChevronRight className="h-4 w-4" /></button>
    </>
  )
}

// Where you are in the section, quietly, under the piece
function Dots({ at, of, onGo, names }: { at: number; of: number; onGo: (i: number) => void; names: string[] }) {
  if (of < 2) return null
  return (
    <div className="flex justify-center gap-2">
      {Array.from({ length: of }, (_, i) => (
        <button key={i} onClick={() => onGo(i)} aria-label={names[i]} aria-current={i === at} className="flex h-4 items-center">
          <span className={`block h-1.5 rounded-full transition-all duration-300 ${i === at ? 'w-5 bg-foreground' : 'w-1.5 bg-border hover:bg-muted'}`} />
        </button>
      ))}
    </div>
  )
}

function Detail({ d, tint, onOpen }: { d: ShowcaseDetail; tint: string; onOpen: () => void }) {
  return (
    // A widget is hands-on, so its card opens from anywhere but its controls
    <figure
      className={`flex flex-col gap-3.5 ${d.widget ? 'cursor-zoom-in' : ''}`}
      onClick={d.widget ? (e) => { if (!(e.target as HTMLElement).closest('input, button')) onOpen() } : undefined}
    >
      <div className="rounded-2xl p-6 md:p-8" style={{ background: tint }}>
        <Frame item={d} onOpen={onOpen} className="rounded-xl shadow-[0_10px_30px_-10px_rgba(0,0,0,0.18)]" />
      </div>
      <figcaption className="text-[15px] font-medium leading-5 text-foreground">
        {d.title}

      </figcaption>
    </figure>
  )
}

// A case study page that's off (see pageIsLive) gets no link; an essay is called one
function Links({ piece }: { piece: ShowcasePiece }) {
  const cls = 'text-sm leading-[18px] text-muted transition-colors hover:text-foreground'
  const story = piece.caseStudy && hrefIsLive(piece.caseStudy) ? piece.caseStudy : null
  const essay = story && getProjectById(story.replace('/projects/', ''))?.category === 'Article'
  if (!story && !piece.more && !piece.visit) return null
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-2">
      {story && <Link href={story} className={cls}>{essay ? 'Read the essay' : 'Read case study'}</Link>}
      {piece.more && <Link href={piece.more.href} className={cls}>{piece.more.label}</Link>}
      {piece.visit && <a href={piece.visit.href} target="_blank" rel="noopener noreferrer" className={cls}>{piece.visit.label} ↗</a>}
    </div>
  )
}

// What it is, then what it did (from the case study) as small bordered cards side by side, then the links
function About({ piece }: { piece: ShowcasePiece }) {
  return (
    <div className="flex max-w-3xl flex-col gap-2">
      <h3 className="text-[24px] font-medium leading-[30px] tracking-[-0.01em] text-foreground text-balance">{piece.title}</h3>
      <p className="text-base leading-[26px] text-muted">{piece.summary}</p>
      {piece.impact && (
        <dl className="flex flex-wrap gap-3 py-2">
          {piece.impact.map((m) => (
            <div key={m.label} className="flex flex-col justify-center gap-0.5 rounded-xl border border-border bg-background px-4 py-3">
              {m.value && <dt className="text-[20px] font-medium leading-[26px] tracking-[-0.01em] text-foreground tabular-nums">{m.value}</dt>}
              <dd className={m.value ? 'text-sm leading-5 text-muted' : 'text-[15px] font-medium leading-[26px] text-foreground'}>{m.label}</dd>
            </div>
          ))}
        </dl>
      )}
      <Links piece={piece} />
    </div>
  )
}

// One item big and on its own, the rest of the piece a step either side
function Lightbox({ items, start, onClose }: { items: Item[]; start: number; onClose: () => void }) {
  const [i, setI] = useState(start)
  const step = useCallback((by: number) => setI((n) => (n + by + items.length) % items.length), [items.length])
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') step(1)
      if (e.key === 'ArrowLeft') step(-1)
    }
    window.addEventListener('keydown', key)
    return () => window.removeEventListener('keydown', key)
  }, [onClose, step])
  const item = items[i]
  const many = items.length > 1
  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(9,9,11,0.82)] p-6 backdrop-blur-sm"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
      onClick={onClose}
      role="dialog" aria-modal aria-label={item.title}
    >
      <motion.div
        className="flex flex-col gap-4"
        style={{ width: 'min(92vw, calc((100vh - 140px) * 1.6))' }}
        initial={{ scale: 0.96, y: 12 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.98 }} transition={{ duration: 0.25, ease }}
        onClick={(e) => e.stopPropagation()}
      >
        <div key={i} className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-[#fafafa] shadow-2xl">
          <Media item={item} />
        </div>
        <div className="flex items-center justify-between gap-6 text-white">
          <p className="text-base font-medium">{item.title}</p>
          {many && <span className="text-sm text-white/60 tabular-nums">{i + 1} / {items.length}</span>}
        </div>
      </motion.div>
      {many && (
        <>
          <button onClick={(e) => { e.stopPropagation(); step(-1) }} aria-label="Previous" className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20"><ChevronLeft className="h-5 w-5" /></button>
          <button onClick={(e) => { e.stopPropagation(); step(1) }} aria-label="Next" className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20"><ChevronRight className="h-5 w-5" /></button>
        </>
      )}
      <button onClick={onClose} aria-label="Close" className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"><X className="h-5 w-5" /></button>
    </motion.div>
  )
}

type Opener = (items: Item[], start: number) => void

function Heading({ section }: { section: ShowcaseSection }) {
  return <h2 id={`home-${section.id}`} className="text-[36px] font-medium leading-[40px] tracking-[-0.02em] text-foreground">{section.title}</h2>
}

// Next comes in from the right, previous from the left
// Text and captions move a little and fade, in the same direction
const NUDGE = {
  enter: (dir: number) => ({ opacity: 0, x: dir * 28 }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: dir * -28 }),
}
const SLIDE_T = { duration: 0.55, ease: [0.32, 0.72, 0, 1] as const }

// Swaps its child for the next one in place: both share one grid cell while they cross, so
// nothing around them jumps
function Swap({ k, dir, delay = 0, children }: { k: string; dir: number; delay?: number; children: React.ReactNode }) {
  return (
    <div className="grid">
      <AnimatePresence initial={false} custom={dir}>
        <motion.div key={k} custom={dir} variants={NUDGE} initial="enter" animate="center" exit="exit" transition={{ ...SLIDE_T, duration: 0.4, delay }} className="col-start-1 row-start-1">
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

// A window that stays where it is, with every piece's clip side by side in a track behind it.
// Moving on slides the track; the pieces either side are already built, so the next one arrives
// ready instead of loading in as it slides
// chrome: the window's edge (a shadow or a hairline), dropped while a plain item is showing
function Track({ items, at, onOpen, delay = 0, chrome = '' }: { items: (Item | undefined)[]; at: number; onOpen: () => void; delay?: number; chrome?: string }) {
  const [ref, near] = useNear<HTMLDivElement>()
  const plain = items[at]?.plain
  return (
    <div ref={ref} className={`relative aspect-[16/10] w-full overflow-hidden rounded-xl transition-shadow duration-500 ${plain ? '' : chrome}`}>
      <motion.div className="absolute inset-0 flex" initial={false} animate={{ x: `${-at * 100}%` }} transition={{ ...SLIDE_T, delay }}>
        {items.map((item, i) => (
          // Each slide clipped a pixel in at the sides: the track's edge falls between pixels, and the
          // neighbouring slide showed through it as a hairline beside a clip on its card's colour
          <div key={i} className={`relative h-full w-full shrink-0 ${item?.plain ? '' : 'bg-[#fafafa]'}`} style={{ clipPath: 'inset(0 1px)' }} aria-hidden={i !== at}>
            {item && Math.abs(i - at) <= 1 && (
              <>
                <Media item={item} near={near} />
                {!item.widget && i === at && <button onClick={onOpen} aria-label={`Open ${item.title}`} className="absolute inset-0 cursor-zoom-in" />}
              </>
            )}
          </div>
        ))}
      </motion.div>
    </div>
  )
}

// The pieces by name, so it's clear the arrows move to another product or case study, not to
// more of the same one
function Tabs({ section, at, onGo }: { section: ShowcaseSection; at: number; onGo: (i: number) => void }) {
  if (section.pieces.length < 2) return null
  return (
    <div role="tablist" aria-label={section.title} className="flex flex-wrap gap-x-8 gap-y-2 border-b border-border">
      {section.pieces.map((p, i) => (
        <button
          key={p.id}
          role="tab"
          aria-selected={i === at}
          onClick={() => onGo(i)}
          className={`-mb-px border-b-2 pb-3 text-[15px] transition-colors ${i === at ? 'border-foreground text-foreground' : 'border-transparent text-muted hover:text-foreground'}`}
        >
          {p.tab ?? p.title}
        </button>
      ))}
    </div>
  )
}

// One piece at a time. The carousel itself (the frame, the arrows, the dots, the cards) stays
// put; the piece, its words and its details slide through it, and its colour fades across
function FeatureSection({ section, open }: { section: ShowcaseSection; open: Opener }) {
  const [[at, dir], setPage] = useState<[number, number]>([0, 1])
  const n = section.pieces.length
  const piece = section.pieces[at]
  const go = (i: number) => setPage(([a]) => [Math.min(n - 1, Math.max(0, i)), i >= a ? 1 : -1])
  const step = (by: number) => go(at + by)
  const items = itemsOf(piece)
  const slots = Math.max(...section.pieces.map((p) => p.details.length))
  const cols = slots === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'
  const framed = section.pieces.some((p) => p.framed)
  const tint = { background: piece.tint, transition: 'background-color .5s ease' }
  const heroes = section.pieces.map(heroItem)
  return (
    <section aria-labelledby={`home-${section.id}`} className="flex flex-col gap-8 py-24">
      <div className="flex flex-col gap-6">
        <Heading section={section} />
        <Tabs section={section} at={at} onGo={go} />
      </div>
      <Swap k={piece.id} dir={dir}><About piece={piece} /></Swap>
      <div className="flex flex-col gap-5">
        <div className="relative">
          {framed ? (
            <div className="rounded-[20px] p-6 md:p-12" style={tint}>
              <Track items={heroes} at={at} onOpen={() => open(items, 0)} chrome="shadow-[0_10px_30px_-10px_rgba(0,0,0,0.18)]" />
            </div>
          ) : (
            <Track items={heroes} at={at} onOpen={() => open(items, 0)} chrome="shadow-[0_0_0_1px_var(--border)]" />
          )}
          <SideArrows at={at} of={n} onStep={step} label={section.id === 'products' ? 'product' : 'piece'} />
        </div>
      </div>
      {slots > 0 && (
        <div className={`grid grid-cols-1 gap-8 ${cols}`}>
          {Array.from({ length: slots }, (_, k) => {
            const d = piece.details[k]
            const delay = 0.04 * (k + 1)
            return (
              // A piece with fewer details leaves its last card empty, faded back
              <figure
                key={k}
                className={`flex flex-col gap-3.5 transition-opacity duration-500 ${d ? '' : 'pointer-events-none opacity-0'} ${d?.widget ? 'cursor-zoom-in' : ''}`}
                onClick={d?.widget ? (e) => { if (!(e.target as HTMLElement).closest('input, button')) open(items, k + 1) } : undefined}
              >
                <div className="rounded-2xl p-6 md:p-8" style={tint}>
                  <Track items={section.pieces.map((p) => p.details[k])} at={at} delay={delay} onOpen={() => open(items, k + 1)} chrome="shadow-[0_10px_30px_-10px_rgba(0,0,0,0.18)]" />
                </div>
                <Swap k={`${piece.id}-${k}`} dir={dir} delay={delay}>
                  <figcaption className="text-[15px] font-medium leading-5 text-foreground">{d?.title ?? '\u00a0'}</figcaption>
                </Swap>
              </figure>
            )
          })}
        </div>
      )}
      {/* Under the piece and its details: the dots move all of them, so they close the group */}
      <Dots at={at} of={n} onGo={go} names={section.pieces.map((p) => p.title)} />
    </section>
  )
}

// The ¾ track: each piece most of the column wide, the next one showing at the window's edge,
// then every piece's details together underneath
function BleedSection({ section, open }: { section: ShowcaseSection; open: Opener }) {
  const row = useRef<HTMLDivElement>(null)
  const [at, setAt] = useState(0)
  const n = section.pieces.length
  const stride = () => {
    const slides = row.current?.querySelectorAll<HTMLElement>('[data-slide]')
    return slides && slides.length > 1 ? slides[1].offsetLeft - slides[0].offsetLeft : 1
  }
  const go = (i: number) => { setAt(i); row.current?.scrollTo({ left: i * stride(), behavior: 'smooth' }) }
  const heroes = section.pieces.map(heroItem)
  const details = section.pieces.flatMap((p) => p.details.map((d) => ({ d, tint: p.tint })))
  const detailItems = details.map(({ d }) => d)
  const inset = 'calc((100vw - min(1232px, 100vw - 48px)) / 2)' // lined up with the page's column
  const slideW = 'min(960px, 80vw)'
  return (
    <section aria-labelledby={`home-${section.id}`} className="flex flex-col gap-8 py-24">
      <Heading section={section} />
      <div className="flex flex-col gap-5">
        <div className="relative" style={{ width: '100vw', marginLeft: 'calc(50% - 50vw)' }}>
          <div
            ref={row}
            onScroll={() => setAt(Math.min(n - 1, Math.round((row.current?.scrollLeft ?? 0) / stride())))}
            className="scrollbar-hide flex snap-x snap-mandatory gap-8 overflow-x-auto"
            style={{ paddingInline: inset, scrollPaddingInline: inset }}
          >
            {section.pieces.map((p, i) => (
              <article key={p.id} data-slide className="flex shrink-0 snap-start flex-col gap-6" style={{ width: slideW }}>
                <Frame item={heroes[i]} onOpen={() => open(heroes, i)} className="rounded-xl shadow-[0_0_0_1px_var(--border)]" />
                <div className="flex max-w-[720px] flex-col gap-2">
                  <h3 className="text-[24px] font-medium leading-[30px] tracking-[-0.01em] text-foreground">{p.title}</h3>
                  <p className="text-base leading-[26px] text-muted">{p.summary}</p>
                  <Links piece={p} />
                </div>
              </article>
            ))}
            <div className="shrink-0" style={{ width: `calc(100vw - ${slideW} - 2 * ${inset} - 32px)` }} aria-hidden />
          </div>
          {/* Halfway down the pieces: the left one by the column's edge, the right one by the window's */}
          <div className="pointer-events-none absolute inset-x-0 top-0" style={{ height: `calc(${slideW} / 1.6)` }}>
            <div className="pointer-events-auto">
              <button onClick={() => go(Math.max(0, at - 1))} aria-label="Previous piece" className={`${ARROW} absolute top-1/2 -translate-y-1/2 ${at === 0 ? 'pointer-events-none opacity-0' : ''}`} style={{ left: `calc(${inset} - 22px)` }}><ChevronLeft className="h-4 w-4" /></button>
              <button onClick={() => go(Math.min(n - 1, at + 1))} aria-label="Next piece" className={`${ARROW} absolute right-6 top-1/2 -translate-y-1/2 ${at === n - 1 ? 'pointer-events-none opacity-0' : ''}`}><ChevronRight className="h-4 w-4" /></button>
            </div>
          </div>
        </div>
        <Dots at={at} of={n} onGo={go} names={section.pieces.map((p) => p.title)} />
      </div>
      {details.length > 0 && (
        <div className="flex flex-col gap-4 pt-6">
          <p className="text-sm text-muted">Up close</p>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {details.map(({ d, tint }, k) => <Detail key={d.title} d={d} tint={tint} onOpen={() => open(detailItems, k)} />)}
          </div>
        </div>
      )}
    </section>
  )
}

export function HomeShowcase() {
  useNoScrollJumps()
  const [lightbox, setLightbox] = useState<{ items: Item[]; start: number } | null>(null)
  const open: Opener = useCallback((items, start) => setLightbox({ items, start }), [])
  const close = useCallback(() => setLightbox(null), [])
  return (
    <div className="flex flex-col px-6">
      {SHOWCASE_SECTIONS.map((section) => {
        const quote = TESTIMONIALS.find((t) => t.name === section.quote)
        return (
          <Fragment key={section.id}>
            {section.layout === 'bleed' ? <BleedSection section={section} open={open} /> : <FeatureSection section={section} open={open} />}
            {/* Centred on the page, read from the left */}
            {quote && (
              <div className="flex justify-center py-24">
                <div className="w-full max-w-[900px]"><KindWord t={quote} plain /></div>
              </div>
            )}
          </Fragment>
        )
      })}

      <section aria-labelledby="home-onward" className="flex flex-col gap-6 py-24">
        <h2 id="home-onward" className="text-[36px] font-medium leading-[40px] tracking-[-0.02em] text-foreground">Keep going</h2>
        <div className="flex flex-wrap gap-x-8 gap-y-3 text-base">
          <Link href="/essays" className="text-foreground transition-colors hover:text-accent">Read the essays →</Link>
          <Link href="/cv" className="text-foreground transition-colors hover:text-accent">See the CV →</Link>
          <Link href="/contact" className="text-foreground transition-colors hover:text-accent">Get in touch →</Link>
        </div>
      </section>

      <AnimatePresence>{lightbox && <Lightbox key="lightbox" items={lightbox.items} start={lightbox.start} onClose={close} />}</AnimatePresence>
    </div>
  )
}
