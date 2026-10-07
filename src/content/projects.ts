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
  ordered?: boolean // Numbered list — for steps where the order matters
}

export interface ComponentBlock {
  type: 'component'
  componentId: string
  props?: Record<string, unknown>
  caption?: string
}

export type ContentBlock = MediaBlock | TextBlock | HeadingBlock | ListBlock | ComponentBlock

export interface Project {
  id: string
  title: string
  description: string
  category: string
  year: string
  heroImage?: string
  heroVideo?: string // Plays in place of the hero image, which becomes its poster
  tags: string[]
  featured?: boolean // Show in hero with special treatment
  showGitHubActivity?: boolean // Show GitHub activity visualization in card
  externalUrl?: string // Link to external page instead of /projects/[id]
  companyId?: string // Link project to a company experience (e.g. 'enterpriseai', 'seek', 'bestpractice')
  kind?: 'product' // Products I've built — shown in the Products section with a live link
  liveUrl?: string // Live product URL — rendered alongside the case study, not instead of it
  status?: 'Live' | 'Beta' | 'In development' // Product status badge
  productVisual?: 'dispatch' | 'thesis' // Which animated card visual to render
  content: ContentBlock[]
  chatContext: {
    description: string
    suggestedQuestions: string[]
    followUpQuestions: string[]
  }
}

