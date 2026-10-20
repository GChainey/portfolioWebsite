import type { ShowcaseScene } from '@/components/showcase/ShowcaseReel'

// The visuals: one piece of work per entry, each a short replay (or a video or live site where a
// replay can't capture it) with what it is and what it did. The homepage's Visuals tab and the
// gallery page show them one after another, in three sections (VISUAL_SECTIONS): the products,
// the case studies best first, then the creative tools.

// The homepage's three sections, in order
export type VisualSection = 'products' | 'ai' | 'creative'
export const VISUAL_SECTIONS: { id: VisualSection; title: string; websiteTitle?: string }[] = [
  { id: 'products', title: 'Products I\u2019ve made', websiteTitle: 'Products' },
  { id: 'ai', title: 'How AI has changed how I design' },
  { id: 'creative', title: 'Creative tools' },
]

export interface Visual {
  id: string
  project: string // who it's for, or the product: "Daisy Assess", "Configurator"
  product?: boolean // a product of my own: its name is the title
  section: VisualSection
  title: string
  summary: string // what you're looking at
  impact?: { value?: string; label: string } // what it did. Only what the case study already says
  scene: ShowcaseScene
  href?: string // the case study, essay or product
  external?: boolean
  visit?: { label: string; href: string } // a second link, out to the thing itself
}

// A stretch of a replay. Full-frame recordings are 16:10, like the stage, so they fill it;
// a cropped one sits fitted on the canvas.
const replay = (src: string, from: number, to: number, opts: Partial<ShowcaseScene> = {}): ShowcaseScene => ({
  src, from, to, layout: opts.region ? undefined : 'full', title: '', ...opts,
})
const video = (src: string, from: number, to: number): ShowcaseScene => ({ video: src, from, to, layout: 'full', title: '' })

