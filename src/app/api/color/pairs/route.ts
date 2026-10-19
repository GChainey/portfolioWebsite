import { NextRequest, NextResponse } from 'next/server'
import { COLOR_LIVE } from '@/content/color'
import { isHex } from '@/lib/color'
import { getRedis } from '@/lib/redis'

// Chapter V's collection: pairs of colours visitors couldn't rank lighter or darker, kept
// anonymously so the next visitor can try them.
const KEY = 'color:pairs'
const KEEP = 300
const SHOW = 60

export async function GET() {
  if (!COLOR_LIVE) return new NextResponse(null, { status: 404 })
  const db = getRedis()
  if (!db) return NextResponse.json({ shared: false, pairs: [] })

  const pairs = await db.lrange<{ a: string; b: string }>(KEY, 0, SHOW - 1)
  return NextResponse.json({ shared: true, pairs })
}

export async function POST(request: NextRequest) {
  if (!COLOR_LIVE) return new NextResponse(null, { status: 404 })
  const db = getRedis()
  if (!db) return NextResponse.json({ shared: false })

  const { a, b } = await request.json().catch(() => ({}))
  if (![a, b].every(isHex)) return NextResponse.json({ error: 'Two hex colours expected' }, { status: 400 })

  // One pair per visitor every 20 seconds
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown'
  const fresh = await db.set(`color:pairs:ip:${ip}`, 1, { nx: true, ex: 20 })
  if (!fresh) return NextResponse.json({ shared: true, saved: false })

  await db.pipeline().lpush(KEY, JSON.stringify({ a: a.toLowerCase(), b: b.toLowerCase() })).ltrim(KEY, 0, KEEP - 1).exec()
  return NextResponse.json({ shared: true, saved: true })
}
