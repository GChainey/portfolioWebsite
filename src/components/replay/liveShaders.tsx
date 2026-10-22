'use client'

import { createElement, type ComponentType } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import * as Paper from '@paper-design/shaders-react'
import REGISTRY from '@/content/shaderwall-registry.json'

// Shader Wall's wallpapers are WebGL, which a replay can't record: the recorder laid a still of
// each canvas over it a few times a second, so in the replay they looked soft and stepped, like
// video. This draws the real shader instead, live, at full sharpness: the same Paper shader the app
// runs, with the settings the recording shows at that moment (which preset is selected, its slider
// values, its colours), read straight from the replayed page.
//
// The registry (content/shaderwall-registry.json) is Shader Wall's own list of shaders, taken from
// shaderwall.com: each one's Paper component, its defaults and its controls.

type Control =
  | { type: 'slider'; key: string; label: string; min: number; max: number; step: number }
  | { type: 'colors'; key: string; label: string; min: number; max: number }
  | { type: 'color'; key: string; label: string }
  | { type: 'select'; key: string; label: string; options: { value: string; label: string }[] }
type ShaderDef = { id: string; exportName: string; name: string; defaults: Record<string, unknown>; controls: Control[] }
type Params = Record<string, unknown>
type Look = { def: ShaderDef; params: Params }

const DEFS = REGISTRY as ShaderDef[]
const byName = (name: string) => DEFS.find((d) => d.name === name)

// Hides the recorded stills (and the blank canvas under them); the live shader goes in their place.
// Paper marks its own shader [data-paper-shader] too, so the live one is let through. One rule per
// string: rrweb inserts each as a rule
export const LIVE_SHADER_CSS = [
  '[data-paper-shader] > img, [data-paper-shader] > canvas { visibility: hidden !important; }',
  '[data-live-shader] canvas { visibility: visible !important; }',
]

// What the app is showing now: the selected shader (its row names its base shader) with the
// settings in the inspector laid over the base's defaults
function readLook(doc: Document): Look | null {
  const row = doc.querySelector('.sw-list [aria-selected="true"]')
  // A saved shader's row names its base under its own name; a preset's row is just the preset
  const text = (sel: string) => row?.querySelector(sel)?.textContent?.trim() ?? ''
  const def = byName(text('small')) ?? byName(text('.sw-row-name')) ?? byName(text('.sw-row-text > span'))
  if (!def) return null
  const params: Params = { ...def.defaults }
  // Sliders: each row reads "Label0.71"
  for (const input of Array.from(doc.querySelectorAll('input[type="range"]'))) {
    const text = (input.closest('label') ?? input.parentElement?.parentElement)?.textContent?.trim() ?? ''
    const m = text.match(/^(.*?)(-?\d+(?:\.\d+)?)$/)
    const c = m && def.controls.find((x) => x.type === 'slider' && x.label === m[1].trim())
    if (c) params[c.key] = Number(m[2])
  }
  const palette = Array.from(doc.querySelectorAll('.sw-palette input[type="color"]')).map((i) => i.getAttribute('value')).filter(Boolean)
  const colors = def.controls.find((x) => x.type === 'colors')
  if (colors && palette.length) params[colors.key] = palette
  for (const c of def.controls) {
    if (c.type !== 'color') continue
    const input = doc.querySelector(`input[type="color"][aria-label="${c.label}"]`)
    const v = input?.getAttribute('value')
    if (v) params[c.key] = v
  }
  return { def, params }
}

const same = (a: Look | null, b: Look | null) => !!a && !!b && a.def.id === b.def.id && JSON.stringify(a.params) === JSON.stringify(b.params)

interface Mount { host: Element; root: Root; box: HTMLDivElement; look: Look | null }

// Keeps a live shader in every [data-paper-shader] in the replay. Call update() after each event the
// replay applies; returns a cleanup
export function liveShaders(getDoc: () => Document | null | undefined) {
  const mounts: Mount[] = []
  // The desktop shows the active wallpaper. It follows the editor while the selected shader is the
  // active one, and holds its last look while another is being previewed
  let wallpaper: Look | null = null
  let frame = 0

  const render = (m: Mount, look: Look) => {
    if (same(m.look, look)) return
    m.look = look
    const Component = (Paper as unknown as Record<string, ComponentType<Record<string, unknown>>>)[look.def.exportName]
    if (!Component) return
    m.root.render(createElement(Component, { ...look.params, style: { position: 'absolute', inset: 0, width: '100%', height: '100%' }, minPixelRatio: 1, maxPixelCount: 1600 * 1000 }))
  }

  const sync = () => {
    frame = 0
    const doc = getDoc()
    if (!doc) return
    // Drop mounts whose host the replay removed
    for (let i = mounts.length - 1; i >= 0; i--) {
      if (!mounts[i].host.isConnected) { mounts[i].root.unmount(); mounts.splice(i, 1) }
    }
    const look = readLook(doc)
    if (look && (!wallpaper || /Active wallpaper/i.test(doc.querySelector('.sw-title small')?.textContent ?? ''))) wallpaper = look
    for (const host of Array.from(doc.querySelectorAll('[data-paper-shader]'))) {
      if (host.closest('[data-live-shader]')) continue
      // A hidden one (zero size) gets no WebGL context until it shows
      if (!mounts.some((x) => x.host === host) && !(host as HTMLElement).offsetWidth) continue
      let m = mounts.find((x) => x.host === host)
      if (!m) {
        const box = doc.createElement('div')
        // Its own stacking context: the site puts shader canvases at z-index -1, which sank ours behind a black wrapper
        box.setAttribute('style', 'position:absolute;inset:0;pointer-events:none;isolation:isolate;')
        box.setAttribute('data-live-shader', '')
        host.appendChild(box)
        m = { host, root: createRoot(box), box, look: null }
        mounts.push(m)
      }
      // The editor's preview shows what's selected; anything else (the desktop, the dock icon) the wallpaper
      const show = host.closest('.sw-preview') ? look : wallpaper
      if (show) render(m, show)
    }
  }

  return {
    update: () => { if (!frame) frame = requestAnimationFrame(sync) },
    destroy: () => { cancelAnimationFrame(frame); mounts.forEach((m) => m.root.unmount()); mounts.length = 0 },
  }
}
