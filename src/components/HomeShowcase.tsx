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
import { ImpactSentence } from '@/components/ImpactSentence'

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
//
// Given its window size and a region, it's laid out at that size and zoomed so the region fills
// the frame: a close-up of one part of a live page. Given keys (and on this site), it presses them
// in turn, so a game's menu steps through itself
// A live site plays silently: its audio is held suspended. Wallbounce starts its music and
// sound on the first key, and the keys pressed for it here count
function silence(win: Window & typeof globalThis) {
  const Real = win.AudioContext as typeof AudioContext & { quiet?: true }
  if (!Real || Real.quiet) return
  class Quiet extends Real {
    static quiet = true as const
    constructor(options?: AudioContextOptions) { super(options); void this.suspend() }
    resume() { return Promise.resolve() }
  }
  win.AudioContext = Quiet
}

function LiveSite({ scene }: { scene: ShowcaseScene }) {
  const box = useRef<HTMLDivElement>(null)
  const frame = useRef<HTMLIFrameElement>(null)
  const [k, setK] = useState(0)
  const { siteSize: size, region, keys } = scene
  useEffect(() => {
    const el = box.current
    if (!el || !size) return
    const fit = () => setK(el.clientWidth / (region?.width ?? size.width))
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(el)
    return () => ro.disconnect()
  }, [size, region])
  useEffect(() => {
    if (!keys) return
    let i = 0
    const id = setInterval(() => {
      const win = frame.current?.contentWindow as (Window & typeof globalThis) | null
      if (!win) return
      const code = keys.codes[i++ % keys.codes.length]
      try {
        silence(win)
        win.dispatchEvent(new win.KeyboardEvent('keydown', { code, key: code, bubbles: true }))
        setTimeout(() => win.dispatchEvent(new win.KeyboardEvent('keyup', { code, key: code, bubbles: true })), 90)
      } catch { /* another origin: it just sits */ }
    }, keys.every)
    return () => clearInterval(id)
  }, [keys])
  const iframe = <iframe ref={frame} src={scene.site} onLoad={() => { try { silence(frame.current!.contentWindow as Window & typeof globalThis) } catch { /* another origin */ } }} title="" tabIndex={-1} aria-hidden loading="lazy" className={`pointer-events-none border-0 bg-white ${size ? 'absolute left-0 top-0 origin-top-left' : 'absolute inset-0 h-full w-full'}`} style={size ? { width: size.width, height: size.height, transform: `scale(${k}) translate(${-(region?.x ?? 0)}px, ${-(region?.y ?? 0)}px)` } : undefined} />
  return <div ref={box} className="absolute inset-0 overflow-hidden">{iframe}</div>
}

