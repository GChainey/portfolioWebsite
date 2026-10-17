import { reelDuration, sceneDuration, type ShowcaseScene as ReelScene } from '@/components/showcase/ShowcaseReel'
import { getProjectById } from '@/content/projects'
import { fromHeroReel } from '@/content/work'

// Sizzle reels of all the work, at 30, 60 and 90 seconds. Every scene is the real thing: replays
// of the prototypes and product sites, the live Shader Wall, and video only where that's all
// there is (the website study, SEEK and Best Practice). Each clip is given a length on screen and
// plays at whatever speed fits it, so the cuts land on time.

type Clip = ReelScene & { from: number; to: number }

// A stretch of a recording, sped up or slowed to last `secs` on screen
const at = (clip: Clip, secs: number, extra: Partial<ReelScene> = {}): ReelScene => ({ ...clip, ...extra, rate: (clip.to - clip.from) / secs })
const card = (title: string, secs: number, kicker?: string, sub?: string): ReelScene => ({ layout: 'center', title, kicker, sub, hold: secs })

// The clips
const SHADER_WALL = (secs: number): ReelScene => ({ site: 'https://www.shaderwall.com', hold: secs, layout: 'full', kicker: 'Shader Wall · Product', title: 'Your Mac desktop, alive' })
const DISPATCH_PRESS: Clip = { src: '/replays/products/dispatch.json', from: 1.4, to: 9.4, layout: 'full', kicker: 'Dispatch · Product', title: 'Press Dispatch. It lands on your Kindle.' }
const DISPATCH_GROK: Clip = { src: '/replays/products/dispatch.json', from: 13, to: 18.6, layout: 'full', live: true, kicker: 'Dispatch · Grokbot', title: 'Newsletters, read for you first' }
const THESIS_DOC: Clip = { src: '/replays/products/thesis.json', from: 0.8, to: 7.2, layout: 'full', kicker: 'Thesis · Product', title: 'Every underlined sentence is a bet' }
const THESIS_TESTS: Clip = { src: '/replays/products/thesis.json', from: 9.6, to: 16.2, layout: 'full', kicker: 'Thesis', title: 'Test every bet at once' }
const THESIS_CARDS: Clip = { src: '/replays/products/thesis.json', from: 18, to: 25.4, layout: 'full', kicker: 'Thesis', title: 'Know what a bet is worth first' }
// The RFP clips come from the case study's own reel, so they follow its re-recordings
const RFP = fromHeroReel(getProjectById('rfp')!.heroReel!)
const rfp = (src: string, kicker: string, title?: string): Clip => {
  const s = RFP.find((x) => x.src === `/replays/rfp/${src}.json`)!
  return { ...s, from: s.from ?? 0, to: s.to ?? 0, kicker, title: title ?? s.title, rate: undefined }
}
const RFP_OVERVIEW = rfp('overview', 'Daisy Assess · State tender')
const RFP_REWRITE = { ...rfp('spot-rewrite', 'Live model'), live: true }
const RFP_ASK = { ...rfp('spot-ask', 'Live model'), live: true }
const RFP_SCENARIO = rfp('spot-scenario', 'Seed data')
const RFP_SUGGEST = { ...rfp('spot-suggest', 'Live model'), live: true }
const WEB = '/replays/website/site.json'
const WEB_HERO: Clip = { src: WEB, from: 0.5, to: 12, layout: 'full', kicker: 'Enterprise AI site · HTML brand', title: 'One line in. A four-step app out.' }
const WEB_SELL: Clip = { src: WEB, from: 12, to: 18.5, layout: 'full', kicker: 'Build once. Sell to many.', title: 'Build it for Nike. Sell it to Qantas.' }
const WEB_MATHS: Clip = { src: WEB, from: 25, to: 31, layout: 'full', kicker: 'Enterprise AI site', title: 'You build it once. They pay every time.' }
const CONFIG_BRIEF: Clip = { src: '/replays/configurator/process-card.json', region: { x: 0, y: 0, width: 470, height: 600 }, from: 0.5, to: 14, layout: 'side', live: true, kicker: 'Configurator · Live model', title: 'A messy description in. A working brief out.' }
const CONFIG_STEPS: Clip = { src: '/replays/configurator/four-steps.json', region: { x: 0, y: 0, width: 470, height: 480 }, from: 1, to: 15, layout: 'side', live: true, kicker: 'Configurator', title: 'Eight steps today. Four tomorrow.' }
const CONFIG_BRAND: Clip = { src: '/replays/configurator/brand.json', region: { x: 0, y: 0, width: 1600, height: 720 }, from: 4, to: 24, kicker: 'Configurator · From one name', title: 'One app, three clients, each in their brand' }
const SETTINGS: Clip = { src: '/replays/eai-settings/features.json', from: 0.5, to: 12, kicker: 'Enterprise AI · Settings', title: 'Four features, inside the app’s own settings' }
const SEEK: Clip = { video: '/case-studies/seek-learning/final-desktop.mp4', from: 0, to: 22, kicker: 'SEEK · Earlier work', title: 'Course conversion, from 9% to 20%' }
const BEST_PRACTICE: Clip = { video: '/case-studies/bestpractice-booking/final.mp4', from: 0, to: 15.9, kicker: 'Best Practice · Earlier work', title: 'Booking an appointment, in two panels' }

