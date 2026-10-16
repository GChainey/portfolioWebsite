'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { REPLAY_CSS } from './replayStyles'
import { Backdrop } from '@/components/ClipFrame'

// The same screen recording twice, side by side: as a replay (rrweb: the page's HTML and CSS and
// every change) and as video. The video is made from the replay itself, every frame rendered
// lossless at 2x and encoded the way the site encoded its videos (2560x1600, 60fps, x264 CRF 16,
// graded for Mac browsers), so the two are the same take, frame for frame, and the video is a
// good encode, not a straw man. Zoom magnifies both at the spot under the cursor; pause freezes
// both on the same frame; the replay's size is what this browser actually downloaded.

const VIDEO = '/replays/compare/determination.mp4'
const REPLAY = '/replays/compare/determination.json'
const VIDEO_BYTES = 9_942_222 // the file, exactly: video is already compressed, so it goes as is
const REPLAY_BYTES = 61_935 // gzipped, if the browser can't say (e.g. it came from the cache)
const W = 1280
const H = 800
const ZOOMS = [1, 2, 4, 8]

type Player = { play: (t?: number) => void; pause: (t?: number) => void; destroy: () => void; on: (e: string, f: () => void) => void }

const size = (bytes: number) => (bytes >= 1e6 ? `${(bytes / 1048576).toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`)

// How many bytes the browser fetched for a URL, compressed, as it came over the network
const downloaded = (url: string) => {
  const entries = performance.getEntriesByName(new URL(url, location.href).href) as PerformanceResourceTiming[]
  const bytes = entries.reduce((n, e) => n + (e.encodedBodySize || 0), 0)
  return bytes || null
}

function Pane({ label, detail, bytes, children }: { label: string; detail: string; bytes: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <div className="overflow-hidden rounded-lg bg-white shadow-2xl ring-1 ring-black/10">
        <div className="flex h-7 items-center gap-1.5 border-b border-[#e4e4e7] bg-[#f4f4f5] px-3" aria-hidden>
          {[0, 1, 2].map((dot) => <span key={dot} className="window-light h-2 w-2 rounded-full" />)}
        </div>
        {children}
      </div>
      <div className="mt-3 flex items-baseline justify-between gap-3 px-1 text-sm">
        <div>
          <span className="font-medium text-foreground">{label}</span> <span className="text-muted">{detail}</span>
        </div>
        <span className="font-medium tabular-nums text-foreground">{bytes}</span>
      </div>
    </div>
  )
}

export function ReplayVsVideo() {
  const box = useRef<HTMLDivElement>(null)
  const root = useRef<HTMLDivElement>(null)
  const video = useRef<HTMLVideoElement>(null)
  const player = useRef<Player | null>(null)
  const [scale, setScale] = useState(0)
  const [zoom, setZoom] = useState(1)
  const [origin, setOrigin] = useState({ x: 50, y: 55 }) // percent, where zoom points
  const [replayBytes, setReplayBytes] = useState<number | null>(null)
  const [paused, setPaused] = useState(false)

  // Fit the 1280x800 recording to the pane
  useEffect(() => {
    const el = box.current
    if (!el) return
    const fit = () => setScale(el.clientWidth / W)
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Load both when near the screen, start them together, loop
  useEffect(() => {
    const el = box.current
    if (!el) return
    let cancelled = false
    const start = async () => {
      if (player.current) return
      const [{ Replayer }, rec] = await Promise.all([import('@rrweb/replay'), fetch(REPLAY).then((r) => r.json())])
      if (cancelled || !root.current) return
      setReplayBytes(downloaded(REPLAY) ?? REPLAY_BYTES)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const r = new Replayer(rec.events as any, { root: root.current, mouseTail: false, showWarning: false, triggerFocus: false }) as unknown as Player
      player.current = r
      r.on('finish', () => { r.play(0); if (video.current) { video.current.currentTime = 0; video.current.play().catch(() => {}) } })
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { r.pause(12000); if (video.current) video.current.currentTime = 12; return }
      r.play(0)
      video.current?.play().catch(() => {})
    }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) start() }, { rootMargin: '200px 0px' })
    io.observe(el)
    return () => { cancelled = true; io.disconnect(); player.current?.destroy(); player.current = null }
  }, [])

  // Freeze both on the video's frame, or carry on from it together
  const toggle = () => {
    const v = video.current, r = player.current
    if (!v || !r) return
    if (paused) { r.play(v.currentTime * 1000); v.play().catch(() => {}) }
    else { v.pause(); r.pause(v.currentTime * 1000) }
    setPaused(!paused)
  }

  // Point the zoom at the spot under the cursor, the same spot in both
  const aim = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    setOrigin({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 })
  }
  const lens = { transform: `scale(${zoom})`, transformOrigin: `${origin.x}% ${origin.y}%`, transition: 'transform 500ms cubic-bezier(.2,.8,.2,1)' }
  const frame = `relative w-full overflow-hidden bg-white ${zoom > 1 ? 'cursor-zoom-in' : ''}`

  const ratio = replayBytes ? Math.round(VIDEO_BYTES / replayBytes) : null
  return (
    <figure className="not-prose my-8">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex rounded-full bg-border/40 p-0.5" role="group" aria-label="Zoom">
          {ZOOMS.map((z) => (
            <button
              key={z}
              onClick={() => setZoom(z)}
              className={`rounded-full px-4 py-1.5 text-sm tabular-nums transition-all ${zoom === z ? 'bg-foreground font-medium text-background' : 'text-muted hover:text-foreground'}`}
            >
              {z}×
            </button>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <p className="text-sm text-muted">{zoom > 1 ? 'Move over either one to choose where to look' : 'Zoom in to compare the text'}</p>
          <button onClick={toggle} className="rounded-full border border-border px-4 py-1.5 text-sm text-muted transition-colors hover:border-accent/50 hover:text-accent">
            {paused ? 'Play' : 'Pause'}
          </button>
        </div>
      </div>

      <Backdrop className="grid gap-6 p-4 sm:p-8 md:grid-cols-2">
        <Pane label="Video" detail="MP4, 2560×1600, 60fps" bytes={size(VIDEO_BYTES)}>
          <div className={frame} style={{ aspectRatio: `${W} / ${H}` }} onMouseMove={aim}>
            <video ref={video} src={VIDEO} muted playsInline preload="auto" className="block h-full w-full" style={lens} aria-label="The determination letter, as video" />
          </div>
        </Pane>
        <Pane label="Replay" detail="HTML, the real page" bytes={replayBytes ? size(replayBytes) : '…'}>
          <div ref={box} className={frame} style={{ aspectRatio: `${W} / ${H}` }} onMouseMove={aim}>
            <style dangerouslySetInnerHTML={{ __html: REPLAY_CSS }} />
            <div className="absolute inset-0" style={lens}>
              <div ref={root} className="rr-stage absolute left-0 top-0 origin-top-left" style={{ width: W, height: H, transform: `scale(${scale})`, opacity: scale ? 1 : 0 }} />
            </div>
          </div>
        </Pane>
      </Backdrop>

      <figcaption className="mt-3 text-center text-sm text-muted">
        The same 21-second take: the video is made from the replay, frame for frame.{ratio ? ` The replay is ${ratio}× smaller to download.` : ''}
      </figcaption>
    </figure>
  )
}
