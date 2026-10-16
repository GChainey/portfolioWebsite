'use client'

import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { REPLAY_CSS } from './replayStyles'
import { Backdrop } from '@/components/ClipFrame'

// The same screen recording as a replay (rrweb: the page's HTML and CSS and every change) and as
// video, compared. Each video is made from its replay, every frame rendered lossless at 2x and
// encoded the way the site encoded its videos (60fps, x264 CRF 16, graded for Mac browsers), so the
// two are the same take, frame for frame, and the video is a good encode, not a straw man.
//
// Three ways to look: one at a time (the default: large, or full screen, where the difference
// shows most), a scrubber (one frame, video left of the divider, replay right), or side by side. Zoom magnifies both at the spot under the cursor
// and pause freezes both on the same frame. One example runs a camera, the reel's zoom and
// highlighter, over both. The sizes are the video file and what this browser downloaded for the
// replay.

type Region = { x: number; y: number; width: number; height: number }
type Shot = { at: number; region?: Region; mark?: Region } // recording seconds; no region: the whole view
type Example = { id: string; name: string; note: string; replay: string; video: string; width: number; height: number; region?: Region; camera?: Shot[] }

const EXAMPLES: Example[] = [
  { id: 'letter', name: 'A letter', note: 'Text, scrolling: the screen changes all the time, and video pays for every frame of it.', replay: '/replays/compare/determination.json', video: '/replays/compare/determination.mp4', width: 1280, height: 800 },
  {
    id: 'camera', name: 'Zoom and highlight', note: 'The camera moves in on the issue being ticked, then on the line it adds to the letter. Watch the video blur as it gets close.', replay: '/replays/compare/rfi.json', video: '/replays/compare/rfi.mp4', width: 1440, height: 900,
    region: { x: 216, y: 153, width: 1080, height: 644 },
    camera: [
      { at: 0 },
      { at: 8.6, region: { x: 912, y: 466, width: 372, height: 222 } },
      { at: 10.7, region: { x: 216.2, y: 163.6, width: 398, height: 237.2 }, mark: { x: 250, y: 274.5, width: 330.4, height: 15.3 } },
      { at: 13.4 },
    ],
  },
  { id: 'chat', name: 'AI chat', note: 'Typing, and a live model\u2019s answer. Mostly still, so the video stays small, and the replay is smaller still.', replay: '/replays/compare/chat.json', video: '/replays/compare/chat.mp4', width: 1280, height: 800 },
  { id: 'configurator', name: 'A busy screen', note: 'A two-panel app with a lot on screen at once.', replay: '/replays/compare/configurator.json', video: '/replays/compare/configurator.mp4', width: 1600, height: 1000 },
]
const ZOOMS = [1, 2, 4, 8]
const MODES = [
  { id: 'single', label: 'One at a time' },
  { id: 'scrub', label: 'Scrubber' },
  { id: 'side', label: 'Side by side' },
] as const
type Mode = (typeof MODES)[number]['id']
type Kind = 'video' | 'replay'

type Player = { play: (t?: number) => void; pause: (t?: number) => void; destroy: () => void; getCurrentTime: () => number }

const size = (bytes: number | null) => (bytes == null ? '…' : bytes >= 1e6 ? `${(bytes / 1048576).toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`)
const replays = new Map<string, Promise<{ events: unknown[]; meta: { mouse?: boolean } }>>()
const loadReplay = (src: string) => {
  if (!replays.has(src)) replays.set(src, fetch(src).then((r) => r.json()))
  return replays.get(src)!
}

// How many bytes the browser fetched for a URL, compressed, as it came over the network
const downloaded = (url: string) => {
  const entries = performance.getEntriesByName(new URL(url, location.href).href) as PerformanceResourceTiming[]
  return entries.reduce((n, e) => n + (e.encodedBodySize || 0), 0) || null
}