// Stretch or squeeze the clips (never the title cards) so the whole reel runs `seconds`
function fit(seconds: number, scenes: ReelScene[]): ReelScene[] {
  const isCard = (s: ReelScene) => s.layout === 'center'
  const fixed = reelDuration(scenes) - scenes.filter((s) => !isCard(s)).reduce((t, s) => t + sceneDuration(s), 0)
  const media = scenes.filter((s) => !isCard(s)).reduce((t, s) => t + sceneDuration(s), 0)
  const k = (seconds - fixed) / media
  return scenes.map((s) => (isCard(s) ? s : s.src || s.video ? { ...s, rate: (s.rate ?? 1) / k } : { ...s, hold: sceneDuration(s) * k }))
}

const INTRO = (secs: number) => card('Product designer.', secs, 'Gareth Chainey', 'Now I build the real thing, with AI.')
const OUTRO = (secs: number) => card('Designed and built with AI.', secs, 'Gareth Chainey', 'garethchainey.com')

export const SIZZLE: Record<'30' | '60' | '90', ReelScene[]> = {
  // 30 seconds: one beat per piece
  '30': fit(30, [
    INTRO(2),
    SHADER_WALL(2.8),
    at(DISPATCH_PRESS, 3),
    at(THESIS_TESTS, 3),
    at(RFP_REWRITE, 3.4),
    at(WEB_SELL, 3),
    at(CONFIG_BRAND, 3.2),
    OUTRO(2),
  ]),
  // 60 seconds: the products, then the case studies, two beats each
  '60': fit(60, [
    INTRO(2.4),
    card('Products I’ve built', 1.6, '01'),
    SHADER_WALL(3.6),
    at(DISPATCH_PRESS, 3.6),
    at(DISPATCH_GROK, 2.8),
    at(THESIS_DOC, 2.8),
    at(THESIS_TESTS, 3.2),
    card('How design changed with AI', 1.6, '02'),
    at(RFP_OVERVIEW, 3),
    at(RFP_REWRITE, 3.6),
    at(RFP_SCENARIO, 2.8),
    at(WEB_HERO, 3),
    at(WEB_SELL, 3),
    at(CONFIG_BRIEF, 3.4),
    at(CONFIG_BRAND, 3.4),
    OUTRO(2.4),
  ]),
  // 90 seconds: everything, earlier work included
  '90': fit(90, [
    INTRO(2.6),
    card('Products I’ve built', 1.8, '01'),
    SHADER_WALL(4.2),
    at(DISPATCH_PRESS, 4),
    at(DISPATCH_GROK, 3.2),
    at(THESIS_DOC, 3),
    at(THESIS_TESTS, 3.4),
    at(THESIS_CARDS, 3.2),
    card('How design changed with AI', 1.8, '02'),
    at(RFP_OVERVIEW, 3.2),
    at(RFP_REWRITE, 4),
    at(RFP_ASK, 3.6),
    at(RFP_SUGGEST, 3.4),
    at(WEB_HERO, 3.2),
    at(WEB_SELL, 3.2),
    at(WEB_MATHS, 2.6),
    at(CONFIG_BRIEF, 3.4),
    at(CONFIG_STEPS, 3.2),
    at(CONFIG_BRAND, 3.4),
    at(SETTINGS, 3),
    card('Before AI', 1.6, '03'),
    at(SEEK, 3.2),
    at(BEST_PRACTICE, 3),
    OUTRO(2.6),
  ]),
}

export const sizzleSeconds = (cut: keyof typeof SIZZLE) => reelDuration(SIZZLE[cut])
