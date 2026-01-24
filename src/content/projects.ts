// Project/Case Study Content - Acts as a simple CMS
// Add your case studies here

export interface MediaBlock {
  type: 'image' | 'gif' | 'video' | 'embed'
  src: string
  alt?: string
  caption?: string
  aspectRatio?: string // e.g., '16/9', '4/3', '1/1'
}

export interface TextBlock {
  type: 'text'
  content: string
}

export interface HeadingBlock {
  type: 'heading'
  level: 2 | 3
  content: string
}

export interface ListBlock {
  type: 'list'
  items: string[]
}

export type ContentBlock = MediaBlock | TextBlock | HeadingBlock | ListBlock

export interface Project {
  id: string
  title: string
  description: string
  category: string
  year: string
  heroImage?: string
  tags: string[]
  featured?: boolean // Show in hero with special treatment
  showGitHubActivity?: boolean // Show GitHub activity visualization in card
  content: ContentBlock[]
  chatContext: {
    description: string
    suggestedQuestions: string[]
    followUpQuestions: string[]
  }
}

export const projects: Project[] = [
  {
    id: 'conflict-and-experiments',
    title: 'How I Handle Conflict',
    description: 'Disagreements aren\'t problems to avoid—they\'re opportunities to learn. Here\'s how I turn product debates into experiments.',
    category: 'Article',
    year: '2025',
    featured: true,
    tags: ['Process', 'Collaboration', 'Experimentation', 'Leadership'],
    content: [
      {
        type: 'heading',
        level: 2,
        content: 'The Wrong Kind of Right'
      },
      {
        type: 'text',
        content: 'There\'s a famous Steve Jobs clip where he talks about focus. But the part people miss is what he says about being wrong. He describes how the best ideas often came from people he initially disagreed with—and how being "right" individually matters far less than getting to the right answer collectively.'
      },
      {
        type: 'embed',
        src: 'https://www.youtube.com/embed/H8eP99neOVs',
        caption: 'Steve Jobs on focus, saying no, and the humility to be wrong',
        aspectRatio: '16/9'
      },
      {
        type: 'text',
        content: 'This reframed how I think about conflict. A disagreement isn\'t a battle to win—it\'s a signal that we have different mental models. And different mental models mean we have an opportunity to learn something.'
      },
      {
        type: 'heading',
        level: 2,
        content: 'From Debate to Experiment'
      },
      {
        type: 'text',
        content: 'When two people have strong, opposing product intuitions, the worst thing you can do is argue until someone gives up. The second worst thing is to compromise into something neither person believes in.'
      },
      {
        type: 'text',
        content: 'Instead, I ask: "How can we test this?" Turn the disagreement into a hypothesis. Run with one direction, measure the outcome, and see if reality matches what we expected.'
      },
      {
        type: 'list',
        items: [
          'State each position as a hypothesis with a predicted outcome',
          'Agree on what "success" looks like before running the test',
          'Pick the cheapest way to get signal (not the most thorough)',
          'Commit to following the data, even if it proves you wrong'
        ]
      },
      {
        type: 'heading',
        level: 2,
        content: 'Cheap Ways to Experiment'
      },
      {
        type: 'text',
        content: 'Teresa Torres has written extensively about continuous discovery and lightweight experimentation. Here are the methods I use most often:'
      },
      {
        type: 'heading',
        level: 3,
        content: 'Fake Door Tests'
      },
      {
        type: 'text',
        content: 'Add a button or link for a feature that doesn\'t exist yet. Measure how many people click it. If nobody clicks, you\'ve saved weeks of development. If lots of people click, you\'ve validated demand before writing a line of code.'
      },
      {
        type: 'heading',
        level: 3,
        content: 'Wizard of Oz'
      },
      {
        type: 'text',
        content: 'Make it look automated, but do it manually behind the scenes. This lets you test the experience without building the infrastructure. I\'ve run entire "AI features" that were actually just me responding quickly in a queue.'
      },
      {
        type: 'heading',
        level: 3,
        content: 'Concierge Tests'
      },
      {
        type: 'text',
        content: 'Deliver the service manually to a small group. Don\'t scale it—learn from it. Watch how people actually use what you\'re offering. The patterns you see will inform what to build.'
      },
      {
        type: 'heading',
        level: 3,
        content: '5-Second Tests'
      },
      {
        type: 'text',
        content: 'Show someone a design for 5 seconds, then ask what they remember. If they can\'t identify the main action or value prop, your design isn\'t clear. Takes 10 minutes, costs nothing, saves weeks of building the wrong thing.'
      },
      {
        type: 'heading',
        level: 3,
        content: 'Prototype Testing'
      },
      {
        type: 'text',
        content: 'This is where my "code prototyping" approach shines. Build a working version in a day, put it in front of real users, and watch what happens. Not a Figma mockup—something they can actually interact with.'
      },
      {
        type: 'heading',
        level: 2,
        content: 'The Meta-Lesson'
      },
      {
        type: 'text',
        content: 'The goal isn\'t to avoid conflict. The goal is to make conflict productive. When someone disagrees with me, I\'ve learned to get curious instead of defensive. What do they see that I don\'t? What assumption am I making that might be wrong?'
      },
      {
        type: 'text',
        content: 'And when we can\'t resolve it through discussion, we run an experiment. The data doesn\'t care about seniority or who argued more convincingly. It just tells us what\'s true.'
      },
      {
        type: 'heading',
        level: 2,
        content: 'Further Reading'
      },
      {
        type: 'list',
        items: [
          'Teresa Torres - Continuous Discovery Habits',
          'Marty Cagan - Inspired & Empowered',
          'Eric Ries - The Lean Startup',
          'Rob Fitzpatrick - The Mom Test'
        ]
      },
    ],
    chatContext: {
      description: 'Article about handling disagreements through experimentation, referencing Teresa Torres methods and Steve Jobs on focus',
      suggestedQuestions: [
        'How do you handle strong disagreements?',
        'What\'s your favorite cheap experiment?',
        'How do you know when to run an experiment vs. just decide?',
      ],
      followUpQuestions: [
        'Tell me about a time an experiment proved you wrong',
        'How do you get buy-in for running experiments?',
        'What if the data is inconclusive?',
        'How do you balance speed vs. rigor?',
      ]
    }
  },
  {
    id: 'the-future-is-now',
    title: 'The Future is Now',
    description: 'AI has fundamentally changed how designers produce their work. This is my journey from Figma to shipping real code.',
    category: 'Article',
    year: '2025',
    featured: true,
    showGitHubActivity: true,
    tags: ['AI', 'Design', 'Transformation', 'Essay'],
    content: [
      {
        type: 'heading',
        level: 2,
        content: 'The Shift'
      },
      {
        type: 'text',
        content: 'In early 2024, I was a traditional product designer. My tools were Figma, FigJam, and endless Slack messages to developers about pixel-perfect implementations. By 2025, I had become something else entirely—a one-person product team capable of designing, building, and shipping real software.'
      },
      {
        type: 'text',
        content: 'The GitHub activity chart above tells this story. Watch the progression from sparse contributions to daily commits. This isn\'t about working more hours—it\'s about AI multiplying what\'s possible in each hour.'
      },
      {
        type: 'heading',
        level: 2,
        content: 'What Changed'
      },
      {
        type: 'text',
        content: 'Three things shifted fundamentally:'
      },
      {
        type: 'list',
        items: [
          'Prototypes became real software. No more "imagine this works" demos.',
          'Ideas could be tested within hours, not weeks.',
          'The gap between design and development collapsed.'
        ]
      },
      {
        type: 'heading',
        level: 2,
        content: 'The New Stack'
      },
      {
        type: 'text',
        content: 'My daily toolkit looks nothing like it did 18 months ago:'
      },
      {
        type: 'list',
        items: [
          'Claude for strategic thinking and code generation',
          'Cursor for rapid development with AI assistance',
          'Next.js + Tailwind for production-ready output',
          'Vercel for instant deployment'
        ]
      },
      {
        type: 'heading',
        level: 2,
        content: 'What I\'ve Built'
      },
      {
        type: 'text',
        content: 'Here are examples of what this transformation has enabled:'
      },
      {
        type: 'heading',
        level: 3,
        content: 'Enterprise RFP Response'
      },
      {
        type: 'text',
        content: 'Delivered a complete enterprise proposal—technical writing, interactive prototypes, and demos—as a one-person team. What typically requires a squad of specialists became a solo mission with AI augmentation.'
      },
      {
        type: 'heading',
        level: 3,
        content: 'ProductLite Prototyping'
      },
      {
        type: 'text',
        content: 'Built a methodology for creating "lite" versions of products. Real code, real data, real interactions—just without the complexity of production infrastructure. These prototypes win deals and validate ideas before full investment.'
      },
      {
        type: 'heading',
        level: 3,
        content: 'No-Code LLM Configurator'
      },
      {
        type: 'text',
        content: 'Designed and built a visual tool for business users to create AI workflows without writing code. The kind of feature that would have been a static mockup is now a working prototype.'
      },
      {
        type: 'heading',
        level: 2,
        content: 'The Philosophy'
      },
      {
        type: 'text',
        content: 'This isn\'t about AI replacing designers. It\'s about designers who embrace AI becoming exponentially more capable. The role evolves from "person who makes mockups" to "person who ships solutions."'
      },
      {
        type: 'list',
        items: [
          'Shape Up over Scrum—bet on outcomes, not tickets',
          'Collaboration over handoff—work with engineers, not ahead of them',
          'Real over imagined—build the thing, don\'t just describe it',
          'Fast over perfect—ship and iterate'
        ]
      },
      {
        type: 'heading',
        level: 2,
        content: 'Explore Further'
      },
      {
        type: 'text',
        content: 'Dive deeper into specific projects to see this transformation in action:'
      },
    ],
    chatContext: {
      description: 'Article about how AI has transformed the design profession and my personal journey from Figma to shipping real code',
      suggestedQuestions: [
        'How did you start learning to code with AI?',
        'What was the hardest part of this transition?',
        'Is this the future for all designers?',
      ],
      followUpQuestions: [
        'Show me an example project',
        'What tools do you recommend starting with?',
        'How long did this transformation take?',
        'What skills are still essential?',
      ]
    }
  },
  {
    id: 'rfp',
    title: 'Respond to RFP',
    description: 'One man army to win a deal. Demonstrating how AI augmentation enables a single designer to deliver enterprise-quality proposals.',
    category: 'Enterprise AI',
    year: '2025',
    tags: ['AI', 'Enterprise', 'Sales', 'Prototyping'],
    content: [
      {
        type: 'heading',
        level: 2,
        content: 'The Challenge'
      },
      {
        type: 'text',
        content: 'Enterprise RFPs typically require a team of specialists—solution architects, designers, copywriters, and project managers. I wanted to prove that AI augmentation could compress this into a one-person operation.'
      },
      {
        type: 'heading',
        level: 2,
        content: 'The Approach'
      },
      {
        type: 'text',
        content: 'Using Claude for strategic thinking and content generation, combined with rapid prototyping in code, I was able to deliver a comprehensive proposal in a fraction of the typical time.'
      },
      {
        type: 'heading',
        level: 3,
        content: 'Key Features'
      },
      {
        type: 'list',
        items: [
          'AI-assisted content generation for technical writing',
          'Rapid prototyping of proposed solutions',
          'Interactive demos built in real code',
          'Automated document formatting and styling'
        ]
      },
      // Add your media here:
      // {
      //   type: 'gif',
      //   src: '/projects/rfp/demo.gif',
      //   alt: 'RFP workflow demo',
      //   caption: 'AI-assisted proposal generation workflow'
      // },
    ],
    chatContext: {
      description: 'Case study about using AI to respond to enterprise RFPs as a one-person team',
      suggestedQuestions: [
        'How did you approach this RFP?',
        'What AI tools did you use?',
        'How long did it take?',
      ],
      followUpQuestions: [
        'What was the outcome?',
        'Would this work for any RFP?',
        'How do you handle technical requirements?',
      ]
    }
  },
  {
    id: 'productlite',
    title: 'ProductLite',
    description: 'Real code prototyping that enables rapid experimentation, user testing, and production-ready output.',
    category: 'Prototyping',
    year: '2025',
    tags: ['React', 'Prototyping', 'User Testing', 'AI'],
    content: [
      {
        type: 'heading',
        level: 2,
        content: 'Beyond Figma'
      },
      {
        type: 'text',
        content: 'Figma prototypes are great for static flows, but they can\'t capture real interactions, data states, or edge cases. ProductLite is my approach to building real code prototypes that can be tested with actual users.'
      },
      {
        type: 'heading',
        level: 2,
        content: 'The Stack'
      },
      {
        type: 'list',
        items: [
          'Next.js for rapid development',
          'Tailwind for consistent styling',
          'Framer Motion for animations',
          'Claude for code generation and iteration'
        ]
      },
      // Add your media here
    ],
    chatContext: {
      description: 'Case study about building real code prototypes for rapid experimentation and user testing',
      suggestedQuestions: [
        'Why code instead of Figma?',
        'How fast can you prototype?',
        'Can prototypes become production code?',
      ],
      followUpQuestions: [
        'What\'s your testing process?',
        'How do you handle design handoff?',
        'What tools do you use?',
      ]
    }
  },
  {
    id: 'configurator',
    title: 'Configurator',
    description: 'No-code LLM workflow tool prototype. Building complex AI pipelines without writing code.',
    category: 'No-Code AI',
    year: '2025',
    tags: ['LLM', 'No-Code', 'Workflows', 'Enterprise'],
    content: [
      {
        type: 'heading',
        level: 2,
        content: 'Democratizing AI Workflows'
      },
      {
        type: 'text',
        content: 'Most business users can\'t write code, but they have valuable domain knowledge about their processes. The Configurator lets them build AI workflows visually.'
      },
      {
        type: 'heading',
        level: 2,
        content: 'Core Concepts'
      },
      {
        type: 'list',
        items: [
          'Visual workflow builder',
          'Pre-built LLM components',
          'Data transformation nodes',
          'Integration with existing tools'
        ]
      },
    ],
    chatContext: {
      description: 'Case study about building a no-code LLM workflow configurator',
      suggestedQuestions: [
        'What problems does this solve?',
        'Who is the target user?',
        'How does it work?',
      ],
      followUpQuestions: [
        'What LLMs does it support?',
        'How do you handle errors?',
        'Can workflows be shared?',
      ]
    }
  },
  {
    id: 'llm-features',
    title: 'Things I Built with LLMs',
    description: 'Feature Flags, LLM Chat, Dynamic Workflows—features that would be impossible in Figma, now real.',
    category: 'AI Development',
    year: '2025',
    tags: ['LLM', 'Features', 'React', 'AI'],
    content: [
      {
        type: 'heading',
        level: 2,
        content: 'From Mockup to Real'
      },
      {
        type: 'text',
        content: 'These are small features I\'ve built that demonstrate the shift from designing interfaces to building actual functionality. Each would have been a static mockup in the old world.'
      },
      {
        type: 'heading',
        level: 3,
        content: 'Feature Flags'
      },
      {
        type: 'text',
        content: 'A complete feature flag system with targeting rules, percentage rollouts, and real-time updates.'
      },
      {
        type: 'heading',
        level: 3,
        content: 'LLM Chat'
      },
      {
        type: 'text',
        content: 'The chat interface on this very site—contextual AI that knows about each page.'
      },
      {
        type: 'heading',
        level: 3,
        content: 'Dynamic Workflows'
      },
      {
        type: 'text',
        content: 'Drag-and-drop workflow builders with real execution, not just visual mockups.'
      },
    ],
    chatContext: {
      description: 'Collection of small features built with AI that would be impossible to prototype in Figma',
      suggestedQuestions: [
        'Which feature was hardest to build?',
        'How long did these take?',
        'What\'s your process for building features?',
      ],
      followUpQuestions: [
        'Can you show me a demo?',
        'What tools did you use?',
        'Are these production-ready?',
      ]
    }
  },
]

export function getProjectById(id: string): Project | undefined {
  return projects.find(p => p.id === id)
}

export function getAllProjectIds(): string[] {
  return projects.map(p => p.id)
}
