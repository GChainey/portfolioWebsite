'use client'

import { useReducedMotion } from './shared'
import { FlipScene, StaticSheet } from './flipbook/Scene'
import { Spreads } from './flipbook/Spreads'
import { KindWords } from './flipbook/KindWords'

// E · Flipbook. Volume, then velocity, then an editorial magazine.
//
// 1. Scroll flips through every screen like a flipbook: a stage in the middle, a counter ticking
//    beside it and a sheet of thumbnails filling in, which grows into the whole sheet at the end.
// 2. The three AI case studies as magazine spreads, each laid out differently, the numbers set
//    huge; the products after them, smaller.
// 3. Colleagues' words as pull quotes on cards that stack as you scroll.
export function FlipbookHome() {
  const reduced = useReducedMotion()
  return (
    <>
      {reduced ? <StaticSheet /> : <FlipScene />}
      <Spreads reduced={reduced} />
      <KindWords reduced={reduced} />
    </>
  )
}
