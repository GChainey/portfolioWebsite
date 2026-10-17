import type { ReelScene } from '@/components/replay/ReplayReel'
import type { ShowcaseScene } from '@/components/showcase/ShowcaseReel'
import { getProjectById } from '@/content/projects'

// The work the homepage showcases: three products I built and three case studies of using AI.
// Every piece has a reel (replays, or video and a live site where a replay can't capture it),
// a poster, and a short read: what it does and the thinking behind it. The homepage variants
// (components/showcase) and the sizzle reels (content/sizzle.ts) are all built from this.

export interface WorkItem {
  id: string
  kind: 'product' | 'case-study'
  name: string // short: "Shader Wall", "Daisy Assess"
  title: string // the headline
  kicker: string
  summary: string // one line
  href: string
  external?: boolean
  cta: string
  accent: string // a colour of its own, for the variants that wash the page in it
  poster: string // 16:10 still
  reel: ShowcaseScene[]
  features: string[]
  thinking: string // why it was made this way, and what AI changed
  stats?: { value: string; label: string }[]
}

const rfp = getProjectById('rfp')!

// Showcase scenes from a case study's own hero reel: the same clips and titles, its first subtitle
// as the kicker, a tall crop beside its title and a wide one under it. Camera moves aren't carried
// over. Keeps the showcase in step when the case study's reel is re-cut.
export function fromHeroReel(scenes: ReelScene[]): ShowcaseScene[] {
  return scenes
    .filter((s) => s.src)
    .map((s) => ({
      src: s.src, region: s.region, from: s.from, to: s.to, rate: s.rate, title: s.title,
      kicker: s.notes?.[0]?.text,
      layout: s.region && s.region.height > s.region.width ? 'side' : 'stack',
    }))
}
const website = getProjectById('html-brand-website')!

const SITE_VIDEO = website.heroVideo!

