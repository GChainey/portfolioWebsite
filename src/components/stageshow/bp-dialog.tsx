'use client'

import type { ReactNode } from 'react'
import { AlertTriangle, CalendarDays, Check, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Clock, Info, Repeat, Stethoscope, X } from 'lucide-react'
import { Bar, Text } from './kit/window'
import './bp-scenes.css'

// Best Practice's New appointment dialog in Fluent 2 (recreations/bestpractice/fluent.css), as the
// parts the three Stageshow scenes share: BpSegmented, BpDetailsRow, BpNextAvailable. Each scene is
// a close-up (the stageshow `close-up` gold): the dialog at 1.3x, title and all, inset 40 top and
// sides and running off the bottom. The two-panel scenes slide the view to the right panel, so the
// left panel shows only as a sliver at the left edge, the details row's door still lit.
//
// Icons: Lucide, deliberately (the product's Fluent icon pack isn't in this repo), one size (16) and
// one stroke (1.5) throughout.

const AV = '/case-studies/bestpractice-booking/avatars'
export const PHOTO = { charlie: `${AV}/charlie-charmoose.jpg`, dominique: `${AV}/dominique-sat.jpg`, yarn: `${AV}/yarn-oldrick.jpg`, john: `${AV}/john-garner.jpg` }

// Design sizes per layout. Wide: the dialog whole across with a 40 gutter, off the bottom. With
// one panel that's a close-up (380 drawn at 640, about 1.7x); when the right panel opens the camera
// pulls back so both panels, an even 50/50 split, fit the same 640 (about 0.84x), the window whole,
// chrome top-left.
// Compact (the 358 phone column): one panel at a time at 1x, the right one pushed in over the left
// inside the same window, the way the dialog would behave on a narrow screen.
export const DIM = {
  wide: { gutter: 40, left: 380, right: 380, push: false },
  compact: { gutter: 16, left: 326, right: 326, push: true },
} as const
export type Layout = keyof typeof DIM
const SPAN = { wide: 640, compact: 326 } as const

export function zoomStyle(layout: Layout, two: boolean) {
  const d = DIM[layout]
  const width = d.push || !two ? d.left : d.left + d.right
  return { transform: `translate(${d.gutter}px, ${d.gutter}px) scale(${SPAN[layout] / width})` }
}

const I = { size: 16, strokeWidth: 1.5 } as const

// One spot, several states, swapped by opacity alone: no travel, no blur. The kit's States glides a
// new state up 4px, which suits a label but makes an icon in a fixed slot (the row's face or glyph,
// its chevron) hop between two positions. Here every state sits in one place; the old one leaves
// fast, the new one arrives a beat later, so they never read as two at once
export function Fade<K extends string>({ value, states, className = '', align = 'start' }: { value: K; states: Record<K, ReactNode>; className?: string; align?: 'start' | 'center' | 'end' }) {
  return (
    <span className={`bp-fade ${className}`} data-align={align}>
      {(Object.keys(states) as K[]).map((k) => <span key={k} className="bp-fade__item" data-on={k === value || undefined} aria-hidden={k !== value || undefined}>{states[k]}</span>)}
    </span>
  )
}

export function Photo({ src, size }: { src: string; size: 20 | 24 | 40 }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img className="bp-photo" src={src} alt="" width={size} height={size} />
}

// A patient: initials on the brand tint (we often won't have their photo). Providers keep faces
export function Initials({ name }: { name: string }) {
  const initials = name.split(' ').map((w) => w[0]).join('').slice(0, 2)
  return <span className="bp-initials" aria-hidden>{initials}</span>
}

export function Label({ children, req = false }: { children: ReactNode; req?: boolean }) {
  return <span className="bp-label">{children}{req && <span className="bp-req">*</span>}</span>
}

// The dialog: the left panel always, the right panel opening beside it (the dialog widens as the
// camera pulls back; the right panel's content is laid out at its own width throughout, so nothing
// reflows) or, compact, pushed in over the left
export function Dialog({ layout, two, left, right, hidden = false }: { layout: Layout; two: boolean; left: ReactNode; right?: ReactNode; hidden?: boolean }) {
  const d = DIM[layout]
  return (
    <div className="bp-zoom" data-hidden={hidden || undefined} style={zoomStyle(layout, two)}>
      <div className="ss-window bp-dialog" data-two={two || undefined} data-push={d.push || undefined} style={{ width: d.push || !two ? d.left : d.left + d.right }}>
        <div className="bp-left" style={{ width: d.left }}>{left}</div>
        {right && <div className="bp-right" style={{ width: d.right }}>{right}</div>}
        <span className="bp-close" aria-hidden data-cursor="hand"><X {...I} /></span>
      </div>
    </div>
  )
}

