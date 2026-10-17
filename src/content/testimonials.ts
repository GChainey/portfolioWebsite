import type { CompanyLogoId } from '@/components/CompanyLogo'

// Kind words from colleagues, word for word from LinkedIn, in the order the live homepage shows them. `pull` is the line that carries the
// quote, and `highlights` the phrases worth pointing at: both are exact substrings of `content`,
// so a variant can mark them up without rewording anyone.

export interface Testimonial {
  name: string
  role: string
  company: string
  logo?: CompanyLogoId
  linkedIn?: string
  content: string
  pull: string
  highlights: string[]
}

export const TESTIMONIALS: Testimonial[] = [
  {
    name: 'Winnie Bamra',
    role: 'Senior Product Manager',
    company: 'Ex-SpaceX · SEEK',
    logo: 'spacex',
    linkedIn: 'https://www.linkedin.com/in/wbamra/',
    content: 'Gareth is a pleasure to work with and an asset to any team. He is diligent in discovery, passionate about the end user, empathetic, and collaborative in his approach. He is excellent at leading user interviews, enabling the team to collect and extract actionable insights.',
    pull: 'a pleasure to work with and an asset to any team',
    highlights: ['an asset to any team', 'excellent at leading user interviews', 'diligent in discovery'],
  },
  {
    name: 'Richard Simms',
    role: 'Principal Product Designer',
    company: 'SEEK',
    logo: 'seek',
    linkedIn: 'https://www.linkedin.com/in/richardsimms/',
    content: 'A talented senior UX designer who can independently drive projects forward. His designs reflected a deep understanding of our users, combined with a mastery of UX principles. Meticulous attention to detail and craft are evident in everything he produces.',
    pull: 'Meticulous attention to detail and craft are evident in everything he produces.',
    highlights: ['Meticulous attention to detail and craft', 'mastery of UX principles', 'independently drive projects forward'],
  },
  {
    name: 'Ahmed Hakeem',
    role: 'Staff Engineer',
    company: 'SEEK',
    logo: 'seek',
    linkedIn: 'https://www.linkedin.com/in/meds/',
    content: "A developer's best friend. I have many fond memories bouncing ideas around and jamming out features end to end from fake door tests to deployment. At every step Gareth was inquisitive, collaborative and open to thinking on their feet.",
    pull: "A developer's best friend.",
    highlights: ["A developer's best friend", 'end to end from fake door tests to deployment'],
  },
  {
    name: 'David Deville',
    role: 'Senior Content Designer',
    company: 'SEEK',
    logo: 'seek',
    linkedIn: 'https://www.linkedin.com/in/david-deville-98b287b8/',
    content: "Gareth goes above and beyond designing for customer needs. Fast experimentation, elegant designs and constant iteration resulted in products like an AI-powered resume generator that genuinely helped candidates. A positive, creative and likeable teammate.",
    pull: 'Fast experimentation, elegant designs and constant iteration',
    highlights: ['Fast experimentation, elegant designs and constant iteration', 'AI-powered resume generator that genuinely helped candidates'],
  },
  {
    name: 'Henry Vesander',
    role: 'Chief Product Officer',
    company: 'Best Practice Software',
    logo: 'bestpractice',
    linkedIn: 'https://www.linkedin.com/in/henrikvesander/',
    content: 'An outstanding UX/product designer. I hired him to build a cloud-based practice management SaaS. He is a driven individual that can be trusted in getting the job done once given guidance and a brief. I definitely recommend Gareth!',
    pull: 'An outstanding UX/product designer.',
    highlights: ['An outstanding UX/product designer', 'trusted in getting the job done'],
  },
]

// The quote split into plain and highlighted runs, for marking up the phrases in place
export function splitHighlights(t: Pick<Testimonial, 'content' | 'highlights'>): { text: string; hit: boolean }[] {
  const ranges = t.highlights
    .map((h) => { const i = t.content.toLowerCase().indexOf(h.toLowerCase()); return i < 0 ? null : [i, i + h.length] as const })
    .filter((r): r is readonly [number, number] => r !== null)
    .sort((a, b) => a[0] - b[0])
  const out: { text: string; hit: boolean }[] = []
  let at = 0
  for (const [from, to] of ranges) {
    if (from < at) continue
    if (from > at) out.push({ text: t.content.slice(at, from), hit: false })
    out.push({ text: t.content.slice(from, to), hit: true })
    at = to
  }
  if (at < t.content.length) out.push({ text: t.content.slice(at), hit: false })
  return out
}
