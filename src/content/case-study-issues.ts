// Case studies as issues: the second case study style (?style=issue on a case study page), after
// Dia's release notes ("The Dia Lately"). Visual first, it leads with the work, then gives every
// study the same three chapters: the impact, the delight, and how AI made it possible.
//
// Every clip is a replay (public/replays), cropped to a region of the recording the way the hero
// reels are. Only what the case study already says goes in here: no new numbers.

type Region = { x: number; y: number; width: number; height: number }

export interface IssueClip {
  src: string
  region?: Region
}

// A clip on the work wall, placed as a % of the wall (left, top, width) and turned a little
export interface WallClip extends IssueClip {
  left: number
  top: number
  width: number
  tilt?: number
  label: string // for screen readers: what the clip shows
}

export interface CaseStudyIssue {
  id: string // the project's id
  number: number
  kicker: string // what the masthead says after the number: company and year
  title: string
  intro: string
  palette: number // the Shader Wall palette the painted canvases use (components/showcase/ShaderWallWidgets)
  wall: WallClip[] // the first one is the one phones get
  impact: {
    title: string
    aside: string
    numbers: { value: string; label: string }[]
    produced?: { clips: IssueClip[]; caption: string }
  }
  delight: {
    title: string
    aside: string
    tiles: (IssueClip & { caption: string })[] // the first is big, the next two stack beside it
  }
  ai: {
    title: string
    aside: string
    pair?: { clips: [IssueClip & { label: string }, IssueClip & { label: string }]; caption: string }
    // The prompt given to Claude Code, word for word, and what it changed. Without one, the dev
    // server shows an empty slot for it
    prompt?: { text: string; result: string; caption: string }
    team?: { before: string; after: string }
  }
  more?: { title: string; text: string }[]
}

export const ISSUES: CaseStudyIssue[] = [
  {
    id: 'rfp',
    number: 1,
    kicker: 'Enterprise AI, 2025',
    title: 'One designer, a whole tender',
    intro: 'Tenders usually get answered with a deck and some crossed fingers. We were a three-person startup against vendors with whole teams, so I built the product instead. Here’s what changed when AI did the heavy lifting.',
    palette: 0,
    wall: [
      { src: '/replays/rfp/overview.json', left: 22, top: 17, width: 57, label: 'The prototype: an application followed through the council’s workflow' },
      { src: '/replays/rfp/spot-rfi.json', region: { x: 216, y: 153, width: 1080, height: 644 }, left: 3, top: 28, width: 42, tilt: -4, label: 'A request for information, written from the issues ticked in' },
      { src: '/replays/rfp/workflow-determination.json', region: { x: 195, y: 43, width: 890, height: 714 }, left: 62, top: 6, width: 35, tilt: 3, label: 'The determination letter, drafted from the case' },
      { src: '/replays/rfp/spot-rewrite.json', region: { x: 802, y: 117, width: 555, height: 336 }, left: 64, top: 60, width: 32, tilt: -2.5, label: 'Rough notes rewritten in the council’s style' },
      { src: '/replays/rfp/spot-scenario.json', region: { x: 44, y: 253, width: 960, height: 323 }, left: 6, top: 72, width: 40, tilt: 2, label: 'Switching between three cases from one set of data' },
    ],
    impact: {
      title: 'A team’s worth of work, from one',
      aside: 'And the prototype didn’t get filed away after the tender. Engineering kept building on it.',
      numbers: [
        { value: '$2M', label: 'in deals won since, from this design' },
        { value: '1', label: 'designer, where it took 3 to 5 plus engineers' },
        { value: 'Days', label: 'not weeks, for a major feature' },
        { value: '2', label: 'markets from one prototype, English and Polish' },
      ],
      produced: {
        clips: [
          { src: '/replays/rfp/workflow-rfi.json' },
          { src: '/replays/rfp/workflow-determination.json', region: { x: 195, y: 43, width: 890, height: 714 } },
        ],
        caption: 'Not screens drawn in advance: a real request for information and a real determination, written from each case’s own data',
      },
    },
    delight: {
      title: 'Little moments that make it feel real',
      aside: 'A demo that does what you ask beats any slide. These are the details a static mock-up can’t show.',
      tiles: [
        { src: '/replays/rfp/spot-rfi.json', region: { x: 216, y: 153, width: 1080, height: 644 }, caption: 'Tick an issue in, and it’s written into the letter.' },
        { src: '/replays/rfp/spot-scenario.json', region: { x: 44, y: 253, width: 960, height: 323 }, caption: 'Switch the case, and every screen follows.' },
        { src: '/replays/rfp/spot-warsaw.json', region: { x: 171, y: 51, width: 1098, height: 798 }, caption: 'Set up for Warsaw, down to the law it cites.' },
      ],
    },
    ai: {
      title: 'The model isn’t faked. It’s in there.',
      aside: 'AI did two jobs: inside the prototype, a real model doing the work, and beside me, Claude Code building it.',
      pair: {
        clips: [
          { src: '/replays/rfp/spot-rewrite.json', region: { x: 802, y: 117, width: 555, height: 336 }, label: 'Rough notes, rewritten the council’s way' },
          { src: '/replays/rfp/spot-ask.json', region: { x: 800, y: 91, width: 558, height: 718 }, label: 'Questions answered from the applicant’s documents' },
        ],
        caption: 'Before: a click-through with the AI’s replies written in advance. Now: a real model, live, on whatever you type.',
      },
      team: {
        before: '3 to 5 designers, solution architects, engineers for any demo, and weeks of coordination',
        after: 'One designer with Claude Code, the founder for tender expertise, and days for a major feature',
      },
    },
    more: [
      { title: 'One set of data, every screen.', text: 'Seed data feeds the whole prototype, so a case number changes everywhere at once, and a launchpad starts it in any scenario.' },
      { title: 'From council scale to state scale.', text: 'The data hierarchy, roles and reporting restructured in the prototype itself, not reskinned.' },
      { title: 'Requirements that keep moving.', text: 'A new rule each week used to cascade through dozens of mock-ups. Now it’s across the prototype in minutes.' },
      { title: 'Workflows that end somewhere real.', text: 'Take any path in a live demo and it produces a real request for information or determination from that case.' },
    ],
  },
]

export const getIssue = (id: string) => ISSUES.find((i) => i.id === id)

// The other studies, as issues to read next: their number, a picture and the message as a title
export const OTHER_ISSUES: { id: string; number: number; label: string; title: string; image: string }[] = [
  { id: 'configurator', number: 2, label: 'Configurator', title: 'The prototype that changed the product', image: '/showcase/configurator.webp' },
  { id: 'html-brand-website', number: 3, label: 'Enterprise AI website', title: 'Ten homepages in a day', image: '/showcase/html-brand-website.webp' },
  { id: 'seek-case-study-1', number: 4, label: 'SEEK', title: 'The MVP missed, so we fixed the funnel', image: '/case-studies/seek-learning/select-a-course.webp' },
]
