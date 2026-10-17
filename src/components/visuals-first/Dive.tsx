'use client'

import { Bleed, useReducedMotion } from './shared'
import { DiveScene, SCENE_CSS } from './dive/Scene'
import { PhoneHome, PHONE_CSS } from './dive/Phone'
import { Products } from './dive/Products'
import { KindWords, KIND_CSS } from './dive/KindWords'
import { useMedia } from './dive/bits'

// A · Dive in. Under the hero, a tilted wall of every screen, drifting. Scroll and the camera
// un-tilts and dives into one of them, the Daisy Assess poster, which becomes the stage for
// the three AI case studies. Then the products, smaller, and colleagues' kind words in a dark
// band, their best phrases lighting up as they reach the middle of the screen.
export function DiveHome() {
  const reduced = useReducedMotion()
  const wide = useMedia('(min-width: 1024px)')
  if (wide === null) return <div className="h-screen" />

  return (
    <>
      <style>{SCENE_CSS + PHONE_CSS + KIND_CSS}</style>
      {wide ? (
        <Bleed label="Screens, then the work">
          {({ gutter, width }) => (width ? <DiveScene W={width} gutter={gutter} reduced={reduced} /> : <div className="h-screen" />)}
        </Bleed>
      ) : (
        <PhoneHome reduced={reduced} />
      )}
      <Products reduced={reduced} />
      <KindWords reduced={reduced} phone={!wide} />
    </>
  )
}
