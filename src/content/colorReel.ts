import type { ShowcaseScene as ReelScene } from '@/components/showcase/ShowcaseReel'

// The Interaction of Color series as a reel, in three cuts: a few studies, a few seconds each,
// with what you do in it and what it teaches. Each scene is an HTML recording of the real page
// (public/replays/color, recorded by .context/color-clips.mjs), cropped to the exercise.
//
// A recording ends on its last change, so `to` runs a little past it to hold the result. Every
// clip is cropped to the page's 896px column; `h` is how tall the exercise is.

type Clip = { slug: string; to: number; h: number; secs?: number; name: string; title: string; sub: string; quote: string }

const SECS = 4.6

// A study's clip, sped up or slowed to last SECS on screen (or its own secs)
const clip = ({ slug, to, h, secs = SECS }: Clip, layout: ReelScene['layout']) => {
  const from = 0.4
  const end = to + 0.9
  return { src: `/replays/color/${slug}.json`, region: { x: 192, y: 12, width: 896, height: h }, from, to: end, rate: (end - from) / secs, layout }
}
const card = (title: string, secs: number, kicker?: string, sub?: string): ReelScene => ({ layout: 'center', title, kicker, sub, hold: secs })
const study = (i: number) => `Study ${i + 1}`

const CLIPS: Clip[] = [
  { slug: 'recollection', to: 10.5, h: 450, name: 'Visual memory', title: 'Nobody remembers a colour exactly', sub: 'Make the red in your head, then Coca-Cola red from memory', quote: 'It is hard, if not impossible, to remember distinct colors.' },
  { slug: 'contexture', to: 6.8, h: 420, name: 'Reading colour', title: 'One colour reads differently in every chord', sub: 'Count the colours in four chords. There is only one', quote: 'We almost never … see a single color unconnected and unrelated to other colors.' },
  { slug: 'paper', to: 9.5, h: 659, name: 'Colour paper', title: 'A paper is the same colour every time', sub: 'Cut flat papers out of a photo and keep them as a palette', quote: 'This offers a training which no palette can provide.' },
  { slug: 'relativity', to: 6.8, h: 450, name: 'Relativity', title: 'The ground changes the colour on it', sub: 'Two rectangles look different. Join them to see they match', quote: 'The first exercise is to make one and the same color look different.' },
  { slug: 'lightness', to: 6.7, h: 390, name: 'Lighter or darker', title: 'Most people can’t tell which hue is darker', sub: 'Pick the darker of two colours and get a measured answer', quote: 'They are to select and to record which color in a pair is the darker.' },
  { slug: 'reversed-grounds', to: 7.9, h: 508, name: '1 colour as 2', title: 'Only the true middle echoes both grounds', sub: 'Find the colour that looks like each opposite ground', quote: 'The changed color is to echo the 2 changing ones.' },
  { slug: 'subtraction', to: 8.5, h: 378, name: 'Subtraction', title: 'A ground takes its own colour away', sub: 'Put three reds on a red that matches one, and lose it', quote: 'Any ground subtracts its own hue from colors which it carries and therefore influences.' },
  { slug: 'after-image', to: 6.1, h: 532, name: 'After-image', title: 'A tired eye sees the opposite colour', sub: 'Stare at the dot, and the screen turns the circle white', quote: 'One soon discovers how difficult it is to keep the eye fixed on a point.' },
  { slug: 'transparence', to: 5.7, h: 548, name: 'Transparence', title: 'The right in-between colour turns paper clear', sub: 'Imagine the green between a blue and a yellow', quote: 'It is a challenge to study color mixture in our imagination, that is, so to say, with closed eyes.' },
  { slug: 'factual-mixtures', secs: 6.5, to: 14.1, h: 640, name: 'Factual mixtures', title: 'Light mixes lighter, ink mixes darker', sub: 'Make a crossing lighter than both, then darker than both', quote: 'Every one of these mixtures is lighter than any of the mixture parents.' },
  { slug: 'space', to: 10.0, h: 615, name: 'Space illusion', title: 'The colour a mixture leans to sits on top', sub: 'Slide the mixture between its parents', quote: 'A third deception is recognized: space-illusion.' },
  { slug: 'optical-mixture', to: 10.6, h: 538, name: 'Optical mixture', title: 'Small dots mix in the eye', sub: 'Shrink two colours of dots until they become one', quote: 'This effect depends on size and on distance.' },
  { slug: 'bezold', to: 9.7, h: 459, name: 'The Bezold Effect', title: 'Change one colour and the whole design changes', sub: 'Match the red with black lines, then with white', quote: 'Change the color combinations of his rug designs entirely by adding or changing 1 color only.' },
  { slug: 'intervals', to: 5.5, h: 460, name: 'Colour intervals', title: 'Keep the steps and the tune survives', sub: 'Move four colours up a key, then swap their centres', quote: 'The only way in which the 2 groups can be compared easily and accurately is to superimpose 1 group on the other.' },
  { slug: 'intersecting', to: 7.0, h: 460, name: 'Intersecting colours', title: 'A true middle colour looks like both parents', sub: 'Pull the dark sheet and watch the strip split in two', quote: 'A true middle mixture is distinguished by being equidistant—in light and in hue—from either mixture parent.' },
  { slug: 'quantity', to: 6.3, h: 645, name: 'Quantity', title: 'How much matters as much as which', sub: 'Four colours, four performances, four moods', quote: 'Yellow, the lightest color, appears in the smaller amount.' },
  { slug: 'film-volume', to: 5.5, h: 402, name: 'Volume colour', title: 'Depth deepens a clear liquid’s colour', sub: 'Pour more coffee into the glass', quote: 'Though all 3 containers hold the same coffee, the containers show this coffee in 3 different browns.' },
  { slug: 'free-studies', to: 7.0, h: 640, name: 'Free studies', title: 'In stripes you notice colour, not shape', sub: 'Shuffle four colours until none of them dominates', quote: 'All 4 colors are equally important, or, respectively, equally unimportant.' },
  { slug: 'masters', to: 10.4, h: 535, name: 'The Masters', title: 'A painting’s climate fits in a few papers', sub: 'Cluster a painting’s colours into flat papers', quote: 'We try to give a general impression only as to climate, temperature, aroma, or sound of their work.' },
  { slug: 'weber-fechner', to: 6.9, h: 438, name: 'Weber-Fechner', title: 'Equal coats don’t make equal steps', sub: 'Lay one thin tint over itself ten times', quote: 'In a geometric order the boundaries remain equally distinct.' },
  { slug: 'temperature', to: 3.0, h: 406, name: 'Temperature', title: 'Warm and cool depend on the neighbour', sub: 'The same violet on red and on blue', quote: 'There are also warm blues and cool reds possible within their own hues.' },
  { slug: 'vibrating', to: 6.5, h: 521, name: 'Vibrating boundaries', title: 'Contrasting hues at equal light shimmer', sub: 'Slide two hues to the same lightness', quote: 'Contrasting in their hues but also close or similar in light intensity.' },
  { slug: 'vanishing', to: 8.0, h: 625, name: 'Vanishing boundaries', title: 'Equal light makes an edge disappear', sub: 'Move both colours until the triangles dissolve', quote: 'So that the small triangles of the underlying design almost dissolve into the ground.' },
  { slug: 'systems', to: 2.5, h: 609, name: 'Colour systems', title: 'A system’s equal steps aren’t equal to the eye', sub: 'Turn HSV and OKLCH hue wheels grey', quote: 'We also show the limitations of the systems, particularly in connection with painting.' },
  { slug: 'teaching', to: 8.9, h: 406, name: 'Teaching colour', title: 'What is there isn’t what we see', sub: 'Flip each illusion between factual and actual', quote: 'When we see opaque color as transparent … these effects we call actual facts.' },
]

