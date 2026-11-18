'use client'

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { flushSync } from 'react-dom'
import { EB_Garamond, Cormorant_Garamond, Noto_Sans_Ogham } from 'next/font/google'
import { LensDistortion } from '@paper-design/shaders-react'
import s from './WhyteLens.module.css'

const garamond = EB_Garamond({ subsets: ['latin'], weight: ['400', '500'], style: ['normal', 'italic'], display: 'swap' })
const cormorant = Cormorant_Garamond({ subsets: ['latin'], weight: ['300', '500'], style: ['normal', 'italic'], display: 'swap' })
const ogham = Noto_Sans_Ogham({ subsets: ['ogham'], weight: '400', display: 'swap' })
const GILL = '"Gill Sans", "Gill Sans MT", "Seravek", sans-serif'

// Morning light through stained glass on a wall: the image under the lens in Paper
const SOURCE = '/posters/whyte/morning-glass.webp'
const SOURCE_SIZE = { w: 1408, h: 768 }

// ─── The shader ───────────────────────────────────────────────────────────────────────────────

type Lens = {
  spread: number
  bias: number
  angle: number
  perspective: number
  count: number
  dispersion: number
  dispersionShift: number
  dispersionColor: number
  focusCenter: number
  focusEdges: number
  swirl: number
  noise: number
  noiseFrequency: number
  noiseOffset: number
  lensBulge: number
  lensCircle: number
  grainMixer: number
  grainOverlay: number
  scale: number
  imageX: number
  imageY: number
}

// Exactly what's on the Paper board
const FROM_PAPER: Lens = {
  spread: 0.72,
  bias: -0.15,
  angle: 147,
  perspective: 0.48,
  count: 48,
  dispersion: 0.51,
  dispersionShift: 0,
  dispersionColor: 0.31,
  focusCenter: 0,
  focusEdges: 0.57,
  swirl: 0,
  noise: 1,
  noiseFrequency: 0.19,
  noiseOffset: 0.3,
  lensBulge: 0,
  lensCircle: 0,
  grainMixer: 0,
  grainOverlay: 0,
  scale: 1.11,
  imageX: 0,
  imageY: 0,
}

type Knob = { key: keyof Lens; label: string; min: number; max: number; step: number }
const KNOBS: { group: string; knobs: Knob[] }[] = [
  {
    group: 'Colour split',
    knobs: [
      { key: 'spread', label: 'Spread', min: 0, max: 1, step: 0.01 },
      { key: 'bias', label: 'Bias', min: -1, max: 1, step: 0.01 },
      { key: 'angle', label: 'Angle', min: 0, max: 360, step: 1 },
      { key: 'perspective', label: 'Perspective', min: 0, max: 1, step: 0.01 },
      { key: 'count', label: 'Layers', min: 2, max: 50, step: 1 },
    ],
  },
  {
    group: 'Dispersion',
    knobs: [
      { key: 'dispersion', label: 'Amount', min: 0, max: 1, step: 0.01 },
      { key: 'dispersionShift', label: 'Centre ↔ edges', min: -1, max: 1, step: 0.01 },
      { key: 'dispersionColor', label: 'Hue', min: 0, max: 1, step: 0.01 },
    ],
  },
  {
    group: 'Focus',
    knobs: [
      { key: 'focusCenter', label: 'Sharp centre', min: 0, max: 1, step: 0.01 },
      { key: 'focusEdges', label: 'Sharp edges', min: 0, max: 1, step: 0.01 },
      { key: 'swirl', label: 'Swirl', min: -1, max: 1, step: 0.01 },
    ],
  },
  {
    group: 'Noise',
    knobs: [
      { key: 'noise', label: 'Scatter', min: 0, max: 1, step: 0.01 },
      { key: 'noiseFrequency', label: 'Frequency', min: 0, max: 1, step: 0.01 },
      { key: 'noiseOffset', label: 'Seed', min: 0, max: 1, step: 0.01 },
      { key: 'grainMixer', label: 'Grain in split', min: 0, max: 1, step: 0.01 },
      { key: 'grainOverlay', label: 'Film grain', min: 0, max: 1, step: 0.01 },
    ],
  },
  {
    group: 'Lens and image',
    knobs: [
      { key: 'lensBulge', label: 'Bulge', min: -1, max: 1, step: 0.01 },
      { key: 'lensCircle', label: 'Circle', min: 0, max: 1, step: 0.01 },
      { key: 'scale', label: 'Zoom', min: 0.5, max: 3, step: 0.01 },
      { key: 'imageX', label: 'Pan X', min: -1, max: 1, step: 0.01 },
      { key: 'imageY', label: 'Pan Y', min: -1, max: 1, step: 0.01 },
    ],
  },
]