// A clip, drawn only while it's near the screen. A track works that out for its slides (they
// sit off to the side, clipped, so they'd never count as near on their own)
function Media({ item, near: given, playing = true }: { item: Item; near?: boolean; playing?: boolean }) {
  const [ref, seen] = useNear<HTMLDivElement>()
  const near = given ?? seen
  const scenes = useMemo(() => (item.scene ? [item.scene] : []), [item.scene])
  const clip = item.widget ? <HomeWidget kind={item.widget} />
    : near && item.scene?.site ? (playing ? <LiveSite scene={item.scene} /> : null)
    : near && scenes.length > 0 && <ShowcaseReel scenes={scenes} captions={false} theme="light" playing={playing} still onScreen={given} clear={item.plain || !!item.matte} />
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
// playing: off for a card that isn't in focus, so only the one in front moves
function Frame({ item, onOpen, className = '', playing = true }: { item: Item; onOpen: () => void; className?: string; playing?: boolean }) {
  return (
    <div className={`relative aspect-[16/10] w-full overflow-hidden bg-[#fafafa] ${className}`}>
      <Media item={item} playing={playing} />
      {/* Over the clip, so a replay or a site can't swallow the click. A widget stays hands-on */}
      {!item.widget && <button onClick={onOpen} aria-label={`Open ${item.title}`} className="absolute inset-0 cursor-zoom-in" />}
    </div>
  )
}


// Where you are in the section, quietly, under the pieces on the left edge
function Dots({ at, of, onGo, names }: { at: number; of: number; onGo: (i: number) => void; names: string[] }) {
  if (of < 2) return null
  return (
    <div className="flex gap-2">
      {Array.from({ length: of }, (_, i) => (
        <button key={i} onClick={() => onGo(i)} aria-label={names[i]} aria-current={i === at} className="flex h-4 items-center">
          <span className={`block h-1.5 rounded-full transition-all duration-300 ${i === at ? 'w-5 bg-foreground' : 'w-1.5 bg-border hover:bg-muted'}`} />
        </button>
      ))}
    </div>
  )
}

// The way in: the case study (or essay, or the product's site) as a button, anything else as a
// quiet link beside it. A case study page that's off (see pageIsLive) gets no link
function Links({ piece, centred = false }: { piece: ShowcasePiece; centred?: boolean }) {
  const story = piece.caseStudy && hrefIsLive(piece.caseStudy) ? piece.caseStudy : null
  const essay = story && getProjectById(story.replace('/projects/', ''))?.category === 'Article'
  const links = [
    story && { href: story, label: essay ? 'Read the essay' : 'Read case study', external: false },
    piece.more && { href: piece.more.href, label: piece.more.label, external: false },
    piece.visit && { href: piece.visit.href, label: piece.visit.label, external: true },
  ].filter(Boolean) as { href: string; label: string; external: boolean }[]
  if (!links.length) return null
  const button = 'inline-flex items-center rounded-full bg-foreground px-5 py-3 text-[15px] font-medium leading-5 text-background transition-[opacity,transform] duration-150 ease-out hover:opacity-85 active:scale-[0.97]'
  const quiet = 'text-sm leading-5 text-muted transition-colors hover:text-foreground'
  const to = (l: (typeof links)[number], cls: string) =>
    l.external
      ? <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" className={cls}>{l.label} ↗</a>
      : <Link key={l.href} href={l.href} className={cls}>{l.label} →</Link>
  return (
    <div className={`flex flex-wrap items-center gap-x-5 gap-y-3 ${centred ? 'justify-center' : ''}`}>
      {links.map((l, i) => to(l, i ? quiet : button))}
    </div>
  )
}

// Under a piece's hero: what it is, then what it did (from the case study) as one sentence, then
// the way in. A piece with results leads with them instead of its summary
// beside: the way in at the end of the title's row (desktop), so the card in focus shows the
// only button; the peeking card's sits past the column's edge. Phones put it under the words
function About({ piece, centred = false, beside = false }: { piece: ShowcasePiece; centred?: boolean; beside?: boolean }) {
  const title = <h3 className="max-w-[720px] text-[24px] font-medium leading-[30px] tracking-[-0.01em] text-foreground text-balance">{piece.title}</h3>
  return (
    <div className={`flex flex-col gap-3 ${centred ? 'items-center text-center' : ''}`}>
      {beside ? (
        <div className="flex items-center justify-between gap-6">
          {title}
          <div className="hidden shrink-0 md:block"><Links piece={piece} /></div>
        </div>
      ) : title}
      {piece.impact ? (
        <ImpactSentence impact={piece.impact} className="max-w-[640px] text-[18px] leading-[28px] tracking-[-0.01em]" />
      ) : (
        <p className="max-w-[640px] text-base leading-[26px] text-muted">{piece.summary}</p>
      )}
      {beside ? <div className="md:hidden"><Links piece={piece} /></div> : <Links piece={piece} centred={centred} />}
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
        style={{ width: 'min(92vw, calc((100dvh - 140px) * 1.6))' }}
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

// The section's title with its arrows right beside it. Phones swipe instead
function HeadingWithArrows({ section, at, of, onGo, centred = false }: { section: ShowcaseSection; at: number; of: number; onGo: (i: number) => void; centred?: boolean }) {
  return (
    <div className={`flex flex-wrap items-center gap-x-5 gap-y-4 ${centred ? 'justify-center' : ''}`}>
      <Heading section={section} />
      {of > 1 && (
        <div className="hidden shrink-0 gap-2 md:flex">
          <button onClick={() => onGo(at - 1)} disabled={at === 0} aria-label="Previous" className={STEP}><ChevronLeft className="h-4 w-4" /></button>
          <button onClick={() => onGo(at + 1)} disabled={at === of - 1} aria-label="Next" className={STEP}><ChevronRight className="h-4 w-4" /></button>
        </div>
      )}
    </div>
  )
}

const STEP = 'flex h-10 w-10 items-center justify-center rounded-full border border-border text-foreground transition-[opacity,transform] duration-150 ease-out active:scale-[0.97] disabled:pointer-events-none disabled:opacity-30'

// The simple one: everything inside the page's column, one left edge for the heading, the cards
// and the dots. Each card is ¾ of the column with the next one peeking in the last quarter
// (phones: most of the screen, the row running to its edges, the same 24px either side). The
// arrows only show when there are more cards than fit. Nothing runs off past the
// column, so a wide screen just gets an even margin either side
function ContainedSection({ section, open }: { section: ShowcaseSection; open: Opener }) {
  const row = useRef<HTMLDivElement>(null)
  const [at, setAt] = useState(0)
  const [more, setMore] = useState(false) // more cards than fit
  const n = section.pieces.length
  const stride = () => {
    const slides = row.current?.querySelectorAll<HTMLElement>('[data-slide]')
    return slides && slides.length > 1 ? slides[1].offsetLeft - slides[0].offsetLeft : 1
  }
  useEffect(() => {
    const el = row.current
    if (!el) return
    const check = () => setMore(el.scrollWidth > el.clientWidth + 2)
    check()
    const ro = new ResizeObserver(check)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  const go = (i: number) => {
    const to = Math.min(n - 1, Math.max(0, i))
    setAt(to)
    row.current?.scrollTo({ left: to * stride(), behavior: 'smooth' })
  }
  const heroes = section.pieces.map(heroItem)
  return (
    <section aria-labelledby={`home-${section.id}`} className="flex flex-col gap-10 py-24">
      <HeadingWithArrows section={section} at={at} of={more ? n : 1} onGo={go} />
      <div
        ref={row}
        onScroll={() => setAt(Math.min(n - 1, Math.round((row.current?.scrollLeft ?? 0) / stride())))}
        className="scrollbar-hide -mx-6 flex snap-x snap-mandatory gap-6 overflow-x-auto overscroll-x-contain px-6 md:mx-0 md:px-0"
        style={{ scrollPaddingInline: 24 }}
      >
        {section.pieces.map((p, i) => {
          const hero = heroes[i]
          const focus = i === at
          const frame = <Frame item={hero} playing={focus} onOpen={() => open(itemsOf(p), 0)} className={`rounded-xl ${hero.plain ? '' : p.framed ? 'shadow-[0_10px_30px_-10px_rgba(0,0,0,0.18)]' : 'shadow-[0_0_0_1px_var(--border)]'}`} />
          return (
            <article key={p.id} data-slide className="flex w-[88%] shrink-0 snap-start flex-col gap-6 md:w-[75%]">
              {/* Out of focus, the card softens and holds still until it comes to the front */}
              <div className="transition-[filter,opacity] duration-300 ease-out motion-reduce:transition-none" style={focus ? undefined : { filter: 'blur(3px)', opacity: 0.6 }}>
                {p.framed ? <div className="rounded-2xl p-4 md:p-6" style={{ background: p.tint }}>{frame}</div> : frame}
              </div>
              <About piece={p} beside />
            </article>
          )
        })}
      </div>
    </section>
  )
}

// The curve: the pieces on a ring of cards seen from just outside it, close up, like the codepen
// "Carousel #1". The card in front is big and in focus; its neighbours bend away at the edges and,
// through the gaps, the far side of the ring shows behind. Stepping turns the ring. The ring has
// more places than there are pieces, so the pieces repeat round it and it turns forever. Only the
// cards near the front play their clip; the rest are blank cards. Every setting is a slider
// (bottom left), saved in this browser, so it can be tuned by eye. Below lg it's the contained row
export type CurveSettings = {
  zoom: number // the front card's width, % of the column
  width: number // the visible band, % of the window
  cards: number // places round the ring
  gap: number // space between neighbours, % of a card
  camera: number // how far back the camera is, × the card's width (smaller: more bend)
  fade: number // how much the cards away from the front fade, 0 to 1
  blur: number // px of blur per step from the front
  back: boolean // show the far side of the ring through the gaps
  height: number // the band's height, × the card's height
  ms: number // a turn, in ms
}
export const CURVE_DEFAULTS: CurveSettings = { zoom: 78, width: 100, cards: 12, gap: 4, camera: 1.6, fade: 0.35, blur: 2, back: true, height: 1.15, ms: 700 }
const CURVE_KEY = 'curve-settings'
const CURVE_EASE = 'cubic-bezier(0.77, 0, 0.175, 1)' // moving on screen: strong ease-in-out

function useCurveSettings() {
  const [set, setSet] = useState<CurveSettings>(CURVE_DEFAULTS)
  useEffect(() => {
    try { const v = localStorage.getItem(CURVE_KEY); if (v) setSet({ ...CURVE_DEFAULTS, ...JSON.parse(v) }) } catch { /* the defaults, then */ }
  }, [])
  const update = (next: CurveSettings) => { setSet(next); localStorage.setItem(CURVE_KEY, JSON.stringify(next)) }
  return [set, update] as const
}

function CurveSection({ section, open, set }: { section: ShowcaseSection; open: Opener; set: CurveSettings }) {
  const [pos, setPos] = useState(0) // places turned; keeps counting, so the ring turns the short way forever
  const n = section.pieces.length
  const at = ((pos % n) + n) % n
  const piece = section.pieces[at]
  const heroes = section.pieces.map(heroItem)
  const step = 360 / set.cards
  const w = set.zoom // cqw
  const r = (w * (1 + set.gap / 100)) / (2 * Math.sin(Math.PI / set.cards)) // neighbours a gap apart
  const drag = useRef<number | null>(null)
  // The pieces round the ring: place k holds piece k mod n; place 0 holds the first
  const places = Array.from({ length: set.cards }, (_, k) => k)
  // How many places a place is from the front, the short way round
  const away = (k: number) => { const d = (((k - pos) % set.cards) + set.cards) % set.cards; return Math.min(d, set.cards - d) }
  // Turning to a piece: the nearest place holding it
  const goPiece = (i: number) => {
    let best = pos, bestD = Infinity
    for (let d = -set.cards; d <= set.cards; d++) if (((((pos + d) % n) + n) % n) === i && Math.abs(d) < bestD) { best = pos + d; bestD = Math.abs(d) }
    setPos(best)
  }
  return (
    <section aria-labelledby={`home-${section.id}`} className="flex flex-col gap-12 py-24 [container-type:inline-size]">
      <HeadingWithArrows section={section} at={1} of={3} onGo={(i) => setPos(pos + (i > 1 ? 1 : -1))} centred />
      <div className="relative overflow-hidden" style={{ width: `${set.width}vw`, marginLeft: `calc(50% - ${set.width / 2}vw)` }}>
        <div
          className="relative mx-auto select-none"
          style={{ width: `${w}cqw`, height: `${(w / 1.6) * set.height}cqw`, perspective: `${w * set.camera}cqw` }}
          onPointerDown={(e) => { drag.current = e.clientX }}
          onPointerUp={(e) => { if (drag.current !== null && Math.abs(e.clientX - drag.current) > 50) setPos(pos + (e.clientX < drag.current ? 1 : -1)); drag.current = null }}
        >
          <div
            className="absolute inset-x-0 top-1/2 motion-reduce:transition-none"
            style={{ height: `${w / 1.6}cqw`, marginTop: `${-w / 3.2}cqw`, transformStyle: 'preserve-3d', transform: `translateZ(${-r}cqw) rotateY(${-pos * step}deg)`, transition: `transform ${set.ms}ms ${CURVE_EASE}` }}
          >
            {places.map((k) => {
              const i = ((k % n) + n) % n
              const d = away(k)
              const front = d === 0
              return (
                <div
                  key={k}
                  className="absolute inset-0 overflow-hidden rounded-[6px] bg-[#fafafa] shadow-[0_0_0_1px_var(--border)] motion-reduce:transition-none"
                  style={{
                    transform: `rotateY(${k * step}deg) translateZ(${r}cqw)`,
                    backfaceVisibility: set.back ? 'visible' : 'hidden',
                    opacity: front ? 1 : Math.max(0.08, 1 - d * set.fade),
                    filter: front || !set.blur ? undefined : `blur(${Math.min(d, 4) * set.blur}px)`,
                    transition: `opacity ${set.ms}ms ${CURVE_EASE}, filter ${set.ms}ms ${CURVE_EASE}`,
                  }}
                  aria-hidden={!front}
                >
                  {/* Only the cards near the front play; the rest of the ring is blank cards */}
                  {d <= 1 && <Frame item={heroes[i]} onOpen={() => open(itemsOf(section.pieces[i]), 0)} />}
                  {!front && <button onClick={() => goPiece(i)} aria-label={section.pieces[i].title} tabIndex={-1} className="absolute inset-0 cursor-pointer" />}
                </div>
              )
            })}
          </div>
        </div>
      </div>
      <div className="grid">
        <AnimatePresence initial={false} mode="wait">
          <motion.div key={piece.id} className="col-start-1 row-start-1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18, ease: 'easeOut' }}>
            <About piece={piece} centred />
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="flex justify-center"><Dots at={at} of={n} onGo={goPiece} names={section.pieces.map((p) => p.title)} /></div>
    </section>
  )
}

// The curve's sliders, bottom left, to tune it by eye. Copy hands the values over
function CurveControls({ set, onChange }: { set: CurveSettings; onChange: (s: CurveSettings) => void }) {
  const [copied, setCopied] = useState(false)
  const rows: { key: keyof CurveSettings; label: string; min: number; max: number; step: number }[] = [
    { key: 'zoom', label: 'Zoom (front card, % of column)', min: 40, max: 130, step: 1 },
    { key: 'width', label: 'Band width (% of window)', min: 40, max: 100, step: 1 },
    { key: 'camera', label: 'Camera distance (smaller bends more)', min: 0.6, max: 5, step: 0.05 },
    { key: 'cards', label: 'Cards round the ring', min: 5, max: 24, step: 1 },
    { key: 'gap', label: 'Gap between cards (%)', min: 0, max: 30, step: 0.5 },
    { key: 'fade', label: 'Fade away from front', min: 0, max: 1, step: 0.01 },
    { key: 'blur', label: 'Blur per step (px)', min: 0, max: 10, step: 0.5 },
    { key: 'height', label: 'Band height (× card)', min: 1, max: 2, step: 0.01 },
    { key: 'ms', label: 'Turn (ms)', min: 200, max: 1500, step: 10 },
  ]
  return (
    <div className="fixed bottom-4 left-4 z-50 hidden w-[300px] flex-col gap-2.5 rounded-xl border border-border bg-background/95 p-4 text-xs shadow-[0_10px_30px_-10px_rgba(0,0,0,0.25)] backdrop-blur lg:flex">
      <div className="flex items-center justify-between font-medium text-foreground">
        <span>Curve</span>
        <span className="flex gap-3">
          <button className="text-muted hover:text-foreground" onClick={() => onChange(CURVE_DEFAULTS)}>Reset</button>
          <button className="text-muted hover:text-foreground" onClick={() => { navigator.clipboard.writeText(JSON.stringify(set)); setCopied(true); setTimeout(() => setCopied(false), 1200) }}>{copied ? 'Copied' : 'Copy'}</button>
        </span>
      </div>
      {rows.map(({ key, label, min, max, step }) => (
        <label key={key} className="flex flex-col gap-1">
          <span className="flex justify-between text-muted"><span>{label}</span><span className="tabular-nums text-foreground">{set[key] as number}</span></span>
          <input type="range" min={min} max={max} step={step} value={set[key] as number} onChange={(e) => onChange({ ...set, [key]: Number(e.target.value) })} className="accent-foreground" />
        </label>
      ))}
      <label className="flex items-center gap-2 text-muted">
        <input type="checkbox" checked={set.back} onChange={(e) => onChange({ ...set, back: e.target.checked })} className="accent-foreground" />
        Show the far side of the ring
      </label>
    </div>
  )
}

// How the sections lay out their pieces: contained. The curve is parked (see content/parked.ts):
// ?track=curve on the dev server only
function useCurve() {
  const [curve, setCurve] = useState(false)
  useEffect(() => { setCurve(process.env.NODE_ENV === 'development' && new URLSearchParams(window.location.search).get('track') === 'curve') }, [])
  return curve
}

export function HomeShowcase() {
  useNoScrollJumps()
  const curve = useCurve()
  const [curveSet, setCurveSet] = useCurveSettings()
  const [lightbox, setLightbox] = useState<{ items: Item[]; start: number } | null>(null)
  const open: Opener = useCallback((items, start) => setLightbox({ items, start }), [])
  const close = useCallback(() => setLightbox(null), [])
  return (
    <div className="flex flex-col px-6">
      {SHOWCASE_SECTIONS.map((section) => {
        const quote = TESTIMONIALS.find((t) => t.name === section.quote)
        return (
          <Fragment key={section.id}>
            {curve ? (
              <>
                <div className="hidden lg:block"><CurveSection section={section} open={open} set={curveSet} /></div>
                <div className="lg:hidden"><ContainedSection section={section} open={open} /></div>
              </>
            ) : <ContainedSection section={section} open={open} />}
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
      {curve && <CurveControls set={curveSet} onChange={setCurveSet} />}
    </div>
  )
}
