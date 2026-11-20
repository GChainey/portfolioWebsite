'use client'

import { Stage } from './kit/stage'
import type { Act } from './kit/act'
import { AppScreen, AppShell, Btn, Card, Fade, FeaturesCard, Ico, MoreCard, Note, PageHead, Row, Rows, SettingsDialog, SettingsNav, Status, Win, WsHome, WsScreen, WsSidebar, WsTop, type Layout, type Mode } from './eai-shell'

// Workspace settings and app settings, and the way between them.
// The problem: on Parking permit's AI features, "Add in Workspace Settings ↗" left the app for a
// separate workspace settings page. Turn AI Chatbot on there, close it, and you're on the workspace
// Home, not back in Parking permit.
// The answer (the prototype today): workspace settings opens as a small dialog over the app's pane,
// its grey footer holding Done. Turn AI Chatbot on, Done, and you're still in Parking permit, the
// chatbot's row now "Turned on".
//
// mode: 'problem' loops by finding the way back (Parking permit from Home's recent apps); 'answer'
// loops through the workspace (the crumb to Home, the card reset out of sight, Parking permit again);
// 'both' plays the two with the note turning between them. Designed at 800, shown in 720.

// appP / appF: the app screen in each half, so a hand-off between halves is a crossfade and the
// card resets out of sight
type Screen = 'appP' | 'appF' | 'settings' | 'home'
// on: the switch; card: the app's card showing it on (it answers once settings has closed)
type S = { fix: boolean; screen: Screen; dlg: boolean; on: boolean; card: boolean }

// At rest: right of the page's title (Home: right of its title)
const HOME_REST = { wide: { x: 1000, y: 212 }, compact: { x: 300, y: 128 } }
const REST = { wide: { x: 1060, y: 240 }, compact: { x: 296, y: 190 } }
const at = (a: Act<S>, p: { wide: { x: number; y: number }; compact: { x: number; y: number } }) => (a.layout === 'compact' ? p.compact : p.wide)

// The problem: a page of its own, then the workspace Home
async function problem(a: Act<S>) {
  a.mark('before')
  await a.click('add-ws')
  await a.set({ screen: 'settings' })
  await a.wait(900)
  a.mark('page')
  await a.click('tog')
  await a.set({ on: true })
  await a.wait(700)
  await a.click('close')
  await a.set({ screen: 'home' })
  a.mark('home')
  await a.wait(500)
}

// The answer: the dialog over the app, Done, the card on
async function answer(a: Act<S>) {
  await a.click('add-ws')
  await a.set({ dlg: true })
  a.mark('dialog')
  // Once the dialog has settled: off its buttons, toward the switch
  await a.wait(260)
  await a.move({ at: 'dlg-tog', x: -1.2, y: 0.5 }, { duration: 600 })
  await a.wait(200)
  await a.click('dlg-tog')
  await a.set({ on: true })
  await a.wait(600)
  await a.click({ at: 'done', x: 0.84, y: 0.66 })
  await a.set({ dlg: false })
  await a.wait(240)
  await a.set({ card: true })
  a.mark('payoff')
  await a.move(at(a, REST), { duration: 800 })
  await a.wait(2400)
}

const scripts = {
  // Loops by finding the way back: Parking permit from Home's recent apps
  problem: async (a: Act<S>) => {
    await a.wait(1000)
    await problem(a)
    await a.move('find-app', { duration: 900 })
    await a.wait(500)
    await a.click('find-app')
    await a.set({ screen: 'appP', on: false })
    await a.move(at(a, REST), { duration: 700 })
    await a.wait(400)
  },
  // Loops through the workspace: the crumb to Home, the card reset out of sight, Parking permit again
  answer: async (a: Act<S>) => {
    await a.wait(1000)
    a.mark('before')
    await answer(a)
    a.mark('reset')
    await a.click({ at: 'ws-crumb', x: 0.25, y: 0.5 })
    await a.set({ screen: 'home' })
    await a.set({ on: false, card: false })
    await a.wait(600)
    await a.click('find-app')
    await a.set({ screen: 'appF' })
    await a.move(at(a, REST), { duration: 700 })
    await a.wait(400)
  },
  both: async (a: Act<S>) => {
    await a.wait(1000)
    await problem(a)
    // Looking for the app it came from, then giving up: the cursor settles on empty page
    await a.move('find-app', { duration: 900 })
    await a.wait(700)
    await a.move(at(a, HOME_REST), { duration: 700 })
    await a.wait(600)
    a.mark('fix')
    await a.set({ fix: true, screen: 'appF', on: false })
    await a.wait(500)
    await answer(a)
    // The note turns and the window hands off to the problem's app screen; the card resets out of sight
    a.mark('reset')
    await a.set({ fix: false, screen: 'appP' })
    await a.wait(400)
    await a.set({ on: false, card: false })
    await a.wait(500)
  },
}

