# SeekCards: rehearsal

**Gold copied:** SeekAllTab (itself from `phone-touch` + `annotations`): the same lone phone, centred,
pinned 48 from the top and off the bottom; the note top-left; compact (358) the phone alone. No
cursor (the `payout-flow` lesson): nothing is tapped, the cards change.

**What changed from it:** the module with the All tab (assumption 1 shipped); cards that change in
place: a logo row opens above (grid rows 0fr → 1fr, so the card grows and nothing stretches), the
course name rises into the top line, the provider's name moves down a line (a bold and a regular
copy crossfading on one path, so no weight animates), the first release's second line fades. Card
by card, then the second row. Real logos (public/stageshow/seek/logos). Real words on the one
card in full view; the cut card and the second row keep only their logos and bars.

**Story (~10s, loops):** before, held 2.6s → the fix, card by card → hold 4.8s → the note switches to
"Before the fix" (the seen cause) and the cards go back: the new lines leave first and fast, then
the old ones return, so the two never overlap. Poster: after the fix.

**Film:** `film.mjs --gate --states` at 1280 and 390. Fixed: an overlapping reset (both lines at
once), real words cut by the screen's edge on the second card (now bars), 9px secondary text on
the compact phone (now 14pt), the bar handoff between lines (the lines now share a box height).
Remaining lines: 6 × `kit override` pointing at the kit's own CSS (as in SeekAllTab), so the gate
reads `failed` on those alone; `clipped` bars at the rail's edge (filler bleeding, intended); a
2px bar handoff on placeholder rows; `tight lines` advisory on .scd-lines.

**Not checked:** a real phone, Safari, dark theme (the site is light only).