// Segmented control, in the site's style
function Segments<T extends string | number>({ items, value, onChange, label }: { items: { id: T; label: string }[]; value: T; onChange: (v: T) => void; label: string }) {
  return (
    <div className="flex rounded-full bg-border/40 p-0.5" role="group" aria-label={label}>
      {items.map((it) => (
        <button
          key={String(it.id)}
          onClick={() => onChange(it.id)}
          className={`rounded-full px-3.5 py-1.5 text-sm tabular-nums transition-all ${value === it.id ? 'bg-foreground font-medium text-background' : 'text-muted hover:text-foreground'}`}
        >
          {it.label}
        </button>
      ))}
    </div>
  )
}

// A window, as the site draws them, around one or both layers
// `bar` labels the title bar: what is showing, and its size
function Window({ aspect, bar, children, style, onMouseMove, frameRef }: { aspect: string; bar?: ReactNode; children: ReactNode; style?: CSSProperties; onMouseMove?: (e: React.MouseEvent<HTMLDivElement>) => void; frameRef?: React.Ref<HTMLDivElement> }) {
  return (
    <div className="overflow-hidden rounded-lg bg-white shadow-2xl ring-1 ring-black/10" style={style}>
      <div className="relative flex h-8 items-center gap-1.5 border-b border-[#e4e4e7] bg-[#f4f4f5] px-3">
        {[0, 1, 2].map((dot) => <span key={dot} className="window-light h-2.5 w-2.5 rounded-full" aria-hidden />)}
        {bar && <div className="absolute inset-x-16 flex items-center justify-center gap-2 text-xs text-zinc-600">{bar}</div>}
      </div>
      <div ref={frameRef} className="relative w-full select-none overflow-hidden bg-white" style={{ aspectRatio: aspect }} onMouseMove={onMouseMove}>
        {children}
      </div>
    </div>
  )
}

// Every example, one after another down the page; or one, by id, for a post to embed
export function ReplayVsVideo({ example }: { example?: string }) {
  const one = EXAMPLES.find((e) => e.id === example)
  if (one) return <Comparison example={one} />
  return (
    <div>
      {EXAMPLES.map((e) => (
        <section key={e.id} className="border-t border-border pb-8 pt-14">
          <h2 className="text-3xl font-medium text-foreground">{e.name}</h2>
          <p className="mt-2 max-w-2xl text-lg text-muted">{e.note}</p>
          <Comparison example={e} />
        </section>
      ))}
    </div>
  )
}

