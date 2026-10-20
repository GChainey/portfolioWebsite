import type { ShowcaseScene } from '@/components/showcase/ShowcaseReel'
import { VISUALS } from '@/content/visuals'

// The homepage as the Paper frames "website vertical scroll all" and "website section horizontal
// scroll" lay it out: sections, each holding pieces of work (a product, a case study, a tool),
// each piece with its own clips. The two designs differ only in how a piece's clips run: down
// the page, or sideways in a track. Clips reuse the scenes in content/visuals.ts by id.

export interface HomeClip {
  caption: string
  scene: ShowcaseScene
}

export interface HomePiece {
  id: string
  title: string
  summary: string
  caseStudy?: string // the case study or essay on this site
  visit?: { label: string; href: string } // out to the thing itself
  clips: HomeClip[]
}

export interface HomeSection {
  id: string
  title: string
  pieces: HomePiece[]
  quote?: string // a colleague's words after the section (content/testimonials.ts name)
}

// A clip from content/visuals.ts, captioned with its title unless told otherwise
const clip = (id: string, caption?: string): HomeClip => {
  const v = VISUALS.find((x) => x.id === id)
  if (!v) throw new Error(`No visual "${id}"`)
  return { caption: caption ?? v.title, scene: v.scene }
}
const video = (src: string, from: number, to: number, caption: string): HomeClip => ({ caption, scene: { video: src, from, to, layout: 'full', title: '' } })

export const HOME_SECTIONS: HomeSection[] = [
  {
    id: 'products',
    title: 'Products',
    quote: 'Winnie Bamra',
    pieces: [
      { id: 'shader-wall', title: 'Shader Wall', summary: 'An agentic friendly native macOS app to set and create shaders as your background.', visit: { label: 'Visit Shader Wall', href: 'https://www.shaderwall.com' }, clips: [clip('shader-wall')] },
      { id: 'dispatch', title: 'Dispatch', summary: 'Send articles to your Kindle in one click, from your browser, your Mac or a bot that reads your newsletters.', visit: { label: 'Visit Dispatch', href: 'https://www.dispatchmac.com' }, clips: [clip('dispatch')] },
      { id: 'thesis', title: 'Thesis', summary: 'Every claim in a plan is a bet. Test them all at once: AI drafts the tests and gathers the evidence.', visit: { label: 'Visit Thesis', href: 'https://thesis-phi-self.vercel.app' }, clips: [clip('thesis')] },
    ],
  },
  {
    id: 'ai',
    title: 'AI has changed the impact of design',
    quote: 'Richard Simms',
    pieces: [
      {
        id: 'rfp', title: 'Designing to win an RFP', summary: 'Working with sales to create a product experience to win an RFP. How a startup battled against larger teams.', caseStudy: '/projects/rfp',
        clips: [clip('rfp-overview', 'The caseload, against its targets'), clip('rfp-llm-chat'), clip('rfp-determination'), clip('rfp-ask')],
      },
      {
        id: 'configurator', title: 'A description of today’s process becomes an app', summary: 'Describe how the job is done. Get a four-step app back.', caseStudy: '/projects/configurator',
        clips: [clip('configurator-overview', 'Four steps from a description'), clip('configurator-brand'), clip('configurator-models'), clip('configurator-jev'), clip('configurator-show-prompt'), clip('configurator-qr')],
      },
      {
        id: 'html-brand-website', title: 'Build an app, brand it per client, share it to a phone', summary: 'A marketing site built from an HTML brand.', caseStudy: '/projects/html-brand-website',
        clips: [clip('website', 'On their phone before the meeting ends'), clip('eai-setup')],
      },
      {
        id: 'eai-settings', title: 'Two levels of settings, without getting lost', summary: 'Settings organised by what you want, not how it’s built.', caseStudy: '/projects/eai-settings',
        clips: [clip('eai-settings-nested', 'Which level you’re on, before you read a word'), clip('eai-settings-features')],
      },
    ],
  },
  {
    id: 'past',
    title: 'Past work',
    pieces: [
      { id: 'seek', title: 'Achieving impact by releasing and following the funnel', summary: 'SEEK search', caseStudy: '/projects/seek-case-study-1', clips: [video('/case-studies/seek-learning/final-desktop.mp4', 0, 22, 'Courses on SEEK, after the funnel fixes')] },
      { id: 'bestpractice', title: 'Booking an appointment in two panels', summary: 'Best Practice Software', caseStudy: '/projects/bestpractice-case-study-1', clips: [video('/case-studies/bestpractice-booking/final.mp4', 0, 15.9, 'The two-panel booking dialog')] },
    ],
  },
  {
    id: 'creative',
    title: 'Creative tools',
    quote: 'Ahmed Hakeem',
    pieces: [
      { id: 'wallbounce', title: 'Wallbounce', summary: 'A top-down ode to one move from Gears of War, made with the tools an agent built for it.', caseStudy: '/projects/wallbounce-dev-tools', visit: { label: 'Play Wallbounce', href: 'https://wallbounce.vercel.app' }, clips: [clip('wallbounce')] },
      { id: 'balatro', title: 'Opportunity sizing x Balatro', summary: 'Part of Thesis. Bringing the playful scaling elements of the card game Balatro to the product world of Opportunity Sizing.', caseStudy: '/projects/balatro-opportunity-sizing', clips: [clip('balatro')] },
    ],
  },
]
