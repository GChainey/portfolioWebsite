# EaiSettingsLevels — rehearsal

**Story (~16s loop):** Before: in the app's settings, "Add in Workspace settings" opens workspace settings as a
page that looks the same (same sidebar shape, same Features › AI Chatbot, same title); turn it on, close it, and
you land on the workspace home, the cursor going looking for the app. After the fix (the note crossfades, the
visible cause): the app is a card in the grey workspace; "Workspace settings" opens a dialog over the app, turn it
on, Done, and you're still in the app with the card reading "On for this app". Holds ~2.4s, then the note goes back
to Before (the reset's cause).

**Copied from:** SeekAllTab (note + loop), BpDetailsRow / bp-dialog (opacity-only Fade, ss-window framing).
**Look:** Enterprise AI workspace, prototypes repo `workspace-ai-demo/DESIGN-SYSTEM.md` (Geist, 24/16/14/12,
400/500/600, zinc greys, one hairline). Deviation: the dialog pads 16 on every side including the grey footer
(the prototype's 24 body / 16 footer reads as uneven padding at this size and fails the gate).

**Gate:** `film.mjs --gate --states` passed at 1280 and 390 (0 never-intentional lines). Advisory left: "near
aligned" (the page title and the dialog kicker while the dialog fades in), "layout" lines for the cards that run
off the window's foot (deliberate bleed).

**Frame:** wide 720×480, the window 56 from top and sides (it's an `ss-window`, so its inner layout is the
product's), running off the bottom; compact 358×470, window at 16 all round, sidebar and note dropped.

**Not checked:** a real phone, Safari, dark theme. The film tool's hydration warning about its own
`data-ss-verification-stage` attribute was filtered in the temporary tool copy (it's the tool's, not the scene's).
