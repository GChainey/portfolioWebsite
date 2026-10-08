'use client'

import { useEffect, useRef, useState } from 'react'
import { useInView } from 'framer-motion'

interface ScaledFrameProps {
  src: string
  title: string
  // The prototype is designed for a desktop window; render it at this size and scale to fit.
  width?: number
  height?: number
  // Bumping this reloads the frame so a demo replays from the start.
  run?: number
  // For pages that stack several prototypes and scroll past them. The frame only runs while it
  // is on or near the screen, and until it is clicked it can't trap the scroll wheel or pull
  // the page to itself by taking focus as it loads.
  passive?: boolean
}

// A live HTML prototype in a frame, scaled down to fit its column.
export function ScaledFrame({ src, title, width = 1280, height = 900, run = 0, passive }: ScaledFrameProps) {
  const frameRef = useRef<HTMLDivElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [scale, setScale] = useState(1)
  // Which src + run has finished loading, so a change shows the bar until the new one is in.
  const [loaded, setLoaded] = useState('')
  const near = useInView(frameRef, { margin: '75% 0px 75% 0px' })
  const mounted = !passive || near
  // Clicked into, and the pointer hasn't left since
  const [inUse, setInUse] = useState(false)
  const asleep = Boolean(passive) && !inUse
  const current = `${run}:${src}`

  useEffect(() => {
    const el = frameRef.current
    if (!el) return
    const observer = new ResizeObserver(([entry]) => {
      setScale(Math.min(1, entry.contentRect.width / width))
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [width])

  useEffect(() => {
    if (!mounted) {
      setLoaded('')
      setInUse(false)
    }
  }, [mounted])

  // A prototype that focuses a field as it loads makes the browser scroll that field into view,
  // which drags the page to a frame nobody asked for. The window blurs before that scroll
  // lands, so note where the page was and put it back.
  useEffect(() => {
    if (!asleep) return
    const hold = () => {
      if (document.activeElement !== iframeRef.current) return
      const top = window.scrollY
      requestAnimationFrame(() => window.scrollTo({ top, behavior: 'instant' }))
    }
    window.addEventListener('blur', hold)
    return () => window.removeEventListener('blur', hold)
  }, [asleep])

  // A tap elsewhere hands the scroll back (touch has no pointer to leave with)
  useEffect(() => {
    if (!inUse) return
    const release = (e: PointerEvent) => {
      if (!frameRef.current?.contains(e.target as Node)) setInUse(false)
    }
    document.addEventListener('pointerdown', release)
    return () => document.removeEventListener('pointerdown', release)
  }, [inUse])

  return (
    <div
      ref={frameRef}
      onClick={asleep ? () => setInUse(true) : undefined}
      onPointerLeave={(e) => e.pointerType === 'mouse' && setInUse(false)}
      className={`group/frame relative w-full overflow-hidden rounded-lg border bg-background shadow-xl transition-colors ${
        inUse ? 'border-accent' : 'border-border'
      } ${asleep ? 'cursor-pointer' : ''}`}
      style={{ height: height * scale }}
    >
      {mounted && (
        <iframe
          key={run}
          ref={iframeRef}
          src={src}
          title={title}
          loading="lazy"
          onLoad={() => setLoaded(current)}
          className={`absolute top-0 left-0 border-0 origin-top-left ${asleep ? 'pointer-events-none' : ''}`}
          style={{ width, height, transform: `scale(${scale})` }}
        />
      )}
      {mounted && loaded !== current && (
        <div className="absolute inset-x-0 top-0 h-0.5 overflow-hidden" role="status" aria-label="Loading">
          <div className="h-full w-1/3 bg-accent animate-frame-loading" />
        </div>
      )}
      {asleep && mounted && (
        <span className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full text-xs bg-foreground text-background shadow-lg opacity-0 group-hover/frame:opacity-100 transition-opacity">
          Click to use it
        </span>
      )}
    </div>
  )
}
