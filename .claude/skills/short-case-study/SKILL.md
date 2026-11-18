---
name: short-case-study
description: Build or rework a short case study on Gareth's portfolio (/draft/<slug>, later /work/<slug>) the way SEEK and Best Practice were made — story first, recruiter-readable impact, the work recreated in HTML and shown as Stageshow scenes and HTML recordings, the good work first with the old design one click away. Use whenever a portfolio case study is written, restructured, given visuals, or reviewed, even if the request only says "fix the case study", "make the clips better", "tell the story" or "add the before".
---

# Short case study

How the SEEK and Best Practice studies were built (PR #173, Nov 2026), written down so the next ones start
where those ended. Read the two finished studies before starting: `src/content/short-studies.ts` (entries
`seek`, `bestpractice`), rendered by `src/components/site/case-study.tsx` at `/draft/<slug>`.

## The order of work

1. **Find the original story first.** The long write-up in `src/content/projects.ts` (and Gareth's memory of
   it) is the source of the beats and every number. Use his framing and words: SEEK is "assumptions" where
   people dropped out, never "leaks". Don't invent numbers; leave out any figure with no source and say so.
2. **Write the story as beats, before any visuals.** Each beat is one headline (claim on line one, the rest
   under it in grey) and at most one short paragraph or 2–4 short bullets. Gareth cuts text hard: when a
   section feels long, it is.
3. **Recreate the work in HTML** in the product's *current* design system (`recreations/<study>/`, static
   HTML/CSS/JS, every state reachable by `?v=`). Old screens get rebuilt in the same system so the before and
   after are consistent. Interactions must really work.
4. **Choose the visual per beat** (below), build it, rehearse it, wire it in.
5. **Review frame by frame** (below), fix, then commit. Merge only when Gareth says so.

## Story rules

- **Impact a recruiter understands.** Translate internal metrics: "education conversion" → "sign-up
  conversion 9% → 20%, against a goal of 12%"; "paid connections" → "premium connections +34%". Impact is the
  first row of the facts table, same size as the rest — never a big number.
- **The good work first.** Scrolling should show craft and delight. The old design is one sentence, one image
  or one short video near the top, and otherwise a **Now | Before** switch on a moment (`was` on a block:
  `{ moment, line, was: { media, line } }`), Now by default.
- **Show the before only where it explains the after** ("the All tab only makes sense next to the design
  without it"). In a Stageshow scene the before can be the first beat, then the fix.
- **End with the transferable idea**: what makes this solvable in other domains (SEEK: the four moves for any
  funnel; Best Practice: the patterns that made it robust). A reference in running text is written
  `[words](https://link)` and gets a hover card from `REFERENCES` in `components/site/reference.tsx`
  (A Pattern Language is there already).
- Captions say what the viewer is seeing, in the same voice; no "Leak 1:", no process narration.

## Choosing the visual

| The beat | Use |
| --- | --- |
| One improvement (a control, a row, a link, a merge) | **Stageshow scene** — `/stageshow` skill, kit in `src/components/stageshow/kit/` |
| A whole flow worth seeing end to end (the hero) | **HTML recording** of the recreation (`html-recording` skill, `scripts/replays/<study>.mjs`), cropped to the dialog with `region` |
| The old design | One still, or a short Stageshow video of it getting worse (Best Practice's `BpOldDialog`) |
| A metric story | An interactive diagram in the site's tones (the SEEK funnel, `components/site/funnel.tsx`) |
| Mobile work | Phone recordings or scenes in the kit's iPhone 18 Pro frame (`phone: true` media, or the Phone part in a scene) |

Scenes are registered by name in `SCENES` in `case-study.tsx` and used as `{ scene: '<name>' }`. Build them on
a dev preview page (`src/app/draft/<study>-scenes/page.tsx`) and rehearse with the stageshow skill's
`film.mjs --gate` at 720 and 390 wide, with a `<Scene>.REHEARSAL.md` beside each.

## Craft rules for scenes and recordings (each came from a review)

- **One change per scene**, held ~2.5s, then **loop** with a visible cause for the reset (a ✕, Cancel, a back
  arrow). Nothing plays once and freezes.
- **No camera zoom-outs.** Fix the camera at the scale the scene needs from the first frame; a second panel
  opens inside that frame (a real two-panel widen, or a side panel sliding in). Close-ups stay close.
- **Nothing hops.** State swaps are opacity-only in place (Best Practice's `Fade` in `bp-dialog.tsx`), never
  the kit's slide-in crossfade. Merges happen in place: shapes collapse, contents crossfade, nothing flies.
- **The cursor is right.** The pointing hand over anything clickable, the text cursor over fields, parked
  somewhere sensible between beats. (In the kit, `pointer` is the arrow; `hand` is the hand.)
- **Frame the work, not the window.** No empty lower half; the component is as tall as its content and the
  stage crops to it with an even gutter. Crop recordings to the dialog (`region`) so text renders large.
- **Plain grey ground** (the shell grey) behind scenes; no decorative backdrops or tiles.
- **One design system, applied consistently**: one radius for every UI element (only the container differs),
  one spacing rule (side-by-side controls one gap, stacked fields another, 4/8 inside components), cards and
  rows fill their width, no stretched empty fields, few type sizes and colours (audit them; minimise).
- **Real content where the eye lands**: real provider logos, headshots for staff (Unsplash, free licence),
  initials for patients/customers (you often won't have their photo). Placeholder bars only at the edges.
- **The site's tones, not the client's brand**, for the site's own diagrams and switches (the SEEK funnel is
  ink and grey, not SEEK pink). The product inside a scene keeps its own design system.
- Payoffs don't wrap: a one-line summary stays on one line.

## Review before showing Gareth

- Snap every recording (`~/.claude/skills/html-recording/tools/snap.mjs`) and film every scene; read the frames
  as a contact sheet. Write a short clear / not-clear table per clip: is the point obvious, does the payoff
  hold, is text readable at 720, does anything jitter, does it repeat another moment?
- Check the page at 1440 and 390 wide with Playwright; scroll it fully so lazy recordings load.
- Recordings are fetched `no-store` in development; if Gareth sees old media, restart `next dev` from a clean
  `.next` (kill only this worktree's PID, never `pkill next`).
- End your message with numbered decisions answerable in a word, recommendation marked.

## Where things live

- Content: `src/content/short-studies.ts` · template: `src/components/site/case-study.tsx` · styles:
  `src/components/site/style.tsx`
- Funnel: `components/site/funnel.tsx` · contents list: `components/site/contents.tsx` · references:
  `components/site/reference.tsx`
- Recreations: `recreations/<study>/` · recordings: `scripts/replays/<study>.mjs` → `public/replays/<study>/`
- Scenes: `src/components/stageshow/<Study>*.tsx` · stills and assets: `public/case-studies/<study>/`
- Drafts are dev-only (`/draft`, PARKED_LIVE); going public means moving a study to `/work/<slug>`.
- Add a changelog entry (`src/content/changelog.ts`) for significant work.
