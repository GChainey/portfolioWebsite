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
    id: 'website-study',
    name: 'Website case study (Coming soon)',
    status: 'local',
    since: '2026-10-08',
    summary: 'The second of the three main case studies, about building a website from an HTML brand. The homepage shows its card as Coming soon with no link, and the page itself only opens on the dev server.',
    links: [{ label: 'Website study', href: '/projects/html-brand-website' }],
    gate: "`status: 'Coming soon'` on the html-brand-website project in src/content/projects.ts, and `comingSoon` on its card in src/app/page.tsx",
    todo: [
      'Say which website it is about, and write its real content: it is a stub built from two lines',
      'Fill its four visual slots (public/case-studies/html-brand-website)',
      'Then remove the Coming soon status and the comingSoon flag',
    ],
  },
  {
    id: 'case-study-visuals',
    name: 'Case study visuals still to come',
    status: 'local',
    since: '2026-10-08',
    summary: 'Media slots that have no file yet. On the dev server each is a labelled placeholder with a brief, or the file itself once it is in the folder. The live page leaves them out.',
    links: [
      { label: 'RFP', href: '/projects/rfp' },
      { label: 'Website', href: '/projects/html-brand-website' },
    ],
    gate: '`pending: true` on the media blocks in src/content/projects.ts',
    todo: [
      'RFP: the scale clip (council to state) and the iteration clip (a requirement change) are missing',
      'Website study: all four',
      'For each one that lands, delete `pending` and `brief` from its block',
      'The Daisy workspace also made a combined reel.mp4 that is not used anywhere yet',
    ],
  },
  {
    id: 'gallery',
    name: 'Gallery',
    status: 'local',
    since: '2026-10-07',
    summary: 'A bento grid of real screens and prototypes that open in a dialog. On the homepage it is a Page / Visuals switch under the hero, not a section; there is also a header link.',
    links: [
      { label: 'Gallery', href: '/gallery' },
      { label: 'Edit mode', href: '/gallery?edit' },
    ],
    gate: 'GALLERY_LIVE in src/components/Gallery.tsx and LIVE in public/gallery/gallery.js (flip both)',
    todo: ['Decide what goes in it: edit mode hides tiles, content is public/gallery/items.json'],
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
