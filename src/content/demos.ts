// The /demos page: a short scroll of real prototypes, each driven by the buttons beside it.
// A demo never redraws a screen. It turns the current selection into the query string the
// prototype already understands and points a frame at it, so nothing here can go stale.

// Not in production yet, for the same reason as the gallery (GALLERY_LIVE): it shows the same
// unreleased work. Flip to launch.
export const DEMOS_LIVE = process.env.NODE_ENV === 'development'

export type Selection = Record<string, string>

export interface DemoOption {
  id: string
  label: string
}

export interface DemoAxis {
  key: string
  label: string
  // A function when the choices depend on an earlier axis (a screen's own failures, say).
  options: DemoOption[] | ((selection: Selection) => DemoOption[])
}

interface DemoBase {
  id: string
  // Short name for the dock
  nav: string
  kicker: string
  title: string
  blurb: string
  // One line of numbers, shown under the controls
  facts: string
}

export interface FrameDemo extends DemoBase {
  kind: 'frame'
  axes: DemoAxis[]
  // Where the demo opens, when that isn't the first option of every axis
  initial?: Selection
  // The window the prototype was designed for; the frame scales it to fit.
  width: number
  height: number
  url: (selection: Selection) => string
}

export interface TimelapseDemo extends DemoBase {
  kind: 'timelapse'
}

export type Demo = FrameDemo | TimelapseDemo

const PROTOTYPES = 'https://eai-website.github.io/prototypes'

/* The installer's screens and the failures each one can show, from setup-states/ui/state-machine.js. */
const INSTALLER_SCREENS: (DemoOption & { faults: string[] })[] = [
  { id: 'start', label: 'Welcome', faults: [] },
  { id: 'signin', label: 'Sign in', faults: ['prereq', 'network'] },
  { id: 'welcome', label: 'Signed in', faults: ['callback'] },
  { id: 'setup', label: 'Set up', faults: ['workspace', 'name'] },
  { id: 'running', label: 'Creating', faults: ['init'] },
  { id: 'done', label: 'Choose a tool', faults: ['install', 'detect'] },
  { id: 'handoff', label: 'Hand-off', faults: ['launch'] },
  { id: 'built', label: 'Built', faults: [] },
]

const INSTALLER_FAULTS: Record<string, string> = {
  prereq: 'Git won’t install',
  network: 'Can’t reach EAI',
  callback: 'Browser didn’t come back',
  workspace: 'No workspace',
  name: 'Name is taken',
  init: 'App couldn’t be created',
  install: 'Download won’t open',
  detect: 'Tool check didn’t finish',
  launch: 'Tool won’t open',
}

