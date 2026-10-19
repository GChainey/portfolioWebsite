// Parked work: things that are merged but not on the public site, listed in one place so they
// don't get forgotten. Shown at /parked on the local dev server only.
//
// Add an entry when something is parked. Delete it when the thing launches or is removed.
export const PARKED_LIVE = process.env.NODE_ENV === 'development'

// local     only exists on the dev server; the live site returns 404
// unlisted  the URL works on the live site, but nothing links to it
// flag      on the live site, switched on per browser from the flag drawer (Cmd+K)
export type ParkedStatus = 'local' | 'unlisted' | 'flag'

export const PARKED_STATUS: Record<ParkedStatus, { label: string; meaning: string }> = {
  local: { label: 'Local only', meaning: 'Only on the dev server. The live site returns 404.' },
  unlisted: { label: 'Live, unlisted', meaning: 'The URL works on the live site, but nothing links to it.' },
  flag: { label: 'Behind a flag', meaning: 'On the live site, switched on per browser with Cmd+K.' },
}

export interface ParkedItem {
  id: string
  name: string
  status: ParkedStatus
  // When it was parked (YYYY-MM-DD), from the changelog
  since: string
  summary: string
  links: { label: string; href: string }[]
  // What turns it on, or keeps it hidden
  gate: string
  // What's left before it can launch or be deleted
  todo: string[]
}

