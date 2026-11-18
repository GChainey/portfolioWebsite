# Rehearsal: EaiSettingsDialog ('eai-settings-dialog')

Gold: `hero-demo` and `panel-annotation` (a setting opened over the product, its effect on the product),
with SeekAllTab's note. Shared shell: `eai-shell.tsx` / `eai-shell.css`. Copied from the prototype:
app-ai-features.html?app=parking-permit (AI features cards, "Add in Workspace Settings ↗"), ws-settings.html
and the in-place settings modal (Workspace settings nav, "Enable AI features in apps", the switch table and
its copy), and the adDialog grey footer holding Cancel / Done.

Beats (~18s loop): The problem: Parking permit › AI features → "Add in Workspace Settings ↗" → a separate
workspace settings page (the app gone) → AI Chatbot on → ✕ → the workspace Home; the cursor goes to Recent
apps' Parking permit, looking for the way back. The note turns to The fix and the app is back (the seen
cause). "Add in Workspace Settings ↗" → the dialog over the app (scrim, 96%→100% over 250ms) → AI Chatbot
on → Done → the dialog closes, then (240ms later) the card answers: "● Turned on · Manage ↗". Payoff held
2.4s; the note turns back. Poster: the payoff.

Frame: stage 720×544, window 36/48, off the foot; the next card (AI Document Checking) runs off it.
Compact 358×532: the app rail collapsed away (the prototype's panel toggle; the rail isn't this story),
the dialog is its pane alone.

Captured: 1280 and 390, loop and `--states`, all `rehearsal passed`; posters at both widths; the dialog beat
still (settings-dialog-at-dialog-1280.png).

Film lines left: `near-empty frames` at the page swaps (sequenced out-then-in, as briefed). A `tight control`
line was a cross-layer false positive (a page button under the scrim measured against the dialog's card
edge above it); the dialog sits 44px down (24 in compact), clear of it.

Assumptions: the "On" state of the card ("Turned on", "Manage ↗") is ours: the prototype's card only changes
once a configuration exists ("Shared from Workspace Settings"). AI Chatbot's card is shown first (the
prototype lists AI Document Checking, Document Checklist, then AI Chatbot), and "See preview" is dropped
from it, so the story's card is whole in the crop.

Not checked: Safari, a real phone, dark theme, live rAF pacing.
