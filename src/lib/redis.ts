import { Redis } from '@upstash/redis'

let redis: Redis | null | undefined

// Supports both Upstash's own env names and the Vercel Marketplace (KV_*) ones. Null when unset.
export function getRedis(): Redis | null {
  if (redis === undefined) {
    const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL
    const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN
    redis = url && token ? new Redis({ url, token }) : null
  }
  return redis
}
