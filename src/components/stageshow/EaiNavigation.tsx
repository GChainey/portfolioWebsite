'use client'

import { Stage } from './kit/stage'
import type { Act } from './kit/act'
import { AppRail, AppShell, AppTop, Btn, Fade, Ico, MoreCard, Note, Win, WsHome, WsScreen, WsSidebar, WsTop, type Layout } from './eai-shell'

// Where am I? Going from the workspace into an app and back.
// The problem: the first release drew the app the way it drew the workspace: the same grey sidebar
// beside the same white page, the page's name in the same place. Open Parking permit from Home and
// the frame doesn't change; only the words in it do.
// The fix (the prototype today): the levels swap colours. Workspace: grey sidebar, white page. App:
// the page goes grey, the top bar says NYC Council / Parking permit, and the app is a white card
// nested in it, white rail, grey pane. Back is the breadcrumb.
//
// Loop (~15s): Home → Parking permit → back, as it was; the note turns to The fix (the seen cause);
// Home → Parking permit (the payoff, held) → NYC Council → Home, and the note turns back.
// Home is the same in both halves (the workspace didn't change), so the seam is the note alone.
// Poster: the fixed app screen, the note on The fix.

type Screen = 'home' | 'app'
type S = { fix: boolean; screen: Screen }

const initial: S = { fix: false, screen: 'home' }
const poster: S = { fix: true, screen: 'app' }
// At rest: the empty run beside the page's title
const REST = { wide: { x: 620, y: 140 }, compact: { x: 300, y: 128 } }

async function script(a: Act<S>) {
  const wide = a.layout !== 'compact'
  await a.wait(1000)
  a.mark('before')
  await a.click('open-app')
  await a.set({ screen: 'app' })
  // Rests in the top bar's empty run, the same spot as the fix's payoff, so the two compare
  await a.move(wide ? { x: 476, y: 72 } : { x: 58, y: 470 }, { duration: 900 })
  a.mark('same')
  await a.wait(1600)
  await a.click('back')
  await a.set({ screen: 'home' })
  await a.move(a.layout === 'compact' ? REST.compact : REST.wide, { duration: 800 })
  await a.wait(500)
  // The fix starts on the click into the app
  a.mark('fix')
  await a.set({ fix: true })
  await a.wait(250)
  await a.click('open-app')
  await a.set({ screen: 'app' })
  // Rests in the top bar's empty run (compact: the rail's empty foot), near the way back
  await a.move(wide ? { x: 476, y: 72 } : { x: 58, y: 470 }, { duration: 900 })
  a.mark('payoff')
  await a.wait(2600)
  // Pressed in the gap between the workspace's mark and its name
  await a.click({ at: 'ws-crumb', x: 0.25, y: 0.5 })
  await a.set({ screen: 'home' })
  await a.move(a.layout === 'compact' ? REST.compact : REST.wide, { duration: 800 })
  await a.wait(600)
  a.mark('reset')
  await a.set({ fix: false })
  await a.wait(500)
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
      <section className="eaw-card">
        <div className="eaw-card__title">Who can access</div>
        <span className="eaw-select">Anyone in workspace</span>
      </section>
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
          <section className="eaw-card">
            <div className="eaw-stats">
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
          <MoreCard />
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

export function EaiNavigation({ bare = true }: { bare?: boolean } = {}) {
  return (
    <figure className={bare ? 'not-prose eaw eaw--bare' : 'not-prose eaw my-8'} role="img" aria-label="The problem: the workspace and an app inside it looked the same, so going from Home into Parking permit and back you couldn't tell which level you were on. The fix: the app sits inside the workspace as a card with its colours swapped, and the top bar reads NYC Council / Parking permit">
      <Stage width={720} height={544} compact={{ below: 600, width: 358, height: 532 }} initial={initial} poster={poster} script={script} play="loop" fill={!bare} cursor={{ at: REST, style: 'large' }} className="eaw">
        {(s, _rect, layout) => <Scene s={s} layout={layout === 'compact' ? 'compact' : 'wide'} />}
      </Stage>
    </figure>
  )
}

