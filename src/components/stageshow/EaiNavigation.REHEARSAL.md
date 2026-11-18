# Rehearsal: EaiNavigation ('eai-navigation')

Gold: `hero-demo` (a product window under a note, a cursor walking named targets), with SeekAllTab's
problem/fix note and loop. Built on `eai-shell.tsx` / `eai-shell.css`, the prototype's workspace
(workspace-ai-demo/build-web: ws-home.html, app-overview.html) rebuilt from computed styles at real size:
264→240 workspace sidebar, 216 app rail, 48 top bars, 14/500 nav, 8-radius controls, 12-radius cards,
translucent ink hairlines, the prototype's own icon paths (admin-shell.js).

Beats (~16s loop): The problem: Home (grey sidebar, white page) → Parking permit from Recent apps → the app
on the same frame (grey sidebar, white page, its name where "Home" was) → Back to workspace. The note turns to
The fix (the seen cause). Home → Parking permit → the app nested as a white card on a grey page, white
rail, "NYC Council / Parking permit" in the top bar (payoff, held 2.6s, cursor resting in the same spot it
rested in the problem so the two compare) → the NYC Council crumb → Home; the note turns back. Home is the
same in both halves, so the seam is the note alone. Poster: the fixed app screen.

Frame: stage 720×544, window inset 36 at the sides and 48 at the top (note above), off the foot. Compact
358×532: window inset 32/40, the sidebars as the prototype's collapsed icon rails so the colours still read.
Each screen ends in a bars-only card past the crop (`MoreCard`), so only filler bleeds.

Captured: 1280 (720 column) and 390, the whole loop (`--gate`, 500ms) and `--states`, both `rehearsal passed`;
reduced-motion poster at both widths.

Film lines left: `near-empty frames` around each screen swap (the old screen out 150ms, then the new in
200ms; the brief asks that two states never overprint, so the window is empty for ~30ms); `near aligned`
advisories (the prototype's own 24px workspace mark vs 16px icons; card titles vs inner boxes).

Assumptions: the first release's app is drawn on the workspace's frame (the brief's "same sidebar
treatment, same page title style"), with the old "Back to workspace" and "Save changes" from the
before-levels recording. Recent apps are council services (Building permit, Street vendor licence, Noise
complaint, Pothole report, Tree removal, Business licence). The workspace top bar's search field is an icon
at this width.

Not checked: Safari, a real phone, dark theme (the site is light only), live rAF pacing on the real page.
