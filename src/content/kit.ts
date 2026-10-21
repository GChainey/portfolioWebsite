// The component wall: small pieces of the Enterprise AI products, stacked like a component
// library. Each card is rebuilt from the real app (its labels, data and styling) and opens a
// clip of that piece working inside the app it came from.
//
// Not on the live site yet: only the dev server and Vercel preview builds show it, never
// production. See the parked index (src/content/parked.ts).
export const KIT_LIVE = process.env.NODE_ENV === 'development' || process.env.VERCEL_ENV === 'preview'

type Region = { x: number; y: number; width: number; height: number }

export interface KitApp {
  id: string
  name: string
  summary: string
  href: string // the case study
}

export const KIT_APPS: Record<string, KitApp> = {
  assess: {
    id: 'assess',
    name: 'Daisy Assess',
    summary: 'Software councils use to assess building applications. Built for a state tender, clickable end to end.',
    href: '/projects/rfp',
  },
  configurator: {
    id: 'configurator',
    name: 'Configurator',
    summary: 'Describe how a job gets done today and get a working app back, on live models.',
    href: '/projects/configurator',
  },
  settings: {
    id: 'settings',
    name: 'Workspace settings',
    summary: 'Where a workspace switches on AI features for its apps, without losing track of which level it is on.',
    href: '/projects/eai-settings',
  },
  'add-document': {
    id: 'add-document',
    name: 'AI Document Review',
    summary: 'Tell AI what to check on every upload. The document is drawn, and each rule lights up what it reads.',
    href: '/projects/add-document',
  },
}

// What opens when a card is clicked: a recording of the piece in its app, or the live prototype
export type KitClip =
  | { replay: string; region?: Region }
  | { frame: string; width: number; height: number }

export interface KitCard {
  id: string // also the component's key in KIT_CARDS (components/kit/cards.tsx)
  app: keyof typeof KIT_APPS
  title: string // what the piece is, in the dialog
  clip: KitClip
  h: number // rough height in px at 260 wide, for balancing the columns
}

// In reading order: the columns are filled left to right, each card going under the shortest
export const KIT: KitCard[] = [
  { id: 'case-time', app: 'assess', title: 'How long cases take, against the council\u2019s target', clip: { replay: '/replays/rfp/overview.json' }, h: 170 },
  { id: 'template-match', app: 'configurator', title: 'Jev picks the closest template, and says how sure it is', clip: { replay: '/replays/configurator/jev-match.json' }, h: 300 },
  { id: 'settings-nav', app: 'settings', title: 'Workspace settings, grouped by what they do', clip: { replay: '/replays/eai-settings/features.json' }, h: 330 },
  { id: 'id-preview', app: 'add-document', title: 'What AI looks at: the rule in focus lights up its field', clip: { frame: '/case-studies/add-document/index.html?demo=1', width: 1280, height: 860 }, h: 200 },
  { id: 'queue', app: 'assess', title: 'The caseload, with what each application is waiting on', clip: { replay: '/replays/rfp/overview.json' }, h: 290 },
  { id: 'rfi', app: 'assess', title: 'Every reviewer\u2019s questions, in one letter', clip: { replay: '/replays/rfp/spot-rfi.json', region: { x: 216, y: 153, width: 1080, height: 644 } }, h: 330 },
  { id: 'steps', app: 'configurator', title: 'The same four steps, in each client\u2019s brand', clip: { replay: '/replays/configurator/four-steps.json' }, h: 150 },
  { id: 'assistant', app: 'assess', title: 'Rough notes rewritten to the council\u2019s report standard', clip: { replay: '/replays/rfp/spot-rewrite.json', region: { x: 802, y: 117, width: 555, height: 336 } }, h: 270 },
  { id: 'models', app: 'configurator', title: 'Which model is good enough, timed', clip: { replay: '/replays/configurator/models.json' }, h: 250 },
  { id: 'preferences', app: 'settings', title: 'Workspace preferences', clip: { replay: '/replays/eai-settings/nested.json' }, h: 150 },
  { id: 'rules', app: 'add-document', title: 'Rules: one check AI runs on every upload', clip: { frame: '/case-studies/add-document/index.html?demo=1', width: 1280, height: 860 }, h: 270 },
  { id: 'determination', app: 'assess', title: 'The approval letter, drafted from the assessment', clip: { replay: '/replays/rfp/workflow-determination.json', region: { x: 195, y: 43, width: 890, height: 714 } }, h: 340 },
  { id: 'brand-read', app: 'configurator', title: 'Same app, next client: the brand read from their site', clip: { replay: '/replays/configurator/brand.json' }, h: 190 },
  { id: 'feature-table', app: 'settings', title: 'Switch a feature on for an app, then set it up', clip: { replay: '/replays/eai-settings/dialog.json' }, h: 210 },
  { id: 'qr', app: 'configurator', title: 'Open the app on a phone', clip: { replay: '/replays/configurator/qr.json' }, h: 250 },
  { id: 'clearance', app: 'assess', title: 'The site\u2019s checks, done before anyone opens the case', clip: { replay: '/replays/rfp/overview.json' }, h: 290 },
  { id: 'process-card', app: 'configurator', title: 'A description in. The business process back', clip: { replay: '/replays/configurator/process-card.json' }, h: 250 },
  { id: 'workload', app: 'assess', title: 'Who is over capacity', clip: { replay: '/replays/rfp/overview.json' }, h: 170 },
  { id: 'application', app: 'assess', title: 'Application details, filled from the lodgement', clip: { replay: '/replays/rfp/spot-suggest.json', region: { x: 201, y: 51, width: 1038, height: 798 } }, h: 280 },
  { id: 'metrics', app: 'settings', title: 'How the workspace\u2019s apps are doing', clip: { replay: '/replays/eai-settings/features.json' }, h: 230 },
  { id: 'form-fields', app: 'configurator', title: 'The form they fill in, edited in place', clip: { replay: '/replays/configurator/edit.json' }, h: 270 },
  { id: 'ask', app: 'assess', title: 'Ask the application a question', clip: { replay: '/replays/rfp/spot-ask.json', region: { x: 800, y: 91, width: 558, height: 718 } }, h: 210 },
  { id: 'client-assistant', app: 'configurator', title: 'Each client gets their own assistant, in their voice', clip: { replay: '/replays/configurator/brand.json' }, h: 220 },
  { id: 'status', app: 'assess', title: 'Search and filter the caseload', clip: { replay: '/replays/rfp/overview.json' }, h: 140 },
]