// ─── Motion: the lens has no clock of its own, so these drift its settings over time ─────────

type Motion = { speed: number; flow: number; turn: number; breathe: number; pan: number; hue: number; swirl: number }
const MOTION_DEFAULT: Motion = { speed: 1, flow: 0.6, turn: 0.35, breathe: 0.4, pan: 0.3, hue: 0.2, swirl: 0 }
const MOTION_KNOBS: { key: keyof Motion; label: string; hint: string; max: number }[] = [
  { key: 'speed', label: 'Speed', hint: 'How fast everything below moves', max: 4 },
  { key: 'flow', label: 'Flow', hint: 'The noise drifts, so the smears slide like water', max: 1 },
  { key: 'turn', label: 'Turn', hint: 'The split angle swings slowly', max: 1 },
  { key: 'breathe', label: 'Breathe', hint: 'The colour split swells and settles, in and out of focus', max: 1 },
  { key: 'pan', label: 'Light moves', hint: 'The window light drifts across the wall', max: 1 },
  { key: 'hue', label: 'Colour drift', hint: 'The dispersion hue wanders', max: 1 },
  { key: 'swirl', label: 'Swirl', hint: 'The layers twist one way, then back', max: 1 },
]

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))

function atTime(base: Lens, m: Motion, t: number): Lens {
  if (t === 0) return base
  const sin = Math.sin
  return {
    ...base,
    noiseOffset: clamp(base.noiseOffset + 0.25 * m.flow * sin(t * 0.13), 0, 1),
    angle: base.angle + 45 * m.turn * sin(t * 0.07),
    // Up to ±0.4: at full breathe the split swings from nearly clear to fully torn, like eyes
    // drifting in and out of focus
    spread: clamp(base.spread + 0.4 * m.breathe * sin(t * 0.21), 0, 1),
    imageX: base.imageX + 0.08 * m.pan * sin(t * 0.05),
    imageY: base.imageY + 0.05 * m.pan * Math.cos(t * 0.061),
    dispersionColor: base.dispersionColor + 0.1 * m.hue * sin(t * 0.09),
    swirl: clamp(base.swirl + 0.3 * m.swirl * sin(t * 0.11), -1, 1),
  }
}

// The blink loop (C · Eyelids): 14 seconds, the eyes open, the glass breathes, the eyes close.
// The loop is also what gets exported for social.
export const LOOP_SECONDS = 14
const LIDS_OPEN_AT = 1.5
// Where the motion clock starts, so the glass is at its softest as the lids open and comes
// clearest halfway through (Breathe is sin(clock × 0.21))
const loopClockStart = (speed: number) => Math.PI / 2 / 0.21 - LIDS_OPEN_AT * speed

