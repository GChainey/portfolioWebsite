# EaiOnward — rehearsal

**Story (~18s loop):** Before: the app's AI Chatbot card reads "Not set up"; "Turn on in Workspace settings" opens
the dialog, the switch goes on, "Saved" — and nothing next. Done; the cursor rests on the card's "Not set up":
only step one happened. After the fix (the note crossfades): the same switch opens the onward step under the rows,
"Next: set it up in the app" with "Set up in Vending issue form ›"; it leads to the card's setup steps (Turned on ✓,
Choose its documents → "3 documents", Go live), and Go live turns the card to "Chatbot is live in Vending issue form"
with a Live badge. Holds ~2.4s; the note going back to Before is the reset's cause.

**Copied from:** EaiSettingsLevels (parts in `eai-parts.tsx`, `eai-scenes.css`), SeekAllTab's note and loop.
**Motion:** the card's height eases to each state (`FitFade`), the new contents fade in only after the height has
settled, so the moving edge never cuts them; the onward step opens with the kit's Collapse.

**Gate:** `film.mjs --gate --states` passed at 1280 and 390. Advisory left: "near aligned" while the dialog fades
in; "layout" for the deliberate bleed of the cards past the window's foot.

**Not checked:** a real phone, Safari, dark theme.
