'use client'

import { Stage } from './kit/stage'
import type { Act } from './kit/act'
import { AppScreen, AppShell, Btn, Fade, FeaturesCard, FitFade, Ico, PageHead, Row, Rows, FeatureDialog, SettingsNav, Toast, Win, WsHome, WsScreen, WsSidebar, WsTop, type Layout, type Mode } from './eai-shell'

// After turning a feature on: what's next?
// The problem, as testers did it (every one said they'd finished, having done one step): workspace
// settings, AI Chatbot on, the toast says so, close, and back on the workspace nothing points to
// Parking permit, where the chatbot still has to be set up on a workflow. Home still offers AI
// Chatbot among "Things you can add to your apps".
// The answer (the prototype's workflow option): settings over the app at AI Chatbot lists each app with
// a switch and a Set up button. Parking permit's switch lights its Set up; Set up closes settings and
// lands on the first step of setting it up, "Set up AI Chatbot" step 1, Workflow. Pick "Parking permit
// application", Continue, and the stepper moves on to step 2, Documents.
//
// mode: 'problem' loops from Home back into Workspace settings; 'answer' loops through the workspace
// (the crumb to Home, the page reset out of sight, Parking permit again); 'both' plays the two with the
// note turning between them. Designed at 800, shown in 720.
// Both (~20s): settings; the switch, the toast; close; Home (held). The note turns to The answer (the
// seen cause) and the window hands off to the app; "Turn on in Workspace settings" opens the dialog
// over the app, AI Chatbot's apps each with a switch and Set up; Parking permit's switch; its Set up
// lights (the focal moment: the onward step, in the dialog); Set up: the page under the scrim is already
// setup step 1, then the dialog fades away; the workflow chosen; Continue; step 2 (the payoff, held). The note turns back
// and the window hands off to settings. Every hand-off is old out, then new in.
// Poster: the payoff.

type Screen = 'settings' | 'home' | 'app'
// off: asking to be turned on; then setup step 1 (pick: its workflow menu open; chosen), step 2
export type Page = 'off' | 'step1' | 'pick' | 'chosen' | 'step2'
// sw: the AI Chatbot switch (one switch, on the page or in the dialog)
type S = { fix: boolean; screen: Screen; dlg: boolean; sw: boolean; toast: boolean; page: Page }

// At rest: right of the page's title (Home: right of its title)
const REST = { wide: { x: 1060, y: 240 }, compact: { x: 300, y: 128 } }
const HOME_REST = { wide: { x: 1000, y: 212 }, compact: { x: 300, y: 128 } }
const at = (a: Act<S>, p: { wide: { x: number; y: number }; compact: { x: number; y: number } }) => (a.layout === 'compact' ? p.compact : p.wide)

// The problem, as testers did it: on in settings, the toast, close, and nothing next
async function problem(a: Act<S>) {
  a.mark('before')
  await a.click('tog')
  await a.set({ sw: true })
  await a.wait(250)
  await a.set({ toast: true })
  a.mark('saved')
  await a.wait(900)
  await a.click('close')
  await a.set({ screen: 'home' })
  await a.move(at(a, HOME_REST), { duration: 800 })
  a.mark('stuck')
  await a.wait(1500)
}

