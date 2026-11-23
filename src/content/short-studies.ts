import type { Study } from '@/components/site/case-study'

// The short case studies on one template (/draft/<slug>, dev server only), from Gareth's notes (2026-11-13) and the facts in the
// full write-ups (content/projects.ts). Each leads with impact, then craft, then what AI made
// possible; SEEK leads on growth and Best Practice on craft, both from before AI.
// Not used: SEEK's "33.2% better" and "~$500K a year" (no source, and the 33.2% doesn't square with
// 9% to 20%).

const BP = '/case-studies/bestpractice-booking'
const SEEK = '/case-studies/seek-learning'
// The Best Practice recordings, cropped to the dialog (it sits at 40,40 and opens to 880 × 624 in a
// 960 × 704 recording), so its text renders as large as the column allows
const BP_DIALOG = { x: 24, y: 24, width: 912, height: 656 }
const SITE = '/case-studies/html-brand-website'

export const STUDIES: Study[] = [
  {
    slug: 'daisy-assess',
    label: 'DAISY Assess',
    meta: 'Enterprise AI, 2025',
    role: 'Sole designer, working with sales. I designed and built it',
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
    role: 'Wrote the brand files, designed the site with agents, ran the tests',
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
    role: 'Designed and built it in code, ahead of engineering',
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
    role: 'Lead designer, in a team of seven',
    lead: 'We more than doubled a sign-up funnel, from 9% to 20%.',
    rest: 'A launch that missed its goal, turned round in a week or two, one step of the funnel at a time.',
    rows: [
      ['Sign-up conversion', '9% → 20%, against a goal of 12%'],
      ['Premium connections', '+34%, against a goal of 10 to 15%'],
      ['Release to fixes', 'A week or two'],
      ['Rolled out to', 'All 3,000+ career pages'],
    ],
    blocks: [
      { moment: { replay: '/replays/seek/hero.json', phone: true }, line: 'Courses on a SEEK career page, as they shipped.' },

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
      { moment: { replay: '/replays/seek/release.json', phone: true }, line: 'The first release: one qualification at a time.' },

      // 2. The goals, and the miss
      {
        lead: 'We set the goals before it went live.',
        rest: 'The first numbers came back short.',
        rows: [['Sign-up conversion', '9% → 12%'], ['Premium connections', '+10 to 15%']],
        body: 'The tempting move was a redesign. We went to the data instead.',
      },

      // 3. The funnel
      { lead: 'We laid the journey out as a funnel.', rest: 'Five steps, and people were dropping out at three. One assumption for each, and within a week or two a fix out for each.' },
      {
        moment: {
          funnel: {
            stages: [
              { label: 'Sees the courses' },
              { label: 'Finds the right course', assumption: 'Too much friction to find a course', fix: 'An All tab, made the default', href: '#find' },
              { label: 'Picks a course', assumption: 'Missing design details', fix: 'Logo and course name first', href: '#pick' },
              { label: 'Reads about it' },
              { label: 'Enquires or visits', assumption: 'Too long to make a connection', fix: 'Enquire in place, in a sheet', href: '#connect' },
            ],
            before: { label: 'First release', result: '9%', widths: [100, 78, 58, 52, 44] },
            after: { label: 'After the fixes', result: '20%', widths: [100, 94, 88, 84, 78] },
          },
        },
        line: 'Switch between the first release and the fixes. One assumption where people dropped out, one small fix for each, measured one at a time.',
      },

      // 4. Piece by piece
      {
        id: 'find',
        lead: 'Too much friction to find a course.',
        rest: 'So, an All tab, made the default.',
        body: 'You had to work through the tabs one at a time to see what was on offer. Now every qualification is on one page, and the tabs are still there as shortcuts.',
      },
      { moment: { scene: 'seek-all-tab' }, line: 'The first release swapped the list a tab at a time. The fix: an All tab, first and selected, with every qualification on one scroll and the tabs kept as shortcuts.' },
      {
        id: 'pick',
        lead: 'Missing design details.',
        rest: 'So, the provider’s logo and the course name first.',
        body: 'The first cards were mostly text, with the provider’s name where the course name should be. The new card leads with the logo and the course, then the provider, how long it takes, where and when.',
      },
      { moment: { scene: 'seek-cards' }, line: 'Before the fix, every card read the same: text only, the provider where the course goes. After it, each card leads with the provider’s logo and the course name, with the provider under it.' },
      {
        id: 'connect',
        lead: 'Too long to make a connection.',
        rest: 'So, it moved into a sheet on the same page.',
        body: 'A course took you off the career page to a separate course page, and only there could you ask the provider for more.',
      },
      { moment: { scene: 'seek-connect' }, line: 'Before the fix, a course opened its own page and the form another. After it, the course opens in a sheet over the same page, and Enquire turns the sheet into the form.' },

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
          'Write down one assumption for each place people drop out.',
          'Ship one small fix for each, and measure each on its own.',
        ],
      },
      {
        lead: 'What I took from it.',
        list: [
          'A usability test tells you whether people can use something, not whether they will. The tabs passed testing and still lost people.',
          'A release is where the work starts, not where it ends.',
        ],
      },
    ],
  },
  {
    slug: 'bestpractice',
    label: 'Best Practice',
    meta: '2021',
    // Crafting a better experience from a design that had grown unwieldy. What made it robust was a
    // few reusable patterns (after Christopher Alexander's pattern language): a second panel for room,
    // a row that holds any kind of answer, one control for the choices. No numbers were measured in
    // testing, so none are claimed. Recreated in Fluent 2: recordings (recreations/bestpractice,
    // scripts/replays/bestpractice.mjs) and Stageshow scenes (components/stageshow/Bp*.tsx)
    role: 'Lead designer, in a team of five',
    lead: 'Crafting a better booking experience from a dialog that had grown unwieldy.',
    rest: 'A few reusable patterns made it robust enough for features that didn’t exist yet.',
    rows: [
      ['Patterns', 'A second panel, a row that holds any answer, one control for the choices'],
      ['Tested with', '5 people: they understood it and could finish the workflows'],
      ['Used by', 'Australia’s largest practice management system'],
    ],
    blocks: [
      { moment: { replay: '/replays/bestpractice/final.json', ground: true, region: BP_DIALOG }, line: 'Open the details, pick a provider and a time, and the row fills in.' },

      {
        lead: 'Every feature had made it longer.',
        rest: 'Booking is what a receptionist does all day.',
        body: 'Repeats, the waiting list and urgent appointments were each added inline, so the dialog grew down the screen and could be switched into combinations that made no sense.',
      },
      { moment: { scene: 'bp-old-dialog' }, line: 'The old dialog: every switch adds its fields, and it keeps growing.' },

      {
        lead: 'Three answers, one row.',
        rest: 'Provider, date and time answer one question, so they became one component.',
        body: 'The row reads at a glance and is the door to a second panel, where there’s room to do the work. When you’re done the panel gets out of the way and the row fills in.',
      },
      { moment: { scene: 'bp-details-row' }, line: 'Three fields merge into one row; the row opens the panel, a time is picked, the row fills in.' },

      { lead: 'One control, one choice.', rest: 'Three switches allowed combinations that made no sense.' },
      { moment: { scene: 'bp-segmented' }, line: 'One choice at a time: picking the waiting list lets go of Repeat, and what it sets up opens right under it.', was: { media: { scene: 'bp-old-dialog' }, line: 'Before: three switches, on in any combination, each adding its own fields.' } },

      { lead: 'A repeat in one line.', rest: 'Set up in the second panel, folded into the row.' },
      { moment: { scene: 'bp-repeat' }, line: 'Set up beside the appointment, then folded into one line: every 2 weeks, 3 times, the next and final dates under it.', was: { media: { scene: 'bp-old-dialog' }, line: 'Before: the repeat’s fields added inline, and the dialog kept growing.' } },

      { lead: 'Never a dead end.', rest: 'Found in testing: a provider with nothing free shows their next time, one click away.' },
      { moment: { scene: 'bp-next-available' }, line: 'The next available time is a link; one click and that day opens with the time picked.', was: { media: { image: `${BP}/fluent-iter-empty.png`, ratio: 1088 / 1010 }, line: 'Before: a provider with nothing free was an empty tab, and nowhere to go from it.' } },

      { lead: 'Each provider, their own day.', rest: 'Also from testing: receptionists compare providers across days.' },
      { moment: { scene: 'bp-provider-dates' }, line: 'Dominique moves to the 26th; Yarn stays on the 25th.' },

      { lead: 'Ready for what came next.', rest: 'An injury claim, a workflow still to come, used the same patterns.' },
      { moment: { replay: '/replays/bestpractice/injury-claim.json', ground: true, region: BP_DIALOG }, line: 'A row on the left, the work in the second panel: the claim lands in the row.' },

      {
        lead: 'Patterns made it robust.',
        rest: 'New workflows reused them instead of adding to the dialog.',
        body: 'A [pattern language](https://en.wikipedia.org/wiki/A_Pattern_Language), in Christopher Alexander’s sense. Three of them:',
        list: [
          'A second panel, for room to work.',
          'A row that holds any answer and opens the panel.',
          'One control for the choices.',
        ],
      },
      { moment: { scene: 'bp-final' }, line: 'Where it landed: the appointment on the left, the work on the right.' },

      {
        lead: 'Five people, the same booking tasks.',
        rest: 'They understood it, could finish the workflows and could read an appointment at a glance.',
      },
    ],
  },
  {
    slug: 'eai-setup',
    label: 'Enterprise AI',
    meta: '2026',
    // Three problems in setting up AI in an app, each with its fix: navigation (two levels that looked the
    // same), workspace vs app settings (a page that moved you; now a dialog), and the onward journey (on,
    // but not set up). Facts from the eai-settings write-up (projects.ts) and the user-testing essay:
    // 0 of 5 → 5 of 5 setting up a chatbot; 5 of 5 found the feature and the right app. Scenes built from
    // the real prototype (prototypes repo, workspace-ai-demo/build-web) with the workspace as NYC Council
    lead: 'People turned AI on and thought they were done.',
    rest: 'Three fixes took setting up a chatbot from 0 of 5 people to 5 of 5.',
    rows: [
      ['Set up an AI chatbot', '0 of 5 → 5 of 5 people'],
      ['Found the right settings', '5 of 5 people'],
      ['Built as', 'Working HTML prototypes, generated with AI'],
      ['Role', 'Lead product designer'],
    ],
    blocks: [
      { moment: { scene: 'eai-result' }, line: 'Settings open over the app, and turning the chatbot on leads straight to setting it up, until it’s live.' },

      { lead: 'Problem: where am I?', rest: 'The workspace and the app looked the same.' },
      { moment: { scene: 'eai-navigation-problem' }, line: 'From the workspace into Parking permit: the same sidebar and the same kind of page, so nothing tells you which level you’re on.' },
      { lead: 'Answer: the app sits inside the workspace.', rest: 'Their colours swap, so you know the level before you read a word.' },
      { moment: { scene: 'eai-navigation-answer' }, line: 'Into Parking permit: the app is a white card inside the grey workspace, so the level is obvious before you read a word.' },

      { lead: 'Problem: settings that moved you.', rest: 'Workspace settings was a separate page, and closing it left you on Home.' },
      { moment: { scene: 'eai-settings-problem' }, line: 'Add in Workspace Settings takes you to a separate page; turn the chatbot on, close, and you land on Home, not back in the app.' },
      { lead: 'Answer: a dialog over the app.', rest: 'Closing it only closes it.' },
      { moment: { scene: 'eai-settings-answer' }, line: 'Workspace settings opens as a dialog over the app; turn the chatbot on, Done, and you’re exactly where you were.' },

      { lead: 'Problem: on isn’t set up.', rest: 'People turned the chatbot on, saw it saved and stopped. Nothing pointed back to the app.' },
      { moment: { scene: 'eai-onward-problem' }, line: 'The chatbot is turned on and saved, but nothing points back to the app to set it up, so people stop here.' },
      { lead: 'Answer: every step offers the next.', rest: 'Turning it on leads straight to setting it up.' },
      { moment: { scene: 'eai-onward-answer' }, line: 'Turning it on leads straight to setting it up in Parking permit, then adding it to the workflow until it’s live.' },

      {
        lead: 'It works on any setup flow.',
        list: [
          'Make each level look like itself.',
          'Open settings over where people are.',
          'End every step by offering the next one.',
        ],
      },
    ],
  },
]

export const studyBySlug = (slug: string) => STUDIES.find((s) => s.slug === slug)
