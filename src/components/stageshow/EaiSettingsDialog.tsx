'use client'

import { Stage } from './kit/stage'
import type { Act } from './kit/act'
import { AppScreen, AppShell, Btn, Card, Fade, FeaturesCard, Ico, MoreCard, Note, PageHead, Row, Rows, SettingsDialog, SettingsNav, Status, Win, WsHome, WsScreen, WsSidebar, WsTop, type Layout } from './eai-shell'

// Workspace settings and app settings, and the way between them.
// The problem: on Parking permit's AI features, "Add in Workspace Settings ↗" left the app for a
// separate workspace settings page. Turn AI Chatbot on there, close it, and you're on the workspace
// Home, not back in Parking permit.
// The fix (the prototype today): workspace settings opens as a dialog over the page you're on, its
// grey footer holding Done. Turn AI Chatbot on, Done, and you're still on Parking permit's AI
// features, the chatbot's card now on.
//
// Loop (~17s): the problem, ending on Home with the cursor over Recent apps looking for the way
// back; the note turns to The fix (the seen cause) and the app is back; the dialog, the switch,
// Done, the card on (the payoff, held); the note turns back.
// Poster: the fix's payoff, the AI Chatbot card on.

// none: the window between two halves, so a reset happens out of sight
// appP / appF: the app screen in each half, so a hand-off between halves is a crossfade and the
// card resets out of sight
type Screen = 'appP' | 'appF' | 'settings' | 'home'
// on: the switch; card: the app's card showing it on (it answers once settings has closed)
type S = { fix: boolean; screen: Screen; dlg: boolean; on: boolean; card: boolean }

const initial: S = { fix: false, screen: 'appP', dlg: false, on: false, card: false }
const poster: S = { fix: true, screen: 'appF', dlg: false, on: true, card: true }
// At rest: the empty run right of the page's title (Home: right of its title)
const HOME_REST = { wide: { x: 640, y: 128 }, compact: { x: 300, y: 128 } }
const REST = { wide: { x: 630, y: 170 }, compact: { x: 296, y: 190 } }

async function script(a: Act<S>) {
  await a.wait(1000)
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
  // Looking for the app it came from, then giving up: the cursor settles on empty page
  await a.move('find-app', { duration: 900 })
  await a.wait(700)
  await a.move(a.layout === 'compact' ? HOME_REST.compact : HOME_REST.wide, { duration: 700 })
  await a.wait(600)
  a.mark('fix')
  await a.set({ fix: true, screen: 'appF', on: false })
  await a.wait(500)
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
  await a.move(a.layout === 'compact' ? REST.compact : REST.wide, { duration: 800 })
  await a.wait(2400)
  // The note turns and the window hands off to the problem's app screen; the card resets out of sight
  a.mark('reset')
  await a.set({ fix: false, screen: 'appP' })
  await a.wait(400)
  await a.set({ on: false, card: false })
  await a.wait(500)
}

// Parking permit › AI features: the chatbot's card, and the next card running off the foot
function AiFeatures({ layout, on }: { layout: Layout; on: boolean }) {
  const v = on ? 'on' : 'off'
  return (
    <AppScreen layout={layout}>
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
        {layout === 'compact' && <MoreCard />}
        {layout === 'wide' && (
          <Card title="AI Document Checking" desc="Extract information from submitted documents and check it against your rules.">
            <Rows>
              <Row label="Add AI Document Checking"><Btn out>Add in Workspace Settings</Btn></Row>
              <Row label="See preview"><Btn>Preview</Btn></Row>
            </Rows>
          </Card>
        )}
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
      <Win overlay={<SettingsDialog open={s.dlg} chatbot={s.on} toggle="dlg-tog" done="done" />}>
        <Fade value={s.screen} states={{ appP: <AiFeatures layout={layout} on={false} />, appF: <AiFeatures layout={layout} on={s.card} />, settings: <SettingsPage layout={layout} on={s.on} />, home: <Home layout={layout} /> }} />
      </Win>
    </>
  )
}

export function EaiSettingsDialog({ bare = true }: { bare?: boolean } = {}) {
  return (
    <figure className={bare ? 'not-prose eaw eaw--dialog eaw--bare' : 'not-prose eaw eaw--dialog my-8'} role="img" aria-label="The problem: in Parking permit's AI features, Add in Workspace Settings took you to a separate page, and closing it after turning AI Chatbot on landed on the workspace Home. The fix: workspace settings opens as a dialog over the app; turn AI Chatbot on, Done, and you're still in Parking permit with the chatbot on">
      <Stage width={720} height={544} compact={{ below: 600, width: 358, height: 532 }} initial={initial} poster={poster} script={script} play="loop" fill={!bare} cursor={{ at: REST, style: 'large' }} className="eaw">
        {(s, _rect, layout) => <Scene s={s} layout={layout === 'compact' ? 'compact' : 'wide'} />}
      </Stage>
    </figure>
  )
}
