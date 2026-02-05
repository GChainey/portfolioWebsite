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
    title: 'Responding to an RFP',
    description: 'A small startup competing against large organizations for a major government tender. One designer with AI tools delivered what would normally require a multi-team effort.',
    category: 'Enterprise AI',
    year: '2025',
    tags: ['AI', 'Enterprise', 'Prototyping', 'Claude Code', 'RFP'],
    content: [
      // --- TLDR ---
      {
        type: 'heading',
        level: 2,
        content: 'TLDR'
      },
      {
        type: 'text',
        content: 'I was the sole designer at a small startup competing for a large government tender against well-resourced organizations. Figma couldn\'t handle the scope—so I switched to building a working code prototype with Claude Code. What would normally require a squad of designers, engineers, and solution architects became a one-person operation. The result: a fully interactive prototype with real data, live LLM features, and rapid iteration that\'s still being referenced and iterated on today.'
      },

      // --- Context ---
      {
        type: 'heading',
        level: 2,
        content: 'The Situation'
      },
      {
        type: 'text',
        content: 'I was working for a small startup that had built a product for small local councils. A major opportunity came in—a large government tender at the state level. The RFP was extensive, with complex requirements that went far beyond what our existing product handled. We were competing against established enterprise vendors with large teams.'
      },
      {
        type: 'text',
        content: 'The team responding to this RFP was lean: me as the designer, a product manager I collaborated with closely, and the founder who provided in-depth knowledge of the RFP requirements. That was it.'
      },

      // --- The Problem ---
      {
        type: 'heading',
        level: 2,
        content: 'Why Figma Wasn\'t Enough'
      },
      {
        type: 'text',
        content: 'I started in Figma, which was our standard design tool. But the scope and complexity of the RFP quickly exposed Figma\'s limitations for this kind of work:'
      },
      {
        type: 'list',
        items: [
          'Requirements changed frequently—updating static mockups across dozens of screens was slow and error-prone',
          'The RFP required demonstrating realistic data scenarios that were consistent throughout the product',
          'Key features like LLM-powered document analysis needed to feel real, not just be static wireframes',
          'The scale shift from small councils to an entire state meant rethinking data architecture, not just reskinning screens',
          'Stakeholders needed to interact with the prototype, not just view screenshots'
        ]
      },
      {
        type: 'text',
        content: 'Figma prototypes are inherently linear—click through a predefined path. For this RFP, we needed something people could explore, something that felt like a real product.'
      },

      // --- The Approach ---
      {
        type: 'heading',
        level: 2,
        content: 'The Approach: Code as Design'
      },
      {
        type: 'text',
        content: 'I had already built a lightweight version of the product—a "ProductLite" prototype in code. Using Claude Code, I created a new branch and began adapting it for the state-level tender. Instead of Figma being the source of truth, the working prototype became the reference that engineers and stakeholders could access directly.'
      },
      {
        type: 'text',
        content: 'This changed the dynamic entirely. I could design faster than the engineering team was able to build, unconstrained by their existing technical limitations. And rather than handing off static files, I was delivering something people could use.'
      },

      // --- Key Features Section ---
      {
        type: 'heading',
        level: 2,
        content: 'Key Features: What Code Made Possible'
      },
      {
        type: 'text',
        content: 'These are the features that made the difference—things that simply couldn\'t be done in Figma. Each one demonstrates why a working prototype was essential for winning this tender.'
      },

      // Feature 1: Seed Data
      {
        type: 'heading',
        level: 3,
        content: 'Consistent Seed Data'
      },
      {
        type: 'text',
        content: 'The RFP required demonstrating how the product would handle real-world government data at scale. We needed consistent data throughout—names, case numbers, dates, statuses—that told a coherent story across every screen. In Figma, changing a single data point means manually updating every screen it appears on. In code, changing the seed data updates everywhere instantly.'
      },
      // VIDEO PLACEHOLDER: Seed data demo
      {
        type: 'video',
        src: '/projects/rfp/seed-data-demo.mp4',
        alt: 'Seed data consistency across the prototype',
        caption: 'Consistent seed data flowing through every screen—change it once, it updates everywhere',
        aspectRatio: '16/9'
      },

      // Feature 2: LLM Chat
      {
        type: 'heading',
        level: 3,
        content: 'Live LLM Document Analysis'
      },
      {
        type: 'text',
        content: 'A core requirement was showing how AI could help government workers analyze and respond to documents. In Figma, this would be a linear click-through with predetermined responses. In the code prototype, we connected an actual LLM—users could ask real questions about documents and get contextual, dynamic answers. This was a fundamentally better proof of concept.'
      },
      // VIDEO PLACEHOLDER: LLM chat demo
      {
        type: 'video',
        src: '/projects/rfp/llm-chat-demo.mp4',
        alt: 'Live LLM chat interface responding to document queries',
        caption: 'A working LLM chat interface that responds to real queries—impossible to replicate in Figma',
        aspectRatio: '16/9'
      },

      // Feature 3: Scale Adaptation
      {
        type: 'heading',
        level: 3,
        content: 'Small Council to State-Level Scale'
      },
      {
        type: 'text',
        content: 'The existing product was designed for small local councils. The RFP required demonstrating it at state scale—different data hierarchies, different user roles, different reporting structures. In code, I could restructure the data model and UI to reflect this new scale without starting from scratch.'
      },
      // VIDEO PLACEHOLDER: Scale comparison
      {
        type: 'video',
        src: '/projects/rfp/scale-demo.mp4',
        alt: 'Product adapted from council-level to state-level operations',
        caption: 'Adapting the product from small council to state-level scope—restructured data and UI in days, not months',
        aspectRatio: '16/9'
      },

      // Feature 4: Rapid Iteration
      {
        type: 'heading',
        level: 3,
        content: 'Rapid Requirement Changes'
      },
      {
        type: 'text',
        content: 'RFP requirements evolved constantly as we dug deeper into the tender documents. New fields, new workflows, new compliance requirements would surface weekly. In Figma, each change cascades across screens. With Claude Code, I could describe the change and have it implemented across the prototype in minutes.'
      },
      // VIDEO PLACEHOLDER: Rapid iteration demo
      {
        type: 'video',
        src: '/projects/rfp/iteration-demo.mp4',
        alt: 'Rapidly iterating on prototype requirements',
        caption: 'Implementing a requirement change across the entire prototype—what would take days in Figma done in minutes',
        aspectRatio: '16/9'
      },

      // Feature 5: Interactive Workflows
      {
        type: 'heading',
        level: 3,
        content: 'Interactive Workflows'
      },
      {
        type: 'text',
        content: 'The RFP required demonstrating complex multi-step workflows—case management, approvals, escalations. Static mockups can show the screens, but they can\'t show how data flows between steps, how state changes, or how edge cases are handled. The code prototype let evaluators walk through real workflows with real state management.'
      },
      // VIDEO PLACEHOLDER: Workflow demo
      {
        type: 'video',
        src: '/projects/rfp/workflow-demo.mp4',
        alt: 'Interactive workflow demonstration with state management',
        caption: 'Multi-step workflows with real state management—evaluators could explore freely, not follow a script',
        aspectRatio: '16/9'
      },

      // --- Impact ---
      {
        type: 'heading',
        level: 2,
        content: 'The Impact'
      },
      {
        type: 'text',
        content: 'This project is the clearest demonstration of what AI-augmented design makes possible. Here\'s the contrast:'
      },

      {
        type: 'heading',
        level: 3,
        content: 'Without AI Tools'
      },
      {
        type: 'list',
        items: [
          'A team of 3-5 designers for Figma mockups across all required screens',
          'Solution architects to document technical feasibility',
          'Engineers to build any interactive demos',
          'Weeks of coordination between design, engineering, and proposal writing',
          'Static deliverables that can\'t be explored freely',
          'Every requirement change triggers a cascade of manual updates',
        ]
      },

      {
        type: 'heading',
        level: 3,
        content: 'With AI Tools'
      },
      {
        type: 'list',
        items: [
          'One designer with Claude Code delivering the full prototype',
          'A product manager for collaboration and direction',
          'The founder for RFP domain expertise',
          'Days instead of weeks for major feature additions',
          'A living prototype that stakeholders could interact with',
          'Requirement changes implemented same-day',
        ]
      },

      // --- Outcome ---
      {
        type: 'heading',
        level: 2,
        content: 'The Outcome'
      },
      {
        type: 'text',
        content: 'The prototype delivered for the RFP wasn\'t just a proposal artifact—it became a product asset. It\'s still being referenced and iterated on today, which is the opposite of what happens with Figma files after a tender. The designs didn\'t get handed off and forgotten; they became the foundation that engineering continued building on.'
      },
      {
        type: 'text',
        content: 'This project proved that the shift from static design tools to AI-augmented code prototyping isn\'t just about speed—it\'s about producing fundamentally better work. A working prototype with real data, real LLM integration, and real interactivity tells a story that no amount of polished mockups can match.'
      },

      // --- Tools & Process ---
      {
        type: 'heading',
        level: 2,
        content: 'Tools & Process'
      },
      {
        type: 'list',
        items: [
          'Claude Code for rapid prototyping and code generation',
          'Next.js + React for the prototype framework',
          'Tailwind CSS for consistent, rapid styling',
          'LLM API integration for live chat features',
          'Git branching to manage prototype variants',
          'Vercel for instant deployment and stakeholder access',
        ]
      },
    ],
    chatContext: {
      description: 'Case study about a designer using AI tools to single-handedly deliver an enterprise RFP response with a working code prototype, competing against large organizations for a government tender',
      suggestedQuestions: [
        'How did you approach this RFP differently?',
        'What couldn\'t you do in Figma that code solved?',
        'How long did the prototype take to build?',
      ],
      followUpQuestions: [
        'What was the outcome of the tender?',
        'Is the prototype still being used?',
        'How did the engineers react to your code prototype?',
        'What would you do differently next time?',
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
