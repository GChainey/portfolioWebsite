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
    id: 'gallery',
    name: 'Gallery',
    status: 'local',
    since: '2026-10-07',
    summary: 'A bento grid of real screens and prototypes that open in a dialog, with a homepage section and a header link.',
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
    summary: 'Homepage A/B variants: static HTML (Brand, Showcase) plus Next.js Show and Think on the launch pad.',
    links: [
      { label: 'Launch pad', href: '/variants' },
      { label: 'Show (visual bento)', href: '/variants/show' },
      { label: 'Think (AI-native)', href: '/variants/think' },
      { label: 'Brand', href: '/variants/brand' },
      { label: 'Showcase', href: '/variants/showcase' },
      { label: 'Brand: SEEK', href: '/variants/brand/seek' },
      { label: 'Brand: Best Practice', href: '/variants/brand/best-practice' },
    ],
    gate: 'Rewrites and noindex headers in next.config.mjs; Show/Think are App Router pages under /variants/*',
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
