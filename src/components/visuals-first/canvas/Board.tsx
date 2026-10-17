'use client'

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowDown, ArrowUpRight, Maximize, MessageCircle, Minus, Plus } from 'lucide-react'
import { ScreenTile } from '../shared'
import { WORLD } from './layout'
import { camFor, clamp, easeInOut, easeOut, flight, zoomAbout, type Cam, type Insets, type Rect } from './camera'
import { Avatar, Card, CommentList, CommentPin, POPOVER, type Side } from './Comments'

// The canvas: every screen as an artboard, every project a frame, on one layer that is moved
// and scaled as a whole. The camera lives in a ref and is written straight to the DOM each
// frame; React only renders when something is opened, selected or chosen.

const { frames, boards, pins, W, H } = WORLD
const MAX_Z = 2
const LINE = 'color-mix(in srgb, var(--foreground) 10%, transparent)'

type Flight = { path: (t: number) => Cam; ms: number; t0: number; ease: (t: number) => number; done?: () => void }

const isMac = () => typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent)

export function Board({ reduced, onCaseStudy }: { reduced: boolean; onCaseStudy: (workId: string) => void }) {
  const viewport = useRef<HTMLDivElement>(null)
  const layer = useRef<HTMLDivElement>(null)
  const dots = useRef<HTMLDivElement>(null)
  const labelEls = useRef<(HTMLDivElement | null)[]>([])
  const pinEls = useRef<(HTMLDivElement | null)[]>([])
  const miniView = useRef<HTMLDivElement>(null)
  const zoomText = useRef<HTMLSpanElement>(null)
  const selEl = useRef<HTMLDivElement>(null)

  const [size, setSize] = useState({ w: 0, h: 0 })
  const sizeRef = useRef(size)
  const phone = size.w > 0 && size.w < 640
  const inset: Insets = phone ? { top: 64, right: 16, bottom: 64, left: 16 } : { top: 96, right: 48, bottom: 56, left: 48 }
  const insetRef = useRef(inset)
  insetRef.current = inset

  const cam = useRef<Cam>({ x: 0, y: 0, z: 0.2 })
  const fitZ = useRef(0.2)
  const fly = useRef<Flight | null>(null)
  const inertia = useRef<{ vx: number; vy: number } | null>(null)
  const drift = useRef({ on: !reduced, t: 0 })
  const visible = useRef(false)
  const raf = useRef(0)
  const last = useRef(0)
  const lastZ = useRef(0)
  const dotGap = useRef(0)
  const lastNames = useRef('')
  const settleTimer = useRef<ReturnType<typeof setTimeout>>()
  const pinPos = useRef(pins.map(() => ({ x: 0, y: 0 })))

  const [current, setCurrent] = useState(-1)
  const [selected, setSelected] = useState<number | null>(null)
  const selectedRef = useRef(selected)
  selectedRef.current = selected
  const [dropped, setDropped] = useState(0)
  const [previews, setPreviews] = useState<number[]>([])
  const [openPin, setOpenPin] = useState<number | null>(null)
  const openRef = useRef(openPin)
  openRef.current = openPin
  const [sides, setSides] = useState<Side[]>(pins.map(() => ({ h: 'right', v: 'down' })))
  const [list, setList] = useState(false)
  const [touched, setTouched] = useState(false)
  const [wheelHint, setWheelHint] = useState(false)
  const wheelHintTimer = useRef<ReturnType<typeof setTimeout>>()

  const MINI = phone ? 104 : 168
  const m = MINI / W

  // Write the camera to the layer and everything that follows it
  const apply = useCallback(() => {
    const { x, y, z } = cam.current
    const L = layer.current
    if (!L) return
    L.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${z})`
    if (z !== lastZ.current) {
      lastZ.current = z
      L.style.setProperty('--iz', String(1 / z))
      const names = z >= 0.42 ? '1' : '0'
      if (names !== lastNames.current) { lastNames.current = names; L.dataset.names = names }
      if (zoomText.current) zoomText.current.textContent = `${Math.round(z * 100)}%`
    }
    // The dots follow the canvas, a step coarser whenever they'd get too dense
    let g = 24 * z
    while (g < 16) g *= 2
    while (g >= 32) g /= 2
    const D = dots.current
    if (D) {
      if (Math.abs(g - dotGap.current) > 0.01) { dotGap.current = g; D.style.backgroundSize = `${g}px ${g}px` }
      const ox = ((x % g) + g) % g
      const oy = ((y % g) + g) % g
      D.style.transform = `translate3d(${ox - 64}px, ${oy - 64}px, 0)`
    }
    frames.forEach((f, i) => {
      const el = labelEls.current[i]
      if (el) el.style.transform = `translate3d(${Math.round(f.x * z + x)}px, ${Math.round(f.y * z + y)}px, 0)`
    })
    pins.forEach((p, i) => {
      const sx = p.x * z + x
      const sy = p.y * z + y
      pinPos.current[i] = { x: sx, y: sy }
      const el = pinEls.current[i]
      if (el) el.style.transform = `translate3d(${Math.round(sx - 28)}px, ${Math.round(sy + 24)}px, 0)` // on the screen's corner, clear of its neighbour's name
    })
    const s = selectedRef.current
    if (s !== null && selEl.current) {
      const b = boards[s]
      const el = selEl.current
      el.style.transform = `translate3d(${b.x * z + x}px, ${b.y * z + y}px, 0)`
      el.style.width = `${b.w * z}px`
      el.style.height = `${b.h * z}px`
    }
    const { w: vw, h: vh } = sizeRef.current
    if (miniView.current) {
      // Kept inside the map, so there's always an edge to see
      const v = miniView.current
      const l = clamp((-x / z) * m, 0, MINI - 4)
      const t = clamp((-y / z) * m, 0, H * m - 4)
      const r = clamp(((vw - x) / z) * m, l + 4, MINI)
      const b = clamp(((vh - y) / z) * m, t + 4, H * m)
      v.style.transform = `translate3d(${l}px, ${t}px, 0)`
      v.style.width = `${r - l}px`
      v.style.height = `${b - t}px`
    }
  }, [m, MINI])

  // Which frame the middle of the view is on
  const settle = useCallback(() => {
    if (raf.current) return
    if (layer.current) layer.current.style.willChange = 'auto' // redraw sharp at the new scale
    const { x, y, z } = cam.current
    const { w: vw, h: vh } = sizeRef.current
    const ins = insetRef.current
    const cx = ((ins.left + vw - ins.right) / 2 - x) / z
    const cy = ((ins.top + vh - ins.bottom) / 2 - y) / z
    let best = -1
    let bd = Infinity
    frames.forEach((f, i) => {
      const dx = Math.max(f.x - cx, 0, cx - (f.x + f.w))
      const dy = Math.max(f.y - cy, 0, cy - (f.y + f.h))
      const d = dx * dx + dy * dy
      if (d < bd) { bd = d; best = i }
    })
    // Zoomed right out, no one frame is "here"
    setCurrent(z < fitZ.current * 1.6 ? -1 : best)
  }, [])

  const moving = useCallback(() => {
    if (layer.current && layer.current.style.willChange !== 'transform') layer.current.style.willChange = 'transform'
    clearTimeout(settleTimer.current)
    settleTimer.current = setTimeout(settle, 160)
  }, [settle])

  // Everything in view. On a phone that's the full height, and you swipe along it
  const fitCam = useCallback((): Cam => {
    const { w: vw, h: vh } = sizeRef.current
    const ins = insetRef.current
    if (vw >= 640) return camFor({ x: 0, y: 0, w: W, h: H }, vw, vh, ins, MAX_Z)
    const z = (vh - ins.top - ins.bottom) / H
    return { z, x: vw / 2 - (W / 2) * z, y: ins.top }
  }, [])

  // Keep some of the work in view, whatever the visitor does
  const bound = useCallback((c: Cam): Cam => {
    const { w: vw, h: vh } = sizeRef.current
    const mx = Math.min(vw * 0.5, (W * c.z) * 0.5)
    const my = Math.min(vh * 0.5, (H * c.z) * 0.5)
    return { z: c.z, x: clamp(c.x, vw - mx - W * c.z, mx), y: clamp(c.y, vh - my - H * c.z, my) }
  }, [])

  // Where the drift has the camera at time t. On a desktop it leans in a little from everything
  // and wanders, towards the case studies (top left) first; a phone starts on them, closer, and
  // roams the whole canvas
  const driftCam = useCallback((t: number): Cam => {
    const { w: vw, h: vh } = sizeRef.current
    const ins = insetRef.current
    const small = vw < 640
    const lean = easeInOut(clamp((t - 900) / 5200, 0, 1))
    const z = small ? Math.max(fitZ.current, 0.22) : fitZ.current * (1 + 0.1 * lean)
    const ax = Math.max(0, (W - (vw - ins.left - ins.right) / z) / 2 + (small ? 0 : 60))
    const ay = Math.max(0, (H - (vh - ins.top - ins.bottom) / z) / 2 + (small ? 0 : 40))
    const cx = small ? W / 2 - ax * Math.cos((t / 150000) * Math.PI * 2) : W / 2 - ax * Math.sin((t / 64000) * Math.PI * 2) * lean
    const cy = small ? H / 2 - ay * Math.cos((t / 97000) * Math.PI * 2) - 32 / z : H / 2 - ay * Math.sin((t / 47000) * Math.PI * 2) * lean
    return { z, x: (ins.left + vw - ins.right) / 2 - cx * z, y: (ins.top + vh - ins.bottom) / 2 - cy * z }
  }, [])

  // The one loop: a flight, a glide after a throw, or the drift before anyone touches it
  const tick = useCallback((now: number) => {
    const dt = Math.min(48, now - (last.current || now))
    last.current = now
    let more = false
    const f = fly.current
    if (f) {
      const p = clamp((now - f.t0) / f.ms, 0, 1)
      cam.current = f.path(f.ease(p))
      if (p >= 1) { fly.current = null; f.done?.() } else more = true
    } else if (inertia.current) {
      const v = inertia.current
      const before = cam.current
      cam.current = bound({ ...before, x: before.x + v.vx * dt, y: before.y + v.vy * dt })
      const decay = Math.pow(0.94, dt / 16.67)
      v.vx *= decay
      v.vy *= decay
      if (cam.current.x === before.x) v.vx = 0
      if (cam.current.y === before.y) v.vy = 0
      if (Math.hypot(v.vx, v.vy) < 0.015) inertia.current = null
      else more = true
    } else if (drift.current.on && visible.current) {
      const d = drift.current
      d.t += dt
      cam.current = driftCam(d.t)
      more = true
    }
    apply()
    if (more) raf.current = requestAnimationFrame(tick)
    else { raf.current = 0; last.current = 0; moving() }
  }, [apply, bound, moving, driftCam])

  const kick = useCallback(() => {
    if (layer.current && layer.current.style.willChange !== 'transform') layer.current.style.willChange = 'transform'
    if (!raf.current) { last.current = 0; raf.current = requestAnimationFrame(tick) }
  }, [tick])

  // Anything the visitor does stops the drift for good
  const userMoved = useRef(false)
  const takeOver = useCallback(() => {
    userMoved.current = true
    drift.current.on = false
    inertia.current = null
    fly.current = null
    setTouched(true)
    stopCycle()
    // On a phone the preview covers the bottom of the canvas: once they're exploring, it goes
    if (sizeRef.current.w < 640) setPreviews([])
  }, [])

  const flyTo = useCallback((to: Cam, done?: () => void) => {
    takeOver()
    const { w: vw, h: vh } = sizeRef.current
    if (reduced) { cam.current = to; apply(); moving(); done?.(); return }
    const { path, ms } = flight(cam.current, to, vw, vh)
    fly.current = { path, ms, t0: performance.now(), ease: easeInOut, done }
    kick()
  }, [apply, kick, moving, reduced, takeOver])

  const flyToRect = useCallback((r: Rect, maxZ: number, pad = 0, done?: () => void) => {
    const ins = insetRef.current
    flyTo(camFor(r, sizeRef.current.w, sizeRef.current.h, { top: ins.top + pad, right: ins.right + pad, bottom: ins.bottom + pad, left: ins.left + pad }, maxZ), done)
  }, [flyTo])

  const toFrame = useCallback((i: number) => {
    const f = frames[i]
    setSelected(null)
    setCurrent(i)
    // On a phone a wide frame would shrink to a strip: show where it starts instead
    const { w: vw, h: vh } = sizeRef.current
    const ins = insetRef.current
    const r = phone ? { x: f.x, y: f.y, w: Math.min(f.w, (vw - ins.left - ins.right) / 0.26), h: Math.min(f.h, (vh - ins.top - ins.bottom) / 0.26) } : { x: f.x, y: f.y, w: f.w, h: f.h }
    flyToRect(r, 1.2, phone ? 0 : 16)
  }, [flyToRect, phone])

  const toBoard = useCallback((i: number) => {
    const b = boards[i]
    setSelected(i)
    flyToRect({ x: b.x, y: b.y, w: b.w, h: b.h }, MAX_Z, phone ? 8 : 48)
  }, [flyToRect, phone])

  const fitAll = useCallback(() => { setSelected(null); flyTo(fitCam()) }, [fitCam, flyTo])

  const zoomBy = useCallback((k: number) => {
    const { w: vw, h: vh } = sizeRef.current
    const to = bound(zoomAbout(cam.current, k, vw / 2, vh / 2, fitZ.current * 0.5, MAX_Z))
    if (reduced) { takeOver(); cam.current = to; apply(); moving(); return }
    takeOver()
    const from = { ...cam.current }
    fly.current = { path: (t) => lerpCam(from, to, t), ms: 280, t0: performance.now(), ease: easeOut }
    kick()
  }, [apply, bound, kick, moving, reduced, takeOver])

  // Size, and the camera that fits it all
  useLayoutEffect(() => {
    const el = viewport.current
    if (!el) return
    const measure = () => {
      const r = el.getBoundingClientRect()
      const next = { w: Math.round(r.width), h: Math.round(r.height) }
      if (next.w === sizeRef.current.w && next.h === sizeRef.current.h) return
      const first = sizeRef.current.w === 0
      sizeRef.current = next
      setSize(next)
      insetRef.current = next.w < 640 ? { top: 64, right: 16, bottom: 64, left: 16 } : { top: 96, right: 48, bottom: 56, left: 48 }
      fitZ.current = fitCam().z
      if (first || !userMoved.current) cam.current = drift.current.on ? driftCam(drift.current.t) : fitCam()
      else cam.current = bound(cam.current)
      lastZ.current = 0
      apply()
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [apply, bound, fitCam, driftCam])

  // In view: the drift runs, and the first time, the comments drop in one by one
  const started = useRef(false)
  useEffect(() => {
    const el = viewport.current
    if (!el) return
    const timers: ReturnType<typeof setTimeout>[] = []
    const io = new IntersectionObserver(([e]) => {
      visible.current = e.isIntersecting
      if (e.isIntersecting) kick()
      if (e.isIntersecting && !started.current) {
        started.current = true
        pins.forEach((_, i) => timers.push(setTimeout(() => setDropped((n) => Math.max(n, i + 1)), (reduced ? 0 : 900) + i * (reduced ? 0 : 160))))
        timers.push(setTimeout(() => {
          if (openRef.current !== null || userMoved.current) return
          cycle.current.on = true
          showNext()
        }, reduced ? 200 : 900 + pins.length * 160 + 700))
      }
    }, { threshold: 0.2 })
    io.observe(el)
    return () => { io.disconnect(); timers.forEach(clearTimeout); stopCycle() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => { if (reduced) drift.current.on = false }, [reduced])

  useEffect(() => () => { cancelAnimationFrame(raf.current); clearTimeout(settleTimer.current); clearTimeout(wheelHintTimer.current) }, [])

  // Re-place things that only exist once React has rendered them
  useLayoutEffect(() => { apply() }, [apply, selected, dropped, phone])

  // Where a note opens: of the four corners round its pin, the one that covers the least —
  // never a frame's name, another pin or the canvas's own controls, and stays on screen
  const placeFor = (i: number, w: number, h: number): Side => {
    const vp = viewport.current?.getBoundingClientRect()
    const { w: vw, h: vh } = sizeRef.current
    if (!vp) return { h: 'right', v: 'down' }
    const rel = (el: Element | null | undefined) => { if (!el) return null; const r = el.getBoundingClientRect(); return { l: r.left - vp.left, t: r.top - vp.top, r: r.right - vp.left, b: r.bottom - vp.top } }
    const avoid: { l: number; t: number; r: number; b: number; k: number }[] = []
    labelEls.current.forEach((el) => { const r = rel(el?.firstElementChild); if (r) avoid.push({ ...r, l: r.l - 12, t: r.t - 12, r: r.r + 12, b: r.b + 12, k: 4 }) })
    pins.forEach((_, k) => { if (k !== i) { const p = pinPos.current[k]; avoid.push({ l: p.x - 34, t: p.y - 18, r: p.x + 14, b: p.y + 30, k: 4 }) } })
    viewport.current?.querySelectorAll('.cv-chrome').forEach((el) => { const r = rel(el); if (r) avoid.push({ ...r, k: 2 }) })
    const p = pinPos.current[i]
    const ox = p.x - 28
    const oy = p.y + 24
    const options: Side[] = [{ h: 'right', v: 'down' }, { h: 'right', v: 'up' }, { h: 'left', v: 'down' }, { h: 'left', v: 'up' }]
    let best = options[0]
    let least = Infinity
    for (const o of options) {
      const l = o.h === 'right' ? ox + 46 : ox - 8 - w
      const t = o.v === 'down' ? oy - 38 : oy - h
      const r = l + w
      const b = t + h
      let cost = 0
      for (const a of avoid) cost += a.k * Math.max(0, Math.min(r, a.r) - Math.max(l, a.l)) * Math.max(0, Math.min(b, a.b) - Math.max(t, a.t))
      const inside = Math.max(0, Math.min(r, vw - 8) - Math.max(l, 8)) * Math.max(0, Math.min(b, vh - 8) - Math.max(t, 60))
      cost += 3 * (w * h - inside)
      if (cost < least - 1) { least = cost; best = o }
    }
    return best
  }

  // Before anyone touches the canvas, the notes open one at a time, a few seconds each
  const ORDER = ['Richard Simms', 'Henry Vesander', 'Winnie Bamra', 'Ahmed Hakeem', 'David Deville'].map((n) => pins.findIndex((p) => p.t.name === n)).filter((i) => i >= 0)
  const cycle = useRef<{ on: boolean; k: number; t?: ReturnType<typeof setTimeout> }>({ on: false, k: 0 })
  const hovering = useRef(false)
  function stopCycle() { cycle.current.on = false; clearTimeout(cycle.current.t) }
  function showNext() {
    if (!cycle.current.on) return
    const i = ORDER[cycle.current.k++ % ORDER.length]
    setSides((s) => s.map((v, k) => (k === i ? placeFor(i, 248, 132) : v)))
    setPreviews([i])
    const hide = () => {
      if (!cycle.current.on) return
      if (hovering.current) { cycle.current.t = setTimeout(hide, 800); return }
      setPreviews([])
      cycle.current.t = setTimeout(showNext, 500)
    }
    cycle.current.t = setTimeout(hide, 4800)
  }

  const openComment = (i: number, viaList = false) => {
    stopCycle()
    setPreviews([])
    if (!viaList && openPin === i) { setOpenPin(null); return }
    if (viaList) {
      takeOver()
      const b = pins[i].board
      // Frame the screen with room for the note beside it
      flyToRect({ x: b.x - 40, y: b.y - 60, w: b.w + (phone ? 80 : 900), h: b.h + 160 }, 1, 0, () => {
        setSides((s) => s.map((v, k) => (k === i ? placeFor(i, 340, 290) : v)))
        setOpenPin(i)
      })
      if (phone) setList(false)
      return
    }
    setSides((s) => s.map((v, k) => (k === i ? placeFor(i, 340, 290) : v)))
    setOpenPin(i)
  }

  // Dragging, throwing, pinching, clicking and double-clicking, all from pointer events
  const pointers = useRef(new Map<number, { x: number; y: number }>())
  const gesture = useRef<{
    sx: number; sy: number; moved: boolean; board: number | null
    samples: { x: number; y: number; t: number }[]
    pinch?: { d: number; mx: number; my: number; cam: Cam }
  } | null>(null)
  const lastTap = useRef({ t: 0, board: -1 as number | null })

  const local = (e: { clientX: number; clientY: number }) => {
    const r = viewport.current!.getBoundingClientRect()
    return { x: e.clientX - r.left, y: e.clientY - r.top }
  }

  const onPointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('[data-ui]')) return
    if (e.button !== 0 && e.pointerType === 'mouse') return
    takeOver()
    const p = local(e)
    pointers.current.set(e.pointerId, p)
    viewport.current?.setPointerCapture(e.pointerId)
    if (pointers.current.size === 1) {
      const hit = (e.target as HTMLElement).closest<HTMLElement>('[data-board]')
      gesture.current = { sx: p.x, sy: p.y, moved: false, board: hit ? Number(hit.dataset.board) : null, samples: [{ ...p, t: e.timeStamp }] }
    } else if (pointers.current.size === 2 && gesture.current) {
      const [a, b] = Array.from(pointers.current.values())
      gesture.current.moved = true
      gesture.current.pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2, cam: { ...cam.current } }
    }
  }

  const onPointerMove = (e: React.PointerEvent) => {
    const g = gesture.current
    const prev = pointers.current.get(e.pointerId)
    if (!g || !prev) return
    const p = local(e)
    pointers.current.set(e.pointerId, p)
    if (g.pinch && pointers.current.size >= 2) {
      const [a, b] = Array.from(pointers.current.values())
      const d = Math.hypot(a.x - b.x, a.y - b.y)
      const mx = (a.x + b.x) / 2
      const my = (a.y + b.y) / 2
      const c0 = g.pinch.cam
      const z = clamp(c0.z * (d / g.pinch.d), fitZ.current * 0.5, MAX_Z)
      const f = z / c0.z
      cam.current = bound({ z, x: mx - (g.pinch.mx - c0.x) * f, y: my - (g.pinch.my - c0.y) * f })
    } else {
      if (!g.moved && Math.hypot(p.x - g.sx, p.y - g.sy) < 4) return
      if (!g.moved) { g.moved = true; viewport.current?.setAttribute('data-dragging', '') }
      cam.current = bound({ ...cam.current, x: cam.current.x + (p.x - prev.x), y: cam.current.y + (p.y - prev.y) })
      g.samples.push({ ...p, t: e.timeStamp })
      if (g.samples.length > 6) g.samples.shift()
    }
    apply()
    moving()
  }

  const onPointerUp = (e: React.PointerEvent, cancelled = false) => {
    const g = gesture.current
    if (!pointers.current.has(e.pointerId)) return
    pointers.current.delete(e.pointerId)
    if (pointers.current.size > 0) {
      // One finger left after a pinch: carry on dragging from it
      if (g) { g.pinch = undefined; g.samples = [] }
      return
    }
    viewport.current?.removeAttribute('data-dragging')
    gesture.current = null
    if (!g || cancelled) return
    if (g.moved) {
      const s = g.samples.filter((k) => e.timeStamp - k.t < 90)
      if (s.length >= 2 && !reduced) {
        const a = s[0]
        const b = s[s.length - 1]
        const dt = Math.max(8, b.t - a.t)
        const vx = (b.x - a.x) / dt
        const vy = (b.y - a.y) / dt
        if (Math.hypot(vx, vy) > 0.1) { inertia.current = { vx, vy }; kick() }
      }
      return
    }
    // A click: select a screen, twice to zoom to it; on bare canvas, let go of everything
    const now = e.timeStamp
    if (g.board !== null) {
      const again = lastTap.current.board === g.board && now - lastTap.current.t < 350
      lastTap.current = { t: again ? 0 : now, board: g.board }
      if (again) toBoard(g.board)
      else setSelected(g.board)
    } else {
      lastTap.current = { t: 0, board: null }
      setSelected(null)
      setOpenPin(null)
      setPreviews([])
    }
  }

  // ⌘/Ctrl + wheel (and trackpad pinch) zooms; sideways swipes pan; plain scroll is the page's
  useEffect(() => {
    const el = viewport.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      if ((e.target as HTMLElement).closest('[data-ui]')) return
      const scale = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 400 : 1
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault()
        takeOver()
        const r = el.getBoundingClientRect()
        const pinch = e.ctrlKey && !e.metaKey && Math.abs(e.deltaY) < 40
        const k = Math.exp(-e.deltaY * scale * (pinch ? 0.012 : 0.0022))
        cam.current = bound(zoomAbout(cam.current, k, e.clientX - r.left, e.clientY - r.top, fitZ.current * 0.5, MAX_Z))
        apply()
        moving()
      } else if (Math.abs(e.deltaX) > Math.abs(e.deltaY) * 1.2) {
        e.preventDefault()
        takeOver()
        cam.current = bound({ ...cam.current, x: cam.current.x - e.deltaX * scale })
        apply()
        moving()
      } else if (Math.abs(e.deltaY) > 4) {
        setWheelHint(true)
        clearTimeout(wheelHintTimer.current)
        wheelHintTimer.current = setTimeout(() => setWheelHint(false), 1400)
      }
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [apply, bound, moving, takeOver])

  const onKeyDown = (e: React.KeyboardEvent) => {
    if ((e.target as HTMLElement) !== viewport.current) return
    const step = 120
    const pan = (dx: number, dy: number) => { e.preventDefault(); takeOver(); flyTo(bound({ ...cam.current, x: cam.current.x + dx, y: cam.current.y + dy })) }
    if (e.key === 'ArrowLeft') pan(step, 0)
    else if (e.key === 'ArrowRight') pan(-step, 0)
    else if (e.key === 'ArrowUp') pan(0, step)
    else if (e.key === 'ArrowDown') pan(0, -step)
    else if (e.key === '+' || e.key === '=') { e.preventDefault(); zoomBy(1.4) }
    else if (e.key === '-' || e.key === '_') { e.preventDefault(); zoomBy(1 / 1.4) }
    else if (e.key === '0' || (e.shiftKey && e.key === '!')) { e.preventDefault(); fitAll() }
    else if (e.key === 'Escape') { setSelected(null); setOpenPin(null); setPreviews([]) }
  }

  // The minimap: press or drag to put the view there
  const miniDrag = useRef(false)
  const onMini = (e: React.PointerEvent<HTMLDivElement>, start: boolean) => {
    if (start) { miniDrag.current = true; e.currentTarget.setPointerCapture(e.pointerId); takeOver() }
    if (!miniDrag.current) return
    const r = e.currentTarget.getBoundingClientRect()
    const wx = (e.clientX - r.left) / m
    const wy = (e.clientY - r.top) / m
    const { w: vw, h: vh } = sizeRef.current
    const z = cam.current.z
    const to = bound({ z, x: vw / 2 - wx * z, y: vh / 2 - wy * z })
    if (start && !reduced) flyTo(to)
    else { fly.current = null; cam.current = to; apply(); moving() }
  }

  const sel = selected !== null ? boards[selected] : null
  const selFrame = sel ? frames[sel.frame] : null

  return (
    <div
      ref={viewport}
      tabIndex={0}
      role="application"
      aria-roledescription="canvas"
      aria-label="A canvas of every screen, one frame per project. Drag to move, arrow keys to pan, plus and minus to zoom, 0 to see everything."
      className="cv-viewport relative h-full w-full select-none overflow-hidden outline-none"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={(e) => onPointerUp(e)}
      onPointerCancel={(e) => onPointerUp(e, true)}
      onKeyDown={onKeyDown}
    >
      <div ref={dots} className="cv-dots pointer-events-none absolute" aria-hidden />

      {/* The world */}
      <div ref={layer} className="cv-layer absolute left-0 top-0" style={{ width: W, height: H }} data-names="0">
        {frames.map((f) => (
          <div key={f.id} className="cv-frame absolute" style={{ left: f.x, top: f.y, width: f.w, height: f.h, ['--c' as string]: f.colour }} />
        ))}
        {boards.map((b, i) => (
          <div
            key={b.screen.id}
            data-board={i}
            className="cv-board absolute"
            style={{ left: b.x, top: b.y, width: b.w, height: b.h, ['--c' as string]: frames[b.frame].colour }}
          >
            <span className="cv-name" aria-hidden>{b.screen.title}</span>
            <ScreenTile screen={b.screen} fit="cover" className="cv-art" style={{ position: 'absolute', inset: 0 }} eager={b.screen.best} />
          </div>
        ))}
      </div>

      {/* Frame names, the size they'd be in Figma whatever the zoom */}
      <div className="pointer-events-none absolute inset-0">
        {frames.map((f, i) => (
          <div key={f.id} ref={(el) => { labelEls.current[i] = el }} className="absolute left-0 top-0 will-change-transform">
            <div className="pointer-events-auto absolute bottom-[6px] left-0 flex items-center gap-1 whitespace-nowrap" data-ui>
              <button
                type="button"
                onClick={() => toFrame(i)}
                className="cv-pill flex h-[22px] items-center gap-1.5 rounded-[6px] px-2 text-[11px] font-medium text-white transition-[filter] hover:brightness-110"
                style={{ background: f.colour }}
                aria-label={`Go to ${f.name}`}
              >
                {f.name}
                <span className="font-mono text-[10px] text-white/70">{f.boards.length}</span>
              </button>
              {f.work && f.work !== 'shader-wall' && f.work !== 'dispatch' && f.work !== 'thesis' && (
                <button
                  type="button"
                  onClick={() => onCaseStudy(f.work!)}
                  className="flex h-[22px] items-center gap-1 rounded-[6px] px-1.5 text-[11px] text-muted hover:text-foreground transition-colors"
                  style={{ ...POPOVER, boxShadow: `0 0 0 1px ${LINE}` }}
                  aria-label={`Read the ${f.name} case study, below`}
                >
                  Case study <ArrowDown className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* The selected screen: Figma's outline, handles and size, and a way in */}
      {sel && selFrame && (
        <div ref={selEl} className="pointer-events-none absolute left-0 top-0" style={{ ['--c' as string]: selFrame.colour }}>
          <div className="absolute inset-0" style={{ boxShadow: `0 0 0 1.5px ${selFrame.colour}` }} />
          {[[0, 0], [1, 0], [0, 1], [1, 1]].map(([hx, hy]) => (
            <span key={`${hx}${hy}`} className="absolute h-[7px] w-[7px] bg-white" style={{ left: `calc(${hx * 100}% - 3.5px)`, top: `calc(${hy * 100}% - 3.5px)`, boxShadow: `0 0 0 1.5px ${selFrame.colour}` }} />
          ))}
          <div className="pointer-events-auto absolute bottom-[calc(100%+8px)] left-0 flex max-w-[min(100vw,420px)] items-center gap-1" data-ui>
            <span className="truncate rounded-[5px] px-1.5 py-0.5 text-[11px] font-medium text-white" style={{ background: selFrame.colour }}>{sel.screen.title}</span>
            {sel.screen.href && (
              <a
                href={sel.screen.href}
                {...(sel.screen.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                className="flex shrink-0 items-center gap-0.5 rounded-[5px] px-1.5 py-0.5 text-[11px] text-foreground hover:text-accent transition-colors"
                style={{ ...POPOVER, boxShadow: `0 0 0 1px ${LINE}` }}
              >
                Open <ArrowUpRight className="h-3 w-3" />
              </a>
            )}
          </div>
          <span className="absolute left-1/2 top-[calc(100%+8px)] -translate-x-1/2 whitespace-nowrap rounded-[4px] px-1.5 py-px font-mono text-[10px] text-white" style={{ background: selFrame.colour }}>
            {sel.screen.w} × {sel.screen.h}
          </span>
        </div>
      )}

      {/* Comments pinned to the work */}
      <div className="pointer-events-none absolute inset-0 [&_[data-ui]]:pointer-events-auto">
        {pins.map((p, i) => (
          <CommentPin
            key={p.t.name}
            ref={(el) => { pinEls.current[i] = el }}
            pin={p}
            index={i}
            shown={i < dropped}
            reduced={reduced}
            state={openPin === i ? 'open' : previews.includes(i) && !phone ? 'preview' : 'closed'}
            side={sides[i]}
            docked={phone}
            onPin={() => openComment(i)}
            onExpand={() => openComment(i)}
            onClose={() => setOpenPin(null)}
            onHover={(on) => { hovering.current = on }}
          />
        ))}
      </div>

      {/* On a phone the open note sits along the bottom instead of beside its pin */}
      <AnimatePresence>
        {phone && openPin === null && previews.length > 0 && (
          <motion.button
            type="button"
            data-ui
            key={`p${previews[0]}`}
            onClick={() => openComment(previews[0])}
            className="absolute inset-x-3 bottom-3 z-40 flex items-start gap-3 rounded-xl p-3 text-left"
            style={POPOVER}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ type: 'spring', stiffness: 420, damping: 34 }}
          >
            <span className="shrink-0"><Avatar t={pins[previews[0]].t} size={28} /></span>
            <span className="min-w-0">
              <span className="block text-[11px] text-muted"><span className="font-medium text-foreground">{pins[previews[0]].t.name}</span> · {pins[previews[0]].t.company}</span>
              <span className="mt-0.5 block text-[13px] leading-snug text-foreground">&ldquo;{pins[previews[0]].t.pull}&rdquo;</span>
            </span>
          </motion.button>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {phone && openPin !== null && (
          <motion.div
            data-ui
            key={openPin}
            className="absolute inset-x-3 bottom-3 z-40 rounded-xl"
            style={POPOVER}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ type: 'spring', stiffness: 420, damping: 34 }}
          >
            <Card pin={pins[openPin]} onClose={() => setOpenPin(null)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top: the frames, and the comments */}
      <div className="pointer-events-none absolute inset-x-3 top-3 z-30 flex items-start justify-between gap-2">
        <nav data-ui aria-label="Frames" className="cv-chrome cv-panel cv-scroll pointer-events-auto flex min-w-0 items-center gap-0.5 overflow-x-auto p-1">
          <button type="button" onClick={fitAll} className={`cv-chip ${current === -1 ? 'is-on' : ''}`} aria-label="See everything">
            <Maximize className="h-3 w-3" />
            <span className="hidden sm:inline">All</span>
          </button>
          <span className="mx-0.5 h-4 w-px shrink-0" style={{ background: LINE }} />
          {frames.map((f, i) => (
            <button key={f.id} type="button" onClick={() => toFrame(i)} className={`cv-chip ${current === i ? 'is-on' : ''}`} aria-current={current === i ? 'true' : undefined}>
              <span className="h-2 w-2 shrink-0 rounded-[2px]" style={{ background: f.colour }} />
              {f.name}
            </button>
          ))}
        </nav>
        <button
          type="button"
          data-ui
          onClick={() => setList((v) => !v)}
          aria-pressed={list}
          aria-label={`Comments (${pins.length})`}
          className={`cv-chrome cv-panel pointer-events-auto flex h-9 shrink-0 items-center gap-1.5 px-3 text-[12px] transition-colors ${list ? 'text-foreground' : 'text-muted hover:text-foreground'}`}
        >
          <MessageCircle className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Comments</span>
          <span className="font-mono text-[11px]">{pins.length}</span>
        </button>
      </div>

      <CommentList open={list} active={openPin} onPick={(i) => openComment(i, true)} onClose={() => setList(false)} />

      {/* Bottom left: how to move about */}
      <div className={`pointer-events-none absolute bottom-3 z-20 transition-opacity duration-700 ${phone ? 'right-3' : 'left-1/2 -translate-x-1/2'} ${touched || (phone && (openPin !== null || previews.length > 0)) ? 'opacity-0' : 'opacity-100'}`}>
        <p className="cv-chrome cv-panel whitespace-nowrap px-3 py-2 text-[11px] text-muted">
          {phone ? 'Swipe sideways to move · pinch to zoom' : <>Drag to move · <kbd className="font-sans">{isMac() ? '⌘' : 'Ctrl'}</kbd> + scroll to zoom · double-click a screen</>}
        </p>
      </div>

      {/* Plain scrolling is for the page; say how to zoom instead */}
      <AnimatePresence>
        {wheelHint && !phone && (
          <motion.p
            className="cv-panel pointer-events-none absolute left-1/2 top-1/2 z-30 -translate-x-1/2 -translate-y-1/2 px-3 py-2 text-[12px] text-foreground"
            initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}
          >
            Hold {isMac() ? '⌘' : 'Ctrl'} and scroll to zoom
          </motion.p>
        )}
      </AnimatePresence>

      {/* Bottom left: the minimap and the zoom (the page's chat button lives bottom right) */}
      <div data-ui className={`cv-chrome cv-panel absolute bottom-3 left-3 z-20 overflow-hidden ${phone && (openPin !== null || previews.length > 0) ? 'opacity-0 pointer-events-none' : ''}`} style={{ width: MINI + 16 }}>
        <div
          className="relative m-2 cursor-pointer overflow-hidden rounded-[4px]"
          style={{ width: MINI, height: H * m, background: 'color-mix(in srgb, var(--foreground) 4%, transparent)' }}
          onPointerDown={(e) => onMini(e, true)}
          onPointerMove={(e) => onMini(e, false)}
          onPointerUp={() => { miniDrag.current = false }}
          onPointerCancel={() => { miniDrag.current = false }}
          aria-hidden
        >
          {boards.map((b) => (
            <span key={b.screen.id} className="absolute rounded-[0.5px]" style={{ left: b.x * m, top: b.y * m, width: Math.max(1, b.w * m), height: Math.max(1, b.h * m), background: frames[b.frame].colour, opacity: 0.7 }} />
          ))}
          <div ref={miniView} className="absolute left-0 top-0 rounded-[2px]" style={{ boxShadow: '0 0 0 1px var(--foreground)', background: 'color-mix(in srgb, var(--foreground) 8%, transparent)' }} />
        </div>
        <div className="flex items-center justify-between border-t px-1 py-1" style={{ borderColor: LINE }}>
          <button type="button" onClick={() => zoomBy(1 / 1.5)} className="cv-icon" aria-label="Zoom out"><Minus className="h-3.5 w-3.5" /></button>
          <button type="button" onClick={fitAll} className="cv-zoom font-mono tabular-nums" aria-label="Zoom to fit everything" title="Zoom to fit (0)"><span ref={zoomText}>—</span></button>
          <button type="button" onClick={() => zoomBy(1.5)} className="cv-icon" aria-label="Zoom in"><Plus className="h-3.5 w-3.5" /></button>
        </div>
      </div>
    </div>
  )
}

function lerpCam(a: Cam, b: Cam, t: number): Cam {
  // Zoom moves in log space so each step feels the same size
  const z = Math.exp(Math.log(a.z) + (Math.log(b.z) - Math.log(a.z)) * t)
  const k = (z - a.z) / (b.z - a.z || 1)
  const f = b.z === a.z ? t : k
  return { z, x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f }
}
