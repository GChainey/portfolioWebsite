'use client'

import { useEffect, useRef, useState } from 'react'
import type { Widget } from '@/content/home-showcase'

// Three small, live pieces of Shader Wall for the homepage's details. Its wallpapers are WebGL,
// which a replay can't capture, so these are drawn in CSS: a stand-in for the shader, and the
// app's own controls (its sliders, its presets, Make Editable Copy) around it.

const PALETTES = [
  ['#2d5a27', '#e09a4e', '#1f3b33', '#4547a9', '#d9637b'], // Forest Dusk, the app's own
  ['#ff7a59', '#ffd166', '#ef476f', '#7b2cbf', '#118ab2'],
  ['#0b132b', '#3a86ff', '#8338ec', '#06d6a0', '#1c2541'],
  ['#f4a261', '#e76f51', '#2a9d8f', '#264653', '#e9c46a'],
]

export interface Params { speed: number; swirl: number; grain: number; hue: number; palette: number }

// The wallpaper: soft blobs of the palette drifting, swirled, with grain on top
export function Shader({ p }: { p: Params }) {
  const c = PALETTES[p.palette]
  const dur = 26 - p.speed * 20
  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: c[2], filter: `hue-rotate(${p.hue}deg)`, transition: 'filter 1.2s ease' }}>
      <style>{DRIFT_CSS}</style>
      <div className="absolute inset-0" style={{ transform: `rotate(${p.swirl * 50}deg) scale(${1 + p.swirl * 0.2})`, transition: 'transform .6s ease' }}>
      <div
        className="absolute -inset-1/2"
        style={{
          background: `radial-gradient(circle at 30% 35%, ${c[0]} 0, transparent 38%), radial-gradient(circle at 70% 30%, ${c[1]} 0, transparent 34%), radial-gradient(circle at 60% 72%, ${c[3]} 0, transparent 40%), radial-gradient(circle at 25% 75%, ${c[4]} 0, transparent 36%)`,
          filter: `blur(${18 + p.swirl * 26}px)`,
          animation: `sw-drift ${dur}s ease-in-out infinite alternate`,
          transition: 'filter .8s ease, background 1.2s ease',
        }}
      />
      </div>
      <div
        className="absolute inset-0 mix-blend-overlay"
        style={{ opacity: 0.15 + p.grain * 0.5, backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")" }}
      />
    </div>
  )
}

function Slider({ label, value, onChange }: { label: string; value: number; onChange?: (v: number) => void }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="flex justify-between text-[12px] leading-[14px] text-white/60"><span>{label}</span><span className="font-mono tabular-nums">{value.toFixed(2)}</span></span>
      <input
        type="range" min={0} max={1} step={0.01} value={value}
        onChange={(e) => onChange?.(Number(e.target.value))}
        readOnly={!onChange}
        tabIndex={onChange ? 0 : -1}
        className="sw-range h-1 w-full cursor-pointer appearance-none rounded-full"
        style={{ background: `linear-gradient(to right, #3b82f6 ${value * 100}%, rgba(255,255,255,.15) ${value * 100}%)` }}
      />
    </label>
  )
}

const DRIFT_CSS = '@keyframes sw-drift { 0% { transform: rotate(0deg) scale(1) } 50% { transform: rotate(110deg) scale(1.15) } 100% { transform: rotate(-40deg) scale(1.05) } }'
const RANGE_CSS = `.sw-range::-webkit-slider-thumb{-webkit-appearance:none;width:14px;height:14px;border-radius:9999px;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.4)} .sw-range::-moz-range-thumb{width:14px;height:14px;border:0;border-radius:9999px;background:#fff}`

// The app window: the wallpaper on the left, the controls on the right
function Window({ p, children }: { p: Params; children: React.ReactNode }) {
  return (
    <div className="absolute inset-0 flex bg-[#1c1c1e] text-white">
      <style>{RANGE_CSS}</style>
      <div className="relative m-3 mr-0 flex-1 overflow-hidden rounded-lg"><Shader p={p} /></div>
      <div className="flex w-[44%] flex-col gap-3 p-4">{children}</div>
    </div>
  )
}

// Drag them yourself. Until you do, one drifts on its own to show they're live
function Sliders() {
  const [p, setP] = useState<Params>({ speed: 0.6, swirl: 0.4, grain: 0.5, hue: 0, palette: 0 })
  const touched = useRef(false)
  useEffect(() => {
    let t = 0
    const id = setInterval(() => {
      if (touched.current) return
      t += 0.05
      setP((q) => ({ ...q, swirl: 0.5 + Math.sin(t) * 0.4 }))
    }, 60)
    return () => clearInterval(id)
  }, [])
  const set = (k: keyof Params) => (v: number) => { touched.current = true; setP((q) => ({ ...q, [k]: v })) }
  return (
    <Window p={p}>
      <Slider label="Speed" value={p.speed} onChange={set('speed')} />
      <Slider label="Swirl" value={p.swirl} onChange={set('swirl')} />
      <Slider label="Colour" value={p.hue / 360} onChange={(v) => set('hue')(v * 360)} />
    </Window>
  )
}

