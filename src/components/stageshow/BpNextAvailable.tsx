'use client'

import { Stage } from './kit/stage'
import type { Act } from './kit/act'
import { Collapse } from './kit/motion/Collapse'
import { Roll } from './kit/motion/Roll'
import { PHOTO, PanelWindow, ProviderHead, Stepper, Times, FillerProvider } from './bp-dialog'

// "Never a dead end": a close-up of the Appointment details panel. Charlie has nothing on the 25th,
// so instead of an empty list the panel says when they're next free, and that's a link. One click
// moves Charlie (only Charlie) to the 26th: the date rolls and flashes, the day drops in with
// 10:30 am already picked in teal, and the provider below makes room.
//
// Beats: read the line → click the link → Charlie's date rolls 25 → 26, the times drop in, 10:30 am
// picked → hold → back a day with Charlie's ‹ (the loop's start). Poster = Charlie on the 26th.
// Real strings: the panel's title, both providers, the line and its link, their dates and times.

type S = { jump: boolean }

const initial: S = { jump: false }
const poster: S = { jump: true }

const CHARLIE = ['10:30 am', '11:00 am', '2:00 pm', '3:00 pm']
const DOMINIQUE = ['9:00 am', '9:15 am', '9:30 am', '10:00 am']

async function script(a: Act<S>) {
  await a.wait(1600)
  a.mark('jump')
  await a.click({ at: 'next', x: 0.5, y: 0.6 })
  a.set({ jump: true })
  await a.wait(600)
  await a.move(a.layout === 'wide' ? { x: 704, y: 360 } : { x: 350, y: 250 })
  await a.wait(2500)
  // The reset: back a day, and the line is there again
  a.mark('reset')
  await a.click({ at: 'cc-back', x: 0.5, y: 0.5 })
  a.set({ jump: false })
  await a.wait(900)
  await a.move(a.layout === 'wide' ? { x: 660, y: 590 } : { x: 330, y: 360 })
  await a.wait(400)
}

export function BpNextAvailable() {
  return (
    <figure className="not-prose bp-fig" role="img" aria-label="Charlie has nothing free on the 25th, so the panel says when they're next available as a link; clicking it moves Charlie to the 26th with 10:30 am picked">
      <Stage width={720} height={620} compact={{ below: 600, width: 358, height: 380 }} initial={initial} poster={poster} script={script} cursor={{ at: { wide: { x: 660, y: 590 }, compact: { x: 330, y: 360 } }, style: 'large' }} className="bp">
        {(s, _rect, layout) => {
          const n = layout === 'wide' ? 4 : 3
          return (
            <PanelWindow layout={layout}>
              <div className="bp-title"><span className="bp-title--sub">Appointment details</span></div>
              <div className="bp-prov bp-prov--first">
                <ProviderHead photo={PHOTO.charlie} name="Charlie Charmoose" link={{ on: s.jump ? 'less' : 'none', states: { none: ['', false], less: ['Less', true] } }} />
                <Stepper date={<Roll>{s.jump ? '26/05/2021' : '25/05/2021'}</Roll>} back="cc-back" flash={s.jump} />
                <Collapse open={!s.jump}>
                  <div className="bp-next bp-next--loud">Next available appointment is <span className="bp-link bp-link--line" data-target="next" data-cursor="hand">26/05/2021 at 10:30 am</span></div>
                </Collapse>
                <Collapse open={s.jump} reveal="drop">
                  <Times times={CHARLIE.slice(0, n)} cols={n} picked="10:30 am" />
                </Collapse>
              </div>
              <div className="bp-prov">
                <ProviderHead photo={PHOTO.dominique} name="Dominique Sat" link="More (7)" />
                <Stepper date="25/05/2021" />
                <Times times={DOMINIQUE.slice(0, n)} cols={n} />
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
