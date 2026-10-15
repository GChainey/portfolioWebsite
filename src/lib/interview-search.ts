import { interview, type InterviewAnswer } from '@/content/interview'

// Finds the interview answers that relate to what a visitor just asked, so the chat gets a
// few relevant notes instead of the whole interview. BM25 keyword search: the corpus is a
// hundred-odd short answers, so it needs no embeddings, no extra API call and no index file.

const STOPWORDS = new Set(
  `a about after all also am an and any are as at be been but by can could did do does doing for from
  get got had has have how i i'd i'm if in is it it's its just like me more most my no not now of
  on or our out so some still than that the their them then there these they this to too up us very
  was we were what when where which who why will with would you your you're gareth gareth's`.split(/\s+/)
)

function stem(word: string): string {
  if (word.length > 5 && word.endsWith('ing')) return word.slice(0, -3)
  if (word.length > 4 && word.endsWith('ies')) return word.slice(0, -3) + 'y'
  if (word.length > 4 && word.endsWith('ed')) return word.slice(0, -2)
  if (word.length > 3 && word.endsWith('s') && !word.endsWith('ss')) return word.slice(0, -1)
  return word
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[’']/g, "'")
    .split(/[^a-z0-9.']+/)
    .map((w) => w.replace(/^[.']+|[.']+$/g, ''))
    .filter((w) => w && !STOPWORDS.has(w))
    .map(stem)
}

// The question and topics say what an answer is about better than the answer's own words,
// so they count for more
function documentTokens(a: InterviewAnswer): string[] {
  const q = tokenize(a.question)
  const t = tokenize(a.topics)
  return [...q, ...q, ...t, ...t, ...tokenize(a.answer)]
}

const K1 = 1.2
const B = 0.75

const docs = interview.map((a) => {
  const tokens = documentTokens(a)
  const tf = new Map<string, number>()
  for (const t of tokens) tf.set(t, (tf.get(t) ?? 0) + 1)
  return { answer: a, tf, length: tokens.length }
})
const avgLength = docs.reduce((sum, d) => sum + d.length, 0) / docs.length
const docFreq = new Map<string, number>()
for (const d of docs) for (const t of Array.from(d.tf.keys())) docFreq.set(t, (docFreq.get(t) ?? 0) + 1)

function idf(term: string): number {
  const n = docFreq.get(term) ?? 0
  return Math.log(1 + (docs.length - n + 0.5) / (n + 0.5))
}

export interface InterviewMatch {
  answer: InterviewAnswer
  score: number
}

const MIN_SCORE = 2.5 // Below this a match is a stray shared word, not the same subject
const RELATIVE_CUTOFF = 0.5 // Drop matches less than half as strong as the best one

export function searchInterview(query: string, limit = 3): InterviewMatch[] {
  const terms = Array.from(new Set(tokenize(query)))
  if (terms.length === 0) return []

  const scored = docs.map((d) => {
    let score = 0
    for (const term of terms) {
      const f = d.tf.get(term)
      if (!f) continue
      score += idf(term) * ((f * (K1 + 1)) / (f + K1 * (1 - B + (B * d.length) / avgLength)))
    }
    return { answer: d.answer, score }
  })

  scored.sort((a, b) => b.score - a.score)
  const best = scored[0]?.score ?? 0
  return scored.filter((m) => m.score >= MIN_SCORE && m.score >= best * RELATIVE_CUTOFF).slice(0, limit)
}
