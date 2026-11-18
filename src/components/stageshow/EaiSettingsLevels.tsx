'use client'

import { X } from 'lucide-react'
import { Stage } from './kit/stage'
import type { Act } from './kit/act'
import { Bar } from './kit/window'
import { APP_NAV, Badge, Btn, Card, Fade, FeatureDialog, Note, SideNav, Toggle, TopBar, Win, type Layout } from './eai-parts'

// Two levels of settings. Before: a feature is turned on in workspace settings and set up in the
// app's settings, and the two looked the same (the same sidebar listing the same feature, the same
// page title). Going from the app to turn AI Chatbot on, then closing workspace settings, landed on
// the workspace home, not back in the app: where am I?
// After the fix: workspace settings is a dialog over whatever you're on, and the levels swapped
// colours (workspace grey around, the app a card with a white sidebar and grey page). Turn it on in
// the dialog, close it, and you're where you were, the feature on.
//
// One fixed frame the whole loop; screens swap by opacity in place, the dialog opens over the window.
// The note above the window names the version and is the seen cause of the reset.
// Real words: the top bar names, the sidebar's Features and AI Chatbot, page titles, the card, the
// two apps, the buttons. Everything else is a bar.

type Screen = 'app' | 'ws' | 'home'
type S = { after: boolean; screen: Screen; on: boolean; dlg: boolean }

const initial: S = { after: false, screen: 'app', on: false, dlg: false }
const poster: S = { after: true, screen: 'app', on: true, dlg: false }
const REST = { wide: { x: 612, y: 440 }, compact: { x: 300, y: 440 } }

async function script(a: Act<S>) {
  await a.wait(1100)
  a.mark('before')
  await a.click('btn-ws')
  await a.set({ screen: 'ws' })
  await a.wait(1000)
  await a.click('ws-tog')
  await a.set({ on: true })
  await a.wait(700)
  await a.click('ws-close')
  await a.set({ screen: 'home', on: false })
  await a.wait(600)
  // Where am I? Looking for the app it came from
  a.mark('lost')
  await a.move('recent-vending', { duration: 900 })
  await a.wait(1400)
  a.mark('fix')
  await a.set({ after: true, screen: 'app', on: false })
  await a.wait(1400)
  await a.click('btn-on')
  await a.set({ dlg: true })
  await a.wait(800)
  await a.click('tog-vending')
  await a.set({ on: true })
  await a.wait(700)
  await a.click('dlg-done')
  await a.set({ dlg: false })
  a.mark('payoff')
  await a.move(a.layout === 'compact' ? REST.compact : REST.wide, { duration: 700 })
  await a.wait(2400)
  a.mark('reset')
  await a.set({ after: false, screen: 'app', on: false })
  await a.wait(900)
}

// A filler card under the story: a section of the page that isn't this story's
function Filler() {
  return (
    <Card>
      <Bar w={168} h={10} r={5} tone={3} />
      <Bar w={260} h={8} r={4} tone={2} />
      <Bar w={220} h={8} r={4} tone={2} />
    </Card>
  )
}

const WS_NAV = [{ icon: 'home' as const, label: 'Home', on: true }, { icon: 'grid' as const, w: 52 }, { w: 64 }, { icon: 'settings' as const, label: 'Workspace settings' }]

function BeforeApp() {
  return (
    <div className="eai-screen">
      <SideNav title="App settings" items={APP_NAV} />
      <div className="eai-page">
        <div className="eai-h1">AI Chatbot</div>
        <Card>
          <div className="eai-card__head"><span className="eai-card__title">Not on for this app</span><Badge tone="amber">Off</Badge></div>
          <div className="eai-card__text">Turn it on in Workspace settings first.</div>
          <div><Btn target="btn-ws" icon="out">Add in Workspace settings</Btn></div>
        </Card>
        <Filler /><Filler /><Filler />
      </div>
    </div>
  )
}

