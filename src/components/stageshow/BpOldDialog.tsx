'use client'

import { useLayoutEffect, useRef, useState } from 'react'
import { CalendarDays, ChevronDown, Clock, X } from 'lucide-react'
import { Stage } from './kit/stage'
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
// Poster = all three on: the long dialog, on the plain grey. Pinned a gutter from the top, its foot
// on the stage's bottom edge however long it gets: the whole length stays in view.
// Real strings: the title, the fields and switches, the settings each opens, the two messages.

// waiting / repeat: the switches; wOpen / rOpen: the sections they open (with the switch)
type S = { waiting: boolean; repeat: boolean; urgent: boolean; wOpen: boolean; rOpen: boolean }

const initial: S = { waiting: false, repeat: false, urgent: false, wOpen: false, rOpen: false }
const poster: S = { waiting: true, repeat: true, urgent: true, wOpen: true, rOpen: true }

async function script(a: Act<S>) {
  await a.wait(1200)
  a.mark('waiting')
  await a.click({ at: 'sw-waiting', x: 0.5, y: 0.5 })
  a.set({ waiting: true, wOpen: true })
  await a.wait(1600)
  a.mark('repeat')
  await a.click({ at: 'sw-repeat', x: 0.5, y: 0.5 })
  a.set({ repeat: true, rOpen: true })
  await a.wait(1600)
  a.mark('urgent')
  await a.click({ at: 'sw-urgent', x: 0.5, y: 0.5 })
  a.set({ urgent: true })
  await a.wait(2500)
  a.mark('cancel')
  await a.click({ at: 'cancel', x: 0.7, y: 0.7 })
  a.set({ wOpen: false, rOpen: false, urgent: false, waiting: false, repeat: false })
  await a.wait(1600)
}

const I = { size: 16, strokeWidth: 1.5 } as const
const STAGE = { wide: { w: 720, h: 620, g: 40 }, compact: { w: 358, h: 640, g: 16 } } as const
// The window runs well past the bottom edge (a bleed, not a near miss, with room for the one frame
// the camera trails the growth); the dialog's deep foot keeps Save and Cancel a full gutter clear of
// the edge at every scale
const BLEED = 40

function Field({ label, req = false, children }: { label: string; req?: boolean; children: React.ReactNode }) {
  return <div className="bp-field"><Label req={req}>{label}</Label>{children}</div>
}
const Input = ({ value, icon, select = false }: { value: string; icon?: 'cal' | 'clock'; select?: boolean }) => (
  <div className="bp-input" data-cursor={select || icon ? 'hand' : 'ibeam'}><span className="bp-val">{value}</span>{icon === 'cal' ? <CalendarDays {...I} className="bp-ico" /> : icon === 'clock' ? <Clock {...I} className="bp-ico" /> : select ? <ChevronDown {...I} className="bp-ico" /> : null}</div>
)

// The dialog, scaled to keep its whole length in the stage as it grows. The camera follows the
// dialog's measured height on every frame (no transition of its own), so as a section opens or
// closes the foot stays exactly the same distance past the stage's bottom edge, never overshooting
// and never leaving a gap
function Old({ s, layout }: { s: S; layout: 'wide' | 'compact' }) {
  const base = useRef<HTMLDivElement>(null)
  const wait = useRef<HTMLDivElement>(null)
  const rep = useRef<HTMLDivElement>(null)
  const [full, setFull] = useState(0)
  useLayoutEffect(() => {
    const d = base.current
    if (!d) return
    const measure = () => setFull(d.offsetHeight)
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(d)
    return () => ro.disconnect()
  }, [layout])
  const st = STAGE[layout]
  const width = layout === 'wide' ? 480 : 400
  // Pinned a gutter from the top; the camera pulls back so the dialog's foot always runs just past
  // the stage's bottom edge: the whole length in view, Save and Cancel included
  const scale = full ? Math.min(layout === 'wide' ? 1.1 : 1, (st.h - st.g + BLEED) / full, (st.w - st.g * 2) / width) : 1
  const x = (st.w - width * scale) / 2
  // Anchored by its foot, so it always runs the same distance past the edge (when the width is what
  // limits the scale, the top sits lower than the gutter rather than the foot falling short)
  const y = full ? st.h + BLEED - full * scale : st.g
  return (
    <div className="bp-zoom" style={{ transform: `translate(${x}px, ${y}px) scale(${scale})`, transition: 'none' }}>
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
        <Collapse open={s.wOpen}>
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
        <Collapse open={s.rOpen}>
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
