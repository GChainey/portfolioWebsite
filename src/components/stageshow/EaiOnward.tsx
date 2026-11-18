'use client'

import { Stage } from './kit/stage'
import type { Act } from './kit/act'
import { AppScreen, AppShell, Btn, Card, Fade, FitFade, Ico, Note, PageHead, Row, Rows, SettingsDialog, Win, type Layout } from './eai-shell'

// After turning a feature on: what's next?
// The problem: AI Chatbot is on, and its page in Parking permit still shows what it showed before,
// "Getting started" and a tutorial, and under them "Workflows with this feature · No workflows added
// yet". People stopped here, thinking they were done; the chatbot was on, but on no workflow.
// The fix: turning it on leads straight to the next step. The page offers the app's workflow with
// "Add to workflow" right away; one press and the chatbot is on Parking permit application, shown
// on the workflow's stages.
//
// Loop (~17s): workspace settings is open over the chatbot's page; switch on, Done; the page doesn't
// change and the cursor settles on the tutorial (stuck). The note turns to The fix (the seen cause)
// and settings is open again; switch on, Done; "Add to workflow" on Parking permit application; the
// chatbot shows on the workflow (the payoff, held). The note turns back.
// Poster: the fix's payoff.

// sw: the switch in the dialog; on: the feature, as the page shows it
type S = { fix: boolean; dlg: boolean; sw: boolean; on: boolean; added: boolean }

const initial: S = { fix: false, dlg: true, sw: false, on: false, added: false }
const poster: S = { fix: true, dlg: false, sw: true, on: true, added: true }
const REST = { wide: { x: 630, y: 170 }, compact: { x: 296, y: 190 } }
// Pressed beside the label, not on it
const DONE = { at: 'done', x: 0.84, y: 0.66 }

async function script(a: Act<S>) {
  await a.wait(1100)
  a.mark('before')
  await a.click('tog')
  await a.set({ sw: true })
  await a.wait(600)
  await a.click(DONE)
  await a.set({ dlg: false, on: true })
  await a.wait(700)
  // Nothing new on the page: the eye goes to the tutorial, and stops
  await a.move({ at: 'video', x: 0.13, y: 0.42 }, { duration: 1000 })
  a.mark('stuck')
  await a.wait(1800)
  a.mark('fix')
  await a.set({ sw: false })
  await a.set({ fix: true, dlg: true, on: false })
  await a.move(a.layout === 'compact' ? REST.compact : REST.wide, { duration: 700 })
  await a.wait(500)
  await a.click('tog')
  await a.set({ sw: true })
  await a.wait(600)
  await a.click(DONE)
  // Settings closes first; then the page answers with the next step
  await a.set({ dlg: false })
  await a.wait(240)
  await a.set({ on: true })
  a.mark('next')
  await a.wait(1300)
  await a.click('add-wf')
  await a.set({ added: true })
  await a.move(a.layout === 'compact' ? REST.compact : REST.wide, { duration: 800 })
  a.mark('payoff')
  await a.wait(2600)
  a.mark('reset')
  // The switch goes back while settings is shut, then the note turns and settings opens again
  await a.set({ sw: false })
  await a.set({ fix: false, dlg: true, on: false, added: false })
  await a.wait(900)
}

// The chatbot's page as it was: a tutorial, then a list of workflows with none in it
function PageBefore({ layout }: { layout: Layout }) {
  return (
    <>
      <PageHead title="AI Chatbot" action={<span className="eaw-wide-only"><Btn dark>Add to workflow</Btn></span>} />
      <Card title="Getting started" desc={layout === 'wide' ? 'Watch a short walkthrough when it is available.' : undefined}>
        <div className="eaw-video" data-target="video" data-cursor="hand">
          <span className="eaw-video__play"><Ico n="play" /></span>
          <span className="eaw-video__text">
            <span className="eaw-video__title">Getting started with AI Chatbot</span>
            <span className="eaw-video__sub">Tutorial video coming soon</span>
          </span>
        </div>
      </Card>
      <Card title="Workflows with this feature" desc="Configurations linked to workflows in this app.">
        <Rows><Row label="No workflows added yet"><Btn>Add to workflow</Btn></Row></Rows>
      </Card>
    </>
  )
}

