'use client'

import { Stage } from './kit/stage'
import type { Act } from './kit/act'
import { Collapse } from './kit/motion/Collapse'
import { Comment, DetailsRow, Dialog, Patient, FillerProvider, Group, PHOTO, ProviderHead, RightHead, Stepper, Times, Title } from './bp-dialog'

// "Never a dead end": a provider with nothing free today doesn't show an empty list. It says when
// they're next free, and that's a link: one click moves that provider (only them) to the 26th with
// the 10:30 am slot picked, and the providers below make room.
//
// Beats: read the line, click the date, Charlie's day opens with 10:30 am in teal, Dominique moves
// down. Plays once; the still is Charlie on the 26th, 10:30 am picked.
// Real strings: the panel's title, the date and providers, Charlie, the line and its link, the two
// providers' times. The third provider is filler.

type S = { jump: boolean }

const initial: S = { jump: false }
const poster: S = { jump: true }

const CHARLIE = ['10:30 am', '11:00 am', '2:00 pm', '3:00 pm', '4:00 pm', '4:45 pm']
const DOMINIQUE = ['9:00 am', '9:15 am', '9:30 am', '10:00 am', '10:30 am', '11:00 am']

async function script(a: Act<S>) {
  await a.wait(1400)
  a.mark('jump')
  await a.click({ at: 'next', x: 0.5, y: 0.5 })
  a.set({ jump: true })
  await a.wait(700)
  await a.move({ at: 'next', x: 0.5, y: 4.2 })
  await a.wait(2400)
  await a.move(a.layout === 'wide' ? { x: 660, y: 590 } : { x: 330, y: 360 })
}

export function BpNextAvailable() {
  return (
    <figure className="not-prose bp-fig" role="img" aria-label="A provider with nothing free shows when they're next available as a link; clicking it moves that provider to the 26th with 10:30 am picked">
      <Stage width={720} height={620} compact={{ below: 600, width: 358, height: 380 }} initial={initial} poster={poster} script={script} play="once" cursor={{ at: { wide: { x: 660, y: 590 }, compact: { x: 330, y: 360 } }, style: 'large' }} className="bp">
        {(s, _rect, layout) => {
          const cols = 3
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
                  <RightHead providers={<span className="bp-val">Charlie Charmoose +2</span>} />
                  <div className="bp-prov bp-prov--first">
                    <ProviderHead photo={PHOTO.charlie} name="Charlie Charmoose" link={{ on: s.jump ? 'less' : 'none', states: { none: ['', false], less: ['Less', true] } }} />
                    <Collapse open={!s.jump}>
                      <div className="bp-next">Next available appointment is <span className="bp-link" data-target="next" data-cursor="hand">26/05/2021 at 10:30 am</span></div>
                    </Collapse>
                    <Collapse open={s.jump} reveal="drop">
                      <div className="bp-jump">
                        <Stepper date="26/05/2021" />
                        <Times times={CHARLIE} cols={cols} picked="10:30 am" />
                      </div>
                    </Collapse>
                  </div>
                  <div className="bp-prov">
                    <ProviderHead photo={PHOTO.dominique} name="Dominique Sat" link="More (7)" />
                    <Times times={DOMINIQUE} cols={cols} />
                  </div>
                  <FillerProvider cols={cols} />
                  <FillerProvider cols={cols} />
                </>
              }
            />
          )
        }}
      </Stage>
    </figure>
  )
}