export const WORK: WorkItem[] = [
  {
    id: 'shader-wall',
    kind: 'product',
    name: 'Shader Wall',
    title: 'Your Mac desktop, alive',
    kicker: 'Product · macOS',
    summary: 'A living shader behind your windows. The whole app runs in your browser.',
    href: 'https://www.shaderwall.com',
    external: true,
    cta: 'Try Shader Wall',
    accent: '#c026d3',
    poster: '/showcase/shader-wall.webp',
    // A live site: the shader is a canvas, which a replay can't capture
    reel: [{ site: 'https://www.shaderwall.com', hold: 12, layout: 'full', kicker: 'Shader Wall', title: 'Your Mac desktop, alive' }],
    features: [
      'Presets from mesh gradients to liquid metal, each with live controls',
      'Speed, distortion, swirl, grain and colour, tuned while you watch',
      'The site is the app: a Mac desktop in the browser you can try before you install',
    ],
    thinking: 'The fastest way to sell a wallpaper is to let people live with it. So the landing page isn\'t screenshots; it runs the whole app on a Mac desktop, in the browser.',
  },
  {
    id: 'dispatch',
    kind: 'product',
    name: 'Dispatch',
    title: 'Send articles to your Kindle in one click',
    kicker: 'Product · Mac and browser',
    summary: 'From your browser, your Mac or Grokbot, onto your Kindle.',
    href: 'https://www.dispatchmac.com',
    external: true,
    cta: 'Visit Dispatch',
    accent: '#2563eb',
    poster: '/showcase/dispatch.webp',
    reel: [
      { src: '/replays/products/dispatch.json', from: 1.2, to: 9.4, layout: 'full', kicker: 'Dispatch', title: 'Press Dispatch. It lands on your Kindle.' },
      { src: '/replays/products/dispatch.json', from: 13, to: 18.6, layout: 'full', live: true, kicker: 'Grokbot, with Jev', title: 'Your newsletters, read for you first' },
    ],
    features: [
      'One click from any page, even one you\'re signed in to',
      'Grokbot reads your newsletters with Jev: dispatch, skip, or skip and unsubscribe',
      'Collections with drawn covers, sent as a single issue',
      'Your library stays on your Mac. No Dispatch account, no Dispatch server',
    ],
    thinking: 'Reading on a Kindle beats reading in a tab, but getting an article there took five steps. Dispatch makes it one, then lets a classifier decide which newsletters are worth sending at all.',
    stats: [{ value: '1 click', label: 'from page to Kindle' }],
  },
  {
    id: 'thesis',
    kind: 'product',
    name: 'Thesis',
    title: 'Good product thinking at the speed you ship',
    kicker: 'Product · for product teams',
    summary: 'Every claim in a plan is a bet. Thesis tests them all at once.',
    href: 'https://thesis-phi-self.vercel.app',
    external: true,
    cta: 'Visit Thesis',
    accent: '#f59e0b',
    poster: '/showcase/thesis.webp',
    reel: [
      { src: '/replays/products/thesis.json', from: 0.8, to: 7.2, layout: 'full', kicker: 'Thesis', title: 'Every underlined sentence is a bet' },
      { src: '/replays/products/thesis.json', from: 9.6, to: 16.2, layout: 'full', kicker: 'Parallel testing', title: 'Test every bet at once' },
      { src: '/replays/products/thesis.json', from: 18, to: 25.4, layout: 'full', kicker: 'Opportunity sizing', title: 'Know what a bet is worth before you build it' },
    ],
    features: [
      'Plans written as sentences, and every claim mappable and testable',
      'AI drafts the tests and runs them side by side',
      'Evidence arrives from Amplitude, PostHog, Linear and Slack on its own',
      'Your own agents work in it over MCP',
    ],
    thinking: 'Careful product thinking shouldn\'t cost a sprint. AI does the slow parts, drafting tests and gathering evidence, so a team can check the whole thesis in days instead of a quarter.',
    stats: [{ value: '34 → 9', label: 'days to test six bets' }],
  },
  {
    id: 'rfp',
    kind: 'case-study',
    name: 'Daisy Assess',
    title: 'Utilising AI to Help Sales Win Deals',
    kicker: 'Case study · Enterprise AI',
    summary: 'A state tender, three people, and a working product instead of mock-ups.',
    href: '/projects/rfp',
    cta: 'Read the case study',
    accent: '#16a34a',
    poster: '/showcase/rfp.webp',
    reel: fromHeroReel(rfp.heroReel!),
    features: [
      'One set of seed data feeds every screen. Switch the case and everything follows',
      'A live model rewrites rough notes into council wording, and answers from the applicant\'s documents',
      'Requirements that moved every week, across the prototype in minutes with Claude Code',
      'Workflows that end in a real letter, written from the case',
    ],
    thinking: 'Up against vendors with whole teams, a deck of mock-ups wasn\'t going to win. So I built ProductLite, the product before the product, in code. It became the demo and the reference engineering built from.',
    stats: [{ value: '1', label: 'designer, where it would have taken 3 to 5' }],
  },
  {
    id: 'html-brand-website',
    kind: 'case-study',
    name: 'Enterprise AI site',
    title: 'A Website Built from an HTML Brand',
    kicker: 'Case study · Brand and web',
    summary: 'One tagline, ten wild variations, and the brand as files an agent reads.',
    href: '/projects/html-brand-website',
    cta: 'Read the case study',
    accent: '#0891b2',
    poster: '/showcase/html-brand-website.webp',
    reel: [
      { video: SITE_VIDEO, from: 0.5, to: 9, layout: 'full', kicker: 'Enterprise AI', title: 'One line in. A four-step app out.' },
      { video: SITE_VIDEO, from: 10, to: 19, layout: 'full', kicker: 'Build once. Sell to many.', title: 'Build it for Nike. Sell it to Qantas.' },
      { video: SITE_VIDEO, from: 30, to: 35.5, layout: 'full', kicker: 'The maths', title: 'You build it once. They pay every time.' },
      { video: SITE_VIDEO, from: 40, to: 48, layout: 'full', kicker: 'Gofer', title: 'Messy work, mapped onto four steps' },
    ],
    features: [
      'The brand as files an agent builds from, not a PDF',
      'Ten versions of the page in a day, each louder than the last',
      'The best idea from a few, kept in one page',
      'Two rounds of testing: could people say the message back?',
    ],
    thinking: 'People do the thinking at the start and the judgement at the end; agents fill in the middle. I wrote the inputs, and the copy was judged by whether people could repeat it, not by opinion.',
    stats: [{ value: '10', label: 'variations in a day' }, { value: '12', label: 'people across two tests' }],
  },
  {
    id: 'configurator',
    kind: 'case-study',
    name: 'Configurator',
    title: 'Testing Whether It Works, Not Just How It Looks',
    kicker: 'Case study · No-code AI',
    summary: 'A no-code builder, prototyped on live models.',
    href: '/projects/configurator',
    cta: 'Read the case study',
    accent: '#ea580c',
    poster: '/showcase/configurator.webp',
    reel: [
      { src: '/replays/configurator/process-card.json', region: { x: 0, y: 0, width: 470, height: 600 }, from: 0.5, to: 14, rate: 1.5, layout: 'side', live: true, kicker: 'Live model', title: 'A messy description in. A working brief out.' },
      { src: '/replays/configurator/four-steps.json', region: { x: 0, y: 0, width: 470, height: 480 }, from: 1, to: 15, rate: 1.6, layout: 'side', live: true, kicker: 'Live model', title: 'Eight steps today, mapped onto four' },
      { src: '/replays/configurator/edit.json', region: { x: 0, y: 0, width: 1250, height: 700 }, from: 0.3, to: 8, rate: 1.2, kicker: 'Structure, not code', title: 'Ask for a change. The app follows.' },
      { src: '/replays/configurator/brand.json', region: { x: 0, y: 0, width: 1600, height: 720 }, from: 4, to: 24, rate: 2, kicker: 'From one name', title: 'One app, three clients, each in their brand' },
    ],
    features: [
      'A live model reads how the job is done today and writes the brief',
      'Every step of today\'s process mapped onto four',
      'Show prompt on every output: edit it, run it again, watch the screen change',
      'The client\'s brand, read from their site from one name',
    ],
    thinking: 'A mock-up fakes the model\'s answers, so it hides the biggest risk. Running it on real models showed what broke, and the idea changed: select, don\'t generate.',
    stats: [{ value: '6s vs 21s', label: 'GPT-4.1 against GPT-5 mini' }],
  },
]

export const PRODUCTS = WORK.filter((w) => w.kind === 'product')
export const CASE_STUDIES = WORK.filter((w) => w.kind === 'case-study')
