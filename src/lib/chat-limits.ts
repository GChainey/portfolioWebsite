import { Redis } from '@upstash/redis'

// Claude Haiku 4.5 pricing in micro-dollars per token ($1 / $5 per million tokens)
const INPUT_MICROS_PER_TOKEN = 1
const OUTPUT_MICROS_PER_TOKEN = 5

const MONTHLY_CAP_USD = Number(process.env.CHAT_MONTHLY_CAP_USD) || 10
const MONTHLY_CAP_MICROS = MONTHLY_CAP_USD * 1_000_000

const RATE_LIMIT_MAX = 20
const RATE_LIMIT_WINDOW_SECONDS = 60 * 60

export const MAX_HISTORY_MESSAGES = 12
export const MAX_MESSAGE_CHARS = 2000
export const MAX_CONTEXT_CHARS = 12000

let redis: Redis | null | undefined

// Supports both Upstash's own env names and the Vercel Marketplace (KV_*) ones
function getRedis(): Redis | null {
  if (redis === undefined) {
    const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL
    const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN
    redis = url && token ? new Redis({ url, token }) : null
  }
  return redis
}

function spendKey() {
  return `chat:spend:${new Date().toISOString().slice(0, 7)}`
}

export type LimitResult =
  | { ok: true }
  | { ok: false; status: 429 | 503; error: string }

// Fails closed: with no Redis configured we can't enforce the cap, so refuse.
export async function checkLimits(ip: string): Promise<LimitResult> {
  const db = getRedis()
  if (!db) {
    console.error('Chat disabled: Upstash Redis env vars are not set, so the monthly cap cannot be enforced')
    return { ok: false, status: 503, error: 'Chat is offline for now.' }
  }

  const spent = Number((await db.get<number>(spendKey())) ?? 0)
  if (spent >= MONTHLY_CAP_MICROS) {
    return { ok: false, status: 503, error: "Chat has hit its monthly budget and is resting until next month. Feel free to email me instead!" }
  }

  const rateKey = `chat:rate:${ip}`
  const count = await db.incr(rateKey)
  if (count === 1) await db.expire(rateKey, RATE_LIMIT_WINDOW_SECONDS)
  if (count > RATE_LIMIT_MAX) {
    return { ok: false, status: 429, error: "You're sending messages quite fast. Please try again in a bit." }
  }

  return { ok: true }
}

export async function recordUsage(inputTokens: number, outputTokens: number) {
  const db = getRedis()
  if (!db) return
  const key = spendKey()
  const micros = inputTokens * INPUT_MICROS_PER_TOKEN + outputTokens * OUTPUT_MICROS_PER_TOKEN
  const total = await db.incrby(key, micros)
  await db.expire(key, 60 * 60 * 24 * 40)

  const before = total - micros
  const warnAt = MONTHLY_CAP_MICROS * 0.8
  if (before < warnAt && total >= warnAt) {
    console.warn(`Chat spend passed 80% of the $${MONTHLY_CAP_USD} monthly cap`)
  }
}
