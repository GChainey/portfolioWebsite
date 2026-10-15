# transitions.dev skill

An agent skill that teaches an AI about product motion: 32 production-ready CSS
transitions, each namespaced under `t-*` with semantic custom properties, plus
commands for auditing the motion already in a codebase.

<https://transitions.dev/skill.html> · built by Jakub Antalik ·
repo `Jakubantalik/transitions.dev`

**Use it for the recipes, not the values.** It's good at which transition suits a
dropdown, a modal or an icon swap. The curves and durations in `motion.json` and
`motion.css` are the brand. Anything we adopt from it gets written into those two
files, so agents without the skill still get it.

## It's already installed

Added to this repo in PR #69 (13 September 2026), alongside the first prototype to
use it.

| Where | What |
| --- | --- |
| `.agents/skills/transitions-dev/` | The main skill: `SKILL.md`, 32 numbered transition recipes, and `_root.css` with the full token scale. |
| `.agents/skills/transitions-polish/` | The Polish add-on: `SKILL.md`, `_refine-rules.md`, `_root.css`. |
| `workspace-ai-demo/assets/transitions-dev.css` | The first real use: toast, dropdown, modal and accordion hooks for the admin shell, imported by `admin.css`. |

To install it somewhere else: `npx skills add Jakubantalik/transitions.dev`, and
`npx skills add Jakubantalik/transitions.dev -s transitions-polish` for the add-on.
Pro recipes (`npx transitions-dev skill`) need a paid plan and nobody has bought one.

## Commands

| Command | What it does | Edits files? |
| --- | --- | --- |
| `transitions reveal` | Lists every transition in the skill as a numbered list. | No |
| `transitions review` | Scans the project for ad-hoc transitions, hardcoded durations and custom keyframes, then lists per file where a library transition would slot in. | No |
| `transitions apply` | Detects the best-fit transition for the current context, proposes it with a one-line rationale, and installs it once you confirm. Name one to skip detection: `transitions apply menu-dropdown`. | Yes, after you confirm |
| `transitions refine` | Finds hardcoded durations and suggests the motion token to use instead, deciding by each token's usage rather than its raw number. | No |
| `transitions polish` | Adds open/close, hover in/out and stagger/delay rules on top of `refine`, plus explicit distance coverage. Needs the Polish skill. | No |

## Where it disagrees with us

The skill ships its own scale, and the prototypes now use it. It doesn't line up
with ours. This is the live question inside `DECIDE` (Decision #10).

| Ours | Value | Theirs | Value |
| --- | --- | --- | --- |
| `--eai-dur-fast` | 120ms | `--duration-quick` | 150ms |
| `--eai-dur-base` | 200ms | `--duration-fast` | 250ms |
| `--eai-dur-slow` | 300ms | `--duration-medium` | 350ms |
| — | — | `--duration-stagger` / `micro` / `slow` / `very-slow` | 40 / 80 / 400 / 500ms |
| `--eai-ease-enter` | `cubic-bezier(0.22, 1, 0.36, 1)` | `--ease-smooth-out` | identical — the one thing that already agrees |
| `--eai-ease-move` | `cubic-bezier(0.32, 0.72, 0, 1)` | none | they use smooth-out for movement too |
| `--eai-ease-spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | `--ease-bounce` | `cubic-bezier(0.34, 1.36, 0.64, 1)`, a softer overshoot |
| `--eai-ease-shake` | `cubic-bezier(0.36, 0.07, 0.19, 0.97)` | error-state-shake recipe | per-segment 80/60ms, 6px with a 4px overshoot |

Our three durations came from what the prototypes already did. Theirs come from a
library designed as a set. Two of our three are 30ms faster than the nearest
equivalent, which is small enough that nobody would defend it and large enough that
the two systems can't both be right.

## What to do about it

1. Run `transitions review` and `transitions refine` across the prototypes. That's
   the fastest read on how much motion is ad-hoc today.
2. Settle Decision #10 with the skill's scale as a real third option, not just our
   three curves versus the six in use.
3. Whatever wins, write it into `motion.json` and `motion.css`, and either rename
   our tokens to theirs or keep ours and map them in this file.
4. Don't let the two drift further: every new prototype that pulls in
   `transitions-dev.css` is another vote for their scale by default.

Prompts that work:

- "Update dropdowns transition based on transitions-dev skill"
- "Update all icon swap transitions based on transitions-dev skill"
- "Update all modals transitions based on transitions-dev skill"

## Open questions

- `DECIDE` (Decision #10): our scale, theirs, or ours renamed to theirs.
- `TODO`: do we adopt their token names (`--duration-fast`, `--ease-smooth-out`) or keep `--eai-*` and map? Two names for one value is the thing the kit exists to stop.
- `TODO`: is `--eai-ease-move` worth keeping, given the library does movement with smooth-out?
- `TODO`: Pro plan, or stay on the free set?
