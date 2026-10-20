import { NextRequest, NextResponse } from 'next/server'
import { COLOR_LIVE } from '@/content/color'
import { isHex } from '@/lib/color'
import { getRedis } from '@/lib/redis'

// Albers' 50 listeners, for real: every visitor's "red" and their Coca-Cola red from memory,
// kept anonymously so the next visitor sees how far apart everyone's reds are.
const KEYS = { said: 'color:reds:said', coke: 'color:reds:coke' } as const
const KEEP = 500
const SHOW = 200

export async function GET() {
  if (!COLOR_LIVE) return new NextResponse(null, { status: 404 })
  const db = getRedis()
  if (!db) return NextResponse.json({ shared: false, said: [], coke: [] })

  const [said, coke] = await Promise.all([db.lrange<string>(KEYS.said, 0, SHOW - 1), db.lrange<string>(KEYS.coke, 0, SHOW - 1)])
  return NextResponse.json({ shared: true, said, coke })
}

export async function POST(request: NextRequest) {
  if (!COLOR_LIVE) return new NextResponse(null, { status: 404 })
  const db = getRedis()
  if (!db) return NextResponse.json({ shared: false })

  const { said, coke } = await request.json().catch(() => ({}))
  if (!isHex(said) || !isHex(coke)) return NextResponse.json({ error: 'Two hex colours expected' }, { status: 400 })

  // One answer per visitor a minute, so the pool stays a crowd rather than one person
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown'
  const fresh = await db.set(`color:reds:ip:${ip}`, 1, { nx: true, ex: 60 })
  if (!fresh) return NextResponse.json({ shared: true, saved: false })

  await db
    .pipeline()
    .lpush(KEYS.said, said.toLowerCase())
    .ltrim(KEYS.said, 0, KEEP - 1)
    .lpush(KEYS.coke, coke.toLowerCase())
    .ltrim(KEYS.coke, 0, KEEP - 1)
    .exec()
  return NextResponse.json({ shared: true, saved: true })
}
