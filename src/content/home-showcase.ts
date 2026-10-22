import type { ShowcaseScene } from '@/components/showcase/ShowcaseReel'
import { VISUALS } from '@/content/visuals'

// The homepage as the Paper frame "website · products hero + 3 details": each section steps
// through its pieces one at a time. A piece is shown big, with three details of how it works
// under it, and they all change together when you move to the next piece.
//
// Borders: a product showcase (a product, a landing page, a game) is already busy enough to
// stand on the page as it is. A demo of the work (a case study, a detail) sits in a soft frame
// of its piece's own colour.

// Hand-built details (components/showcase/HomeWidgets): Shader Wall's canvas can't be recorded, and
// SEEK's funnel is a diagram the case study draws itself
export type Widget = 'sliders' | 'agent' | 'presets' | 'seek-funnel' | 'seek-ab'

export interface ShowcaseDetail {
  title: string
  scene?: ShowcaseScene
  widget?: Widget
  backdrop?: number // set on a shader (a Shader Wall palette), the clip inset on it like a window
  plain?: boolean // no window round it: a dialog or a diagram stands on the card's colour by itself
}

export interface ShowcasePiece {
  id: string
  tab?: string // its name in the section's tabs, when the title is a sentence
  title: string
  summary: string
  caseStudy?: string
  visit?: { label: string; href: string }
  more?: { label: string; href: string } // a page on this site that isn't a case study
  hero: ShowcaseScene
  framed: boolean // the hero in its colour (a demo) or bare (a showcase)
  backdrop?: number // the hero on a moving shader instead (a Shader Wall palette)
  matte?: boolean // the hero on a plain mat of its colour (its recorded page cleared, so only the app shows)
  heroPlain?: boolean // the hero stands on its frame's colour with no window round it
  tint: string // the piece's colour: its frames and its details
  impact?: { value?: string; label: string }[] // only what the case study already says
  details: ShowcaseDetail[]
}

export interface ShowcaseSection {
  id: string
  title: string
  layout: 'feature' | 'bleed' // a piece at a time with its details, or the ¾ bleed track
  pieces: ShowcasePiece[]
  quote?: string // a colleague's words after the section (content/testimonials.ts name)
}

const scene = (id: string): ShowcaseScene => {
  const v = VISUALS.find((x) => x.id === id)
  if (!v) throw new Error(`No visual "${id}"`)
  return v.scene
}
const title = (id: string) => VISUALS.find((x) => x.id === id)!.title
// A detail that is a whole visual, under its own title
const visual = (id: string, as?: string): ShowcaseDetail => ({ title: as ?? title(id), scene: scene(id) })
// A crop of a replay: region is in the recording's own pixels, kept at 16:10 so it fills the card
const crop = (src: string, from: number, to: number, region: { x: number; y: number; width: number; height: number }): ShowcaseScene => ({ src, from, to, region, layout: 'full', title: '' })
const video = (src: string, from: number, to: number, full = true): ShowcaseScene => ({ video: src, from, to, layout: full ? 'full' : undefined, title: '' })
// Just the dialog out of a recording of it on a grey page: fitted, to float on the card
const dialog = (src: string, from: number, to: number, region: { x: number; y: number; width: number; height: number }): ShowcaseScene => ({ video: src, from, to, region, title: '' })
const BP = '/case-studies/bestpractice-booking'
const BP_DIALOG = { x: 38, y: 70, width: 1496, height: 858 } // the two-panel dialog, in the 1600x986 recordings

// Shader Wall: a replay with the real shader drawn live (replay/liveShaders), not the recorded stills
const shaderWall = (src: string, from: number, to: number, region?: { x: number; y: number; width: number; height: number }): ShowcaseScene =>
  ({ src, from, to, layout: 'full', title: '', liveShader: true, ...(region ? { region } : {}) })

// Pieces that aren't ready yet show on the dev server only
const DRAFTS_LIVE = process.env.NODE_ENV === 'development'

const DISPATCH = '/replays/products/dispatch-app.json'
const THESIS = '/replays/products/thesis-app.json'
// The product site's page hidden, background and all, so only the windows named (the app, and
// Dispatch's Kindle) show, straight on the mat. The page's own decoration, invisible on black,
// showed on a light colour. Their frosted glass is made solid, now there's nothing behind it
const onlyWindows = (...ids: string[]) => [
  'html, body { background: transparent !important; visibility: hidden !important; scrollbar-width: none !important; }',
  `${ids.map((id) => `#${id}`).join(', ')} { visibility: visible !important; }`,
  `${ids.map((id) => `#${id}.tw`).join(', ')} { background: rgb(23, 23, 25) !important; backdrop-filter: none !important; }`,
  // A shadow that fits in the margin: the site's 90px one was cut off square at the crop's edge
  `${ids.map((id) => `#${id}`).join(', ')} { box-shadow: 0 0 0 0.5px rgba(0, 0, 0, 0.6), 0 14px 28px -10px rgba(0, 0, 0, 0.4) !important; }`,
]
const dispatchApp = (src: string, from: number, to: number, region: { x: number; y: number; width: number; height: number }, ...ids: string[]): ShowcaseScene =>
  ({ ...crop(src, from, to, region), scheme: 'dark', css: onlyWindows(...ids) })

