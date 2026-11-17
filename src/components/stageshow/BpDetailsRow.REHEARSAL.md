# Rehearsal: BpDetailsRow ("Three answers, one row")

Gold copied: `close-up` for the frame. Its story is longer than the gold's (open, pick, close), so
the second view borrows a camera pull-back: one panel at ~1.52x, both panels at ~0.89x, the window
whole across at 640 with a 40 gutter in both, running off the bottom, chrome top-left. Not filmed
beside the gold (playground dependencies not installed here; read from source).

Beats: hover the row (brand tint) → open it (the dialog widens as the camera pulls back; the right
panel's content fades in once the edge has passed) → pick 10:30 am (teal) → the panel closes, the
camera returns, then the row fills (Charlie's photo, 26th May 2021, 10:30 am – 10:45 am).
Plays once; poster = the filled row. The row is full width of its panel, empty and filled.

Compact (358): one panel at a time at 1x; the right panel is pushed in opaque over the left,
which fades back (no see-through mid-push).

Filmed: 720 and 390, `--gate`: rehearsal passed both. Candidates left:
- wide: `appears, then moves` on the kit's States crossfade (the row's lines), as the camera
  settles. Watched: reads as one change.
- 390: `hard edge` on the pushed panel's content crossing the window edge mid-push, and a filler
  bar `clipped` while it slides. Inherent to a push; the panel is opaque and the cover fades.

Not checked: dark theme, real devices and Safari, pause/resume and offscreen return by hand, the
case-study page itself.

## Round 2 (Gareth's review)

- Cursor: every control is marked `data-cursor="hand"` (in this kit `pointer` is the arrow): the
  segments, the details row, every time, the links (Next available, Less, More), the close ✕, the
  stepper chevrons, the date and provider pickers, the slim rows, the patient's ✕. The patient
  field and the comment take the I-beam. Checked by sampling the cursor's kind every 30ms through
  each scene (`.context/ss-tools/scripts/cursor-check.mjs`): every press is on the hand.
- Patients are initials on the brand tint (#EBF3FC / #0F6CBD, 600); providers keep their photos.
- The Urgent / Repeat / Waiting list group is full width (1 : 1 : 1.45), never narrower than a
  label, so it fits the phone column too.
- Wide stage is now 720 × 620 (the close-up and the pulled-back view both run off the bottom).
- Re-filmed: `--gate` at 720 and 390, rehearsal passed at both.
- The two panels are an even 50/50 split in the wide design (380 + 380, ~1.68x with one panel,
  ~0.84x with both). Compact unchanged. After the pick the cursor goes to the grey beside the
  dialog, not over the comment field.

## Round 3 (rebuilt: the merge)

Now leads the study. Starts on the old way: Provider (Charlie's headshot tag), Date and Time as
three fields. They merge into the one Appointment details row (MergeRow in bp-dialog.tsx): the
three outlines dissolve as the row's arrives, the labels give way to one, and the face, name, date
and time each glide to their line (staggered, so the date is out of the time's path; the field's
words leave before the row's arrive, so a moving line is never two strings at once). It hands over
to the real DetailsRow at identical geometry: checked pixel for pixel (0 differing pixels), so the
two nodes carry `data-snap`. Then the row opens the 50/50 panel, 10:30 am is picked, the panel
closes, the row fills, holds 2.5s, and the dialog fades out and the next run fades in (the reset).
The Group is gone from this scene (not its story); the comment is a fixed 96px field.
Filmed: `--gate` at 720 and 390, rehearsal passed. Candidates: the row-text crossfade as the camera
settles; 200ms near-empty during the fade reset (deliberate); at 390 the panel push.

## Round 4 (nobody assigned → assigned)

Starts with nobody assigned: Provider "Select a provider", Date 25/05/2021, Time "Select a time".
They merge into the empty row (glyph, "No provider selected", "25th May 2021", "No time selected"),
the row opens the 50/50 panel (Charlie and Dominique on the 26th), Charlie's 10:30 am is picked in
teal, the panel tucks away and the row ends assigned (Charlie's photo, 26th May 2021, 10:30 am –
10:45 am, with a clear ✕). Holds 2.5s. Reset: the cursor presses the row's ✕, the row empties, the
cursor leaves it, and the row comes apart into the three empty fields (staggered the other way:
time, date, then name; the row's words leave before the fields' arrive). Both handoffs between
MergeRow and the row are at identical geometry: the merge checked at 0 differing pixels; the return
checked frame by frame on the contact sheet (the probe's own screenshot landed after the un-merge
began). Poster = the assigned row. Cursor: hand on the row, the time and the ✕.
Filmed: `--gate` at 720 and 390, rehearsal passed (candidates: the row-text crossfade as the camera
settles; at 390 the panel push).

## Round (icon jitter)

Gareth saw the icon in the details row jump between two positions. Measured every icon's box on
every animation frame through the loop at 720 and 390 (.context/ss-tools/scripts/icon-jitter.mjs):
nothing moved at rest, but each time a state swapped in a fixed slot (the row's stethoscope ↔
Charlie's photo, its › ↔ ‹, its lines; the provider link; the times) the kit's States glided the new
state up 4px with a blur, so the icon landed in a second place. These scenes now swap with `Fade`
(bp-dialog.tsx): opacity only, every state in one spot. Every icon now has exactly one rest position
across the loop. Re-gated at 720 and 390: rehearsal passed (row at 720 now 0 candidates).

## One radius

Every UI element is 4px (Fluent medium): fields, buttons, the segmented group, the details row and
the repeat / waiting-list lines, message bars and notes, times, steppers, the checkbox. Only the
dialog is 8px; the switch keeps its pill track. Checked on the posters; re-gated at 720 and 390.

## Round 5 (a side panel, no zoom)

No camera zoom-out: the close-up holds the whole loop. Opening the row slides the providers' panel
in from the right over the right part of the dialog (opaque, its own edge and shadow): Charlie and
Dominique on the 26th, each with their stepper and a row of times; 10:30 am is picked in teal there,
the panel slides back out and the row fills. The unassigned start, the merge and the ✕ reset are
unchanged. At 390 the full push stays. Re-gated at 720 and 390: rehearsal passed (candidates: the
panel's content crossing the window edge as it slides). Frame sheet: .context/bp-stageshow/
row-side-720.png.

## Round 6 (a real two-panel dialog, fixed camera; a calm merge; fitted)

- Two panels again, with no camera move: the camera holds, for the whole loop, the frame the full
  50/50 dialog opens into (~0.84x). The dialog starts as the left panel, centred in that frame as a
  modal is (left-aligned failed the framing gate: "runs off the bottom but sits off center"), and
  widens outward into it to reveal Appointment details (date and providers, Charlie's and
  Dominique's steppers and times); 10:30 am is picked in teal; it narrows back and the row fills.
  At 390 the one-panel push stays.
- The merge is in place now: the three fields' outlines and contents crossfade to the row's one
  outline and contents where each will sit (opacity only, the fields leaving first), while the space
  eases from 124 to 110. Nothing travels; the glyph never moves. The reverse on the ✕ reset is the
  same. Handoff to the row still 0 differing pixels.
- Fitted: the dialog is as tall as its content (Book appointment / Cancel at its foot, both panels
  ending together) with a deep foot just past the bottom edge; the stage is 454 tall, so there's no
  empty lower half.
Re-gated: 720 rehearsal passed, 0 candidates; 390 passed (the push crossing the window edge).
Sheets: .context/bp-stageshow/row-widen-720.png (open → pick → close → fill), row-merge-720.png.
