# Rehearsal: EaiNavigation ('eai-navigation')

Gold: `hero-demo` (a product window under a note, a cursor walking named targets), with SeekAllTab's
problem/fix note. Shell: `eai-shell.tsx` / `eai-shell.css`, the prototype (workspace-ai-demo/build-web:
ws-home.html, app-overview.html) rebuilt from computed styles: 48 top bars, 14/500 nav, 8-radius controls,
12-radius cards, translucent ink hairlines, the prototype's own icon paths (admin-shell.js).

Beats (~15s): The problem: Home (grey sidebar, white page) → Parking permit from Recent apps → the app on
the same frame (grey sidebar, white page, its name where "Home" was; "Back to workspace", "Save changes" from
the before-levels recording) → Back to workspace. The note turns to The answer and the fix starts on the click
into the app → the app as a white card inset 12 on the workspace grey, white rail, "NYC Council / Parking
permit" (payoff, 2.6s; the cursor rests in the same empty run of the top bar as in the problem, so the two
compare) → the NYC Council crumb → Home; the note turns back. Poster: the fixed app screen.

Review fixes (fresh eye, round 1): Home's column padded 24 inside the page; the workspace grey a step darker
(zinc-100 #f4f4f5, the sidebar and the ground round the app card) so the swap reads, the note naming the
card; the fix begins on the click; swaps are one calm hand-off both ways (old out 140ms, new in 220ms from
130ms; no overprint, near-empty for a beat); "Edited in · Your own AI" dropped (it overflowed its tile at
this width); the card bar's title centred over the content column, as the product does; compact keeps a
short sentence in the note.

Frame: 720×544, window 36 / 48 (note above), off the foot; each screen ends in a bars-only card past the
crop (`MoreCard`). Compact 358×532: window 32 / 40, the collapsed icon rails.

Captured: 1280 and 390, loop (500ms) and `--states`, all `rehearsal passed`; reduced-motion posters.
Left: `near-empty frames` at each swap (the brief's out-then-in), `near aligned` advisories.

Assumptions: workspace grey #f4f4f5 is one step darker than the prototype's #fafafa sidebar, chosen for
legibility. Recent apps are council services.

Round 2 (Gareth: "nearly good"): zoomed out, designed at 800 and shown at 0.9 in the 720 column, so the
content column gains 72px (window 648 → 720); 12px small text ≈ 10.8px effective. `mode`: 'problem' loops
Home → Parking permit → Back to workspace (poster: the first release's app); 'answer' loops Home → Parking
permit → the crumb (poster: the app as a card); 'both' as before. Notes read "The problem" / "The answer".
Stage 800×604 (compact 358×532 unchanged).

Not checked: Safari, a real phone, dark theme, live rAF pacing.
