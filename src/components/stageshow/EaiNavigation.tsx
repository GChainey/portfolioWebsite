'use client'

import { Stage } from './kit/stage'
import type { Act } from './kit/act'
import { AppRail, AppShell, AppTop, Btn, Card, Fade, Ico, MoreCard, Note, Win, WsHome, WsScreen, WsSidebar, WsTop, type Layout, type Mode } from './eai-shell'

// Where am I? Going from the workspace into an app and back.
// The problem: the first release drew the app the way it drew the workspace: the same grey sidebar
// beside the same white page, the page's name in the same place. Open Parking permit from Home and
// the frame doesn't change; only the words in it do.
// The answer (the prototype today): workspace = grey sidebar, white page; app = a white card inset on
// the workspace grey, white rail, grey pane, and the top bar says NYC Council / Parking permit.
//
// mode: 'problem' loops Home → Parking permit → Back to workspace; 'answer' loops Home → Parking
// permit → the NYC Council crumb; 'both' plays the two with the note turning between them. Each
// single mode ends where it began, by its own way back. Designed at 800 wide, shown in the 720 column.

type Screen = 'home' | 'app'
type S = { fix: boolean; screen: Screen }

// At rest: right of Home's title; on the app, the top bar's empty run (compact: the rail's empty foot)
const REST = { wide: { x: 1000, y: 212 }, compact: { x: 300, y: 128 } }
const BAR_REST = { wide: { x: 700, y: 104 }, compact: { x: 58, y: 470 } }
const at = (a: Act<S>, p: { wide: { x: number; y: number }; compact: { x: number; y: number } }) => (a.layout === 'compact' ? p.compact : p.wide)

// Home → the app → back. The problem goes back with "Back to workspace", the answer with the crumb
async function visit(a: Act<S>, back: 'back' | 'ws-crumb', hold: number, mark: string) {
  await a.click('open-app')
  await a.set({ screen: 'app' })
  await a.move(at(a, BAR_REST), { duration: 900 })
  a.mark(mark)
  await a.wait(hold)
  // The crumb is pressed in the gap between the workspace's mark and its name
  await a.click(back === 'back' ? 'back' : { at: 'ws-crumb', x: 0.25, y: 0.5 })
  await a.set({ screen: 'home' })
  await a.move(at(a, REST), { duration: 800 })
}

const scripts = {
  // Loops on its own: back to workspace is where it began
  problem: async (a: Act<S>) => {
    await a.wait(1000)
    a.mark('before')
    await visit(a, 'back', 1800, 'same')
    await a.wait(700)
  },
  answer: async (a: Act<S>) => {
    await a.wait(1000)
    a.mark('before')
    await visit(a, 'ws-crumb', 2600, 'payoff')
    await a.wait(700)
  },
  both: async (a: Act<S>) => {
    await a.wait(1000)
    a.mark('before')
    await visit(a, 'back', 1600, 'same')
    await a.wait(500)
    // The answer starts on the click into the app
    a.mark('fix')
    await a.set({ fix: true })
    await a.wait(250)
    await visit(a, 'ws-crumb', 2600, 'payoff')
    await a.wait(600)
    a.mark('reset')
    await a.set({ fix: false })
    await a.wait(500)
  },
}

function Home({ layout }: { layout: Layout }) {
  return (
    <WsScreen layout={layout} sidebar={<WsSidebar layout={layout} recentTarget="open-app" />} top={<WsTop layout={layout} title="Home" />}>
      <WsHome layout={layout} recentTarget="open-app" />
    </WsScreen>
  )
}

// The app's Overview, as the first release had it: a stats card and who can access
function OverviewBefore({ layout }: { layout: Layout }) {
  const wide = layout === 'wide'
  return (
    <div className="eaw-pane eaw-pane--white">
      <header className="eaw-head">
        <div className="eaw-head__text"><div className="eaw-head__title">Parking permit</div></div>
        {wide && <Btn dark>Save changes</Btn>}
      </header>
      <section className="eaw-card">
        <div className="eaw-card__title">App overview</div>
        <div className="eaw-stats">
          <div className="eaw-stat"><span className="eaw-stat__k">Status</span><span className="eaw-stat__v">Live</span></div>
          <div className="eaw-stat"><span className="eaw-stat__k">Submissions</span><span className="eaw-stat__v">1,284</span></div>
          {wide && <div className="eaw-stat"><span className="eaw-stat__k">Stages</span><span className="eaw-stat__v">4</span></div>}
        </div>
      </section>
      <div className="eaw-pair">
        <section className="eaw-card">
          <div className="eaw-card__title">Who can access</div>
          <span className="eaw-select">Anyone in workspace</span>
        </section>
        {wide && (
          <section className="eaw-card">
            <div className="eaw-card__title">Share this app</div>
            <span className="eaw-select">permits.nyccouncil.app</span>
          </section>
        )}
      </div>
      {wide && <section className="eaw-card eaw-card--row"><span className="eaw-row__label">“Built with EAI” badge</span><span className="eaw-switch" data-on aria-hidden><i /></span></section>}
      <MoreCard />
    </div>
  )
}

