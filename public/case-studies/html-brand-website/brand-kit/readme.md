# EAI brand atomic system

One brand in two formats. `human/` is for people. `agent/` is for AI agents to
build from. Both come from the same decisions, written for two different readers.

The shape follows Little Plains' atomic kit
([The HTML Brand](https://x.com/emmettshine/status/2054539694097015171)). The
thinking happens up front, and every page, screen and campaign built afterwards
follows from it.

```
brand_atomic_system/
├── readme.md                  ← you are here: how to use it + the open decisions
├── magic_trick.md             ← the original idea the system can't produce on its own
├── human/                     ← drop PDF brand guidelines here
└── agent/
    ├── verbal/
    │   ├── positioning.md     ← what EAI is, who it's for, the problem
    │   ├── audience.yaml      ← the three audiences
    │   ├── messaging.md       ← the line, pillars, proof points, CTAs
    │   ├── differentiation.md ← why EAI, what it isn't, against the alternatives
    │   ├── concepts.md        ← product names and the ideas behind them
    │   └── voice.md           ← tone, copy rules, words to use and avoid
    └── visual/
        ├── colors_and_type.css ← colour and type variables
        ├── fonts/             ← typefaces
        ├── assets/            ← logo + brand assets
        ├── components/        ← UI primitives, rendered
        ├── tokens/            ← space, radius, shadow + token specimens
        ├── motion/            ← full motion system (JSON, CSS)
        └── artifacts/
            ├── web/           ← marketing pages built from the kit
            └── product/       ← product screens built from the kit
```

## For agents: read this first

You are building something for Enterprise AI (EAI). This folder is the brand. Treat
it as a set of instructions, not as inspiration.

**Read in this order:**

1. `agent/verbal/positioning.md`
2. `agent/verbal/audience.yaml`
3. `agent/verbal/messaging.md`: the only claims you may make
4. `agent/verbal/differentiation.md`
5. `agent/verbal/concepts.md`: product names, exactly as written
6. `agent/verbal/voice.md`
7. `agent/visual/colors_and_type.css`, `agent/visual/tokens/tokens.css` and `agent/visual/motion/motion.css`
8. `agent/visual/components/`: reuse these before you invent new ones
9. `agent/visual/artifacts/`: examples of finished work
10. `magic_trick.md`: the one original idea for this piece of work, if there is one

Build atoms, then molecules, then organisms, then the page.

**Rules:**

- **Tokens only.** Don't introduce a colour, font, size, radius, shadow or easing
  curve that isn't in the CSS files. If you need one, stop and say so.
- **Names exactly.** Write names exactly as `concepts.md` has them.
- **Claims only from `messaging.md`.** Don't invent numbers, customers, logos,
  certifications or quotes.
- **Australian English.** "organisation", "colour", "optimise".
- **Templates are four steps.** Never show, describe or imply a template with more
  or fewer than four steps.
- **`DECIDE` markers.** Use the default from the table below, and list the
  decision in your response as an open item.
- **`TODO` markers.** Don't fill them with invented content. Leave a visible
  placeholder and say what's missing.

**Output:** a single self-contained HTML file unless you're asked for something
else. Link the CSS files or inline them. Don't restate token values by hand.

## Open decisions

Each of these is a place where the current prototypes give two or more answers.
People discuss and close them in the
[Decisions database in Notion](https://app.notion.com/p/1b311b03916d46898008140e320e48ad).
Until a decision is closed, the kit uses the default.

| # | Decision | Default until closed | Status |
| --- | --- | --- | --- |
| 1 | Company name | "Enterprise AI" in full, "EAI" as the short form. "Enterprise AI Pty Ltd" only in legal copy. | open |
| 2 | The one line | "Describe. Design. Deploy." is the brand line. The other candidates become page headlines. | open |
| 3 | Headline promise: weeks or minutes | Minutes leads on self-serve pages. Weeks leads on sales and enterprise pages. | open |
| 4 | Who we lead with | None yet. Lead with the audience of the page being built. | open |
| 5 | Is "four steps" a brand claim? | Yes. Treat it as positioning, not a product detail. | open |
| 6 | Product names | "EAI CLI", not "Configurator CLI". "smart blocks" in lowercase. | open |
| 7 | Primary colour | Navy as the brand colour, cyan as the accent, near-black for CTAs. Blue `#1c84e0` is dropped. | open |
| 8 | Neutrals: warm or cool | Cool zinc. | open |
| 9 | Typeface | Inter for body, Inter Tight for display, JetBrains Mono for code. | open |
| 10 | Motion curves | Enter uses quint out, move uses drawer, spring only for success, shake only for errors. | open |
| 11 | Process, workflow or app | "process" for what the customer has, "workflow" for what EAI builds, "app" for what a user opens in the workspace. | open |

## Markers

| Marker | Meaning |
| --- | --- |
| `TODO` | Empty, needs writing. |
| `DECIDE` | Two or more answers exist today. The kit uses the default in the table above. |
| `(from site)` | Lifted from the current prototypes. A real value, but nobody has agreed to it yet. |

## For people: how we work

- **Discuss and decide in Notion:** the
  [EAI Brand Kit hub](https://app.notion.com/p/3d7cd7477dd581f3a494ed94302b9aed)
  mirrors this folder page for page.
- **Claude copies agreed changes into this folder.** Agents read the folder, not
  Notion.
- **Owners:**
  - Marketing: `agent/verbal/`
  - Design: `agent/visual/`
  - Website: the test below

## The test

Drop this folder into Claude Code, Cursor or Claude Design and give it one prompt:

> Generate an HTML landing page for Enterprise AI from the atomic kit in this
> folder. Read readme.md first.

The kit is done when the page that comes back needs no brand corrections, only a
magic trick. Save the result in `agent/visual/artifacts/web/`.

## Viewing it

Run `python3 serve.py 8899` from the repo root and open
<http://localhost:8899/brand_atomic_system/>. That page renders every file in
this folder.

This repo publishes to a public GitHub Pages site. Once the folder is merged to
`main`, anyone can read every file in it. Keep anything confidential out of it.
