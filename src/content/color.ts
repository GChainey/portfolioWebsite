// Reading Josef Albers' Interaction of Color (1963) one chapter at a time, and rebuilding each
// exercise for the browser. Albers worked with sheets of coloured paper. On a screen you can change
// a colour and see the effect straight away.
//
// Not in production yet: there is one chapter. Flip once there are enough to be worth a visit.
export const COLOR_LIVE = process.env.NODE_ENV === 'development'

export interface ColorChapter {
  numeral: string
  slug: string
  // Albers' chapter title, as printed
  title: string
  // One line on what the exercise lets you try
  blurb: string
  // What reading it and building it taught me
  learned: string[]
}

export const COLOR_CHAPTERS: ColorChapter[] = [
  {
    numeral: 'I',
    slug: 'recollection',
    title: 'Color recollection—visual memory',
    blurb: 'Pick the red in your head, then Coca-Cola red from memory, then a colour you saw two seconds ago.',
    learned: [
      '"Red" means a different red to everyone who hears it',
      'People get Coca-Cola red wrong from memory, after seeing it thousands of times',
      'About 30 names cover millions of colours, so most wrong guesses still get the right name',
      'Design systems should specify colours as values, not words, and teams should compare them side by side',
    ],
  },
  {
    numeral: 'II',
    slug: 'contexture',
    title: 'Color reading and contexture',
    blurb: 'TODO',
    learned: ['TODO'],
  },
  {
    numeral: 'III',
    slug: 'paper',
    title: 'Why color paper—instead of pigment and paint',
    blurb: 'TODO',
    learned: ['TODO'],
  },
  {
    numeral: 'IV',
    slug: 'relativity',
    title: 'A color has many faces—the relativity of color',
    blurb: 'Make one colour look like two by changing what is around it, then measure how far it moves your eye.',
    learned: [
      'A colour changes with its ground. The same grey looks lighter on black than on white',
      'Grounds change a colour in two ways, through light and through hue, and usually both at once',
      'Muted, middle colours change the most. Strong, saturated ones hardly move',
      "Knowing the two rectangles match doesn't stop them looking different",
      'In a UI, a token looks different on every background it sits on, so check colours in place, not on a swatch sheet',
    ],
  },
  {
    numeral: 'V',
    slug: 'lightness',
    title: 'Lighter and/or darker—light intensity, lightness',
    blurb: 'TODO',
    learned: ['TODO'],
  },
  {
    numeral: 'VI',
    slug: 'reversed-grounds',
    title: '1 color appears as 2—looking like the reversed grounds',
    blurb: 'TODO',
    learned: ['TODO'],
  },
  {
    numeral: 'VII',
    slug: 'subtraction',
    title: '2 different colors look alike—subtraction of color',
    blurb: 'TODO',
    learned: ['TODO'],
  },
  {
    numeral: 'VIII',
    slug: 'after-image',
    title: 'Why color deception?—after-image, simultaneous contrast',
    blurb: 'TODO',
    learned: ['TODO'],
  },
  {
    numeral: 'IX',
    slug: 'transparence',
    title: 'Color mixture in paper—illusion of transparence',
    blurb: 'TODO',
    learned: ['TODO'],
  },
  {
    numeral: 'X',
    slug: 'factual-mixtures',
    title: 'Factual mixtures—additive and subtractive',
    blurb: 'TODO',
    learned: ['TODO'],
  },
  {
    numeral: 'XI',
    slug: 'space',
    title: 'Transparence and space-illusion',
    blurb: 'TODO',
    learned: ['TODO'],
  },
  {
    numeral: 'XII',
    slug: 'optical-mixture',
    title: 'Optical mixture—after-image revised',
    blurb: 'TODO',
    learned: ['TODO'],
  },
  {
    numeral: 'XIII',
    slug: 'bezold',
    title: 'The Bezold Effect',
    blurb: 'TODO',
    learned: ['TODO'],
  },
  {
    numeral: 'XIV',
    slug: 'intervals',
    title: 'Color intervals and transformation',
    blurb: 'TODO',
    learned: ['TODO'],
  },
  {
    numeral: 'XV',
    slug: 'intersecting',
    title: 'The middle mixture again—intersecting colors',
    blurb: 'TODO',
    learned: ['TODO'],
  },
  {
    numeral: 'XVI',
    slug: 'quantity',
    title: 'Color juxtaposition—harmony—quantity',
    blurb: 'TODO',
    learned: ['TODO'],
  },
  {
    numeral: 'XVII',
    slug: 'film-volume',
    title: 'Film color and volume color—2 natural effects',
    blurb: 'TODO',
    learned: ['TODO'],
  },
  {
    numeral: 'XVIII',
    slug: 'free-studies',
    title: 'Free studies—a challenge to imagination',
    blurb: 'TODO',
    learned: ['TODO'],
  },
  {
    numeral: 'XIX',
    slug: 'masters',
    title: 'The Masters—color instrumentation',
    blurb: 'TODO',
    learned: ['TODO'],
  },
  {
    numeral: 'XX',
    slug: 'weber-fechner',
    title: 'The Weber-Fechner Law—the measure in mixture',
    blurb: 'TODO',
    learned: ['TODO'],
  },
  {
    numeral: 'XXI',
    slug: 'temperature',
    title: 'From color temperature to humidity in color',
    blurb: 'TODO',
    learned: ['TODO'],
  },
  {
    numeral: 'XXII',
    slug: 'vibrating',
    title: 'Vibrating boundaries—enforced contours',
    blurb: 'TODO',
    learned: ['TODO'],
  },
  {
    numeral: 'XXIII',
    slug: 'vanishing',
    title: 'Equal light intensity—vanishing boundaries',
    blurb: 'TODO',
    learned: ['TODO'],
  },
  {
    numeral: 'XXIV',
    slug: 'systems',
    title: 'Color theories—color systems',
    blurb: 'TODO',
    learned: ['TODO'],
  },
  {
    numeral: 'XXV',
    slug: 'teaching',
    title: 'On teaching color—some color terms',
    blurb: 'TODO',
    learned: ['TODO'],
  },
]

// Coca-Cola red as Coca-Cola puts it on screen: the round sign on coca-cola.com, an sRGB PNG,
// measured pixel by pixel (Oct 2026). public/color/coca-cola-sign.svg redraws it sharp in this red.
export const COKE_RED = '#f40000'

// There is no published screen value: colour sites disagree, and Coca-Cola's own site uses three.
export const COKE_REDS = [
  { hex: '#f40000', where: 'The round sign' },
  { hex: '#e61d2b', where: 'The wordmark' },
  { hex: '#ea0000', where: 'Buttons and icons' },
]