export function Title({ children }: { children: ReactNode }) {
  return <div className="bp-title">{children}</div>
}

export function Patient() {
  return (
    <div className="bp-field">
      <Label req>Patient</Label>
      <div className="bp-input" data-cursor="ibeam"><Initials name="Bobby Smith" /><span className="bp-val">Bobby Smith</span><span className="bp-ico" data-cursor="hand"><X {...I} /></span></div>
    </div>
  )
}

// The appointment details row: the door to the right panel. Full width of its panel. Empty, it
// says what's missing; filled, a face, a day and a time. Hover tints it; open (its panel showing)
// it stays lit with the chevron pointing back
export type RowValue = 'empty' | 'partial' | 'filled'
// snap: it takes over from MergeRow at identical geometry (checked pixel for pixel), so its arrival is an
// instant handoff, not an entrance
// clear: a ✕ to clear the assignment, shown once the row is assigned (its slot is always there, so
// the row's geometry never changes)
export function DetailsRow({ filled, value, open = false, target, snap = false, clear }: { filled?: boolean; value?: RowValue; open?: boolean; target?: string; snap?: boolean; clear?: string }) {
  const v: RowValue = value ?? (filled ? 'filled' : 'empty')
  return (
    <div className="bp-field" data-snap={snap || undefined}>
      <Label req>Appointment details</Label>
      <div className="bp-card" data-on={open || undefined} data-clear={clear ? '' : undefined} data-target={target} data-cursor="hand">
        <Fade
          value={v === 'empty' ? 'empty' : 'photo'}
          align="start"
          className="bp-card__lead"
          states={{
            empty: <span className="bp-glyph"><Stethoscope {...I} /></span>,
            photo: <Photo src={PHOTO.charlie} size={40} />,
          }}
        />
        <Fade
          value={v}
          align="start"
          className="bp-card__lines"
          states={{
            empty: <span className="bp-lines"><b>No provider selected</b><span>25th May 2021</span><span>No time selected</span></span>,
            partial: <span className="bp-lines"><b>Charlie Charmoose</b><span>26th May 2021</span><span>No time selected</span></span>,
            filled: <span className="bp-lines"><b>Charlie Charmoose</b><span>26th May 2021</span><span>10:30 am – 10:45 am</span></span>,
          }}
        />
        {clear && <span className="bp-clear" data-shown={v === 'filled' || undefined} data-target={clear} data-cursor="hand"><X {...I} /></span>}
        <Fade value={open ? 'back' : 'go'} className="bp-chev" states={{ go: <ChevronRight {...I} />, back: <ChevronLeft {...I} /> }} />
      </div>
    </div>
  )
}

export type Choice = 'none' | 'urgent' | 'repeat' | 'waiting'

// Urgent · Repeat · Add to waiting list: one control, one choice. Regular weight at rest
export function Group({ on, targets = false }: { on: Choice; targets?: boolean }) {
  const items: [Choice, string][] = [['urgent', 'Urgent'], ['repeat', 'Repeat'], ['waiting', 'Add to waiting list']]
  return (
    <div className="bp-group" role="group">
      {items.map(([k, t]) => (
        <span key={k} className="bp-seg" data-on={on === k || undefined} data-target={targets ? `seg-${k}` : undefined} data-cursor="hand">{t}</span>
      ))}
    </div>
  )
}

// A slim row under the group, for what a choice set up: one line and its detail
export function SlimRow({ icon, title, detail }: { icon: 'repeat' | 'waiting'; title: string; detail: string }) {
  return (
    <div className="bp-slim" data-cursor="hand">
      <span className="bp-slim__ico">{icon === 'repeat' ? <Repeat {...I} /> : <Clock {...I} />}</span>
      <span className="bp-lines bp-lines--slim"><span className="bp-strong">{title}</span><span className="bp-small">{detail}</span></span>
      <span className="bp-chev"><ChevronRight {...I} /></span>
    </div>
  )
}

export function Comment() {
  return (
    <div className="bp-field">
      <Label>Comment</Label>
      <div className="bp-area" data-cursor="ibeam" />
    </div>
  )
}

