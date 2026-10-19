'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { REPLAY_CSS } from '@/components/replay/replayStyles'

// The showcase's reel engine (the parked homepage variants and the sizzle reels). It grew out of
// the case studies' ReplayReel, which has since gone its own way (titles left, subtitles, camera).
//
// A sizzle reel made of replays instead of video: scenes cut one after another, each a stretch
// of a recording (or a crop of one) with a caption, on a dotted canvas. Everything on screen is
// drawn by the page, so it is as sharp as the site itself. It is laid out on a 1600x1000 stage
// and scaled to fit.
//
// A scene can also be a stretch of a video (for work that only exists as video), a live site
// (for canvas work a replay can't capture, like Shader Wall), or a still.

type Region = { x: number; y: number; width: number; height: number }

export interface ShowcaseScene {
  src?: string // /replays/... JSON
  video?: string // an mp4, played from `from` to `to`
  site?: string // a live site, drawn at 1440x900 and not interactive
  image?: string // a still, held with a slow push in
  region?: Region // the part of the recording to show
  from?: number // seconds into the recording
  to?: number
  rate?: number // playback speed
  hold?: number // seconds, for a text-only, site or still scene
  // stack: caption above the media. side: caption beside it. center: caption alone.
  // full: the media fills the stage, caption laid over its lower left
  layout?: 'stack' | 'side' | 'center' | 'full'
  kicker?: string
  title: string
  sub?: string
  live?: boolean // a green dot on the kicker: the model is real
}

type Recording = { meta: { width: number; height: number; mouse?: boolean }; events: unknown[] }
type Player = { play: (t?: number) => void; pause: (t?: number) => void; destroy: () => void; setConfig: (c: { speed: number }) => void; on: (event: string, fn: () => void) => void; iframe: HTMLIFrameElement }
type Box = { x: number; y: number; w: number; h: number }

const W = 1600
const H = 1000
const FADE = 450
const BOX: Record<'stack' | 'side' | 'full' | 'bare', Box> = {
  stack: { x: 96, y: 250, w: 1408, h: 690 },
  bare: { x: 72, y: 64, w: 1456, h: 872 }, // no caption: the media, fitted with a margin
  side: { x: 720, y: 70, w: 800, h: 860 },
  full: { x: 0, y: 0, w: W, h: H },
}
const SITE = { width: 1440, height: 900 }

const cache = new Map<string, Promise<Recording>>()
const load = (src: string) => {
  if (!cache.has(src)) cache.set(src, fetch(src).then((r) => r.json()))
  return cache.get(src)!
}
const hasMedia = (s: ShowcaseScene) => !!(s.src || s.video || s.site || s.image)
export const sceneDuration = (s: ShowcaseScene) =>
  s.src || s.video ? ((s.to ?? 0) - (s.from ?? 0)) / (s.rate ?? 1) : s.hold ?? (s.site ? 6 : s.image ? 4 : 3)
// How long a reel takes to play through once, cuts included
export const reelDuration = (scenes: ShowcaseScene[]) => scenes.reduce((t, s) => t + sceneDuration(s) + FADE / 1000, 0)

// Where the media sits in its box: fitted, or filling it for a full-bleed scene
function place(region: Region, box: Box, fill: boolean) {
  const k = (fill ? Math.max : Math.min)(box.w / region.width, box.h / region.height)
  const w = region.width * k, h = region.height * k
  return { k, left: box.x + (box.w - w) / 2, top: box.y + (box.h - h) / 2, w, h }
}

