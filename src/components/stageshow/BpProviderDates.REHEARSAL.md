# Rehearsal: BpProviderDates ("Each provider, their own day")

Gold: `close-up` frame pulled back to the 50/50 two-panel view (read from source); the date change
borrows `choreography` (only the changed part moves: Roll on the date, a crossfade on the times).

Beats: Dominique's next-day arrow → her date rolls 25 → 26/05/2021 and her times change; Yarn's
stepper, directly under hers, stays on 25/05/2021. Ends there, nothing booked. Plays once; poster =
Dominique on the 26th above Yarn on the 25th.

At 390 the panel's Date and Provider fields drop and each provider shows one row of three times,
so both steppers (26 above 25) stay on screen.

Cursor: hand on the steppers' arrows, the date fields, the links and every time. Sampled every
30ms: the press is on the hand.

Filmed: `--gate` at 720 and 390, rehearsal passed, 0 candidates at both.

Not checked: dark theme, real devices and Safari, pause/resume and offscreen return by hand, the
case-study page itself.

## Round 2 (right panel only)

A close-up of the Appointment details panel alone (PanelWindow). Dominique's › rolls her date to
26/05/2021 with a brand-tint flash, her times crossfade to the 26th's; Yarn's 25/05/2021 sits
directly below, unchanged. Holds 2.5s, then Dominique's ‹ takes her back (the reset) and it loops.
Filmed: `--gate` at 720 and 390, rehearsal passed, 0 candidates.

## Round (icon jitter)

Gareth saw the icon in the details row jump between two positions. Measured every icon's box on
every animation frame through the loop at 720 and 390 (.context/ss-tools/scripts/icon-jitter.mjs):
nothing moved at rest, but each time a state swapped in a fixed slot (the row's stethoscope ↔
Charlie's photo, its › ↔ ‹, its lines; the provider link; the times) the kit's States glided the new
state up 4px with a blur, so the icon landed in a second place. These scenes now swap with `Fade`
(bp-dialog.tsx): opacity only, every state in one spot. Every icon now has exactly one rest position
across the loop. Re-gated at 720 and 390: rehearsal passed (row at 720 now 0 candidates).
