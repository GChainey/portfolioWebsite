import type { Study } from './case-study'

// The short case studies (/draft/<slug>), from Gareth's notes (2026-11-13) and the facts in the
// full write-ups (content/projects.ts). Each leads with impact, then craft, then what AI made
// possible; SEEK leads on growth and Best Practice on craft, both from before AI.
// Not used: SEEK's "33.2% better" and "~$500K a year" (no source, and the 33.2% doesn't square with
// 9% to 20%).

const BP = '/case-studies/bestpractice-booking'
const SEEK = '/case-studies/seek-learning'
const SITE = '/case-studies/html-brand-website'

export const STUDIES: Study[] = [
  {
    slug: 'daisy-assess',
    label: 'DAISY Assess',
    meta: 'Enterprise AI, 2025',
    lead: 'Building with AI, I answered tenders with a working product, not a Figma prototype.',
    rest: 'It showed real functionality, and how we use the technology on real problems.',
    figure: { value: '$2 million', unit: 'in signed deals so far' },
    rows: [['Tenders', 'More than one, from the same prototype'], ['Markets', '2, English and Polish'], ['Engineering', 'Still the design they build from']],
    blocks: [
      { lead: 'Deep enough to tell a real story.', rest: 'One case, followed all the way through.' },
      { moment: { replay: '/replays/rfp/seed-data.json' }, line: 'One case from the dashboard to its assessment and its request for information. Every screen follows it.' },
      { moment: { scene: 'rfp-letter' }, line: 'Issues flagged by different officers, ticked into one request for information.' },
      { moment: { replay: '/replays/rfp/workflow-determination.json', region: { x: 195, y: 43, width: 890, height: 714 } }, line: 'The decision letter, drafted from the work already done on the case.' },
      {
        lead: 'Real technology, not a mock-up.',
        rest: 'Connected to live models and real data.',
        body: 'Before AI, I would have answered with Figma mock-ups and a lot of help. This time I built the product with Claude Code, connected to real models and one set of seed data, so the people judging the tender could use it, not just look at it.',
      },
      { moment: { replay: '/replays/rfp/spot-ask.json', region: { x: 800, y: 91, width: 558, height: 718 } }, line: 'Ask the case a question. The answer comes from the applicant’s own documents.' },
      { moment: { replay: '/replays/rfp/llm-chat.json' }, line: 'Rough notes in, the council’s wording out.' },
      { moment: { replay: '/replays/rfp/spot-warsaw.json', region: { x: 171, y: 51, width: 1098, height: 798 } }, line: 'For the next tender, the same product in Polish: Warsaw addresses, plot numbers and planning law.' },
      { lead: 'What happened next.', rest: 'The prototype outlived the tender.', rows: [['Engineering', 'Still the design artefact they build from'], ['Signed deals', '$2 million so far']] },
    ],
  },
  {
    slug: 'website',
    label: 'An agent-built website',
    meta: 'Enterprise AI, 2026',
    lead: 'Our brand, written as files agents build from.',
    rest: 'Then a website explored with models, refined into the brand and tested.',
    rows: [['Status', 'Released'], ['Impact', 'Recently released, so still to come'], ['Got the message', '2 of 5, then 5 of 7']],
    blocks: [
      {
        lead: 'Inputs, not outputs.',
        rest: 'After Emmett Shine of Little Plains.',
        body: 'People do the thinking at the start and the judgement at the end, and agents fill in the middle. So marketing and sales wrote the voice, I put it into the brand as Markdown, and agents built from that.',
      },
      { moment: { replay: '/replays/website/first-prototype.json', region: { x: 128, y: 10, width: 1184, height: 726 } }, line: 'The first prototype: built for Nike, then re-skinned for Apple and CommBank.' },
      { lead: 'Models to explore.', rest: 'Ten versions in a day, from one tagline, the best ideas kept.' },
      { moment: { stills: [`${SITE}/remixes/00.webp`, `${SITE}/remixes/05.webp`, `${SITE}/remixes/09.webp`, `${SITE}/remixes/13.webp`] }, line: 'Four of the ten.' },
      {
        lead: 'Refined into the brand, then tested.',
        rest: 'Could people say the message back?',
        rows: [['Got the offer', '2 of 5, then 5 of 7'], ['Explained Gofer', '0, then 4'], ['Median interest, out of 5', '3, then 4']],
      },
      { moment: { replay: '/replays/website/site.json' }, line: 'The released site, top to bottom.' },
    ],
  },
  {
    slug: 'configurator',
    label: 'Testing on live models',
    meta: 'Enterprise AI, 2025–26',
    lead: 'Ahead of development, I built the product, lite.',
    rest: 'An LLM product has to be designed past the happy path.',
    rows: [['Model speed', 'About 6s on GPT-4.1, 21s on GPT-5 mini'], ['Result', 'Changed the product’s direction']],
    blocks: [
      { moment: { replay: '/replays/configurator/overview.json' }, line: 'A description of today’s process becomes a four-step app.' },
      {
        lead: 'An opinion on how it should work.',
        rest: 'Not just when the model gets it right.',
        body: 'With an LLM, the experience is in what happens when the model is slow, unsure or wrong. So I built it in code with Claude Code, connected it to real models, and designed for those moments too.',
      },
      { moment: { replay: '/replays/configurator/jev-match.json' }, line: 'When it isn’t sure it says so, names the runner-up, and leaves the call to the person.' },
      { moment: { replay: '/replays/configurator/models.json' }, line: 'The same app on two models: about 6 seconds, or 21. Newer was slower, too slow for someone watching a spinner.' },
      { lead: 'What Figma couldn’t show.', rest: 'Real input in, a real process out, tested live with people.' },
      { moment: { replay: '/replays/configurator/process-card.json' }, line: 'A messy description in. Goal, who and outcome back, from a live model.' },
      { moment: { replay: '/replays/configurator/four-steps.json' }, line: 'Seven steps today, mapped onto four.' },
    ],
  },
  {
    slug: 'seek',
    label: 'SEEK',
    meta: '2024',
    lead: 'The first release missed, so we followed the funnel.',
    rest: 'Three leaks, fixed one assumption at a time.',
    figure: { value: '9% → 20%', unit: 'education conversion, against a goal of 12%' },
    rows: [['Paid connections', '+34%, against a goal of 10 to 15%']],
    blocks: [
      { moment: { video: `${SEEK}/final-desktop.mp4`, ratio: 1506 / 978 }, line: 'The course finder on a role page, as it shipped.' },
      { lead: 'One leak at a time.', rest: 'A five-stage funnel, one assumption for each.' },
      { moment: { video: `${SEEK}/all-tab.mp4`, ratio: 540 / 1114 }, line: 'An All tab, made the default. The tabs are still there as shortcuts.' },
      { moment: { video: `${SEEK}/flyout.mp4`, ratio: 1600 / 1166 }, line: 'A course card opens a fly-out: a short summary, Enquire and Visit website.' },
      { moment: { video: `${SEEK}/connection-mobile.mp4`, ratio: 540 / 1114 }, line: 'On mobile the same thing slides up as a sheet.' },
    ],
  },
  {
    slug: 'bestpractice',
    label: 'Best Practice',
    meta: '2021',
    lead: 'Booking an appointment, in two panels.',
    rest: 'Repeats and injury claims fit in without the dialog getting any longer.',
    rows: [['Tested with', '5 people, on a Figma prototype'], ['They', 'Understood it, and could tell an appointment’s state at a glance']],
    blocks: [
      { moment: { video: `${BP}/final.mp4`, ratio: 1600 / 986 }, line: 'Provider, date and time in one row, and the row is the door to the right panel.' },
      { lead: 'Small decisions, all the way down.', rest: 'Three toggles became one segmented control.' },
      { moment: { video: `${BP}/repeat.mp4`, ratio: 1600 / 1148 }, line: 'A repeat collapses into one line: every 2 weeks, 3 of 5 occurrences.' },
      { moment: { video: `${BP}/provider-dates.mp4`, ratio: 1600 / 986 }, line: 'Each provider has their own date.' },
      { moment: { video: `${BP}/unavailable.mp4`, ratio: 1600 / 986 }, line: 'An unavailable provider shows their next free time, one click from it.' },
    ],
  },
]

export const studyBySlug = (slug: string) => STUDIES.find((s) => s.slug === slug)
