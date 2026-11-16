'use client'

import { Building2, House, LayoutGrid, PanelsTopLeft, RefreshCw, Settings } from 'lucide-react'
import { Stage } from './kit/stage'
import type { Act } from './kit/act'
import type { Layout } from './kit/looks'
import { Bar, Text, Window } from './kit/window'
import { Popover } from './kit/motion/Popover'
import { FacetTile as Facet } from './FacetTile'
import './app-icon-picker.css'

// Choosing an app's icon where the icon is, in the workspace prototype (Enterprise AI). The app
// already has one: it was drawn from the app's description when the app was made. Click it and
// four facet options open under it, drawn from the same description; pointing at one previews it
// in place, in the header, the breadcrumb and the sidebar at once; clicking keeps it.
//
// It replaces the Paper dialog ("Feature · Create an app icon"): a modal form that asked for a
// description the app already had, a style, then a pick, with a fake "In the app list" preview.
//
// - Close-up framing: a browser window inset top and sides, off the bottom. The header is the
//   subject; the page under it is filler.
// - Real words only on the story: the app's name and description (the cause), the breadcrumb, the
//   popover's two lines. Tabs and page are bars.
// - The icon is one slot that crossfades between marks, so the header, breadcrumb and sidebar
//   change together and nothing moves.
// - Plays once; the poster is the payoff: the daisy picked, the popover still open over it.

type Opt = 'search' | 'invoice-approval' | 'site-inspection' | 'daisy-assess'
type S = { open: boolean; chosen: Opt; preview: Opt | null }

const OPTIONS: Opt[] = ['search', 'invoice-approval', 'site-inspection', 'daisy-assess']
const initial: S = { open: false, chosen: 'search', preview: null }
const poster: S = { open: true, chosen: 'daisy-assess', preview: null }

async function script(a: Act<S>) {
  await a.wait(900)

  // 1. The icon it was given; click it
  a.mark('open')
  await a.click({ at: 'icon', x: 0.5, y: 0.5 })
  a.set({ open: true })
  await a.wait(700)

  // 2. Point at two options: each previews where the icon lives
  a.mark('preview')
  await a.move({ at: 'opt-2', x: 0.5, y: 0.55 })
  a.set({ preview: 'site-inspection' })
  await a.wait(900)
  await a.move({ at: 'opt-3', x: 0.5, y: 0.55 })
  a.set({ preview: 'daisy-assess' })
  await a.wait(1000)

  // 3. Keep it
  a.mark('pick')
  await a.click({ at: 'opt-3', x: 0.5, y: 0.55 })
  a.set({ chosen: 'daisy-assess', preview: null })
  await a.wait(900)

  // 4. Click away: the popover goes, the daisy stays everywhere
  a.mark('close')
  await a.click({ at: 'page', x: 0.72, y: 0.5 })
  a.set({ open: false })
  await a.wait(2600)
}

// The app's icon wherever it shows: every option stacked, the one shown crossfaded in
function AppIcon({ shown, className, target }: { shown: Opt; className: string; target?: string }) {
  return (
    <span className={`aip-icon ${className}`} data-target={target} data-cursor={target ? 'pointer' : undefined}>
      {OPTIONS.map((o) => <Facet key={o} id={o} className="aip-icon__mark" on={o === shown} />)}
    </span>
  )
}

const GEO: Record<Layout, { win: { left: number; top: number; width: number; height: number } }> = {
  wide: { win: { left: 40, top: 36, width: 640, height: 470 } },
  compact: { win: { left: 16, top: 24, width: 326, height: 470 } },
}

