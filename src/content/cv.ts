export interface CVExperience {
  id: string
  company: string
  role: string
  location: string
  period: string
  companyDescription: string
  highlights: string[]
}

export interface CVEducation {
  id: string
  title: string
  institution: string
  year: string
}

export interface CVSkillGroup {
  category: string
  items: string[]
}

export interface CVTestimonial {
  name: string
  role: string
  company: string
  content: string
}

export interface CVData {
  name: string
  title: string
  summary: string
  location: string
  experience: CVExperience[]
  education: CVEducation[]
  skills: CVSkillGroup[]
  testimonials: CVTestimonial[]
  llmContext: string
}

export const cvData: CVData = {
  name: 'Gareth Chainey',
  title: 'Senior Product Designer',
  summary:
    'Product designer with 10+ years experience working with startups and large scale companies in B2C and B2B SaaS. I create high quality prototypes to rapidly experiment, make product decisions and win deals.',
  location: 'Sydney, Australia',

  experience: [
    {
      id: 'enterpriseai',
      company: 'EnterpriseAI',
      role: 'Senior Product Designer',
      location: 'Sydney, Australia',
      period: 'May 2025 – Present',
      companyDescription:
        'EnterpriseAI is building products that solve business problems by leveraging the powers of LLMs. Building two main products: An agentic workflow creation tool for the enterprise, and a government building application platform.',
      highlights: [
        'Built high quality prototypes to quickly respond to multi-million dollar RFP deals (would previously require entire teams to do)',
        'Set up and led customer discovery and acquisition/conversion for products',
        'Designed LLM integrated prototypes to build an Enterprise ready agentic workflow management tool',
        'Closely collaborated with product and engineering to continually improve product and product strategy',
      ],
    },
    {
      id: 'seek',
      company: 'SEEK',
      role: 'Senior Product Designer',
      location: 'Melbourne, Australia',
      period: 'May 2022 – September 2024',
      companyDescription:
        "SEEK is APAC's largest employment marketplace. Led the continuous discovery for a team tasked with the mission to empower candidates to live fulfilling working lives whilst increasing value to SEEK.",
      highlights: [
        'Key member of discovery and led the design for an initiative that better connected candidates with education courses, increasing the existing conversion rate by 75% and adding $500,000 in annual revenue',
        'Led the discovery and design for projects that helped increase organic visits by 25.9% in a single year, resulting in over a million annual visits',
        'Conducted 100s of customer interviews, experiments, and assumption tests resulting in confident, successful bets to consistently be made that improved customer value and commercially successful',
        'Led initiative to implement HEART which resulted in long term alignment of customer value and business objectives',
      ],
    },
    {
      id: 'bestpractice',
      company: 'Best Practice Software',
      role: 'Product Designer',
      location: 'Brisbane, Australia',
      period: 'Oct 2019 – May 2022',
      companyDescription:
        "Best Practice is Australia's largest Practice Management System. Led the design for the new SaaS successor product, and grew a design team to 5 people and worked with 30+ engineers.",
      highlights: [
        'Worked with cross-functional teams providing the end-to-end design for domain specific areas like prescribing as well as domain-agnostic areas such as calendar and invoicing',
        'Started and maintained the design system that was used by an engineering team of 30+ and design team of 5',
        'Interviewed and hired other designers, provided mentorship, and helped designers improve their craft',
      ],
    },
  ],

  education: [
    {
      id: 'continuous-discovery',
      title: 'Continuous Discovery Masterclass & Continuous Interviewing',
      institution: 'Product Talk Academy',
      year: '2022 & 2023',
    },
    {
      id: 'istqb',
      title: 'ISTQB Foundation Certification',
      institution: '',
      year: '2017',
    },
    {
      id: 'bit',
      title: 'Bachelor of Information Technology',
      institution: 'Queensland University of Technology',
      year: '2013',
    },
  ],

  skills: [
    {
      category: 'Design',
      items: [
        'Product Design',
        'UX Design',
        'Prototyping',
        'Design Systems',
        'User Research',
        'Interaction Design',
      ],
    },
    {
      category: 'Technical',
      items: [
        'Next.js',
        'React',
        'TypeScript',
        'Tailwind CSS',
        'Framer Motion',
        'Vercel',
        'Git',
      ],
    },
    {
      category: 'AI Tools',
      items: [
        'Claude',
        'Claude Code',
        'Cursor',
        'LLM API Integration',
      ],
    },
    {
      category: 'Process & Frameworks',
      items: [
        'Shape Up',
        'Jobs-to-be-Done',
        'Continuous Discovery',
        'Teresa Torres OST',
        'HEART Framework',
        'Rapid Experimentation',
      ],
    },
    {
      category: 'Leadership',
      items: [
        'Hiring',
        'Mentorship',
        'Cross-functional Collaboration',
        'Customer Discovery',
      ],
    },
  ],

  testimonials: [
    {
      name: 'Winnie Bamra',
      role: 'Senior Product Manager',
      company: 'Ex-SpaceX · SEEK',
      content:
        'Gareth is a pleasure to work with and an asset to any team. He is diligent in discovery, passionate about the end user, empathetic, and collaborative in his approach. He is excellent at leading user interviews, enabling the team to collect and extract actionable insights.',
    },
    {
      name: 'Richard Simms',
      role: 'Principal Product Designer',
      company: 'SEEK',
      content:
        'A talented senior UX designer who can independently drive projects forward. His designs reflected a deep understanding of our users, combined with a mastery of UX principles. Meticulous attention to detail and craft are evident in everything he produces.',
    },
    {
      name: 'Ahmed Hakeem',
      role: 'Staff Engineer',
      company: 'SEEK',
      content:
        "A developer's best friend. I have many fond memories bouncing ideas around and jamming out features end to end from fake door tests to deployment. At every step Gareth was inquisitive, collaborative and open to thinking on their feet.",
    },
    {
      name: 'David Deville',
      role: 'Senior Content Designer',
      company: 'SEEK',
      content:
        'Gareth goes above and beyond designing for customer needs. Fast experimentation, elegant designs and constant iteration resulted in products like an AI-powered resume generator that genuinely helped candidates. A positive, creative and likeable teammate.',
    },
    {
      name: 'Henry Vesander',
      role: 'Chief Product Officer',
      company: 'Best Practice Software',
      content:
        'An outstanding UX/product designer. I hired him to build a cloud-based practice management SaaS. He is a driven individual that can be trusted in getting the job done once given guidance and a brief. I definitely recommend Gareth!',
    },
  ],

  llmContext: `Gareth Chainey is a Senior Product Designer based in Sydney, Australia with 10+ years experience across startups and large-scale companies in B2C and B2B SaaS. He creates high quality prototypes to rapidly experiment, make product decisions, and win deals.

CURRENT ROLE - EnterpriseAI (May 2025 - Present, Sydney):
Gareth works at EnterpriseAI, which builds products solving business problems with LLMs. He builds two main products: an agentic workflow creation tool for the enterprise, and a government building application platform. He single-handedly builds high quality prototypes to respond to multi-million dollar RFP deals — work that would previously require entire teams. He set up and leads customer discovery and acquisition/conversion. He designed LLM-integrated prototypes for an enterprise-ready agentic workflow management tool. He closely collaborates with product and engineering to continually improve product and strategy. He operates as a one-person product team: PM, designer, QA, and engineer — using AI tools like Claude, Claude Code, and Cursor to ship real code rather than just Figma mockups.

PREVIOUS ROLE - SEEK (May 2022 - Sep 2024, Melbourne):
SEEK is APAC's largest employment marketplace. Gareth led continuous discovery for a team empowering candidates to live fulfilling working lives. Key achievements: Led design for an initiative connecting candidates with education courses, increasing conversion rate by 75% and adding $500,000 in annual revenue. Led discovery and design for projects that increased organic visits by 25.9% in a single year (over a million annual visits). Conducted 100s of customer interviews, experiments, and assumption tests. Led initiative to implement the HEART framework for long-term alignment of customer value and business objectives.

PREVIOUS ROLE - Best Practice Software (Oct 2019 - May 2022, Brisbane):
Australia's largest Practice Management System. Gareth led design for the new SaaS successor product. He grew a design team to 5 people and worked with 30+ engineers. He provided end-to-end design for domain-specific areas (prescribing) and domain-agnostic areas (calendar, invoicing). He started and maintained the design system used by 30+ engineers and 5 designers. He interviewed, hired, and mentored other designers.

EDUCATION:
Continuous Discovery Masterclass & Continuous Interviewing (2022 & 2023, Product Talk Academy), ISTQB Foundation Certification (2017), Bachelor of Information Technology (2013, Queensland University of Technology).

DESIGN PHILOSOPHY:
Gareth uses Shape Up, Jobs-to-be-Done, Teresa Torres Opportunity Solution Trees, and the HEART framework. He believes in no bureaucracy — just do the thing. He favors collaboration over handoff, early team buy-in over late approval, and rapid experimentation over lengthy spec documents. He creates "lite" versions of products for rapid testing and iteration.

TECHNICAL CAPABILITIES:
Gareth now codes in Next.js, React, and TypeScript with Tailwind CSS and Framer Motion. He deploys on Vercel. He builds real working prototypes with AI assistance — not just mockups. His AI toolkit includes Claude for thinking, Claude Code for building, and Cursor for coding. His technical stack changes frequently — he uses whatever ships fastest.

WHAT COLLEAGUES SAY:
Winnie Bamra (Senior PM, ex-SpaceX/SEEK): Diligent in discovery, passionate about the end user, excellent at leading user interviews. Richard Simms (Principal Product Designer, SEEK): Independently drives projects forward, meticulous attention to detail and craft. Ahmed Hakeem (Staff Engineer, SEEK): A developer's best friend — inquisitive, collaborative, and open to thinking on their feet. David Deville (Senior Content Designer, SEEK): Goes above and beyond, fast experimentation and elegant designs. Henry Vesander (CPO, Best Practice): Outstanding designer, driven and trustworthy.

KEY PROJECTS:
He built an enterprise RFP response system single-handedly using AI tools. He created ProductLite, a real-code prototyping methodology. He designed a no-code LLM workflow configurator. He has shipped multiple LLM-powered features including feature flags, chat interfaces, and dynamic workflows.`,
}