// Only this component re-renders every frame; the panel and the type stay still
function LiveLens({
  base,
  motion,
  playing,
  image,
  loop,
  onRestart,
  exporting,
  controlled = false,
}: {
  base: Lens
  motion: Motion
  playing: boolean
  image: string
  loop: boolean
  onRestart: () => void
  exporting: boolean
  controlled?: boolean
}) {
  const clock = useRef(0)
  const elapsed = useRef(0)
  const [params, setParams] = useState(base)
  const restart = useRef(onRestart)
  restart.current = onRestart

  // Loop mode starts from the top whenever it's switched on
  useEffect(() => {
    elapsed.current = 0
    if (loop) clock.current = loopClockStart(motion.speed)
  }, [loop, motion.speed])

  useEffect(() => {
    if (!playing || exporting || controlled) {
      setParams(atTime(base, motion, clock.current))
      return
    }
    let raf = 0
    let last = performance.now()
    const tick = (now: number) => {
      // Cap the step so a backgrounded tab doesn't jump when it comes back
      const dt = Math.min(now - last, 64) / 1000
      last = now
      if (loop) {
        elapsed.current += dt
        if (elapsed.current >= LOOP_SECONDS) {
          elapsed.current = 0
          restart.current()
        }
        clock.current = loopClockStart(motion.speed) + elapsed.current * motion.speed
      } else {
        clock.current += dt * motion.speed
      }
      setParams(atTime(base, motion, clock.current))
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [base, motion, playing, loop, exporting, controlled])

  // ?control: a renderer steps the motion clock itself with window.__whyteClock(seconds)
  useEffect(() => {
    if (!controlled) return
    const w = window as unknown as { __whyteClock?: (s: number) => void }
    w.__whyteClock = (s: number) => {
      flushSync(() => setParams(atTime(base, motion, s * motion.speed)))
    }
    return () => {
      delete w.__whyteClock
    }
  }, [controlled, base, motion])

  // Export: the recorder steps through the loop one frame at a time with window.__whyteFrame(s)
  useEffect(() => {
    if (!exporting) return
    const w = window as unknown as { __whyteFrame?: (s: number) => void }
    w.__whyteFrame = (s: number) => {
      flushSync(() => setParams(atTime(base, motion, loopClockStart(motion.speed) + s * motion.speed)))
    }
    return () => {
      delete w.__whyteFrame
    }
  }, [exporting, base, motion])

  return (
    <LensDistortion
      image={image}
      fit="contain"
      {...params}
      // Where the shader sits on the Paper sketch (330 × 467): left -235, top -66, 800 × 600
      style={{ position: 'absolute', left: '-71.21%', top: '-14.13%', width: '242.42%', height: '128.48%' }}
    />
  )
}

// ─── Type treatments (the five Paper copies, plus type inside the glass) ──────────────────────

type Treatment = 'focus' | 'overlay' | 'eyelids' | 'ogham' | 'remembered' | 'glass' | 'none'
const TREATMENTS: { id: Treatment; name: string; note: string }[] = [
  { id: 'focus', name: 'A · Coming into focus', note: 'Each line sharper than the one above' },
  { id: 'overlay', name: 'B · Light on the wall', note: 'Title in overlay, lit like the panes' },
  { id: 'eyelids', name: 'C · Eyelids', note: 'Two dark bands open on the glass' },
  { id: 'ogham', name: 'D · Ogham in the leading', note: 'His name in Ogham, like lead between panes' },
  { id: 'remembered', name: 'E · Half-remembered', note: 'One faint word, too big, drifting' },
  { id: 'glass', name: 'F · Inside the glass', note: 'The title is drawn into the image, so the lens bends it too' },
  { id: 'none', name: 'No type', note: 'Just the lens' },
]

const cream = '#FFF4DC'

// Grey film grain, tiled. Used inside the letters of Light on the wall.
const GRAIN = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/><feComponentTransfer><feFuncR type='linear' slope='1.6' intercept='-0.3'/><feFuncG type='linear' slope='1.6' intercept='-0.3'/><feFuncB type='linear' slope='1.6' intercept='-0.3'/></feComponentTransfer></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>",
)}")`

// Readability for Light on the wall
type Read = { shade: number; halo: number; lift: number; grain: number }
const READ_DEFAULT: Read = { shade: 0.6, halo: 0.45, lift: 1, grain: 0.7 }
const READ_KNOBS: { key: keyof Read; label: string; hint: string }[] = [
  { key: 'shade', label: 'Shade', hint: 'Darkens the glass behind the title' },
  { key: 'halo', label: 'Halo', hint: 'A soft dark glow around each letter' },
  { key: 'lift', label: 'Light', hint: 'How much the title lifts the glass' },
  { key: 'grain', label: 'Grain in the letters', hint: 'Film grain inside the title' },
]