// How much each one downloads, as bars to the same scale
function Sizes({ video, replay }: { video: number | null; replay: number | null }) {
  const ratio = video && replay ? Math.round(video / replay) : null
  const bar = (n: number | null) => (video && n ? `max(3px, ${(n / video) * 100}%)` : '0')
  return (
    <div className="mb-6 grid items-center gap-x-10 gap-y-4 sm:grid-cols-[auto_1fr]">
      <div>
        <div className="text-6xl font-semibold leading-none tracking-[-0.04em] text-foreground tabular-nums">{ratio ? `${ratio}×` : '…'}</div>
        <div className="mt-2 text-sm text-muted">smaller as a replay</div>
      </div>
      <div className="space-y-3">
        {([['Video', video, 'color-mix(in srgb, var(--foreground) 28%, transparent)'], ['Replay', replay, 'var(--accent)']] as const).map(([label, n, tone]) => (
          <div key={label} className="grid grid-cols-[4.5rem_1fr_5rem] items-center gap-3 text-sm">
            <span className="text-muted">{label}</span>
            <div className="h-3 overflow-hidden rounded-full bg-border/40">
              <div className="h-full rounded-full transition-[width] duration-700" style={{ width: bar(n), background: tone }} />
            </div>
            <span className="text-right text-lg font-medium tabular-nums text-foreground">{size(n)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function Comparison({ example }: { example: Example }) {
  const [mode, setMode] = useState<Mode>('single')
  const [show, setShow] = useState<Kind>('replay') // one at a time
  const [zoom, setZoom] = useState(1)
  const [origin, setOrigin] = useState({ x: 50, y: 50 }) // percent of the frame, where zoom points
  const [split, setSplit] = useState(50) // the scrubber's divider, percent from the left
  const [paused, setPaused] = useState(false)
  const [time, setTime] = useState(0) // seconds, for the camera
  const [bytes, setBytes] = useState<{ video: number | null; replay: number | null }>({ video: null, replay: null })
  const [full, setFull] = useState(false)
  const [near, setNear] = useState(false) // nothing loads until it scrolls near

  const figure = useRef<HTMLElement>(null)
  const video = useRef<HTMLVideoElement | null>(null)
  const player = useRef<Player | null>(null)
  const clock = useRef({ t: 0, paused: false }) // survives a change of mode, which remounts the layers
  const visible = useRef(false)

  // The video is the clock; the replay follows it
  const syncReplay = useCallback(() => {
    const r = player.current, v = video.current
    if (!r || !v) return
    if (clock.current.paused || !visible.current) r.pause(v.currentTime * 1000)
    else if (Math.abs(r.getCurrentTime() - v.currentTime * 1000) > 50) r.play(v.currentTime * 1000)
  }, [])

  useEffect(() => {
    const id = setInterval(() => {
      const v = video.current
      if (!v) return
      clock.current.t = v.currentTime
      setTime(v.currentTime)
      syncReplay()
    }, 100)
    return () => clearInterval(id)
  }, [syncReplay])

  // Play only while on screen
  useEffect(() => {
    const el = figure.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => {
      visible.current = e.isIntersecting
      if (e.isIntersecting) setNear(true)
      const v = video.current
      if (!v) return
      if (e.isIntersecting && !clock.current.paused) v.play().catch(() => {})
      else v.pause()
      syncReplay()
    }, { rootMargin: '300px 0px' })
    io.observe(el)
    return () => io.disconnect()
  }, [syncReplay])

  // Sizes: the video file, and the replay as downloaded
  useEffect(() => {
    if (!near) return
    setBytes({ video: null, replay: null })
    let gone = false
    fetch(example.video, { method: 'HEAD' }).then((r) => { if (!gone) setBytes((b) => ({ ...b, video: Number(r.headers.get('content-length')) || null })) }).catch(() => {})
    loadReplay(example.replay).then(() => { if (!gone) setBytes((b) => ({ ...b, replay: downloaded(example.replay) })) })
    return () => { gone = true }
  }, [example, near])

  useEffect(() => {
    const on = () => setFull(document.fullscreenElement === figure.current)
    document.addEventListener('fullscreenchange', on)
    return () => document.removeEventListener('fullscreenchange', on)
  }, [])

  const toggle = () => {
    const v = video.current
    clock.current.paused = !paused
    setPaused(!paused)
    if (v) { if (paused) v.play().catch(() => {}); else v.pause() }
    syncReplay()
  }

  const aim = (e: React.MouseEvent<HTMLDivElement>) => {
    if (zoom === 1) return
    const r = e.currentTarget.getBoundingClientRect()
    setOrigin({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 })
  }

  // The camera's shot at this moment
  const shot = example.camera?.reduce<Shot | undefined>((on, s) => (s.at <= time ? s : on), undefined)
  const base = example.region ?? { x: 0, y: 0, width: example.width, height: example.height }
  const aspect = `${base.width} / ${base.height}`

  // Stable, so React doesn't re-run them on every tick of the clock
  const onVideo = useCallback((v: HTMLVideoElement | null) => {
    video.current = v
    if (!v) return
    v.currentTime = clock.current.t
    if (!clock.current.paused && visible.current) v.play().catch(() => {})
  }, [])
  const onPlayer = useCallback((p: Player | null) => { player.current = p; syncReplay() }, [syncReplay])
  const onEnded = useCallback(() => {
    const v = video.current
    if (v) { v.currentTime = 0; if (!clock.current.paused) v.play().catch(() => {}) }
    syncReplay()
  }, [syncReplay])

  const layer = (kind: Kind, style?: CSSProperties) => near && (
    <Layer
      key={`${example.id}-${kind}`}
      kind={kind} example={example} base={base} view={shot?.region} mark={shot?.mark}
      zoom={zoom} origin={origin} style={style} onVideo={onVideo} onPlayer={onPlayer} onEnded={onEnded}
    />
  )

  const label = (kind: Kind) => <><span className="font-medium text-zinc-900">{kind === 'video' ? 'Video' : 'Replay'}</span><span className="tabular-nums">{size(bytes[kind])}</span></>
  // As big as the screen allows, leaving room for the controls (and on the page, the sizes)
  const wide = { width: `min(100%, calc((100vh - ${full ? 9 : 13}rem) * ${base.width / base.height}))`, margin: '0 auto' }

  return (
    <figure ref={figure} className={`not-prose mt-8 ${full ? 'flex flex-col justify-center overflow-auto bg-background p-6' : ''}`}>
      <Sizes video={bytes.video} replay={bytes.replay} />
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <Segments label="View" items={MODES.map((m) => ({ id: m.id, label: m.label }))} value={mode} onChange={setMode} />
          {mode === 'single' && <Segments label="Show" items={[{ id: 'video' as Kind, label: 'Video' }, { id: 'replay' as Kind, label: 'Replay' }]} value={show} onChange={setShow} />}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Segments label="Zoom" items={ZOOMS.map((z) => ({ id: z, label: `${z}×` }))} value={zoom} onChange={setZoom} />
          <button onClick={toggle} className="rounded-full border border-border px-4 py-1.5 text-sm text-muted transition-colors hover:border-accent/50 hover:text-accent">{paused ? 'Play' : 'Pause'}</button>
          <button
            onClick={() => (full ? document.exitFullscreen() : figure.current?.requestFullscreen())}
            className="rounded-full border border-border px-4 py-1.5 text-sm text-muted transition-colors hover:border-accent/50 hover:text-accent"
          >
            {full ? 'Exit full screen' : 'Full screen'}
          </button>
        </div>
      </div>

      <Backdrop className="p-4 sm:p-8">
        {mode === 'side' ? (
          <div className="grid gap-6 md:grid-cols-2">
            {(['video', 'replay'] as Kind[]).map((kind) => (
              <div key={kind} className="min-w-0">
                <Window aspect={aspect} bar={label(kind)} onMouseMove={aim}>{layer(kind)}</Window>
              </div>
            ))}
          </div>
        ) : mode === 'scrub' ? (
          <Scrubber aspect={aspect} bar={<>{label('video')}<span className="mx-2 text-zinc-400">← →</span>{label('replay')}</>} split={split} onSplit={setSplit} onMouseMove={aim} style={wide}>
            {layer('video')}
            {layer('replay', { clipPath: `inset(0 0 0 ${split}%)` })}
          </Scrubber>
        ) : (
          <Window aspect={aspect} bar={label(show)} onMouseMove={aim} style={wide}>
            {layer('video', { visibility: show === 'video' ? 'visible' : 'hidden' })}
            {layer('replay', { visibility: show === 'replay' ? 'visible' : 'hidden' })}
          </Window>
        )}
      </Backdrop>

      <figcaption className="mt-3 text-center text-sm text-muted">
        The same take: the video is made from the replay, frame for frame, and encoded at 2x and 60fps.
      </figcaption>
    </figure>
  )
}

// One recording, as video or as replay, through the camera and the zoom
function Layer({ kind, example, base, view, mark, zoom, origin, style, onVideo, onPlayer, onEnded }: {
  kind: Kind; example: Example; base: Region; view?: Region; mark?: Region; zoom: number; origin: { x: number; y: number }; style?: CSSProperties
  onVideo: (v: HTMLVideoElement | null) => void; onPlayer: (p: Player | null) => void; onEnded: () => void
}) {
  const box = useRef<HTMLDivElement>(null)
  const root = useRef<HTMLDivElement>(null)
  const [w, setW] = useState(0)

  useEffect(() => {
    const el = box.current
    if (!el) return
    const fit = () => setW(el.clientWidth)
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    if (kind !== 'replay') return
    let gone = false, r: Player | null = null
    loadReplay(example.replay).then(async (rec) => {
      const { Replayer } = await import('@rrweb/replay')
      if (gone || !root.current) return
      root.current.classList.toggle('rr-mouse', !!rec.meta.mouse) // a recorded mouse track, drawn by the site
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      r = new Replayer(rec.events as any, { root: root.current, mouseTail: false, showWarning: false, triggerFocus: false }) as unknown as Player
      onPlayer(r)
    })
    return () => { gone = true; r?.destroy(); onPlayer(null) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind, example])

  // The camera: fit the view into the frame, centred
  const h = w * (base.height / base.width)
  const v = view ?? base
  const k = w ? Math.min(w / v.width, h / v.height) : 0
  const ox = (w - v.width * k) / 2 - v.x * k, oy = (h - v.height * k) / 2 - v.y * k
  const camera = example.camera ? 'transform 1100ms cubic-bezier(.65,0,.35,1)' : undefined

  return (
    <div ref={box} className="absolute inset-0" style={style}>
      {kind === 'replay' && <style dangerouslySetInnerHTML={{ __html: REPLAY_CSS }} />}
      <div className="absolute inset-0" style={{ transform: `scale(${zoom})`, transformOrigin: `${origin.x}% ${origin.y}%`, transition: 'transform 500ms cubic-bezier(.2,.8,.2,1)' }}>
        <div className="absolute left-0 top-0 origin-top-left" style={{ width: example.width, height: example.height, transform: `translate(${ox}px, ${oy}px) scale(${k})`, transition: camera, opacity: k ? 1 : 0 }}>
          {kind === 'video' ? (
            <video ref={onVideo} src={example.video} muted playsInline preload="auto" onEnded={onEnded} className="block h-full w-full" aria-label={`${example.name}, as video`} />
          ) : (
            <div ref={root} className="rr-stage absolute left-0 top-0" style={{ width: example.width, height: example.height }} />
          )}
        </div>
        {mark && view && (
          <i
            key={`${mark.x},${mark.y}`}
            className="pointer-events-none absolute origin-left mix-blend-multiply"
            style={{
              left: ox + (mark.x - 3) * k, top: oy + (mark.y - 1) * k, width: (mark.width + 6) * k, height: (mark.height + 2) * k,
              background: 'color-mix(in srgb, var(--accent) 50%, #fff)', borderRadius: '3px 9px 4px 10px / 7px 4px 9px 5px',
              animation: 'rvv-mark 550ms cubic-bezier(.3,.7,.4,1) 1150ms both',
            }}
          />
        )}
      </div>
      <style>{'@keyframes rvv-mark { from { transform: scaleX(0) rotate(-.6deg) } to { transform: scaleX(1) rotate(-.6deg) } }'}</style>
    </div>
  )
}

// One frame with a divider: drag it, or use the arrow keys
function Scrubber({ aspect, bar, split, onSplit, onMouseMove, style, children }: {
  aspect: string; bar?: ReactNode; split: number; onSplit: (v: number) => void; onMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void; style?: CSSProperties; children: ReactNode
}) {
  const frame = useRef<HTMLDivElement>(null)
  const drag = (e: React.PointerEvent) => {
    const el = frame.current
    if (!el) return
    const r = el.getBoundingClientRect()
    onSplit(Math.min(100, Math.max(0, ((e.clientX - r.left) / r.width) * 100)))
  }
  return (
    <Window aspect={aspect} bar={bar} onMouseMove={onMouseMove} style={style} frameRef={frame}>
      {children}
      <div className="absolute inset-y-0 z-20 w-0" style={{ left: `${split}%` }}>
        <div className="absolute inset-y-0 -left-px w-0.5 bg-white shadow-[0_0_0_1px_rgba(0,0,0,.15)]" />
        <button
          role="slider" aria-label="Divider between video and replay" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(split)}
          onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); drag(e) }}
          onPointerMove={(e) => { if (e.currentTarget.hasPointerCapture(e.pointerId)) drag(e) }}
          onKeyDown={(e) => { if (e.key === 'ArrowLeft') onSplit(Math.max(0, split - 5)); if (e.key === 'ArrowRight') onSplit(Math.min(100, split + 5)) }}
          className="absolute top-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize touch-none items-center justify-center rounded-full bg-white text-zinc-600 shadow-lg ring-1 ring-black/10"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="m9 6-6 6 6 6M15 6l6 6-6 6" /></svg>
        </button>
      </div>
    </Window>
  )
}
