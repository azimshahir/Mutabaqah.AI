import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable dev indicators (Next.js logo)
  devIndicators: false,
  // Enable experimental features
  experimental: {
    // Enable server actions for forms
  },
  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Environment variables exposed to the browser
  env: {
    NEXT_PUBLIC_APP_NAME: 'Mutabaqah.ai',
  },
  // Ignore build errors for deployment
  typescript: {
    ignoreBuildErrors: true,
  },
  // CORS headers for API integration with BR System
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization' },
        ],
      },
    ];
  },
};

export default nextConfig;