// Saved looks. The first one is what the page opens on.
type Preset = { name: string; treatment: Treatment; lens: Lens; motion: Motion; read: Read; loop?: boolean; slug?: string }
const PRESETS: Preset[] = [
  {
    name: 'Light on the wall, grain',
    treatment: 'overlay',
    lens: {
      spread: 0.66,
      bias: -0.13,
      angle: 33,
      perspective: 0.22,
      count: 48,
      dispersion: 0.34,
      dispersionShift: 0,
      dispersionColor: 0.68,
      focusCenter: 0,
      focusEdges: 0.29,
      swirl: -0.1,
      noise: 0.72,
      noiseFrequency: 0.37,
      noiseOffset: 0.6,
      lensBulge: 0.2,
      lensCircle: 0,
      grainMixer: 0,
      grainOverlay: 0.57,
      scale: 1.06,
      imageX: 0,
      imageY: 0,
    },
    motion: { speed: 0.77, flow: 0.26, turn: 0.16, breathe: 0.03, pan: 0.3, hue: 0.2, swirl: 0 },
    read: READ_DEFAULT,
  },
  {
    name: 'Eyelids, breathing',
    slug: 'eyelids',
    treatment: 'eyelids',
    loop: true,
    lens: {
      spread: 0.46,
      bias: -0.13,
      angle: 33,
      perspective: 0.22,
      count: 48,
      dispersion: 0.34,
      dispersionShift: 0,
      dispersionColor: 0.68,
      focusCenter: 0,
      focusEdges: 0.29,
      swirl: -0.1,
      noise: 0.72,
      noiseFrequency: 0.37,
      noiseOffset: 0.6,
      lensBulge: 0.2,
      lensCircle: 0,
      grainMixer: 0,
      grainOverlay: 0.57,
      scale: 1.06,
      imageX: 0,
      imageY: 0,
    },
    // Breathe 0.6 swings the spread about 0.22 to 0.7 and back, roughly every 11 seconds. Its
    // clearest moment stays a little soft.
    motion: { speed: 2.62, flow: 0.13, turn: 0.41, breathe: 0.6, pan: 0.23, hue: 0.32, swirl: 0.63 },
    read: READ_DEFAULT,
  },
  { name: 'From Paper', treatment: 'focus', lens: FROM_PAPER, motion: MOTION_DEFAULT, read: READ_DEFAULT },
]
const abs = (style: CSSProperties): CSSProperties => ({ position: 'absolute', ...style })
const vars = (v: Record<string, string | number>) => v as CSSProperties

function Details({ children, style, className = '' }: { children: ReactNode; style?: CSSProperties; className?: string }) {
  return (
    <div className={`${s.fadeIn} ${className}`} style={{ ...abs({ left: '7.27cqw', bottom: '6.67cqw' }), ...vars({ '--delay': '1400ms', '--dur': '2s' }), ...style }}>
      {children}
    </div>
  )
}

