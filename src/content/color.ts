// Reading Josef Albers' Interaction of Color (1963) one chapter at a time, and rebuilding each
// exercise for the browser. Albers worked with sheets of coloured paper. On a screen you can change
// a colour and see the effect straight away.
//
// Not in production yet. Flip when the chapters have been reviewed.
export const COLOR_LIVE = process.env.NODE_ENV === 'development'

export interface ColorChapter {
  numeral: string
  slug: string
  // Albers' chapter title, as printed
  title: string
  // One line on what the exercise lets you try
  blurb: string
  // What reading it and building it taught me. Not shown on the pages for now
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
    blurb: 'Blur two lines of type until only the word shapes are left, then count the colours in four chords.',
    learned: [
      'We read words as shapes, so all-capitals lose their shape first when blurred',
      'A colour on its own tells you as little as a single tone tells you about music',
      'Four identical squares read as different colours once each has its own neighbours',
      "Knowing a colour's name or hex value is spelling, not reading",
      'In a UI, judge a colour in the layout it lives in, never as a lone swatch',
    ],
  },
  {
    numeral: 'III',
    slug: 'paper',
    title: 'Why color paper—instead of pigment and paint',
    blurb: 'Cut colour papers out of your own photo, keep them as a palette, find the one nearest a colour, and see paint fail to repeat a colour.',
    learned: [
      'Albers chose paper because a paper is exactly the same colour every time it is used',
      "Magazines, packaging and printers' waste give a bigger palette than any boxed set",
      'Paint shifts with every coat, and the brush leaves texture that hides weak colour choices',
      'Having many colours in front of you to compare trains the eye in a way mixing never does',
      'A screen colour is the perfect paper, so a design system should hand out exact values, not mixing instructions',
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
    title: 'Lighter and/or darker—light intensity, lightness',
    blurb: 'Say which of ten colour pairs is darker, with every answer measured, then build an even grey scale.',
    learned: [
      "Most people can't tell which of two different hues is darker. Albers' class got 60% wrong",
      "Saying \"I can't tell\" is a better answer than a guess",
      'Turning colours grey shows the lightness the hue was hiding',
      'Even-looking steps in a grey scale are hard to set by eye, and gaps between the steps make it harder',
      'People agree on lighter and darker, but almost never on the most typical colour',
      "For UI contrast, measure lightness. Don't trust your eye or the hue",
    ],
  },
  {
    numeral: 'VI',
    slug: 'reversed-grounds',
    title: '1 color appears as 2—looking like the reversed grounds',
    blurb: 'Find the one colour that looks like the dark ground on the light side and the light ground on the dark side.',
    learned: [
      'One colour can echo both grounds at once, but only if it sits exactly in the middle',
      'First tries almost always land closer to one ground than the other',
      'When no middle colour exists, move the grounds instead of the colour',
      'It is easy with two shades of one hue and hardest with complementary grounds',
      'An in-between tone in a UI, like a border or a divider, should be the measured midpoint, not a guess',
    ],
  },
  {
    numeral: 'VII',
    slug: 'subtraction',
    title: '2 different colors look alike—subtraction of color',
    blurb: 'Watch a ground absorb one of three reds, then pick two grounds that make two different colours look alike.',
    learned: [
      'A ground takes its own hue and light away from every colour on it',
      'Put a colour on a ground that matches it and it disappears',
      'Light colours run together on a light ground, and dark ones on a dark ground',
      'Two different colours can be made to look nearly the same by giving each the ground it needs',
      'A brand colour can look "off" on one background and right on another, so test colours where they will actually sit',
    ],
  },
  {
    numeral: 'VIII',
    slug: 'after-image',
    title: 'Why color deception?—after-image, simultaneous contrast',
    blurb: "Stare at a colour for 30 seconds and the screen swaps it for white, then set the tint you saw, and predict it for a colour you haven't stared at.",
    learned: [
      'Staring at a colour tires the eye, and white then looks tinted with the opposite colour',
      'Yellow circles leave yellow diamonds behind. The diamonds are the after-image of the gaps between the circles',
      'Every ground casts its after-image on what sits on it, straight away, with no staring needed',
      'No eye is immune, however trained. Knowing about it changes nothing',
      'A neutral grey in a UI picks up the opposite of whatever brand colour surrounds it, so check greys in place',
    ],
  },
  {
    numeral: 'IX',
    slug: 'transparence',
    title: 'Color mixture in paper—illusion of transparence',
    blurb: 'Imagine the colour two papers would make, put it where they cross, and see opaque paper turn see-through. The page checks whether your mixture sits between its parents.',
    learned: [
      'Opaque colours read as transparent when the right in-between colour sits where two shapes overlap',
      'Any two colours have many believable mixtures, not one right answer',
      'You can work backwards from a mixture and one parent to find the other parent',
      'A computed mixture is a good start, but the eye decides which one reads as see-through',
      'Overlays, scrims and glass effects in a UI work only if the overlap colour is believable, not just a lower opacity',
    ],
  },
  {
    numeral: 'X',
    slug: 'factual-mixtures',
    title: 'Factual mixtures—additive and subtractive',
    blurb: 'Drag coloured lights and inks over each other, then make both in opaque colour, a crossing lighter than both parents and its reverse, darker than both.',
    learned: [
      'Light added to light always gets lighter, and all three together make white',
      'Paint or ink mixed with paint always gets darker, heading towards black',
      'Mixing in the eye, as on a spinning disc, lands between the two',
      'A screen mixes light, which adds. Print mixes ink, which subtracts',
      'Colours that work on screen can turn muddy in print, so check both before handing over a palette',
    ],
  },
  {
    numeral: 'XI',
    slug: 'space',
    title: 'Transparence and space-illusion',
    blurb: 'Slide a mixture between its parents and watch which colour seems to sit on top, then find the one middle mixture that sits flat.',
    learned: [
      'A mixture that leans towards one parent makes that parent look in front',
      'Soft edges join colours and hard edges separate them, which is how flat colour makes space',
      'The middle mixture, equally far from both parents, reads as a flat colour of its own',
      'Finding the middle by eye is hard. Measured lightness shows which way you were off',
      'In layered UI, like cards, modals and menus, the colour of the overlap decides what reads as on top',
    ],
  },
  {
    numeral: 'XII',
    slug: 'optical-mixture',
    title: 'Optical mixture—after-image revised',
    blurb: 'Predict the colour two dots will blend into, then shrink them to single pixels to check, and watch three inks build a printed picture.',
    learned: [
      'Small enough dots of two colours merge into a third in the eye',
      'It depends on size and distance. Squinting does the same as stepping back',
      'Mixing in the eye loses less light than mixing paint, which is why Impressionist colour looks bright',
      'Every printed picture, and every screen pixel, is an optical mixture',
      'Fine patterns and textures in a UI change the colour they sit in, so judge a patterned fill at its real size',
    ],
  },
  {
    numeral: 'XIII',
    slug: 'bezold',
    title: 'The Bezold Effect',
    blurb: "Match a plain patch to a rug's red, once with black lines and once with white, to measure how far one colour change moves the whole design.",
    learned: [
      'Thin lines that touch every colour change all of them at once',
      'The smaller the pattern, the more the eye mixes the lines into the colours',
      'White lines lighten a whole design and black lines deepen it, though no other colour changed',
      'Bezold could restyle a rug by swapping one thread colour',
      'In a UI, borders, dividers and icon strokes tint everything they touch, so check a palette change at real size, not on swatches',
    ],
  },
  {
    numeral: 'XIV',
    slug: 'intervals',
    title: 'Color intervals and transformation',
    blurb: 'Move four colours up or down in light by the same steps, check the key held by laying one group inside the other, then take a new group lower.',
    learned: [
      'Colours have intervals like tones. What matters is the steps between them, not where they start',
      'Raise every colour by the same amount of light and the group keeps its character',
      'Comparing two groups side by side is hard. Putting one inside the other makes every boundary easy to compare',
      'Near white or black there is no room left, and the steps squash together',
      'A dark mode is a transposition. Keep the lightness steps between tokens, not the tokens themselves',
    ],
  },
  {
    numeral: 'XV',
    slug: 'intersecting',
    title: 'The middle mixture again—intersecting colors',
    blurb: 'Pull a dark sheet across a middle colour and watch one flat strip split into two.',
    learned: [
      'A true middle colour, set between its two parents, looks like both of them at once',
      'Its half next to the light parent looks darker, and its half next to the dark parent looks lighter',
      'If the strip mostly looks like one parent, the middle leans toward that parent',
      'Flat bands in even steps look curved, like the fluting of a Doric column',
      'Evenly stepped tints in charts and progress bars can look ridged or rounded, so check gradients made of flat steps by eye',
    ],
  },
  {
    numeral: 'XVI',
    slug: 'quantity',
    title: 'Color juxtaposition—harmony—quantity',
    blurb: 'Arrange the same four colours four ways on one grey stage, then see if someone else can spot a stranger among them.',
    learned: [
      'How much of a colour there is matters as much as which colour it is',
      'The same four colours can make four different moods just by changing their sizes and order',
      'Any colour can work with any other if the quantities are right',
      'Schopenhauer gave dark colours more room to balance light. By measurement he overshot, but he was right that area evens out light',
      'The proportions of a brand palette decide how it reads, so specify how much of each colour to use, not only which ones',
    ],
  },
  {
    numeral: 'XVII',
    slug: 'film-volume',
    title: 'Film color and volume color—2 natural effects',
    blurb: "Change the haze in a landscape and the depth of coffee, tea or milk, then sort Albers' examples into surface, film and volume colour.",
    learned: [
      'Distance lays a thin veil of sky over everything, so far hills turn blue whatever they are made of',
      'Clear liquids get darker and richer with depth. The same coffee is three browns in three containers',
      'Each equal step deeper adds less visible colour than the last, so the edges between steps soften',
      'Thin layers can darken and lighten at once. Tracing paper goes darker held to the light and whiter lying on a desk',
      'Cloudy liquids like milk show surface colour. Only clear ones deepen with volume',
      'Translucent layers in an interface, like overlays, scrims and stacked glass panels, change colour with what is behind them, so check them over real content',
    ],
  },
  {
    numeral: 'XVIII',
    slug: 'free-studies',
    title: 'Free studies—a challenge to imagination',
    blurb: 'Paint four colours into stripes until none of them is seen first, then ask someone to read the theme you chose.',
    learned: [
      'Stripes take shape out of the way, so what you notice is colour',
      "A colour dominates through its area and how far it stands from the others in light, hue and intensity. Other people's eyes are the test",
      'The same five colours can read as "early" or "late" just by changing how much of each and how often',
      'Working from a palette someone else chose shows that most of my dislikes are habits',
      'In UI, how much of each colour a brand palette uses matters more than which colours it has',
    ],
  },
  {
    numeral: 'XIX',
    slug: 'masters',
    title: 'The Masters—color instrumentation',
    blurb: 'Turn a painting into a handful of flat papers chosen from a fixed collection, and check you kept its climate.',
    learned: [
      "Five or six papers are often enough to bring back a painting's climate",
      'How much of each colour there is matters as much as which colours they are',
      'Clustering picks the colours that cover the most. A painter would also keep the small accent that carries the picture',
      'Flat papers take away the brushwork and leave only the colour decisions',
      'Matching from a limited collection, not an eyedropper, is what trains the eye for climate',
      'Pulling a palette from an image by area misses the accents, so tune extracted palettes by eye',
    ],
  },
  {
    numeral: 'XX',
    slug: 'weber-fechner',
    title: 'The Weber-Fechner Law—the measure in mixture',
    blurb: "Lay thin layers in Albers' two rows, 1 to 6 and 1 to 32, then find out which grey scale your eye reads as even steps.",
    learned: [
      "Equal coats don't give equal steps. Each one changes less than the last",
      'Steps that look equal need the light to multiply, not to add',
      "Measured, the eye sits between Fechner's logarithm and a cube root, so doubling overshoots a little",
      'Even a measured, even scale looks uneven, because its neighbours change each step',
      'White veils on black prove Albers right. A thin ink on white already multiplies light, so doubling layers overshoots',
      'Make tint and shade scales in a perceptual space like OKLCH, not by adding equal amounts of black or white',
    ],
  },
  {
    numeral: 'XXI',
    slug: 'temperature',
    title: 'From color temperature to humidity in color',
    blurb: 'Sort colours from warm to cool, watch one violet change temperature with its neighbour, and rate colours wet or dry.',
    learned: [
      "Warm and cool are readings, not measurements, so they're only relative",
      "Green and violet are the temperature neutrals. They go warm or cool depending on what's next to them",
      'There are warm blues and cool reds within their own hues',
      'Light to heavy follows lightness. Wet to dry and early to late are personal',
      "Don't give a token a temperature by name. Whether it reads warm depends on what it sits beside",
    ],
  },
  {
    numeral: 'XXII',
    slug: 'vibrating',
    title: 'Vibrating boundaries—enforced contours',
    blurb: 'Bring two contrasting hues to the same lightness and watch the edge between them start to shimmer.',
    learned: [
      'Edges vibrate when hues contrast strongly but lightness is close',
      'Not everyone sees it, and it is uncomfortable for those who do',
      'Lightness, not hue, is what holds an edge still',
      'Separating the lightness by about 15 points of 100 calms the edge',
      'In a UI, a vibrating pair almost always fails text contrast, so never set red on green or blue on orange at equal lightness',
    ],
  },
  {
    numeral: 'XXIII',
    slug: 'vanishing',
    title: 'Equal light intensity—vanishing boundaries',
    blurb: 'Tune both a grey-green and a grey-violet until the triangles dissolve, check it with flicker, then try three fresh pairs by eye.',
    learned: [
      'Two neighbouring colours at exactly equal lightness lose the edge between them',
      'It only works between close hues. Contrasting hues vibrate instead',
      'Even a few points of lightness difference keep the edge visible',
      'Clouds against blue sky show it in nature, with the sun behind you',
      "In a UI, greyscale is a quick test: if two states merge in grey, people with low vision or colour blindness can't tell them apart",
    ],
  },
  {
    numeral: 'XXIV',
    slug: 'systems',
    title: 'Color theories—color systems',
    blurb: "Build Goethe's triangle from your own primaries, weigh colours by their light like Schopenhauer, and see two hue wheels in grey.",
    learned: [
      "Goethe's triangle shows primaries, secondaries and tertiaries related in two dimensions",
      'Schopenhauer gave each colour an area that balances its light, so less yellow and more violet',
      "A system's equal steps are only equal by its own measure",
      "HSV's \"full brightness\" hues vary by about half the lightness scale",
      'For design tokens, build ramps in a perceptual space like OKLCH so equal steps look equal across hues',
    ],
  },
  {
    numeral: 'XXV',
    slug: 'teaching',
    title: 'On teaching color—some color terms',
    blurb: 'See one length and one grey take two values, flip illusions between factual and actual, and generate variants of a study.',
    learned: [
      'Any measure takes its value from its neighbours, in length, weight and colour alike',
      'The factual fact is what is there. The actual fact is what we see',
      'A variant re-does the whole within a scheme, while variety changes details for their own sake',
      'Keeping the lightness relationships keeps an effect alive whatever the hues',
      "For design systems, change themes as variants, keeping each token's lightness role rather than swapping colours one by one",
    ],
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
