'use client'

import { Bleed, useReducedMotion } from './shared'
import { CONTACT_CSS } from './contact/pen'
import { Sheet } from './contact/Sheet'
import { Prints } from './contact/Prints'
import { Notes } from './contact/Notes'

// Variant B, Contact sheet: the eye test as a photographer's contact sheet. Every screen is a
// frame on strips of film, printed on one sheet; the cursor is a loupe, and the editor's selects
// are circled in red grease pencil. Scroll on and the selects lift off the sheet as prints, with
// the editor's notes beside them, then colleagues' words are taped on, the best phrases underlined.

export function ContactSheetHome() {
  const reduced = useReducedMotion()
  return (
    <Bleed label="Contact sheet: every screen, the selects, and kind words" className="cs-root border-b border-border" style={{ background: 'var(--paper)' }}>
      {({ gutter, width }) => !width ? <div style={{ height: 900 }} /> : (
        <>
          <style>{CONTACT_CSS}</style>
          <div aria-hidden className="cs-grain pointer-events-none absolute inset-0" />
          <div className="relative">
            <Sheet width={width} reduced={reduced} />
            <div style={{ borderTop: '1px solid var(--paper-line)' }}>
              <Prints gutter={gutter} width={width} reduced={reduced} />
            </div>
            <Notes gutter={gutter} width={width} reduced={reduced} />
          </div>
        </>
      )}
    </Bleed>
  )
}
