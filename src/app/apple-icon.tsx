import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { ImageResponse } from 'next/og'

// The home-screen icon: the tab icon's G, full bleed (iOS rounds the corners itself)
export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default async function AppleIcon() {
  const geist = await readFile(join(process.cwd(), 'node_modules/geist/dist/fonts/geist-sans/Geist-SemiBold.ttf'))
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#d97706', color: '#fff', fontSize: 124, fontFamily: 'Geist', fontWeight: 600, letterSpacing: -6 }}>
        G
      </div>
    ),
    { ...size, fonts: [{ name: 'Geist', data: geist, weight: 600 }] },
  )
}
