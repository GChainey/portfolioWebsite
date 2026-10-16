'use client'

import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { REPLAY_CSS } from './replayStyles'
import { Subtitle, type Note } from './Subtitle'

// A sizzle reel made of replays instead of video: scenes cut one after another, each a stretch
// of a recording (or a crop of one), on a dotted canvas. Everything on screen is drawn by the
// page, so it is as sharp as the site itself. It is laid out on a 1600x1000 stage and scaled
// to fit.
//
// Each scene is a title on the left, centred on the product, the product large on the right,
// and a line at the bottom centre that narrates what is happening, like a subtitle. The last
// scene, with no recording, closes on a title and a line under it.

type Region = { x: number; y: number; width: number; height: number }

export interface ReelScene {
  src?: string // /replays/... JSON; leave out for the closing scene
  region?: Region // the part of the recording to show
  from?: number // seconds into the recording
  to?: number
  rate?: number // playback speed
  hold?: number // seconds, for the closing scene
  title: string
  // What is happening, as a subtitle. Several lines take turns: each starts `at` seconds into
  // the scene.
  notes?: Note[]
  // A camera: at `at` seconds into the scene, ease the view to `region` (in recording pixels,
  // inside the scene's region), and optionally swipe a highlighter over `mark` once it arrives. The card keeps the
  // shape of the scene's region; only what is inside it zooms.
  camera?: { at: number; region: Region; mark?: Region }[]
  sub?: string // the closing scene's line under the title
}

type Recording = { meta: { width: number; height: number; mouse?: boolean }; events: unknown[] }
type Player = { play: (t?: number) => void; pause: (t?: number) => void; destroy: () => void; setConfig: (c: { speed: number }) => void }

const W = 1600
const H = 1000
const FADE = 450
const MEDIA = { x: 560, y: 48, w: 992, h: 790 } // everything right of the title
const LINGER = 1.2 // seconds to hold each recording's last frame, so the last line can be read

const cache = new Map<string, Promise<Recording>>()
const load = (src: string) => {
  if (!cache.has(src)) cache.set(src, fetch(src).then((r) => r.json()))
  return cache.get(src)!
}
const duration = (s: ReelScene) => (s.src ? ((s.to ?? 0) - (s.from ?? 0)) / (s.rate ?? 1) + LINGER : s.hold ?? 3)

// Rises and fades in after `delay` seconds, once the scene is up
const rise = (shown: boolean, delay: number): CSSProperties => ({
  opacity: shown ? 1 : 0, transform: `translateY(${shown ? 0 : 14}px)`,
  transition: `opacity 600ms ease ${delay}s, transform 700ms cubic-bezier(.2,.8,.2,1) ${delay}s`,
})

// One scene's recording, cropped to its region and fitted to the media box
function SceneMedia({ scene, playing }: { scene: ReelScene; playing: boolean }) {
  const root = useRef<HTMLDivElement>(null)
  const player = useRef<Player | null>(null)
  const [meta, setMeta] = useState<Recording['meta'] | null>(null)

  useEffect(() => {
    let gone = false
    ;(async () => {
      const [{ Replayer }, rec] = await Promise.all([import('@rrweb/replay'), load(scene.src!)])
      if (gone || !root.current) return
      setMeta(rec.meta)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const r = new Replayer(rec.events as any, { root: root.current, mouseTail: false, showWarning: false, triggerFocus: false }) as unknown as Player
      r.setConfig({ speed: scene.rate ?? 1 })
      r.pause((scene.from ?? 0) * 1000)
      player.current = r
    })()
    return () => { gone = true; player.current?.destroy(); player.current = null }
  }, [scene])

  // Play from `from`, and hold on `to` while the scene lingers
  useEffect(() => {
    const r = player.current
    if (!r) return
    const from = (scene.from ?? 0) * 1000, to = (scene.to ?? 0) * 1000
    if (!playing) { r.pause(from); return }
    r.play(from)
    const stop = setTimeout(() => r.pause(to), (to - from) / (scene.rate ?? 1))
    return () => clearTimeout(stop)
  }, [playing, meta, scene])

  // Where the camera is: the whole region until a camera move says otherwise
  const [shot, setShot] = useState<{ region?: Region; mark?: Region }>({})
  useEffect(() => {
    setShot({})
    if (!playing || !scene.camera) return
    const timers = scene.camera.map((c) => setTimeout(() => setShot({ region: c.region, mark: c.mark }), c.at * 1000))
    return () => timers.forEach(clearTimeout)
  }, [playing, scene])

  const region = scene.region ?? (meta ? { x: 0, y: 0, width: meta.width, height: meta.height } : { x: 0, y: 0, width: 1280, height: 800 })
  const fit = Math.min(MEDIA.w / region.width, MEDIA.h / region.height)
  const w = region.width * fit, h = region.height * fit
  // Fit the view into the card, centred
  const view = shot.region ?? region
  const k = Math.min(w / view.width, h / view.height)
  const ox = (w - view.width * k) / 2 - view.x * k, oy = (h - view.height * k) / 2 - view.y * k
  const move = 'cubic-bezier(.65,0,.35,1)'
  return (
    <div
      className="absolute overflow-hidden rounded-2xl bg-white"
      style={{
        left: MEDIA.x + (MEDIA.w - w) / 2, top: MEDIA.y + (MEDIA.h - h) / 2, width: w, height: h,
        boxShadow: '0 0 0 1px rgba(9,9,11,.08), 0 2px 4px rgba(9,9,11,.04), 0 40px 80px -24px rgba(9,9,11,.28)',
      }}
    >
      <div
        ref={root}
        className={`rr-stage ${meta?.mouse ? 'rr-mouse' : ''} absolute left-0 top-0 origin-top-left`}
        style={{ width: meta?.width ?? 1280, height: meta?.height ?? 800, transform: `translate(${ox}px, ${oy}px) scale(${k})`, transition: scene.camera ? `transform 1100ms ${move}` : undefined }}
      />
      {/* A highlighter swipe: the accent, multiplied over the text like ink, slightly uneven */}
      {shot.mark && (
        <i
          key={`${shot.mark.x},${shot.mark.y}`}
          className="pointer-events-none absolute origin-left mix-blend-multiply"
          style={{
            left: ox + (shot.mark.x - 3) * k, top: oy + (shot.mark.y - 1) * k, width: (shot.mark.width + 6) * k, height: (shot.mark.height + 2) * k,
            background: 'color-mix(in srgb, var(--accent) 50%, #fff)', borderRadius: '3px 9px 4px 10px / 7px 4px 9px 5px',
            animation: `reel-mark 550ms cubic-bezier(.3,.7,.4,1) 1150ms both`,
          }}
        />
      )}
    </div>
  )
}

