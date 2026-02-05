export interface Thinker {
  id: string
  name: string
  role: string
  initials?: string
  influence: string
  tags: string[]
  link?: string
}

export const thinkers: Thinker[] = [
  {
    id: 'teresa-torres',
    name: 'Teresa Torres',
    role: 'Author, Continuous Discovery Habits',
    influence:
      'Teresa changed how I think about discovery. Her Opportunity Solution Tree framework gave me a practical way to connect business outcomes to customer needs, and her emphasis on continuous interviewing pushed me to stay close to users rather than relying on assumptions. Her work made discovery feel less like a phase and more like a habit.',
    tags: ['Product Discovery', 'Opportunity Solution Trees', 'Continuous Discovery'],
    link: 'https://www.producttalk.org/',
  },
  {
    id: 'spiek-moesta',
    name: 'Chris Spiek & Bob Moesta',
    role: 'Jobs-to-be-Done Practitioners',
    initials: 'CS',
    influence:
      'The Switch framework and forces of progress model completely reframed how I understand why people change products. Instead of asking what features users want, I learned to look at the push, pull, anxiety, and habit forces behind every decision. Their interview techniques are some of the most useful tools in my kit.',
    tags: ['Jobs-to-be-Done', 'Switch Framework', 'Forces of Progress'],
    link: 'https://www.rewired.com/',
  },
  {
    id: 'ryan-singer',
    name: 'Ryan Singer',
    role: 'Author, Shape Up',
    influence:
      'Shape Up gave me a vocabulary for the tension between too much upfront design and too little structure. The concepts of appetite, breadboarding, and fat marker sketches changed how I scope work and communicate with engineers. Ryan showed me that good process is about setting boundaries, not writing specs.',
    tags: ['Shape Up', 'Shaping', 'Product Strategy'],
    link: 'https://basecamp.com/shapeup',
  },
  {
    id: 'christopher-alexander',
    name: 'Christopher Alexander',
    role: 'Architect & Design Theorist',
    influence:
      'Alexander\'s idea that good design comes from patterns — solutions that emerge from real human needs — resonated deeply with how I approach product work. A Pattern Language showed me that the best designs feel inevitable because they\'re rooted in how people actually live and work. His thinking bridges architecture, software, and product in a way that keeps me grounded.',
    tags: ['A Pattern Language', 'Design Patterns', 'Timeless Design'],
  },
]

export function getThinkerById(id: string): Thinker | undefined {
  return thinkers.find((t) => t.id === id)
}
