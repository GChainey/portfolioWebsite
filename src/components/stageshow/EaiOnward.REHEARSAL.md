# Rehearsal: EaiOnward ('eai-onward')

Replaces the first EaiOnward (invented app, bars everywhere). Gold: `hero-demo`, with SeekAllTab's note.
Shared shell: `eai-shell.tsx` / `eai-shell.css`. Copied from the prototype: app-ai-features.html?app=
parking-permit&feature=ai-chatbot (the "AI Chatbot" page: "Add to workflow", "Getting started", "Tutorial
video coming soon", "Workflows with this feature · No workflows added yet"), its workflow-oriented version
(?workflowOption=1 on Pro: "Turn on AI Chatbot", "Configure AI Chatbot in Parking permit", "Select a workflow
for AI Chatbot.", Documents / Instructions), and the Parking permit application workflow's stages from
admin-ut-parking-seed.js (Application 4 steps, Processing 2, Document review 5).

Beats (~17s loop): The problem: settings is open over the chatbot's page; AI Chatbot on → Done → the page is
as it was; the cursor settles on the tutorial (stuck, 1.8s). The note turns to The fix and settings opens
again (the seen cause; the switch reset while it was shut). On → Done → the dialog closes, then the card
answers with the next step: the workflow picker and "Add to workflow" → pressed → "Live in Parking permit
application", the stages, AI Chatbot on Application (payoff, held 2.6s); the note turns back. Card swaps
are opacity-only with the card's height easing between them (`FitFade`). Poster: the payoff.

Frame: stage 720×592, window 36/48, off the foot; Documents / Instructions run off it with bars inside.
Compact 358×600: rail collapsed away, the header's button and the tutorial's subline dropped so the
problem's "No workflows added yet" row stays whole.

Captured: 1280 and 390, loop and `--states`, all `rehearsal passed`; posters at both widths; the next-step
beat at 60ms (onward-next-beat.png).

Film lines left: `layout` advisories for the cards that run past the crop (intended bleed).

Assumptions: "Live in Parking permit application" is the brief's wording; the prototype shows a status
column ("Not configured" / "Draft" / "Ready") and a toast "AI Chatbot created on …". The tutorial
placeholder is laid out left-aligned (the prototype centres it) so its padding is even at this size.

Not checked: Safari, a real phone, dark theme, live rAF pacing.
