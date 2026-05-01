import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://pump-x1.vercel.app'),

  title: 'PUMP — Pump It On X1',

  description:
    'The viral token movement of X1 Mainnet. Token-2022 standard. Fixed supply. Community-first.',

  keywords: [
    'PUMP',
    'X1',
    'X1 Mainnet',
    'Token-2022',
    'crypto',
    'SVM',
  ],

  openGraph: {
    title: 'PUMP — Pump It On X1',
    description: 'The viral token movement of X1 Mainnet.',
    url: 'https://pump-x1.vercel.app',
    siteName: 'PUMP X1',

    images: [
      {
        url: '/pump-token.png',
        width: 1200,
        height: 630,
        alt: 'PUMP Token on X1',
      },
    ],

    type: 'website',
  },

  twitter: {
    card: 'summary_large_image',
    title: 'PUMP — Pump It On X1',
    description: 'The viral token movement of X1 Mainnet.',

    images: ['/pump-token.png'],
  },

  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],

    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
  },

  manifest: '/site.webmanifest',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />

        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />

        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:wght@300;400;500&family=Syne:wght@400;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>

      <body>{children}</body>
    </html>
  )
}
