# Rehearsal: BpSegmented ("One control, one choice")

Gold copied: `close-up` (structure: the whole window scaled, chrome top-left, inset top and sides,
off the bottom; large cursor). Not filmed: the skill's playground has no dependencies installed
here, so the gold was read from source, not filmed beside this one.

Changed from the gold: the Fluent 2 New appointment dialog (bp-dialog.tsx, bp-scenes.css) at 640
across (420 drawn at ~1.52x); the shell grey ground; a loop instead of once (it returns to its
start with a visible cause: the waiting list clicked off).

Beats: Repeat on (its line opens, the comment moves down) → waiting list on (Repeat lets go, its
line folds as the waiting list's opens) → waiting list off (back to the start) → cursor home.
Poster: Repeat on with its line.

Filmed: 720 wide and 390 wide, 22-24 frames each, `--gate`: rehearsal passed, 0 candidates at
both. Reduced-motion poster at both widths. Clicks aimed off the labels.

Not checked: dark theme (not shipped), real devices and Safari, pause/resume and offscreen return
by hand, the case-study page itself (the scene isn't wired in yet).

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

## Round 3

Leads and rests on Add to waiting list ("Waiting list · Priority 2" / "Any provider · From
01/06/2021"), held 3s; Repeat only passes through (1.1s) as the one-at-a-time beat. Poster = the
waiting list on, so it no longer matches BpRepeat's poster. Re-gated at 720 and 390.

## Round 4

Loops continuously with a visible reset (Segmented: the waiting list clicked off; Repeat: Repeat
clicked off, the line folds away). The comment is a fixed 96px field, never stretched; the left
panel has white space below it. Re-gated at 720 and 390: rehearsal passed.
