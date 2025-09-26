import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import { ThemeProvider } from '@/contexts/ThemeContext'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
})

const playfair = Playfair_Display({ 
  subsets: ['latin'],
  variable: '--font-playfair',
})

export const metadata: Metadata = {
  title: 'QMemory - 量子×生成AIで場所を推測',
  description: '曖昧な記憶から、量子コンピューティングと生成AIの力で思い出の場所を推測するアプリ',
  keywords: ['quantum', 'memory', 'location', 'AI', 'generative AI', '量子', '記憶', '場所推測', '生成AI'],
  authors: [{ name: 'QMemory Team' }],
  creator: 'QMemory Team',
  publisher: 'QMemory',
  applicationName: 'QMemory',
  generator: 'Next.js',
  referrer: 'origin-when-cross-origin',
  robots: 'index, follow',
  metadataBase: new URL('https://qmemory.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'QMemory - 量子×生成AIで場所を推測',
    description: '曖昧な記憶から、量子コンピューティングと生成AIの力で思い出の場所を推測するアプリ',
    url: 'https://qmemory.vercel.app',
    siteName: 'QMemory',
    images: [
      {
        url: '/images/symbol.png',
        width: 1200,
        height: 630,
        alt: 'QMemory - 量子×生成AIで場所を推測 Symbol',
      },
    ],
    locale: 'ja_JP',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'QMemory - 量子×生成AIで場所を推測',
    description: '曖昧な記憶から、量子コンピューティングと生成AIの力で思い出の場所を推測するアプリ',
    images: ['/images/symbol.png'],
  },
  icons: {
    icon: [
      {
        url: '/favicon.ico',
        sizes: '32x32',
        type: 'image/x-icon',
      },
      {
        url: '/images/symbol.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        url: '/images/symbol.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
    shortcut: '/favicon.ico',
    apple: [
      {
        url: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
    other: [
      {
        rel: 'icon',
        url: '/images/symbol.png',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        rel: 'icon',
        url: '/images/symbol.png', 
        sizes: '16x16',
        type: 'image/png',
      },
    ],
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    title: 'QMemory',
    statusBarStyle: 'black-translucent',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja" className={`${inter.variable} ${playfair.variable}`} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link 
          rel="stylesheet" 
          href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css" 
        />
        <meta name="theme-color" content="#0f172a" />
        <meta name="msapplication-TileColor" content="#0f172a" />
        <meta name="msapplication-TileImage" content="/images/symbol.png" />
        <link rel="mask-icon" href="/images/symbol.png" color="#5ce1e6" />
        {process.env.NODE_ENV === 'production' && (
          <script dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registered: ', registration);
                    }, function(registrationError) {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }
            `
          }} />
        )}
      </head>
      <body className="font-inter antialiased min-h-screen transition-colors duration-300">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
