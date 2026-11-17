'use client'

import { Stage } from './kit/stage'
import { Collapse } from './kit/motion/Collapse'
import { Comment, DetailsRow, Dialog, FillerProvider, Group, PHOTO, Patient, ProviderHead, RightHead, SlimRow, Stepper, Times, Title } from './bp-dialog'

// The conclusion: the two-panel dialog at its best, held still. The appointment on the left reads
// at a glance (Bobby Smith, Charlie on 26th May at 10:30, a repeat folded into one line); the panel
// on the right is where the work happened (Charlie's day with 10:30 am picked in teal, the next
// provider below). Wide, an even 50/50. A still: nothing to play, nothing to point at.

const TIMES = ['10:30 am', '11:00 am', '2:00 pm', '3:00 pm', '4:00 pm', '4:45 pm']
const DOMINIQUE = ['9:30 am', '10:00 am', '1:30 pm', '2:00 pm', '3:00 pm', '4:30 pm']

export function BpFinal() {
  return (
    <figure className="not-prose bp-fig" role="img" aria-label="The finished New appointment dialog: on the left Bobby Smith's appointment with Charlie Charmoose on 26th May at 10:30 am, repeating every 2 weeks; on the right Charlie's day with 10:30 am picked">
      <Stage width={720} height={620} compact={{ below: 600, width: 358, height: 380 }} className="bp">
        {(_s, _rect, layout) => (
          <Dialog
            layout={layout}
            two={layout === 'wide'}
            left={
              <>
                <Title>New appointment</Title>
                <Patient />
                <DetailsRow filled open={layout === 'wide'} />
                <div>
                  <Group on="repeat" />
                  <Collapse open><div className="bp-collapse"><SlimRow icon="repeat" title="Every 2 weeks, 3 times" detail="Next 08/06/2021 · Final 22/06/2021" /></div></Collapse>
                </div>
                <Comment />
              </>
            }
            right={
              <>
                <RightHead date="26/05/2021" providers={<span className="bp-val">Charlie, Dominique</span>} />
                <div className="bp-prov bp-prov--first">
                  <ProviderHead photo={PHOTO.charlie} name="Charlie Charmoose" link="Less" up />
                  <Stepper date="26/05/2021" />
                  <Times times={TIMES} cols={3} picked="10:30 am" />
                </div>
                <div className="bp-prov">
                  <ProviderHead photo={PHOTO.dominique} name="Dominique Sat" link="Less" up />
                  <Stepper date="26/05/2021" />
                  <Times times={DOMINIQUE} cols={3} />
                </div>
                <FillerProvider cols={3} />
              </>
            }
          />
        )}
      </Stage>
    </figure>
  )
}
