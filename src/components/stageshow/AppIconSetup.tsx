'use client'

import { Building2, Check, House, LayoutGrid, PanelsTopLeft, Settings } from 'lucide-react'
import { Stage } from './kit/stage'
import type { Act } from './kit/act'
import { Bar, Text, Window } from './kit/window'
import { FacetTile } from './FacetTile'
import type { FacetId } from './facet-marks'
import './app-icon-setup.css'

// Setting up an app's icon from what the app already knows (Enterprise AI workspace prototype).
// By the icon step the person has made the app: it has a name, says what it does and knows the
// documents it checks. The step reads that and draws a facet icon from each idea it finds: the
// word is highlighted as its icon draws in, so you can see where each one came from. Pointing at
// one lights its source again and shows it in the sidebar; clicking picks it.
//
// - Close-up framing: a browser window inset top and sides, off the bottom; the step is the
//   subject, the rail the context.
// - Real words only on the story: the app's facts (the cause), the step's title, the four
//   captions (the link back to the cause), the button. The stepper's other steps are marks.
// - One colour moment: a highlighter on the words an icon came from.
// - Plays once; the poster is the payoff: all four drawn, the daisy picked, its word lit.

type Src = 'name' | 'checks' | 'development' | 'documents'
type S = { read: number; lit: Src | null; chosen: FacetId | null; preview: FacetId | null }

const OPTIONS: { id: FacetId; src: Src; caption: string }[] = [
  { id: 'daisy-assess', src: 'name', caption: 'From the name' },
  { id: 'search', src: 'checks', caption: 'From “checks”' },
  { id: 'site-inspection', src: 'development', caption: 'From “development”' },
  { id: 'invoice-approval', src: 'documents', caption: 'From the documents' },
]

const initial: S = { read: 0, lit: null, chosen: null, preview: null }
const poster: S = { read: 4, lit: 'name', chosen: 'daisy-assess', preview: null }

async function script(a: Act<S>) {
  await a.wait(800)

  // 1. Read what the app knows: each idea lights up as the icon it gives draws in
  a.mark('read')
  for (let i = 0; i < OPTIONS.length; i++) {
    a.set({ read: i + 1, lit: OPTIONS[i].src })
    await a.wait(750)
  }
  a.set({ lit: null })
  await a.wait(500)

  // 2. Point at the daisy: its word lights again, and the sidebar shows it
  a.mark('point')
  await a.move({ at: 'opt-0', x: 0.5, y: 0.45 })
  a.set({ lit: 'name', preview: 'daisy-assess' })
  await a.wait(1000)

  // 3. Pick it
  a.mark('pick')
  await a.click({ at: 'opt-0', x: 0.5, y: 0.45 })
  a.set({ chosen: 'daisy-assess', preview: null })
  await a.wait(700)
  await a.move({ at: 'continue', x: 0.5, y: 0.5 })
  await a.wait(2400)
}

// A word the step read, highlighted while its icon is the one in focus
function Hl({ src, s, children }: { src: Src; s: S; children: string }) {
  const i = OPTIONS.findIndex((o) => o.src === src)
  return <mark className="ais-hl" data-read={s.read > i || undefined} data-lit={s.lit === src || undefined}>{children}</mark>
}

// The app's icon in the sidebar: empty until there is one to show
function RailIcon({ id }: { id: FacetId | null }) {
  return (
    <span className="ais-railicon">
      <svg viewBox="0 0 100 100" className="ais-railicon__blank" data-on={!id || undefined} aria-hidden>
        <rect x="2" y="2" width="96" height="96" rx="21" fill="none" stroke="rgb(9 9 11 / 0.22)" strokeWidth="4" strokeDasharray="10 9" />
      </svg>
      {OPTIONS.map((o) => <FacetTile key={o.id} id={o.id} className="ais-railicon__mark" on={o.id === id} />)}
    </span>
  )
}

