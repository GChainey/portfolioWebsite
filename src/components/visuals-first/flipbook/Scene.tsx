'use client'

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { SCREENS, type Screen, type ScreenKind } from '@/content/screens'
import { Bleed, colourOf, ScreenTile } from '../shared'

// The flipbook: every screen, one after another, scrubbed by the scroll. A stage in the middle
// shows the current one; beside it a counter ticks, the project's name swaps in its colour, and
// a sheet of tiny thumbnails fills in as you go. At the end the sheet grows to fill the scene:
// everything at once, for a beat, before the work.
//
// Nothing here re-renders while you scroll. One function reads the scroll position and writes
// straight to the DOM: which image is visible, the counter's digits, the lit thumbnails and the
// sheet's transform.

export const KINDS: Record<ScreenKind, [string, string]> = {
  marketing: ['site', 'sites'],
  app: ['app', 'apps'],
  brand: ['brand page', 'brand pages'],
  research: ['research', 'research'],
  mac: ['Mac app', 'Mac apps'],
  game: ['game', 'games'],
  mobile: ['phone screen', 'phone screens'],
}
const KIND_LABEL: Record<ScreenKind, string> = {
  marketing: 'Website', app: 'App', brand: 'Brand', research: 'Research', mac: 'Mac', game: 'Game', mobile: 'Phone',
}

// Strongest first, then the rest; within each, every project spread evenly through the run so
// no stretch is all one thing
function sequence(): Screen[] {
  const spread = (list: Screen[]) => {
    const by = new Map<string, Screen[]>()
    list.forEach((s) => by.set(s.project, [...(by.get(s.project) ?? []), s]))
    const groups = Array.from(by.values())
    const keyed: { s: Screen; k: number }[] = []
    groups.forEach((g, j) => g.forEach((s, i) => keyed.push({ s, k: (i + (j + 1) / (groups.length + 1)) / g.length })))
    return keyed.sort((a, b) => a.k - b.k).map((x) => x.s)
  }
  return [...spread(SCREENS.filter((s) => s.best)), ...spread(SCREENS.filter((s) => !s.best))]
}

export const pad3 = (n: number) => String(n).padStart(3, '0')
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
// A screen fills the stage if it is roughly the stage's shape; otherwise it sits inside it
const fits = (s: Screen) => s.w / s.h >= 1.45 && s.w / s.h <= 1.9

// Where the scroll is spent: flipping, then a pause, then the sheet growing
const FLIP_END = 0.8
const PAY_START = 0.84
const PAY_END = 0.97
const AUTOPLAY_FPS = 1.4
const SCROLL_VH = 340
const PRE = 420 // px before it sticks, over which the stage settles to the middle

export function counts() {
  const kinds = new Map<ScreenKind, number>()
  SCREENS.forEach((s) => kinds.set(s.kind, (kinds.get(s.kind) ?? 0) + 1))
  const sorted = Array.from(kinds.entries()).sort((a, b) => b[1] - a[1])
  return { screens: SCREENS.length, projects: new Set(SCREENS.map((s) => s.project)).size, kinds: sorted }
}

export const POSITIONING = 'I help scale-ups create high quality prototypes to win deals, orchestrating AI tools to multiply the output.'

function fitCols(n: number, target: number) {
  let best = target
  for (let c = 8; c <= 16; c++) {
    if (n % c || n / c > c) continue
    if (n % best || Math.abs(c - target) < Math.abs(best - target) || (Math.abs(c - target) === Math.abs(best - target) && c > best)) best = c
  }
  return best
}

// The sheet's last row, if short, sits in the middle
const lastRow = (g: { cols: number }, n: number) => n - (n % g.cols || g.cols)
const lastShift = (g: { cols: number }, n: number) => Math.floor((g.cols - (n % g.cols || g.cols)) / 2)

type Geo = { phone: boolean; cols: number; rows: number; gap: number; lw: number; lh: number; lx: number; ly: number; stageW: number; centre: number; slotH: number }

