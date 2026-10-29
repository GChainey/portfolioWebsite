'use client'

import { useEffect, useRef, useState } from 'react'
import { REPLAY_CSS } from './replayStyles'
import { Subtitle, lineAt, type Note } from './Subtitle'
import { MediaFrame, Backdrop } from '@/components/ClipFrame'

// A recording of a prototype that plays as the real UI, not as video. The recording is rrweb
// data (the page's DOM, CSS and every change, made by .context/replay-tools), and the replayer
// rebuilds it in a sandboxed iframe: text is drawn by the browser, so it is sharp at any size
// and its colours are exact. No app code ships, only the rendered page.
//
// It loads when it comes near the screen, loops, and pauses off screen. People who prefer less
// motion see its last frame. With a title, each loop says what it shows first, the way Cursor's
// feature reels do: the title alone on white, which lifts away to the clip.

type Region = { x: number; y: number; width: number; height: number }

interface RecordingReplayProps {
  src: string // /replays/... JSON from the recorder
  // Spotlight: show only this part of the screen, as a card on the backdrop, with no window
  region?: Region
  aspectRatio?: string
  // Narration, as a subtitle over the bottom of the clip: each line starts `at` seconds into the
  // recording
  notes?: Note[]
  bar?: boolean // the window's bar of dots. Off for a hero, which reads better without it
  title?: string // shown on its own before each loop
}

const CARD = 1600 // ms the title holds before the clip
const CARD_OUT = 450 // ms for it to lift away

type Recording = { meta: { width: number; height: number; duration: number; mouse?: boolean }; events: unknown[] }

export function RecordingReplay({ src, region, aspectRatio, notes, bar = true, title }: RecordingReplayProps) {
  const box = useRef<HTMLDivElement>(null)
  const root = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ width: 1280, height: 800 })
  const [mouse, setMouse] = useState(false)
  const [scale, setScale] = useState(0)
  const player = useRef<{ play: (t?: number) => void; pause: (t?: number) => void; destroy: () => void; getCurrentTime: () => number } | null>(null)
  const [line, setLine] = useState(0)
  const visible = useRef(false)
  const [card, setCard] = useState(!!title)
  const carding = useRef(!!title)
  const cardTimer = useRef<ReturnType<typeof setTimeout>>()

  const view = region ?? { x: 0, y: 0, width: size.width, height: size.height }

  // Fit the recording (or its region) to the box
  useEffect(() => {
    const el = box.current
    if (!el) return
    const fit = () => setScale(el.clientWidth / view.width)
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(el)
    return () => ro.disconnect()
  }, [view.width])

  // Load and play when near the screen; pause when it leaves
  useEffect(() => {
    const el = box.current
    if (!el) return
    let cancelled = false
    // The title, then the clip from the start. Without a title, straight to the clip
    const fromTop = (r: NonNullable<typeof player.current>) => {
      clearTimeout(cardTimer.current)
      if (!title) { r.play(0); return }
      carding.current = true
      setCard(true)
      r.pause(0)
      cardTimer.current = setTimeout(() => {
        carding.current = false
        setCard(false)
        if (visible.current && player.current === r) r.play(0)
      }, CARD)
    }
    const start = async () => {
      if (player.current) { if (carding.current) fromTop(player.current); else player.current.play(); return }
      const [{ Replayer }, rec] = await Promise.all([
        import('@rrweb/replay'),
        fetch(src).then((r) => r.json() as Promise<Recording>),
      ])
      if (cancelled || !root.current) return
      setSize({ width: rec.meta.width, height: rec.meta.height })
      setMouse(!!rec.meta.mouse)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const r = new Replayer(rec.events as any, {
        root: root.current,
        mouseTail: false,
        showWarning: false,
        triggerFocus: false,
        UNSAFE_replayCanvas: false,
      })
      // Loop, after a beat on the last frame so its line can be read
      r.on('finish', () => { setTimeout(() => { if (visible.current && player.current === r) fromTop(r) }, notes ? 2200 : 0) })
      player.current = r
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { carding.current = false; setCard(false); r.pause(rec.meta.duration) }
      else if (visible.current) fromTop(r)
    }
    const io = new IntersectionObserver(([entry]) => {
      visible.current = entry.isIntersecting
      if (entry.isIntersecting) start()
      else player.current?.pause()
    }, { rootMargin: '200px 0px' })
    io.observe(el)
    return () => { cancelled = true; clearTimeout(cardTimer.current); io.disconnect(); player.current?.destroy(); player.current = null }
  }, [src, title, notes])

  // Follow the replay's clock for the subtitle
  useEffect(() => {
    if (!notes) return
    const id = setInterval(() => { if (player.current) setLine(lineAt(notes, player.current.getCurrentTime() / 1000)) }, 200)
    return () => clearInterval(id)
  }, [notes])

  const stage = (
    <div ref={box} className="relative w-full overflow-hidden bg-white [container-type:inline-size]" style={{ aspectRatio: aspectRatio ?? `${view.width} / ${view.height}` }}>
      <style dangerouslySetInnerHTML={{ __html: REPLAY_CSS }} />
      <div
        ref={root}
        className={`rr-stage ${mouse ? 'rr-mouse' : ''} absolute left-0 top-0 origin-top-left`}
        style={{ width: size.width, height: size.height, transform: `scale(${scale}) translate(${-view.x}px, ${-view.y}px)`, opacity: scale ? 1 : 0 }}
      />
      {/* The title on white, first. It lifts away, a little blurred, to the clip under it */}
      {title && (
        <div
          aria-hidden={!card}
          className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white px-[10%] text-center"
          style={{
            opacity: card ? 1 : 0, transform: `translateY(${card ? 0 : -10}px)`, filter: `blur(${card ? 0 : 5}px)`,
            transition: `opacity ${CARD_OUT}ms ease-out, transform ${CARD_OUT}ms cubic-bezier(.23,1,.32,1), filter ${CARD_OUT}ms ease-out`,
          }}
        >
          <p className="text-balance text-[clamp(18px,4cqw,44px)] font-medium leading-[1.15] tracking-[-0.03em] text-zinc-950">{title}</p>
        </div>
      )}
    </div>
  )

  // The subtitle sits under the window, on the backdrop, so it never covers the app
  const subtitle = notes && (
    <div className="mt-3 flex justify-center sm:mt-6">
      <Subtitle notes={notes} line={line} className="px-3 py-1 text-xs sm:px-5 sm:py-2 sm:text-sm" />
    </div>
  )

  return (
    <figure className="my-8 not-prose">
      {region ? (
        <Backdrop className="flex flex-col items-center justify-center p-6 sm:p-12">
          <div className="w-full overflow-hidden rounded-xl shadow-2xl ring-1 ring-black/10">{stage}</div>
          {subtitle}
        </Backdrop>
      ) : (
        <MediaFrame bar={bar} after={subtitle}>{stage}</MediaFrame>
      )}
    </figure>
  )
}
