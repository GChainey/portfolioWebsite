'use client'

import { memo, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import type { WorkItem } from '@/content/work'
import { ArrowDown } from 'lucide-react'
import { CASE_STUDIES } from '@/content/work'
import type { Screen } from '@/content/screens'
import { WorkReel, pad } from '@/components/showcase/shared'
import { ScreenTile, colourOf } from '../shared'
import { buildWall, CW, GAP, RADIUS, CENTER, PLANE_H, type Wall } from './wall'
import { ChapterText, KICKER, ABOUT, ABOUT_SUB, clamp, smooth, lerp, easeInOut } from './bits'

// The desktop scene. One sticky stage holds the wall and the dive, then stays put while the
// three case studies scroll past on its left.
//
//   wall   A plane of every screen, tilted back in 3D, its columns drifting up and down.
//   dive   Scroll on and the plane un-tilts while the camera pushes in to the Daisy Assess
//          poster in its centre column, until the poster fills a 16:10 stage.
//   work   The stage slides right and plays the live reel; the chapters scroll past on the left.
//
// Everything that moves with scroll is written straight to transforms from one rAF loop, with
// light smoothing on the scroll position, so React never re-renders mid-scroll.

const HEADER = 56
const TILT = { x: 26, y: 6, z: -10 } // the plane at rest, degrees

type Geo = {
  W: number; V: number; gutter: number
  D: number // px of scroll the dive takes
  spacer: number // px before the first chapter
  text: { left: number; width: number }
  stage: { x: number; y: number; w: number; h: number } // where the stage rests beside the chapters
  centre: { w: number; h: number } // the stage at the end of the dive, in the middle
  s0: number; S: number // the plane's scale at rest and at the end of the dive
}

function geometry(W: number, winH: number, gutter: number, reduced: boolean): Geo {
  const V = Math.max(560, winH - HEADER)
  const left = gutter + 32
  const width = clamp(W * 0.32, 380, 460)
  // The stage: from the text column's end to the page column's edge, never taller than fits
  const sl = left + width + 80
  const sr = W - Math.max(gutter, 32)
  let w = sr - sl
  let h = w / 1.6
  const maxH = V - 240
  if (h > maxH) { h = maxH; w = h * 1.6 }
  const stage = { x: sr - w, y: Math.round((V - h - 48) / 2), w, h }
  const cw = Math.min(W - 2 * left, (V - 140) * 1.6, 1440)
  const D = reduced ? V * 0.9 : V * 1.6
  return {
    W, V, gutter, D,
    spacer: D + V * 0.85,
    text: { left, width },
    stage,
    centre: { w: cw, h: cw / 1.6 },
    s0: 0.64 * Math.max(1, W / 1440),
    S: cw / CW,
  }
}

export function DiveScene({ W, gutter, reduced }: { W: number; gutter: number; reduced: boolean }) {
  const wall = useMemo(buildWall, [])
  const [winH, setWinH] = useState(900)
  useEffect(() => {
    const on = () => setWinH(window.innerHeight)
    on()
    window.addEventListener('resize', on)
    return () => window.removeEventListener('resize', on)
  }, [])
  const g = useMemo(() => geometry(W, winH, gutter, reduced), [W, winH, gutter, reduced])
  const gRef = useRef(g)
  gRef.current = g

  const root = useRef<HTMLDivElement>(null)
  const wrap = useRef<HTMLDivElement>(null)
  const plane = useRef<HTMLDivElement>(null)
  const colEls = useRef<(HTMLDivElement | null)[]>([])
  const fades = useRef<HTMLDivElement>(null)
  const intro = useRef<HTMLDivElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const caption = useRef<HTMLDivElement>(null)
  const nav = useRef<HTMLDivElement>(null)
  const hovered = useRef<boolean[]>(wall.cols.map(() => false))
  const chapters = useRef<(HTMLElement | null)[]>([])

  const [near, setNear] = useState(true)
  const [live, setLive] = useState(false) // the stage is up: mount the reel
  const [touchable, setTouchable] = useState(true) // the wall takes the pointer
  const [active, setActive] = useState(0)
  const item = CASE_STUDIES[active]
  const activeRef = useRef(active)
  activeRef.current = active

  // Only animate while the scene is anywhere near the screen
  useEffect(() => {
    const el = root.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setNear(e.isIntersecting), { rootMargin: '300px 0px' })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  // Warm the cache for the first reel, so it is ready by the time the camera lands
  useEffect(() => {
    const src = CASE_STUDIES[0].reel.find((r) => r.src)?.src
    if (near && src && !reduced) fetch(src).catch(() => {})
  }, [near, reduced])

  // The chapter in the middle of the screen is the one on the stage
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.index)) }),
      { rootMargin: '-45% 0px -45% 0px' },
    )
    chapters.current.forEach((el) => el && io.observe(el))
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    if (!near) return
    let raf = 0
    let last = performance.now()
    let sm: number | null = null
    const off = wall.cols.map((c) => c.phase)
    const spd = wall.cols.map(() => 1)
    let delta: number | null = null
    let liveNow = false
    let touchNow = true
    const t = wall.target
    const centre = wall.cols[CENTER]

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick)
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      const g = gRef.current
      const el = root.current
      if (!el) return
      const raw = HEADER - el.getBoundingClientRect().top
      sm = sm === null ? raw : sm + (raw - sm) * (1 - Math.exp(-dt * 14))
      if (Math.abs(raw - sm) < 0.3) sm = raw
      const s = sm
      const p = clamp(s / g.D)

      // Drift: each column at its own pace, settling to a stop as the dive begins or under the pointer
      const calm = 1 - smooth(0, 0.08, p)
      wall.cols.forEach((c, i) => {
        spd[i] += ((hovered.current[i] ? 0 : 1) - spd[i]) * (1 - Math.exp(-dt * 6))
        if (!reduced) off[i] = (off[i] + dt * c.speed * spd[i] * calm) % c.L
      })

      // As the dive starts, slide the centre column so the poster sits on the plane's centre
      const yc = centre.dir > 0 ? -off[CENTER] : off[CENTER] - centre.L
      if (p > 0 && delta === null) {
        let d = PLANE_H / 2 - t.y - t.h / 2 - yc
        d = ((d % centre.L) + centre.L) % centre.L
        if (d > centre.L / 2) d -= centre.L
        delta = d
      } else if (p <= 0) delta = null
      const align = reduced ? 0 : easeInOut(smooth(0, 0.34, p))

      wall.cols.forEach((c, i) => {
        let y = c.dir > 0 ? -off[i] : off[i] - c.L
        if (i === CENTER && delta !== null) y += delta * align
        y = (((y % c.L) + c.L) % c.L) - c.L
        const col = colEls.current[i]
        if (col) col.style.transform = `translate3d(0,${y.toFixed(2)}px,0)`
      })

      // The camera: un-tilt, then push in until the poster is the stage
      const k = reduced ? 0 : easeInOut(smooth(0.02, 0.46, p))
      const kz = reduced ? 0 : easeInOut(smooth(0.06, 0.72, p))
      const scale = Math.exp(lerp(Math.log(g.s0), Math.log(g.S), kz))
      if (plane.current) {
        plane.current.style.transform =
          `translate3d(${g.W / 2}px,${g.V / 2}px,0) rotateX(${(TILT.x * (1 - k)).toFixed(3)}deg) rotateY(${(TILT.y * (1 - k)).toFixed(3)}deg) rotateZ(${(TILT.z * (1 - k)).toFixed(3)}deg) scale(${scale.toFixed(4)}) translate3d(${-wall.width / 2}px,${-PLANE_H / 2}px,0)`
      }
      const wallOp = reduced ? 1 - smooth(0.15, 0.5, p) : 1 - smooth(0.56, 0.78, p)
      if (wrap.current) {
        wrap.current.style.opacity = String(wallOp)
        wrap.current.style.visibility = wallOp <= 0 ? 'hidden' : 'visible'
      }
      if (fades.current) fades.current.style.opacity = String(1 - smooth(0.05, 0.4, p))
      if (intro.current) {
        const o = 1 - smooth(0.0, 0.14, p)
        intro.current.style.opacity = String(o)
        intro.current.style.transform = `translate3d(0,${(-p * 160).toFixed(1)}px,0)`
        intro.current.style.visibility = o <= 0 ? 'hidden' : 'visible'
      }

      // The stage rides on the poster once the plane is flat, then slides beside the chapters
      const m = reduced ? 1 : easeInOut(smooth(g.D - 0.3 * g.V, g.D + 0.2 * g.V, s))
      const stageOp = reduced ? smooth(0.3, 0.6, p) : smooth(0.46, 0.53, p)
      const sc = lerp((CW * scale) / g.stage.w, 1, m)
      const cx = g.W / 2 - (g.stage.x + g.stage.w / 2)
      const cy = g.V / 2 - (g.stage.y + g.stage.h / 2)
      if (stage.current) {
        stage.current.style.transform = `translate3d(${(cx * (1 - m)).toFixed(2)}px,${(cy * (1 - m)).toFixed(2)}px,0) scale(${sc.toFixed(4)})`
        stage.current.style.opacity = String(stageOp)
        stage.current.style.visibility = stageOp <= 0 ? 'hidden' : 'visible'
      }
      if (caption.current) {
        const o = reduced ? 0 : smooth(0.7, 0.8, p) * (1 - smooth(0, 0.2, m))
        caption.current.style.opacity = String(o)
        caption.current.style.transform = `translate3d(0,${((1 - smooth(0.7, 0.8, p)) * 10).toFixed(1)}px,0)`
      }
      if (nav.current) nav.current.style.opacity = String(reduced ? stageOp : smooth(0.6, 1, m))

      const nextLive = p > 0.7
      if (nextLive !== liveNow) { liveNow = nextLive; setLive(nextLive) }
      const nextTouch = p < 0.03
      if (nextTouch !== touchNow) { touchNow = nextTouch; setTouchable(nextTouch) }
      if (s < g.D - 0.3 * g.V && activeRef.current !== 0) setActive(0)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [near, reduced, wall])

  const R = (RADIUS * g.stage.w) / CW // the stage's corners, so they match the tile's as it lands
  const centreBottom = g.V / 2 + g.centre.h / 2

  return (
    <div ref={root} className="relative bg-background">
      {/* The scene, stuck under the header for the whole wall, dive and chapters */}
      <div className="sticky top-14 overflow-hidden" style={{ height: g.V }}>
        {/* The wall */}
        <div ref={wrap} className="absolute inset-0" style={{ perspective: 1600, pointerEvents: touchable ? 'auto' : 'none' }}>
          <div ref={plane} className="dv-plane absolute left-0 top-0" style={{ width: wall.width, height: PLANE_H, transformOrigin: '0 0' }}>
            {wall.cols.map((c, i) => (
              <div
                key={i}
                ref={(el) => { colEls.current[i] = el }}
                className="dv-col absolute top-0 flex flex-col"
                style={{ left: c.x, width: CW, gap: GAP }}
                onMouseEnter={() => { hovered.current[i] = true }}
                onMouseLeave={() => { hovered.current[i] = false }}
                onFocus={() => { hovered.current[i] = true }}
                onBlur={() => { hovered.current[i] = false }}
              >
                {Array.from({ length: c.copies }, (_, n) => c.tiles.map((tile) => (
                  <WallTile key={`${n}-${tile.s.id}`} s={tile.s} h={tile.h} copy={n > 0} focusable={touchable} />
                )))}
              </div>
            ))}
          </div>
        </div>
        {/* Top and bottom fade into the page */}
        <div ref={fades} className="pointer-events-none absolute inset-0">
          <div className="absolute inset-x-0 top-0 h-40" style={{ background: 'linear-gradient(var(--background), color-mix(in srgb, var(--background) 0%, transparent))' }} />
          <div className="absolute inset-x-0 bottom-0 h-48" style={{ background: 'linear-gradient(color-mix(in srgb, var(--background) 0%, transparent), var(--background))' }} />
        </div>

        {/* The positioning line, on a soft scrim, lined up with the page */}
        <div ref={intro} className="pointer-events-none absolute inset-0">
          <div
            className="absolute inset-0"
            style={{ background: `radial-gradient(ellipse 900px 560px at ${g.text.left + 160}px 210px, color-mix(in srgb, var(--background) 96%, transparent) 0%, color-mix(in srgb, var(--background) 90%, transparent) 38%, color-mix(in srgb, var(--background) 55%, transparent) 64%, color-mix(in srgb, var(--background) 0%, transparent) 100%)` }}
          />
          <div className="absolute" style={{ left: g.text.left, top: 64, width: Math.min(560, g.text.width + 100) }}>
            <p className="text-xs uppercase tracking-widest text-muted">{KICKER}</p>
            <h2 className="mt-4 text-[40px] font-medium leading-[1.08] tracking-[-0.028em] text-foreground text-balance">{ABOUT}</h2>
            <p className="mt-4 max-w-[440px] text-base leading-relaxed text-muted">{ABOUT_SUB}</p>
            <p className="mt-8 inline-flex items-center gap-2 text-xs text-muted">
              <span className="dv-bob inline-flex"><ArrowDown className="h-3.5 w-3.5" /></span>
              Scroll to dive into the work
            </p>
          </div>
        </div>

        {/* The stage */}
        <div
          ref={stage}
          className="absolute"
          style={{ left: g.stage.x, top: g.stage.y, width: g.stage.w, height: g.stage.h, transformOrigin: '50% 50%', opacity: 0, visibility: 'hidden' }}
        >
          <motion.div
            aria-hidden
            className="absolute -inset-16 blur-3xl"
            animate={{ background: `radial-gradient(closest-side, ${item.accent}50, transparent)` }}
            transition={{ duration: 0.8 }}
          />
          <div className="dv-stage relative h-full w-full overflow-hidden bg-card" style={{ borderRadius: R }}>
            <AnimatePresence initial={false}>
              <motion.div
                key={item.id}
                className="absolute inset-0"
                initial={{ opacity: 0, scale: 1.02 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
              >
                <StageMedia item={item} landing={active === 0 ? wall.target.s.src : null} play={live && near && !reduced} width={g.stage.w} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Under the poster as it lands: what it is */}
        <div ref={caption} className="pointer-events-none absolute inset-x-0 flex justify-center" style={{ top: centreBottom + 14, opacity: 0 }}>
          <p className="inline-flex items-center gap-2 text-sm text-muted">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: CASE_STUDIES[0].accent }} />
            <span className="text-foreground">{CASE_STUDIES[0].name}</span>
            <span>·</span>
            {CASE_STUDIES[0].title}
          </p>
        </div>

        {/* Where you are in the work */}
        <div ref={nav} className="absolute flex gap-2" style={{ left: g.stage.x, top: g.stage.y + g.stage.h + 28, width: g.stage.w, opacity: 0 }}>
          {CASE_STUDIES.map((w, i) => (
            <button
              key={w.id}
              onClick={() => chapters.current[i]?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' })}
              className="group flex-1 text-left"
              aria-label={`${w.name}: ${w.title}`}
            >
              <span className="block h-0.5 rounded-full transition-colors duration-500" style={{ background: i === active ? w.accent : 'var(--border)' }} />
              <span className={`mt-2.5 flex items-center gap-2 truncate text-xs transition-colors ${i === active ? 'text-foreground' : 'text-muted group-hover:text-foreground'}`}>
                <span className="font-mono tabular-nums">{pad(i + 1)}</span>
                {w.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* The chapters, scrolling over the scene's left side */}
      <div className="pointer-events-none relative z-10" style={{ marginTop: -g.V }}>
        <div style={{ height: g.spacer }} />
        {CASE_STUDIES.map((w, i) => (
          <article
            key={w.id}
            ref={(el) => { chapters.current[i] = el }}
            data-index={i}
            className="pointer-events-auto flex flex-col justify-center py-16 transition-opacity duration-700"
            style={{ minHeight: g.V, marginLeft: g.text.left, width: g.text.width, opacity: i === active ? 1 : 0.28 }}
          >
            <ChapterText item={w} index={i} reduced={reduced} />
          </article>
        ))}
      </div>
    </div>
  )
}

// What the stage shows. For the first case study it starts as the very screen the camera dived
// into (the reel's opening frame), full bleed, so the tile and the stage are one picture. Once
// landed, the screen settles into the place the reel draws its media, on the reel's own dotted
// canvas; only when the reel has painted its first scene does it fade in over the top, so there
// is never a half-loaded reel, or a different picture, showing through.
const REEL_W = 1600
const BARE = { x: 72, y: 64, w: 1456, h: 872 } // the reel's media box without captions
const LANDING_MATCH_MS = 3500 // when the RFP reel's frame matches the landing screen
function StageMedia({ item, landing, play, width }: { item: WorkItem; landing: string | null; play: boolean; width: number }) {
  const box = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState(false)
  const [settled, setSettled] = useState(false)
  const k = width / REEL_W
  // The landing screen, fitted into the reel's media box (it shares the recording's shape)
  const fit = Math.min(BARE.w / REEL_W, BARE.h / (REEL_W / 1.6))

  useEffect(() => {
    setReady(false)
    setSettled(false)
    if (!play) return
    const s = setTimeout(() => setSettled(true), 60)
    let t: ReturnType<typeof setTimeout> | undefined
    let hold: ReturnType<typeof setTimeout> | undefined
    // The reel fades a scene in once its media has painted: wait for that, then for the fade.
    // The RFP reel opens on the dashboard and scrolls to the caseload, the landing screen, about
    // three seconds in; revealing it then makes the hand-off a sharpen rather than a cross-fade.
    const poll = () => {
      const el = box.current
      const shown = el && Array.from(el.querySelectorAll<HTMLElement>('div[style*="opacity"]')).some((d) => d.style.opacity === '1' && !!d.querySelector('.rr-stage, video, iframe'))
      if (shown) hold = setTimeout(() => setReady(true), landing ? LANDING_MATCH_MS : 500)
      else t = setTimeout(poll, 100)
    }
    poll()
    return () => { clearTimeout(s); if (t) clearTimeout(t); if (hold) clearTimeout(hold) }
  }, [play, item.id, landing])

  return (
    <div className="absolute inset-0" style={{ background: `#fafafa radial-gradient(#e4e4e7 ${1.2 * k}px, transparent ${1.2 * k}px) 0 0 / ${28 * k}px ${28 * k}px` }}>
      {landing ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={landing}
          alt=""
          draggable={false}
          className="absolute inset-0 h-full w-full object-cover"
          style={{
            transform: settled ? `scale(${fit})` : 'none',
            borderRadius: settled ? 16 * k / fit : 0,
            boxShadow: settled ? '0 0 0 1px rgba(9,9,11,.08), 0 2px 4px rgba(9,9,11,.04), 0 40px 80px -24px rgba(9,9,11,.28)' : 'none',
            transition: settled ? 'transform .9s cubic-bezier(.2,.8,.2,1), border-radius .9s ease, box-shadow .9s ease' : 'none',
          }}
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.poster} alt="" draggable={false} className="absolute inset-0 h-full w-full object-cover" />
      )}
      {play && (
        <div ref={box} className="absolute inset-0" style={{ opacity: ready ? 1 : 0, transition: 'opacity .35s ease' }}>
          <WorkReel item={item} captions={false} />
        </div>
      )}
    </div>
  )
}

// One screen on the wall. Hover lifts it toward the camera and names it in its project's colour.
const WallTile = memo(function WallTile({ s, h, copy, focusable }: { s: Screen; h: number; copy: boolean; focusable: boolean }) {
  const body = (
    <span className="dv-lift absolute inset-0 block" style={{ borderRadius: RADIUS }}>
      <ScreenTile screen={s} fit="cover" className="h-full w-full" style={{ borderRadius: RADIUS }} />
      <span className="dv-chip pointer-events-none absolute inset-x-3 bottom-3 flex">
        <span className="flex max-w-full flex-col gap-1 rounded-[10px] px-3 py-2 text-white shadow-lg" style={{ background: colourOf(s.project) }}>
          <span className="text-[12px] font-medium uppercase leading-none tracking-wider text-white/75">{s.project}</span>
          <span className="line-clamp-2 text-[15px] font-medium leading-tight">{s.title}</span>
        </span>
      </span>
    </span>
  )
  const props = {
    className: 'dv-tile relative block shrink-0',
    style: { height: h, borderRadius: RADIUS },
    tabIndex: copy || !focusable ? -1 : undefined,
    'aria-hidden': copy || undefined,
  }
  if (!s.href) return <div {...props}>{body}</div>
  const label = `${s.project}: ${s.title}`
  return s.href.startsWith('http')
    ? <a href={s.href} target="_blank" rel="noopener noreferrer" aria-label={label} {...props}>{body}</a>
    : <Link href={s.href} aria-label={label} {...props}>{body}</Link>
})

export const SCENE_CSS = `
  .dv-plane, .dv-col { transform-style: preserve-3d; }
  .dv-tile { transform-style: preserve-3d; transition: opacity .4s ease; }
  .dv-lift {
    transition: transform .6s cubic-bezier(.2,.8,.2,1), box-shadow .6s ease;
    box-shadow: 0 0 0 1px color-mix(in srgb, var(--foreground) 9%, transparent), 0 12px 32px -14px rgba(0,0,0,.45);
  }
  .dv-tile:hover .dv-lift, .dv-tile:focus-visible .dv-lift { transform: translateZ(90px) scale(1.03); box-shadow: 0 0 0 1px color-mix(in srgb, var(--foreground) 12%, transparent), 0 40px 80px -30px rgba(0,0,0,.7); }
  .dv-tile:focus-visible { outline: 2px solid var(--accent); outline-offset: 4px; }
  .dv-plane:hover .dv-tile:not(:hover) { opacity: .55; }
  .dv-chip { opacity: 0; transform: translateY(6px); transition: opacity .3s ease, transform .4s cubic-bezier(.2,.8,.2,1); }
  .dv-tile:hover .dv-chip, .dv-tile:focus-visible .dv-chip { opacity: 1; transform: none; }
  .dv-stage { box-shadow: 0 0 0 1px color-mix(in srgb, var(--foreground) 10%, transparent), 0 40px 120px -40px rgba(0,0,0,.6); }
  @keyframes dv-bob { 0%, 100% { transform: translateY(0) } 50% { transform: translateY(3px) } }
  .dv-bob { animation: dv-bob 2.4s ease-in-out infinite; }
  @media (prefers-reduced-motion: reduce) { .dv-bob { animation: none } .dv-tile:hover .dv-lift, .dv-tile:focus-visible .dv-lift { transform: none } }
`
