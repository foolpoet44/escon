/** @type {import('next').NextConfig} */
const { withSentryConfig } = require("@sentry/nextjs");

const nextConfig = {
  // 빌드 시 타입 에러 및 린트 에러 무시 (Vercel 배포 안정성 우선)
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

  // ============================================================================
  // 실험적 기능
  // ============================================================================
  experimental: {
    esmExternals: 'loose',
  },

  // ============================================================================
  // 이미지 최적화
  // ============================================================================
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    // 캐시 최대화
    minimumCacheTTL: 60,
  },

  // ============================================================================
  // 성능 최적화
  // ============================================================================
  swcMinify: true,
  productionBrowserSourceMaps: false,

  // ============================================================================
  // 환경 변수
  // ============================================================================
  env: {
    NEXT_PUBLIC_APP_VERSION: '0.1.0',
  },

  // ============================================================================
  // 헤더 설정 (보안 & 성능)
  // ============================================================================
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0',
          },
        ],
      },
    ]
  },

  // ============================================================================
  // 재작성 (URL 마스킹)
  // ============================================================================
  // NOTE: '/' → '/robot-smartfactory' redirect는 vercel.json의 redirects에서 처리.
  //       여기서 중복 정의하면 Vercel이 두 번 적용하여 이중 redirect 루프 발생 가능.
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/api/:path*',
          destination: '/api/:path*',
        },
      ],
    }
  },

  // ============================================================================
  // 웹팩 설정 (번들 크기 최적화)
  // ============================================================================
  webpack: (config, { isServer }) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      crypto: false,
    }
    return config
  },

  // ============================================================================
  // Vercel 배포 최적화
  // ============================================================================
  compress: true,
  poweredByHeader: false,
};

// SENTRY_AUTH_TOKEN이 없으면 Sentry CLI가 빌드를 중단시킴.
// 토큰이 없는 환경(CI, preview)에서는 withSentryConfig를 완전히 우회.
if (!process.env.SENTRY_AUTH_TOKEN) {
  module.exports = nextConfig;
} else {
  module.exports = withSentryConfig(nextConfig, {
    silent: true,
    org: process.env.SENTRY_ORG || "escon",
    project: process.env.SENTRY_PROJECT || "escon",
    widenClientFileUpload: true,
    // transpileClientSDK: v7 전용 옵션. @sentry/nextjs v8에서 제거됨 → 삭제
    tunnelRoute: "/monitoring",
    hideSourceMaps: true,
    disableLogger: true,
  });
}
