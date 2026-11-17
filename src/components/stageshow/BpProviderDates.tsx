'use client'

import { Stage } from './kit/stage'
import type { Act } from './kit/act'
import { Roll } from './kit/motion/Roll'
import { Fade, FillerProvider, PHOTO, PanelWindow, ProviderHead, Stepper, Times } from './bp-dialog'

// "Each provider, their own day": a close-up of the Appointment details panel. Receptionists
// compare providers across days, so each one has their own date. Dominique steps forward to the
// 26th (her date rolls and flashes, her times change); Yarn, directly below, stays on the 25th.
//
// Beats: Dominique's › → 26/05/2021, new times; Yarn's 25/05/2021 unchanged → hold → Dominique's ‹
// back to the 25th (the loop's start). Poster = Dominique on the 26th above Yarn on the 25th.
// Real strings: the panel's title, both providers, their dates and times.

type S = { ds: 25 | 26 }

const initial: S = { ds: 25 }
const poster: S = { ds: 26 }

const DS = { 25: ['9:00 am', '9:15 am', '9:30 am', '10:00 am'], 26: ['9:30 am', '10:00 am', '1:30 pm', '2:00 pm'] }
const YO = ['9:30 am', '10:00 am', '11:00 am', '12:00 pm']

async function script(a: Act<S>) {
  await a.wait(1300)
  a.mark('step')
  await a.click({ at: 'ds-next', x: 0.5, y: 0.5 })
  a.set({ ds: 26 })
  await a.wait(600)
  await a.move(a.layout === 'wide' ? { x: 704, y: 360 } : { x: 350, y: 250 })
  await a.wait(2500)
  // The reset: Dominique back a day
  a.mark('reset')
  await a.click({ at: 'ds-back', x: 0.5, y: 0.5 })
  a.set({ ds: 25 })
  await a.wait(900)
  await a.move(a.layout === 'wide' ? { x: 660, y: 590 } : { x: 330, y: 360 })
  await a.wait(400)
}

export function BpProviderDates() {
  return (
    <figure className="not-prose bp-fig" role="img" aria-label="Two providers in the appointment panel, each with their own date: Dominique Sat steps forward to 26 May and only her times change, while Yarn Oldrick stays on 25 May">
      <Stage width={720} height={620} compact={{ below: 600, width: 358, height: 380 }} initial={initial} poster={poster} script={script} cursor={{ at: { wide: { x: 660, y: 590 }, compact: { x: 330, y: 360 } }, style: 'large' }} className="bp">
        {(s, _rect, layout) => {
          const n = layout === 'wide' ? 4 : 3
          return (
            <PanelWindow layout={layout}>
              <div className="bp-title"><span className="bp-title--sub">Appointment details</span></div>
              <div className="bp-prov bp-prov--first">
                <ProviderHead photo={PHOTO.dominique} name="Dominique Sat" link="Less" up />
                <Stepper date={<Roll>{`${s.ds}/05/2021`}</Roll>} next="ds-next" back="ds-back" flash={s.ds === 26} />
                <Fade value={String(s.ds) as '25' | '26'} className="bp-times-swap" states={{ 25: <Times times={DS[25].slice(0, n)} cols={n} />, 26: <Times times={DS[26].slice(0, n)} cols={n} /> }} />
              </div>
              <div className="bp-prov">
                <ProviderHead photo={PHOTO.yarn} name="Yarn Oldrick" link="Less" up />
                <Stepper date="25/05/2021" />
                <Times times={YO.slice(0, n)} cols={n} />
              </div>
              <FillerProvider cols={n} />
              <FillerProvider cols={n} />
            </PanelWindow>
          )
        }}
      </Stage>
    </figure>
  )
}
