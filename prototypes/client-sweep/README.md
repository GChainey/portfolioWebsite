# DAISY scenario change: prototype

Cumberland Council → NSW Planning → Polska → back, on a loop (about 19.5 s), over real HTML
recordings of DAISY's Caseload. Every change runs the same beats:

1. the current scenario's Caseload (left nav collapsed to its icon rail)
2. a popup naming the change (the part the variants differ on)
3. the skeleton: placeholders inside the cards that change (the three summary cards and the table)
4. a glimm band, bottom up (`btt`, glimm's defaults otherwise), one per card, clipped to that
   card's rounded rect, revealing the next scenario's data as it passes. Everything outside the
   cards (nav logo, filter row, title) switches at the band's midpoint, with no band.

Variants (picker at the bottom, PICKER.md):

| # | Variant | The popup |
| --- | --- | --- |
| 1 | Centre card | "Switching scenario", from logo + name → to logo + name, a progress line; page dims |
| 2 | Toast | compact, top centre over the top bar: logo + name → logo + name; no dim |
| 3 | Command | palette: the next scenario typed, its row highlighted, Enter, closed |

## Run

Node 24.

```sh
npm install
npm run dev          # http://localhost:5410/?v=1  (v=1..3)
```

Keys: `1`–`3` or `←`/`→` switch variant, `R` (or ↻) replays from Council. `?v=` keeps the choice
on reload. The band is WebGL: in a headless browser it needs
`--use-gl=angle --enable-unsafe-swiftshader --ignore-gpu-blocklist`.

## Re-record the clips

The recordings in `public/replays` come from DesignConfigurator `main` running locally:

```sh
# in a worktree of DesignConfigurator at origin/main (with its .env)
npx vite --port 55190 --strictPort

# here
npx html-recording setup                     # once: installs the recorder's Chromium
npm run record                                # all three
npm run record -- caseload-polska             # or one
```

`scripts/clips.mjs` opens Cumberland Council → Future State → Daisy Assess, picks the scenario from
the nav's switcher, collapses the nav, then records 1440 × 900: a short hold while the cursor drifts
and returns to where it started (so cuts between clips don't move it).

## Files

- `index.html`: the case-study surround, the frame (880 × 550, 16:10) and the picker
- `src/main.ts`: clip loading, card measurement, skeleton, per-card bands, the three popups, picker wiring
- `src/style.css`: surround, popups (zinc, Geist, radius 12–16, dialog shadow), picker CSS verbatim
- `public/logos`: the three scenario marks, as used by DAISY's tenancy switcher

Nothing here is imported by DesignConfigurator.