export function FlipScene() {
  const list = useMemo(sequence, [])
  const N = list.length
  const stats = useMemo(counts, [])

  const container = useRef<HTMLDivElement>(null)
  const body = useRef<HTMLDivElement>(null)
  const stageCol = useRef<HTMLDivElement>(null)
  const stageWrap = useRef<HTMLDivElement>(null)
  const stageMedia = useRef<HTMLAnchorElement>(null)
  const glow = useRef<HTMLDivElement>(null)
  const imgs = useRef<(HTMLImageElement | null)[]>([])
  const leaf = useRef<HTMLImageElement>(null)
  const video = useRef<HTMLVideoElement>(null)
  const digits = useRef<(HTMLSpanElement | null)[]>([])
  const nameEl = useRef<HTMLSpanElement>(null)
  const dotEl = useRef<HTMLSpanElement>(null)
  const kindEl = useRef<HTMLSpanElement>(null)
  const titleEl = useRef<HTMLParagraphElement>(null)
  const chromeEl = useRef<HTMLSpanElement>(null)
  const railFade = useRef<HTMLDivElement>(null)
  const tiles = useRef<(HTMLDivElement | null)[]>([])
  const cursor = useRef<HTMLDivElement>(null)
  const sheet = useRef<HTMLDivElement>(null)
  const slot = useRef<HTMLDivElement>(null)
  const payHead = useRef<HTMLDivElement>(null)
  const legend = useRef<Map<ScreenKind, HTMLSpanElement | null>>(new Map())
  const bar = useRef<HTMLSpanElement>(null)

  const [geo, setGeo] = useState<Geo | null>(null)
  const g = useRef({ sx: 0, sy: 0, s0: 0.3, start: 0, range: 1 })
  const row = useRef<HTMLDivElement>(null)
  const state = useRef({ shift: 0, cur: -1, lit: -1, drift: 0, engaged: false, t: -1, leafAnim: null as Animation | null, rest: 0 as unknown as ReturnType<typeof setTimeout> })

  // ---- Layout: measured on resize, never on scroll ----
  const measure = useCallback(() => {
    const b = body.current
    const col = stageCol.current
    if (!b || !col) return
    const phone = window.innerWidth < 768
    // Columns that divide the count, so the sheet always fills; a short last row centres if none do
    const cols = fitCols(N, phone ? 10 : 12)
    const rows = Math.ceil(N / cols)
    const gap = phone ? 4 : 6
    const bw = b.clientWidth
    const bh = b.clientHeight
    const head = phone ? 132 : Math.min(180, bh * 0.22)
    const gridH = (w: number) => (rows * (w - gap * (cols - 1))) / cols / 1.6 + gap * (rows - 1)
    const maxByH = ((bh - head - (phone ? 8 : 24) - gap * (rows - 1)) * cols * 1.6) / rows + gap * (cols - 1)
    const lw = Math.max(200, Math.min(bw, maxByH))
    const lh = gridH(lw)
    const lx = (bw - lw) / 2
    const ly = head + Math.max(0, (bh - head - lh) / 2 - (phone ? 0 : 8))
    // The stage: as wide as its column, but never taller than the scene allows
    const chrome = 36
    const stageW = phone ? col.clientWidth : Math.min(col.clientWidth, (bh - chrome - 8) * 1.6)
    const centre = phone ? 0 : Math.max(0, (bh - (stageW / 1.6 + chrome)) / 2)
    setGeo((prev) => {
      const next: Geo = { phone, cols, rows, gap, lw, lh, lx, ly, stageW, centre, slotH: 0 }
      return prev && JSON.stringify({ ...prev, slotH: 0 }) === JSON.stringify(next) ? prev : next
    })
  }, [N])

  useLayoutEffect(() => {
    measure()
    const ro = new ResizeObserver(() => measure())
    if (body.current) ro.observe(body.current)
    window.addEventListener('resize', measure)
    return () => { ro.disconnect(); window.removeEventListener('resize', measure) }
  }, [measure])

  // Where the slot is, now that the layout has settled; and where the scroll range sits
  const place = useCallback(() => {
    const b = body.current
    const s = slot.current
    const c = container.current
    if (!b || !s || !c || !geo) return
    const br = b.getBoundingClientRect()
    // The rail fades and shifts during the ending: undo that by measuring against its own box
    const sr = s.getBoundingClientRect()
    const rail = railFade.current
    const shift = rail ? new DOMMatrixReadOnly(getComputedStyle(rail).transform === 'none' ? undefined : getComputedStyle(rail).transform) : null
    const sx = sr.left - br.left - (shift?.m41 ?? 0)
    // ...and the row's drift to the middle, which is complete by the time the sheet grows
    const sy = sr.top - br.top - (shift?.m42 ?? 0) - state.current.shift + geo.centre
    g.current.sx = sx
    g.current.sy = sy
    g.current.s0 = s.clientWidth / geo.lw
    // The cursor's ring stays about 2px on screen at either size
    if (cursor.current) cursor.current.style.borderWidth = `${Math.min(6, 2 / g.current.s0)}px`
    const cr = c.getBoundingClientRect()
    g.current.start = cr.top + window.scrollY - 56
    g.current.range = Math.max(1, c.offsetHeight - (window.innerHeight - 56))
  }, [geo])

  // ---- The frame ----
  const ensure = useCallback((i: number) => {
    const img = imgs.current[i]
    if (img && !img.getAttribute('src')) img.setAttribute('src', list[i].src)
  }, [list])

  const show = useCallback((idx: number, animate: boolean) => {
    const st = state.current
    const prev = st.cur
    if (idx === prev) return
    st.cur = idx
    const s = list[idx]
    const colour = colourOf(s.project)
    const dir = idx > prev ? 1 : -1

    // The stage: hide the old, show the new, warm the next few
    ensure(idx)
    for (let k = 1; k <= 6; k++) if (idx + k < N) ensure(idx + k)
    if (idx - 1 >= 0) ensure(idx - 1)
    const before = prev >= 0 ? imgs.current[prev] : null
    if (before) before.style.visibility = 'hidden'
    const now = imgs.current[idx]
    if (now) now.style.visibility = 'visible'
    if (stageMedia.current) {
      stageMedia.current.style.setProperty('--fb-tint', colour)
      if (s.href) stageMedia.current.setAttribute('href', s.href)
      else stageMedia.current.removeAttribute('href')
      stageMedia.current.setAttribute('aria-label', `${s.project}: ${s.title}`)
    }
    if (glow.current) glow.current.style.color = colour

    // The page turning: the old screen lifts away as the new one lands
    if (animate && before && leaf.current && before.getAttribute('src')) {
      const l = leaf.current
      l.src = before.getAttribute('src')!
      l.className = before.className
      st.leafAnim?.cancel()
      st.leafAnim = l.animate(
        dir > 0
          ? [{ transform: 'perspective(1400px) rotateX(0deg)', opacity: 1, filter: 'brightness(1)' }, { transform: 'perspective(1400px) rotateX(-62deg) translateY(-3%)', opacity: 0, filter: 'brightness(1.25)' }]
          : [{ transform: 'perspective(1400px) rotateX(0deg)', opacity: 1 }, { transform: 'perspective(1400px) rotateX(48deg) translateY(4%)', opacity: 0 }],
        { duration: 300, easing: 'cubic-bezier(.3,.6,.2,1)', fill: 'forwards' },
      )
      l.style.transformOrigin = dir > 0 ? '50% 0%' : '50% 100%'
      stageWrap.current?.animate(
        [{ transform: `scale(0.988) translateY(${dir * 3}px)` }, { transform: 'scale(1) translateY(0)' }],
        { duration: 220, easing: 'cubic-bezier(.2,.9,.25,1.2)' },
      )
    }

    // The counter: each digit that changed rolls in from the direction of travel
    const next = pad3(idx + 1)
    const old = prev >= 0 ? pad3(prev + 1) : '   '
    for (let d = 0; d < 3; d++) {
      const el = digits.current[d]
      if (!el || next[d] === old[d]) continue
      el.textContent = next[d]
      if (animate) el.animate([{ transform: `translateY(${dir * 42}%)`, opacity: 0.2 }, { transform: 'translateY(0)', opacity: 1 }], { duration: 200, easing: 'cubic-bezier(.2,.8,.2,1)' })
    }

    // Name, kind and title
    if (nameEl.current) { nameEl.current.textContent = s.project; nameEl.current.style.color = colour }
    if (dotEl.current) dotEl.current.style.background = colour
    if (kindEl.current) kindEl.current.textContent = KIND_LABEL[s.kind]
    if (titleEl.current) {
      titleEl.current.textContent = s.title
      if (animate && (prev < 0 || list[prev].title !== s.title)) titleEl.current.animate([{ opacity: 0.35, transform: 'translateY(3px)' }, { opacity: 1, transform: 'none' }], { duration: 220, easing: 'ease-out' })
    }
    if (chromeEl.current) chromeEl.current.textContent = `${s.project.toLowerCase().replace(/\s+/g, '-')}/${s.id}`
    legend.current.forEach((el, k) => { if (el) el.dataset.on = k === s.kind ? '1' : '' })
    if (bar.current) bar.current.style.transform = `scaleX(${(idx + 1) / N})`

    // The sheet: everything up to here is lit
    const lo = Math.min(st.lit, idx)
    const hi = Math.max(st.lit, idx)
    for (let i = Math.max(0, lo + 1); i <= hi; i++) {
      const tile = tiles.current[i]
      if (!tile) continue
      const on = i <= idx
      if (on) {
        const im = tile.firstElementChild as HTMLImageElement | null
        if (im && !im.getAttribute('src')) im.setAttribute('src', list[i].src)
      }
      tile.dataset.lit = on ? '1' : ''
    }
    st.lit = idx
    if (cursor.current && geo) {
      const r = Math.floor(idx / geo.cols)
      const c = (idx % geo.cols) + (idx >= lastRow(geo, N) ? lastShift(geo, N) : 0)
      const tw = (geo.lw - geo.gap * (geo.cols - 1)) / geo.cols
      const th = tw / 1.6
      cursor.current.style.transform = `translate(${c * (tw + geo.gap)}px, ${r * (th + geo.gap)}px)`
      cursor.current.style.borderColor = colour
    }

    // A clip plays once the visitor rests on it
    clearTimeout(st.rest)
    const v = video.current
    if (v) { v.pause(); v.style.opacity = '0' }
    if (s.video && v) {
      st.rest = setTimeout(() => {
        if (state.current.cur !== idx) return
        if (v.getAttribute('src') !== s.video) v.setAttribute('src', s.video!)
        v.className = (now?.className ?? '') + ' transition-opacity duration-300'
        v.play().then(() => { if (state.current.cur === idx) v.style.opacity = '1' }).catch(() => {})
      }, 650)
    }
  }, [ensure, geo, list, N])

  // ---- The ending: the sheet grows out of the rail ----
  const payoff = useCallback((t: number) => {
    const st = state.current
    if (!geo || Math.abs(t - st.t) < 0.0005) return
    st.t = t
    const { sx, sy, s0 } = g.current
    const e = easeInOut(t)
    const k = 1 - e
    if (sheet.current) sheet.current.style.transform = `translate3d(${(sx - geo.lx) * k}px, ${(sy - geo.ly) * k}px, 0) scale(${s0 + (1 - s0) * e})`
    const fade = clamp(1 - t * 1.8)
    if (stageWrap.current?.parentElement) {
      const w = stageWrap.current.parentElement as HTMLElement
      w.style.opacity = String(fade)
      w.style.transform = `scale(${1 - 0.06 * e})`
    }
    if (railFade.current) { railFade.current.style.opacity = String(fade); railFade.current.style.transform = `translateY(${-24 * e}px)` }
    if (cursor.current) cursor.current.style.opacity = String(clamp(1 - t * 3))
    if (payHead.current) {
      const h = clamp((t - 0.55) / 0.45)
      payHead.current.style.opacity = String(h)
      payHead.current.style.transform = `translateY(${(1 - easeInOut(h)) * 18}px)`
      payHead.current.style.visibility = h > 0 ? 'visible' : 'hidden'
    }
  }, [geo])

  const update = useCallback((animate = true) => {
    const { start, range } = g.current
    const st = state.current
    const p = clamp((window.scrollY - start) / range)
    st.engaged = p > 0
    // Over the last stretch before it sticks, the stage drifts from the top to the middle
    if (geo && row.current) {
      const pre = easeInOut(clamp((window.scrollY - (start - PRE)) / PRE))
      const shift = Math.round(geo.centre * pre * 10) / 10
      if (shift !== st.shift) { st.shift = shift; row.current.style.transform = shift ? `translate3d(0, ${shift}px, 0)` : '' }
    }
    const pf = clamp(p / FLIP_END)
    const base = st.drift % N
    const idx = Math.min(N - 1, Math.max(0, Math.round(base * (1 - pf) + pf * (N - 1))))
    show(idx, animate)
    payoff(clamp((p - PAY_START) / (PAY_END - PAY_START)))
  }, [N, geo, payoff, show])

  // After layout: size the slot, place everything, draw the current state
  useLayoutEffect(() => {
    if (!geo) return
    place()
    state.current.t = -1
    const cur = state.current.cur
    state.current.cur = -1
    state.current.lit = Math.max(-1, Math.min(state.current.lit, N - 1))
    if (cur >= 0) show(cur, false)
    update(false)
  }, [geo, place, show, update, N])

  // Re-place when the page above changes height (the hero's graph loads in late)
  useEffect(() => {
    const ro = new ResizeObserver(() => { place(); update(false) })
    ro.observe(document.body)
    return () => ro.disconnect()
  }, [place, update])

  // Scroll drives it; before the visitor scrolls in, it plays itself, slowly
  useEffect(() => {
    let raf = 0
    let last = 0
    let visible = false
    const loop = (now: number) => {
      raf = 0
      const st = state.current
      if (!st.engaged && visible && !document.hidden) {
        if (last) st.drift += ((now - last) / 1000) * AUTOPLAY_FPS
        last = now
        update(true)
        raf = requestAnimationFrame(loop)
      } else last = 0
    }
    const kick = () => { if (!raf) raf = requestAnimationFrame(loop) }
    let pending = 0
    const onScroll = () => {
      if (pending) return
      pending = requestAnimationFrame(() => { pending = 0; update(true); if (!state.current.engaged) kick() })
    }
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) kick() }, { rootMargin: '0px' })
    if (container.current) io.observe(container.current)
    window.addEventListener('scroll', onScroll, { passive: true })
    document.addEventListener('visibilitychange', kick)
    return () => {
      io.disconnect()
      window.removeEventListener('scroll', onScroll)
      document.removeEventListener('visibilitychange', kick)
      cancelAnimationFrame(raf)
      cancelAnimationFrame(pending)
      clearTimeout(state.current.rest)
    }
  }, [update])

  const phone = geo?.phone ?? false

  const eyebrow = (
    <p className="flex items-center gap-2 text-xs text-muted uppercase tracking-widest">
      Screens
      <span className="font-mono normal-case tracking-normal tabular-nums">· {stats.screens} from {stats.projects} projects</span>
    </p>
  )

  const counter = (
    <div className="flex items-baseline gap-3 font-mono tabular-nums text-foreground" aria-hidden>
      <span className="inline-flex leading-none" style={{ fontSize: phone ? 44 : 'clamp(56px, 5.4vw, 92px)', letterSpacing: '-0.06em', fontWeight: 500 }}>
        {[0, 1, 2].map((d) => (
          <span key={d} className="inline-block overflow-hidden" style={{ height: '1em', lineHeight: 1 }}>
            <span ref={(el) => { digits.current[d] = el }} className="inline-block">0</span>
          </span>
        ))}
      </span>
      <span className="text-sm text-muted">/ {pad3(N)}</span>
    </div>
  )

  const caption = (
    <div className="min-w-0">
      <p className="flex items-center gap-2 text-xs uppercase tracking-widest">
        <span ref={dotEl} className="h-1.5 w-1.5 rounded-full shrink-0" />
        <span ref={nameEl} className="truncate font-medium" />
        <span className="text-muted">·</span>
        <span ref={kindEl} className="text-muted" />
      </p>
      <p ref={titleEl} className={`mt-2 text-foreground text-balance leading-snug ${phone ? 'text-sm min-h-[2.6em]' : 'text-lg min-h-[2.8em]'}`} />
    </div>
  )

  const slotEl = (
    <div ref={slot} className="relative w-full" style={{ aspectRatio: geo ? `${geo.lw} / ${geo.lh}` : undefined }} aria-hidden />
  )

  return (
    <Bleed className="border-b border-border bg-background" label="Screens">
      {() => (
        <div ref={container} className="relative" style={{ height: `calc(100svh - 56px + ${SCROLL_VH}vh)` }}>
          <style>{CSS}</style>
          <div className="sticky top-14 flex flex-col overflow-hidden" style={{ height: 'calc(100svh - 56px)' }}>
            <div className="relative flex-1 min-h-0 mx-auto w-full max-w-[1600px] px-4 sm:px-8 pt-5 pb-5 sm:pt-6 sm:pb-6">
              <div ref={body} className="relative h-full">
                {/* Starts high, so the stage shows under the hero; settles to the middle as it sticks */}
                <div ref={row} className={`flex ${phone ? 'flex-col gap-4 h-full' : 'items-start gap-10 xl:gap-14'}`}>
                  {phone && (
                    <div>
                      {eyebrow}
                      <p className="mt-2 text-[15px] leading-snug text-foreground text-pretty">{POSITIONING}</p>
                    </div>
                  )}

                  {/* The stage */}
                  <div ref={stageCol} className={`${phone ? '' : 'flex-1 min-w-0 flex justify-end'}`}>
                    <div className="relative origin-top" style={{ width: geo?.stageW ?? '100%' }}>
                      {/* The colour of whatever is showing, glowing behind */}
                      <div ref={glow} className="fb-glow pointer-events-none absolute -inset-16 transition-[color] duration-700" aria-hidden />
                      {/* A stack of pages under the one showing */}
                      <div className="fb-sheet absolute inset-x-6 -bottom-2.5 top-3 rounded-xl" aria-hidden />
                      <div className="fb-sheet absolute inset-x-12 -bottom-5 top-6 rounded-xl opacity-60" aria-hidden />
                      <div ref={stageWrap} className="fb-stage relative rounded-xl overflow-hidden">
                        <div className="flex items-center gap-3 h-9 px-3.5 border-b fb-hair">
                          <span className="flex gap-1.5" aria-hidden>
                            <i className="fb-dot" /><i className="fb-dot" /><i className="fb-dot" />
                          </span>
                          <span ref={chromeEl} className="flex-1 truncate text-center font-mono text-[11px] text-muted" aria-hidden />
                          <span className="w-[42px]" aria-hidden />
                        </div>
                        <a ref={stageMedia} className="fb-media relative block overflow-hidden" style={{ aspectRatio: '16 / 10' }}>
                          {list.map((s, i) => (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              key={s.id}
                              ref={(el) => { imgs.current[i] = el }}
                              alt={s.title}
                              width={s.w}
                              height={s.h}
                              decoding="async"
                              draggable={false}
                              className={fits(s) ? 'fb-img fb-cover' : 'fb-img fb-contain'}
                              style={{ visibility: 'hidden' }}
                            />
                          ))}
                          <video ref={video} muted loop playsInline preload="none" className="fb-img fb-cover" style={{ opacity: 0 }} aria-hidden />
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img ref={leaf} alt="" aria-hidden className="fb-img fb-cover pointer-events-none" style={{ opacity: 0, zIndex: 3 }} />
                          <span className="absolute inset-x-0 bottom-0 h-[2px] z-[4] bg-black/10" aria-hidden>
                            <span ref={bar} className="block h-full origin-left bg-white/80 mix-blend-difference" />
                          </span>
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* The rail: what you're looking at, how far through, and the sheet filling in */}
                  {phone ? (
                    <div ref={railFade} className="flex flex-col gap-4">
                      <div className="flex items-start justify-between gap-4">
                        {caption}
                        <div className="shrink-0">{counter}</div>
                      </div>
                      {slotEl}
                    </div>
                  ) : (
                    <div ref={railFade} className="w-[340px] xl:w-[380px] shrink-0 flex flex-col" style={{ height: geo ? geo.stageW / 1.6 + 36 : undefined }}>
                      {eyebrow}
                      <p className="mt-3 text-xl leading-snug tracking-tight text-foreground text-pretty">
                        {POSITIONING.split(', ')[0]},{' '}
                        <span className="text-muted">{POSITIONING.split(', ').slice(1).join(', ')}</span>
                      </p>
                      <div className="mt-auto">
                        {slotEl}
                        <p className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted">
                          {stats.kinds.map(([k, n]) => (
                            <span key={k} ref={(el) => { legend.current.set(k, el) }} className="fb-legend tabular-nums whitespace-nowrap">{n} {KINDS[k][n === 1 ? 0 : 1]}</span>
                          ))}
                        </p>
                      </div>
                      <div className="mt-8">{caption}</div>
                      <div className="mt-4">{counter}</div>
                    </div>
                  )}
                </div>

                {/* The sheet: laid out at full size, shrunk into the rail until the end */}
                {geo && (
                  <div
                    ref={sheet}
                    className="absolute left-0 top-0 origin-top-left z-10 pointer-events-none"
                    style={{ width: geo.lw, left: geo.lx, top: geo.ly, willChange: 'transform' }}
                    aria-hidden
                  >
                    <div className="grid" style={{ gridTemplateColumns: `repeat(${geo.cols}, minmax(0, 1fr))`, gap: geo.gap }}>
                      {list.map((s, i) => (
                        <div key={s.id} ref={(el) => { tiles.current[i] = el }} className="fb-tile" style={{ aspectRatio: '16 / 10', gridColumnStart: i === lastRow(geo, N) ? lastShift(geo, N) + 1 : undefined }}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img alt="" decoding="async" draggable={false} />
                        </div>
                      ))}
                    </div>
                    <div
                      ref={cursor}
                      className="absolute left-0 top-0 rounded-[5px] transition-[border-color] duration-300"
                      style={{
                        width: (geo.lw - geo.gap * (geo.cols - 1)) / geo.cols,
                        aspectRatio: '16 / 10',
                        border: '2px solid',
                        margin: 0,
                        boxShadow: '0 0 0 1px rgba(0,0,0,.25)',
                      }}
                    />
                  </div>
                )}

                {/* The ending's headline, over the grown sheet */}
                {geo && (
                  <div ref={payHead} className="absolute inset-x-0 top-0 flex flex-col items-center justify-end text-center px-4" style={{ height: geo.ly - (phone ? 16 : 28), visibility: 'hidden', opacity: 0 }}>
                    <p className="text-xs text-muted uppercase tracking-widest mb-3">Every screen, one sheet</p>
                    <p className="font-medium text-foreground text-balance" style={{ fontSize: phone ? 30 : 'clamp(36px, 4vw, 60px)', letterSpacing: '-0.045em', lineHeight: 1 }}>
                      {stats.screens} screens. {stats.projects} projects.
                    </p>
                    {!phone && (
                      <p className="mt-3 text-sm text-muted">
                        {stats.kinds.map(([k, n]) => `${n} ${KINDS[k][n === 1 ? 0 : 1]}`).join(' · ')}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </Bleed>
  )
}

// With reduced motion: no scrubbing, every screen on one still sheet
export function StaticSheet() {
  const stats = useMemo(counts, [])
  const list = useMemo(sequence, [])
  return (
    <Bleed className="border-b border-border bg-background" label="Screens">
      {({ gutter }) => (
        <div>
          <div className="border-b border-border" style={{ marginLeft: gutter, marginRight: gutter }}>
            <div className="flex items-center justify-between gap-4 px-8 py-4">
              <p className="text-xs text-muted uppercase tracking-widest">Screens</p>
              <p className="text-xs text-muted font-mono tabular-nums">{stats.screens} screens · {stats.projects} projects</p>
            </div>
          </div>
          <div className="mx-auto max-w-[1600px] px-4 sm:px-8 py-10">
            <p className="max-w-2xl text-xl leading-snug tracking-tight text-foreground mb-8">{POSITIONING}</p>
            <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-10 gap-1.5 sm:gap-2">
              {list.map((s) => (
                <a key={s.id} href={s.href ?? undefined} className="block rounded-md overflow-hidden ring-1 ring-black/5" title={`${s.project}: ${s.title}`}>
                  <ScreenTile screen={s} fit="cover" play={false} style={{ aspectRatio: '16 / 10' }} />
                </a>
              ))}
            </div>
            <p className="mt-4 text-xs text-muted">{stats.kinds.map(([k, n]) => `${n} ${KINDS[k][n === 1 ? 0 : 1]}`).join(' · ')}</p>
          </div>
        </div>
      )}
    </Bleed>
  )
}

const CSS = `
  .fb-stage {
    background: var(--card);
    box-shadow: 0 0 0 1px color-mix(in srgb, var(--foreground) 10%, transparent), 0 1px 0 0 color-mix(in srgb, var(--foreground) 6%, transparent) inset, 0 40px 80px -30px rgba(0,0,0,.45), 0 16px 32px -16px rgba(0,0,0,.25);
  }
  .fb-hair { border-color: color-mix(in srgb, var(--foreground) 8%, transparent); background: color-mix(in srgb, var(--foreground) 3%, var(--card)); }
  .fb-dot { display: block; width: 10px; height: 10px; border-radius: 9999px; background: color-mix(in srgb, var(--foreground) 16%, transparent); }
  .fb-sheet { background: color-mix(in srgb, var(--foreground) 4%, var(--background)); box-shadow: 0 0 0 1px color-mix(in srgb, var(--foreground) 8%, transparent), 0 20px 40px -20px rgba(0,0,0,.3); }
  .fb-glow { background: radial-gradient(closest-side, currentColor, transparent); opacity: .16; filter: blur(40px); }
  html:not(.dark) .fb-glow { opacity: .12; }
  .fb-media {
    background:
      radial-gradient(color-mix(in srgb, var(--foreground) 10%, transparent) 1px, transparent 1px) 0 0 / 16px 16px,
      color-mix(in srgb, var(--fb-tint, var(--accent)) 10%, var(--card));
    transition: background-color .4s;
  }
  .fb-img { position: absolute; inset: 0; width: 100%; height: 100%; user-select: none; pointer-events: none; }
  .fb-cover { object-fit: cover; object-position: top; }
  .fb-contain { object-fit: contain; padding: 4.5%; filter: drop-shadow(0 12px 24px rgba(0,0,0,.28)); }
  .fb-tile { position: relative; overflow: hidden; border-radius: 4px; background: color-mix(in srgb, var(--foreground) 7%, transparent); }
  .fb-tile::after { content: ''; position: absolute; inset: 0; border-radius: inherit; box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--foreground) 8%, transparent); }
  .fb-tile img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: top; opacity: 0; transform: scale(1.06); transition: opacity .35s ease, transform .5s cubic-bezier(.2,.8,.2,1); }
  .fb-tile[data-lit="1"] img { opacity: 1; transform: none; }
  .fb-legend { transition: color .3s; }
  .fb-legend[data-on="1"] { color: var(--foreground); }
`
