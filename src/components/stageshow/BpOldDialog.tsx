'use client'

import { useLayoutEffect, useRef, useState } from 'react'
import { CalendarDays, ChevronDown, Clock, X } from 'lucide-react'
import { Stage } from './kit/stage'
import { Bar } from './kit/window'
import type { Act } from './kit/act'
import { Collapse } from './kit/motion/Collapse'
import { Button, Initials, Label, Message, PHOTO, Photo, Switch } from './bp-dialog'

// The before: Best Practice's first New appointment dialog, one column, in the same Fluent tokens.
// Every feature was added inline as a switch, so the dialog grows downwards each time one is on:
// the waiting list adds its priority and date, the repeat adds its schedule and a conflict, and
// urgent can sit on with a repeat (a combination that makes no sense). The camera pulls back as it
// grows so the whole length stays in view: it starts at a comfortable size and ends small and long.
//
// Beats: waiting list on → repeat on → urgent on → hold → Cancel (everything off, the loop's start).
// Poster = all three on: the long dialog. The whole dialog is the point, so it's shown whole, as
// the modal it is, over the dimmed appointment book (the app fills the stage; the dialog floats on
// it as a real modal does).
// Real strings: the title, the fields and switches, the settings each opens, the two messages.

type S = { waiting: boolean; repeat: boolean; urgent: boolean }

const initial: S = { waiting: false, repeat: false, urgent: false }
const poster: S = { waiting: true, repeat: true, urgent: true }

async function script(a: Act<S>) {
  await a.wait(1200)
  a.mark('waiting')
  await a.click({ at: 'sw-waiting', x: 0.5, y: 0.5 })
  a.set({ waiting: true })
  await a.wait(1600)
  a.mark('repeat')
  await a.click({ at: 'sw-repeat', x: 0.5, y: 0.5 })
  a.set({ repeat: true })
  await a.wait(1600)
  a.mark('urgent')
  await a.click({ at: 'sw-urgent', x: 0.5, y: 0.5 })
  a.set({ urgent: true })
  await a.wait(2500)
  a.mark('cancel')
  await a.click({ at: 'cancel', x: 0.7, y: 0.7 })
  a.set({ waiting: false, repeat: false, urgent: false })
  await a.wait(1500)
}

const I = { size: 16, strokeWidth: 1.5 } as const
const STAGE = { wide: { w: 720, h: 620, g: 40 }, compact: { w: 358, h: 640, g: 16 } } as const

function Field({ label, req = false, children }: { label: string; req?: boolean; children: React.ReactNode }) {
  return <div className="bp-field"><Label req={req}>{label}</Label>{children}</div>
}
const Input = ({ value, icon, select = false }: { value: string; icon?: 'cal' | 'clock'; select?: boolean }) => (
  <div className="bp-input" data-cursor={select || icon ? 'hand' : 'ibeam'}><span className="bp-val">{value}</span>{icon === 'cal' ? <CalendarDays {...I} className="bp-ico" /> : icon === 'clock' ? <Clock {...I} className="bp-ico" /> : select ? <ChevronDown {...I} className="bp-ico" /> : null}</div>
)

