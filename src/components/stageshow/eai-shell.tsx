'use client'

import { type ReactNode, useLayoutEffect, useRef, useState } from 'react'
import './eai-shell.css'

// The Enterprise AI workspace as the prototype draws it today (prototypes repo,
// workspace-ai-demo/build-web: ws-home.html, app-ai-features.html, the settings dialog), rebuilt
// at its real sizes from computed styles: Geist, type 24/16/14/12, weights 400/500/600, ink #09090b
// and the zinc greys, translucent ink hairlines, 8pt spacing. Used by EaiNavigation,
// EaiSettingsDialog and EaiOnward.
//
// The two levels, as the prototype has them now:
// - Workspace: a grey sidebar (#fafafa) beside a white page with a white top bar.
// - App: the page goes grey, the top bar names NYC Council / Parking permit, and the app is a white
//   card nested in it: a white rail beside a grey pane of white cards.
//
// Frame (wide, 720): a note at the gutter (32), the product window under it, inset 32 at the
// sides, running off the foot. Compact (358): gutter 16, the sidebars collapse to their icon rails
// (the prototype's collapsed state) so the colours still read.
// One radius for UI elements (8: buttons, nav items, fields, row boxes), 12 for containers (window,
// cards, dialog). Gaps: 8 side by side, 16 between stacked blocks, 4/8 inside a component.

export type Layout = 'wide' | 'compact'
// Which part of a scene plays: the problem, the answer, or both in one loop
export type Mode = 'problem' | 'answer' | 'both'

// The prototype's own icon set (admin-shell.js, 24 grid, stroke 2), drawn at 16
const PATHS = {
  home: '<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .7-1.5l7-6a2 2 0 0 1 2.6 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  template: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>',
  sparkle: '<path d="M12 3l1.9 5.6L19.5 10l-5.6 1.9L12 17.5l-1.9-5.6L4.5 10l5.6-1.4z"/>',
  gear: '<path d="M9.7 3h4.6l.6 2.4 1.5.9 2.4-.7 2.3 4-1.8 1.7v1.8l1.8 1.7-2.3 4-2.4-.7-1.5.9-.6 2.4H9.7l-.6-2.4-1.5-.9-2.4.7-2.3-4 1.8-1.7v-1.8L2.9 9.6l2.3-4 2.4.7 1.5-.9z"/><circle cx="12" cy="12" r="3"/>',
  sliders: '<path d="M21 4h-7M10 4H3M21 12h-9M8 12H3M21 20h-5M12 20H3M14 2v4M8 10v4M16 18v4"/>',
  file: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v5h6"/>',
  chart: '<path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M18 17V9M13 17V5M8 17v-3"/>',
  open: '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><path d="M15 3h6v6M10 14 21 3"/>',
  bell: '<path d="M10.3 21a1.9 1.9 0 0 0 3.4 0"/><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
  panel: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18"/>',
  swap: '<path d="M7 15l5 5 5-5M7 9l5-5 5 5"/>',
  up: '<path d="m5 15 7-7 7 7"/>',
  down: '<path d="m5 9 7 7 7-7"/>',
  left: '<path d="m15 18-6-6 6-6"/>',
  right: '<path d="m9 18 6-6-6-6"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  building: '<path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4M10 10h4M10 14h4M10 18h4"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>',
  card: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>',
  check: '<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
  play: '<path d="M8 5.5v13l10.5-6.5z"/>',
  zap: '<path d="M13 2 3 14h9l-1 8 10-12h-9z"/>',
  paperclip: '<path d="m21.4 11.1-9.2 9.2a6 6 0 0 1-8.5-8.5l9.2-9.2a4 4 0 0 1 5.7 5.7l-9.2 9.2a2 2 0 0 1-2.8-2.8l8.5-8.5"/>',
  arrowRight: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  tick: '<path d="M20 6 9 17l-5-5"/>',
  plug: '<path d="M12 22v-5M9 8V2M15 8V2M7 8h10v4a4 4 0 0 1-8 0V8z"/>',
} as const
export type IcoName = keyof typeof PATHS

