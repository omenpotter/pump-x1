import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import Navbar from '@/components/Navbar'
import SiteFooter from '@/components/SiteFooter'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://www.pumpx1.xyz'),
  alternates: { canonical: '/' },
  title: 'PUMP — Pump It On X1',
  description: 'The viral token movement of X1 Mainnet. Token-2022 standard. Fixed supply. Community-first.',
  keywords: ['PUMP', 'X1', 'X1 Mainnet', 'Token-2022', 'crypto', 'SVM'],
  openGraph: {
    title: 'PUMP — Pump It On X1',
    description: 'The viral token movement of X1 Mainnet.',
    url: 'https://www.pumpx1.xyz',
    siteName: 'PUMP X1',
    images: [{ url: '/pump-token.png', width: 1024, height: 1024, alt: 'PUMP Token on X1' }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PUMP — Pump It On X1',
    description: 'The viral token movement of X1 Mainnet.',
    images: ['/pump-token.png'],
  },
  icons: {
    icon: [{ url: '/favicon.ico' }, { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' }],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
  },
  manifest: '/site.webmanifest',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="platform">
        <div className="noise" aria-hidden="true" />
        <div className="scan" aria-hidden="true" />
        <a className="skip-link" href="#main-content">Skip to content</a>
        <Navbar />
        <main id="main-content" tabIndex={-1}>{children}</main>
        <SiteFooter />
        <Analytics />
      </body>
    </html>
  )
}
