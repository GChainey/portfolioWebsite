'use client'

import { Bleed, useReducedMotion } from './shared'
import { COUNTS, SMALL_CELLS } from './mosaic/layout'
import { Wall, SmallGrid, WALL_CSS } from './mosaic/Wall'
import { QUOTE_CSS } from './mosaic/Quote'
import { Work } from './mosaic/Work'

// C · Assemble. The screens start as a pile of prints on a table; scroll and they fly into a
// mosaic and lock, colleagues' words sitting in it as tiles of their own. Then the three case
// studies step forward out of the wall and open into bentos of their own, and the products follow.

export function MosaicHome() {
  const reduced = useReducedMotion()
  return (
    <>
      <style>{WALL_CSS + QUOTE_CSS}</style>
      <Bleed label="Screens from the work" className="border-b border-border bg-background">
        {({ gutter, width }) => (
          <>
            <div style={{ paddingLeft: gutter, paddingRight: gutter }}>
              <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2 px-8 pt-6 pb-2">
                <p className="text-base sm:text-lg tracking-tight text-foreground text-pretty">
                  I help scale-ups create high quality prototypes to win deals.{' '}
                  <span className="text-muted">I now orchestrate AI tools to multiply output.</span>
                </p>
                <p className="text-xs text-muted uppercase tracking-widest whitespace-nowrap">
                  {COUNTS.screens} screens · {COUNTS.projects} projects · {COUNTS.colleagues} colleagues
                </p>
              </div>
            </div>
            {width === 0 ? (
              <div style={{ height: '100vh' }} />
            ) : width >= 1200 ? (
              <Wall width={width} reduced={reduced} />
            ) : (
              <SmallGrid cells={SMALL_CELLS} cols={width >= 640 ? 4 : 2} reduced={reduced} />
            )}
          </>
        )}
      </Bleed>
      <Work />
    </>
  )
}
