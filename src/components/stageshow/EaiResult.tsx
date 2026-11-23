'use client'

import { Stage } from './kit/stage'
import type { Act } from './kit/act'
import { AppScreen, AppShell, FeatureDialog, Fade, Win, WsHome, WsScreen, WsSidebar, WsTop, type Layout } from './eai-shell'
import { AiFeatures } from './EaiSettingsDialog'
import { ChatbotPage, type Page } from './EaiOnward'

// The end result, the hero: the good path end to end in one calm loop, built from the same parts as
// the three problem / answer scenes (eai-shell; EaiSettingsDialog's AI features page; EaiOnward's
// chatbot page).
// The workspace Home (grey sidebar, white page) → Parking permit, a white card inset on the workspace
// grey, at its AI features → "Add in Workspace Settings ↗" opens workspace settings as a small dialog
// over the app, AI Chatbot's pane listing the apps → Parking permit's switch on → its Set up lights → Set
// up: settings closes onto "Configure AI Chatbot in Parking permit" → "Add to workflow" → "Live in Parking permit application",
// the chatbot on the Application stage (payoff, held) → the NYC Council crumb back to Home, where it
// began. No note: the scenes after it name the problems.

type Screen = 'home' | 'features' | 'chatbot'
type S = { screen: Screen; dlg: boolean; sw: boolean; page: Page }

const initial: S = { screen: 'home', dlg: false, sw: false, page: 'next' }
const poster: S = { screen: 'chatbot', dlg: false, sw: true, page: 'added' }
// At rest: right of the page's title (Home: right of its title)
const REST = { wide: { x: 1060, y: 164 }, compact: { x: 300, y: 120 } }
const HOME_REST = { wide: { x: 1000, y: 136 }, compact: { x: 300, y: 120 } }
const at = (a: Act<S>, p: { wide: { x: number; y: number }; compact: { x: number; y: number } }) => (a.layout === 'compact' ? p.compact : p.wide)

async function script(a: Act<S>) {
  await a.wait(1000)
  a.mark('home')
  await a.click('open-app')
  await a.set({ screen: 'features' })
  await a.move(at(a, REST), { duration: 800 })
  a.mark('app')
  await a.wait(600)
  await a.click('add-ws')
  await a.set({ dlg: true })
  a.mark('dialog')
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
  // Settings closes onto the app, which has moved on to Configure underneath
  await a.set({ screen: 'chatbot' })
  await a.wait(420)
  await a.set({ dlg: false })
  a.mark('next')
  await a.wait(1100)
  await a.click('add-wf')
  await a.set({ page: 'added' })
  await a.move(at(a, REST), { duration: 800 })
  a.mark('payoff')
  await a.wait(2800)
  // Back to the workspace by its crumb; the app resets while it is out of sight
  a.mark('reset')
  await a.click({ at: 'ws-crumb', x: 0.25, y: 0.5 })
  await a.set({ screen: 'home' })
  await a.set({ sw: false, page: 'next' })
  await a.move(at(a, HOME_REST), { duration: 800 })
  await a.wait(400)
}

function Scene({ s, layout }: { s: S; layout: Layout }) {
  return (
    <Win vis={layout === 'wide' ? 808 : 584} overlay={<FeatureDialog layout={layout} open={s.dlg} on={s.sw} toggle="dlg-tog" setup="setup" />}>
      <Fade
        value={s.screen}
        states={{
          home: (
            <WsScreen layout={layout} sidebar={<WsSidebar layout={layout} recentTarget={layout === 'wide' ? 'open-app' : undefined} />} top={<WsTop layout={layout} title="Home" />}>
              <WsHome layout={layout} things recentTarget={layout === 'compact' ? 'open-app' : undefined} />
            </WsScreen>
          ),
          features: <AiFeatures layout={layout} on={false} />,
          chatbot: (
            <AppScreen layout={layout} wsTarget="ws-crumb">
              <AppShell layout={layout} title="AI Chatbot" active="chatbot" rail={layout === 'wide'}>
                <ChatbotPage page={s.page} layout={layout} />
              </AppShell>
            </AppScreen>
          ),
        }}
      />
    </Win>
  )
}

export function EaiResult({ bare = true }: { bare?: boolean } = {}) {
  return (
    <figure className={bare ? 'not-prose eaw eaw--result eaw--bare' : 'not-prose eaw eaw--result my-8'} role="img" aria-label="Enterprise AI today: from the NYC Council workspace into Parking permit, an app nested in the workspace; workspace settings opens over the app at AI Chatbot; Parking permit is switched on and its Set up button, right in the dialog, lands straight on Configure AI Chatbot in Parking permit; one press puts it live on the Parking permit application workflow">
      <Stage width={1280} height={808} compact={{ below: 600, width: 358, height: 616 }} initial={initial} poster={poster} script={script} play="loop" fill={!bare} cursor={{ at: REST, style: 'large' }} className="eaw">
        {(s, _rect, layout) => <Scene s={s} layout={layout === 'compact' ? 'compact' : 'wide'} />}
      </Stage>
    </figure>
  )
}