function TypeLayer({ treatment, read, loop }: { treatment: Treatment; read: Read; loop: boolean }) {
  const g = garamond.style.fontFamily
  const c = cormorant.style.fontFamily
  const smallCaps: CSSProperties = { fontFamily: c, fontWeight: 500, fontSize: '3.4cqw', lineHeight: 1.35, letterSpacing: '0.16em', textTransform: 'uppercase', color: cream }

  switch (treatment) {
    case 'focus': {
      const line: CSSProperties = { fontFamily: g, fontSize: '15.76cqw', lineHeight: 1, letterSpacing: '-0.01em', color: cream }
      return (
        <>
          <div style={abs({ left: '7.27cqw', top: '32.1%', width: '88cqw' })}>
            <div className={s.focusLine} style={{ ...line, ...vars({ '--blur-end': '1.2cqw', '--op-end': 0.75, '--delay': '0ms' }) }}>What to</div>
            <div className={s.focusLine} style={{ ...line, ...vars({ '--blur-end': '0.6cqw', '--op-end': 0.85, '--delay': '450ms' }) }}>Remember</div>
            <div className={s.focusLine} style={{ ...line, fontStyle: 'italic', lineHeight: 1.08, color: '#FFF8EA', ...vars({ '--delay': '900ms', '--dur': '3.4s' }) }}>
              when Waking
            </div>
          </div>
          <Details style={{ fontFamily: g, fontSize: '3.64cqw', lineHeight: 1.33, color: cream }}>
            David Whyte
            <br />
            Marble Collegiate Church · 11.14.26
          </Details>
        </>
      )
    }
    case 'overlay': {
      // Overlay only lifts what's under it, so on bright glass the title washes out. Three layers
      // help it read, each its own element so each blends with the glass (a shared wrapper would
      // blend only with itself): a shade that darkens the glass behind the title, a soft dark halo
      // around the letters, and grain inside them.
      const title: CSSProperties = {
        ...abs({ left: '5.45cqw', top: '15%', width: '90.9cqw' }),
        fontFamily: c,
        fontStyle: 'italic',
        fontWeight: 500,
        fontSize: '23.6cqw',
        lineHeight: 0.9,
        letterSpacing: '-0.02em',
      }
      const words = 'What to remember when waking'
      return (
        <>
          <div
            aria-hidden
            className={s.fadeIn}
            style={{
              ...abs({ left: 0, right: 0, top: '4%', height: '72%' }),
              background: 'radial-gradient(ellipse 75% 58% at 42% 46%, #1a0a03 0%, rgba(26,10,3,0.6) 45%, rgba(26,10,3,0) 75%)',
              mixBlendMode: 'multiply',
              ...vars({ '--op-end': read.shade, '--dur': '2.4s' }),
            }}
          />
          <div aria-hidden className={s.fadeIn} style={{ ...title, color: '#1a0a03', mixBlendMode: 'multiply', ...vars({ '--op-end': read.halo, '--blur-end': '2.2cqw', '--dur': '3.6s' }) }}>
            {words}
          </div>
          <div className={s.fadeIn} style={{ ...title, color: '#fff', mixBlendMode: 'overlay', ...vars({ '--op-end': read.lift, '--dur': '4.2s' }) }}>
            {words}
          </div>
          <div
            aria-hidden
            className={s.fadeIn}
            style={{
              ...title,
              backgroundImage: GRAIN,
              backgroundSize: '9cqw',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              color: 'transparent',
              mixBlendMode: 'overlay',
              ...vars({ '--op-end': read.grain, '--dur': '4.2s' }),
            }}
          >
            {words}
          </div>
          <Details style={{ ...smallCaps, left: '6cqw' }}>David Whyte · New York · 11.14.26</Details>
        </>
      )
    }
    case 'eyelids': {
      const lid = (top: boolean): CSSProperties => ({
        ...abs({ left: 0, right: 0, height: '60%', [top ? 'top' : 'bottom']: 0 }),
        background: `linear-gradient(${top ? 180 : 0}deg, #120804 0%, #120804 84%, rgba(18,8,4,0) 100%)`,
      })
      // In the loop the title fades at 12s and the lids are shut again by 14s
      const blink = loop ? s.blink : ''
      const closeAt = { '--close-at': `${LOOP_SECONDS - 1.4}s` }
      const fadeAt = { '--fade-at': `${LOOP_SECONDS - 2}s` }
      return (
        <>
          <div className={`${s.lid} ${blink}`} style={{ ...lid(true), ...vars({ '--open': '-36.5%', ...closeAt }) }} />
          <div className={`${s.lid} ${blink}`} style={{ ...lid(false), ...vars({ '--open': '40%', ...closeAt }) }} />
          <div className={`${s.fadeIn} ${blink}`} style={{ ...abs({ left: '7.27cqw', top: '8.5cqw', width: '85cqw' }), fontFamily: g, fontSize: '9.1cqw', lineHeight: 1.07, color: '#F3E2C4', ...vars({ '--delay': '900ms', '--dur': '2.4s', ...fadeAt }) }}>
            What to Remember
            <br />
            <i>when Waking</i>
          </div>
          <Details className={blink} style={{ right: '7.27cqw', display: 'flex', justifyContent: 'space-between', fontFamily: g, fontSize: '3.64cqw', color: '#C9A57A', ...vars({ '--delay': '1200ms', '--dur': '1.8s', ...fadeAt }) }}>
            <span>David Whyte</span>
            <span>Marble Collegiate · 11.14.26</span>
          </Details>
        </>
      )
    }
    case 'ogham': {
      const gill: CSSProperties = { fontFamily: GILL, fontWeight: 300, fontSize: '3.33cqw', lineHeight: 1.45, letterSpacing: '0.16em', textTransform: 'uppercase', color: cream, textAlign: 'right' }
      return (
        <>
          {/* Rotated about its top-left corner, so it reads bottom to top like a stone */}
          {/* The blend sits on the rotated wrapper: its transform makes it the layer that meets the glass */}
          <div style={abs({ left: '27.9%', top: '95.5%', transform: 'rotate(-90deg)', transformOrigin: '0 0', whiteSpace: 'nowrap', mixBlendMode: 'multiply' })}>
            <div className={s.fadeIn} style={{ fontFamily: ogham.style.fontFamily, fontSize: '18.8cqw', lineHeight: 1.06, color: '#2A1206', ...vars({ '--op-end': 0.85, '--dur': '4s' }) }}>
              ᚛ᚇᚐᚃᚔᚇ ᚃᚆᚔᚈᚓ᚜
            </div>
          </div>
          <div className={s.fadeIn} style={{ ...abs({ right: '6cqw', top: '7.27cqw', width: '36cqw' }), ...gill, ...vars({ '--delay': '1200ms' }) }}>
            What to remember when waking
          </div>
          <div className={s.fadeIn} style={{ ...abs({ right: '6cqw', bottom: '6.67cqw' }), ...gill, ...vars({ '--delay': '1600ms' }) }}>
            David Whyte
            <br />
            11 · 14 · 26
          </div>
        </>
      )
    }
    case 'remembered':
      return (
        <>
          <div style={abs({ left: '-12.1cqw', top: '25.7%' })}>
            <div className={s.drift}>
              <div className={s.fadeIn} style={{ fontFamily: c, fontStyle: 'italic', fontWeight: 300, fontSize: '75.8cqw', lineHeight: 0.88, letterSpacing: '-0.03em', whiteSpace: 'nowrap', color: '#FFF6E2', ...vars({ '--op-end': 0.35, '--blur-end': '0.9cqw', '--dur': '5s' }) }}>
                Waking
              </div>
            </div>
          </div>
          <div className={s.fadeIn} style={{ ...abs({ left: '7.27cqw', top: '7.9cqw' }), ...smallCaps, ...vars({ '--delay': '1200ms' }) }}>
            What to remember when waking
          </div>
          <Details style={smallCaps}>David Whyte · 11.14.26</Details>
        </>
      )
    case 'glass':
      return (
        <Details style={{ ...smallCaps, ...vars({ '--delay': '600ms' }) }}>
          David Whyte · 11.14.26
        </Details>
      )
    case 'none':
      return null
  }
}