// The answer: from the app, the dialog: Parking permit's switch, then its Set up, straight to setup step 1
// holds: how long step 1 and the payoff (step 2) stay
async function answer(a: Act<S>, holds = { step1: 900, payoff: 2600 }) {
  await a.click('turn-on')
  await a.set({ dlg: true })
  a.mark('dialog')
  // Once the dialog has settled: off its buttons, toward the switch
  await a.wait(260)
  await a.move({ at: 'dlg-tog', x: -1.2, y: 0.5 }, { duration: 600 })
  await a.wait(200)
  await a.click('dlg-tog')
  await a.set({ sw: true })
  // Its Set up lights up (grey to dark): the onward step, in the dialog. The cursor goes to it and
  // rests there a beat before pressing
  await a.wait(450)
  a.mark('setup')
  await a.move({ at: 'setup', x: 0.8, y: 0.7 }, { duration: 700 })
  await a.wait(900)
  await a.click({ at: 'setup', x: 0.8, y: 0.7 })
  // Settings closes onto the app, which has moved on to its setup underneath: step 1
  await a.set({ page: 'step1' })
  await a.wait(420)
  await a.set({ dlg: false })
  a.mark('step1')
  await a.wait(holds.step1)
  await a.click('wf-select')
  await a.set({ page: 'pick' })
  await a.wait(500)
  await a.click({ at: 'wf-opt', x: 0.7, y: 0.5 })
  await a.set({ page: 'chosen' })
  await a.wait(500)
  await a.click('continue')
  // The stepper moves on: Workflow done, Documents
  await a.set({ page: 'step2' })
  await a.move(at(a, REST), { duration: 800 })
  a.mark('payoff')
  await a.wait(holds.payoff)
}

const scripts = {
  // Loops from Home: Workspace settings again (the switch and toast reset while away)
  problem: async (a: Act<S>) => {
    await a.wait(1000)
    await problem(a)
    a.mark('reset')
    await a.set({ toast: false })
    await a.set({ sw: false })
    await a.click('ws-settings')
    await a.set({ screen: 'settings' })
    await a.wait(500)
  },
  // Loops through the workspace: the crumb to Home, the page reset out of sight, Parking permit again
  answer: async (a: Act<S>) => {
    await a.wait(1000)
    a.mark('before')
    await answer(a)
    a.mark('reset')
    await a.click({ at: 'ws-crumb', x: 0.25, y: 0.5 })
    await a.set({ screen: 'home' })
    await a.set({ sw: false, page: 'off' })
    await a.wait(600)
    await a.click('find-app')
    await a.set({ screen: 'app' })
    await a.move(at(a, REST), { duration: 700 })
    await a.wait(400)
  },
  both: async (a: Act<S>) => {
    await a.wait(1000)
    await problem(a)
    a.mark('fix')
    await a.set({ fix: true, screen: 'app', toast: false })
    // The switch resets once the settings page has gone
    await a.wait(220)
    await a.set({ sw: false })
    await a.wait(250)
    await answer(a)
    // The switch resets while it is out of sight, then the window hands off to settings
    a.mark('reset')
    await a.set({ sw: false })
    await a.set({ fix: false, screen: 'settings' })
    await a.wait(400)
    await a.set({ page: 'off' })
    await a.wait(500)
  },
}

// Workspace settings as its own page, where testers turned it on
function SettingsPage({ layout, on }: { layout: Layout; on: boolean }) {
  return (
    <WsScreen
      layout={layout}
      sidebar={<SettingsNav layout={layout} />}
      top={<div className="eaw-setbar"><span>Enable AI features in apps</span><span className="eaw-x" data-target="close" data-cursor="hand"><Ico n="x" /></span></div>}
    >
      <div className="eaw-setbody"><FeaturesCard chatbot={on} target="tog" /></div>
    </WsScreen>
  )
}

// Set up AI Chatbot (admin-ai-feature-workflow-step.js, admin-app-chatbot.js): where Set up lands. A
// four-step stepper; step 1 chooses the workflow ("Simple parking permit" or "Parking permit
// application"), Continue moves to step 2, Documents (empty to begin with: "No documents yet.")
const STEPS = ['Workflow', 'Documents', 'Instructions', 'Summary']

function Stepper({ at, done, layout }: { at: number; done: number; layout: Layout }) {
  const wide = layout === 'wide'
  return (
    <div className="eaw-stepper">
      {STEPS.map((t, i) => {
        const on = i === at
        const ok = i < done || (on && i > 0)
        return (
          <span key={t} className="eaw-pill" data-on={on || undefined} data-done={(i < done) || undefined} data-short={!wide && !on ? true : undefined}>
            <span className="eaw-pill__ring">
              <Fade value={ok ? 'ok' : 'n'} states={{ n: <span className="eaw-pill__n">{i + 1}</span>, ok: <Ico n="tick" /> }} />
            </span>
            {(wide || on) && <span className="eaw-pill__label">{t}</span>}
          </span>
        )
      })}
    </div>
  )
}

