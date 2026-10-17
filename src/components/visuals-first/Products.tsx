'use client'

import { Bleed, useReducedMotion } from './shared'
import { QUOTE_CSS } from './mosaic/Quote'
import { ReelHost, Strip, PARTS_CSS } from './products/parts'
import { ProductsSection, KindWords, CaseStudies, REEL_ORDER } from './products/Sections'

// F · Products and kind words. A strip of screens for the eye test, then the products launched
// like products: app icons, their reels, their numbers, with colleagues' words called out
// between them. Then the three AI case studies in the same card language.

export function ProductsHome() {
  const reduced = useReducedMotion()
  return (
    <ReelHost order={REEL_ORDER}>
      <style>{QUOTE_CSS + PARTS_CSS}</style>
      <Bleed label="Screens from the work" className="border-b border-border bg-background">
        {({ width }) => (
          <div className="py-3">
            <Strip height={width < 640 ? 72 : width >= 1680 ? 120 : 96} reduced={reduced} />
          </div>
        )}
      </Bleed>
      <ProductsSection reduced={reduced} />
      <KindWords reduced={reduced} />
      <CaseStudies reduced={reduced} />
    </ReelHost>
  )
}