// F: draws the title into the source image, so the shader splits and smears the letters too.
// The poster only shows the middle strip of the image (about x 442 to 966), so the type sits there.
async function imageWithTitle(family: string): Promise<string> {
  const img = new Image()
  img.src = SOURCE
  await img.decode()
  await Promise.all([document.fonts.load(`104px ${family}`), document.fonts.load(`italic 104px ${family}`)])
  const canvas = document.createElement('canvas')
  canvas.width = SOURCE_SIZE.w
  canvas.height = SOURCE_SIZE.h
  const ctx = canvas.getContext('2d')
  if (!ctx) return SOURCE
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
  ctx.fillStyle = 'rgba(255, 244, 220, 0.94)'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'alphabetic'
  const x = canvas.width / 2
  ctx.font = `104px ${family}`
  ctx.fillText('What to', x, 290)
  ctx.fillText('Remember', x, 392)
  ctx.font = `italic 104px ${family}`
  ctx.fillText('when Waking', x, 494)
  return canvas.toDataURL('image/jpeg', 0.92)
}

// ─── Panel parts ──────────────────────────────────────────────────────────────────────────────

function Slider({ label, value, min, max, step, onChange, hint }: { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void; hint?: string }) {
  const digits = step >= 1 ? 0 : 2
  return (
    <label className="block py-1" title={hint}>
      <span className="flex items-baseline justify-between text-[13px] leading-5 text-[#d9d3c7]">
        <span>{label}</span>
        <span className="tabular-nums text-[#8f877b]">{value.toFixed(digits)}</span>
      </span>
      <input className={s.range} type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </label>
  )
}

