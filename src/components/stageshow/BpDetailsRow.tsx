'use client'

import { Stage } from './kit/stage'
import type { Act } from './kit/act'
import { Comment, DetailsRow, Dialog, FillerProvider, MergeRow, PHOTO, Patient, Photo, ProviderHead, RightHead, Stepper, Times, Title, type RowValue } from './bp-dialog'

// "Three answers, one row": the two-panel idea, from the start. Provider, date and time used to be
// three fields; they answer one question, so they gather into one row, and the row is the door to
// the panel beside it. Open it, pick a time (teal), the panel tucks away and the row reads as the
// answer: a face, a day, a time.
//
// Beats: the three fields → they merge into the row (the outlines dissolve into one, the face,
// name, date and time glide to their lines) → open the row (the dialog widens to an even 50/50 as
// the camera pulls back) → pick 10:30 am → the panel closes, the row fills → hold → the dialog fades
// and the next run fades in. Poster = the filled row.
// Real strings: the title, the patient, the three fields and the row, the panel, Charlie's times.

type S = { merged: boolean; row: boolean; open: boolean; picked: boolean; value: RowValue; hidden: boolean }

const initial: S = { merged: false, row: false, open: false, picked: false, value: 'partial', hidden: true }
const poster: S = { merged: true, row: true, open: false, picked: true, value: 'filled', hidden: false }

const TIMES = ['10:30 am', '11:00 am', '2:00 pm', '3:00 pm', '4:00 pm', '4:45 pm']

async function script(a: Act<S>) {
  a.set({ hidden: false })
  await a.wait(1500)
  a.mark('merge')
  a.set({ merged: true })
  await a.wait(900)
  // The merged fields sit exactly where the row's parts sit: hand over to the row itself
  a.snap({ row: true })
  await a.wait(500)
  await a.move({ at: 'row', x: 0.62, y: 0.5 })
  await a.wait(500)
  a.mark('open')
  await a.click({ at: 'row', x: 0.62, y: 0.5 })
  a.set({ open: true })
  await a.wait(1200)
  a.mark('pick')
  await a.click({ at: 'time', x: 0.86, y: 0.78 })
  a.set({ picked: true })
  await a.wait(700)
  a.mark('fill')
  a.set({ open: false })
  await a.wait(700)
  a.set({ value: 'filled' })
  await a.wait(400)
  await a.move(a.layout === 'wide' ? { x: 704, y: 300 } : { x: 350, y: 220 })
  await a.wait(2500)
  // The reset: the dialog fades, and the next run fades in from the three fields
  a.mark('reset')
  a.set({ hidden: true })
  void a.move(a.layout === 'wide' ? { x: 660, y: 590 } : { x: 330, y: 360 })
  await a.wait(320)
}

export function BpDetailsRow() {
  return (
    <figure className="not-prose bp-fig" role="img" aria-label="Provider, date and time as three fields gather into one Appointment details row; the row opens a panel of times beside it, 10:30 am is picked, and the row reads Charlie Charmoose, 26th May 2021, 10:30 am">
      <Stage width={720} height={620} compact={{ below: 600, width: 358, height: 380 }} initial={initial} poster={poster} script={script} cursor={{ at: { wide: { x: 660, y: 590 }, compact: { x: 330, y: 360 } }, style: 'large' }} className="bp">
        {(s, _rect, layout) => (
          <Dialog
            layout={layout}
            two={s.open}
            hidden={s.hidden}
            left={
              <>
                <Title>New appointment</Title>
                <Patient />
                {s.row ? <DetailsRow value={s.value} open={s.open} target="row" snap /> : <MergeRow merged={s.merged} width={layout === 'wide' ? 332 : 278} />}
                <Comment />
              </>
            }
            right={
              <>
                <RightHead providers={<><Photo src={PHOTO.charlie} size={20} /><span className="bp-val">Charlie Charmoose</span></>} />
                <div className="bp-prov bp-prov--first">
                  <ProviderHead photo={PHOTO.charlie} name="Charlie Charmoose" link="Less" up />
                  <Stepper date="26/05/2021" />
                  <Times times={TIMES} cols={3} picked={s.picked ? '10:30 am' : undefined} target="10:30 am" />
                </div>
                <FillerProvider cols={3} />
                <FillerProvider cols={3} />
                <FillerProvider cols={3} />
              </>
            }
          />
        )}
      </Stage>
    </figure>
  )
}
