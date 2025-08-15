import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers/session-provider'
import { Header } from '@/components/layout/header'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Waven - Blog Forum',
  description: 'A modern blog forum where users share ideas and get waves for their content',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen bg-gradient-to-br from-wave-50 via-ocean-50 to-lavender-50 bg-wave-pattern">
            <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-white/30 pointer-events-none"></div>
            <Header />
            <main className="relative z-10">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  )
}
