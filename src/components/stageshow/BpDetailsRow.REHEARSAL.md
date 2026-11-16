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