export const SHOWCASE_SECTIONS: ShowcaseSection[] = [
  {
    id: 'products',
    title: 'Products',
    layout: 'feature',
    quote: 'Winnie Bamra',
    pieces: [
      {
        id: 'shader-wall', title: 'Shader Wall', summary: 'An agentic friendly native macOS app to set and create shaders as your background.',
        visit: { label: 'Visit Shader Wall', href: 'https://www.shaderwall.com' },
        // The whole desktop, clicking through the presets
        hero: shaderWall('/replays/products/shaderwall-presets.json', 0.5, 15), framed: false, tint: '#ECE7F5',
        details: [
          // Recorded from the app on shaderwall.com. Its WebGL is drawn live from the recorded settings
          { title: 'Tune it with sliders', scene: shaderWall('/replays/products/shaderwall-sliders.json', 0.5, 14.7, { x: 286, y: 97, width: 968, height: 605 }) },
          { title: 'Or ask your agent, over MCP', scene: shaderWall('/replays/products/shaderwall-agent.json', 0, 10.4, { x: 4, y: 18, width: 1248, height: 780 }) },
          { title: 'Click through the presets', scene: shaderWall('/replays/products/shaderwall-presets.json', 0.5, 15, { x: 286, y: 97, width: 968, height: 605 }) },
        ],
      },
      {
        id: 'dispatch', title: 'Dispatch', summary: 'Send articles to your Kindle in one click, from your browser, your Mac or a bot that reads your newsletters.',
        visit: { label: 'Visit Dispatch', href: 'https://www.dispatchmac.com' },
        // The app (and its Kindle) with an even margin; its frosted window made solid now there's nothing behind it
        hero: dispatchApp(DISPATCH, 0.8, 11.6, { x: 96, y: 36, width: 1322, height: 826 }, 'hero-app', 'hero-kindle'), framed: false, matte: true, tint: '#E3ECF7',
        details: [
          // Recorded from dispatchmac.com's own sections, its demo pointer stopped so the clicks are mine
          // Each the whole window (and its Kindle) with an even margin, straight on the card's colour
          { title: 'Use it with Grokbot', plain: true, scene: dispatchApp('/replays/products/dispatch-grokbot.json', 1.5, 11.1, { x: 100, y: 60, width: 1088, height: 680 }, 'inbox-grok', 'inbox-kindle') },
          { title: 'Artwork drawn for each collection', plain: true, scene: dispatchApp('/replays/products/dispatch-covers.json', 1.5, 13.4, { x: 32, y: 20, width: 1216, height: 760 }, 'collections-app', 'collections-kindle') },
          { title: 'Collections that fill daily or weekly', plain: true, scene: dispatchApp('/replays/products/dispatch-schedule.json', 1.5, 13.1, { x: 32, y: 20, width: 1216, height: 760 }, 'collections-app', 'collections-kindle') },
        ],
      },
      {
        id: 'thesis', title: 'Thesis', summary: 'Every claim in a plan is a bet. Test them all at once: AI drafts the tests and gathers the evidence.',
        visit: { label: 'Visit Thesis', href: 'https://thesis-phi-self.vercel.app' },
        hero: { ...crop(THESIS, 1.6, 13.8, { x: 96, y: 59, width: 1248, height: 780 }), scheme: 'dark', css: onlyWindows('prose-app') }, framed: false, matte: true, tint: '#E2EFE4', // past the page's fade-in
        details: [
          { title: 'Tap a claim, see the bet', scene: crop(THESIS, 1.6, 13.8, { x: 370, y: 280, width: 600, height: 375 }) },
          { title: 'Integrate with the tools you use', scene: crop('/replays/products/thesis-integrations.json', 1.2, 12.9, { x: 72, y: 50, width: 1136, height: 710 }) },
          { title: 'Agents draft your assumption tests', scene: crop('/replays/products/thesis-test-plan.json', 1.2, 13.2, { x: 272, y: 127, width: 936, height: 585 }) },
        ],
      },
    ],
  },
  {
    id: 'ai',
    title: 'AI has changed the impact of design',
    layout: 'feature',
    quote: 'Ahmed Hakeem',
    pieces: [
      {
        id: 'rfp', tab: 'Winning a tender', title: 'Using AI to partner with sales to win a deal', summary: 'Leveraging AI to compete with larger companies: a product-like prototype, seed data and connected LLMs.',
        caseStudy: '/projects/rfp',
        hero: scene('rfp-overview'), framed: true, tint: '#E6EEE7',
        impact: [{ value: '3', label: 'of us, against vendors with whole teams' }, { label: 'The prototype outlived the tender' }],
        details: [visual('rfp-llm-chat'), visual('rfp-determination', 'The decision letter'), visual('rfp-ask')],
      },
      // Not ready: on the dev server only for now
      ...(DRAFTS_LIVE ? [{
        id: 'configurator', tab: 'Testing on live models', title: 'Testing a thesis by building it', summary: 'Where a Figma prototype couldn’t answer the question, because it needed dynamic data.',
        caseStudy: '/projects/configurator',
        hero: scene('configurator-overview'), framed: true, tint: '#F6E5E3',
        impact: [{ value: '6s vs 21s', label: 'GPT-4.1 against GPT-5 mini' }, { label: 'Changed the product’s direction' }],
        details: [visual('configurator-models'), visual('configurator-jev'), visual('configurator-qr')],
      }] : []),
      {
        id: 'html-brand-website', tab: 'An agent-built website', title: 'Build an app, brand it per client, share it to a phone', summary: 'A marketing site built from an HTML brand.',
        caseStudy: '/projects/html-brand-website',
        hero: scene('website'), framed: true, tint: '#DCE7F1', // a soft Enterprise AI blue, under the site's own #F3F7FA
        impact: [{ value: '10', label: 'variations in a day' }, { value: '5 of 7', label: 'understood the offer, up from 2 of 5' }],
        details: [
          visual('eai-setup'),
          // The site's own builder: Nike's app done, name the next client, and it re-skins for Qantas
          { title: 'Name the next client, and the app re-skins', scene: crop('/replays/website/site.json', 10.6, 16.5, { x: 140, y: 232, width: 800, height: 500 }) },
          { title: 'The site in its new brand', scene: { image: '/case-studies/html-brand-website/site-hero.webp', hold: 10, layout: 'full', title: '' } },
        ],
      },
    ],
  },
  {
    id: 'past',
    title: 'Past work',
    layout: 'feature',
    pieces: [
      {
        id: 'seek', tab: 'SEEK', title: 'Achieving impact by releasing and following the funnel', summary: 'SEEK search',
        caseStudy: '/projects/seek-case-study-1',
        hero: video('/case-studies/seek-learning/final-desktop.mp4', 0, 22), framed: true, tint: '#F7E4EE',
        impact: [{ value: '9% → 20%', label: 'education conversion' }, { value: '+34%', label: 'paid connections' }, { value: '~$500K', label: 'more revenue a year' }],
        details: [
          { title: 'Three leaks in the funnel', widget: 'seek-funnel', plain: true },
          { title: 'A/B: the first card and the better one', widget: 'seek-ab', plain: true },
          { title: 'A fly-out, and the form in place', scene: video('/case-studies/seek-learning/flyout.mp4', 0, 6.3) },
        ],
      },
      {
        id: 'bestpractice', tab: 'Best Practice', title: 'Booking an appointment in two panels', summary: 'Best Practice Software',
        caseStudy: '/projects/bestpractice-case-study-1',
        hero: dialog(`${BP}/final.mp4`, 0, 15.9, BP_DIALOG), heroPlain: true, framed: true, tint: '#E3ECF7',
        details: [
          { title: 'A repeat, set up on the right', plain: true, scene: dialog(`${BP}/repeat.mp4`, 0, 9.7, { x: 38, y: 126, width: 746, height: 924 }) },
          { title: 'One provider’s date at a time', plain: true, scene: dialog(`${BP}/provider-dates.mp4`, 0, 7.1, BP_DIALOG) },
          { title: 'Straight to the next free time', plain: true, scene: dialog(`${BP}/unavailable.mp4`, 0, 9.3, BP_DIALOG) },
        ],
      },
    ],
  },
  {
    id: 'creative',
    title: 'Creative tools',
    layout: 'feature',
    quote: 'Richard Simms',
    pieces: [
      {
        id: 'balatro', title: 'Opportunity sizing x Balatro', summary: 'Part of Thesis. Bringing the playful scaling elements of the card game Balatro to the product world of Opportunity Sizing.',
        caseStudy: '/projects/balatro-opportunity-sizing',
        hero: scene('balatro'), framed: false, tint: '#E0EDE6',
        details: [
          { title: 'Eight questions, and the agent writes the thesis', scene: video('/essays/balatro-opportunity-sizing/create.mp4', 0, 13.8) },
          { title: 'Each number deals its card', scene: video('/essays/balatro-opportunity-sizing/read.mp4', 0, 7.6) },
        ],
      },
      {
        id: 'wallbounce', title: 'Wallbounce', summary: 'A top-down ode to one move from Gears of War, made with the tools an agent built for it.',
        caseStudy: '/projects/wallbounce-dev-tools', visit: { label: 'Play Wallbounce', href: 'https://wallbounce.vercel.app' },
        hero: scene('wallbounce'), framed: false, tint: '#F6E2E0',
        details: [{ title: 'The tools an agent built for it', scene: video('/essays/wallbounce-dev-tools/reel.mp4', 0, 20, false) }],
      },
    ],
  },
]
