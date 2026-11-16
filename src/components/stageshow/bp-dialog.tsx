'use client'

import type { ReactNode } from 'react'
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Clock, Repeat, Stethoscope, X } from 'lucide-react'
import { Bar, Text } from './kit/window'
import { States } from './kit/motion/States'
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
export const PHOTO = { charlie: `${AV}/charlie-charmoose.jpg`, dominique: `${AV}/dominique-sat.jpg` }

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
export function Dialog({ layout, two, left, right }: { layout: Layout; two: boolean; left: ReactNode; right?: ReactNode }) {
  const d = DIM[layout]
  return (
    <div className="bp-zoom" style={zoomStyle(layout, two)}>
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
export function DetailsRow({ filled, open = false, target }: { filled: boolean; open?: boolean; target?: string }) {
  return (
    <div className="bp-field">
      <Label req>Appointment details</Label>
      <div className="bp-card" data-on={open || undefined} data-target={target} data-cursor="hand">
        <States
          value={filled ? 'filled' : 'empty'}
          align="start"
          className="bp-card__lead"
          states={{
            empty: <span className="bp-glyph"><Stethoscope {...I} /></span>,
            filled: <Photo src={PHOTO.charlie} size={40} />,
          }}
        />
        <States
          value={filled ? 'filled' : 'empty'}
          align="start"
          className="bp-card__lines"
          states={{
            empty: <span className="bp-lines"><b>No provider selected</b><span>25th May 2021</span><span>No time selected</span></span>,
            filled: <span className="bp-lines"><b>Charlie Charmoose</b><span>26th May 2021</span><span>10:30 am – 10:45 am</span></span>,
          }}
        />
        <States value={open ? 'back' : 'go'} className="bp-chev" states={{ go: <ChevronRight {...I} />, back: <ChevronLeft {...I} /> }} />
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
export function RightHead({ providers }: { providers: ReactNode }) {
  return (
    <>
      <Title><span className="bp-title--sub">Appointment details</span></Title>
      <div className="bp-row2">
        <div className="bp-field">
          <Label>Date</Label>
          <div className="bp-input" data-cursor="hand"><span className="bp-val">25/05/2021</span><CalendarDays {...I} className="bp-ico" /></div>
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
        : <States value={link.on} align="end" className="bp-more" states={Object.fromEntries(Object.entries(link.states).map(([k, [t, u]]) => [k, t ? <span key={k} className="bp-link bp-more" data-cursor="hand">{t}{u ? <ChevronUp {...I} /> : <ChevronDown {...I} />}</span> : <span key={k} />]))} />)}
    </div>
  )
}

export function Stepper({ date }: { date: string }) {
  return (
    <div className="bp-stepper">
      <span className="bp-ico bp-step" data-cursor="hand"><ChevronLeft {...I} /></span>
      <div className="bp-input bp-input--date" data-cursor="hand"><span className="bp-val">{date}</span><CalendarDays {...I} className="bp-ico" /></div>
      <span className="bp-ico bp-step" data-cursor="hand"><ChevronRight {...I} /></span>
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
