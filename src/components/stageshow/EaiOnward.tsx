'use client'

import { Check, MessageSquare } from 'lucide-react'
import { Stage } from './kit/stage'
import type { Act } from './kit/act'
import { Bar } from './kit/window'
import { APP_NAV, Badge, Btn, Card, Fade, FeatureDialog, FitFade, Note, SideNav, TopBar, Win, type Layout } from './eai-parts'

// An onward journey. Before: turning AI Chatbot on for an app ended at "Saved" and nothing next, so
// people stopped there, sure they were done, while the chatbot was still not set up in the app (in
// testing, 0 of 5 finished; every one said they had). After the fix: turning it on offers the next
// step right there; it leads into the app's setup, two steps more, and a clear done: live.
//
// Both halves in the current workspace (the app a card, grey around). One fixed frame; the card's
// contents swap by opacity in place, the dialog opens over the window, the onward step opens under
// the dialog's rows. The note above the window names the version and is the seen cause of the reset.

type Setup = 'none' | 'steps' | 'docs' | 'live'
type S = { after: boolean; dlg: boolean; on: boolean; setup: Setup }

const initial: S = { after: false, dlg: false, on: false, setup: 'none' }
const poster: S = { after: true, dlg: false, on: true, setup: 'live' }
const REST = { wide: { x: 612, y: 440 }, compact: { x: 300, y: 440 } }

async function script(a: Act<S>) {
  await a.wait(1100)
  a.mark('before')
  await a.click('btn-on')
  await a.set({ dlg: true })
  await a.wait(800)
  await a.click('tog-vending')
  await a.set({ on: true })
  // "Saved", and nothing next
  await a.wait(1300)
  await a.click('dlg-done')
  await a.set({ dlg: false })
  a.mark('stuck')
  // Done, they think; the app's chatbot is still not set up
  await a.move('status', { duration: 800 })
  await a.wait(1600)
  a.mark('fix')
  await a.set({ after: true, on: false, setup: 'none' })
  await a.wait(1300)
  await a.click('btn-on')
  await a.set({ dlg: true })
  await a.wait(800)
  await a.click('tog-vending')
  await a.set({ on: true })
  a.mark('onward')
  await a.wait(900)
  await a.click('onward')
  await a.set({ dlg: false, setup: 'steps' })
  await a.wait(1100)
  await a.click('choose')
  await a.set({ setup: 'docs' })
  await a.wait(800)
  await a.click('golive')
  await a.set({ setup: 'live' })
  a.mark('payoff')
  await a.move(a.layout === 'compact' ? REST.compact : REST.wide, { duration: 700 })
  await a.wait(2400)
  a.mark('reset')
  await a.set({ after: false, on: false, setup: 'none' })
  await a.wait(900)
}

function Filler() {
  return (
    <Card>
      <Bar w={168} h={10} r={5} tone={3} />
      <Bar w={260} h={8} r={4} tone={2} />
      <Bar w={220} h={8} r={4} tone={2} />
    </Card>
  )
}

// The app's AI Chatbot card: not set up, the setup steps, or live
function ChatbotCard({ s }: { s: S }) {
  const v = s.setup === 'none' ? 'none' : s.setup === 'live' ? 'live' : 'steps'
  return (
    <Card>
      <div className="eai-card__head">
        <span className="eai-card__title">AI Chatbot</span>
        <span data-target="status"><Fade className="eai-step__end" value={s.setup === 'live' ? 'live' : 'unset'} states={{ unset: <Badge tone="amber">Not set up</Badge>, live: <Badge tone="green">Live</Badge> }} /></span>
      </div>
      <FitFade value={v} states={{
        none: (
          <div className="eai-card__body">
            <div className="eai-card__text">Answers questions on this app’s form.</div>
            <div className="eai-card__action"><Btn target="btn-on">Turn on in Workspace settings</Btn></div>
          </div>
        ),
        steps: (
          <div className="eai-steps">
            <div className="eai-step" data-done><span className="eai-step__n"><Check size={14} strokeWidth={2} /></span><span className="eai-step__label">Turned on</span></div>
            <div className="eai-step" data-done={s.setup === 'docs' || undefined}>
              <span className="eai-step__n"><Fade value={s.setup === 'docs' ? 'd' : 'n'} states={{ n: <>2</>, d: <Check size={14} strokeWidth={2} /> }} /></span>
              <span className="eai-step__label">Choose its documents</span>
              <Fade className="eai-step__end" value={s.setup === 'docs' ? 'd' : 'n'} states={{ n: <Btn target="choose">Choose</Btn>, d: <span className="eai-step__meta">3 documents</span> }} />
            </div>
            <div className="eai-step"><span className="eai-step__n">3</span><span className="eai-step__label">Go live</span><Btn dark target="golive">Go live</Btn></div>
          </div>
        ),
        live: (
          <div className="eai-card__body">
            <div className="eai-live">
              <span className="eai-live__icon"><MessageSquare size={16} strokeWidth={1.5} /></span>
              <div><div className="eai-step__label">Chatbot is live in Vending issue form</div><div className="eai-card__text">It answers from the 3 documents you chose.</div></div>
            </div>
                      </div>
        ),
      }} />
    </Card>
  )
}

function Scene({ s, layout }: { s: S; layout: Layout }) {
  const dialog = (
    <FeatureDialog
          open={s.dlg}
          on={s.on}
          saved={!s.after}
          next={s.after ? {
            show: s.on,
            node: (
              <div className="eai-next__box">
                <span className="eai-next__text"><b>Next: set it up in the app</b></span>
                <Btn dark target="onward" icon="next">Set up in Vending issue form</Btn>
              </div>
            ),
          } : undefined}
        />
  )
  return (
    <>
      <Note after={s.after} before="Turned on, “Saved”, and nothing next; the chatbot isn’t set up" fix="Turning it on leads straight to the next step, then to live" />
      <Win layout={layout} after top={<TopBar app="Vending issue form" />} overlay={dialog}>
        <div className="eai-screen eai-screen--wash">
          <div className="eai-appcard">
            <SideNav title="App settings" items={APP_NAV} />
            <div className="eai-page eai-page--wash">
              <div className="eai-h1">AI Chatbot</div>
              <ChatbotCard s={s} />
              <Filler /><Filler /><Filler />
            </div>
          </div>
        </div>
      </Win>
    </>
  )
}

export function EaiOnward({ bare = true }: { bare?: boolean } = {}) {
  return (
    <figure className={bare ? 'not-prose eai eai--bare' : 'not-prose eai my-8'} role="img" aria-label="Before: turning AI Chatbot on ends at Saved, with the app's chatbot still not set up. After: turning it on leads straight to the setup, and to live">
      <Stage width={720} height={480} compact={{ below: 600, width: 358, height: 470 }} initial={initial} poster={poster} script={script} play="loop" fill={!bare} cursor={{ at: REST, style: 'large' }} className="eai">
        {(s, _rect, layout) => <Scene s={s} layout={layout === 'compact' ? 'compact' : 'wide'} />}
      </Stage>
    </figure>
  )
}
