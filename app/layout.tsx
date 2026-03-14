import type { Metadata, Viewport } from 'next'
import SessionProvider from '@/components/SessionProvider'
import './globals.css'

export const metadata: Metadata = {
  title: 'SAFORA - Your Safety on the Road',
  description: 'AI-powered road safety companion - Made by Aiman',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'SAFORA',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0A3D4C',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}
