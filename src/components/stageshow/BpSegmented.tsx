'use client'

import { Stage } from './kit/stage'
import type { Act } from './kit/act'
import { Collapse } from './kit/motion/Collapse'
import { Comment, Dialog, Group, Patient, SlimRow, Title, type Choice } from './bp-dialog'

// "One control, one choice": Urgent, Repeat and Add to waiting list were three switches that could
// be on in combinations that made no sense. As one control, picking one lets go of the other, and
// what it sets up arrives under it as one line, carrying the comment down with it.
//
// Beats: Repeat passes through (its line opens), pick the waiting list (Repeat lets go, its line
// folds as the waiting list's opens) and rest there, then the waiting list off (the comment comes
// back up: the loop's start). Poster = the waiting list on; Repeat's own story is BpRepeat.
// Real strings: the title, the patient, the three choices, the two lines they set up.

type S = { on: Choice }

const initial: S = { on: 'none' }
const poster: S = { on: 'waiting' }

async function script(a: Act<S>) {
  await a.wait(900)
  a.mark('repeat')
  await a.click({ at: 'seg-repeat', x: 0.84, y: 0.72 })
  a.set({ on: 'repeat' })
  // Repeat only passes through: the beat is "one at a time"
  await a.wait(1100)
  a.mark('waiting')
  await a.click({ at: 'seg-waiting', x: 0.9, y: 0.72 })
  a.set({ on: 'waiting' })
  // The waiting list is where it rests (Repeat's own story is BpRepeat)
  await a.wait(3000)
  a.mark('off')
  await a.click({ at: 'seg-waiting', x: 0.9, y: 0.72 })
  a.set({ on: 'none' })
  await a.wait(500)
  // Back to where it rested, so the loop meets itself
  await a.move(a.layout === 'wide' ? { x: 660, y: 590 } : { x: 330, y: 360 })
  await a.wait(600)
}

export function BpSegmented() {
  return (
    <figure className="not-prose bp-fig" role="img" aria-label="Urgent, Repeat and Add to waiting list as one control: picking one lets go of the other, and what it sets up arrives under it as one line">
      <Stage width={720} height={620} compact={{ below: 600, width: 358, height: 380 }} initial={initial} poster={poster} script={script} cursor={{ at: { wide: { x: 660, y: 590 }, compact: { x: 330, y: 360 } }, style: 'large' }} className="bp">
        {(s, _rect, layout) => (
          <Dialog
            layout={layout}
            two={false}
            left={
              <>
                <Title>New appointment</Title>
                <Patient />
                <div>
                  <Group on={s.on} targets />
                  <Collapse open={s.on === 'repeat'}>
                    <div className="bp-collapse"><SlimRow icon="repeat" title="Every 2 weeks, 3 times" detail="Next 08/06/2021 · Final 22/06/2021" /></div>
                  </Collapse>
                  <Collapse open={s.on === 'waiting'}>
                    <div className="bp-collapse"><SlimRow icon="waiting" title="Waiting list · Priority 2" detail="Any provider · From 01/06/2021" /></div>
                  </Collapse>
                </div>
                <Comment />
              </>
            }
          />
        )}
      </Stage>
    </figure>
  )
}
