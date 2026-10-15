'use client'

import { useEffect, useRef, useState } from 'react'
import { REPLAY_CSS } from './replayStyles'

// A sizzle reel made of replays instead of video: scenes cut one after another, each a stretch
// of a recording (or a crop of one) with a caption, on a dotted canvas. Everything on screen is
// drawn by the page, so it is as sharp as the site itself. It is laid out on a 1600x1000 stage
// and scaled to fit.

type Region = { x: number; y: number; width: number; height: number }

export interface ReelScene {
  src?: string // /replays/... JSON; leave out for a text-only scene
  region?: Region // the part of the recording to show
  from?: number // seconds into the recording
  to?: number
  rate?: number // playback speed
  hold?: number // seconds, for a text-only scene
  layout?: 'stack' | 'side' | 'center'
  kicker?: string
  title: string
  sub?: string
  live?: boolean // a green dot on the kicker: the model is real
}

type Recording = { meta: { width: number; height: number; mouse?: boolean }; events: unknown[] }
type Player = { play: (t?: number) => void; pause: (t?: number) => void; destroy: () => void; setConfig: (c: { speed: number }) => void }

const W = 1600
const H = 1000
const FADE = 450
const BOX = { stack: { x: 96, y: 250, w: 1408, h: 690 }, side: { x: 720, y: 70, w: 800, h: 860 } }

const cache = new Map<string, Promise<Recording>>()
const load = (src: string) => {
  if (!cache.has(src)) cache.set(src, fetch(src).then((r) => r.json()))
  return cache.get(src)!
}
const duration = (s: ReelScene) => (s.src ? ((s.to ?? 0) - (s.from ?? 0)) / (s.rate ?? 1) : s.hold ?? 3)

// One scene's recording, cropped to its region and fitted to its box
function SceneMedia({ scene, playing, box }: { scene: ReelScene; playing: boolean; box: { x: number; y: number; w: number; h: number } }) {
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

  useEffect(() => {
    const r = player.current
    if (!r) return
    if (playing) r.play((scene.from ?? 0) * 1000)
    else r.pause((scene.from ?? 0) * 1000)
  }, [playing, meta, scene.from])

  const region = scene.region ?? (meta ? { x: 0, y: 0, width: meta.width, height: meta.height } : { x: 0, y: 0, width: 1280, height: 800 })
  const k = Math.min(box.w / region.width, box.h / region.height)
  const w = region.width * k, h = region.height * k
  return (
    <div
      className="absolute overflow-hidden rounded-2xl bg-white"
      style={{
        left: box.x + (box.w - w) / 2, top: box.y + (box.h - h) / 2, width: w, height: h,
        boxShadow: '0 0 0 1px rgba(9,9,11,.08), 0 2px 4px rgba(9,9,11,.04), 0 40px 80px -24px rgba(9,9,11,.28)',
      }}
    >
      <div
        ref={root}
        className={`rr-stage ${meta?.mouse ? 'rr-mouse' : ''} absolute left-0 top-0 origin-top-left`}
        style={{ width: meta?.width ?? 1280, height: meta?.height ?? 800, transform: `scale(${k}) translate(${-region.x}px, ${-region.y}px)` }}
      />
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

  // Fade in, play for the scene's length, fade out, next
  useEffect(() => {
    if (!visible || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
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
  const layout = scene.layout ?? 'stack'
  return (
    <div ref={box} className="relative w-full overflow-hidden" style={{ aspectRatio: `${W} / ${H}` }}>
      <style>{REPLAY_CSS}</style>
      <div
        className="absolute left-0 top-0 origin-top-left font-sans text-zinc-950 antialiased"
        style={{
          width: W, height: H, transform: `scale(${scale})`,
          background: '#fafafa radial-gradient(#e4e4e7 1.2px, transparent 1.2px) 0 0 / 28px 28px',
        }}
      >
        <div key={index} className="absolute inset-0" style={{ opacity: shown ? 1 : 0, transform: `translateY(${shown ? 0 : 18}px)`, transition: `opacity ${FADE}ms ease, transform ${FADE}ms cubic-bezier(.2,.8,.2,1)` }}>
          {layout === 'center' ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <div className="text-[72px] font-semibold leading-none tracking-[-0.035em]">{scene.title}</div>
              {scene.sub && <div className="mt-6 text-[26px] tracking-[-0.01em] text-zinc-600">{scene.sub}</div>}
            </div>
          ) : (
            <>
              <div className="absolute" style={layout === 'side' ? { left: 96, top: '50%', width: 560, transform: 'translateY(-50%)' } : { left: 96, top: 76 }}>
                {scene.kicker && (
                  <div className="mb-3 flex items-center gap-2.5 text-[20px] font-medium tracking-[-0.01em] text-zinc-500">
                    <i className={`inline-block h-2 w-2 rounded-full ${scene.live ? 'bg-green-500 shadow-[0_0_0_4px_rgba(34,197,94,.18)]' : 'bg-zinc-900'}`} />
                    {scene.kicker}
                  </div>
                )}
                <div className={`${layout === 'side' ? 'text-[58px]' : 'text-[54px]'} font-semibold leading-[1.06] tracking-[-0.035em]`}>{scene.title}</div>
              </div>
              {scene.src && <SceneMedia scene={scene} playing={shown && visible} box={BOX[layout]} />}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