export function AppIconPicker() {
  return (
    <figure className="my-8 not-prose" role="img" aria-label="Clicking an app's icon opens four facet icons drawn from its description; pointing at one previews it in the header, breadcrumb and sidebar, and clicking keeps it">
      <Stage<S>
        width={720}
        height={440}
        compact={{ below: 600, width: 358, height: 440 }}
        initial={initial}
        poster={poster}
        script={script}
        play="once"
        fill
        cursor={{ at: { wide: { x: 640, y: 400 }, compact: { x: 320, y: 400 } } }}
        className="aip"
      >
        {(s, rect, layout) => {
          const shown = s.preview ?? s.chosen
          const g = GEO[layout].win
          const icon = rect('icon')
          // Under the icon, or under the description where it wraps lower (the narrow layout)
          const head = rect('head')
          const pop = { left: icon.x - 6, top: Math.max(icon.y + icon.height, head.y + head.height - 20) + 10 }
          return (
            <>
              <Window url="app.enterpriseai.com" urlShape="pill" className="aip-window" style={{ ...g, position: 'absolute' }} body={{ className: 'aip-body' }}>
                <div className="aip-app">
                  <nav className="aip-rail">
                    <House size={16} strokeWidth={1.75} />
                    <LayoutGrid size={16} strokeWidth={1.75} />
                    <Building2 size={16} strokeWidth={1.75} />
                    <PanelsTopLeft size={16} strokeWidth={1.75} />
                    <Settings size={16} strokeWidth={1.75} />
                    <span className="aip-rail__rule" />
                    <Facet id="parking-permit" className="aip-rail__app" />
                    <span className="aip-rail__here"><AppIcon shown={shown} className="aip-rail__app" /></span>
                    <Facet id="kyc-onboarding" className="aip-rail__app" />
                    <Facet id="candidate-screening" className="aip-rail__app" />
                  </nav>

                  <div className="aip-main" data-target="page">
                    <div className="aip-top">
                      <span className="aip-crumb">All apps</span>
                      <span className="aip-crumb__sep">/</span>
                      <AppIcon shown={shown} className="aip-crumb__icon" />
                      <span className="aip-crumb aip-crumb--here">DAISY Assess</span>
                    </div>

                    <header className="aip-head" data-target="head">
                      <AppIcon shown={shown} className="aip-head__icon" target="icon" />
                      <div className="aip-head__text">
                        <div className="aip-name">DAISY Assess</div>
                        <div className="aip-desc">Checks development applications before they reach council</div>
                      </div>
                    </header>

                    <div className="aip-tabs">
                      <span data-on><Bar w={58} h={7} tone={1} /></span>
                      <span><Bar w={64} h={7} tone={3} /></span>
                      <span><Bar w={44} h={7} tone={3} /></span>
                      <span><Bar w={50} h={7} tone={3} /></span>
                    </div>

                    <div className="aip-cards">
                      {[0, 1, 2].map((i) => (
                        <div className="aip-card" key={i}>
                          <Bar w={[64, 72, 52][i]} h={6} tone={3} />
                          <Bar w={[40, 56, 32][i]} h={12} tone={2} />
                        </div>
                      ))}
                    </div>
                    <div className="aip-rows">
                      {[70, 52, 64].map((w, i) => (
                        <div className="aip-rowline" key={i}>
                          <Bar w={`${w}%`} h={6} tone={3} />
                          <Bar w={40} h={6} tone={4} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Window>

              <Popover show={s.open} origin="top left" className="aip-pop" style={pop}>
                <div className="aip-pop__label">
                  <Text>Drawn from the description</Text>
                </div>
                <div className="aip-opts">
                  {OPTIONS.map((o, i) => (
                    <span key={o} className="aip-opt" data-target={`opt-${i}`} data-cursor="pointer" data-on={o === s.chosen || undefined} data-preview={o === s.preview || undefined}>
                      <Facet id={o} />
                    </span>
                  ))}
                </div>
                <div className="aip-pop__more">
                  <RefreshCw size={12} strokeWidth={2} />
                  <Text>Four more</Text>
                </div>
              </Popover>
            </>
          )
        }}
      </Stage>
    </figure>
  )
}