// Parking permit › AI features: the chatbot's card, and the next card running off the foot
export function AiFeatures({ layout, on }: { layout: Layout; on: boolean }) {
  const v = on ? 'on' : 'off'
  return (
    <AppScreen layout={layout} wsTarget="ws-crumb">
      <AppShell layout={layout} title="AI features" active="features" rail={layout === 'wide'}>
        <PageHead title="AI features" sub="Enable workspace AI capabilities for Parking permit." />
        <Card title="AI Chatbot" desc="Answer questions using relevant information and instructions for each workflow stage.">
          <Rows>
            <Fade className="eaw-fade--row" value={v} states={{
              off: <Row label="Add chatbot"><Btn target="add-ws" out>Add in Workspace Settings</Btn></Row>,
              on: <Row label={<Status>Turned on</Status>}><Btn out>Manage</Btn></Row>,
            }} />
          </Rows>
        </Card>
        {layout === 'wide' ? (
          <>
            <Card title="AI Document Checking" desc="Extract information from submitted documents and check it against your rules.">
              <Rows>
                <Row label="Add AI Document Checking"><Btn out>Add in Workspace Settings</Btn></Row>
                <Row label="See preview"><Btn>Preview</Btn></Row>
              </Rows>
            </Card>
            <Card title="Document Checklist" desc="Define which documents applicants must provide for each application type.">
              <Rows>
                <Row label="Add Document Checklist"><Btn out>Add in Workspace Settings</Btn></Row>
                <Row label="See preview"><Btn>Preview</Btn></Row>
              </Rows>
            </Card>
          </>
        ) : <MoreCard />}
      </AppShell>
    </AppScreen>
  )
}

// The first release: workspace settings as a page of its own, the app gone
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

// Where closing it landed: the workspace Home
function Home({ layout }: { layout: Layout }) {
  return (
    <WsScreen layout={layout} sidebar={<WsSidebar layout={layout} recentTarget={layout === 'wide' ? 'find-app' : undefined} />} top={<WsTop layout={layout} title="Home" />}>
      <WsHome layout={layout} recentTarget={layout === 'compact' ? 'find-app' : undefined} />
    </WsScreen>
  )
}

function Scene({ s, layout }: { s: S; layout: Layout }) {
  return (
    <>
      <Note fix={s.fix} problem={['Workspace settings takes you out of the app', 'Settings leaves the app']} solution={['Workspace settings opens over the app you’re in', 'Settings opens over the app']} />
      <Win vis={layout === 'wide' ? 808 : 492} overlay={<SettingsDialog open={s.dlg} chatbot={s.on} toggle="dlg-tog" done="done" />}>
        <Fade value={s.screen} states={{ appP: <AiFeatures layout={layout} on={false} />, appF: <AiFeatures layout={layout} on={s.card} />, settings: <SettingsPage layout={layout} on={s.on} />, home: <Home layout={layout} /> }} />
      </Win>
    </>
  )
}

const LABEL = {
  problem: 'The problem: in Parking permit, Add in Workspace Settings took you to a separate settings page; turn AI Chatbot on, close it, and you were on the workspace Home, not back in the app',
  answer: 'The answer: workspace settings opens as a dialog over the app; turn AI Chatbot on, Done, and you are still in Parking permit with the chatbot on',
  both: 'The problem: Add in Workspace Settings took you out of the app to a separate page. The answer: workspace settings opens as a dialog over the app, so after Done you are still in Parking permit',
}

export function EaiSettingsDialog({ bare = true, mode = 'both' }: { bare?: boolean; mode?: Mode } = {}) {
  const fix = mode === 'answer'
  const initial: S = { fix, screen: fix ? 'appF' : 'appP', dlg: false, on: false, card: false }
  const poster: S = mode === 'problem' ? { fix: false, screen: 'settings', dlg: false, on: true, card: false } : { fix: true, screen: 'appF', dlg: false, on: true, card: true }
  return (
    <figure className={bare ? 'not-prose eaw eaw--dialog eaw--bare' : 'not-prose eaw eaw--dialog my-8'} role="img" aria-label={LABEL[mode]}>
      <Stage width={1280} height={884} compact={{ below: 600, width: 358, height: 532 }} initial={initial} poster={poster} script={scripts[mode]} play="loop" fill={!bare} cursor={{ at: REST, style: 'large' }} className="eaw">
        {(s, _rect, layout) => <Scene s={s} layout={layout === 'compact' ? 'compact' : 'wide'} />}
      </Stage>
    </figure>
  )
}