// One scene's media, cropped to its region and placed in its box
function SceneMedia({ scene, playing, box, fill, dark, pageTheme, onReady }: { scene: ShowcaseScene; playing: boolean; box: Box; fill: boolean; dark: boolean; pageTheme?: 'light' | 'dark'; onReady: () => void }) {
  const root = useRef<HTMLDivElement>(null)
  const video = useRef<HTMLVideoElement>(null)
  const player = useRef<Player | null>(null)
  const [size, setSize] = useState<{ width: number; height: number; mouse?: boolean } | null>(scene.site ? SITE : null)

  // Replays: build the player once
  useEffect(() => {
    if (!scene.src) return
    let gone = false
    ;(async () => {
      const [{ Replayer }, rec] = await Promise.all([import('@rrweb/replay'), load(scene.src!)])
      if (gone || !root.current) return
      setSize(rec.meta)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const r = new Replayer(rec.events as any, { root: root.current, mouseTail: false, showWarning: false, triggerFocus: false }) as unknown as Player
      r.setConfig({ speed: scene.rate ?? 1 })
      // Replay a recording of this site in the other theme: the recorded CSS has both, so only
      // the class on <html> needs to change. The player rebuilds the page on every seek, and a
      // recording can set the class itself partway through, so keep it set
      const theme = () => {
        const html = r.iframe.contentDocument?.documentElement
        if (!pageTheme || !html) return
        const set = () => { if (html.classList.contains('dark') !== (pageTheme === 'dark')) html.classList.toggle('dark', pageTheme === 'dark') }
        set()
        new MutationObserver(set).observe(html, { attributes: true, attributeFilter: ['class'] })
      }
      r.on('fullsnapshot-rebuilded', theme)
      r.pause((scene.from ?? 0) * 1000)
      theme()
      player.current = r
      // Give the rebuilt page a frame to paint before it's shown
      requestAnimationFrame(() => requestAnimationFrame(() => { if (!gone) onReady() }))
    })()
    return () => { gone = true; player.current?.destroy(); player.current = null }
  }, [scene, pageTheme])

  useEffect(() => {
    const from = scene.from ?? 0
    if (scene.src && player.current) {
      if (playing) player.current.play(from * 1000)
      else player.current.pause(from * 1000)
    }
    const v = video.current
    if (scene.video && v) {
      v.playbackRate = scene.rate ?? 1
      v.currentTime = from
      if (playing) v.play().catch(() => {})
      else v.pause()
    }
  }, [playing, size, scene])

  const full = size ? { x: 0, y: 0, width: size.width, height: size.height } : { x: 0, y: 0, width: 1280, height: 800 }
  const region = scene.region ?? full
  const p = place(region, box, fill)
  const inner = { width: full.width, height: full.height, transform: `scale(${p.k}) translate(${-region.x}px, ${-region.y}px)` }

  return (
    <div
      className={`absolute overflow-hidden ${fill ? '' : 'rounded-2xl'} bg-white`}
      style={{
        left: Math.max(p.left, box.x), top: Math.max(p.top, box.y), width: Math.min(p.w, box.w), height: Math.min(p.h, box.h),
        boxShadow: fill ? undefined : dark
          ? '0 0 0 1px rgba(255,255,255,.1), 0 40px 120px -20px rgba(0,0,0,.8)'
          : '0 0 0 1px rgba(9,9,11,.08), 0 2px 4px rgba(9,9,11,.04), 0 40px 80px -24px rgba(9,9,11,.28)',
      }}
    >
      {/* Offset so a filled scene stays centred on its region */}
      <div className="absolute" style={{ left: Math.min(0, p.left - box.x), top: Math.min(0, p.top - box.y), width: p.w, height: p.h }}>
        {scene.src && (
          <div ref={root} className={`rr-stage ${size?.mouse ? 'rr-mouse' : ''} absolute left-0 top-0 origin-top-left`} style={inner} />
        )}
        {scene.video && (
          <video
            ref={video}
            src={scene.video}
            muted
            playsInline
            preload="auto"
            onLoadedMetadata={(e) => setSize({ width: e.currentTarget.videoWidth, height: e.currentTarget.videoHeight })}
            onCanPlay={onReady}
            className="absolute left-0 top-0 origin-top-left max-w-none"
            style={inner}
          />
        )}
        {scene.site && (
          <iframe src={scene.site} title={scene.title} tabIndex={-1} aria-hidden onLoad={onReady} className="absolute left-0 top-0 origin-top-left border-0 pointer-events-none" style={inner} />
        )}
        {scene.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={scene.image}
            alt=""
            onLoad={(e) => { setSize({ width: e.currentTarget.naturalWidth, height: e.currentTarget.naturalHeight }); onReady() }}
            className="absolute left-0 top-0 origin-top-left max-w-none"
            style={{ ...inner, transition: `transform ${sceneDuration(scene)}s linear`, transform: `${inner.transform} scale(${playing ? 1.06 : 1})` }}
          />
        )}
      </div>
    </div>
  )
}

