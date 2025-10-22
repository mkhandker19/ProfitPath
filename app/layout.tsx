// app/layout.tsx
'use client'

import './globals.css'
import FloatingWidget from '@/components/FloatingWidget'
import { usePathname } from 'next/navigation'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const hideWidgetOn = ['/', '/login', '/register']
  const showWidget = !hideWidgetOn.includes(pathname)

  return (
    <html lang="en">
      <body className="bg-black text-white min-h-screen">
        {children}
        {showWidget && <FloatingWidget />}
      </body>
    </html>
  )
}
