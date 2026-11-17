'use client'

import { Stage } from './kit/stage'
import type { Act } from './kit/act'
import { Collapse } from './kit/motion/Collapse'
import { Button, Comment, Dialog, Group, Note, Patient, Pick, SlimRow, Title, type Choice } from './bp-dialog'

// "A repeat in one line": repeats took the most room in the old dialog. Choose Repeat and the setup
// opens beside the appointment already filled in (every 2 weeks, on Tuesday, after 3), with what
// it works out to; set it up and the panel tucks away, the whole repeat folded into one line.
//
// Beats: Repeat (the panel opens, filled) → read it → Set up repeat → the panel closes and the line
// opens under the control. Plays once; the line holds. Poster = the folded line.
// Real strings: the title, the patient, the three choices, the panel's settings and dates, the line.

type S = { on: Choice; open: boolean; set: boolean }

const initial: S = { on: 'none', open: false, set: false }
const poster: S = { on: 'repeat', open: false, set: true }

async function script(a: Act<S>) {
  await a.wait(900)
  a.mark('repeat')
  await a.click({ at: 'seg-repeat', x: 0.84, y: 0.72 })
  a.set({ on: 'repeat', open: true })
  await a.wait(1900)
  a.mark('setup')
  await a.click({ at: 'setup', x: 0.8, y: 0.72 })
  a.set({ open: false })
  // The line opens once the view is back on the appointment
  await a.wait(700)
  a.mark('line')
  a.set({ set: true })
  await a.wait(500)
  await a.move(a.layout === 'wide' ? { x: 704, y: 300 } : { x: 350, y: 220 })
  await a.wait(3000)
  await a.move(a.layout === 'wide' ? { x: 660, y: 590 } : { x: 330, y: 360 })
}

export function BpRepeat() {
  return (
    <figure className="not-prose bp-fig" role="img" aria-label="Choosing Repeat opens its setup beside the appointment, already filled in; setting it up folds the whole repeat into one line: every 2 weeks, 3 times, next 08/06/2021, final 22/06/2021">
      <Stage width={720} height={620} compact={{ below: 600, width: 358, height: 380 }} initial={initial} poster={poster} script={script} play="once" cursor={{ at: { wide: { x: 660, y: 590 }, compact: { x: 330, y: 360 } }, style: 'large' }} className="bp">
        {(s, _rect, layout) => (
          <Dialog
            layout={layout}
            two={s.open}
            left={
              <>
                <Title>New appointment</Title>
                <Patient />
                <div>
                  <Group on={s.on} targets />
                  <Collapse open={s.set}>
                    <div className="bp-collapse"><SlimRow icon="repeat" title="Every 2 weeks, 3 times" detail="Next 08/06/2021 · Final 22/06/2021" /></div>
                  </Collapse>
                </div>
                <Comment />
              </>
            }
            right={
              <>
                <div className="bp-title"><span className="bp-title--sub">Repeat appointment</span></div>
                <div className="bp-pair">
                  <div className="bp-field">
                    <span className="bp-label">Recur every<span className="bp-req">*</span></span>
                    <div className="bp-every">
                      <div className="bp-input" data-cursor="ibeam"><span className="bp-val">2</span></div>
                      <div className="bp-input" data-cursor="hand"><span className="bp-val">Weeks</span></div>
                    </div>
                  </div>
                  <Pick label="On" value="Tuesday" />
                </div>
                <div className="bp-pair">
                  <Pick label="End schedule" value="After" />
                  <Pick label="Total occurrences" value="3" number />
                </div>
                <Note><span className="bp-strong">Next appointment 08/06/2021</span><span>Final appointment 22/06/2021</span></Note>
                <Button target="setup">Set up repeat</Button>
              </>
            }
          />
        )}
      </Stage>
    </figure>
  )
}