// The dialog, scaled to keep its whole length in the stage as it grows. Its height is known ahead
// of the animation (the closed dialog plus whichever sections are open, each measured once), so the
// camera eases straight to where it will end up instead of chasing the growth
function Old({ s, layout }: { s: S; layout: 'wide' | 'compact' }) {
  const base = useRef<HTMLDivElement>(null)
  const wait = useRef<HTMLDivElement>(null)
  const rep = useRef<HTMLDivElement>(null)
  const [h, setH] = useState({ base: 0, wait: 0, rep: 0 })
  useLayoutEffect(() => {
    const measure = () => {
      const d = base.current
      if (!d) return
      const wh = wait.current?.offsetHeight ?? 0
      const rh = rep.current?.offsetHeight ?? 0
      // The dialog's height with both sections closed: take off whatever is open right now
      const open = d.querySelectorAll<HTMLElement>('.ss-collapse')
      let cur = 0
      open.forEach((c) => { cur += c.offsetHeight })
      setH({ base: d.offsetHeight - cur, wait: wh, rep: rh })
    }
    measure()
    const t = setTimeout(measure, 300)
    return () => clearTimeout(t)
  }, [layout])
  const st = STAGE[layout]
  const full = h.base + (s.waiting ? h.wait : 0) + (s.repeat ? h.rep : 0)
  const width = layout === 'wide' ? 480 : 400
  const scale = full ? Math.min(layout === 'wide' ? 1.1 : 1, (st.h - st.g * 2) / full, (st.w - st.g * 2) / width) : 1
  const x = (st.w - width * scale) / 2
  return (
    <>
    {/* The app it opens over: Best Practice's appointment book, dimmed behind the modal. It fills
        the stage (the product runs off every edge); the dialog is the overlay on it */}
    <div className="ss-window bp-book" aria-hidden>
      <div className="bp-book__bar"><Bar w={120} h={8} r={4} tone={3} /><Bar w={64} h={8} r={4} tone={4} /></div>
      <div className="bp-book__grid">
        {Array.from({ length: layout === 'wide' ? 5 : 3 }).map((_, c) => (
          <div key={c} className="bp-book__day">
            <Bar w={56} h={7} r={3.5} tone={3} />
            {[0, 1, 2, 3, 4, 5, 6].map((r) => <span key={r} className="bp-book__slot" data-on={(r + c) % 3 === 0 || undefined} />)}
          </div>
        ))}
      </div>
      <span className="bp-book__scrim" />
    </div>
    <div className="bp-zoom bp-zoom--modal" style={{ transform: `translate(${x}px, ${st.g}px) scale(${scale})`, transitionDuration: '600ms' }}>
      <div ref={base} className="ss-window bp-dialog bp-old" style={{ width }}>
        <div className="bp-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>New appointment<X {...I} data-cursor="hand" /></div>
        <Field label="Patient" req><div className="bp-input" data-cursor="ibeam"><Initials name="Bobby Smith" /><span className="bp-val">Bobby Smith</span><X {...I} className="bp-ico" /></div></Field>
        <div className="bp-pair">
          <Field label="Type" req><Input value="Immunisation" select /></Field>
          <Field label="Duration (mins)" req><Input value="15" /></Field>
        </div>
        <Field label="Provider" req><div className="bp-input" data-cursor="hand"><Photo src={PHOTO.john} size={20} /><span className="bp-val">John Garner</span><X {...I} className="bp-ico" /></div></Field>
        <Field label="Urgent"><Switch on={s.urgent} target="sw-urgent" /></Field>
        <Field label="Date and time">
          <div className="bp-boxed"><div className="bp-pair bp-pair--even">
            <Field label="Date"><Input value="25/05/2021" icon="cal" /></Field>
            <Field label="Time"><Input value="11:00 am" icon="clock" /></Field>
          </div></div>
        </Field>
        <Field label="Add to waiting list"><Switch on={s.waiting} target="sw-waiting" /></Field>
        <Collapse open={s.waiting}>
          <div ref={wait} className="bp-old__more">
            <div className="bp-boxed">
              <div className="bp-pair bp-pair--even">
                <Field label="Priority" req><div className="bp-prio">{['1', '2', '3'].map((p) => <span key={p} className="bp-seg" data-on={p === '2' || undefined} data-cursor="hand">{p}</span>)}</div></Field>
                <Field label="Date" req><Input value="01/06/2021" icon="cal" /></Field>
              </div>
              <span className="bp-check" data-cursor="hand"><span className="bp-check__box" />Any provider</span>
            </div>
          </div>
        </Collapse>
        <Field label="Repeat appointment"><Switch on={s.repeat} target="sw-repeat" /></Field>
        <Collapse open={s.repeat}>
          <div ref={rep} className="bp-old__more">
            <div className="bp-boxed">
              <div className="bp-pair bp-pair--even">
                <Field label="Recur every" req><div className="bp-every"><Input value="2" /><Input value="Weeks" select /></div></Field>
                <Field label="On" req><Input value="Tuesday" select /></Field>
              </div>
              <div className="bp-pair bp-pair--even">
                <Field label="End schedule" req><Input value="After" select /></Field>
                <Field label="Total occurrences" req><Input value="3" /></Field>
              </div>
              <Message kind="warning">There is a conflict on multiple dates: 08/06/2021, 22/06/2021</Message>
              <Message kind="info"><span>Next appointment will be 08/06/2021</span><span>Final appointment will be on 22/06/2021</span></Message>
            </div>
          </div>
        </Collapse>
        <Field label="Comments"><div className="bp-area bp-area--old" data-cursor="ibeam" /></Field>
        <div className="bp-actions"><Button>Save</Button><span className="bp-btn bp-btn--secondary" data-target="cancel" data-cursor="hand">Cancel</span></div>
      </div>
    </div>
    </>
  )
}

export function BpOldDialog() {
  return (
    <figure className="not-prose bp-fig" role="img" aria-label="The old one-column booking dialog: turning on the waiting list, a repeat and urgent each adds more fields, and the dialog grows longer and longer">
      <Stage width={720} height={620} compact={{ below: 600, width: 358, height: 640 }} initial={initial} poster={poster} script={script} cursor={{ at: { wide: { x: 660, y: 590 }, compact: { x: 330, y: 610 } }, style: 'large' }} className="bp">
        {(s, _rect, layout) => <Old s={s} layout={layout} />}
      </Stage>
    </figure>
  )
}
