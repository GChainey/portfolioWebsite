import { NextRequest, NextResponse } from 'next/server'
import { COLOR_LIVE } from '@/content/color'
import { isHex } from '@/lib/color'
import { getRedis } from '@/lib/redis'

// Albers' class exhibition: visitors' own chapter IV studies (two grounds and one small colour),
// kept anonymously so the next visitor can see what worked for other people.
const KEY = 'color:studies'
const KEEP = 300
const SHOW = 60

export async function GET() {
  if (!COLOR_LIVE) return new NextResponse(null, { status: 404 })
  const db = getRedis()
  if (!db) return NextResponse.json({ shared: false, studies: [] })

  const studies = await db.lrange<{ left: string; right: string; inner: string }>(KEY, 0, SHOW - 1)
  return NextResponse.json({ shared: true, studies })
}

export async function POST(request: NextRequest) {
  if (!COLOR_LIVE) return new NextResponse(null, { status: 404 })
  const db = getRedis()
  if (!db) return NextResponse.json({ shared: false })

  const { left, right, inner } = await request.json().catch(() => ({}))
  if (![left, right, inner].every(isHex)) return NextResponse.json({ error: 'Three hex colours expected' }, { status: 400 })

  // One study per visitor every 20 seconds
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown'
  const fresh = await db.set(`color:studies:ip:${ip}`, 1, { nx: true, ex: 20 })
  if (!fresh) return NextResponse.json({ shared: true, saved: false })

  const study = { left: left.toLowerCase(), right: right.toLowerCase(), inner: inner.toLowerCase() }
  await db.pipeline().lpush(KEY, JSON.stringify(study)).ltrim(KEY, 0, KEEP - 1).exec()
  return NextResponse.json({ shared: true, saved: true })
}
