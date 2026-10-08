/** Content for /variants/show and /variants/think — sourced from projects, gallery, and changelog. */

export const VARIANT_POSITIONING =
  'Product designer in NYC, shaping enterprise AI at Enterprise AI, and shipping Dispatch and Shader Wall on the side.'

export const VARIANT_OPEN_TO =
  'Open to lead product design roles in NYC and remote-friendly teams building with AI — coffee or a call, no pitch required.'

export type ShowCard = {
  id: string
  title: string
  href: string
  external?: boolean
  span: 'hero' | 'wide' | 'tall' | 'default'
  /** Live iframe URL when set */
  liveSrc?: string
  /** Static background when no iframe */
  image?: string
  /** Optional metric — use null to omit; placeholder string when unknown */
  metric?: string | null
  hoverProblem: string
  hoverRole: string
}

const EAI_PROTO = 'https://eai-website.github.io/prototypes'

export const SHOW_CARDS: ShowCard[] = [
  {
    id: 'eai-shader',
    title: 'Chat-first on a live shader',
    href: `${EAI_PROTO}/sell-to-many/remix/14-dark-shader/index.html`,
    external: true,
    span: 'hero',
    liveSrc: `${EAI_PROTO}/sell-to-many/remix/14-dark-shader/index.html`,
    hoverProblem: 'The marketing homepage had to feel alive in user tests, not like a static deck.',
    hoverRole: 'Lead designer — 15 homepage directions, shipped as real HTML with Claude Code.',
  },
  {
    id: 'shader-wall',
    title: 'Shader Wall',
    href: 'https://www.shaderwall.com',
    external: true,
    span: 'default',
    liveSrc: 'https://www.shaderwall.com',
    metric: '[Shader Wall visitors TBD]',
    hoverProblem: 'Mac wallpapers should feel ambient, not like another settings panel.',
    hoverRole: 'Solo designer & builder — whole app runs in the browser at shaderwall.com.',
  },
  {
    id: 'dispatch',
    title: 'Dispatch',
    href: 'https://www.dispatchmac.com',
    external: true,
    span: 'default',
    image: '/products/dispatch.png',
    metric: '[Dispatch signups TBD]',
    hoverProblem: 'Sending a long read to Kindle took too many taps and broken layouts.',
    hoverRole: 'Solo designer & builder — native Mac app and browser extension, live at dispatchmac.com.',
  },
  {
    id: 'add-document',
    title: 'Showing AI what to look for',
    href: '/projects/add-document',
    span: 'wide',
    image: '/case-studies/add-document/hero.webp',
    hoverProblem: 'Teams could not write document rules because they could not see what the AI would check.',
    hoverRole: 'Lead designer — live document preview + state machine, 27 rounds with an AI coding agent.',
  },
  {
    id: 'seek-funnel',
    title: 'The MVP missed. So we fixed the funnel.',
    href: '/projects/seek-case-study-1',
    span: 'wide',
    image: '/case-studies/seek-learning/hero.webp',
    hoverProblem: 'A courses module on SEEK Career Advice underperformed after launch.',
    hoverRole: 'Lead designer on a team of seven — three funnel fixes took conversion from 9% to 20%.',
  },
  {
    id: 'eai-workspace',
    title: 'Signed-in workspace',
    href: `${EAI_PROTO}/workspace-ai-demo/build-web/ws-home.html?tenancy=seeded&workflowOption=1`,
    external: true,
    span: 'default',
    liveSrc: `${EAI_PROTO}/workspace-ai-demo/build-web/ws-home.html?tenancy=seeded&workflowOption=1`,
    hoverProblem: 'Enterprise buyers needed to see a credible product surface, not slides.',
    hoverRole: 'Lead designer — seeded HTML prototypes with real state for RFPs and discovery.',
  },
]

export type DecisionRecord = {
  projectId: string
  title: string
  href: string
  problem: string
  aiDid: string
  rejected: string
  outcome: string
}

export const DECISION_RECORDS: DecisionRecord[] = [
  {
    projectId: 'add-document',
    title: 'Showing AI what to look for',
    href: '/projects/add-document',
    problem: 'Setup for AI Document Review was a stack of text boxes; people did not know what a rule was for.',
    aiDid: 'Claude Code wrote every line — two-column layout, lo-fi document preview, and a reviewable state machine over 27 logged rounds.',
    rejected: 'Stacked labels without a preview; blue focus rings and green ticks that read as “done” before setup was; a growing dialog instead of a scrollable rules table.',
    outcome: 'Rules became places on a drawn document; the team could link any combination of document, rules, and focus in reviews.',
  },
  {
    projectId: 'seek-case-study-1',
    title: 'The MVP missed. So we fixed the funnel.',
    href: '/projects/seek-case-study-1',
    problem: 'The courses module on Career Advice pages missed conversion targets after the MVP shipped.',
    aiDid: 'Not an AI case — classic discovery: mapped the five-stage funnel and tied one assumption to each leak.',
    rejected: 'A full redesign or restart; instead, three small fixes (All tab default, richer cards, desktop fly-out).',
    outcome: 'Education conversion 9% → 20% (goal 12%); paid connections +34% (goal 10–15%); scaled to 3,000+ role pages.',
  },
  {
    projectId: 'eai-settings',
    title: 'Two levels of settings without getting lost',
    href: '/projects/eai-settings',
    problem: 'Workspace settings listed system parts; people could not turn on AI features in their apps.',
    aiDid: 'AI coding agents generated working HTML prototypes with seeded tenancies — feature toggles and app settings stayed in sync.',
    rejected: 'Organising settings by backend parts (Knowledge, Documents, model profiles…); identical sidebars for workspace and app.',
    outcome: 'Features grouped by job; inverted colours + workspace settings as a dialog — 5/5 found the feature in unmoderated tests (round one).',
  },
]

export const THINK_INTRO = [
  'I still start in Figma and Paper for structure and taste, then move the idea into Cursor and Claude Code so the artefact is real HTML with real state.',
  'That shift is not “vibe coding” for me — it is how I run discovery, win RFPs, and give engineers something they can react to.',
  'When AI drafts UI, my job is judgment: spacing, words, what to reject, and when a prototype needs a state machine instead of another screenshot.',
  'This site, Dispatch, Shader Wall, and the Enterprise AI prototypes in the gallery are all built that way.',
]

export const DESIGN_TO_CODE_DEMO = {
  designImage: '/variants/shots/shapeshifter.jpg',
  designCaption: 'Paper explorations for the Enterprise AI marketing site (sell-to-many remix).',
  liveSrc: `${EAI_PROTO}/sell-to-many/remix/14-dark-shader/index.html`,
  liveCaption: 'Same programme shipped as live HTML — chat-first layout on a running shader, user tested.',
}
