export const WARP_SETTINGS = {
  speed: 1.8,
  scale: 1,
  softness: 1.5,
  proportion: 0.64,
  swirl: 0.86,
  swirlIterations: 7,
  shape: 'edge' as const,
  distortion: 0.2,
  shapeScale: 0.6,
}

export type LogoPlacement = 'center' | 'bottom-right'

export type EAIBannerVariant = {
  colors: [string, string, string]
  logoColor: string
  placement: LogoPlacement
}

/** Light → cyan → dark (centred), then the same three bottom-right. */
export const EAI_BANNER_VARIANTS: EAIBannerVariant[] = [
  {
    colors: ['#0D3856', '#D1D1D1', '#ECECEC'],
    logoColor: '#0D3856',
    placement: 'center',
  },
  {
    colors: ['#0D3856', '#8EDFF9', '#0E3756'],
    logoColor: '#FFFFFF',
    placement: 'center',
  },
  {
    colors: ['#0D3856', '#0E3755', '#0A180D'],
    logoColor: '#FFFFFF',
    placement: 'center',
  },
  {
    colors: ['#0D3856', '#D1D1D1', '#ECECEC'],
    logoColor: '#0D3856',
    placement: 'bottom-right',
  },
  {
    colors: ['#0D3856', '#8EDFF9', '#0E3756'],
    logoColor: '#FFFFFF',
    placement: 'bottom-right',
  },
  {
    colors: ['#0D3856', '#0E3755', '#0A180D'],
    logoColor: '#FFFFFF',
    placement: 'bottom-right',
  },
]

export const VARIANT_HOLD_MS = 2900
export const VARIANT_CROSSFADE_MS = 600

/** Paper artboard 1920×1080 — logo 230px wide, inset 75px / 50px bottom-right */
export const LOGO_WIDTH_RATIO = 230 / 1920
export const LOGO_INSET_RIGHT_RATIO = 75 / 1920
export const LOGO_INSET_BOTTOM_RATIO = 50 / 1080