// An agent asks for a change over MCP, and the sliders move to it
const ASKS = [
  { say: 'Warmer, and slower', to: { speed: 0.2, hue: 330, swirl: 0.3 } },
  { say: 'More swirl, cooler', to: { speed: 0.7, hue: 140, swirl: 0.9 } },
]
function Agent() {
  const [step, setStep] = useState(0)
  const [typed, setTyped] = useState(0)
  const [p, setP] = useState<Params>({ speed: 0.6, swirl: 0.5, grain: 0.4, hue: 0, palette: 0 })
  const ask = ASKS[step % ASKS.length]
  const done = typed >= ask.say.length
  useEffect(() => {
    setTyped(0)
    const type = setInterval(() => setTyped((n) => n + 1), 45)
    const apply = setTimeout(() => setP((q) => ({ ...q, ...ask.to })), ask.say.length * 45 + 600)
    const next = setTimeout(() => setStep((s) => s + 1), ask.say.length * 45 + 4200)
    return () => { clearInterval(type); clearTimeout(apply); clearTimeout(next) }
  }, [step]) // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <Window p={p}>
      <div className="rounded-lg bg-white/10 px-3 py-2 text-[13px] leading-[17px] text-white/90">
        {ask.say.slice(0, typed)}<span className={done ? 'opacity-0' : 'animate-pulse'}>▍</span>
      </div>
      <div className={`flex items-center gap-1.5 text-[11px] text-white/60 transition-opacity duration-500 ${done ? 'opacity-100' : 'opacity-0'}`}>
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-green-400" /><span className="whitespace-nowrap font-mono">shaderwall.set_params</span>
      </div>
      <Slider label="Speed" value={p.speed} />
      <Slider label="Swirl" value={p.swirl} />
    </Window>
  )
}

// The presets, picked one after another, then a copy of one made editable
const PRESETS = ['Forest Dusk', 'Mesh Gradient', 'Metaballs']
function Presets() {
  const [i, setI] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setI((n) => (n + 1) % (PRESETS.length + 1)), 1800)
    return () => clearInterval(id)
  }, [])
  const copying = i === PRESETS.length
  const pick = copying ? 0 : i
  return (
    <Window p={{ speed: 0.5, swirl: 0.5, grain: 0.4, hue: 0, palette: pick }}>
      <div className="flex flex-col gap-1">
        {PRESETS.map((name, k) => (
          <button key={name} onClick={() => setI(k)} className={`flex items-center gap-2 whitespace-nowrap rounded-md px-2 py-1.5 text-left text-[13px] transition-colors ${k === pick ? 'bg-white/15 text-white' : 'text-white/60'}`}>
            <span className="h-3 w-3 shrink-0 rounded-[4px]" style={{ background: `linear-gradient(135deg, ${PALETTES[k][0]}, ${PALETTES[k][1]}, ${PALETTES[k][3]})` }} />
            {name}
          </button>
        ))}
      </div>
      <div className={`mt-auto whitespace-nowrap rounded-md border px-2 py-1.5 text-center text-[12px] transition-colors duration-300 ${copying ? 'border-[#3b82f6] bg-[#3b82f6] text-white' : 'border-white/15 text-white/60'}`}>
        {copying ? 'Yours to change' : 'Make Editable Copy'}
      </div>
    </Window>
  )
}

// Laid out at one size (420x262, 16:10) and scaled to the card, like the replays
const SIZE = { w: 420, h: 262 }
export function ShaderWallWidget({ kind }: { kind: Widget }) {
  const box = useRef<HTMLDivElement>(null)
  const [k, setK] = useState(0)
  useEffect(() => {
    const el = box.current
    if (!el) return
    const fit = () => setK(el.clientWidth / SIZE.w)
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return (
    <div ref={box} className="absolute inset-0 overflow-hidden">
      <div className="absolute left-0 top-0 origin-top-left" style={{ width: SIZE.w, height: SIZE.h, transform: `scale(${k})` }}>
        {kind === 'sliders' ? <Sliders /> : kind === 'agent' ? <Agent /> : <Presets />}
      </div>
    </div>
  )
}

// For components/showcase/HomeWidgets, which hands Shader Wall's own widgets on to here
export const ShaderWallInner = ShaderWallWidget