// The right panel's head: its title is secondary to the dialog's (regular weight), then the date
// and the providers picked
export function RightHead({ providers, date = '25/05/2021' }: { providers: ReactNode; date?: string }) {
  return (
    <>
      <Title><span className="bp-title--sub">Appointment details</span></Title>
      <div className="bp-row2">
        <div className="bp-field">
          <Label>Date</Label>
          <div className="bp-input" data-cursor="hand"><span className="bp-val">{date}</span><CalendarDays {...I} className="bp-ico" /></div>
        </div>
        <div className="bp-field">
          <Label req>Provider</Label>
          <div className="bp-input" data-cursor="hand">{providers}<ChevronDown {...I} className="bp-ico" /></div>
        </div>
      </div>
    </>
  )
}

// link: a fixed label, or labels that crossfade in place ({ on, states: { key: [label, chevron up] } })
export function ProviderHead({ photo, name, link, up = false }: { photo?: string; name?: string; link?: string | { on: string; states: Record<string, [string, boolean]> }; up?: boolean }) {
  return (
    <div className="bp-prov__head">
      {photo ? <Photo src={photo} size={24} /> : <span className="bp-disc" />}
      {name ? <Text className="bp-strong bp-prov__name">{name}</Text> : <Bar w={96} h={8} r={4} tone={3} />}
      {link && (typeof link === 'string'
        ? <span className="bp-link bp-more" data-cursor="hand">{link}{up ? <ChevronUp {...I} /> : <ChevronDown {...I} />}</span>
        : <Fade value={link.on} align="end" className="bp-more" states={Object.fromEntries(Object.entries(link.states).map(([k, [t, u]]) => [k, t ? <span key={k} className="bp-link bp-more" data-cursor="hand">{t}{u ? <ChevronUp {...I} /> : <ChevronDown {...I} />}</span> : <span key={k} />]))} />)}
    </div>
  )
}

export function Stepper({ date, next, back, flash }: { date: ReactNode; next?: string; back?: string; flash?: boolean }) {
  return (
    <div className="bp-stepper">
      <span className="bp-ico bp-step" data-cursor="hand" data-target={back}><ChevronLeft {...I} /></span>
      <div className="bp-input bp-input--date" data-cursor="hand" data-flash={flash || undefined}><span className="bp-val">{date}</span><CalendarDays {...I} className="bp-ico" /></div>
      <span className="bp-ico bp-step" data-cursor="hand" data-target={next}><ChevronRight {...I} /></span>
    </div>
  )
}

// Times: the picked one in the original design's teal (#CCF0E8)
export function Times({ times, picked, target, cols }: { times: string[]; picked?: string; target?: string; cols: number }) {
  return (
    <div className="bp-times" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
      {times.map((t) => (
        <span key={t} className="bp-time" data-on={picked === t || undefined} data-target={t === target ? 'time' : undefined} data-cursor="hand">{t}</span>
      ))}
    </div>
  )
}

// A provider whose times are filler: a plain disc and bars, for the rows the story doesn't touch
export function FillerProvider({ cols }: { cols: number }) {
  return (
    <div className="bp-prov">
      <ProviderHead />
      <div className="bp-times" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
        {[52, 44, 48, 52, 44].slice(0, cols).map((w, i) => <span key={i} className="bp-time bp-time--bar"><Bar w={w} h={7} r={3.5} tone={4} /></span>)}
      </div>
    </div>
  )
}

// A labelled picker or a short number field, for the repeat panel: what's set, ready to change
export function Pick({ label, value, req = true, number = false }: { label: string; value: string; req?: boolean; number?: boolean }) {
  return (
    <div className="bp-field">
      <Label req={req}>{label}</Label>
      <div className="bp-input" data-cursor={number ? 'ibeam' : 'hand'}><span className="bp-val">{value}</span>{!number && <ChevronDown {...I} className="bp-ico" />}</div>
    </div>
  )
}

// A quiet line of what a setting works out to (Fluent's MessageBar, informative)
export function Note({ children }: { children: ReactNode }) {
  return <div className="bp-note"><Clock {...I} className="bp-ico" /><span className="bp-lines">{children}</span></div>
}

// A button: primary for the panel's one action
export function Button({ children, target }: { children: ReactNode; target?: string }) {
  return <span className="bp-btn" data-target={target} data-cursor="hand">{children}</span>
}

// The right panel alone as the window, for a close-up of what happens inside it (BpNextAvailable,
// BpProviderDates): the panel is the product here, its title the chrome, top-left
export const PANEL = { wide: { w: 420, gutter: 40 }, compact: { w: 326, gutter: 16 } } as const
export function PanelWindow({ layout, children }: { layout: Layout; children: ReactNode }) {
  const p = PANEL[layout]
  return (
    <div className="bp-zoom" style={{ transform: `translate(${p.gutter}px, ${p.gutter}px) scale(${SPAN[layout] / p.w})` }}>
      <div className="ss-window bp-dialog bp-dialog--panel" style={{ width: p.w }}>
        <div className="bp-right bp-right--solo" style={{ width: p.w }}>{children}</div>
        <span className="bp-close" aria-hidden data-cursor="hand"><X {...I} /></span>
      </div>
    </div>
  )
}

