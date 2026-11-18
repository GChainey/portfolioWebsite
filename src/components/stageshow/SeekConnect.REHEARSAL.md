# SeekConnect: rehearsal

**Gold copied:** SeekAllTab (`phone-touch`): the phone, touch cursor, the note, compact rules.
**Changed framing on purpose:** the phone is whole (320 wide on a 720 × 700 stage; 310 on a 358 ×
680 compact) because what opens has to stay in: the course page's buttons and the sheet both live
at the screen's foot. The checker flags `framing` / `uneven gutters` for a whole phone; that's this.

**Story (~15s, loops):** before the fix, a tap on the course pushes to its own page, Enquire pushes
again to a form page (iOS push: the new page over the old, which drifts left) → the note switches
to "After the fix" and the pages pop back to the list (the seen cause) → the same tap opens a sheet
over the same page; it dims the whole screen, status bar included (a scrim above the kit's status
bar, under the island) → Enquire turns the sheet into the form in place (summary and form share one
cell and crossfade, so the sheet keeps its height and its buttons stay where they were) → hold →
the sheet drops, the note switches back. Poster: the sheet with the form.

**Film:** `film.mjs --gate --states` at 1280 and 390, plus close sheets from `tap` and `enquire`.
Fixed: the base screen ran 62pt past the phone's foot (cutting the dock), a small floating phone,
voids under the list and on both pages (filled with filler content), an uneven sheet (two
heights), 8–9px text on compact (now 14pt, bigger compact phone), pressed card/button and sheet
layers landing on a transform (will-change).
Remaining lines: 6 × `kit override` (kit's own CSS), `framing`/`uneven gutters` (the whole phone,
intended), `uneven padding` on a full-screen page (its dock is the foot), `clipped` bars at rail
edges and pages mid-push (intended), `layout` on the closed sheet (it is off-screen below), one
`tight lines` advisory in the page body.

**Not checked:** a real phone, Safari, dark theme.
