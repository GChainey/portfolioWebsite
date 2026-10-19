// Reading Josef Albers' Interaction of Color (1963) one chapter at a time, and rebuilding each
// exercise for the browser. Albers worked with sheets of coloured paper. On a screen you can change
// a colour and see the effect straight away.
//
// Not in production yet. Flip once there are enough chapters to be worth a visit. On in local dev
// and on Vercel preview deployments, so each new chapter can be reviewed on its PR.
export const COLOR_LIVE = process.env.NODE_ENV === 'development' || process.env.VERCEL_ENV === 'preview'

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
    title: 'Lighter and/or darker: light intensity, lightness',
    blurb: 'Pick the darker of two colours, eight times. Then settle a hard pair with an after-image, and find a pair of your own.',
    learned: [
      'Telling lighter from darker gets hard as soon as the two colours are different hues, even after a lifetime of reading black-and-white photos',
      '"I can\'t tell" is a useful answer. It is more honest than a guess, and it shows which pairs need another look',
      'A desaturate filter is not proof. Averaging R, G and B gets five of the eight test pairs the wrong way round',
      'An after-image can settle a pair the eye can\'t, but often only one of the two orders gives the right answer',
      'In a UI, check which colour is lighter with a lightness measure, not by eye and not with a greyscale filter',
    ],
  },
]

// Albers' result for the which-is-darker test, constant over a number of years of his classes,
// not counting the undecided cases
export const ALBERS_DARKER_TEST = { right: 40, wrong: 60 }

// Coca-Cola red as Coca-Cola puts it on screen: the round sign on coca-cola.com, an sRGB PNG,
// measured pixel by pixel (Oct 2026). public/color/coca-cola-sign.svg redraws it sharp in this red.
export const COKE_RED = '#f40000'

// There is no published screen value: colour sites disagree, and Coca-Cola's own site uses three.
export const COKE_REDS = [
  { hex: '#f40000', where: 'The round sign' },
  { hex: '#e61d2b', where: 'The wordmark' },
  { hex: '#ea0000', where: 'Buttons and icons' },
]
