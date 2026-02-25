import './globals.css'

import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'

import { Providers } from '@/shared/layout/providers'
import { Toaster } from '@/shared/ui/toaster'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.AUTH_URL || 'http://localhost:3000'),
  title: {
    default: 'AI Resume Rewriter',
    template: '%s | AI Resume Rewriter',
  },
  description: 'Transform your resume bullets into impact-driven statements with AI',
  openGraph: {
    type: 'website',
    siteName: 'AI Resume Rewriter',
  },
  twitter: {
    card: 'summary_large_image',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>
          {children}
        </Providers>
        <Toaster />
      </body>
    </html>
  )
}
