'use client'

import dynamic from 'next/dynamic'

// Five homepages that put the visuals first: the hero stays, then a mass of screens to pass the
// eye test, then the work that mattered most, then colleagues' words with the best parts
// pulled out. Parked behind the homepage flag (⌘K, or ?home=<id>); the launchpad is /showcase.

export const VISUALS_FIRST = [
  { id: 'dive', name: 'A · Dive in', tag: 'Visuals first', note: 'A tilted wall of every screen, drifting. Scroll and the camera dives into it, straight into the work.' },
  { id: 'contact', name: 'B · Contact sheet', tag: 'Visuals first', note: 'Every screen on one sheet, a loupe for a cursor, and red pen round the selects that become the work.' },
  { id: 'mosaic', name: 'C · Assemble', tag: 'Visuals first', note: 'Screens fly in and lock into a mosaic as you scroll. Colleagues’ words sit in it as tiles of their own.' },
  { id: 'canvas', name: 'D · Canvas', tag: 'Visuals first', note: 'A design canvas you can drag around, every project a frame, and colleagues’ quotes as comment pins.' },
  { id: 'flipbook', name: 'E · Flipbook', tag: 'Visuals first', note: 'Scroll flips through every screen like a flipbook, then the work opens as magazine spreads.' },
] as const
export type VisualsFirstId = (typeof VISUALS_FIRST)[number]['id']
export const VISUALS_FIRST_IDS = VISUALS_FIRST.map((v) => v.id) as readonly string[]

const VARIANTS: Record<VisualsFirstId, React.ComponentType> = {
  dive: dynamic(() => import('./Dive').then((m) => m.DiveHome), { ssr: false }),
  contact: dynamic(() => import('./ContactSheet').then((m) => m.ContactSheetHome), { ssr: false }),
  mosaic: dynamic(() => import('./Mosaic').then((m) => m.MosaicHome), { ssr: false }),
  canvas: dynamic(() => import('./Canvas').then((m) => m.CanvasHome), { ssr: false }),
  flipbook: dynamic(() => import('./Flipbook').then((m) => m.FlipbookHome), { ssr: false }),
}

export function VisualsFirstHome({ id }: { id: VisualsFirstId }) {
  const Variant = VARIANTS[id]
  return <Variant />
}
