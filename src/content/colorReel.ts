import { reelDuration, type ShowcaseScene as ReelScene } from '@/components/showcase/ShowcaseReel'

// The Interaction of Color series as one reel: every chapter's exercise, a few seconds each,
// with what you do in it and what it teaches. Each scene is an HTML recording of the real page
// (public/replays/color, recorded by .context/color-clips.mjs), cropped to the exercise.
//
// A recording ends on its last change, so `to` runs a little past it to hold the result. Every
// clip is cropped to the page's 896px column; `h` is how tall the exercise is.

type Clip = { slug: string; to: number; h: number; kicker: string; title: string; sub: string }

const SECS = 4.6

// A chapter's clip, sped up or slowed to last SECS on screen
const at = ({ slug, to, h, ...caption }: Clip): ReelScene => {
  const from = 0.4
  const end = to + 0.9
  return { src: `/replays/color/${slug}.json`, region: { x: 192, y: 12, width: 896, height: h }, from, to: end, rate: (end - from) / SECS, layout: 'stack', ...caption }
}
const card = (title: string, secs: number, kicker?: string, sub?: string): ReelScene => ({ layout: 'center', title, kicker, sub, hold: secs })

const CLIPS: Clip[] = [
  { slug: 'recollection', to: 10.5, h: 450, kicker: 'I · Visual memory', title: 'Nobody remembers a colour exactly', sub: 'Make the red in your head, then Coca-Cola red from memory' },
  { slug: 'contexture', to: 6.9, h: 460, kicker: 'II · Reading colour', title: 'One colour reads differently in every chord', sub: 'Count the colours in four chords. There is only one' },
  { slug: 'paper', to: 9.6, h: 683, kicker: 'III · Colour paper', title: 'A paper is the same colour every time', sub: 'Cut flat papers out of a photo and keep them as a palette' },
  { slug: 'relativity', to: 6.9, h: 450, kicker: 'IV · Relativity', title: 'The ground changes the colour on it', sub: 'Two rectangles look different. Join them to see they match' },
  { slug: 'lightness', to: 6.8, h: 390, kicker: 'V · Lighter or darker', title: 'Most people can’t tell which hue is darker', sub: 'Pick the darker of two colours and get a measured answer' },
  { slug: 'reversed-grounds', to: 7.9, h: 508, kicker: 'VI · 1 colour as 2', title: 'Only the true middle echoes both grounds', sub: 'Find the colour that looks like each opposite ground' },
  { slug: 'subtraction', to: 8.6, h: 378, kicker: 'VII · Subtraction', title: 'A ground takes its own colour away', sub: 'Put three reds on a red that matches one, and lose it' },
  { slug: 'after-image', to: 6.1, h: 488, kicker: 'VIII · After-image', title: 'A tired eye sees the opposite colour', sub: 'Stare at the dot, and the screen turns the circle white' },
  { slug: 'transparence', to: 5.7, h: 548, kicker: 'IX · Transparence', title: 'The right in-between colour turns paper clear', sub: 'Imagine the green between a blue and a yellow' },
  { slug: 'factual-mixtures', to: 8, h: 480, kicker: 'X · Factual mixtures', title: 'Light mixes lighter, ink mixes darker', sub: 'Drag coloured lights over each other' },
  { slug: 'space', to: 10, h: 615, kicker: 'XI · Space illusion', title: 'The colour a mixture leans to sits on top', sub: 'Slide the mixture between its parents' },
  { slug: 'optical-mixture', to: 10.6, h: 538, kicker: 'XII · Optical mixture', title: 'Small dots mix in the eye', sub: 'Shrink two colours of dots until they become one' },
  { slug: 'bezold', to: 9, h: 494, kicker: 'XIII · The Bezold Effect', title: 'Change one colour and the whole design changes', sub: 'Turn a rug’s lines from black to white' },
  { slug: 'intervals', to: 5.5, h: 460, kicker: 'XIV · Colour intervals', title: 'Keep the steps and the tune survives', sub: 'Move four colours up a key, then swap their centres' },
  { slug: 'intersecting', to: 7, h: 460, kicker: 'XV · Intersecting colours', title: 'A true middle colour looks like both parents', sub: 'Pull the dark sheet and watch the strip split in two' },
  { slug: 'quantity', to: 6.3, h: 621, kicker: 'XVI · Quantity', title: 'How much matters as much as which', sub: 'Four colours, four performances, four moods' },
  { slug: 'film-volume', to: 5, h: 344, kicker: 'XVII · Volume colour', title: 'Depth deepens a clear liquid’s colour', sub: 'Pour more coffee into the glass' },
  { slug: 'free-studies', to: 7, h: 589, kicker: 'XVIII · Free studies', title: 'In stripes you notice colour, not shape', sub: 'Shuffle four colours until none of them dominates' },
  { slug: 'masters', to: 10.5, h: 535, kicker: 'XIX · The Masters', title: 'A painting’s climate fits in a few papers', sub: 'Cluster a painting’s colours into flat papers' },
  { slug: 'weber-fechner', to: 6.7, h: 438, kicker: 'XX · Weber-Fechner', title: 'Equal coats don’t make equal steps', sub: 'Lay one thin tint over itself ten times' },
  { slug: 'temperature', to: 3, h: 406, kicker: 'XXI · Temperature', title: 'Warm and cool depend on the neighbour', sub: 'The same violet on red and on blue' },
  { slug: 'vibrating', to: 6, h: 510, kicker: 'XXII · Vibrating boundaries', title: 'Contrasting hues at equal light shimmer', sub: 'Slide two hues to the same lightness' },
  { slug: 'vanishing', to: 5.6, h: 499, kicker: 'XXIII · Vanishing boundaries', title: 'Equal light makes an edge disappear', sub: 'Tune the grey-green until the triangles dissolve' },
  { slug: 'systems', to: 2.5, h: 609, kicker: 'XXIV · Colour systems', title: 'A system’s equal steps aren’t equal to the eye', sub: 'Turn HSV and OKLCH hue wheels grey' },
  { slug: 'teaching', to: 8.8, h: 406, kicker: 'XXV · Teaching colour', title: 'What is there isn’t what we see', sub: 'Flip each illusion between factual and actual' },
]

export const COLOR_REEL: ReelScene[] = [
  card('Interaction of Color', 3, 'Josef Albers, rebuilt for the screen', '25 exercises, one at a time'),
  ...CLIPS.map(at),
  card('Colour is the most relative medium in art.', 3.5, 'Josef Albers', 'Try every exercise at garethchainey.com/color'),
]

export const colorReelSeconds = () => reelDuration(COLOR_REEL)
