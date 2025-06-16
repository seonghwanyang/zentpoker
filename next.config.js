/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
<<<<<<< HEAD
  
  // 이미지 도메인 설정
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/**',
      }
    ],
  },
}

module.exports = nextConfig
=======
  images: {
    domains: ['lh3.googleusercontent.com'], // Google OAuth 프로필 이미지
  },
}

module.exports = nextConfig
>>>>>>> c33190324b65e7aec4664e939445b400404c1b3f