// The first release: the app on the workspace's own frame. Grey sidebar, white page, its name in
// the top bar where Home's was
function AppBefore({ layout }: { layout: Layout }) {
  return (
    <WsScreen layout={layout} sidebar={<AppRail layout={layout} active="overview" grey back="back" />} top={<WsTop layout={layout} title="Parking permit" back="back" />}>
      <OverviewBefore layout={layout} />
    </WsScreen>
  )
}

// The app today: nested in the workspace as a card, the colours swapped
function AppAfter({ layout }: { layout: Layout }) {
  const wide = layout === 'wide'
  return (
    <div className="eaw-appscreen" data-layout={layout}>
      <AppTop layout={layout} wsTarget="ws-crumb" />
      <AppShell layout={layout} title="Overview" active="overview">
          {wide && (
            <Card title="Build more with EAI" desc="Connect your preferred AI coding tool to EAI to add custom logic, integrations and advanced features. Keep managing your app, access and deployment here.">
              <div className="eaw-rows"><div className="eaw-row"><span className="eaw-row__label">Get started</span><Btn>Get started</Btn></div></div>
            </Card>
          )}
          <section className="eaw-card">
            <div className="eaw-stats">
              {wide && <div className="eaw-stat"><span className="eaw-stat__k">Edited in</span><span className="eaw-stat__v">Your own AI</span></div>}
              <div className="eaw-stat"><span className="eaw-stat__k">Status</span><span className="eaw-stat__v">Live</span></div>
              <div className="eaw-stat"><span className="eaw-stat__k">Submissions</span><span className="eaw-stat__v">1,284</span></div>
            </div>
          </section>
          <section className="eaw-card">
            <div className="eaw-card__hd">
              <div className="eaw-card__title">Who can access</div>
              <div className="eaw-card__desc">Control who can open and use this app.</div>
            </div>
            <div className="eaw-rows">
              <div className="eaw-row"><span className="eaw-row__label">App access</span><span className="eaw-select">Anyone in workspace<Ico n="down" /></span></div>
            </div>
          </section>
          {wide ? (
            <Card title="Share this app" desc="Send a link to people who should access this app.">
              <div className="eaw-rows"><div className="eaw-row"><span className="eaw-field eaw-field--mono">permits.nyccouncil.app</span><Btn>Copy link</Btn></div></div>
            </Card>
          ) : <MoreCard />}
      </AppShell>
    </div>
  )
}

function Scene({ s, layout }: { s: S; layout: Layout }) {
  const view = s.screen === 'home' ? 'home' : s.fix ? 'after' : 'before'
  return (
    <>
      <Note fix={s.fix} problem={['Workspace and app look the same', 'Workspace and app look alike']} solution={['The app sits inside the workspace as a card', 'The app is a card in the workspace']} />
      <Win>
        <Fade value={view} states={{ home: <Home layout={layout} />, before: <AppBefore layout={layout} />, after: <AppAfter layout={layout} /> }} />
      </Win>
    </>
  )
}

const LABEL = {
  problem: 'The problem: the workspace and an app inside it looked the same, so going from Home into Parking permit and back you could not tell which level you were on',
  answer: 'The answer: the app sits inside the workspace as a white card on its grey, and the top bar reads NYC Council / Parking permit; the crumb goes back',
  both: 'The problem: the workspace and an app inside it looked the same. The answer: the app sits inside the workspace as a card, the top bar reads NYC Council / Parking permit',
}

export function EaiNavigation({ bare = true, mode = 'both' }: { bare?: boolean; mode?: Mode } = {}) {
  const fix = mode === 'answer'
  const initial: S = { fix, screen: 'home' }
  const poster: S = { fix: mode !== 'problem', screen: 'app' }
  return (
    <figure className={bare ? 'not-prose eaw eaw--bare' : 'not-prose eaw my-8'} role="img" aria-label={LABEL[mode]}>
      <Stage width={1280} height={884} compact={{ below: 600, width: 358, height: 532 }} initial={initial} poster={poster} script={scripts[mode]} play="loop" fill={!bare} cursor={{ at: REST, style: 'large' }} className="eaw">
        {(s, _rect, layout) => <Scene s={s} layout={layout === 'compact' ? 'compact' : 'wide'} />}
      </Stage>
    </figure>
  )
}
