# Rehearsal: BpFinal (the conclusion)

A still: the two-panel dialog, 50/50, pulled back so the whole window sits across with its chrome
top-left and runs off the bottom. Left: Bobby Smith (initials), the details row filled (Charlie's
photo, 26th May 2021, 10:30 am – 10:45 am), Repeat on with its one line, a fixed comment field.
Right: date 26/05/2021, Charlie's day with 10:30 am in teal, Dominique's below, filler. No script,
no cursor (a held composition). Compact shows the left panel alone at 1x.
Filmed: `--gate` at 720 and 390, rehearsal passed, 0 candidates.

## Round (icon jitter)

Gareth saw the icon in the details row jump between two positions. Measured every icon's box on
every animation frame through the loop at 720 and 390 (.context/ss-tools/scripts/icon-jitter.mjs):
nothing moved at rest, but each time a state swapped in a fixed slot (the row's stethoscope ↔
Charlie's photo, its › ↔ ‹, its lines; the provider link; the times) the kit's States glided the new
state up 4px with a blur, so the icon landed in a second place. These scenes now swap with `Fade`
(bp-dialog.tsx): opacity only, every state in one spot. Every icon now has exactly one rest position
across the loop. Re-gated at 720 and 390: rehearsal passed (row at 720 now 0 candidates).