// The subtitle: the scene's lines in turn, on timers from when the scene comes up
function Notes({ notes, shown }: { notes: Note[]; shown: boolean }) {
  const [line, setLine] = useState(0)
  useEffect(() => {
    if (!shown) return
    setLine(0)
    const timers = notes.map((n, i) => setTimeout(() => setLine(i), n.at * 1000))
    return () => timers.forEach(clearTimeout)
  }, [notes, shown])

  return (
    <div className="absolute inset-x-0 flex justify-center" style={{ top: 878 }}>
      <Subtitle notes={notes} line={line} className="px-9 py-4 text-[30px]" style={rise(shown, 0.5)} />
    </div>
  )
}

export function ReplayReel({ scenes }: { scenes: ReelScene[] }) {
  const box = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0)
  const [index, setIndex] = useState(0)
  const [shown, setShown] = useState(false) // the current scene has faded in
  const [visible, setVisible] = useState(false)

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
    if (next.src) load(next.src)
  }, [index, scenes])

  // Fade in, play for the scene's length, fade out, next. With reduced motion, the first scene
  // stays up and still.
  useEffect(() => {
    if (!visible) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setShown(true); return }
    const scene = scenes[index]
    const ready = scene.src ? load(scene.src) : Promise.resolve(null)
    let t1: ReturnType<typeof setTimeout>, t2: ReturnType<typeof setTimeout>
    let gone = false
    ready.then(() => {
      if (gone) return
      setShown(true)
      t1 = setTimeout(() => setShown(false), duration(scene) * 1000)
      t2 = setTimeout(() => setIndex((i) => (i + 1) % scenes.length), duration(scene) * 1000 + FADE)
    })
    return () => { gone = true; clearTimeout(t1); clearTimeout(t2) }
  }, [index, visible, scenes])

  const scene = scenes[index]
  return (
    <div ref={box} className="relative w-full overflow-hidden" style={{ aspectRatio: `${W} / ${H}` }}>
      <style dangerouslySetInnerHTML={{ __html: REPLAY_CSS + '@keyframes reel-mark { from { transform: scaleX(0) rotate(-.6deg) } to { transform: scaleX(1) rotate(-.6deg) } }' }} />
      <div
        className="absolute left-0 top-0 origin-top-left font-sans text-zinc-950 antialiased"
        style={{
          width: W, height: H, transform: `scale(${scale})`,
          background: '#fafafa radial-gradient(#e4e4e7 1.2px, transparent 1.2px) 0 0 / 28px 28px',
        }}
      >
        <div key={index} className="absolute inset-0" style={{ opacity: shown ? 1 : 0, transform: `translateY(${shown ? 0 : 18}px)`, transition: `opacity ${FADE}ms ease, transform ${FADE}ms cubic-bezier(.2,.8,.2,1)` }}>
          {scene.src ? (
            <>
              {/* Centred on the product, which is centred in its box */}
              <div className="absolute -translate-y-1/2 text-[66px] font-semibold leading-[1.02] tracking-[-0.04em] [text-wrap:balance]" style={{ left: 72, width: 440, top: MEDIA.y + MEDIA.h / 2 }}>{scene.title}</div>
              <SceneMedia scene={scene} playing={shown && visible} />
              {scene.notes && <Notes notes={scene.notes} shown={shown} />}
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center px-40 text-center">
              <div className="text-[88px] font-semibold leading-[1.02] tracking-[-0.04em] [text-wrap:balance]" style={rise(shown, 0)}>{scene.title}</div>
              {scene.sub && <div className="mt-8 max-w-[1100px] text-[38px] leading-[1.3] tracking-[-0.015em] text-zinc-500" style={rise(shown, 0.3)}>{scene.sub}</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