export const projects: Project[] = [
  // --- Products I've built ---
  {
    id: 'dispatch',
    title: 'Dispatch',
    description: 'A product I designed and built. Case study coming soon.',
    category: 'Product',
    year: '2026',
    kind: 'product',
    status: 'Live',
    // liveUrl: '', // TODO: add the real Dispatch URL to show the "Visit Dispatch" link
    productVisual: 'dispatch',
    tags: ['Product', 'AI', 'Built solo'],
    content: [
      { type: 'heading', level: 2, content: 'Coming Soon' },
      { type: 'text', content: 'This case study is currently being written. Check back soon.' },
    ],
    chatContext: {
      description: 'Dispatch — a product Gareth designed and built. Case study details are still being written.',
      suggestedQuestions: [
        'What is Dispatch?',
        'What problem does Dispatch solve?',
        'How was Dispatch built?',
      ],
      followUpQuestions: [
        'Who is Dispatch for?',
        'What did you learn building it?',
      ],
    },
  },
  {
    id: 'thesis',
    title: 'Thesis',
    description: 'A product I designed and built. Case study coming soon.',
    category: 'Product',
    year: '2026',
    kind: 'product',
    status: 'Live',
    // liveUrl: '', // TODO: add the real Thesis URL to show the "Visit Thesis" link
    productVisual: 'thesis',
    tags: ['Product', 'AI', 'Built solo'],
    content: [
      { type: 'heading', level: 2, content: 'Coming Soon' },
      { type: 'text', content: 'This case study is currently being written. Check back soon.' },
    ],
    chatContext: {
      description: 'Thesis — a product Gareth designed and built. Case study details are still being written.',
      suggestedQuestions: [
        'What is Thesis?',
        'What problem does Thesis solve?',
        'How was Thesis built?',
      ],
      followUpQuestions: [
        'Who is Thesis for?',
        'What did you learn building it?',
      ],
    },
  },
  {
    id: 'how-i-work',
    title: 'How I Work',
    description: 'A video demo and essay on my AI-augmented workflow — shipping multiple features in parallel using Conductor, GitHub, SuperWhisper, and Vercel.',
    category: 'Process',
    year: '2026',
    featured: true,
    tags: ['AI', 'Workflow', 'Video', 'Essay'],
    externalUrl: '/how-i-work',
    content: [],
    chatContext: {
      description: 'Video demo and essay about AI-augmented design workflow',
      suggestedQuestions: [
        'How do you use AI agents day-to-day?',
        'What is Conductor?',
        'How long does it take to ship a feature?',
      ],
      followUpQuestions: [
        'How do you handle iteration and refinement?',
        'What role does voice play in your workflow?',
      ]
    }
  },
  {
    id: 'agentic-user-testing',
    title: 'Agentic user testing',
    description: 'Removing the friction of setting up user tests, and getting results you can trust when you design in HTML, not Figma.',
    category: 'Article',
    year: '2026',
    featured: true,
    heroImage: '/essays/agentic-user-testing/cover.png',
    tags: ['AI', 'User Testing', 'Research', 'Essay'],
    content: [
      {
        type: 'heading',
        level: 2,
        content: 'TLDR: here\'s how I did it'
      },
      {
        type: 'list',
        items: [
          'use Grokbot\'s VM to sign into Lyssna and create an unmoderated test based off your hosted html prototype',
          'tell your agent to set up your prototypes to have event listening for the task you are testing for on posthog',
          'use posthog to evaluate experiments and evaluate their responses without lifting a finger',
          'compare lyssna transcript/video results to prototype results',
          'design with user testing earlier and faster to help the creative process',
        ]
      },
      {
        type: 'text',
        content: 'Designing for usability in 2026 probably gets an eye-roll. We\'re building faster than ever and slowing that down to get some feedback feels so pre-2026. But testing assumptions is good and if you can increase the speed to insight, it can aid your design and help you make less assumptions and in-turn make better decisions.'
      },
      {
        type: 'text',
        content: 'I would design a workflow, set up an unmoderated test for 5 users, run the test and then watch the results.'
      },
      {
        type: 'text',
        content: 'For example, in one round of testing I tasked people to set up an AI chatbot for their app and 0/5 people were able to complete the task. Interestingly, every tester self-reported they had completed the task but had only completed one step of the setup.'
      },
      {
        type: 'text',
        content: 'In the second round, I set up a clear onward journey, re-ran the test, and 5/5 were able to complete it.'
      },
      {
        type: 'text',
        content: 'The user testing was valuable but the setup was long, boring, and felt really at odds with how design is working in 2026.'
      },
      {
        type: 'heading',
        level: 2,
        content: 'I had three main issues'
      },
      {
        type: 'list',
        ordered: true,
        items: [
          'It\'s slow to construct an experiment on Lyssna. The MCP is read-only and not write. So creating an experiment was taking too much time.',
          'I can\'t trust the results so it takes up too much time for manual review. I\'m designing flows in html prototypes and not Figma and Lyssna is doing a bad job for this. Lyssna lets you set a URL, and record the video and voice. But because you can\'t set the goal, you are relying on self-assessments of completion. Testers think they have completed a task, but have they really?',
          'Missing info. A video is just a bunch of frames, but there\'s interesting information being lost. How long did it take for each tester to get through a flow? Did a particular point have a spike in length of completion? Why?',
        ]
      },
      {
        type: 'text',
        content: 'So I sped this up, and I think this is really just scratching the surface of how user-testing could be incorporated into making products.'
      },
      {
        type: 'heading',
        level: 2,
        content: 'How to set it up'
      },
      {
        type: 'image',
        src: '/essays/agentic-user-testing/setup.jpg',
        alt: 'Flow diagram of headless user testing: the designer and agent write the experiment plan in Notion, the agent adds events to the prototype and dry-runs it, Grokbot builds the test in Lyssna, participants do the task while Lyssna records screen and voice and PostHog records events, then the agent matches the two and writes the report.',
        aspectRatio: '1148/1964'
      },
      {
        type: 'heading',
        level: 3,
        content: 'Once'
      },
      {
        type: 'list',
        items: [
          'Create a PostHog project and turn on session replay',
          'Have your agent add a small tracker to the prototype repo: pages, clicks and task steps',
          'Connect your agent to PostHog so it can read results',
          'Give your agent a browser login to Lyssna',
        ]
      },
      {
        type: 'heading',
        level: 3,
        content: 'Every test'
      },
      {
        type: 'list',
        ordered: true,
        items: [
          'Write the plan with your agent in Notion: task wording, expected steps, audience, pass mark (the agent often already knows this, so setup is instant)',
          'The agent adds the task’s events to the prototype and dry-runs it',
          'Publish the prototype at a public link',
          'The agent reads the plan, logs in to Lyssna and builds the test',
          'People take part: Lyssna records screen and voice, PostHog records what they did',
          'The agent matches the two and writes the report',
        ]
      },
      {
        type: 'heading',
        level: 2,
        content: 'What\'s next'
      },
      {
        type: 'text',
        content: 'I believe this is just scratching the surface, and by removing the barriers of user-testing I can imagine a world where:'
      },
      {
        type: 'list',
        items: [
          'usability tests are kicked off as you receive an updated build',
          'In the age where everyone is a builder, have people verify their designs before shipping',
        ]
      },
    ],
    chatContext: {
      description: 'Essay about agentic user testing: using an agent with a browser to build unmoderated tests in Lyssna from a plan in Notion, instrumenting HTML prototypes with PostHog events so task completion is measured instead of self-reported, and having the agent match Lyssna recordings to PostHog data and write the report',
      suggestedQuestions: [
        'Why can\'t you trust self-reported task completion?',
        'What does PostHog add that a Lyssna recording doesn\'t?',
        'How long does it take to set up a test now?',
      ],
      followUpQuestions: [
        'What changed between the 0/5 round and the 5/5 round?',
        'Why test HTML prototypes instead of Figma ones?',
        'How does the agent build the test in Lyssna?',
        'Where does this go next?',
      ]
    }
  },
  {
    id: 'creative-tooling',
    title: 'You Can Conjure Your Own Tools Now',
    description: 'In Figma, you waited for someone to ship the feature. With AI code tools, you build the creative tool you need in the moment you need it.',
    category: 'Article',
    year: '2026',
    featured: true,
    tags: ['AI', 'Creative Tools', 'Design Process', 'Essay'],
    content: [
      {
        type: 'heading',
        level: 2,
        content: 'The Old Model: Wait for the Feature'
      },
      {
        type: 'text',
        content: 'In Figma, if you wanted a specific creative tool—a new way to organize your work, a custom interaction pattern, a better way to track iterations—you waited. You waited for a team of engineers and designers to prioritize it, build it, ship it, and hope it matched what you actually needed. Your creative process was bounded by the features someone else decided to give you.'
      },
      {
        type: 'text',
        content: 'That dependency is dissolving. When you can describe what you want to a tool like Claude Code and have it built in minutes, the relationship between creator and tool changes fundamentally. You\'re no longer a user waiting for capabilities. You\'re someone who conjures them.'
      },
      {
        type: 'heading',
        level: 2,
        content: 'Building the Tool You Need, When You Need It'
      },
      {
        type: 'text',
        content: 'This portfolio site is itself an example. Every feature on it was built by describing what I wanted and iterating in conversation. But the more interesting shift isn\'t about building products—it\'s about building the creative tools within the product that support how you think and work.'
      },
      {
        type: 'text',
        content: 'Want to choose between different AI models for a chat interface? Don\'t wait for an API playground to add that feature. Build a model picker. Want a way to visually compare design approaches? Build it. The gap between "I wish this tool existed" and "I have this tool" has collapsed from months to minutes.'
      },
      {
        type: 'heading',
        level: 2,
        content: 'Iterations as Artifacts'
      },
      {
        type: 'text',
        content: 'But the most interesting creative tooling problem I\'ve run into is about iterations—specifically, how you preserve and present the journey of how something evolved.'
      },
      {
        type: 'text',
        content: 'In Figma, this was natural. You had a canvas with history. You could scroll through frames and see V1, V2, V3 side by side. The design tool doubled as a record of your thinking. Someone could look at your file and understand not just what you landed on, but why—what you tried, what you rejected, what trade-offs you navigated.'
      },
      {
        type: 'text',
        content: 'Working in code, that history disappears. Technically it exists in git commits, but nobody browses git history to understand design decisions. The friction is too high. The signal is buried in diffs that mix meaningful design changes with implementation details.'
      },
      {
        type: 'heading',
        level: 2,
        content: 'Feature Branches as a Design Canvas'
      },
      {
        type: 'text',
        content: 'So I started doing something different. As I build a feature and make significant iterations, I save each version behind a feature flag. Not as dead code or a screenshot in a slide deck—as a living, interactive version you can actually use.'
      },
      {
        type: 'text',
        content: 'Each version is accessible in staging or in a lightweight version of the product. You can click through V1, V2, V3, V4 and experience the evolution yourself. When someone asks "why didn\'t we do it this way?", I don\'t have to explain from memory. I can show the version where we tried that, and walk through what we learned.'
      },
      {
        type: 'text',
        content: 'The feature branch becomes the canvas. The feature flag becomes the frame selector. The code itself becomes the design artifact.'
      },
      {
        type: 'heading',
        level: 2,
        content: 'Telling the Story of Trade-offs'
      },
      {
        type: 'text',
        content: 'This matters because design decisions aren\'t obvious from the final output. The finished product looks inevitable—clean, resolved, like it couldn\'t have been any other way. But every version represents a set of trade-offs. V1 might have prioritized simplicity over power. V2 might have added flexibility but introduced confusion. V3 might have found a middle ground by rethinking the information architecture entirely.'
      },
      {
        type: 'text',
        content: 'When you can show all of these versions running side by side, the conversation about design decisions becomes concrete instead of abstract. You\'re not arguing about hypotheticals—you\'re comparing real, interactive implementations.'
      },
      {
        type: 'heading',
        level: 2,
        content: 'The Shift in Creative Practice'
      },
      {
        type: 'text',
        content: 'What\'s happening here is bigger than any single technique. The entire relationship between a creator and their tools is inverting. Previously, you adapted your creative process to fit the tools available. You learned the tool\'s mental model. You accepted its constraints. You worked within its paradigm.'
      },
      {
        type: 'text',
        content: 'Now the tool adapts to your creative process. If your workflow needs something that doesn\'t exist, you make it exist. If the way you think about iterations doesn\'t match how any tool presents them, you build presentation that matches how you think.'
      },
      {
        type: 'text',
        content: 'This is what it looks like when the friction between imagination and implementation approaches zero. Not that everything becomes easy—the thinking is still hard. But the gap between having an idea for how to work and actually working that way has never been smaller.'
      },
    ],
    chatContext: {
      description: 'Essay about how AI coding tools change creative practice by letting you build custom tools on demand instead of waiting for features, and how feature branches with flags can preserve design iteration history',
      suggestedQuestions: [
        'How do you decide when to save an iteration as a version?',
        'What\'s an example of a tool you conjured that surprised you?',
        'How does this compare to design system tooling in Figma?',
      ],
      followUpQuestions: [
        'Do you think this approach scales to teams?',
        'What gets lost when you move from canvas-based to code-based iteration?',
        'How do non-technical stakeholders interact with versioned features?',
        'Is there a risk of over-engineering your own tools?',
      ]
    }
  },
  {
    id: 'gui-vs-chat',
    title: 'The GUI Has to Earn Its Place',
    description: 'I used to accept GUIs as the default. Now, if a chat interface could do it faster, the GUI feels like friction.',
    category: 'Article',
    year: '2026',
    featured: true,
    tags: ['AI', 'Design', 'UX', 'Essay'],
    content: [
      {
        type: 'heading',
        level: 2,
        content: 'Something Shifted'
      },
      {
        type: 'text',
        content: 'I used to accept graphical user interfaces as the default way to work with tools. Click here, drag there, navigate through menus, find the right panel. That was just how software worked.'
      },
      {
        type: 'text',
        content: 'That changed. Now, when I\'m using a tool that has a GUI but it would be faster to simply describe what I want and have it done for me, I feel frustrated. The interface isn\'t helping me—it\'s slowing me down.'
      },
      {
        type: 'text',
        content: 'This isn\'t about chat being universally better. It\'s about a new mental filter I can\'t turn off: does this GUI actually need to exist?'
      },
      {
        type: 'heading',
        level: 2,
        content: 'Execution vs. Exploration'
      },
      {
        type: 'text',
        content: 'The distinction I keep coming back to is between execution and exploration. When I\'m exploring—browsing, discovering, playing with possibilities—a visual interface is often the right tool. I want to see options, manipulate things spatially, get a feel for what\'s possible.'
      },
      {
        type: 'text',
        content: 'But when I\'m executing a known task, especially across multiple items, a GUI starts to feel like overhead. I already know what I want. I don\'t need to navigate to the right screen, find the right button, and click through a confirmation dialog. I just need it done.'
      },
      {
        type: 'heading',
        level: 2,
        content: 'Where I Feel It Most'
      },
      {
        type: 'text',
        content: 'Take Framer. I use it for web projects, and it\'s a capable tool. But the interface is slightly different from my mental model of how Figma works—different panel locations, different interaction patterns. The GUI is already competing with the mental model I built somewhere else. When I hit that friction, my instinct now is: why can\'t I just tell it what I want?'
      },
      {
        type: 'text',
        content: 'Or spreadsheets. If I have to log anything—expenses, project tracking, content calendars—I no longer want to do manual cell-by-cell entry. My expectation is that I can describe the data and have it structured for me. The spreadsheet GUI is fine for reviewing and adjusting, but for input? Chat wins.'
      },
      {
        type: 'heading',
        level: 2,
        content: 'The New Bar'
      },
      {
        type: 'text',
        content: 'The expectation has fundamentally changed. A GUI can\'t just exist because "that\'s how software works." It has to fight for its place. It needs to justify itself by being clearly better than describing the task in natural language.'
      },
      {
        type: 'text',
        content: 'That means the GUI now needs to do at least one of these things:'
      },
      {
        type: 'list',
        items: [
          'Enable spatial reasoning that words can\'t express—layout, composition, visual relationships',
          'Provide real-time feedback loops that make exploration faster than describing iterations',
          'Surface information density that would take paragraphs to describe in text',
          'Support muscle memory and shortcuts that become faster than typing instructions'
        ]
      },
      {
        type: 'text',
        content: 'If a GUI doesn\'t do any of these things, it\'s just a middleman between me and the outcome. And chat removes the middleman.'
      },
      {
        type: 'heading',
        level: 2,
        content: 'What This Means for Designers'
      },
      {
        type: 'text',
        content: 'This is uncomfortable if you\'re a product designer, because a lot of what we build is GUI. Forms, dashboards, settings screens, CRUD interfaces—these are the bread and butter of product design. And many of them are exactly the kind of thing that chat could replace.'
      },
      {
        type: 'text',
        content: 'But I don\'t think this makes design less important. If anything, it raises the bar. The interfaces that survive need to be genuinely better than the alternative. That means designers need to focus on the things that visual interfaces do uniquely well: spatial relationships, direct manipulation, information density, and real-time feedback.'
      },
      {
        type: 'text',
        content: 'The settings page that\'s just a list of toggles? Chat could handle that. The data visualization dashboard where you\'re spotting patterns across dimensions? That\'s where GUI earns its keep.'
      },
      {
        type: 'heading',
        level: 2,
        content: 'When It Works: Magic Path'
      },
      {
        type: 'text',
        content: 'There are products getting this right. Magic Path is a good example—it gives you a canvas for spatial thinking that then feeds into chat. You sketch out a rough structure or flow visually, and that spatial context becomes the input for what the AI builds. The GUI isn\'t decoration; it\'s doing something chat alone can\'t do. It\'s helping you think.'
      },
      {
        type: 'text',
        content: 'That\'s the template: the canvas helps you figure out what you want, and the chat executes it. Each part doing what it\'s best at.'
      },
      {
        type: 'heading',
        level: 2,
        content: 'The Product Paradox'
      },
      {
        type: 'text',
        content: 'But there\'s a tension hiding in this model. As you move into a product—even a good one—you\'re also accepting its constraints. The product makes certain things easier and other things impossible. Right now, the raw power of something like Claude Code is hard to beat precisely because it\'s unconstrained. No product wrapper, no predetermined workflows. Just describe what you want and watch it happen.'
      },
      {
        type: 'text',
        content: 'This creates an interesting question about who these products are for. There might be a meaningful difference between three categories: the products you\'re building for end users, the tools you use to build those products, and the products you use to do your day-to-day work.'
      },
      {
        type: 'text',
        content: 'End users might always want a polished GUI that hides complexity. But designers and builders? We might prefer the full creative power of an unconstrained tool over the convenience of a productized one. When a product wraps AI into a specific workflow, it trades capability for usability. That trade-off makes sense for some users, but for power users who know what they want, it can feel like a cage.'
      },
      {
        type: 'heading',
        level: 2,
        content: 'An Ongoing Trade-Off'
      },
      {
        type: 'text',
        content: 'This tension isn\'t going to resolve neatly. Products will keep building GUI layers on top of AI to make it accessible. And at the same time, the raw chat-first tools will keep getting more powerful and more appealing to people who don\'t want guardrails.'
      },
      {
        type: 'text',
        content: 'The point isn\'t that GUIs are dead. The point is that they\'re no longer the default. They\'re one option among others, and they need to earn their place by being genuinely better than the alternative—not just familiar. Whether that bar keeps rising as raw AI tools improve is the question we\'re all living through right now.'
      },
    ],
    chatContext: {
      description: 'Essay about how chat interfaces are changing expectations for GUIs, arguing that graphical interfaces now need to justify their existence over conversational alternatives',
      suggestedQuestions: [
        'What types of GUIs do you think will survive?',
        'How does this affect product design?',
        'When is a GUI still better than chat?',
      ],
      followUpQuestions: [
        'What tools have you switched to chat-first workflows for?',
        'How should designers adapt to this shift?',
        'Where does voice fit into this picture?',
        'Do you think most SaaS settings pages will become chat?',
      ]
    }
  },
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
    companyId: 'enterpriseai',
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
    id: 'add-document',
    title: 'Showing AI What to Look For',
    description: 'People setting up AI document review didn\'t know what a rule was. So I drew the document, lit up what each rule checks, and built a state machine to review every state with the team.',
    category: 'Enterprise AI',
    year: '2026',
    heroImage: '/case-studies/add-document/hero.webp',
    companyId: 'enterpriseai',
    tags: ['AI', 'Enterprise', 'Prototyping', 'State Machines', 'Claude Code'],
    content: [
      { type: 'heading', level: 2, content: 'TLDR' },
      { type: 'text', content: 'Our platform lets people set up AI features themselves. One of them, AI Document Review, checks the documents people upload against rules you write. The setup asked for a name, a description and some rules, and people didn\'t know what any of those were for. I added a live preview that draws the document and lights up the part each rule checks. Then I built a state machine so the team could see, and argue about, every state the dialog can be in. It took 27 rounds of feedback with an AI coding agent to get one dialog right.' },

      { type: 'heading', level: 2, content: 'The problem' },
      { type: 'text', content: 'To set up AI Document Review, you add the kinds of document you expect, like a driver\'s license or a doctor\'s note. For each one you give a name, a description, and a list of rules: "Holder is 18 or over", "License hasn\'t expired". The AI reads every upload and checks it against those rules.' },
      { type: 'text', content: 'The form was a stacked list of text boxes. People stopped at it. What\'s the difference between a description and a rule? How specific should a rule be? Will the AI know where to find the date of birth? They were writing instructions for something they couldn\'t see.' },

      { type: 'heading', level: 2, content: 'Show the document' },
      { type: 'text', content: 'The fix was to stop describing the document and draw it. The dialog became two columns: the form on the left and a lo-fi sample of the document on the right. Type "Driver\'s license" and a license appears. Click into "Holder is 18 or over" and the date of birth lights up in purple, the colour we keep for what AI is looking at.' },
      { type: 'text', content: 'A rule stops being an abstract instruction. It becomes a place on a page. The description gets a Generate button, and suggested rules come from what the description mentions, so you can start from something.' },
      { type: 'text', content: 'Then a harder case came up. I added the rule "Company matches our insurers" to a certificate of insurance, and the sample had nothing to light up. Rather than outline the whole page, which read as "everything", a rule the sample can\'t show gets its own dashed field, labelled from the rule. It tells you the AI will go and find it on the real document.' },

      { type: 'heading', level: 2, content: 'A state machine to think in' },
      { type: 'text', content: 'Once the preview existed, the dialog had a lot of states. Three kinds of document. A description or not. No rules, a few, many, or twenty with some a paragraph long. A rule in focus, a rule the sample can\'t show, suggestions open, errors showing. A handful of screenshots couldn\'t cover that, and in reviews we kept asking "but what happens when…".' },
      { type: 'text', content: 'So I built a state machine: the real dialog, with each of those things as its own axis. Any document pairs with any set of rules. Every combination has its own URL, so in a review anyone can link the exact state they mean. Here it is, live. Pick options on the left, or play one of the demos.' },
      {
        type: 'component',
        componentId: 'demo-canvas',
        props: {
          src: '/case-studies/add-document/index.html',
          title: 'Add document state machine',
          modes: [
            { label: 'Explore' },
            { label: 'Feature demo', query: 'demo=1' },
            { label: 'State machine tour', query: 'demo=states' },
          ],
        },
        caption: 'The state machine, running the same HTML and CSS as the prototype',
      },

      { type: 'heading', level: 2, content: 'Twenty-seven rounds' },
      { type: 'text', content: 'An AI coding agent wrote every line of this. I logged every round of feedback I gave it and what changed. Most rounds weren\'t about structure. They were about taste: spacing, weight, wording, where a button sits.' },
      { type: 'text', content: 'The agent took a screenshot to check its work most rounds. Played back in order, they show the dialog finding its shape. Scrub through, or let it play.' },
      {
        type: 'component',
        componentId: 'iteration-timelapse',
        caption: 'Every frame is a screenshot the agent took while it worked',
      },
    ],
    chatContext: {
      description: 'Gareth designed the Add document dialog for AI Document Review at Enterprise AI. Users were confused about what a document name, description and rule were for, so he added a live lo-fi preview of the document that highlights the area each rule checks, in AI purple. Rules the sample cannot show get a dashed field labelled from the rule. He built a state machine with independent axes (mode, document, description, rules, focus, show) so the team could review every combination via shareable URLs. The whole dialog was built with an AI coding agent over 27 logged rounds of feedback, mostly about taste: spacing, weight, wording and placement.',
      suggestedQuestions: [
        'Why build a state machine instead of screens?',
        'How did the document preview help?',
        'What were the 27 rounds of feedback about?',
      ],
      followUpQuestions: [
        'What happens when a rule isn\'t on the sample?',
        'How do you give feedback to an AI coding agent?',
        'What did the agent get wrong?',
      ],
    },
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
    companyId: 'enterpriseai',
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
  // --- Placeholder case studies ---
  {
    id: 'daisy-assist',
    title: 'Daisy Assist',
    description: 'AI-powered assistance tool for enterprise workflows.',
    category: 'Enterprise AI',
    year: '2025',
    companyId: 'enterpriseai',
    tags: ['AI', 'Enterprise', 'LLM'],
    content: [
      { type: 'heading', level: 2, content: 'Coming Soon' },
      { type: 'text', content: 'This case study is currently being written. Check back soon.' },
    ],
    chatContext: {
      description: 'Daisy Assist - an AI-powered assistance tool built at EnterpriseAI',
      suggestedQuestions: ['What is Daisy Assist?', 'What problem does it solve?'],
      followUpQuestions: ['How does it use LLMs?', 'Who are the users?'],
    },
  },
  {
    id: 'daisy-assess',
    title: 'Daisy Assess',
    description: 'AI-driven assessment and evaluation platform for enterprise.',
    category: 'Enterprise AI',
    year: '2025',
    companyId: 'enterpriseai',
    tags: ['AI', 'Enterprise', 'Assessment'],
    content: [
      { type: 'heading', level: 2, content: 'Coming Soon' },
      { type: 'text', content: 'This case study is currently being written. Check back soon.' },
    ],
    chatContext: {
      description: 'Daisy Assess - an AI-driven assessment platform built at EnterpriseAI',
      suggestedQuestions: ['What is Daisy Assess?', 'How does assessment work?'],
      followUpQuestions: ['What makes it different?', 'How accurate is it?'],
    },
  },
  {
    id: 'seek-case-study-1',
    title: 'The MVP Missed. So We Fixed the Funnel.',
    description: 'We shipped a courses module on SEEK\'s Career Advice pages and the numbers came back short. Three small fixes, one for each leak in the funnel, took conversion from 9% to 20%.',
    category: 'Product Design',
    year: '2024',
    heroImage: '/case-studies/seek-learning/hero.webp',
    companyId: 'seek',
    tags: ['Product Design', 'Experimentation', 'Conversion', 'B2C'],
    content: [
      { type: 'heading', level: 2, content: 'TLDR' },
      { type: 'text', content: 'At SEEK my team was asked to get more candidates connecting with education providers from Career Advice, the pages that describe a role: what it pays, how fast it\'s growing, how to become one. About three months in we shipped an MVP, a module of courses on the role page. It underperformed. Instead of redesigning it, we mapped the funnel, found three places people were dropping out, wrote down one assumption for each, and shipped a small fix for each. Conversion went from 9% to 20% against a goal of 12%. Paid connections rose 34% against a goal of 10 to 15%.' },
      { type: 'text', content: 'This piece starts at the release. The discovery that led to the MVP is a story for another day.' },

      { type: 'heading', level: 2, content: 'The release' },
      { type: 'text', content: 'The MVP was a module on the role page. On the Software Developer page it was called "Software developer courses with in-demand skills". Courses were grouped into tabs by qualification: undergraduate, VET, short courses, postgraduate. Each course was a card. Pick a card, read the course information, then enquire with the provider or follow the link to their site. That last step, a lead or a link out, is the paid connection we were measured on.' },
      {
        type: 'video',
        src: '/case-studies/seek-learning/mvp.mp4',
        alt: 'A recording of the MVP on a phone, tapping through the category tabs',
        caption: 'The MVP: one category of courses at a time',
        aspectRatio: '3/2',
      },
      { type: 'text', content: 'We released it bare on purpose. We wanted it live quickly, and a raw first version gave us a baseline to measure every improvement against.' },
      { type: 'text', content: 'I was the lead designer in a team of seven, with a lead product manager, a lead developer, a senior data scientist, a business analyst, a content designer and a software engineer.' },
      {
        type: 'image',
        src: '/case-studies/seek-learning/role-page.webp',
        alt: 'The Software Developer role page on SEEK Career Advice, with job numbers at the top and the courses module underneath',
        caption: 'The courses module on a Career Advice role page',
        aspectRatio: '16/9',
      },

      { type: 'heading', level: 2, content: 'Uh-oh' },
      { type: 'text', content: 'The numbers came back short of the target. The tempting move was to go back to the drawing board. We went to the data instead.' },
      { type: 'text', content: 'We laid the journey out as a funnel with five stages, from seeing the module to making a connection, and looked at where people were leaving. Three stages were leaking. For each one we wrote down a single assumption about why, and planned one small fix aimed at that stage.' },
      {
        type: 'component',
        componentId: 'funnel-diagram',
        props: {
          title: 'MVP release',
          stages: [
            { label: 'Impressions', highlight: false },
            { label: 'Find the right course (tabs)', highlight: true, assumption: 'Too much friction to find a course' },
            { label: 'Select a course', highlight: true, assumption: 'Missing design details' },
            { label: 'Course information', highlight: false },
            { label: 'Lead/Link', highlight: true, assumption: 'Too long to make a connection' },
          ],
        },
        caption: 'Three leaks in the funnel, and one assumption for each',
      },

      { type: 'heading', level: 2, content: 'Too much friction to find a course' },
      { type: 'text', content: 'The module opened on one category. To see what else was on offer you had to work through the tabs one at a time. We added an All tab and made it the default. Every qualification is on one page, grouped under its heading, and the tabs are still there as shortcuts.' },
      {
        type: 'image',
        src: '/case-studies/seek-learning/find-a-course.webp',
        alt: 'Two phones side by side. The first shows the MVP with category tabs only. The second shows the same module opening on a new All tab.',
        caption: 'Left: the MVP, one category at a time. Right: the All tab',
        aspectRatio: '3/2',
      },
      {
        type: 'video',
        src: '/case-studies/seek-learning/all-tab.mp4',
        alt: 'A recording of the All tab, scrolling through every qualification on one page',
        caption: 'The All tab: every qualification on one scroll',
        aspectRatio: '3/2',
      },

      { type: 'heading', level: 2, content: 'Missing design details' },
      { type: 'text', content: 'The first course cards were mostly text. The provider\'s name sat where the course name should be, and there was no logo. Nothing helped you tell one card from the next. The new card leads with the provider\'s logo and the name of the course, then the provider, how long it takes, where it runs and when it starts.' },
      {
        type: 'image',
        src: '/case-studies/seek-learning/select-a-course.webp',
        alt: 'The original course card next to the improved card, which adds the provider logo and the course name',
        caption: 'The original card and the improved one',
        aspectRatio: '3/2',
      },

      { type: 'heading', level: 2, content: 'Too long to make a connection' },
      { type: 'text', content: 'Once someone found a course they liked, the click took them off the role page to a separate course page on SEEK Learning. Only there could they ask the provider for more information.' },
      {
        type: 'video',
        src: '/case-studies/seek-learning/connection-before.mp4',
        alt: 'A recording of the MVP on desktop: from the role page, to a separate course page, to an enquiry form',
        caption: 'Before: role page, then a course page, then the enquiry form',
        aspectRatio: '1600/990',
      },
      { type: 'text', content: 'We brought the connection onto the role page. On desktop, a course card opens a fly-out with a short summary, Enquire and Visit website. On mobile the same thing slides up as a sheet. Choose Enquire and the form opens in place.' },
      {
        type: 'video',
        src: '/case-studies/seek-learning/flyout.mp4',
        alt: 'A recording of the desktop fly-out on a course card, then the enquiry form opening beside the page',
        caption: 'After, on desktop: a fly-out on the card, and the enquiry form in place',
        aspectRatio: '1600/1180',
      },
      {
        type: 'video',
        src: '/case-studies/seek-learning/connection-mobile.mp4',
        alt: 'A recording of the mobile sheet with a course summary, then the enquiry form',
        caption: 'After, on mobile: a sheet with the summary, then the form',
        aspectRatio: '3/2',
      },

      { type: 'heading', level: 2, content: 'Outcome' },
      { type: 'text', content: 'After the three fixes the module converted 33.2% better than the first release, and 75% better than the module it replaced. That was enough to roll it out to all 3,000+ role pages, about six months after we started.' },
      {
        type: 'video',
        src: '/case-studies/seek-learning/final-desktop.mp4',
        alt: 'A recording of the final courses module on desktop, from browsing courses to sending an enquiry',
        caption: 'The version that went to every role page',
        aspectRatio: '1506/978',
      },
      {
        type: 'list',
        items: [
          'Education conversion: the goal was to lift it from 9% to 12%. It reached 20%.',
          'Paid connections: the goal was a 10 to 15% increase. They rose 34%.',
          'Conversion across the role page as a whole went from 5% to 9%.',
          'Around $500,000 in additional yearly revenue.',
        ],
      },

      { type: 'heading', level: 2, content: 'Lessons' },
      {
        type: 'list',
        items: [
          'A usability test tells you whether people can use something. It doesn\'t tell you whether they will. The tabs got through usability testing and still leaked.',
          'Releasing bare was the right call, and it had a cost. We got a clean baseline and a fast release, and we also got a first version that missed.',
          'We were a new team and it took discovery to find the product gap. I\'d want to spot that sooner next time.',
        ],
      },
    ],
    chatContext: {
      description: 'A SEEK case study that starts at the MVP release. Gareth was lead designer on a team of seven asked to increase the number of candidates connecting with education providers from SEEK Career Advice role pages. The MVP, a courses module with category tabs, underperformed after release. The team mapped a five-stage funnel (impressions, find the right course, select a course, course information, lead/link), found three leaking stages and formed one assumption for each: too much friction to find a course (fixed by adding a default All tab), missing design details on course cards (fixed by adding provider logo and course name), and too long to make a connection (fixed with a desktop fly-out with Enquire and Visit website). After the fixes the module converted 33.2% better than the first release and 75% better than the original module, and was scaled to all 3,000+ role pages. Outcomes: education conversion went from 9% to 20% (goal 12%), paid connections rose 34% (goal 10 to 15%), role page conversion went from 5% to 9%, and yearly revenue increased by about $500,000. Lessons: usability tests show whether people can use something but not whether they will; the MVP was released deliberately bare to get a baseline; discovery found the product gap later than ideal.',
      suggestedQuestions: [
        'Why not redesign the MVP from scratch?',
        'What were the three fixes?',
        'What did the usability tests miss?',
      ],
      followUpQuestions: [
        'Why release an MVP that bare?',
        'How did you decide what to fix first?',
        'What happened after the fixes shipped?',
      ],
    },
  },
  {
    id: 'seek-case-study-2',
    title: 'SEEK Case Study 2',
    description: 'Case study from SEEK — details coming soon.',
    category: 'Product Design',
    year: '2024',
    companyId: 'seek',
    tags: ['Product Design', 'Discovery', 'B2C'],
    content: [
      { type: 'heading', level: 2, content: 'Coming Soon' },
      { type: 'text', content: 'This case study is currently being written. Check back soon.' },
    ],
    chatContext: {
      description: 'A case study from SEEK - details coming soon',
      suggestedQuestions: ['What was this project about?'],
      followUpQuestions: ['What was the impact?'],
    },
  },
  {
    id: 'bestpractice-case-study-1',
    title: 'Booking an Appointment in Two Panels',
    description: 'Booking an appointment was slow and frustrating for receptionists. A two-panel dialog made it readable at a glance, and gave Best Practice a pattern for workflows that hadn\'t been designed yet.',
    category: 'Healthcare SaaS',
    year: '2021',
    heroImage: '/case-studies/bestpractice-booking/hero.webp',
    heroVideo: '/case-studies/bestpractice-booking/final.mp4',
    companyId: 'bestpractice',
    tags: ['SaaS', 'Healthcare', 'Interaction Design', 'Design Patterns'],
    content: [
      { type: 'heading', level: 2, content: 'TLDR' },
      { type: 'text', content: 'Booking an appointment is the thing a medical receptionist does all day. In the new Best Practice product it was slow, and the dialog kept getting longer as features were added. I redesigned it as two panels. The left panel is the appointment, readable at a glance. Anything that needs room to work, like finding a time across several doctors, opens in a panel on the right. The same pattern then handled repeat appointments and injury claims without a redesign.' },

      { type: 'heading', level: 2, content: 'Best Practice' },
      { type: 'text', content: 'Best Practice is Australia\'s largest practice management system, with more market share than all of its competitors combined. It runs the workflows of a whole practice: booking appointments, patient consults, prescribing and billing. Practices range from a solo practitioner to a regional hospital with 500 staff.' },
      { type: 'text', content: 'I worked on the new product, the SaaS successor to the legacy one. It was pre-launch. The people using it are receptionists, practitioners, allied health, practice managers and, at the other end of the phone, patients. I was the lead designer, working with a lead product manager, a lead developer, a subject matter expert and an onsite doctor.' },

      { type: 'heading', level: 2, content: 'The problem' },
      { type: 'text', content: 'A key part of the patient journey was a frustrating and slow experience, for receptionists and for patients. In the first version of the dialog you had to pick a provider before you could see any times. Receptionists often start from the other end: when is anyone free?' },
      {
        type: 'image',
        src: '/case-studies/bestpractice-booking/original-flow.webp',
        alt: 'The original New Appointment dialog in two steps. Times only appear after a provider is picked.',
        caption: 'The original dialog: no times until you pick a provider',
        aspectRatio: '16/9',
      },
      { type: 'text', content: 'Then the rest of the job arrived. Repeat appointments. The waiting list. Urgent appointments. Conflicts across a run of dates. Each one was added inline, and the dialog grew downwards every time.' },
      {
        type: 'image',
        src: '/case-studies/bestpractice-booking/ui-problems.webp',
        alt: 'Three versions of the dialog, each longer than the last: setting a repeat appointment, adding a patient to the waiting list, and an edit with conflicts on multiple dates',
        caption: 'Repeats, the waiting list and a conflict edge case, all inline',
        aspectRatio: '3/2',
      },

      { type: 'heading', level: 2, content: 'Goals and constraints' },
      { type: 'text', content: 'We set three goals for the design:' },
      {
        type: 'list',
        items: [
          'Booking an appointment is fast and matches how receptionists work in the real world',
          'The dialog is easy to read at a glance',
          'The design pattern is robust enough to handle future features',
        ],
      },
      { type: 'text', content: 'And three things to measure: the time it takes to book an appointment, how often people book through the dialog instead of the calendar, and receptionist satisfaction.' },
      { type: 'text', content: 'The constraints were real. Time was limited. Re-work had to stay low. And because the product was pre-launch, we couldn\'t talk directly with customers.' },

      { type: 'heading', level: 2, content: 'Early iterations' },
      { type: 'text', content: 'I started with the pattern we already had and kept everything inline. Times for several providers went into one grid. Then each provider got a tab.' },
      {
        type: 'image',
        src: '/case-studies/bestpractice-booking/early-iterations.webp',
        alt: 'Two early iterations that keep provider times inline, one as a mixed grid and one with a tab per provider',
        caption: 'Two inline attempts: a mixed grid of times, then a tab per provider',
        aspectRatio: '3/2',
      },
      { type: 'text', content: 'None of it held up. There wasn\'t enough screen space to do the workflows. You couldn\'t read the appointment at a glance. And the pattern wasn\'t robust: every new feature would mean another fight for space.' },

      { type: 'heading', level: 2, content: 'The two-panel idea' },
      { type: 'text', content: 'The idea came out of a design workshop: split the dialog in two. The left panel is the appointment. Who it\'s for, what kind it is, how long, with whom and when. Anything that needs room to work opens in a panel on the right. When you\'re done, the right panel gets out of the way and the left shows a short summary of what you chose.' },
      {
        type: 'video',
        src: '/case-studies/bestpractice-booking/two-panel-idea.mp4',
        alt: 'A recording of the first two-panel prototype: the right panel opens to pick a provider and time, then closes',
        caption: 'The first two-panel prototype',
        aspectRatio: '1600/984',
      },

      { type: 'heading', level: 2, content: 'Cleaning up the left panel' },
      { type: 'text', content: 'For this to work the left panel had to be short and scannable. Two changes did most of it.' },
      { type: 'text', content: 'Toggles. Urgent, Repeat and Add to waiting list were three separate toggles, which could be switched on in combinations that didn\'t make sense. One segmented control made it a single choice on a single line.' },
      {
        type: 'image',
        src: '/case-studies/bestpractice-booking/toggles.webp',
        alt: 'Old: three separate toggles for Repeat, Urgent and Add to waiting list. New: one segmented control.',
        caption: 'Three toggles become one segmented control',
        aspectRatio: '16/9',
      },
      { type: 'text', content: 'Bundling. Provider, date and time were three fields in two sections. They answer one question, so they became one row: who, which day, what time. The row is also the door to the right panel.' },
      {
        type: 'image',
        src: '/case-studies/bestpractice-booking/bundling.webp',
        alt: 'Old: separate provider, date and time fields. New: a single appointment details row showing the doctor, date and time.',
        caption: 'Provider, date and time bundled into one row',
        aspectRatio: '16/9',
      },
      {
        type: 'image',
        src: '/case-studies/bestpractice-booking/comparison.webp',
        alt: 'The old inline dialog next to the cleaned-up left panel',
        caption: 'The old dialog next to the new left panel',
        aspectRatio: '3/2',
      },

      { type: 'heading', level: 2, content: 'Proof of concept: repeats' },
      { type: 'text', content: 'Repeat appointments took up the most room in the old dialog, so I used them to prove the pattern. Choose Repeat and the setup happens in the right panel. Back on the left, the whole thing collapses into one line: repeats every 2 weeks, 3 of 5 occurrences, with the next and final dates underneath.' },
      {
        type: 'video',
        src: '/case-studies/bestpractice-booking/repeat.mp4',
        alt: 'A recording of setting up a repeat appointment in the right panel, which collapses to one row on the left',
        caption: 'Setting up a repeat in the right panel',
        aspectRatio: '1600/1148',
      },
      {
        type: 'image',
        src: '/case-studies/bestpractice-booking/repeat.webp',
        alt: 'A repeat appointment in the old inline dialog and in the two-panel design, where it is summarised in one row',
        caption: 'The same repeat appointment, before and after',
        aspectRatio: '3/2',
      },

      { type: 'heading', level: 2, content: 'Could future workflows use this pattern?' },
      { type: 'text', content: 'The third goal was about what came next. If the pattern only solved today\'s dialog, we\'d be back here in six months. So I tried it on workflows that were still coming. Each one became a row on the left with an empty state and a filled state, and a panel on the right to do the work.' },
      {
        type: 'image',
        src: '/case-studies/bestpractice-booking/future-workflows.webp',
        alt: 'Three rows in their empty and filled states: appointment details, injury, and repeat appointment',
        caption: 'Every workflow is a row: empty on the left, filled on the right',
        aspectRatio: '16/9',
      },
      {
        type: 'image',
        src: '/case-studies/bestpractice-booking/injury-claim.webp',
        alt: 'The two-panel dialog with an injury claim open in the right panel',
        caption: 'An injury claim in the same pattern',
        aspectRatio: '16/9',
      },
      { type: 'text', content: 'By this point we had explored the two panels, made the left one readable at a glance, built a proof of concept that passed a feasibility check, and had confidence it would take future workflows. Time to test it.' },

      { type: 'heading', level: 2, content: 'Testing it' },
      { type: 'text', content: 'We ran a Figma prototype past five people, each working through the same booking scenarios.' },
      {
        type: 'video',
        src: '/case-studies/bestpractice-booking/tested-prototype.mp4',
        alt: 'A recording of the prototype used in testing: choosing providers, comparing their times and picking one',
        caption: 'The prototype we tested',
        aspectRatio: '1600/1148',
      },
      {
        type: 'list',
        items: [
          'The general interaction was understood',
          'People could complete the existing workflows',
          'People could tell the state of the appointment at a glance',
        ],
      },
      { type: 'text', content: 'The tests also taught us how receptionists really book times for providers. Two things came up that the design didn\'t handle yet.' },

      { type: 'heading', level: 3, content: 'Juggling provider availability' },
      { type: 'text', content: 'Receptionists compare several providers at once, and not always on the same day. The first version had one date for the whole panel. I changed it so each selected provider has its own date picker.' },
      {
        type: 'image',
        src: '/case-studies/bestpractice-booking/provider-dates.webp',
        alt: 'Old: one global date for all providers. New: a date picker within each provider.',
        caption: 'From one global date to a date picker per provider',
        aspectRatio: '16/9',
      },
      {
        type: 'video',
        src: '/case-studies/bestpractice-booking/provider-dates.mp4',
        alt: 'A recording of changing the date for one provider without changing it for the other',
        caption: 'Changing the date for one provider at a time',
        aspectRatio: '1600/986',
      },

      { type: 'heading', level: 3, content: 'Providers are often unavailable' },
      { type: 'text', content: 'The old panel answered "no available times for this date" and left it there. A dead end, with a patient waiting on the phone. The new one shows that provider\'s next available appointment, with a link to jump straight to that date. Each provider also shows a few times by default with more behind a link, so a long list of providers stays scannable.' },
      {
        type: 'image',
        src: '/case-studies/bestpractice-booking/unavailable.webp',
        alt: 'Old: a provider with no times shows a no available times message. New: it shows the next available appointment and a change date link.',
        caption: 'An unavailable provider now tells you when they\'re next free',
        aspectRatio: '3/2',
      },
      {
        type: 'video',
        src: '/case-studies/bestpractice-booking/unavailable.mp4',
        alt: 'A recording of jumping to the next available appointment for a provider',
        caption: 'Jumping to the next available appointment',
        aspectRatio: '1600/986',
      },

      { type: 'heading', level: 2, content: 'Where it landed' },
      { type: 'text', content: 'The final dialog opens short. Patient, appointment type, one row for who and when, one control for urgent, repeat or waiting list, and a comment. Everything else is one click away in the right panel and comes back as a single line.' },
      {
        type: 'video',
        src: '/case-studies/bestpractice-booking/final.mp4',
        alt: 'A recording of the final design: open the right panel, choose providers, pick a time, and the left panel shows the summary',
        caption: 'The final design, start to finish',
        aspectRatio: '1600/986',
      },
      { type: 'text', content: 'Booking now follows how receptionists work: see who is free, then choose. The appointment reads at a glance. And the pattern took repeats and injury claims without the dialog getting any longer, which is what a robust pattern is for.' },
    ],
    chatContext: {
      description: 'A Best Practice Software case study about redesigning the New appointment dialog for the pre-launch SaaS successor to Australia\'s largest practice management system. Gareth was lead designer, working with a lead product manager, lead developer, a subject matter expert and an onsite doctor. The original dialog made receptionists pick a provider before seeing times, and it kept growing as repeat appointments, the waiting list, urgent appointments and conflict handling were added inline. Goals: booking is fast and matches how receptionists really work, the dialog is readable at a glance, and the pattern is robust enough for future features. Planned measures were time to book, rate of booking through the dialog versus the calendar, and receptionist satisfaction. Constraints: limited time, reduce re-work, pre-launch, and no direct access to customers. Early inline iterations ran out of space. A design workshop produced the two-panel idea: the left panel is a summary of the appointment and anything complex opens in a right panel. Gareth cleaned up the left panel by replacing three toggles with one segmented control and bundling provider, date and time into one row. He proved the pattern with repeat appointments and then with injury claims. Prototype tests with five people showed the interaction was understood, existing workflows could be completed, and the appointment state was readable at a glance. The tests also surfaced that receptionists juggle availability across providers and that providers are often unavailable, which led to a date picker per provider and showing the next available appointment instead of a dead end.',
      suggestedQuestions: [
        'Why two panels instead of one dialog?',
        'What did the prototype tests change?',
        'How did you design for features that didn\'t exist yet?',
      ],
      followUpQuestions: [
        'What was wrong with the toggles?',
        'How did you work without access to customers?',
        'What were the early iterations?',
      ],
    },
  },
]

// Products I've built — shipped things with a live URL, kept separate from writing and case studies
export const products: Project[] = projects.filter(p => p.kind === 'product')

// Everything that isn't a product: articles, essays, and client case studies
export const writing: Project[] = projects.filter(p => p.kind !== 'product')

export function getProjectById(id: string): Project | undefined {
  return projects.find(p => p.id === id)
}

export function getAllProjectIds(): string[] {
  return projects.map(p => p.id)
}

export function getProjectsByCompanyId(companyId: string): Project[] {
  return projects.filter(p => p.companyId === companyId)
}
