import type { ShowcaseSlide } from '@/components/ShowcaseCarousel'
import type { ReelScene } from '@/components/replay/ReplayReel'
import { getProjectById, products } from '@/content/projects'

// The two carousels at the top of the homepage: the products, then how I use AI

// Products have no reels yet, so each shows its live site. Shader Wall leads: it moves.
const PRODUCT_ORDER = ['shader-wall', 'dispatch', 'thesis']

export const PRODUCT_SLIDES: ShowcaseSlide[] = products
  .filter((p) => p.liveUrl && p.status !== 'Coming soon')
  .sort((a, b) => PRODUCT_ORDER.indexOf(a.id) - PRODUCT_ORDER.indexOf(b.id))
  .map((p) => ({
    id: p.id,
    kicker: p.status === 'Live' ? 'Live' : `Product · ${p.status}`,
    title: p.title,
    description: p.description,
    href: p.liveUrl!,
    external: true,
    cta: `Visit ${p.title}`,
    media: { type: 'site', src: p.liveUrl! },
  }))

// Homepage only: the Configurator study has no reel of its own
const CONFIGURATOR_REEL: ReelScene[] = [
  { src: '/replays/configurator/process-card.json', region: { x: 0, y: 0, width: 470, height: 600 }, from: 0.5, to: 14, rate: 1.5, title: 'A messy description in. A working brief out.', notes: [{ at: 0, text: 'A live model reads how the job is done today' }] },
  { src: '/replays/configurator/four-steps.json', region: { x: 0, y: 0, width: 470, height: 480 }, from: 1, to: 15, rate: 1.6, title: 'Eight steps today, mapped onto four', notes: [{ at: 0, text: 'Every step of today\'s process, onto four' }] },
  { src: '/replays/configurator/edit.json', region: { x: 0, y: 0, width: 1250, height: 700 }, from: 0.3, to: 8, rate: 1.2, title: 'Ask for a change. The app follows.', notes: [{ at: 0, text: 'Structure, not code' }] },
  { src: '/replays/configurator/brand.json', region: { x: 0, y: 0, width: 1600, height: 720 }, from: 4, to: 24, rate: 2, title: 'One app, three clients, each in their brand', notes: [{ at: 0, text: 'Their brand, from one name' }] },
]

const rfp = getProjectById('rfp')!
const website = getProjectById('html-brand-website')!
const configurator = getProjectById('configurator')!

export const AI_SLIDES: ShowcaseSlide[] = [
  {
    id: rfp.id,
    kicker: 'Enterprise AI',
    title: 'Utilising AI to Help Sales Win Deals',
    tab: 'Helping sales win deals',
    description: 'The features and flexibility that were only possible because of AI.',
    href: '/projects/rfp',
    cta: 'Read the case study',
    media: { type: 'reel', scenes: rfp.heroReel! },
  },
  {
    id: website.id,
    kicker: 'Brand & Web',
    title: 'A Website Built from an HTML Brand',
    tab: 'A website from an HTML brand',
    description: 'One tagline, ten wild variations, the brand as files an agent reads, and two rounds of testing the message.',
    href: '/projects/html-brand-website',
    cta: 'Read the case study',
    media: { type: 'video', src: website.heroVideo!, poster: website.heroImage },
  },
  {
    id: configurator.id,
    kicker: 'No-Code AI',
    title: 'Testing Whether It Works, Not Just How It Looks',
    tab: 'Testing if it works, not how it looks',
    description: 'A no-code builder prototyped on live models, to test feasibility and viability along with usability.',
    href: '/projects/configurator',
    cta: 'Read the case study',
    media: { type: 'reel', scenes: CONFIGURATOR_REEL },
  },
]
