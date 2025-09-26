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
  reactStrictMode: true,
  images: {
    remotePatterns: [],
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/lib': path.resolve(__dirname, './src/lib'),
      '@/types': path.resolve(__dirname, './src/types'),
    };
    return config;
  },
}

module.exports = nextConfig