export const PARKED: ParkedItem[] = [
  {
    id: 'interaction-of-color',
    name: 'Interaction of Color',
    status: 'local',
    since: '2026-10-19',
    summary: "Each chapter of Josef Albers' book gets its exercise rebuilt for the browser. Chapters I (visual memory), IV (relativity) and V (lightness) are done.",
    links: [
      { label: 'Index', href: '/color' },
      { label: 'I. Visual memory', href: '/color/recollection' },
      { label: 'IV. Relativity', href: '/color/relativity' },
      { label: 'V. Lightness', href: '/color/lightness' },
    ],
    gate: 'COLOR_LIVE in src/content/color.ts (on in dev and on Vercel previews)',
    todo: [
      'More chapters: each is an entry in COLOR_CHAPTERS and a component in src/app/color/[slug]/page.tsx',
      "Everyone's reds and the exhibition only show locally with the Upstash Redis env vars set. Vercel already has them",
      'Decide where it lives on the site (header link, essay, or homepage) before flipping COLOR_LIVE',
    ],
  },
  {
    id: 'demos',
    name: 'Demos',
    status: 'local',
    since: '2026-10-07',
    summary: 'A scroll of live prototypes with buttons that drive them, in three layouts to choose between.',
    links: [
      { label: 'Split', href: '/demos' },
      { label: 'Document', href: '/demos/doc' },
      { label: 'Hybrid', href: '/demos/hybrid' },
    ],
    gate: 'DEMOS_LIVE in src/content/demos.ts',
    todo: [
      'Choose which demos to show (the list is DEMOS in src/content/demos.ts)',
      'Pick one layout and delete the other two from src/components/Demos.tsx and src/app/demos',
      'A model comparison demo was wanted but needs real outputs to show',
    ],
  },
  {
    id: 'case-study-visuals',
    name: 'Case study visuals still to come',
    status: 'local',
    since: '2026-10-08',
    summary: 'Media slots that have no file yet. On the dev server each is a labelled placeholder with a brief, or the file itself once it is in the folder. The live page leaves them out.',
    links: [{ label: 'RFP', href: '/projects/rfp' }],
    gate: '`pending: true` on the media blocks in src/content/projects.ts',
    todo: [
      'RFP: the scale clip (council to state) and the iteration clip (a requirement change) are missing',
      'For each one that lands, delete `pending` and `brief` from its block',
      'The Daisy workspace also made a combined reel.mp4 that is not used anywhere yet',
      'Balatro essay: the clips are silent. Re-record them with sound from the Thesis repo, keeping the caption box',
    ],
  },
  {
    id: 'gallery',
    name: 'Gallery',
    status: 'local',
    since: '2026-10-07',
    summary: 'A full-width column of real work that opens in a dialog: clips of the big pieces being used, live prototypes, and phone work in a drawn phone. On the homepage it is a Page / Visuals switch under the hero (the Visuals list, components/Visuals.tsx), and there is a header link. The switch was live briefly on 2026-10-17, then taken back: not coherent enough yet.',
    links: [
      { label: 'Gallery', href: '/gallery' },
      { label: 'Edit mode', href: '/gallery?edit' },
    ],
    gate: 'GALLERY_LIVE in src/components/Gallery.tsx and LIVE in public/gallery/gallery.js (flip both)',
    todo: [
      'The header does not fit on a phone: it needs a mobile menu (or fewer links) before Gallery goes in it for real',
      'More small feature clips: AI writing, Document Validation, the chatbot with sources',
      'Recordings are video; every recording on the site is moving to rrweb replays',
      'Content is public/gallery/items.json; edit mode hides tiles. Clip scripts are in the indianapolis-v2 workspace, .context/reel2 (gitignored)',
    ],
  },
  {
    id: 'home-showcase-variants',
    name: 'Homepage showcase variants',
    status: 'flag',
    since: '2026-10-16',
    summary: 'Five ways to show the products and AI case studies, all playing, each with a read of the features and thinking. Favourite so far: Scroll story, full width, since hirers scroll more than they click.',
    links: [
      { label: 'Launchpad', href: '/showcase' },
      { label: 'Scroll story', href: '/?home=scrolly#work' },
      { label: 'Autoplay', href: '/?home=autoplay#work' },
      { label: 'Coverflow', href: '/?home=coverflow#work' },
      { label: 'Billboard', href: '/?home=billboard#work' },
      { label: 'The wall', href: '/?home=wall#work' },
    ],
    gate: 'Homepage work in the flag drawer (Cmd+K), or ?home=; code in components/showcase, content in content/work.ts',
    todo: ['Not ready to change the design yet (2026-10-16). When he is: make the chosen one the default, delete the others, the carousels and the homeLayout flag'],
  },
  {
    id: 'sizzle-reel',
    name: 'Sizzle reel',
    status: 'unlisted',
    since: '2026-10-16',
    summary: 'All the work in 30, 60 or 90 seconds, built from the replays. Billboard and The wall link to it.',
    links: [{ label: 'Reel', href: '/reel' }],
    gate: 'Nothing in the nav links to /reel',
    todo: ['Decide whether it gets a place on the homepage or in the header', 'An MP4 export for sharing, if wanted'],
  },
  {
    id: 'home-carousels',
    name: 'Homepage carousels',
    status: 'flag',
    since: '2026-10-15',
    summary: 'Products and case studies as one large playing preview at a time, in place of the tiles. The first take on showing the work instead of listing it.',
    links: [{ label: 'Carousels', href: '/?home=carousel#work' }],
    gate: 'Homepage work in the flag drawer (Cmd+K), or ?home=carousel; components/ShowcaseCarousel.tsx and content/showcase.ts',
    todo: ['Superseded by the showcase variants; delete once one of those is chosen'],
  },
  {
    id: 'variants',
    name: 'Homepage variants',
    status: 'unlisted',
    since: '2026-09-27',
    summary: 'Two alternative homepage directions as static HTML, plus a case study page in the Brand style.',
    links: [
      { label: 'Launch pad', href: '/variants' },
      { label: 'Brand', href: '/variants/brand' },
      { label: 'Showcase', href: '/variants/showcase' },
      { label: 'Brand: SEEK', href: '/variants/brand/seek' },
      { label: 'Brand: Best Practice', href: '/variants/brand/best-practice' },
    ],
    gate: 'Rewrites and noindex headers in next.config.mjs; files in public/variants',
    todo: ['Pick a direction to take into the real homepage, or delete public/variants and the rewrites'],
  },
  {
    id: 'projects-page',
    name: 'Projects page',
    status: 'unlisted',
    since: '2026-10-15',
    summary: 'The list of every project. It left the top nav when the homepage started leading with the three case studies.',
    links: [{ label: 'Projects', href: '/projects' }],
    gate: 'Not in the header (src/components/Header.tsx). The homepage still links to it from the case studies section',
    todo: ['Decide whether the homepage link stays, or the page goes too'],
  },
  {
    id: 'playground',
    name: 'Playground',
    status: 'unlisted',
    since: '2026-08-11',
    summary: 'A staging page for components. It holds the Lifeline career timeline, which is not used anywhere else yet, and the Venn skills from the CV.',
    links: [{ label: 'Playground', href: '/playground' }],
    gate: 'Nothing links to it; specimens are in src/app/playground/specimens.tsx',
    todo: ['Decide whether the Lifeline goes on the site (homepage or CV) or gets removed with src/components/lifeline'],
  },
  {
    id: 'feed',
    name: 'Feed',
    status: 'flag',
    since: '2026-02-05',
    summary: 'A feed view of the site’s content. The page is reachable by URL; only the header link is flagged.',
    links: [{ label: 'Feed', href: '/feed' }],
    gate: 'feedPage in the flag drawer (Cmd+K), which shows the header link',
    todo: ['Launch it by showing the link for everyone, or delete src/app/feed and the flag'],
  },
  {
    id: 'flags',
    name: 'Flagged experiments',
    status: 'flag',
    since: '2026-02-20',
    summary: 'Visual experiments that are off by default: the particle field on the homepage, the animated signature (clip-path or Penflow) and the warm colour mode.',
    links: [{ label: 'Homepage', href: '/' }],
    gate: 'particleField, signatureVariant and warmth in the flag drawer (Cmd+K); defaults in src/context/FeatureFlagContext.tsx',
    todo: ['For each one: turn it on by default, or delete the flag and its component'],
  },
]
