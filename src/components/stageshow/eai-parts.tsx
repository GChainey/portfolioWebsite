'use client'

import { type ReactNode, useLayoutEffect, useRef, useState } from 'react'
import { Bell, Check, ChevronDown, ChevronRight, FileText, Home, LayoutGrid, MessageSquare, Plus, Settings, X } from 'lucide-react'
import { Bar } from './kit/window'
import { Collapse } from './kit/motion/Collapse'
import './eai-scenes.css'

// The Enterprise AI workspace in its current look (the prototypes repo's workspace-ai-demo,
// DESIGN-SYSTEM.md): Geist, type 24/16/14/12, weights 400/500/600, ink #09090b and the zinc greys,
// one hairline colour, 8pt spacing, cards on white, dialogs with a grey footer holding the buttons.
// Shared by EaiSettingsLevels and EaiOnward.
//
// Frame (wide 720): the product window inset 40 from the sides, a note line above it at the gutter,
// running off the bottom. Compact (358): the same window at 326 with the sidebar dropped, page only.
// One radius for UI elements (8), the window and dialog 12. Gaps: 12 between side-by-side controls,
// 16 between stacked blocks, 4/8 inside a component.

export type Layout = 'wide' | 'compact'
const I = { size: 16, strokeWidth: 1.5 } as const

// One spot, several states, swapped by opacity alone: nothing slides or hops
export function Fade<K extends string>({ value, states, className = '' }: { value: K; states: Partial<Record<K, ReactNode>>; className?: string }) {
  return (
    <div className={`eai-fade ${className}`}>
      {(Object.keys(states) as K[]).map((k) => <div key={k} className="eai-fade__item" data-on={k === value || undefined} aria-hidden={k !== value || undefined}>{states[k]}</div>)}
    </div>
  )
}

// A Fade whose height eases to the shown state's, so a card is as tall as what it shows
export function FitFade<K extends string>({ value, states }: { value: K; states: Partial<Record<K, ReactNode>> }) {
  const box = useRef<HTMLDivElement>(null)
  const [h, setH] = useState<number>()
  // The first measure (and fonts settling) lands without easing; only a change of state eases
  const [ready, setReady] = useState(false)
  useLayoutEffect(() => { const t = setTimeout(() => setReady(true), 600); return () => clearTimeout(t) }, [])
  useLayoutEffect(() => {
    const el = box.current?.querySelector<HTMLElement>(':scope > .eai-fade > .eai-fade__item[data-on]')
    if (!el) return
    const fit = () => setH(el.offsetHeight)
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(el)
    return () => ro.disconnect()
  }, [value])
  return <div ref={box} className="eai-fit" data-ready={ready || undefined} style={{ height: h }}><Fade value={value} states={states} /></div>
}

// The note above the window: which version this is, and what it means; two in one cell, crossfading
export function Note({ after, before: b, fix }: { after: boolean; before: string; fix: string }) {
  return (
    <div className="eai-note">
      <span className="eai-note__text" data-show={!after || undefined}><b>Before</b><span>{b}</span></span>
      <span className="eai-note__text" data-show={after || undefined}><b>After the fix</b><span>{fix}</span></span>
    </div>
  )
}

export function Toggle({ on, target }: { on: boolean; target?: string }) {
  return <span className="eai-toggle" data-on={on || undefined} data-target={target} data-cursor="hand" aria-hidden><i /></span>
}

export function Btn({ children, dark = false, target, icon }: { children: ReactNode; dark?: boolean; target?: string; icon?: 'out' | 'next' }) {
  return (
    <span className={`eai-btn${dark ? ' eai-btn--dark' : ''}`} data-target={target} data-cursor="hand">
      {children}
      {icon === 'next' && <ChevronRight {...I} />}
      {icon === 'out' && <span className="eai-out">↗</span>}
    </span>
  )
}

export function Badge({ tone, children }: { tone: 'amber' | 'green'; children: ReactNode }) {
  return <span className={`eai-badge eai-badge--${tone}`}>{children}</span>
}

