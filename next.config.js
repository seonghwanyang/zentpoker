/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['lh3.googleusercontent.com'], // Google OAuth 프로필 이미지
  },
  experimental: {
    serverActions: true,
  },
}

module.exports = nextConfig