function StepFoot({ back, target }: { back: boolean; target?: string }) {
  return (
    <div className="eaw-stepfoot">
      <span className="eaw-btn" data-off={!back || undefined}>Back</span>
      <Btn dark target={target}>Continue</Btn>
    </div>
  )
}

function Setup({ page, layout }: { page: Page; layout: Layout }) {
  const step2 = page === 'step2'
  const chosen = page === 'chosen' || step2
  const wide = layout === 'wide'
  return (
    <>
      <span className="eaw-backlink">← Back to AI Chatbot</span>
      <section className="eaw-card eaw-card--flush eaw-sucard">
        <div className="eaw-setup__hd"><span>Set up AI Chatbot</span></div>
        <div className="eaw-setup__body">
          <Stepper at={step2 ? 1 : 0} done={step2 ? 1 : 0} layout={layout} />
          <div className="eaw-scard">
            <FitFade
              value={step2 ? 'docs' : 'wf'}
              states={{
                wf: (
                  <>
                    <div className="eaw-scard__main">
                      <div className="eaw-card__hd">
                        <div className="eaw-card__title">Workflow</div>
                        <div className="eaw-card__desc">Select a workflow for AI Chatbot.</div>
                      </div>
                      <label className="eaw-flabel">Workflow</label>
                      <span className="eaw-wfpick">
                        <span className="eaw-select eaw-select--full" data-target="wf-select" data-cursor="hand" data-open={page === 'pick' || undefined}>
                          <Fade value={chosen ? 'c' : 'n'} states={{ n: <span>Select a workflow</span>, c: <span>Parking permit application</span> }} />
                          <Ico n="down" />
                        </span>
                        <span className="eaw-menu" data-open={page === 'pick' || undefined}>
                          <span className="eaw-menu__item"><span>Simple parking permit</span></span>
                          <span className="eaw-menu__item" data-target="wf-opt" data-cursor="hand"><span>Parking permit application</span></span>
                        </span>
                      </span>
                      <div className="eaw-newwf">
                        <span className="eaw-newwf__tx"><b>Need a new workflow?</b>{wide && <span>Create it in workspace settings, then come back and select it here.</span>}</span>
                        <Btn>Workspace settings</Btn>
                      </div>
                    </div>
                    <StepFoot back={false} target="continue" />
                  </>
                ),
                docs: (
                  <>
                    <div className="eaw-scard__main">
                      <div className="eaw-card__hd">
                        <div className="eaw-card__title">Documents</div>
                        <div className="eaw-card__desc">Add the documents your chatbot should reference when providing answers</div>
                      </div>
                      <div className="eaw-doctable">
                        <div className="eaw-doctable__head">
                          <span>Document Name</span>
                          {wide && <><span>Type</span><span>Size</span><span>Uploaded</span></>}
                          {wide && <span>Index Status</span>}
                        </div>
                        <div className="eaw-doctable__empty">
                          <span>No documents yet.</span>
                          <Btn dark>↥ Upload Documents</Btn>
                        </div>
                      </div>
                    </div>
                    <StepFoot back />
                  </>
                ),
              }}
            />
          </div>
        </div>
      </section>
    </>
  )
}

