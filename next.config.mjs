/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'github.com',
      },
    ],
  },
  // Unlisted homepage variants (static HTML in public/variants) for A/B exploration
  async rewrites() {
    return [
      { source: '/variants', destination: '/variants/index.html' },
      { source: '/variants/brand', destination: '/variants/02-brand.html' },
      { source: '/variants/showcase', destination: '/variants/04-showcase.html' },
    ]
  },
  async headers() {
    return [
      { source: '/variants/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] },
      { source: '/variants', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] },
    ]
  },
}

export default nextConfig