export const DEMOS: Demo[] = [
  {
    id: 'brand',
    kind: 'frame',
    nav: 'Brand',
    kicker: 'Brand exploration',
    title: 'One app, any client',
    blurb: 'Pick a client and the same app wears their logo, their colours and their voice. The wiring underneath doesn’t change.',
    facts: '4 brands · 1 codebase',
    axes: [
      {
        key: 'wear',
        label: 'Client',
        options: [
          { id: 'house', label: 'Enterprise AI' },
          { id: 'nike', label: 'Nike' },
          { id: 'apple', label: 'Apple' },
          { id: 'commbank', label: 'CommBank' },
        ],
      },
    ],
    width: 1280,
    height: 800,
    url: ({ wear }) => {
      // autoplay=0 stops the page typing "Apple" into itself when it loads
      const q = new URLSearchParams({ autoplay: '0' })
      if (wear !== 'house') q.set('wear', wear)
      return `${PROTOTYPES}/sell-to-many/remix/04-shapeshifter/?${q}`
    },
  },
  {
    id: 'states',
    kind: 'frame',
    nav: 'States',
    kicker: 'State machine',
    title: 'Every screen, and every way it breaks',
    blurb: 'The installer’s real UI, driven by its own URL. Every state has a link, so a review can point at the exact one instead of asking “but what happens when…”.',
    facts: `${INSTALLER_SCREENS.length} screens · ${Object.keys(INSTALLER_FAULTS).length} failures · 3 platforms`,
    axes: [
      {
        key: 'platform',
        label: 'Computer',
        options: [
          { id: 'macos', label: 'macOS' },
          { id: 'windows', label: 'Windows' },
          { id: 'linux', label: 'Linux' },
        ],
      },
      { key: 'screen', label: 'Screen', options: INSTALLER_SCREENS.map(({ id, label }) => ({ id, label })) },
      {
        key: 'fault',
        label: 'State',
        options: ({ screen }) => [
          { id: 'ok', label: 'Working' },
          ...(INSTALLER_SCREENS.find((s) => s.id === screen)?.faults ?? []).map((id) => ({ id, label: INSTALLER_FAULTS[id] })),
        ],
      },
    ],
    // Open on a failure: the broken states are the point
    initial: { screen: 'signin', fault: 'network' },
    // The signed app's window size
    width: 1100,
    height: 720,
    url: ({ platform, screen, fault }) => {
      const q = new URLSearchParams({ screen })
      if (fault !== 'ok') q.set('fault', fault)
      if (platform !== 'macos') q.set('platform', platform)
      // Fixtures the statemachine's own rail sends with these screens
      if (fault === 'prereq') q.set('step', 'git')
      if (screen === 'done' || screen === 'handoff') q.set('installed', 'none')
      if (screen === 'running') q.set('reached', 'template')
      return `${PROTOTYPES}/setup-states/ui/index.html?${q}`
    },
  },
  {
    id: 'shell',
    kind: 'frame',
    nav: 'Layout',
    kicker: 'Design decision',
    title: 'Settle it with a toggle',
    blurb: 'Flat or nested navigation, light or dark. Both options are built, so the choice gets made on the real thing rather than on two mock-ups.',
    facts: '2 screens · 2 layouts · 2 themes',
    axes: [
      {
        key: 'screen',
        label: 'Screen',
        options: [
          { id: 'app', label: 'App settings' },
          { id: 'workspace', label: 'Workspace' },
        ],
      },
      {
        key: 'recipe',
        label: 'Layout',
        options: [
          { id: 'nested', label: 'Nested' },
          { id: 'flat', label: 'Flat' },
        ],
      },
      {
        key: 'theme',
        label: 'Theme',
        options: [
          { id: 'light', label: 'Light' },
          { id: 'dark', label: 'Dark' },
        ],
      },
    ],
    width: 1280,
    height: 800,
    url: ({ screen, recipe, theme }) => {
      const q = new URLSearchParams({ embed: '1', recipe, theme, tenancy: 'seeded' })
      if (screen === 'app') {
        q.set('app', 'kyc-onboarding')
        q.set('workflowOption', '1')
        if (recipe === 'nested') q.set('appRail', 'expanded')
      }
      return `${PROTOTYPES}/workspace-ai-demo/build-web/${screen === 'app' ? 'app-overview' : 'ws-home'}.html?${q}`
    },
  },
  {
    id: 'rounds',
    kind: 'timelapse',
    nav: 'Rounds',
    kicker: 'Iteration',
    title: 'One dialog, round by round',
    blurb: 'Every piece of feedback I gave the coding agent on one dialog, and the screenshot it took after each. Scrub through, or let it play.',
    facts: '',
  },
  {
    id: 'tour',
    kind: 'frame',
    nav: 'Tour',
    kicker: 'Self-running demo',
    title: 'A prototype that presents itself',
    blurb: 'The same dialog, as a state machine. Pick options on its left, or press a demo and it walks through the feature on its own.',
    facts: '6 axes · every combination has a URL',
    axes: [
      {
        key: 'demo',
        label: 'Play',
        options: [
          { id: 'explore', label: 'Explore' },
          { id: '1', label: 'Feature demo' },
          { id: 'states', label: 'State machine tour' },
        ],
      },
    ],
    width: 1280,
    height: 900,
    url: ({ demo }) => `/case-studies/add-document/index.html${demo === 'explore' ? '' : `?demo=${demo}`}`,
  },
  {
    id: 'directions',
    kind: 'frame',
    nav: 'Directions',
    kicker: 'Brand exploration',
    title: 'Three directions for this site',
    blurb: 'The same content as three homepages. Each is a real page, so they can be judged in a browser and not on an artboard.',
    facts: '3 homepages · same content',
    axes: [
      {
        key: 'variant',
        label: 'Direction',
        options: [
          { id: 'current', label: 'Current' },
          { id: 'brand', label: 'Brand' },
          { id: 'showcase', label: 'Showcase' },
        ],
      },
    ],
    width: 1280,
    height: 800,
    url: ({ variant }) => (variant === 'current' ? '/' : `/variants/${variant}`),
  },
]
