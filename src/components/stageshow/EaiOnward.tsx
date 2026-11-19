'use client'

import { Stage } from './kit/stage'
import type { Act } from './kit/act'
import { AppScreen, AppShell, Btn, Card, Fade, FeaturesCard, FitFade, Ico, Note, PageHead, Row, Rows, SettingsDialog, SettingsNav, Toast, Win, WsHome, WsScreen, WsSidebar, WsTop, type Layout, type Mode } from './eai-shell'

// After turning a feature on: what's next?
// The problem, as testers did it (every one said they'd finished, having done one step): workspace
// settings, AI Chatbot on, the toast says so, close, and back on the workspace nothing points to
// Parking permit, where the chatbot still has to be set up on a workflow. Home still offers AI
// Chatbot among "Things you can add to your apps".
// The answer: turned on from the app (the settings dialog over Parking permit's AI Chatbot page), it
// lands straight on the next step, "Configure AI Chatbot in Parking permit": the app's workflow and
// "Add to workflow". One press and the same card says "Live in Parking permit application", the
// button "Added", the chatbot on the Application stage. Documents below, with its real file.
//
// mode: 'problem' loops from Home back into Workspace settings; 'answer' loops through the workspace
// (the crumb to Home, the page reset out of sight, Parking permit again); 'both' plays the two with the
// note turning between them. Designed at 800, shown in 720.
// Both (~20s): settings; the switch, the toast; close; Home (held). The note turns to The answer (the
// seen cause) and the window hands off to the app; "Turn on in Workspace settings" opens the dialog
// over the pane (bar, title and rail in view); the switch; Done: the page under the scrim is already
// Configure, then the dialog fades away; "Add to workflow"; the payoff, held. The note turns back
// and the window hands off to settings. Every hand-off is old out, then new in.
// Poster: the payoff.

type Screen = 'settings' | 'home' | 'app'
export type Page = 'off' | 'next' | 'added'
// sw: the AI Chatbot switch (one switch, on the page or in the dialog)
type S = { fix: boolean; screen: Screen; dlg: boolean; sw: boolean; toast: boolean; page: Page }

// At rest: right of the page's title (Home: right of its title)
const REST = { wide: { x: 680, y: 180 }, compact: { x: 300, y: 128 } }
const HOME_REST = { wide: { x: 700, y: 150 }, compact: { x: 300, y: 128 } }
const at = (a: Act<S>, p: { wide: { x: number; y: number }; compact: { x: number; y: number } }) => (a.layout === 'compact' ? p.compact : p.wide)
// Pressed beside the label, not on it
const DONE = { at: 'done', x: 0.84, y: 0.66 }

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

