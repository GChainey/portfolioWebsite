# Rehearsal: EaiSettingsDialog ('eai-settings-dialog')

Gold: `hero-demo` and `panel-annotation` (a setting opened over the product and its effect). Shell:
`eai-shell.tsx` / `eai-shell.css`. From the prototype: app-ai-features.html?app=parking-permit (AI
features cards, "Add in Workspace Settings ↗"), ws-settings.html and the in-place settings modal
("Enable AI features in apps", the switch table and its copy), adDialog's grey footer (Cancel / Done).

Beats (~19s): The problem: Parking permit › AI features → "Add in Workspace Settings ↗" → a separate
workspace settings page → AI Chatbot on → ✕ → workspace Home; the cursor looks at Recent apps' Parking
permit, then settles on empty page. The note turns to The answer. "Add in Workspace Settings ↗" → a small
dialog over the app's pane (scrim fades on its own; the dialog opaque within 80ms, scaling from 96%), the
app's bar, title and rail in view round it → AI Chatbot on → Done → the dialog closes, then the row swaps
in place to "● Turned on · Manage ↗" (payoff, 2.4s). The note turns back; the window hands off to the
problem's own copy of the app screen, so the card's reset happens out of sight. Poster: the payoff.

Review fixes (round 1): smaller dialog below the bars (also at 390); opaque scale-in; row swapped in place;
reset hidden behind the hand-off; the problem ends with the cursor on empty page; the placeholder card
under the toggles removed (that area is empty in the real page); the dialog's switch has its own target
(`dlg-tog`), so the press lands on AI Chatbot's switch.

Frame: 720×544, window 36 / 48, off the foot; AI Document Checking's card runs off it. Compact 358×532:
the rail collapsed away (the prototype's panel toggle), the dialog full width of the pane.

Captured: 1280 and 390, loop and `--states`, all `rehearsal passed`; posters; the dialog beat still.
Left: `near-empty frames` at screen hand-offs; a one-frame `jump` during the dialog's scale-in.
The dialog's top sits 156 (118 in compact): `tight control` measures the page's button under the scrim
against the dialog's rows above it, a cross-layer false positive cleared by placement.

Assumptions: the On state of the card is ours (the prototype's card only changes once a configuration
exists). AI Chatbot's card is shown first, without "See preview". The separate settings page is as empty
below its card as the real one.

Round 2: designed at 800, shown at 0.9. `mode`: 'problem' loops by finding the way back (Parking permit
from Home's recent apps; poster: the separate settings page with the switch on); 'answer' loops through
the workspace (the crumb to Home, the card reset off screen, Parking permit again; poster: "Turned on").
The far card under AI Chatbot is now the bars-only filler at both widths (at 800, "Add AI Document
Checking" and its button no longer fit one row, and the row sat in view). Stage 800×560; compact 358×532,
its dialog at 132.

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