function Section({ title, children, right }: { title: string; children: ReactNode; right?: ReactNode }) {
  return (
    <section className="border-t border-[#2e2a26] py-4">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-[11px] uppercase tracking-[0.14em] text-[#8f877b]">{title}</h2>
        {right}
      </div>
      {children}
    </section>
  )
}

const button = `${s.press} rounded-md bg-[#2a2622] px-3 py-1.5 text-[13px] text-[#efe9dd] hover:bg-[#35302b]`

// Dreamy, not broken: random settings inside ranges that keep the light readable
function dreamDice(): Lens {
  const r = (lo: number, hi: number) => lo + Math.random() * (hi - lo)
  return {
    ...FROM_PAPER,
    spread: r(0.45, 0.85),
    bias: r(-0.5, 0.3),
    angle: Math.round(r(0, 360)),
    perspective: r(0.1, 0.8),
    dispersion: r(0.2, 0.8),
    dispersionColor: r(0, 1),
    focusEdges: r(0.2, 0.8),
    swirl: r(-0.3, 0.3),
    noise: r(0.5, 1),
    noiseFrequency: r(0.1, 0.4),
    noiseOffset: r(0, 1),
    lensBulge: r(-0.1, 0.3),
    scale: r(1, 1.4),
  }
}

// ─── The studio ───────────────────────────────────────────────────────────────────────────────

export function WhyteLens() {
  const [lens, setLens] = useState<Lens>(PRESETS[0].lens)
  const [motion, setMotion] = useState<Motion>(PRESETS[0].motion)
  const [read, setRead] = useState<Read>(PRESETS[0].read)
  const [playing, setPlaying] = useState(false)
  const [treatment, setTreatment] = useState<Treatment>(PRESETS[0].treatment)
  const [wake, setWake] = useState(0)
  const [glassImage, setGlassImage] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [loop, setLoop] = useState(false)
  // ?export=eyelids: just the poster at 540 CSS px (1080 px at 2x), held still for the recorder
  const [exporting, setExporting] = useState(false)
  // ?embed: no site header (in an iframe). ?control: a renderer drives it
  const [embed, setEmbed] = useState(false)
  const [control, setControl] = useState(false)

  // Start moving unless the visitor asked for less motion
  useEffect(() => {
    const q = new URLSearchParams(window.location.search)
    setEmbed(q.has('embed'))
    const slug = q.get('export')
    const preset = slug ? PRESETS.find((p) => p.slug === slug) : undefined
    if (preset) {
      load(preset)
      setExporting(true)
      return
    }
    const look = q.get('look')
    const lookPreset = look ? PRESETS.find((p) => p.slug === look) : undefined
    if (lookPreset) load({ ...lookPreset, loop: false })
    if (q.has('control')) {
      setControl(true)
      return
    }
    setPlaying(!window.matchMedia('(prefers-reduced-motion: reduce)').matches)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (treatment !== 'glass' || glassImage) return
    imageWithTitle(garamond.style.fontFamily).then(setGlassImage).catch(() => setGlassImage(SOURCE))
  }, [treatment, glassImage])

  const set = useCallback((key: keyof Lens, v: number) => setLens((l) => ({ ...l, [key]: v })), [])
  const setM = useCallback((key: keyof Motion, v: number) => setMotion((m) => ({ ...m, [key]: v })), [])
  const setR = useCallback((key: keyof Read, v: number) => setRead((r) => ({ ...r, [key]: v })), [])
  const load = (p: Preset) => {
    setLens(p.lens)
    setMotion(p.motion)
    setRead(p.read)
    setTreatment(p.treatment)
    setLoop(!!p.loop)
    setWake((n) => n + 1)
  }

  // ?control: the renderer sets values directly (no clicks), one frame at a time
  useEffect(() => {
    if (!control) return
    const w = window as unknown as { __whyteStudio?: { set: (p: { lens?: Partial<Lens>; motion?: Partial<Motion>; treatment?: Treatment }) => void } }
    w.__whyteStudio = {
      set: (p) =>
        flushSync(() => {
          if (p.lens) setLens((l) => ({ ...l, ...p.lens }))
          if (p.motion) setMotion((m) => ({ ...m, ...p.motion }))
          if (p.treatment) setTreatment(p.treatment)
        }),
    }
    return () => {
      delete w.__whyteStudio
    }
  }, [control])

  // Space plays and pauses, W wakes the type again. Not while typing in a field.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.closest('input, textarea, select')) return
      if (e.code === 'Space') {
        e.preventDefault()
        setPlaying((p) => !p)
      } else if (e.key === 'w' || e.key === 'W') setWake((n) => n + 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const copy = async () => {
    await navigator.clipboard.writeText(JSON.stringify({ treatment, lens, motion, read }, null, 2))
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const image = treatment === 'glass' ? glassImage ?? SOURCE : SOURCE
  const current = useMemo(() => TREATMENTS.find((t) => t.id === treatment), [treatment])
  const looping = loop && treatment === 'eyelids'
  const restart = useCallback(() => setWake((n) => n + 1), [])

  const poster = (
    <>
      <LiveLens base={lens} motion={motion} playing={playing} image={image} loop={looping || exporting} onRestart={restart} exporting={exporting} controlled={control} />
      <div key={`${treatment}-${wake}-${looping}`} className="absolute inset-0">
        <TypeLayer treatment={treatment} read={read} loop={looping || exporting} />
      </div>
    </>
  )

  if (exporting) {
    // embedded (the explainer), the poster fills the frame's height
    if (embed) return (
      <div className="flex h-screen items-center justify-center bg-[#141110]">
        <div id="export-poster" className={s.poster} style={{ width: 'min(100vw, calc(100vh * 595 / 842))' }}>
          {poster}
        </div>
      </div>
    )
    return (
      <div className="min-h-screen bg-[#141110] pt-20">
        <div id="export-poster" className={s.poster} style={{ width: 540, margin: '0 auto' }}>
          {poster}
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-[#141110] text-[#efe9dd] ${embed ? '' : 'pt-14'}`}>
      {/* Embedded (a 720-wide frame on a case study), the poster and the panel sit side by side at any width */}
      <div className={embed ? 'flex h-screen items-start gap-4 p-4' : 'mx-auto flex max-w-[1280px] flex-col gap-8 px-6 py-8 lg:flex-row lg:items-start'}>
        {/* Poster */}
        <div className="flex flex-1 flex-col items-center gap-4">
          <div
            className={`${s.poster} ${playing ? '' : s.paused} w-full shadow-[0_30px_80px_-30px_rgba(0,0,0,0.8)]`}
            style={{ maxWidth: embed ? 'calc((100vh - 2rem) * 595 / 842)' : 'min(595px, calc((100vh - 9rem) * 595 / 842))' }}
          >
            {poster}
          </div>
          <p className="text-center text-[13px] text-[#8f877b]" hidden={embed}>
            {current?.name}: {current?.note}. <span className="text-[#6f685e]">Space plays or pauses, W wakes the type again.</span>
          </p>
        </div>

        {/* Panel */}
        <aside className={embed ? 'max-h-[calc(100vh-2rem)] w-[300px] shrink-0 overflow-y-auto rounded-xl bg-[#1b1816] px-4 pb-4 pt-3' : 'w-full shrink-0 rounded-xl bg-[#1b1816] px-5 pb-5 pt-4 lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:w-[340px] lg:overflow-y-auto'}>
          <div className="pb-3">
            <h1 className="text-[15px] text-[#efe9dd]">What to Remember When Waking</h1>
            <p className="text-[13px] leading-5 text-[#8f877b]">Lens Distortion from the Paper board, live. Poster study 02.</p>
          </div>

          <Section title="Looks">
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <button key={p.name} className={button} onClick={() => load(p)}>{p.name}</button>
              ))}
            </div>
          </Section>

          <Section title="Type" right={<button className={button} onClick={() => setWake((n) => n + 1)}>Wake</button>}>
            <div className="flex flex-col gap-0.5">
              {TREATMENTS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setTreatment(t.id)
                    setWake((n) => n + 1)
                  }}
                  className={`${s.press} rounded-md px-2 py-1.5 text-left text-[13px] ${treatment === t.id ? 'bg-[#2e2924] text-[#efe9dd]' : 'text-[#a69e91] hover:bg-[#221f1c]'}`}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </Section>

          {treatment === 'overlay' && (
            <Section title="Readability">
              {READ_KNOBS.map((k) => (
                <Slider key={k.key} label={k.label} hint={k.hint} value={read[k.key]} min={0} max={1} step={0.01} onChange={(v) => setR(k.key, v)} />
              ))}
            </Section>
          )}

          {treatment === 'eyelids' && (
            <Section title="Blink loop" right={<button className={button} onClick={() => { setLoop((l) => !l); setWake((n) => n + 1) }}>{loop ? 'On' : 'Off'}</button>}>
              <p className="text-[13px] leading-5 text-[#8f877b]">
                {LOOP_SECONDS} seconds: the eyes open on soft glass, it comes clear, the eyes close. The export for social is this loop.
              </p>
            </Section>
          )}

          <Section title="Motion" right={<button className={button} onClick={() => setPlaying((p) => !p)}>{playing ? 'Pause' : 'Play'}</button>}>
            {MOTION_KNOBS.map((k) => (
              <Slider key={k.key} label={k.label} hint={k.hint} value={motion[k.key]} min={0} max={k.max} step={0.01} onChange={(v) => setM(k.key, v)} />
            ))}
          </Section>

          {KNOBS.map((g) => (
            <Section key={g.group} title={g.group}>
              {g.knobs.map((k) => (
                <Slider key={k.key} label={k.label} value={lens[k.key]} min={k.min} max={k.max} step={k.step} onChange={(v) => set(k.key, v)} />
              ))}
            </Section>
          ))}

          <div className="flex flex-wrap gap-2 border-t border-[#2e2a26] pt-4">
            <button className={button} onClick={() => setLens(dreamDice())}>Dream dice</button>
                        <button className={button} onClick={copy}>{copied ? 'Copied' : 'Copy settings'}</button>
          </div>
        </aside>
      </div>
    </div>
  )
}
