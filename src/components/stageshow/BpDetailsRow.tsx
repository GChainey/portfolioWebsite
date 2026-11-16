'use client'

import { Stage } from './kit/stage'
import type { Act } from './kit/act'
import { Comment, DetailsRow, Dialog, Patient, FillerProvider, Group, PHOTO, Photo, ProviderHead, RightHead, Stepper, Times, Title } from './bp-dialog'

// "Three answers, one row": provider, date and time answer one question, so they're one row, and
// the row is the door to the right panel. Empty, it says what's missing; the panel opens beside it,
// a time is picked, the panel tucks away and the row reads as the answer: a face, a day, a time.
//
// Beats: hover the row (it tints), open it (the dialog widens, the view follows to the panel), pick
// 10:30 am (teal), the panel closes and the row fills. Plays once; the still is the filled row.
// Real strings: the title, the row (empty and filled), the panel's title, Charlie and their times.

type S = { open: boolean; picked: boolean; filled: boolean }

const initial: S = { open: false, picked: false, filled: false }
const poster: S = { open: false, picked: true, filled: true }

const TIMES = ['10:30 am', '11:00 am', '2:00 pm', '3:00 pm', '4:00 pm', '4:45 pm']

async function script(a: Act<S>) {
  await a.wait(800)
  await a.move({ at: 'row', x: 0.62, y: 0.5 })
  await a.wait(600)
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
  // The row fills once the view is back on it, not while it's still sliding
  await a.wait(700)
  a.set({ filled: true })
  await a.wait(500)
  // Off the row to the grey beside the dialog, so the filled row reads without the pointer on it
  await a.move(a.layout === 'wide' ? { x: 704, y: 300 } : { x: 350, y: 220 })
  await a.wait(1800)
  await a.move(a.layout === 'wide' ? { x: 660, y: 590 } : { x: 330, y: 360 })
}

export function BpDetailsRow() {
  return (
    <figure className="not-prose bp-fig" role="img" aria-label="The appointment details row opens a panel of times beside it; a time is picked, the panel tucks away and the row reads Charlie Charmoose, 26th May 2021, 10:30 am">
      <Stage width={720} height={620} compact={{ below: 600, width: 358, height: 380 }} initial={initial} poster={poster} script={script} play="once" cursor={{ at: { wide: { x: 660, y: 590 }, compact: { x: 330, y: 360 } }, style: 'large' }} className="bp">
        {(s, _rect, layout) => (
          <Dialog
            layout={layout}
            two={s.open}
            left={
              <>
                <Title>New appointment</Title>
                <Patient />
                <DetailsRow filled={s.filled} open={s.open} target="row" />
                <Group on="none" />
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
