/** @type {import('next').NextConfig} */
const nextConfig = {
  // Only use standalone output for Docker builds, not on Vercel
  output: process.env.VERCEL ? undefined : 'standalone',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    remotePatterns: [],
  },
}

module.exports = nextConfig