export function Ico({ n, className = '' }: { n: IcoName; className?: string }) {
  return <svg className={`eaw-ico ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden dangerouslySetInnerHTML={{ __html: PATHS[n] }} />
}

// One spot, several states, swapped by opacity alone and sequenced: the old one is out (150ms)
// before the new one comes in (200ms), so two states never overprint
export function Fade<K extends string>({ value, states, className = '' }: { value: K; states: Partial<Record<K, ReactNode>>; className?: string }) {
  return (
    <div className={`eaw-fade ${className}`}>
      {(Object.keys(states) as K[]).map((k) => <div key={k} className="eaw-fade__item" data-on={k === value || undefined} aria-hidden={k !== value || undefined}>{states[k]}</div>)}
    </div>
  )
}

// A Fade whose height eases to the shown state's, so a card is as tall as what it shows. The new
// contents fade in once the height has settled, so the moving edge never cuts them
export function FitFade<K extends string>({ value, states }: { value: K; states: Partial<Record<K, ReactNode>> }) {
  const box = useRef<HTMLDivElement>(null)
  const [h, setH] = useState<number>()
  const [ready, setReady] = useState(false)
  useLayoutEffect(() => { const t = setTimeout(() => setReady(true), 600); return () => clearTimeout(t) }, [])
  useLayoutEffect(() => {
    const el = box.current?.querySelector<HTMLElement>(':scope > .eaw-fade > .eaw-fade__item[data-on]')
    if (!el) return
    const fit = () => setH(el.offsetHeight)
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(el)
    return () => ro.disconnect()
  }, [value])
  return <div ref={box} className="eaw-fit" data-ready={ready || undefined} style={{ height: h }}><Fade value={value} states={states} /></div>
}

// The note above the window: which half this is, and what it means. Both mounted in one cell,
// crossfading. Compact carries a shorter sentence
export function Note({ fix, problem, solution }: { fix: boolean; problem: [string, string]; solution: [string, string] }) {
  return (
    <div className="eaw-note">
      <span className="eaw-note__text" data-show={!fix || undefined}><b>The problem</b><span className="eaw-note__long">{problem[0]}</span><span className="eaw-note__short">{problem[1]}</span></span>
      <span className="eaw-note__text" data-show={fix || undefined}><b>The answer</b><span className="eaw-note__long">{solution[0]}</span><span className="eaw-note__short">{solution[1]}</span></span>
    </div>
  )
}

// The product window: one rounded surface, running off the stage's foot. `overlay` sits over it
// all (a dialog and its scrim)
// vis: how much of the window shows above the crop, so a dialog centres in what's in view
export function Win({ children, overlay, vis }: { children: ReactNode; overlay?: ReactNode; vis?: number }) {
  return (
    <div className="eaw-win ss-window" style={vis ? ({ ['--eaw-vis' as string]: `${vis}px` }) : undefined}>
      <div className="eaw-win__body">{children}</div>
      {overlay}
    </div>
  )
}

export function Btn({ children, dark = false, target, out = false, icon, sm = false }: { children: ReactNode; dark?: boolean; target?: string; out?: boolean; icon?: IcoName; sm?: boolean }) {
  return (
    <span className={`eaw-btn${dark ? ' eaw-btn--dark' : ''}${sm ? ' eaw-btn--sm' : ''}`} data-target={target} data-cursor="hand">
      {icon && <Ico n={icon} />}
      {children}
      {out && <span className="eaw-btn__out" aria-hidden>↗</span>}
    </span>
  )
}

export function Toggle({ on, target }: { on: boolean; target?: string }) {
  return <span className="eaw-switch" data-on={on || undefined} data-target={target} data-cursor="hand" aria-hidden><i /></span>
}

// The prototype's status badge: a dot and a word
export function Status({ children, tone = 'green' }: { children: ReactNode; tone?: 'green' | 'grey' }) {
  return <span className={`eaw-status eaw-status--${tone}`}><i />{children}</span>
}

// People and workspaces: the prototype's initials. A workspace is a black tile with its letter;
// a person is a blue disc
export function WsMark() {
  return <span className="eaw-wsmark" aria-hidden>N</span>
}
export function Me() {
  return <span className="eaw-me">GC</span>
}

/* ------------------------------------------------------------------ workspace */

type NavItem = { icon: IcoName; label: string; count?: number; key?: string; target?: string }
const WS_NAV: NavItem[] = [
  { icon: 'home', label: 'Home', key: 'home' },
  { icon: 'grid', label: 'All apps', count: 5 },
  { icon: 'template', label: 'Templates' },
  { icon: 'sparkle', label: 'Add to apps' },
  { icon: 'gear', label: 'Workspace settings', key: 'settings' },
]
export const RECENT = ['Parking permit', 'Building permit', 'Street vendor licence', 'Noise complaint']

// The workspace sidebar: grey, the workspace switcher on top, its places, then recent apps.
// Compact: the collapsed rail, icons only
export function WsSidebar({ layout, active = 'home', recentTarget, settingsTarget }: { layout: Layout; active?: string; recentTarget?: string; settingsTarget?: string }) {
  const wide = layout === 'wide'
  return (
    <aside className="eaw-side">
      <div className="eaw-switcher">
        <WsMark />
        {wide && <><span className="eaw-switcher__name">NYC Council</span><Ico n="swap" className="eaw-faint" /></>}
      </div>
      <nav className="eaw-nav">
        {WS_NAV.map((it) => (
          <span key={it.label} className="eaw-item" data-on={it.key === active || undefined} data-target={it.key === 'settings' ? settingsTarget : undefined} data-cursor={it.key === 'settings' && settingsTarget ? 'hand' : undefined}>
            <Ico n={it.icon} />
            {wide && <span className="eaw-item__label">{it.label}</span>}
            {wide && it.count != null && <span className="eaw-item__count">{it.count}</span>}
          </span>
        ))}
      </nav>
      {wide && (
        <>
          <div className="eaw-side__label">Recent apps</div>
          <nav className="eaw-nav">
            {RECENT.map((name, i) => (
              <span key={name} className="eaw-item eaw-item--quiet" data-target={i === 0 ? recentTarget : undefined} data-cursor={i === 0 ? 'hand' : undefined}>
                <Ico n="grid" />
                <span className="eaw-item__label">{name}</span>
              </span>
            ))}
          </nav>
        </>
      )}
    </aside>
  )
}

// The workspace page's top bar: white, the page's name, search, the bell and the main action
export function WsTop({ layout, title, back }: { layout: Layout; title: string; back?: string }) {
  const wide = layout === 'wide'
  return (
    <header className="eaw-top">
      <Ico n="panel" className="eaw-faint" />
      <span className="eaw-top__title">{title}</span>
      {wide && !back && <span className="eaw-search"><Ico n="search" /><span>Search apps…</span><kbd>⌘K</kbd></span>}
      <span className="eaw-top__end">
        <span className="eaw-bell"><Ico n="bell" /></span>
        {wide && !back && <Btn>+ Create new app</Btn>}
        {back && <Me />}
      </span>
    </header>
  )
}

// Workspace Home: the prompt, then recent apps. Compact puts recent apps straight under the prompt
// The prototype's "Things you can add to your apps" cards
const THINGS = [['AI Document Checking', 'Staff only review the exceptions'], ['Document Checklist', 'No more chasing missing documents'], ['AI Chatbot', 'Fewer calls and abandoned forms'], ['AI Document Creation', 'Consistent letters in minutes']] as const

// things: show them in compact too (wide always has them, as the real Home does)
export function WsHome({ layout, recentTarget, things = false }: { layout: Layout; recentTarget?: string; things?: boolean }) {
  const wide = layout === 'wide'
  const rows: [string, string][] = [['Parking permit', 'Just now'], ['Building permit', '1h ago'], ['Street vendor licence', '2h ago'], ['Noise complaint', 'Yesterday'], ['Pothole report', '2d ago'], ['Tree removal', '3d ago'], ['Business licence', 'Last week']]
  return (
    <div className="eaw-home">
      <div className="eaw-home__title">Let’s build an app</div>
      <div className="eaw-prompt">
        <span className="eaw-prompt__ph">{wide ? 'Describe the app you want to build, or bring an existing one in…' : 'Describe the app you want to build…'}</span>
        <span className="eaw-prompt__bar">
          <span className="eaw-chip eaw-chip--icon"><Ico n="paperclip" /></span>
          <span className="eaw-chip"><Ico n="template" />Template</span>
          <span className="eaw-prompt__go"><Ico n="arrowRight" /></span>
        </span>
      </div>
      {wide && <div className="eaw-disclosure"><span>Building something more complex? Use your own AI coding tool</span><Ico n="down" /></div>}
      {(things || wide) && (
        <>
          <div className="eaw-section">
            <span className="eaw-section__title">Things you can add to your apps</span>
            {wide && <span className="eaw-link">View all</span>}
          </div>
          <div className="eaw-things">
            {(wide ? THINGS : THINGS.filter((_, i) => i === 0 || i === 2)).map(([k, t]) => (
              <div key={k} className="eaw-thing">
                <span className="eaw-thing__art"><span className="eaw-doc"><i style={{ width: '70%' }} /><i style={{ width: '90%' }} /><i style={{ width: '55%' }} /></span></span>
                <span className="eaw-thing__k">{k}</span>
                <span className="eaw-thing__t">{t}</span>
              </div>
            ))}
          </div>
        </>
      )}
      <div className="eaw-section">
        <span className="eaw-section__title">Recent apps</span>
        <span className="eaw-link">View all ›</span>
      </div>
      <div className="eaw-list">
        {rows.map(([name, seen], i) => (
          <div key={name} className="eaw-list__row" data-target={i === 0 && !wide ? recentTarget : undefined} data-cursor={i === 0 && !wide ? 'hand' : undefined}>
            <span className="eaw-list__name">{name}</span>
            <Status>{wide ? 'Live' : null}</Status>
            {wide && <span className="eaw-list__seen">{seen}</span>}
          </div>
        ))}
      </div>
    </div>
  )
}

// The workspace as a whole screen: grey sidebar, white page
export function WsScreen({ layout, children, top, sidebar }: { layout: Layout; children: ReactNode; top: ReactNode; sidebar: ReactNode }) {
  return (
    <div className="eaw-screen" data-layout={layout}>
      {sidebar}
      <main className="eaw-main">
        {top}
        <div className="eaw-main__body">{children}</div>
      </main>
    </div>
  )
}

/* ------------------------------------------------------------------ app */

// The app's top bar, on the grey: where you are, NYC Council / Parking permit
export function AppTop({ layout, wsTarget }: { layout: Layout; wsTarget?: string }) {
  const wide = layout === 'wide'
  return (
    <header className="eaw-apptop">
      <span className="eaw-crumb" data-target={wsTarget} data-cursor={wsTarget ? 'hand' : undefined}><WsMark /><span>NYC Council</span></span>
      <span className="eaw-crumb__sep">/</span>
      <span className="eaw-crumb eaw-crumb--app">Parking permit</span>
      {wide && <Ico n="swap" className="eaw-faint" />}
      <span className="eaw-top__end">{wide && <span className="eaw-bell"><Ico n="bell" /></span>}<Me /></span>
    </header>
  )
}

export type RailKey = 'overview' | 'features' | 'chatbot'
type RailItem = { icon: IcoName; label: string; key?: RailKey; sub?: boolean; end?: IcoName }
const RAIL: (RailItem | string)[] = [
  { icon: 'home', label: 'Overview', key: 'overview' },
  { icon: 'sliders', label: 'Editor' },
  { icon: 'file', label: 'Submissions' },
  { icon: 'chart', label: 'Analytics' },
  'Advanced',
  { icon: 'sliders', label: 'Workflows' },
  { icon: 'sparkle', label: 'Features', key: 'features', end: 'up' },
  { icon: 'file', label: 'AI Document Checking', sub: true },
  { icon: 'sparkle', label: 'AI Chatbot', key: 'chatbot', sub: true },
  { icon: 'open', label: 'Launch App', end: 'down' },
]

// The app's rail: the same places in every app, white. `grey` draws it the way the first release
// did, the workspace sidebar's grey (the problem in EaiNavigation)
export function AppRail({ layout, active, grey = false, back }: { layout: Layout; active: RailKey; grey?: boolean; back?: string }) {
  const wide = layout === 'wide'
  return (
    <aside className={`eaw-rail${grey ? ' eaw-side' : ''}`}>
      {back ? (
        <div className="eaw-back" data-target={back} data-cursor="hand"><Ico n="left" />{wide && <span>Back to workspace</span>}</div>
      ) : wide ? (
        <div className="eaw-rail__search"><Ico n="panel" className="eaw-faint" /><span className="eaw-field"><Ico n="search" /><span>Search…</span></span></div>
      ) : null}
      <nav className="eaw-nav">
        {RAIL.map((it, i) => {
          if (typeof it === 'string') return wide ? <div key={i} className="eaw-rail__label">{it}</div> : <div key={i} className="eaw-rail__rule" />
          if (it.sub && !wide) return null
          return (
            <span key={it.label} className="eaw-item" data-sub={it.sub || undefined} data-on={it.key === active || undefined}>
              <Ico n={it.icon} />
              {wide && <span className="eaw-item__label">{it.label}</span>}
              {wide && it.end && <Ico n={it.end} className="eaw-item__end eaw-faint" />}
            </span>
          )
        })}
      </nav>
    </aside>
  )
}

// The app nested in the workspace: a white card on the grey page, its bar, its rail, its grey pane
export function AppScreen({ layout, wsTarget, children }: { layout: Layout; wsTarget?: string; children: ReactNode }) {
  return (
    <div className="eaw-appscreen" data-layout={layout}>
      <AppTop layout={layout} wsTarget={wsTarget} />
      {children}
    </div>
  )
}
// rail={false}: the rail collapsed away, as the prototype's panel toggle does (compact, where the
// story isn't the rail)
export function AppShell({ layout, title, active, children, rail = true }: { layout: Layout; title: string; active: RailKey; children: ReactNode; rail?: boolean }) {
  return (
    <div className={`eaw-shell${rail ? '' : ' eaw-shell--norail'}`}>
      <div className="eaw-shell__bar"><span className="eaw-shell__kicker">App settings</span><span className="eaw-shell__title">{title}</span></div>
      <div className={`eaw-shell__body${rail ? '' : ' eaw-shell__body--norail'}`}>
        {rail && <AppRail layout={layout} active={active} />}
        <div className="eaw-pane">{children}</div>
      </div>
    </div>
  )
}

// A page header in the pane: the title, an optional line under it, an optional action
export function PageHead({ title, sub, action }: { title: string; sub?: string; action?: ReactNode }) {
  return (
    <header className="eaw-head">
      <div className="eaw-head__text">
        <div className="eaw-head__title">{title}</div>
        {sub && <div className="eaw-head__sub">{sub}</div>}
      </div>
      {action}
    </header>
  )
}

// A card in the pane (af-feature-card): heading, description, then its rows
export function Card({ title, desc, children, target }: { title?: string; desc?: string; children?: ReactNode; target?: string }) {
  return (
    <section className="eaw-card" data-target={target}>
      {(title || desc) && (
        <div className="eaw-card__hd">
          {title && <div className="eaw-card__title">{title}</div>}
          {desc && <div className="eaw-card__desc">{desc}</div>}
        </div>
      )}
      {children}
    </section>
  )
}

// The page carrying on past the crop: a card drawn in bars, so the crop always falls in filler
export function MoreCard() {
  return (
    <section className="eaw-card eaw-card--more" aria-hidden>
      <i style={{ width: 132 }} className="eaw-more__title" />
      {[78, 64, 86, 58].map((w, k) => <i key={k} style={{ width: `${w}%` }} />)}
    </section>
  )
}

// The rows box inside a card: a label and its control
export function Rows({ children, dense = false, steps = false }: { children: ReactNode; dense?: boolean; steps?: boolean }) {
  return <div className={`eaw-rows${dense ? ' eaw-rows--dense' : ''}${steps ? ' eaw-rows--steps' : ''}`}>{children}</div>
}
export function Row({ label, sub, children }: { label: ReactNode; sub?: ReactNode; children?: ReactNode }) {
  return (
    <div className="eaw-row">
      <span className="eaw-row__text"><span className="eaw-row__label">{label}</span>{sub && <span className="eaw-row__sub">{sub}</span>}</span>
      {children}
    </div>
  )
}

/* ------------------------------------------------------------------ workspace settings */

const SETTINGS_NAV: { icon: IcoName; label: string; key?: string }[] = [
  { icon: 'building', label: 'Overview' },
  { icon: 'users', label: 'People and Access' },
  { icon: 'card', label: 'Plan and Billing' },
  { icon: 'chart', label: 'Usage' },
  { icon: 'sparkle', label: 'Enable AI features in apps', key: 'ai' },
]
export const FEATURES = ['AI Document Checking', 'AI Chatbot', 'AI Document Creation'] as const
// The settings nav's Advanced Settings group, opened (its items as the prototype lists them)
const SETTINGS_ADVANCED: { icon: IcoName; label: string }[] = [
  { icon: 'plug', label: 'Integrations' },
  { icon: 'grid', label: 'Services' },
  { icon: 'file', label: 'Audit log' },
  { icon: 'sliders', label: 'Model Profiles' },
]

export function SettingsNav({ layout }: { layout: Layout }) {
  const wide = layout === 'wide'
  return (
    <aside className="eaw-side eaw-setnav">
      {wide && <div className="eaw-setnav__title">Workspace settings</div>}
      {wide && <div className="eaw-side__label">Manage</div>}
      <nav className="eaw-nav">
        {SETTINGS_NAV.map((it) => (
          <span key={it.label} className="eaw-item" data-on={it.key === 'ai' || undefined}>
            <Ico n={it.icon} />
            {wide && <span className="eaw-item__label">{it.label}</span>}
          </span>
        ))}
      </nav>
      {wide && (
        <>
          <div className="eaw-side__label eaw-side__label--group">Advanced Settings<Ico n="up" /></div>
          <nav className="eaw-nav">
            {SETTINGS_ADVANCED.map((it) => <span key={it.label} className="eaw-item"><Ico n={it.icon} /><span className="eaw-item__label">{it.label}</span></span>)}
          </nav>
        </>
      )}
    </aside>
  )
}

// The "Enable AI features in apps" card: a switch per feature. `chatbot` is AI Chatbot's switch
export function FeaturesCard({ chatbot, target }: { chatbot: boolean; target?: string }) {
  return (
    <section className="eaw-card eaw-card--flush">
      <div className="eaw-card__hd">
        <div className="eaw-card__title">AI features</div>
        <div className="eaw-card__desc">Turn on the AI features your apps can use.</div>
        <div className="eaw-card__desc">Then set each one up on a workflow from the app’s Features page.</div>
      </div>
      <div className="eaw-table">
        {FEATURES.map((f) => (
          <div key={f} className="eaw-table__row">
            <span className="eaw-table__name">{f}</span>
            <Toggle on={f === 'AI Chatbot' ? chatbot : false} target={f === 'AI Chatbot' ? target : undefined} />
          </div>
        ))}
      </div>
    </section>
  )
}

// Workspace settings as a dialog over the app's pane (adDialog: a grey footer holds the CTA). Small,
// so the app's bar, title and rail stay in view around it
export function SettingsDialog({ open, chatbot, toggle, done }: { open: boolean; chatbot: boolean; toggle: string; done: string }) {
  return (
    <div className="eaw-dlg-wrap" data-open={open || undefined}>
      <div className="eaw-scrim" />
      <div className="eaw-dlg" role="dialog" aria-label="Workspace settings">
        <div className="eaw-dlg__bar">
          <span className="eaw-dlg__head"><span className="eaw-dlg__kicker">Workspace settings</span><span className="eaw-dlg__title">Enable AI features in apps</span></span>
          <span className="eaw-x"><Ico n="x" /></span>
        </div>
        <div className="eaw-dlg__hint">Turn on the AI features your apps can use.</div>
        <div className="eaw-table">
          {FEATURES.map((f) => (
            <div key={f} className="eaw-table__row">
              <span className="eaw-table__name">{f}</span>
              <Toggle on={f === 'AI Chatbot' ? chatbot : false} target={f === 'AI Chatbot' ? toggle : undefined} />
            </div>
          ))}
        </div>
        <footer className="eaw-dlg__foot">
          <Btn>Cancel</Btn>
          <Btn dark target={done}>Done</Btn>
        </footer>
      </div>
    </div>
  )
}

export function Toast({ on, children }: { on: boolean; children: ReactNode }) {
  return <div className="eaw-toast" data-on={on || undefined} role="status">{children}</div>
}

// Workspace settings › AI Chatbot, as a dialog over the app (admin-ai-feature-setup.js): each app with
// its switch and a "Set up" button, disabled until that app's switch is on, then dark. Set up closes
// settings and goes to the feature's setup in that app: the onward step, in the dialog itself
const FEATURE_APPS = ['Parking permit', 'Building permit', 'Street vendor licence', 'Noise complaint']
export function FeatureDialog({ open, on, toggle, setup, layout = 'wide' }: { open: boolean; on: boolean; toggle: string; setup: string; layout?: Layout }) {
  // Compact lists the apps whose names fit beside their controls
  const apps = layout === 'wide' ? FEATURE_APPS : FEATURE_APPS.filter((n) => n.length < 18)
  return (
    <div className="eaw-dlg-wrap" data-open={open || undefined}>
      <div className="eaw-scrim" />
      <div className="eaw-dlg eaw-dlg--feature" role="dialog" aria-label="Workspace settings: AI Chatbot">
        <div className="eaw-dlg__bar">
          <span className="eaw-dlg__head"><span className="eaw-dlg__kicker">Workspace settings</span><span className="eaw-dlg__title">AI Chatbot</span></span>
          <span className="eaw-x"><Ico n="x" /></span>
        </div>
        <div className="eaw-dlg__hint">Enable this feature for an app, then choose Set up to add it to one of the app’s workflows.</div>
        <div className="eaw-ftable">
          <div className="eaw-ftable__head"><span>App</span><span>Enabled</span><span>Setup</span></div>
          {apps.map((name, i) => {
            const lit = i === 0 && on
            return (
              <div key={name} className="eaw-ftable__row">
                <span className="eaw-table__name">{name}</span>
                <Toggle on={lit} target={i === 0 ? toggle : undefined} />
                <span className="eaw-setup" data-on={lit || undefined} data-target={i === 0 ? setup : undefined} data-cursor={i === 0 ? 'hand' : undefined}>Set up</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
