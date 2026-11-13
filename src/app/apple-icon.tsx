import { ImageResponse } from 'next/og'
import { Mark } from './_icon/mark'

// The home-screen icon: the tab icon's mark, full bleed (iOS rounds the corners itself)
export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(<Mark size={180} rounded={false} />, size)
}