// The old way, then the merge: Provider, Date and Time as three empty fields (nobody assigned yet)
// that gather into the one Appointment details row. One component, every part placed absolutely so
// it can travel: the three field outlines dissolve as the row's outline arrives, the labels give way
// to one, the provider's placeholder becomes "No provider selected", the date and the time glide to
// their lines, and the row's glyph arrives at its lead. Merged, it matches the empty DetailsRow
// pixel for pixel, so the two hand over invisibly (both ways: the reset un-merges).
export function MergeRow({ merged, width }: { merged: boolean; width: number }) {
  const W = width
  const half = (W - 12) / 2
  const A = { name: [13, 30], date: [13, 98], time: [half + 25, 98] }
  const B = { name: [65, 37], date: [65, 57], time: [65, 77] }
  // delay: the parts leave one after another, so no two cross paths: merging, name, date, then time
  // (the date is up and out of the time's way); coming apart, the time first, then date, then name
  const at = (p: number[], delay = 0) => ({ transform: `translate(${p[0]}px, ${p[1]}px)`, transitionDelay: `${delay}ms` })
  const m = merged
  return (
    <div className="bp-merge" data-merged={m || undefined} data-snap style={{ height: m ? 110 : 124 }}>
      <span className="bp-label bp-m bp-m--a" style={at([0, 0])}>Provider<span className="bp-req">*</span></span>
      <span className="bp-label bp-m bp-m--a" style={at([0, 68])}>Date</span>
      <span className="bp-label bp-m bp-m--a" style={at([half + 12, 68])}>Time</span>
      <span className="bp-label bp-m bp-m--b" style={at([0, 0])}>Appointment details<span className="bp-req">*</span></span>
      <span className="bp-mbox bp-m--a" style={{ left: 0, top: 24, width: W, height: 32 }} />
      <span className="bp-mbox bp-m--a" style={{ left: 0, top: 92, width: half, height: 32 }} />
      <span className="bp-mbox bp-m--a" style={{ left: half + 12, top: 92, width: half, height: 32 }} />
      <span className="bp-mcard bp-m--b" style={{ left: 0, top: 24, width: W, height: 86 }} />
      <span className="bp-m bp-m--a bp-ico" style={at([W - 29, 32])}><ChevronDown {...I} /></span>
      <span className="bp-m bp-m--a bp-ico" style={at([half - 29, 100])}><CalendarDays {...I} /></span>
      <span className="bp-m bp-m--a bp-ico" style={at([W - 29, 100])}><Clock {...I} /></span>
      <span className="bp-m bp-m--b bp-glyph" style={at([13, 37])}><Stethoscope {...I} /></span>
      <span className="bp-m bp-m--b bp-chev" style={at([W - 29, 59])}><ChevronRight {...I} /></span>
      <span className="bp-m bp-mtext" style={at(m ? B.name : A.name, m ? 0 : 200)}><span className="bp-m--a bp-ink2">Select a provider</span><b className="bp-m--b">No provider selected</b></span>
      <span className="bp-m bp-mtext" style={at(m ? B.date : A.date, m ? 60 : 120)}><span className="bp-m--a">25/05/2021</span><span className="bp-m--b bp-ink2">25th May 2021</span></span>
      <span className="bp-m bp-mtext" style={at(m ? B.time : A.time, m ? 300 : 0)}><span className="bp-m--a bp-ink2">Select a time</span><span className="bp-m--b bp-ink2">No time selected</span></span>
    </div>
  )
}

// The old dialog's parts: a Fluent switch, and a message bar
export function Switch({ on, target }: { on: boolean; target?: string }) {
  return <span className="bp-switch" data-on={on || undefined} data-target={target} data-cursor="hand"><span className="bp-switch__thumb" /></span>
}

export function Message({ kind, children }: { kind: 'warning' | 'info'; children: ReactNode }) {
  return (
    <div className="bp-msg" data-kind={kind}>
      {kind === 'warning' ? <AlertTriangle {...I} className="bp-msg__ico" /> : <Info {...I} className="bp-msg__ico" />}
      <span className="bp-lines">{children}</span>
    </div>
  )
}

export const Tick = () => <Check {...I} />