// The answer: from the app, the dialog, Done, straight to Configure, then onto the workflow
async function answer(a: Act<S>) {
  await a.click('turn-on')
  await a.set({ dlg: true })
  a.mark('dialog')
  // Once the dialog has settled: off its buttons, toward the switch
  await a.wait(260)
  await a.move({ at: 'dlg-tog', x: -1.2, y: 0.5 }, { duration: 600 })
  await a.wait(200)
  await a.click('dlg-tog')
  await a.set({ sw: true })
  await a.wait(500)
  await a.click(DONE)
  // The page under the dialog moves on first; then the dialog fades away onto it
  await a.set({ page: 'next' })
  await a.wait(420)
  await a.set({ dlg: false })
  a.mark('next')
  await a.wait(1100)
  await a.click('add-wf')
  await a.set({ page: 'added' })
  await a.move(at(a, REST), { duration: 800 })
  a.mark('payoff')
  await a.wait(2600)
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

const STAGES: [string, string][] = [['Application', '4 steps'], ['Processing', '2 steps'], ['Document review', '5 steps']]
const HOW = ['User asks a question', 'AI searches your documents', 'AI follows your instructions', 'AI answers with sources']

// Parking permit › AI Chatbot. Off, it asks to be turned on (with the prototype's "how it works"
// steps); on, it is the next step: the workflow and "Add to workflow", its stages under it. Added,
// the same card changes in place: the line under the title, the button, the chatbot on Application.
// The chatbot's Documents below, as the prototype has them
export function ChatbotPage({ page, layout }: { page: Page; layout: Layout }) {
  const added = page === 'added'
  const v = added ? 'added' : 'next'
  return (
    <>
      <PageHead title="AI Chatbot" />
      <section className="eaw-card">
        <FitFade
          value={page === 'off' ? 'off' : 'config'}
          states={{
            off: (
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
            ),
            config: (
              <div className="eaw-card__stack">
                <div className="eaw-card__hd">
                  <div className="eaw-card__title">Configure AI Chatbot in Parking permit</div>
                  <Fade value={v} states={{ next: <div className="eaw-card__desc">Select a workflow for AI Chatbot.</div>, added: <div className="eaw-live"><Ico n="check" />Live in Parking permit application</div> }} />
                </div>
                <div className="eaw-pick">
                  <span className="eaw-select eaw-select--full">Parking permit application<Ico n="down" /></span>
                  <Fade className="eaw-fade--end" value={v} states={{ next: <Btn dark target="add-wf">Add to workflow</Btn>, added: <Btn icon="check">Added</Btn> }} />
                </div>
                <Rows dense>
                  {STAGES.map(([name, steps], i) => (
                    <Row key={name} label={<span className="eaw-stagerow">{name}{i === 0 && <span className="eaw-feature" data-on={added || undefined}><Ico n="sparkle" />AI Chatbot</span>}</span>}>
                      <span className="eaw-row__meta">{steps}</span>
                    </Row>
                  ))}
                </Rows>
              </div>
            ),
          }}
        />
      </section>
      {layout === 'wide' && (
        <Card title="Documents" desc="What it answers from.">
          <Rows><Row label="Guide for applicants" sub={<span className="eaw-indexed">✓ Indexed</span>}><Btn>Add documents</Btn></Row></Rows>
        </Card>
      )}
    </>
  )
}

function Scene({ s, layout }: { s: S; layout: Layout }) {
  return (
    <>
      <Note fix={s.fix} problem={['Turned on in settings, then nothing says what’s next', 'Turned on, then nothing next']} solution={['Turning it on leads straight to the next step', 'On leads to the next step']} />
      <Win overlay={<SettingsDialog open={s.dlg} chatbot={s.sw} toggle="dlg-tog" done="done" />}>
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
  answer: 'The answer: turned on from the app, AI Chatbot lands straight on Configure AI Chatbot in Parking permit; add it to the workflow and it is live on Parking permit application',
  both: 'The problem: people turned AI Chatbot on in workspace settings and stopped there. The answer: turned on from the app, it lands straight on Configure, and one press puts it live on the workflow',
}

export function EaiOnward({ bare = true, mode = 'both' }: { bare?: boolean; mode?: Mode } = {}) {
  const fix = mode === 'answer'
  const initial: S = { fix, screen: fix ? 'app' : 'settings', dlg: false, sw: false, toast: false, page: 'off' }
  const poster: S = mode === 'problem' ? { fix: false, screen: 'home', dlg: false, sw: true, toast: true, page: 'off' } : { fix: true, screen: 'app', dlg: false, sw: true, toast: false, page: 'added' }
  return (
    <figure className={bare ? 'not-prose eaw eaw--onward eaw--bare' : 'not-prose eaw eaw--onward my-8'} role="img" aria-label={LABEL[mode]}>
      <Stage width={800} height={754} compact={{ below: 600, width: 358, height: 624 }} initial={initial} poster={poster} script={scripts[mode]} play="loop" fill={!bare} cursor={{ at: REST, style: 'large' }} className="eaw">
        {(s, _rect, layout) => <Scene s={s} layout={layout === 'compact' ? 'compact' : 'wide'} />}
      </Stage>
    </figure>
  )
}