// Parking permit › AI Chatbot. Off, it asks to be turned on; Set up in workspace settings lands on its
// setup, step 1
export function ChatbotPage({ page, layout }: { page: Page; layout: Layout }) {
  return (
    <Fade
      className="eaw-fade--stack"
      value={page === 'off' ? 'off' : 'setup'}
      states={{
        off: (
          <>
            <PageHead title="AI Chatbot" />
            <section className="eaw-card">
              <div className="eaw-card__stack">
                <div className="eaw-card__hd">
                  <div className="eaw-card__title">Turn on AI Chatbot</div>
                  <div className="eaw-card__desc">Answer questions using relevant information and instructions for each workflow stage.</div>
                </div>
                <div><Btn dark target="turn-on">Turn on in Workspace settings</Btn></div>
                <Rows dense steps>
                  {HOW.map((t, i) => <Row key={t} label={<span className="eaw-step"><span className="eaw-step__n">{i + 1}</span>{t}</span>} />)}
                </Rows>
              </div>
            </section>
          </>
        ),
        setup: <Setup page={page} layout={layout} />,
      }}
    />
  )
}

const HOW = ['User asks a question', 'AI searches your documents', 'AI follows your instructions', 'AI answers with sources']

function Scene({ s, layout }: { s: S; layout: Layout }) {
  return (
    <>
      {/* No note in the scene: the study's headline above says problem or answer, the caption below says what happens (Gareth, 2026-11-22) */}
      <Win vis={layout === 'wide' ? 808 : 628} overlay={<FeatureDialog layout={layout} open={s.dlg} on={s.sw} toggle="dlg-tog" setup="setup" />}>
        <Fade
          value={s.screen}
          states={{
            settings: <SettingsPage layout={layout} on={s.sw} />,
            home: (
              <WsScreen layout={layout} sidebar={<WsSidebar layout={layout} recentTarget={layout === 'wide' ? 'find-app' : undefined} settingsTarget="ws-settings" />} top={<WsTop layout={layout} title="Home" />}>
                <WsHome layout={layout} things recentTarget={layout === 'compact' ? 'find-app' : undefined} />
              </WsScreen>
            ),
            app: (
              <AppScreen layout={layout} wsTarget="ws-crumb">
                <AppShell layout={layout} title="AI Chatbot" active="chatbot" rail={layout === 'wide'}>
                  <ChatbotPage page={s.page} layout={layout} />
                </AppShell>
              </AppScreen>
            ),
          }}
        />
      </Win>
      <Toast on={s.toast}>AI Chatbot turned on.</Toast>
    </>
  )
}

const LABEL = {
  problem: 'The problem: people turned AI Chatbot on in workspace settings, saw it saved, closed it, and stopped; nothing on the workspace pointed back to the app to set it up',
  answer: 'The answer: in workspace settings, switching AI Chatbot on for Parking permit lights a Set up button right beside it; Set up lands on the first step of setting it up, and Continue moves the stepper on to Documents',
  both: 'The problem: people turned AI Chatbot on in workspace settings and stopped there. The answer: Set up beside the switch lands on the first step of setting it up, and the stepper moves on',
}

export function EaiOnward({ bare = true, mode = 'both' }: { bare?: boolean; mode?: Mode } = {}) {
  const fix = mode === 'answer'
  const initial: S = { fix, screen: fix ? 'app' : 'settings', dlg: false, sw: false, toast: false, page: 'off' }
  const poster: S = mode === 'problem' ? { fix: false, screen: 'home', dlg: false, sw: true, toast: true, page: 'off' }
    : mode === 'answer' ? { fix: true, screen: 'app', dlg: true, sw: true, toast: false, page: 'off' }
    : { fix: true, screen: 'app', dlg: false, sw: true, toast: false, page: 'step2' }
  return (
    <figure className={bare ? 'not-prose eaw eaw--onward eaw--bare' : 'not-prose eaw eaw--onward my-8'} role="img" aria-label={LABEL[mode]}>
      <Stage width={1280} height={884} compact={{ below: 600, width: 358, height: 668 }} initial={initial} poster={poster} script={scripts[mode]} play="loop" fill={!bare} cursor={{ at: REST, style: 'large' }} className="eaw">
        {(s, _rect, layout) => <Scene s={s} layout={layout === 'compact' ? 'compact' : 'wide'} />}
      </Stage>
    </figure>
  )
}
