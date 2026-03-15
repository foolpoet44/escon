import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Navigation from './components/Navigation'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ESCON: Robotics Tech for Smart Factory',
  description: 'Robotics-focused skill map for Smart Factory (robotics, control, integration, safety, and more).',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <a href="#main-content" className="skip-link">
          메인 콘텐츠로 바로가기
        </a>
        <Navigation />
        <main id="main-content">
          {children}
        </main>
      </body>
    </html>
  )
}