interface ShowcaseReelProps {
  scenes: ShowcaseScene[]
  captions?: boolean // false: every scene fills the stage with no text, and text-only scenes are skipped
  theme?: 'light' | 'dark'
  playing?: boolean // the parent can hold the reel (it also waits until it is on screen)
  onCycle?: () => void // called each time the last scene finishes
  loop?: boolean
  dots?: boolean // false: no dot before each kicker
  pageTheme?: 'light' | 'dark' // replay recordings of this site in this theme, whatever they were recorded in
}

export function ShowcaseReel({ scenes: all, captions = true, theme = 'light', playing: wanted = true, onCycle, loop = true, dots = true, pageTheme }: ShowcaseReelProps) {
  // Memoised: the timing effect below restarts whenever this changes
  const scenes = useMemo(() => (captions ? all : all.filter(hasMedia)), [all, captions])
  const box = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0)
  const [index, setIndex] = useState(0)
  const [shown, setShown] = useState(false) // the current scene has faded in
  const [visible, setVisible] = useState(false)
  const [ready, setReady] = useState(-1) // the scene whose media can be shown
  const [lap, setLap] = useState(0) // counts scene changes, so a one-scene reel still loops
  const cycle = useRef(onCycle)
  cycle.current = onCycle
  const dark = theme === 'dark'

  useEffect(() => {
    const el = box.current
    if (!el) return
    const fit = () => setScale(el.clientWidth / W)
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(el)
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.2 })
    io.observe(el)
    return () => { ro.disconnect(); io.disconnect() }
  }, [])

  // Warm the next recording while this one plays
  useEffect(() => {
    const next = scenes[(index + 1) % scenes.length]
    if (next?.src) load(next.src)
  }, [index, scenes])

  const active = visible && wanted

  // Fade in, play for the scene's length, fade out, next
  useEffect(() => {
    if (!active || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const scene = scenes[index]
    let t1: ReturnType<typeof setTimeout>, t2: ReturnType<typeof setTimeout>, t0: ReturnType<typeof setTimeout> | undefined
    let gone = false
    // Wait for the media to be ready (a slow live site gets four seconds), then play
    const waiting = hasMedia(scene) && ready !== index
    if (waiting) {
      t0 = setTimeout(() => setReady(index), 4000)
      return () => clearTimeout(t0)
    }
    Promise.resolve().then(() => {
      if (gone) return
      setShown(true)
      const last = index === scenes.length - 1
      const only = scenes.length === 1 // a one-scene reel holds its scene instead of fading out
      t1 = setTimeout(() => { if (!only && (!last || loop)) setShown(false) }, sceneDuration(scene) * 1000)
      t2 = setTimeout(() => {
        if (last) cycle.current?.()
        if (!last || loop) { if (!only) setReady(-1); setIndex((i) => (i + 1) % scenes.length); setLap((n) => n + 1) }
      }, sceneDuration(scene) * 1000 + (only ? 0 : FADE))
    })
    return () => { gone = true; clearTimeout(t1); clearTimeout(t2) }
  }, [index, active, scenes, loop, ready, lap])

  const scene = scenes[index]
  // Without captions a full-bleed scene still fills; any other is fitted with a margin
  const layout = captions ? scene.layout ?? 'stack' : scene.layout === 'full' ? 'full' : 'bare'
  const fill = layout === 'full'
  const ink = dark ? 'text-white' : 'text-zinc-950'
  const muted = dark ? 'text-white/60' : 'text-zinc-500'

  return (
    <div ref={box} className="relative w-full overflow-hidden" style={{ aspectRatio: `${W} / ${H}` }}>
      <style dangerouslySetInnerHTML={{ __html: REPLAY_CSS }} />
      <div
        className={`absolute left-0 top-0 origin-top-left font-sans antialiased ${ink}`}
        style={{
          width: W, height: H, transform: `scale(${scale})`,
          background: dark
            ? 'radial-gradient(ellipse 80% 60% at 70% 40%, color-mix(in srgb, var(--accent) 22%, transparent), transparent 70%), #09090b radial-gradient(rgba(255,255,255,.08) 1.2px, transparent 1.2px) 0 0 / 28px 28px'
            : '#fafafa radial-gradient(#e4e4e7 1.2px, transparent 1.2px) 0 0 / 28px 28px',
        }}
      >
        <div key={index} className="absolute inset-0" style={{ opacity: shown ? 1 : 0, transform: `translateY(${shown || fill ? 0 : 18}px)`, transition: `opacity ${FADE}ms ease, transform ${FADE}ms cubic-bezier(.2,.8,.2,1)` }}>
          {layout === 'center' ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-24">
              {scene.kicker && <div className={`mb-6 text-[24px] font-medium tracking-[-0.01em] ${muted}`}>{scene.kicker}</div>}
              <div className="text-[84px] font-semibold leading-[1.02] tracking-[-0.04em]">{scene.title}</div>
              {scene.sub && <div className={`mt-7 text-[28px] tracking-[-0.01em] ${dark ? 'text-white/70' : 'text-zinc-600'}`}>{scene.sub}</div>}
            </div>
          ) : (
            <>
              {hasMedia(scene) && <SceneMedia scene={scene} playing={shown && active} box={BOX[layout]} fill={fill} dark={dark} pageTheme={pageTheme} onReady={() => setReady(index)} />}
              {fill ? (
                captions && (
                  <div className="absolute inset-x-0 bottom-0 px-24 pb-20 pt-48 text-white" style={{ background: 'linear-gradient(to top, rgba(9,9,11,.85), rgba(9,9,11,.4) 55%, transparent)' }}>
                    {scene.kicker && (
                      <div className="mb-3 flex items-center gap-2.5 text-[22px] font-medium tracking-[-0.01em] text-white/70">
                        {dots && <i className={`inline-block h-2 w-2 rounded-full ${scene.live ? 'bg-green-500 shadow-[0_0_0_4px_rgba(34,197,94,.25)]' : 'bg-white'}`} />}
                        {scene.kicker}
                      </div>
                    )}
                    <div className="max-w-[1100px] text-[64px] font-semibold leading-[1.04] tracking-[-0.035em]">{scene.title}</div>
                  </div>
                )
              ) : (
                layout !== 'bare' && <div className="absolute" style={layout === 'side' ? { left: 96, top: '50%', width: 560, transform: 'translateY(-50%)' } : { left: 96, top: 76 }}>
                  {scene.kicker && (
                    <div className={`mb-3 flex items-center gap-2.5 text-[20px] font-medium tracking-[-0.01em] ${muted}`}>
                      {dots && <i className={`inline-block h-2 w-2 rounded-full ${scene.live ? 'bg-green-500 shadow-[0_0_0_4px_rgba(34,197,94,.18)]' : dark ? 'bg-white' : 'bg-zinc-900'}`} />}
                      {scene.kicker}
                    </div>
                  )}
                  <div className={`${layout === 'side' ? 'text-[58px]' : 'text-[54px]'} font-semibold leading-[1.06] tracking-[-0.035em]`}>{scene.title}</div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