// The workspace's top bar: workspace name, and the app's name beside it when you're in one
export function TopBar({ app }: { app?: string }) {
  return (
    <header className="eai-top">
      <span className="eai-logo">B</span>
      <span className="eai-top__ws">Brightside Services</span>
      {app && <><span className="eai-top__sep">/</span><span className="eai-top__app">{app}</span><ChevronDown {...I} className="eai-mute" /></>}
      <span className="eai-top__end"><Bell {...I} className="eai-mute" /><span className="eai-me">AT</span></span>
    </header>
  )
}

type NavItem = { label?: string; w?: number; icon?: 'home' | 'grid' | 'settings' | 'file' | 'chat'; on?: boolean; sub?: boolean }
const ICONS = { home: Home, grid: LayoutGrid, settings: Settings, file: FileText, chat: MessageSquare }

export function SideNav({ title, items }: { title?: string; items: NavItem[] }) {
  return (
    <nav className="eai-nav">
      {title && <div className="eai-nav__title">{title}</div>}
      {items.map((it, i) => {
        const Icon = it.icon ? ICONS[it.icon] : null
        return (
          <div key={i} className="eai-nav__item" data-on={it.on || undefined} data-sub={it.sub || undefined}>
            {Icon ? <Icon {...I} /> : <Bar w={14} h={14} r={4} tone={2} />}
            {it.label ? <span>{it.label}</span> : <Bar w={it.w ?? 64} h={8} r={4} tone={2} />}
          </div>
        )
      })}
    </nav>
  )
}

// The app's own sidebar (Features open, AI Chatbot selected), the same in every app view
export const APP_NAV: NavItem[] = [
  { icon: 'home', w: 58 }, { w: 44 }, { w: 72 }, { w: 60 },
  { label: 'Features', icon: 'grid' }, { label: 'AI Chatbot', icon: 'chat', on: true, sub: true }, { w: 96, sub: true },
]

// A page card (Vercel/Geist style): white, hairline ring, 8px corners
export function Card({ children, className = '', target }: { children: ReactNode; className?: string; target?: string }) {
  return <section className={`eai-card ${className}`} data-target={target}>{children}</section>
}

// The workspace settings dialog for one feature: its apps with a switch each, a grey footer.
// saved: the row confirms it saved (and that's all). next: the onward step opens under the rows
export function FeatureDialog({ open, on, saved = false, next }: { open: boolean; on: boolean; saved?: boolean; next?: { show: boolean; node: ReactNode } }) {
  return (
    <div className="eai-dlg-wrap" data-open={open || undefined}>
      <div className="eai-scrim" />
      <div className="eai-dlg" role="dialog" aria-label="Workspace settings">
        <div className="eai-dlg__body">
          <div className="eai-dlg__head">
            <div>
              <div className="eai-dlg__kicker">Workspace settings</div>
              <div className="eai-dlg__title">AI Chatbot</div>
            </div>
            <span className="eai-x" data-cursor="hand"><X {...I} /></span>
          </div>
          <div>
            <div className="eai-rows">
              <div className="eai-row">
                <span className="eai-row__name">Vending issue form</span>
                <span className="eai-row__end">
                  <Fade value={on && saved ? 'saved' : 'none'} className="eai-row__state" states={{ none: <span />, saved: <span className="eai-saved"><Check {...I} />Saved</span> }} />
                  <Toggle on={on} target="tog-vending" />
                </span>
              </div>
              <div className="eai-row">
                <span className="eai-row__name">Identity verification</span>
                <span className="eai-row__end"><Toggle on={false} /></span>
              </div>
            </div>
            {next && <Collapse open={next.show}><div className="eai-next">{next.node}</div></Collapse>}
          </div>
        </div>
        <footer className="eai-dlg__foot">
          <Btn>Cancel</Btn>
          <Btn dark target="dlg-done">Done</Btn>
        </footer>
      </div>
    </div>
  )
}

// The product window: the top bar over a body
export function Win({ layout, top, children, after = false, overlay }: { layout: Layout; top: ReactNode; children: ReactNode; after?: boolean; overlay?: ReactNode }) {
  return (
    <div className="eai-win ss-window" data-layout={layout} data-after={after || undefined}>
      {top}
      <div className="eai-win__body">{children}</div>
      {overlay}
    </div>
  )
}

export { Plus }
