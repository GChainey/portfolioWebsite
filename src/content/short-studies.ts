import type { Study } from '@/components/site/case-study'

// The short case studies on one template (/draft/<slug>, dev server only), from Gareth's notes (2026-11-13) and the facts in the
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
    rows: [['Signed deals', '$2 million so far'], ['Tenders', 'More than one, from the same prototype'], ['Markets', '2, English and Polish'], ['Engineering', 'Still the design they build from']],
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
    // For a recruiter: what moved, in words that travel. "Education conversion" is the share of people
    // who saw the courses and signed up with a provider; a paid connection is the premium lead SEEK
    // charges providers for
    lead: 'We more than doubled a sign-up funnel, from 9% to 20%.',
    rest: 'A launch that missed its goal, turned round in a week or two, one step of the funnel at a time.',
    rows: [
      ['Sign-up conversion', '9% → 20%, against a goal of 12%'],
      ['Premium connections', '+34%, against a goal of 10 to 15%'],
      ['Release to fixes', 'A week or two'],
      ['Rolled out to', 'All 3,000+ career pages'],
      ['Role', 'Lead designer, in a team of seven'],
    ],
    blocks: [
      { moment: { hero: { desktop: `${SEEK}/final-desktop.mp4`, desktopRatio: 1506 / 978, phone: `${SEEK}/connection-mobile.mp4`, phoneRatio: 540 / 1114 } }, line: 'Courses on a SEEK career page, as they shipped: desktop and phone.' },

      // 1. The release
      {
        lead: 'We shipped it bare, on purpose.',
        rest: 'A fast release, and a baseline to measure every fix against.',
        list: [
          'The brief: get more job seekers signing up with a course provider from SEEK’s career pages, the pages that describe a job.',
          'The first release: a list of courses on the page, one tab per qualification.',
          'Pick a course, read about it, then enquire or visit the provider’s site. That last step is the premium connection providers pay for.',
        ],
      },
      { moment: { video: `${SEEK}/mvp.mp4`, ratio: 540 / 1114 }, line: 'The first release: one qualification at a time.' },

      // 2. The goals, and the miss
      {
        lead: 'We set the goals before it went live.',
        rest: 'The first numbers came back short.',
        rows: [['Sign-up conversion', '9% → 12%'], ['Premium connections', '+10 to 15%']],
        body: 'The tempting move was a redesign. We went to the data instead.',
      },

      // 3. The funnel
      { lead: 'We laid the journey out as a funnel.', rest: 'Five steps, three of them leaking. Within a week or two we had a fix out for each.' },
      {
        moment: {
          funnel: {
            stages: [
              { label: 'Sees the courses' },
              { label: 'Finds the right course', leak: 'Too much friction to find one', fix: 'An All tab, made the default', href: '#find' },
              { label: 'Picks a course', leak: 'The cards all look the same', fix: 'Logo and course name first', href: '#pick' },
              { label: 'Reads about it' },
              { label: 'Enquires or visits', leak: 'Too many steps to get there', fix: 'Enquire in place, in a sheet', href: '#connect' },
            ],
            before: { label: 'First release', result: '9%', widths: [100, 78, 58, 52, 44] },
            after: { label: 'After the fixes', result: '20%', widths: [100, 94, 88, 84, 78] },
          },
        },
        line: 'Switch between the first release and the fixes. One assumption per leak, one small fix for each, measured one at a time.',
      },

      // 4. Piece by piece
      {
        id: 'find',
        lead: 'Leak 1: too much friction to find a course.',
        rest: 'So, an All tab, made the default.',
        body: 'You had to work through the tabs one at a time to see what was on offer. Now every qualification is on one page, and the tabs are still there as shortcuts.',
      },
      { moment: { video: `${SEEK}/all-tab.mp4`, ratio: 540 / 1114 }, line: 'The All tab: every qualification on one scroll.' },
      {
        id: 'pick',
        lead: 'Leak 2: the cards all looked the same.',
        rest: 'So, the provider’s logo and the course name first.',
        body: 'The first cards were mostly text, with the provider’s name where the course name should be. The new card leads with the logo and the course, then the provider, how long it takes, where and when.',
      },
      { moment: { image: `${SEEK}/select-a-course.webp`, ratio: 2000 / 1334 }, line: 'Left, the first card. Right, the new one.' },
      {
        id: 'connect',
        lead: 'Leak 3: too many steps to make a connection.',
        rest: 'So, the connection moved onto the page.',
        body: 'A course took you off the career page to a separate course page, and only there could you ask the provider for more.',
      },
      { moment: { video: `${SEEK}/connection-before.mp4`, ratio: 1600 / 958 }, line: 'Before: the career page, then a course page, then the form.' },
      { moment: { video: `${SEEK}/flyout.mp4`, ratio: 1600 / 1166 }, line: 'After: a course card opens a fly-out with Enquire and Visit website, and the form opens in place.' },
      { moment: { video: `${SEEK}/connection-mobile.mp4`, ratio: 540 / 1114 }, line: 'On a phone the same thing slides up as a sheet.' },

      // 5. The impact
      {
        lead: 'All three fixes together beat the goals.',
        rest: 'So it went to every career page.',
        rows: [
          ['Sign-up conversion', '9% → 20%, goal 12%'],
          ['Premium connections', '+34%, goal 10 to 15%'],
          ['Whole-page conversion', '5% → 9%'],
          ['Rolled out to', 'All 3,000+ career pages'],
        ],
      },

      // Why it travels: the method, not the courses
      {
        lead: 'It works on any funnel.',
        rest: 'Sign-up, checkout, onboarding: the same four moves.',
        list: [
          'Ship small and early, so you have a baseline to measure against.',
          'Lay the journey out as steps, and find where people drop out.',
          'Write down one assumption for each leak.',
          'Ship one small fix per leak, and measure each on its own.',
        ],
      },
      {
        lead: 'What I took from it.',
        list: [
          'A usability test tells you whether people can use something, not whether they will. The tabs passed testing and still leaked.',
          'A release is where the work starts, not where it ends.',
        ],
      },
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
