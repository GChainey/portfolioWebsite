# Rehearsal: EaiResult ('eai-result')

The end result, the study's hero: the good path end to end in one calm loop. Built from the same parts
as the problem / answer scenes (`eai-shell`, EaiSettingsDialog's `AiFeatures`, EaiOnward's `ChatbotPage`).
Gold: `hero-demo` (one window, a cursor walking named targets, a payoff that holds).

Beats (~15s): the NYC Council workspace Home (grey sidebar, white page) → Parking permit from the sidebar's
recent apps → the app, a white card inset on the workspace grey, at AI features → "Add in Workspace
Settings ↗" → workspace settings as a small, opaque dialog over the pane (scrim on its own, scale from 96%)
→ AI Chatbot on → Done: the page under the scrim is already "Configure AI Chatbot in Parking permit", then
the dialog fades onto it → "Add to workflow" → in place: "Live in Parking permit application", "Added",
the AI Chatbot chip on Application (payoff, 2.8s) → the NYC Council crumb back to Home, where it began;
the app's state resets while it's off screen. No note. Poster: the payoff.

Frame: designed 800×742 and shown at 0.9 in the 720 column (14px body ≈ 12.6px, 12px small ≈ 10.8px);
window 40 on every side it doesn't bleed (no note), off the foot; Documents whole with one gutter under it.
Compact 358×616: window 32, rail collapsed away; the crop sits on a row boundary of Home's recent apps.

Captured: 1280 and 390, loop and `--states` with `--gate`, posters (see .context/eai-stageshow-v2/gate.log).

Round 3 (Gareth: realistic proportions; centred dialogs): the wide design is the prototype at a real
1280-wide viewport (its own widths: 264 sidebar, 56 top bars, 16-inset app card, 44 card bar, 260 rail, a
740 content column, 24-padded cards, 64 rows), the window flush with the stage's sides and shown at 0.5625
in the 720 column; 808 of window in view (≈16:10), the crop on a row boundary. Every dialog opens centred
in the window in view, over a scrim covering the whole window, opaque, scaling from 96%. Effective sizes at
0.5625: note 24 → 13.5px, page titles 24 → 13.5px, card titles 16 → 9px ("Configure AI Chatbot in Parking
permit"), 14px text → 7.9px (the dialog title, "Live in Parking permit application", the toast, the
crumbs), 12px → 6.75px: below ~9px the beat relies on the note and the motion. Compact (390) unchanged
except the dialog, now centred too.
Tooling: film-checks.mjs (the working copy in .context/ss-tools) measured flex gaps and the tight-control
distance in screen pixels against CSS pixels, so every gap tripped at 0.5625; it now divides by the stage
root's scale. The skill's own copy is untouched.

Not checked: Safari, a real phone, dark theme, live rAF pacing.
