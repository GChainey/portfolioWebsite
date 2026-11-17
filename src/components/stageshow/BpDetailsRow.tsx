'use client'

import { Stage } from './kit/stage'
import type { Act } from './kit/act'
import { Actions, Comment, DetailsRow, Dialog, MergeRow, PHOTO, Patient, ProviderHead, RightHead, Stepper, Times, Title, type RowValue } from './bp-dialog'

// "Three answers, one row": the two-panel idea, from the start. Nobody is assigned yet. Provider,
// date and time used to be three fields; they answer one question, so they gather into one row, and
// the row is the door to the panel beside it. Open it, pick Charlie's 10:30 am (teal), the panel
// tucks away and the row reads as the answer: a face, a day, a time.
//
// Beats: three empty fields → they become the empty row (in place: outlines and contents crossfade,
// nothing travels) → open it: the camera holds the frame the two-panel dialog opens into, and the
// dialog widens into it, revealing Appointment details → pick 10:30 am → the dialog narrows back,
// the row is assigned → hold →
// the row's ✕ clears it and it comes apart into the three empty fields (the loop's start).
// Poster = the assigned row.
// Real strings: the title, the patient, the three fields and the row, the panel, the providers' times.

type S = { merged: boolean; row: boolean; open: boolean; picked: boolean; value: RowValue }

const initial: S = { merged: false, row: false, open: false, picked: false, value: 'empty' }
const poster: S = { merged: true, row: true, open: false, picked: true, value: 'filled' }

const CHARLIE = ['10:30 am', '11:00 am', '2:00 pm', '3:00 pm', '4:00 pm', '4:45 pm']
const DOMINIQUE = ['9:30 am', '10:00 am', '1:30 pm', '2:00 pm', '3:00 pm', '4:30 pm']

async function script(a: Act<S>) {
  await a.wait(1500)
  a.mark('merge')
  a.set({ merged: true })
  await a.wait(900)
  // The merged fields sit exactly where the empty row's parts sit: hand over to the row itself
  a.snap({ row: true })
  await a.wait(500)
  await a.move({ at: 'row', x: 0.8, y: 0.28 })
  await a.wait(500)
  a.mark('open')
  await a.click({ at: 'row', x: 0.8, y: 0.28 })
  a.set({ open: true })
  await a.wait(1300)
  a.mark('pick')
  await a.click({ at: 'time', x: 0.86, y: 0.78 })
  a.set({ picked: true })
  await a.wait(700)
  a.mark('fill')
  a.set({ open: false })
  await a.wait(700)
  a.set({ value: 'filled' })
  await a.wait(400)
  await a.move(a.layout === 'wide' ? { x: 560, y: 300 } : { x: 350, y: 220 })
  await a.wait(2500)
  // The reset: the row's ✕ clears the assignment, then the row comes apart into the three fields
  a.mark('reset')
  await a.click({ at: 'row-clear', x: 0.5, y: 0.5 })
  a.set({ value: 'empty', picked: false })
  // Off the row before it hands back (a hovered row is tinted; the fields are not)
  await a.move(a.layout === 'wide' ? { x: 560, y: 340 } : { x: 350, y: 250 })
  await a.wait(300)
  a.snap({ row: false })
  await a.wait(300)
  a.set({ merged: false })
  await a.wait(1100)
  await a.move(a.layout === 'wide' ? { x: 660, y: 430 } : { x: 330, y: 360 })
  await a.wait(300)
}

export function BpDetailsRow() {
  return (
    <figure className="not-prose bp-fig" role="img" aria-label="Provider, date and time as three empty fields gather into one Appointment details row; the row opens a panel of times beside it, Charlie's 10:30 am is picked, and the row reads Charlie Charmoose, 26th May 2021, 10:30 am">
      <Stage width={720} height={454} compact={{ below: 600, width: 358, height: 380 }} initial={initial} poster={poster} script={script} cursor={{ at: { wide: { x: 660, y: 430 }, compact: { x: 330, y: 360 } }, style: 'large' }} className="bp">
        {(s, _rect, layout) => (
          <Dialog
            layout={layout}
            two={s.open}
            framed
            fit
            left={
              <>
                <Title>New appointment</Title>
                <Patient />
                {s.row ? <DetailsRow value={s.value} open={s.open} target="row" clear="row-clear" snap /> : <MergeRow merged={s.merged} width={layout === 'wide' ? 332 : 278} />}
                <Comment />
                <Actions />
              </>
            }
            right={
              <>
                <RightHead date="26/05/2021" providers={<span className="bp-val">Charlie, Dominique</span>} />
                <div className="bp-prov bp-prov--first">
                  <ProviderHead photo={PHOTO.charlie} name="Charlie Charmoose" link="Less" up />
                  <Stepper date="26/05/2021" />
                  <Times times={CHARLIE} cols={3} picked={s.picked ? '10:30 am' : undefined} target="10:30 am" />
                </div>
                <div className="bp-prov">
                  <ProviderHead photo={PHOTO.dominique} name="Dominique Sat" link="Less" up />
                  <Stepper date="26/05/2021" />
                  <Times times={DOMINIQUE} cols={3} />
                </div>
              </>
            }
          />
        )}
      </Stage>
    </figure>
  )
}
