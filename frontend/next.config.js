const fs = require('fs')
const path = require('path')

// Load root-level .env so that backendと共通の設定をNext.jsにも反映できるようにする
const loadRootEnv = () => {
  const envPath = path.resolve(__dirname, '..', '.env')
  if (!fs.existsSync(envPath)) {
    return
  }

  const text = fs.readFileSync(envPath, 'utf8')
  text.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) {
      return
    }

    const equalsIndex = trimmed.indexOf('=')
    if (equalsIndex === -1) {
      return
    }

    const key = trimmed.slice(0, equalsIndex).trim()
    if (!key || Object.prototype.hasOwnProperty.call(process.env, key)) {
      return
    }

    let value = trimmed.slice(equalsIndex + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }

    process.env[key] = value
  })
}

loadRootEnv()

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Disable for better dev performance
  images: {
    remotePatterns: [],
    unoptimized: true, // Disable optimization to ensure images are copied
    formats: ['image/webp', 'image/avif'],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    loader: 'default',
    domains: [],
  },
  // Development optimizations
  compiler: {
    removeConsole: false,
  },
  webpack: (config, { dev }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/lib': path.resolve(__dirname, './src/lib'),
      '@/types': path.resolve(__dirname, './src/types'),
    };
    
    if (dev) {
      // Development optimizations
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
          },
        },
      };
    }
    
    return config;
  },
  // PWA and Performance optimizations
  // experimental: {
  //   optimizeCss: true,
  // },
  // Compression
  compress: true,
  // Headers for better caching
  headers: async () => {
    return [
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/favicon.ico',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400',
          },
        ],
      },
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