// The reel plays a few studies and links to them; the rest are on /color
const PICKS = ['relativity', 'after-image', 'transparence', 'optical-mixture', 'bezold', 'vanishing']
const FEATURED = CLIPS.map((c, i) => ({ ...c, n: i })).filter((c) => PICKS.includes(c.slug))
export const COLOR_REEL_STUDIES = FEATURED.map(({ slug, n, name, title }) => ({ slug, study: study(n), name, title }))

const intro = card('Interaction of Color', 3, 'Josef Albers, rebuilt for the screen', `${FEATURED.length} of the 25 studies`)
const outro = card('Colour is the most relative medium in art.', 3.5, 'Josef Albers', 'Try all 25 studies at garethchainey.com/color')

// Three cuts of the same 25 studies, to compare
export const COLOR_REEL_STYLES = {
  // The words rise in, lift away, then the study plays on its own
  text: {
    label: 'Text first',
    scenes: [
      { ...intro, lines: true },
      ...FEATURED.flatMap((c): ReelScene[] => [
        { layout: 'center', lines: true, kicker: `${study(c.n)}\u2003${c.name}`, title: c.title, sub: c.sub, hold: 2.2 },
        { ...clip(c, 'bare'), title: c.title },
      ]),
      { ...outro, lines: true },
    ],
  },
  // The lesson as a title above the study, both on screen together
  title: {
    label: 'Title and study',
    scenes: [
      intro,
      ...FEATURED.map((c): ReelScene => ({ ...clip(c, 'stack'), kicker: `${study(c.n)}\u2003${c.name}`, title: c.title })),
      outro,
    ],
  },
  // Albers' own sentence beside the study it became
  words: {
    label: 'In his words',
    scenes: [
      intro,
      ...FEATURED.map((c): ReelScene => ({ ...clip(c, 'side'), kicker: study(c.n), title: c.name, quote: c.quote })),
      outro,
    ],
  },
} satisfies Record<string, { label: string; scenes: ReelScene[] }>

export type ColorReelStyle = keyof typeof COLOR_REEL_STYLES
