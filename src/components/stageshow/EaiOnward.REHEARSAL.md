# Rehearsal: EaiOnward ('eai-onward')

Replaces the first EaiOnward (invented app, bars everywhere). Gold: `hero-demo`, with SeekAllTab's note.
Shell: `eai-shell.tsx` / `eai-shell.css`. From the prototype: ws-settings.html ("Enable AI features in
apps"), ws-home.html ("Things you can add to your apps", Recent apps), the toast (admin.css .ad-toast),
app-ai-features.html?app=parking-permit&feature=ai-chatbot with ?workflowOption=1 on Pro ("Turn on AI
Chatbot", its four "how it works" steps, "Configure AI Chatbot in Parking permit", "Select a workflow for AI
Chatbot.", Documents: "Guide for applicants ✓ Indexed"), and the Parking permit application workflow's
stages (admin-ut-parking-seed.js).

Beats (~20s): The problem, as testers did it: workspace settings → AI Chatbot on → toast "AI Chatbot turned
on." → ✕ → workspace Home, where nothing points to Parking permit and AI Chatbot is still offered under
"Things you can add" (held 1.5s). The note turns to The answer; the window hands off to Parking permit › AI
Chatbot ("Turn on AI Chatbot") → "Turn on in Workspace settings" → the dialog over the pane → switch → Done:
the page under the scrim is already Configure, then the dialog fades away → "Add to workflow" → in place:
"Live in Parking permit application", the button "Added", the AI Chatbot chip on Application (payoff,
2.6s). The note turns back; the switch resets out of sight and the window hands off to settings.
Poster: the payoff.

Review fixes (round 1): the problem reframed (no app page with "Add to workflow" in it); straight to
Configure, no off state or empty card after Done; the dialog fades out; Documents in real words; hand-offs
sequenced so dialog and page never overprint; the dialog below the bars at 390; the dialog's switch has its
own target.

Frame: 720×750 (the configure card and Documents whole, one gutter under them), window 36 / 48, off the
foot. Off and Configure states are the same height, so Documents never moves. Compact 358×600: rail
collapsed away, Documents left out (the configure card fills it).

Captured: 1280 and 390, loop and `--states`, all `rehearsal passed`; posters.

Assumptions: "Live in Parking permit application" is the brief's wording (the prototype shows a status
column and a toast "AI Chatbot created on …"). Instructions ("Answer in plain, friendly language…") is left
out: its paragraph can't sit whole above any crop at this width without taking the scene past ~810 tall.
The settings page that opens the loop is as empty below its card as the real page.

Round 2: designed at 800, shown at 0.9. `mode`: 'problem' loops from Home back into Workspace settings
(the switch and toast reset off screen; poster: Home with the toast, nothing next); 'answer' loops
through the workspace (the crumb to Home, the page reset off screen, Parking permit again; poster: the
payoff). Stage 800×754 (Documents whole, one gutter under it); compact 358×624, the crop on a row boundary
of Home's recent apps.

Round 3: the answer mode dwells on landing on Configure (2.4s; "Live" 1.4s) and its poster is that
moment, so it doesn't repeat the result's "Live" frame. 'both' keeps Configure 1.1s / Live 2.6s.

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

Round 4 (Gareth: "the Set up button was actually in the dialog"): the answer goes through workspace
settings' AI Chatbot pane as the prototype has it (admin-ai-feature-setup.js): a dialog centred over the
app listing each app with its switch and a "Set up" button, disabled until that app is on, then dark, under
"Enable this feature for an app, then choose Set up to add it to one of the app’s workflows." Parking
permit's switch → Set up lights (grey to dark) → the cursor goes to it and rests a beat (the focal moment,
mark 'setup') → Set up closes settings onto "Configure AI Chatbot in Parking permit". No Done in this
dialog (the real pane has none; Set up is the way on). Compact lists the three apps whose names fit.
The answer mode's poster is now the dialog with Set up lit.

Round 5 (Gareth: "Set up should take them to the first step of that flow"): traced in the prototype
(admin-ai-feature-setup.js goToSetup → featureSetupHref …&setup=new; admin-ai-feature-workflow-step.js;
admin-app-chatbot.js; admin-chatbot-documents.js; real screens in .context/eai-real-step1.png and
eai-stageshow-v2/ref/eai-real-step2.png). Set up closes settings onto "← Back to AI Chatbot" and the card
"Set up AI Chatbot": a stepper (1 Workflow · 2 Documents · 3 Instructions · 4 Summary, step 1 dark), the
Workflow step ("Select a workflow for AI Chatbot.", a Workflow select, the blue "Need a new workflow?"
note), Back (disabled) / Continue. The cursor opens the select (the real options: Simple parking permit,
Parking permit application), picks Parking permit application, Continue: Workflow takes its check and
Documents is the dark step, its real fresh state ("Add the documents your chatbot should reference when
providing answers", the document table, "No documents yet.", Upload Documents). Payoff: step 2, held 2.6s.
The "Configure … / Add to workflow / Live" ending is gone (it isn't what Set up leads to). Compact: the
current pill shows its label, the others their number; the doc table keeps Document Name.
Answer poster: the dialog with Set up lit. Compact stage 358×668.

Not checked: Safari, a real phone, dark theme, live rAF pacing.
