// app/layout.tsx
'use client'

import './globals.css'
import FloatingWidget from '@/components/FloatingWidget'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import SplashScreen from '@/components/SplashScreen'
import { ThemeProvider } from '@/components/ThemeProvider'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const hideWidgetOn = ['/', '/login', '/register']
  const showWidget = !hideWidgetOn.includes(pathname)
  const [isLoading, setIsLoading] = useState(true)

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <div className="min-h-screen bg-white text-black dark:bg-dark-gradient dark:text-white bg-cover bg-center bg-fixed">
            {isLoading ? (
              <SplashScreen onComplete={() => setIsLoading(false)} />
            ) : (
              <>
                {children}
                {showWidget && <FloatingWidget />}
              </>
            )}
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
