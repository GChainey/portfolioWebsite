# SeekAllTab: rehearsal

**Gold copied:** `phone-touch` (a lone phone, touch cursor, a flow told as one object), with
`annotations` for the note. Layout: a lone phone in the column, centred, pinned a gutter (48)
from the top, off the bottom; the note at the same gutter, top-left. Compact (358): the phone
alone, the note hidden.

**What changed from the gold:** SEEK's career-page courses module in its current look (tokens
from recreations/seek/seek.css, Inter for SEEK Sans); the first release's text-only cards (the
logos came later, leak 2); three list layers crossfading in one cell (8px lift); the All tab
growing in at the front of the row while the others make room; a scroll to TAFE / VET.

**Story (~14s, loops):** first release, a tap on TAFE / VET swaps the list (friction) → All grows
in and takes the underline, the list becomes every qualification grouped → a scroll shows them on
one page → hold → scroll back, the note switches to "The first release" (the seen cause) and the
list returns. Poster: All selected, Undergraduate and TAFE / VET groups, the note on "After the fix".

**Film:** `film.mjs --gate --states` at 1280 and 390. Fixed: a screen pinned over the status bar,
a list that couldn't scroll, real tab words cut at the edge (the last tab is now a bar), a note
that jumped (Swap → two stacked spans crossfading), a near-tangent at the stage foot.
Remaining lines: 6 × `kit override` that point at the kit's own CSS files (messages.css, Row.css
and Avatar.css restyling phone and avatar parts), which the checker can't tell from scene CSS in
this host, so the gate reads `failed` on those alone; `clipped` bars in the card rows (filler
running off the screen edge, intended); `layout: sat-stack leaves -241px` (the list running past
the phone's crop, intended).

**Not checked:** dark theme (the site is light only), a real phone, Safari.
