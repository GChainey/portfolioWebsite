'use client'

import { Stage } from './kit/stage'
import type { Act } from './kit/act'
import { Roll } from './kit/motion/Roll'
import { States } from './kit/motion/States'
import { Comment, DetailsRow, Dialog, FillerProvider, Group, PHOTO, Patient, ProviderHead, RightHead, Stepper, Times, Title } from './bp-dialog'

// "Each provider, their own day": receptionists compare providers across days, so each one in the
// panel has their own date. Dominique steps forward to the 26th and only her times change; Yarn
// stays on the 25th. The two steppers sit one above the other, so the two days read side by side.
//
// Beats: Dominique's next-day arrow → her date rolls 25 → 26 and her times change; Yarn's doesn't.
// Plays once; holds on the two providers on different days (nothing booked). Poster = that state.
// Real strings: the panel's title, the date and providers, both providers, their dates and times.

type S = { ds: 25 | 26 }

const initial: S = { ds: 25 }
const poster: S = { ds: 26 }

const DS = { 25: ['9:00 am', '9:15 am', '9:30 am', '10:00 am', '10:30 am', '11:00 am'], 26: ['9:30 am', '10:00 am', '1:30 pm', '2:00 pm', '3:00 pm', '4:30 pm'] }
const YO = ['9:30 am', '10:00 am', '11:00 am', '12:00 pm', '4:00 pm', '4:30 pm']

async function script(a: Act<S>) {
  await a.wait(1300)
  a.mark('step')
  await a.click({ at: 'ds-next', x: 0.5, y: 0.5 })
  a.set({ ds: 26 })
  await a.wait(900)
  await a.move(a.layout === 'wide' ? { x: 704, y: 360 } : { x: 350, y: 260 })
  await a.wait(2600)
  await a.move(a.layout === 'wide' ? { x: 660, y: 590 } : { x: 330, y: 360 })
}

export function BpProviderDates() {
  return (
    <figure className="not-prose bp-fig" role="img" aria-label="Two providers in the appointment panel, each with their own date: Dominique Sat steps forward to 26 May and only her times change, while Yarn Oldrick stays on 25 May">
      <Stage width={720} height={620} compact={{ below: 600, width: 358, height: 380 }} initial={initial} poster={poster} script={script} play="once" cursor={{ at: { wide: { x: 660, y: 590 }, compact: { x: 330, y: 360 } }, style: 'large' }} className="bp">
        {(s, _rect, layout) => {
          // Two rows of times in the wide panel, one in the phone column
          const n = layout === 'wide' ? 6 : 3
          return (
          <Dialog
            layout={layout}
            two
            left={
              <>
                <Title>New appointment</Title>
                <Patient />
                <DetailsRow filled={false} open />
                <Group on="none" />
                <Comment />
              </>
            }
            right={
              <>
                {/* The phone column keeps both providers' days on screen: the panel's own fields go */}
                {layout === 'wide'
                  ? <RightHead providers={<span className="bp-val">Dominique Sat +1</span>} />
                  : <div className="bp-title"><span className="bp-title--sub">Appointment details</span></div>}
                <div className="bp-prov bp-prov--first">
                  <ProviderHead photo={PHOTO.dominique} name="Dominique Sat" link="Less" up />
                  <Stepper date={<Roll>{`${s.ds}/05/2021`}</Roll>} next="ds-next" />
                  <States value={String(s.ds)} align="start" className="bp-times-swap" states={{ 25: <Times times={DS[25].slice(0, n)} cols={3} />, 26: <Times times={DS[26].slice(0, n)} cols={3} /> }} />
                </div>
                <div className="bp-prov">
                  <ProviderHead photo={PHOTO.yarn} name="Yarn Oldrick" link="Less" up />
                  <Stepper date="25/05/2021" />
                  <Times times={YO.slice(0, n)} cols={3} />
                </div>
                <FillerProvider cols={3} />
                <FillerProvider cols={3} />
              </>
            }
          />
          )
        }}
      </Stage>
    </figure>
  )
}