// Workspace settings, as a page: the same sidebar shape, the same feature, the same title
function BeforeWs({ on }: { on: boolean }) {
  return (
    <div className="eai-screen">
      <SideNav title="Workspace settings" items={APP_NAV} />
      <div className="eai-page">
        <div className="eai-card__head"><span className="eai-h1">AI Chatbot</span><span className="eai-x" data-target="ws-close" data-cursor="hand"><X size={16} strokeWidth={1.5} /></span></div>
        <Card>
          <div className="eai-rows" style={{ boxShadow: 'none' }}>
            <div className="eai-row" style={{ padding: '8px 0' }}><span className="eai-row__name">Vending issue form</span><Toggle on={on} target="ws-tog" /></div>
            <div className="eai-row" style={{ padding: '8px 0' }}><span className="eai-row__name">Identity verification</span><Toggle on={false} /></div>
          </div>
        </Card>
        <Filler /><Filler /><Filler />
      </div>
    </div>
  )
}

// Where closing workspace settings landed: the workspace home
function BeforeHome() {
  return (
    <div className="eai-screen">
      <SideNav items={WS_NAV} />
      <div className="eai-home">
        <div className="eai-home__title">Let’s build an app</div>
        <div className="eai-prompt"><Bar w={240} h={8} r={4} tone={2} /></div>
        <div className="eai-list__head">Recent apps</div>
        <div className="eai-list">
          <div className="eai-list__row" data-target="recent-vending">Vending issue form<Badge tone="green">Live</Badge></div>
          <div className="eai-list__row">Identity verification<Badge tone="green">Live</Badge></div>
        </div>
      </div>
    </div>
  )
}

// After: the app as a card in the workspace, its own white sidebar and grey page
function AfterApp({ on }: { on: boolean }) {
  return (
    <div className="eai-screen eai-screen--wash">
      <div className="eai-appcard">
        <SideNav title="App settings" items={APP_NAV} />
        <div className="eai-page eai-page--wash">
          <div className="eai-h1">AI Chatbot</div>
          <Card>
            <div className="eai-card__head">
              <Fade value={on ? 'on' : 'off'} states={{ off: <span className="eai-card__title">Not on for this app</span>, on: <span className="eai-card__title">On for this app</span> }} />
              <Fade value={on ? 'on' : 'off'} states={{ off: <Badge tone="amber">Off</Badge>, on: <Badge tone="green">On</Badge> }} />
            </div>
            <div className="eai-card__text">Workspace settings opens over this page.</div>
            <div><Btn target="btn-on">Workspace settings</Btn></div>
          </Card>
          <Filler /><Filler /><Filler />
        </div>
      </div>
    </div>
  )
}

function Scene({ s, layout }: { s: S; layout: Layout }) {
  const view = s.after ? 'after' : s.screen
  return (
    <>
      <Note after={s.after} before="Two settings that look the same; closing one leaves the app" fix="Workspace settings opens over the app; closing it keeps you there" />
      <Win
        layout={layout}
        after={s.after}
        overlay={<FeatureDialog open={s.dlg} on={s.on} />}
        top={<Fade value={!s.after && s.screen !== 'app' ? 'ws' : 'app'} states={{ app: <TopBar app="Vending issue form" />, ws: <TopBar /> }} />}
      >
        <Fade className="eai-fade--fill" value={view} states={{ app: <BeforeApp />, ws: <BeforeWs on={s.on && !s.after} />, home: <BeforeHome />, after: <AfterApp on={s.on && s.after && !s.dlg} /> }} />
      </Win>
    </>
  )
}

export function EaiSettingsLevels({ bare = true }: { bare?: boolean } = {}) {
  return (
    <figure className={bare ? 'not-prose eai eai--bare' : 'not-prose eai my-8'} role="img" aria-label="Before: app settings and workspace settings look the same, and closing workspace settings leaves the app for the workspace home. After: workspace settings is a dialog over the app, so you stay where you were">
      <Stage width={720} height={480} compact={{ below: 600, width: 358, height: 470 }} initial={initial} poster={poster} script={script} play="loop" fill={!bare} cursor={{ at: REST, style: 'large' }} className="eai">
        {(s, _rect, layout) => <Scene s={s} layout={layout === 'compact' ? 'compact' : 'wide'} />}
      </Stage>
    </figure>
  )
}
