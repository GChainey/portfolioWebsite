import { ImageResponse } from 'next/og'
import { Mark } from './_icon/mark'

// The tab icon: a facet G on an amber tile, drawn at build time so every browser gets a PNG
export const size = { width: 64, height: 64 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(<Mark size={64} rounded />, size)
}
