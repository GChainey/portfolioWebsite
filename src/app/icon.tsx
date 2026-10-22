import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { ImageResponse } from 'next/og'

// The tab icon: a G in the site's amber, drawn at build time so every browser gets a PNG
export const size = { width: 64, height: 64 }
export const contentType = 'image/png'

export default async function Icon() {
  // The site's own face, Geist, rather than the renderer's fallback
  const geist = await readFile(join(process.cwd(), 'node_modules/geist/dist/fonts/geist-sans/Geist-SemiBold.ttf'))
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#d97706', borderRadius: 14, color: '#fff', fontSize: 44, fontFamily: 'Geist', fontWeight: 600, letterSpacing: -2 }}>
        G
      </div>
    ),
    { ...size, fonts: [{ name: 'Geist', data: geist, weight: 600 }] },
  )
}