export function AppIconSetup({ bare = false }: { bare?: boolean } = {}) {
  return (
    <figure className={bare ? 'not-prose ais--bare' : 'my-8 not-prose'} role="img" aria-label="An app's icon step reads the app's name, what it does and its documents, and draws a facet icon from each, highlighting the word it came from; pointing at the daisy lights the app's name, and clicking picks it">
      <Stage<S>
        width={720}
        height={440}
        compact={{ below: 600, width: 358, height: 640 }}
        initial={initial}
        poster={poster}
        script={script}
        play="once"
        fill={!bare}
        cursor={{ at: { wide: { x: 650, y: 410 }, compact: { x: 320, y: 610 } } }}
        className="ais"
      >
        {(s) => {
          const shown = s.preview ?? s.chosen
          return (
            <Window url="app.enterpriseai.com" urlShape="pill" className="ais-window" body={{ className: 'ais-body' }}>
              <div className="ais-app">
                <nav className="ais-rail">
                  <House size={16} strokeWidth={1.75} />
                  <LayoutGrid size={16} strokeWidth={1.75} />
                  <Building2 size={16} strokeWidth={1.75} />
                  <PanelsTopLeft size={16} strokeWidth={1.75} />
                  <Settings size={16} strokeWidth={1.75} />
                  <span className="ais-rail__rule" />
                  <FacetTile id="parking-permit" className="ais-rail__app" />
                  <span className="ais-rail__here"><RailIcon id={shown} /></span>
                  <FacetTile id="kyc-onboarding" className="ais-rail__app" />
                </nav>

                <div className="ais-main">
                  <div className="ais-top">
                    <span className="ais-crumb">DAISY Assess</span>
                    <span className="ais-crumb__sep">/</span>
                    <span className="ais-crumb ais-crumb--here">Set up</span>
                    <span className="ais-steps" aria-hidden>
                      <span className="ais-step" data-done><Check size={10} strokeWidth={3} /></span>
                      <span className="ais-step" data-done><Check size={10} strokeWidth={3} /></span>
                      <span className="ais-step" data-now>3</span>
                      <span className="ais-step">4</span>
                    </span>
                  </div>

                  <div className="ais-head">
                    <div className="ais-head__text">
                      <div className="ais-title">Icon</div>
                      <div className="ais-sub">Drawn from what the app already knows</div>
                    </div>
                    <span className="ais-continue" data-target="continue" data-ready={s.chosen ? true : undefined}>Continue</span>
                  </div>

                  <div className="ais-cols">
                    <dl className="ais-facts">
                      <div className="ais-fact">
                        <dt>Name</dt>
                        <dd><Hl src="name" s={s}>DAISY</Hl> Assess</dd>
                      </div>
                      <div className="ais-fact">
                        <dt>What it does</dt>
                        <dd><Hl src="checks" s={s}>Checks</Hl> <Hl src="development" s={s}>development</Hl> applications before they reach council</dd>
                      </div>
                      <div className="ais-fact">
                        <dt>Documents</dt>
                        <dd><Hl src="documents" s={s}>Site plan, floor plans</Hl>, statement of effects</dd>
                      </div>
                      <div className="ais-fact ais-fact--quiet">
                        <dt><Bar w={44} h={6} tone={3} /></dt>
                        <dd><Bar w={150} h={6} tone={4} /></dd>
                      </div>
                    </dl>

                    <div className="ais-opts">
                      {OPTIONS.map((o, i) => (
                        <span key={o.id} className="ais-opt" data-target={`opt-${i}`} data-cursor={s.read > i ? 'pointer' : undefined} data-drawn={s.read > i || undefined} data-on={s.chosen === o.id || undefined} data-lit={s.lit === o.src || undefined}>
                          <span className="ais-opt__tile">
                            <span className="ais-opt__empty" />
                            <FacetTile id={o.id} className="ais-opt__mark" />
                          </span>
                          <Text className="ais-opt__cap">{o.caption}</Text>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Window>
          )
        }}
      </Stage>
    </figure>
  )
}
