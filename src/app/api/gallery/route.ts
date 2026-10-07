import { promises as fs } from 'fs'
import path from 'path'
import { NextResponse } from 'next/server'

// Dev-only. The gallery's edit mode (/gallery?edit) ticks items in and out of the shared
// content file, so a hidden item disappears from the site and every homepage variant at once.
const ITEMS = path.join(process.cwd(), 'public/gallery/items.json')

export async function POST(request: Request) {
  if (process.env.NODE_ENV !== 'development') return new NextResponse(null, { status: 404 })

  const { id, hidden } = await request.json()
  const data = JSON.parse(await fs.readFile(ITEMS, 'utf8'))
  const item = data.items.find((i: { id: string }) => i.id === id)
  if (!item) return NextResponse.json({ error: `No gallery item "${id}"` }, { status: 404 })

  if (hidden) item.hidden = true
  else delete item.hidden
  await fs.writeFile(ITEMS, JSON.stringify(data, null, 2) + '\n')

  return NextResponse.json({ id, hidden: Boolean(hidden) })
}
