# Rehearsal: BpNextAvailable ("Never a dead end")

Gold copied: `close-up` frame, pulled back to show both panels (~0.89x, the window whole across
with a 40 gutter, off the bottom, chrome top-left); the jump borrows `choreography`'s dependent
timing (the line folds, the day drops in, the provider below moves with it). Not filmed beside the
gold (playground dependencies not installed here; read from source).

Beats: read the line → click "26/05/2021 at 10:30 am" → the line folds, Charlie's day drops in on
the 26th with 10:30 am already picked (teal), "Less" fades in, Dominique moves down → cursor home.
Plays once; poster = Charlie on the 26th with 10:30 am picked.

Fixed along the way: "Change date" overlapping Charlie's name in the narrow panel (the header link
now only appears after the jump, as "Less"); the provider field's ellipsis (now "Charlie Charmoose
+2"); times cut by the opening edge (the day's Collapse uses `drop`).

Filmed: 720 and 390, plus the jump beat at 50ms, `--gate`: rehearsal passed, 0 candidates at both.

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
