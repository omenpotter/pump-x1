import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import Navbar from '@/components/Navbar'
import SiteFooter from '@/components/SiteFooter'
import JsonLd from '@/components/JsonLd'
import { OG_IMAGE, siteGraph } from '@/lib/seo'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://www.pumpx1.xyz'),
  alternates: { canonical: '/' },
  title: { default: 'PUMP Token on X1 Mainnet — Token-2022 Community Token | Pump X1', template: '%s | Pump X1' },
  description: 'PUMP is a Token-2022 community token on X1 Mainnet. Contract address, on-chain supply, XDEX market data and verified pool activity in one place.',
  applicationName: 'Pump X1',
  authors: [{ name: 'ARKBS Labs' }],
  robots: { index: true, follow: true, 'max-image-preview': 'large' },
  openGraph: {
    title: 'PUMP Token on X1 Mainnet',
    description: 'A Token-2022 community token on X1 Mainnet — contract, supply and live market data.',
    url: '/',
    siteName: 'Pump X1',
    locale: 'en_US',
    images: [OG_IMAGE],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PUMP Token on X1 Mainnet',
    description: 'A Token-2022 community token on X1 Mainnet — contract, supply and live market data.',
    images: [OG_IMAGE.url],
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
        <JsonLd data={siteGraph()} />
        <Analytics />
      </body>
    </html>
  )
}
