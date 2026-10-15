// Gareth's recorded answers to the questions in src/prompts/interview-questions.md.
// Transcribed from voice and lightly cleaned (filler words out, mis-hearings fixed), but
// the wording and opinions are his. The chat reads these as his own words.
//
// `start` and `end` are seconds into the recording they came from, so each answer can be
// cut back out as audio. Recording 1 (15 Oct 2026) stops partway through 2.8.

export interface InterviewAnswer {
  id: string // Question number from interview-questions.md
  question: string
  answer: string
  topics: string // Other words a visitor might use for this, to help search find it
  recording: number
  start: number
  end: number
}

export const interview: InterviewAnswer[] = [
  {
    id: '1.1',
    question: 'In thirty seconds: who are you and what do you do?',
    answer:
      "My name is Gareth Chainey. I'm a product designer, from Australia but living in New York. I fell in love with design through the Jobs to be Done framework, and over time developed a sense for UI. Now I'm riding the wave of being at the frontier of AI, where I can design like a sculptor: constantly refining, iterating fast, and using technology.",
    topics: 'intro, about you, who are you, background, bio, yourself, overview, what do you do',
    recording: 1,
    start: 5,
    end: 41,
  },
  {
    id: '1.3',
    question: 'You did a Bachelor of IT and a testing certificate before design. How did you get from there to product design?',
    answer:
      "My first job was at a startup doing support, which gave me a really good sense of working with customers, identifying problems, and then working with the product team on how to solve them. The path from there was support, then testing. I was enjoying my time with the team, but not my role. So I changed track to become a designer, because I thought design had the quickest iteration speed of any of the disciplines, compared with product or engineering.",
    topics: 'career path, get into design, got into design, how did you start, first job, startup, support, testing, QA, IT degree, became a designer, switch careers, history',
    recording: 1,
    start: 46,
    end: 88,
  },
  {
    id: '1.4',
    question: 'Brisbane, then Melbourne, then Sydney, now New York. What took you to New York?',
    answer:
      "The energy of the city and the opportunity in it. There are people we look up to at our company who have a vision of where work is going. From Australia you look at them, and when you come to New York, those people are living in the future. The opportunity and the energy is what attracted me to New York.",
    topics: 'New York, NYC, moved, move, relocate, Australia, Sydney, Melbourne, Brisbane, where are you based, live',
    recording: 1,
    start: 88,
    end: 116,
  },
  {
    id: '1.5',
    question: "What's the thing colleagues come to you for?",
    answer:
      "Innovative design. Knowing how to break a problem down into logical steps. And focusing on the customer experience and working backwards from it: using technology where a previous workflow didn't, and creating an experience that's seamless and puts the customer first.",
    topics: 'strengths, good at, known for, colleagues, teammates, skills, superpower, what you bring',
    recording: 1,
    start: 116,
    end: 147,
  },
  {
    id: '1.6',
    question: 'What would a teammate say is the most annoying thing about working with you?',
    answer:
      "I'd like to think it's that the bar is high. Often there are things that were done that made sense at the time, but when we look at them from the customer's perspective, that solution isn't going to be okay. But I also think part of my strength is getting the team motivated to solve a problem, rather than just doing a requirement.",
    topics: 'weakness, annoying, flaws, hard to work with, criticism, high standards, the bar',
    recording: 1,
    start: 149,
    end: 180,
  },
  {
    id: '1.7',
    question: 'What kind of problem do you most want to be working on in the next couple of years?',
    answer:
      "Problems that can be solved with technology, or by using technology in new ways. We're at an exciting moment, and being able to work with LLMs and use them for internal tools or solving problems is just exciting. I want to be part of that.",
    topics: 'future, next, goals, ambition, looking for, next role, interested in, excited about, internal tools',
    recording: 1,
    start: 181,
    end: 208,
  },
  {
    id: '2.1',
    question: 'When did it click that you could build things, not just design them?',
    answer:
      "When I first started at Enterprise AI I was still doing Figma prototypes. Because the product used a large language model, I'd run the prompt through ChatGPT to see the outcome, then use that output to inform the screens in the prototype. That got too slow. I'd heard v0 had come out, so I tried it: an LLM workflow where you put in an input and the output is a user interface. I was really impressed, but everything would break at a certain level of complexity. That lasted until around Opus 4.6, and from there things don't really break.",
    topics: 'code, coding, build, building, v0, ChatGPT, prototyping, learn to code, when did you start, Opus, models, Enterprise AI',
    recording: 1,
    start: 210,
    end: 268,
  },
  {
    id: '2.2',
    question: 'What was the hardest part of the shift? What did you have to unlearn?',
    answer:
      "Maybe Figma as the source of truth. But honestly, for me it was just incredible. I love that I'm now sculpting and refining instead of starting on a blank canvas: I can say create five variations, then iterate from there. I feel quite fortunate that I can now build products and more complex interactions, and use the technology, without a handoff. I can be responsible for that myself.",
    topics: 'hardest part, difficult, unlearn, transition, change, shift, challenge, handoff, source of truth',
    recording: 1,
    start: 268,
    end: 313,
  },
  {
    id: '2.3',
    question: 'Do you still use Figma?',
    answer:
      "I don't really use Figma, but I do use Paper, a design canvas that AI agents can read and draw on. For the canvas, direct manipulation, control and exploration, it still has its place and it's really good. Especially with a fast model like Composer 2.5, I prefer iterating quickly on a canvas over one-shotting something. But as the models get better, and because interaction design is such an important part of the work, I prefer to just design in HTML rather than in a canvas.",
    topics: 'Figma, Paper, canvas, design tools, HTML, Composer, still use, tools',
    recording: 1,
    start: 313,
    end: 358,
  },
  {
    id: '2.4',
    question: "Is this where every designer is heading? What would you say to a designer who's nervous about it?",
    answer:
      "You can still design good products without using AI, but you need to understand the technology, because every product is going to be using it. For my workflow it's far better: I can think big and adventurous, say let's go crazy, and work with the technology that way. But so much AI work now is just spinning up a hundred features, and there's so much bloat. I think the designer's job now is distillation: getting that down to a distilled process or a distilled outcome. You don't need AI to do that, but you could make a creative tool that helps you do it.",
    topics: 'designers, future of design, nervous, replace designers, jobs, bloat, distillation, advice for designers',
    recording: 1,
    start: 360,
    end: 410,
  },
  {
    id: '2.5',
    question: 'If a designer wanted to start working this way tomorrow, what should they do first?',
    answer:
      "Load up v0, or use a Claude artifact, pick a thing they've always wanted to make, and see what they can do. Then ask for five or ten variations that are more incredible and crazy than they thought. Then try to get a grip on the bounds: where it's good and where it's not.",
    topics: 'advice, getting started, beginner, how to start, learn, v0, Claude artifacts, recommend, first step, variations',
    recording: 1,
    start: 411,
    end: 440,
  },
  {
    id: '2.6',
    question: "What does AI not do for you? What's still the designer's job?",
    answer:
      "The decision making. AI will help and assist with so much, however you want to use it, but it's still on the conviction of the individual to make a call. Even if you have AI automate it, you're the one prompting it to make that judgement call. And the designer's job is to advocate for the user experience, to call out when something's not intuitive, and to advocate for craft and beauty.",
    topics: 'designer\'s job, role of designers, judgement, decisions, what AI can\'t do, limits, craft, advocate for users, beauty',
    recording: 1,
    start: 440,
    end: 480,
  },
  {
    id: '2.7',
    question: 'You talk about taste a lot. What does taste mean to you?',
    answer:
      "I think taste gets used in weird ways. Traditionally it's your individual, subjective flavour of something, but now it's come to mean a homogenised, accepted good. In a professional design sense, taste is being able to recognise whether something is beautiful and has utility, and whether there's bloat in the way. A simple test: can you tell if something is a mirage of working, versus something that can actually be used?",
    topics: 'taste, beauty, quality, craft, aesthetic, good design, utility, bloat',
    recording: 1,
    start: 480,
    end: 534,
  },
  {
    id: '2.8',
    question: 'When has AI let you down?',
    answer:
      "I learned a lesson about collaboration. My strength is prototyping and exploring ideas, and often that work is quite technical to implement. It's easy to think: the agent thinks I'm really good, so I'll build this technically challenging thing myself. When in reality I work with really smart technical people, and it'd be better to just collaborate with them. AI can lead people away from collaboration. If I work with a model one way, I get an outcome biased towards my strengths. A copywriter would get better copy than me, but probably worse design.",
    topics: 'failure, mistakes, AI let you down, went wrong, collaboration, engineers, lesson, limits, risks, downsides',
    recording: 1,
    start: 534,
    end: 580,
  },
]
