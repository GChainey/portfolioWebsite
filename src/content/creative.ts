import type { Study } from '@/components/site/case-study'

// Creative work: posters and other fun studies, on the short case-study template (/creative/<slug>,
// dev server only for now). Copy from the work itself: the Paper boards' own notes (Studies file,
// pages "Saetia" and "Saetia v2") and the recovered tool (public/posters/saetia/tool).

const S = '/posters/saetia/study'
// Bump when the files behind these URLs change, so browsers don't show a cached copy
const V = 'v=5'

export const CREATIVE: Study[] = [
  {
    slug: 'saetia',
    label: 'Saetia at Saint Vitus',
    meta: 'Poster study, 2026',
    lead: 'A poster for a gig, and a tool to move it.',
    rest: 'Type, colour and a shader, practised on a night out.',
    rows: [
      ['Event', 'Ink & Dagger with Saetia, Saint Vitus, 30 October 2026'],
      ['Made in', 'Paper, then code'],
      ['Shipped', 'Posters, posts and a 9:16 clip'],
    ],
    blocks: [
      { moment: { live: `/posters/saetia/explainer/index.html?live&${V}`, ratio: 1, title: 'How the Saetia poster was made, running live' }, line: 'The process in 24 seconds. It runs live: the shader is real, not a video.' },

      {
        lead: 'Paper first.',
        rest: 'References, a few colours, a layout.',
        body: 'I started from the records: a Garamond on charcoal, a blurred photo with a deckled edge, hand-stamped chipboard, lyrics photocopied white on black. Then a plain poster in Paper to try colour and where the name sits.',
      },
      { moment: { image: `${S}/IC-0.webp?${V}`, alt: 'A moodboard of Saetia covers and inserts from 1997 to 2016, with grounds and inks sampled from them' }, line: 'The moodboard: the covers and inserts, and the grounds and inks pulled from them.' },

      {
        lead: 'Then AI made 32 more.',
        rest: 'Fast, varied and mostly wrong, which is the point.',
        body: 'An agent working in Paper drew 32 variations from a list of dials: ground, texture opacity, contrast, scale and type size. Each board is named by its settings, so a favourite can be rebuilt from its name.',
      },
      { moment: { image: `${S}/wall-32.webp?${V}`, alt: 'All 32 AI variations of the Saetia poster: grounds from tan to oxblood, single-ink and misregistered marks, type from small to cropped' }, line: 'All 32, from tan to oxblood, small type to cropped.' },

      {
        lead: 'The best part was an accident.',
        rest: 'Fitting the font, two printings landed on each other.',
        body: 'Redrawing the 2001 cover’s wordmark in EB Garamond, the redraw and the original came out printed over each other: red where only the original sits, cyan where only the copy does, ink where they agree. It looked like a press that slipped, so it stayed.',
      },
      { moment: { image: `${S}/JE-0-word.webp?${V}`, alt: 'SAETIA in red, cyan and black, the two printings slightly out of register on pink' }, line: 'The misregistered mark: the cover’s letters in red, plain EB Garamond in cyan.' },

      {
        lead: 'A style, written down.',
        rest: 'Three layers: ground, texture, mark.',
        body: 'Before more variations I put the rules on one board: two marks, four type sizes, the layout, the texture’s dials, and which ink goes on which ground. Then I changed one dial at a time.',
      },
      { moment: { image: `${S}/KY-0.webp?${V}`, alt: 'The poster kit: two marks, a type scale, the layout, texture dials and grounds' }, line: 'The poster kit.' },

      { lead: 'Variations, one dial at a time.', rest: 'Layouts, then 20 grounds.' },
      { moment: { stills: [`${S}/113-0.webp?${V}`, `${S}/17D-0.webp?${V}`, `${S}/1VI-0.webp?${V}`, `${S}/1W6-0.webp?${V}`] }, line: 'Two layouts, and two of the 20 grounds.' },

      {
        lead: 'A shader, and a tool to move it.',
        rest: 'Built in code, so the poster could breathe.',
        body: 'The texture is Paper’s Halftone Dots over a CRT capture from Computer Graphics and Art (May 1976, Figure 4, by Charles J. Fritchie and Robert H. Morriss). In code I pushed the image around with slowly moving noise, and made sliders for how far it travels, how the dots swell and how much their size moves.',
      },
      { moment: { image: `/posters/saetia/cga-1976-05-p5.webp?${V}`, alt: 'Page 5 of Computer Graphics and Art, May 1976: Inexpensive Graphics from a Storage Cathode Ray Tube, with Figure 4, white circles on black' }, line: 'Where the texture came from: Figure 4, white lines on a storage CRT, photographed in 1976.' },
      { moment: { live: `/posters/saetia/tool/index.html?${V}`, ratio: 720 / 540, title: 'The Saetia moving halftone tool, live' }, line: 'The tool itself, live. Drag the sliders.' },

      { lead: 'Posters and posts.', rest: 'The clip I posted, and the poster, live.' },
      { moment: { video: `/posters/saetia/saetia-variations-flick-4x5.mp4?${V}`, ratio: 4 / 5, fill: true }, line: 'The clip I posted: the finals, flicked through.' },
      { moment: { live: `/posters/saetia/tool/index.html?poster&${V}`, ratio: 720 / 560, title: 'The Saetia poster, live, with arrows to change the ground' }, line: 'The poster, live. Use the arrows to change the ground.' },
    ],
  },
  {
    slug: 'whyte',
    label: 'What to Remember When Waking',
    meta: 'Poster study, 2026',
    lead: 'A poster for a morning of poetry, made to look half awake.',
    rest: 'Irish letters, light through stained glass, and a tool to make it breathe.',
    rows: [
      ['Event', 'A Morning with David Whyte, Marble Collegiate Church, New York, 14 November 2026'],
      ['Made in', 'Paper, then code'],
      ['Shipped', 'A 14 second loop for X, and the poster live'],
    ],
    blocks: [
      { moment: { live: `/posters/whyte/explainer/index.html?live&${V}`, ratio: 1, title: 'How the David Whyte poster was made, running live' }, line: 'The process in 20 seconds. It runs live: the poster and the studio are real, not a video.' },


      {
        lead: 'Irish letters.',
        rest: 'From the stone to the scriptorium to the printed book.',
        body: 'Sixteen faces I could use straight away: Ogham, the earliest Irish writing, cut into the edge of a stone; uncial hands from the manuscripts; letterpress and book faces; and quieter serifs for the voice of the poem. Most are Irish in style, not by maker. The real Irish type, Colmcille, I’d have to buy.',
      },
      { moment: { image: `/posters/whyte/study/229-0-top.webp?${V}`, alt: 'A type specimen board of Irish and Irish-styled fonts, each setting What to Remember When Waking' }, line: 'The top of the type board: stone, then the scriptorium.' },

      {
        lead: 'Moodboards.',
        rest: 'A book cover, the church, the island, and colour from both cities.',
        body: 'One idea was mine from the start: the cover of The Elements of Typographic Style, black cloth and a serious serif, with Irish accents in place of its spray of letters. Then the room itself, marble and Tiffany glass, beside an Ogham stone and the Book of Kells, and palettes that pair an Irish scene with a New York one.',
      },
      { moment: { stills: [`/posters/whyte/study/25M-0.webp?${V}`, `/posters/whyte/study/27L-0.webp?${V}`, `/posters/whyte/study/295-0.webp?${V}`, `/posters/whyte/study/2BU-0.webp?${V}`] }, line: 'The Elements in Irish; marble, glass, stone and vellum; six directions; Irish × New York.' },

      {
        lead: 'A lens on morning light.',
        rest: 'Paper’s Lens Distortion over light through stained glass.',
        body: 'The image that stuck was morning light coming through stained glass onto a wall. Put through a lens shader, split into colour and smeared, it already looked like the moment before you wake.',
      },
      { moment: { image: `/posters/whyte/study/29O-0.webp?${V}`, alt: 'Warm stained-glass light, blurred and split into colour by a lens distortion shader' }, line: 'The lens, in Paper.' },

      { lead: 'Type on the lens.', rest: 'Five ways to read it half awake.' },
      { moment: { image: `/posters/whyte/study/2KN-0.webp?${V}`, alt: 'Five posters: type coming into focus, type lit like light on a wall, two dark eyelids, Ogham in the leading, and one giant faint word' }, line: 'Coming into focus, light on the wall, eyelids, Ogham in the leading, half-remembered.' },

      {
        lead: 'A studio to move it.',
        rest: 'The lens has no clock, so I gave it one.',
        body: 'In code, every setting of the shader became a slider, and motion eased them back and forth: flow, turn, colour drift, and breathe, which swings the colour split in and out of focus. The eyelids won: two dark bands, the glass breathing between them.',
      },
      { moment: { live: `/posters/whyte?embed&look=eyelids&${V}`, ratio: 720 / 560, title: 'The David Whyte poster studio, live' }, line: 'The studio itself, live. Drag the sliders.' },

      { lead: 'The loop I posted.', rest: 'The eyes open, the glass breathes, the eyes close.' },
      { moment: { video: `/posters/whyte/whyte-eyelids-loop.mp4?${V}`, ratio: 1080 / 1530, fill: true }, line: '14 seconds, 60fps, for X.' },
    ],
  },
]

export const creativeBySlug = (slug: string) => CREATIVE.find((s) => s.slug === slug)
