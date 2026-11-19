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

Not checked: Safari, a real phone, dark theme, live rAF pacing.
