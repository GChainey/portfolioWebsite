'use client'

import { Check as Tick, X } from 'lucide-react'
import { Stage } from './kit/stage'
import type { Act } from './kit/act'
import { Bar, Text } from './kit/window'
import { Collapse } from './kit/motion/Collapse'
import { Avatar } from './kit/parts/Avatar'
import './rfp-letter.css'

// The RFP prototype's request-for-information dialog, as a Stageshow scene (kit/ is copied from
// the stageshow skill; import its files directly so the brand artwork never gets bundled).
// Issues raised by different reviewers sit in the side panel; ticking one writes it into the
// letter as a condition. Plays once in view; the still is the payoff, both issues in the letter.
//
// - Pinned, bottom bleed: the dialog is the product, inset top and sides, running off the
//   bottom. Its two panes are the two halves of the story.
// - Real words only on the story: the dialog title, the salutation, the two issues and the
//   lines they become. The letter's existing conditions and the third issue are bars.
// - The description in the card and the line in the letter are the same words, so the cause
//   reads before the highlight fades.

type S = { survey: boolean; flood: boolean }

const initial: S = { survey: false, flood: false }
const poster: S = { survey: true, flood: true }

async function script(a: Act<S>) {
  await a.wait(900)
  a.mark('survey')
  await a.click({ at: 'tick-survey', x: 0.5, y: 0.5 })
  a.set({ survey: true })
  await a.wait(1700)
  a.mark('flood')
  await a.click({ at: 'tick-flood', x: 0.5, y: 0.5 })
  a.set({ flood: true })
  await a.wait(600)
  await a.move({ at: 'pane', x: 0.92, y: 0.86 })
  await a.wait(2400)
}

function Checkbox({ on, name }: { on: boolean; name?: string }) {
  return (
    <span className="rl-box" data-on={on || undefined} data-target={name} data-cursor={name ? 'pointer' : undefined}>
      <Tick size={12} strokeWidth={3} />
    </span>
  )
}

function Issue({ doc, who, when, text, on, tick }: { doc: string; who: string; when: string; text: string; on: boolean; tick: string }) {
  return (
    <div className="rl-card">
      <Text className="rl-doc">{doc}</Text>
      <div className="rl-issue">
        <Checkbox on={on} name={tick} />
        <div className="rl-issue__body">
          <div className="rl-by">
            <Avatar name={who} size={18} tone="ios" className="rl-avatar" />
            <Text className="rl-who">{who}</Text>
            <Text className="rl-when">{when}</Text>
          </div>
          <p className="rl-desc">{text}</p>
        </div>
      </div>
    </div>
  )
}

// bare: inside a card (components/cards/TrayCard): no margins, and a white ground instead of the mat
export function RfpLetter({ bare = false }: { bare?: boolean } = {}) {
  return (
    <figure className={bare ? 'not-prose rl--bare' : 'my-8 not-prose'} role="img" aria-label="Ticking two reviewers' issues writes each one into the request for information letter">
      <Stage width={bare ? 520 : 720} height={bare ? 330 : 440} compact={{ below: bare ? 400 : 600, width: 358, height: 520 }} initial={initial} poster={poster} script={script} play="once" fill={!bare} cursor={{ at: { wide: bare ? { x: 495, y: 312 } : { x: 690, y: 420 }, compact: { x: 340, y: 500 } } }} className="rl">
        {(s) => (
          <div className="rl-dialog">
            <header className="rl-head">
              <div className="rl-title">Request for Information</div>
              <nav className="rl-tabs">
                <span>Draft</span>
                <span data-on>Preview</span>
              </nav>
            </header>

            <div className="rl-letterpane">
              <article className="rl-page">
                <div className="rl-letterhead">
                  <Bar w={84} h={6} tone={2} />
                  <Bar w={120} h={5} tone={4} />
                  <Bar w={96} h={5} tone={4} />
                </div>
                <div className="rl-dear">Dear Sarah Mitchell,</div>
                <div className="rl-lines">
                  <Bar w="100%" h={5} tone={4} />
                  <Bar w="72%" h={5} tone={4} />
                </div>
                <ul className="rl-conditions">
                  <li><Bar w="82%" h={5} tone={3} /></li>
                  <li><Bar w="64%" h={5} tone={3} /></li>
                  <Collapse open={s.survey} className="rl-new">
                    <li data-fresh={s.survey || undefined}><b>Site survey plan:</b> the drainage easement along the northern boundary is not shown.</li>
                  </Collapse>
                  <Collapse open={s.flood} className="rl-new">
                    <li data-fresh={s.flood || undefined}><b>Architectural plans:</b> floor levels are not shown against the 1% AEP flood level.</li>
                  </Collapse>
                </ul>
                <div className="rl-lines">
                  <Bar w="58%" h={5} tone={4} />
                </div>
                <div className="rl-sign">
                  <Bar w={110} h={6} tone={2} />
                  <Bar w={84} h={5} tone={4} />
                </div>
              </article>
            </div>

            <aside className="rl-pane" data-target="pane">
              <div className="rl-panehead">
                <div className="rl-panetitle">Issues to include</div>
                <X size={16} strokeWidth={2} className="rl-close" />
              </div>
              <Issue doc="Site survey plan" who="Michael James" when="Lodgement" on={s.survey} tick="tick-survey" text="The drainage easement along the northern boundary is not shown." />
              <Issue doc="Architectural plans" who="Emma Wilson" when="Engineering" on={s.flood} tick="tick-flood" text="Floor levels are not shown against the 1% AEP flood level." />
              <div className="rl-card rl-card--quiet">
                <Bar w={132} h={7} tone={2} />
                <div className="rl-issue">
                  <Checkbox on />
                  <div className="rl-issue__body">
                    <Bar w={112} h={6} tone={3} />
                    <Bar w={150} h={5} tone={4} />
                    <Bar w={96} h={5} tone={4} />
                  </div>
                </div>
              </div>
            </aside>
          </div>
        )}
      </Stage>
    </figure>
  )
}