export const VISUALS: Visual[] = [
  {
    id: 'shader-wall',
    section: 'products',
    project: 'Shader Wall',
    product: true,
    title: 'Shader Wall',
    summary: 'An agentic friendly native macOS app to set and create shaders as your background.',
    scene: { site: 'https://www.shaderwall.com', hold: 12, layout: 'full', title: '' },
    href: 'https://www.shaderwall.com',
    external: true,
  },
  {
    id: 'dispatch',
    section: 'products',
    project: 'Dispatch',
    product: true,
    title: 'Dispatch',
    summary: 'Send articles to your Kindle in one click, from your browser, your Mac or a bot that reads your newsletters.',
    // The app on its landing page, in dark mode, cropped to the app window and the Kindle
    scene: replay('/replays/products/dispatch-app.json', 0.8, 11.6, { region: { x: 120, y: 51, width: 1274, height: 796 }, layout: 'full' }),
    href: 'https://www.dispatchmac.com',
    external: true,
  },
  {
    id: 'thesis',
    section: 'products',
    project: 'Thesis',
    product: true,
    title: 'Thesis',
    summary: 'Every claim in a plan is a bet. Test them all at once: AI drafts the tests and gathers the evidence.',
    // The app on its landing page, in dark mode: tap a sentence and its assumption opens
    scene: replay('/replays/products/thesis-app.json', 0.8, 13.8, { region: { x: 120, y: 74, width: 1200, height: 750 }, layout: 'full' }),
    href: 'https://thesis-phi-self.vercel.app',
    external: true,
  },
  {
    id: 'rfp-overview',
    section: 'ai',
    project: 'Daisy Assess',
    title: 'A council\'s whole caseload, against its targets',
    summary: 'A state tender, won with a working product, not mock-ups.',
    scene: replay('/replays/rfp/overview.json', 0.4, 21.6),
    href: '/projects/rfp',
  },
  {
    id: 'configurator-overview',
    section: 'ai',
    project: 'Configurator',
    title: 'A description of today\'s process becomes an app',
    summary: 'Describe how the job is done. Get a four-step app back.',
    scene: replay('/replays/configurator/overview.json', 0.3, 25.3),
    href: '/projects/configurator',
  },
  {
    id: 'website',
    section: 'ai',
    project: 'Enterprise AI',
    title: 'Build an app, brand it per client, share it to a phone',
    summary: 'A marketing site built from an HTML brand.',
    impact: { value: '10', label: 'variations in a day' },
    scene: { image: '/visuals/website-phone.webp', hold: 10, layout: 'full', title: '' },
    href: '/projects/html-brand-website',
  },
  {
    id: 'rfp-llm-chat',
    section: 'ai',
    project: 'Daisy Assess',
    title: 'Rough notes in, council wording out',
    summary: 'A live model, beside the assessment.',
    scene: replay('/replays/rfp/llm-chat.json', 0, 21.2),
    href: '/projects/rfp',
  },
  {
    id: 'configurator-models',
    section: 'ai',
    project: 'Configurator',
    title: 'Which model is good enough?',
    summary: 'One flag swaps the model behind every call.',
    impact: { value: '6s vs 21s', label: 'GPT-4.1 against GPT-5 mini' },
    scene: replay('/replays/configurator/models.json', 0, 12.8),
    href: '/projects/configurator',
  },
  {
    id: 'rfp-determination',
    section: 'ai',
    project: 'Daisy Assess',
    title: 'The decision letter, written from the work already done',
    summary: 'Every workflow ends in a real letter.',
    scene: replay('/replays/rfp/workflow-determination.json', 0, 20.6),
    href: '/projects/rfp',
  },
  {
    id: 'configurator-brand',
    section: 'ai',
    project: 'Configurator',
    title: 'One app, three clients, each in their brand',
    summary: 'Type a name. The brand is read from their site.',
    scene: replay('/replays/configurator/brand.json', 0.5, 24.3),
    href: '/projects/configurator',
  },
  {
    id: 'eai-settings-nested',
    section: 'ai',
    project: 'Enterprise AI',
    title: 'Two levels of settings, without getting lost',
    summary: 'You know which level you\'re on before you read a word.',
    impact: { value: '5 of 5', label: 'switched to the right app' },
    scene: replay('/replays/eai-settings/nested.json', 0, 14.8),
    href: '/projects/eai-settings',
  },
  {
    id: 'configurator-jev',
    section: 'ai',
    project: 'Configurator',
    title: 'Select, don\'t generate',
    summary: 'Jev picks from 20 templates and says how sure it is.',
    impact: { label: 'Changed the product\'s direction' },
    scene: replay('/replays/configurator/jev-match.json', 0, 11.4),
    href: '/projects/configurator',
  },
  {
    id: 'rfp-ask',
    section: 'ai',
    project: 'Daisy Assess',
    title: 'Ask the case a question',
    summary: 'Answers from the applicant\'s own documents.',
    scene: replay('/replays/rfp/spot-ask.json', 0.5, 13.4, { region: { x: 800, y: 91, width: 558, height: 718 } }),
    href: '/projects/rfp',
  },
  {
    id: 'eai-settings-features',
    section: 'ai',
    project: 'Enterprise AI',
    title: 'Settings organised by what you want, not how it\'s built',
    summary: 'Four features, inside the app\'s own settings.',
    impact: { value: '5 of 5', label: 'found the feature' },
    scene: replay('/replays/eai-settings/features.json', 0, 12.1),
    href: '/projects/eai-settings',
  },
  {
    id: 'configurator-show-prompt',
    section: 'ai',
    project: 'Configurator',
    title: 'Show prompt',
    summary: 'Read the request, change it, run it again.',
    scene: replay('/replays/configurator/show-prompt.json', 0, 13.7),
    href: '/projects/configurator',
  },
  {
    id: 'eai-setup',
    section: 'ai',
    project: 'Enterprise AI',
    title: 'From sign-in to building in Claude Code',
    summary: 'A native installer and a command line.',
    scene: video('/gallery/clips/eai-setup.mp4', 0, 26.5),
  },
  {
    id: 'configurator-qr',
    section: 'ai',
    project: 'Configurator',
    title: 'On a real phone',
    summary: 'A link and a QR code, straight from the builder.',
    scene: replay('/replays/configurator/qr.json', 0, 6.5),
    href: '/projects/configurator',
  },
  {
    id: 'wallbounce',
    section: 'creative',
    project: 'Wallbounce',
    product: true,
    title: 'Wallbounce',
    summary: 'A top-down ode to one move from Gears of War, made with the tools an agent built for it.',
    scene: { site: 'https://wallbounce.vercel.app', hold: 12, layout: 'full', title: '' },
    href: '/projects/wallbounce-dev-tools',
    visit: { label: 'Play Wallbounce', href: 'https://wallbounce.vercel.app' },
  },
  {
    id: 'balatro',
    section: 'creative',
    project: 'Thesis',
    title: 'Opportunity sizing x Balatro',
    summary: 'Part of Thesis. Bringing the playful scaling elements of the card game Balatro to the product world of Opportunity Sizing.',
    scene: video('/essays/balatro-opportunity-sizing/reel.mp4', 0, 20),
    href: '/projects/balatro-opportunity-sizing',
  },
]

// Kind words between the pieces: after the piece with this id, the quote from this colleague
// (content/testimonials.ts). After the products, through the case studies, and before the essays.
export const KIND_WORDS: Record<string, string> = {
  // Winnie first: her SpaceX logo
  thesis: 'Winnie Bamra',
  website: 'Richard Simms',
  'configurator-models': 'David Deville',
  'eai-settings-features': 'Ahmed Hakeem',
  'configurator-qr': 'Henry Vesander',
}
