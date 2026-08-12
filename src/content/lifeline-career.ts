import { defineLifeline } from '@/lib/lifeline-data'

/**
 * Career timeline for the Lifeline component.
 *
 * `birthYear` is Lifeline's axis start, not a date of birth — the axis begins
 * at the earliest real milestone in src/content/cv.ts.
 *
 * Age labels are stripped from every marker below. Lifeline defaults each one
 * to `year - birthYear`, which would print as an age and be wrong here, and
 * `defineLifeline` back-fills the empty years between milestones — so setting
 * `age` per milestone is not enough to catch them all.
 *
 * Content is drawn from src/content/cv.ts. Keep the two in step.
 */
const career = defineLifeline({
  slug: 'gareth-chainey',
  name: 'Gareth Chainey',
  birthYear: 2013,
  description: 'A decade of product design, from IT graduate to leading design with LLMs.',
  milestones: {
    2013: {
      id: 'qut',
      events: ['Bachelor of Information Technology, Queensland University of Technology'],
    },
    2017: {
      id: 'istqb',
      events: ['ISTQB Foundation Certification'],
    },
    2019: {
      id: 'best-practice',
      events: [
        'Product Designer at Best Practice Software, Australia’s largest Practice Management System',
        'Led design for the new SaaS successor product',
      ],
    },
    2020: {
      id: 'design-system',
      events: [
        'Started the design system used by 30+ engineers and 5 designers',
        'Grew the design team to five — interviewing, hiring and mentoring',
      ],
    },
    2022: {
      id: 'seek',
      events: [
        'Senior Product Designer at SEEK, APAC’s largest employment marketplace',
        'Continuous Discovery Masterclass, Product Talk Academy',
      ],
    },
    2023: {
      id: 'seek-impact',
      events: [
        'Connected candidates with education courses — conversion up 75%, adding $500,000 in annual revenue',
        'Organic visits up 25.9% in a single year, over a million annual visits',
        'Continuous Interviewing, Product Talk Academy',
        'Led the HEART framework rollout, aligning customer value with business objectives',
      ],
    },
    2024: {
      id: 'seek-end',
      events: ['Hundreds of customer interviews, experiments and assumption tests at SEEK'],
    },
    2025: {
      id: 'enterpriseai',
      events: [
        'Senior Product Designer at EnterpriseAI, building products on LLMs',
        'Prototypes answering multi-million dollar RFPs — work that previously took entire teams',
        'Designed an enterprise-ready agentic workflow management tool',
      ],
    },
    2026: {
      id: 'adaptovate',
      events: [
        'Lead Product Designer at ADAPTOVATE, New York — leading product design across client engagements',
        'Wrapped up at EnterpriseAI after a year of LLM product work',
        'Rebuilt this portfolio with Next.js and Claude Code',
      ],
    },
  },
})

export const careerLifeline = {
  ...career,
  markers: career.markers.map((marker) => ({ ...marker, age: '' })),
}