// The page's next cards, below the fold: their names, and what's in them drawn as bars
function Filler() {
  return <div className="eaw-filler">{[72, 88, 56, 80, 64].map((w, i) => <i key={i} style={{ width: `${w}%` }} />)}</div>
}

const STAGES: [string, string][] = [['Application', '4 steps'], ['Processing', '2 steps'], ['Document review', '5 steps']]

// The chatbot's page now: off, it asks to be turned on; on, it offers the workflow; added, it shows
// on the workflow's stages
function PageAfter({ on, added, layout }: { on: boolean; added: boolean; layout: Layout }) {
  const v = !on ? 'off' : added ? 'added' : 'next'
  return (
    <>
      <PageHead title="AI Chatbot" />
      <section className="eaw-card">
        <FitFade
          value={v}
          states={{
            off: (
              <div className="eaw-card__stack">
                <div className="eaw-card__hd">
                  <div className="eaw-card__title">Turn on AI Chatbot</div>
                  <div className="eaw-card__desc">Answer questions using relevant information and instructions for each workflow stage.</div>
                </div>
                <div className="eaw-wide-only"><Btn dark>Turn on in Workspace settings</Btn></div>
              </div>
            ),
            next: (
              <div className="eaw-card__stack">
                <div className="eaw-card__hd">
                  <div className="eaw-card__title">Configure AI Chatbot in Parking permit</div>
                  <div className="eaw-card__desc">Select a workflow for AI Chatbot.</div>
                </div>
                <span className="eaw-select eaw-select--full">Parking permit application<Ico n="down" /></span>
                <div><Btn dark target="add-wf">Add to workflow</Btn></div>
              </div>
            ),
            added: (
              <div className="eaw-card__stack">
                <div className="eaw-card__hd">
                  <div className="eaw-card__title">Configure AI Chatbot in Parking permit</div>
                  <div className="eaw-live"><Ico n="check" />Live in Parking permit application</div>
                </div>
                <Rows dense>
                  {STAGES.map(([name, steps], i) => (
                    <Row key={name} label={<span className="eaw-stagerow">{name}{i === 0 && <span className="eaw-feature"><Ico n="sparkle" />AI Chatbot</span>}</span>}>
                      <span className="eaw-row__meta">{steps}</span>
                    </Row>
                  ))}
                </Rows>
              </div>
            ),
          }}
        />
      </section>
      <div className="eaw-pair">
        <Card title="Documents" desc="What it answers from."><Filler /></Card>
        {layout === 'wide' && <Card title="Instructions" desc="Its role, tone and limits."><Filler /></Card>}
      </div>
    </>
  )
}

function Scene({ s, layout }: { s: S; layout: Layout }) {
  return (
    <>
      <Note fix={s.fix} problem="It’s on, and nothing says what’s next" solution="Turning it on leads straight to the next step" />
      <Win overlay={<SettingsDialog layout={layout} open={s.dlg} chatbot={s.sw} toggle="tog" done="done" />}>
        <AppScreen layout={layout}>
          <AppShell layout={layout} title="AI Chatbot" active="chatbot" rail={layout === 'wide'}>
            <Fade className="eaw-fade--stack" value={s.fix ? 'fix' : 'problem'} states={{ problem: <PageBefore layout={layout} />, fix: <PageAfter on={s.on} added={s.added} layout={layout} /> }} />
          </AppShell>
        </AppScreen>
      </Win>
    </>
  )
}

export function EaiOnward({ bare = true }: { bare?: boolean } = {}) {
  return (
    <figure className={bare ? 'not-prose eaw eaw--onward eaw--bare' : 'not-prose eaw eaw--onward my-8'} role="img" aria-label="The problem: with AI Chatbot turned on, its page still showed Getting started and No workflows added yet, so people stopped there. The fix: turning it on offers Add to workflow straight away; pick Parking permit application and the chatbot shows on the workflow">
      <Stage width={720} height={592} compact={{ below: 600, width: 358, height: 600 }} initial={initial} poster={poster} script={script} play="loop" fill={!bare} cursor={{ at: REST, style: 'large' }} className="eaw">
        {(s, _rect, layout) => <Scene s={s} layout={layout === 'compact' ? 'compact' : 'wide'} />}
      </Stage>
    </figure>
  )
}
