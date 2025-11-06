'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'

type Props = {
  variant?: 'landing' | 'app' // landing = Login only; app = Home/My Assets/Logout
}

export default function NavBar({ variant = 'landing' }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const [loggingOut, setLoggingOut] = useState(false)

  const isActive = (href: string) =>
    pathname === href || (href !== '/' && pathname?.startsWith(href))

  const logout = async () => {
    try {
      setLoggingOut(true)
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/login')
    } finally {
      setLoggingOut(false)
    }
  }

  return (
    <header className="fixed top-0 inset-x-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-black/30 bg-black/40 border-b border-white/10">
      <nav className="mx-auto max-w-7xl px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-semibold tracking-tight">ProfitPath</Link>

        {/* CENTER LINKS */}
        {variant === 'app' ? (
          <div className="flex items-center gap-1">
            <Link
              href="/home"
              className={[
                'px-3 py-1.5 rounded-xl text-sm transition-colors',
                isActive('/home') ? 'bg-white/15' : 'hover:bg-white/10'
              ].join(' ')}
            >
              Home
            </Link>
            <Link
              href="/search"
              className={[
                'px-3 py-1.5 rounded-xl text-sm transition-colors',
                isActive('/search') ? 'bg-white/15' : 'hover:bg-white/10'
              ].join(' ')}
            >
              Search
            </Link>
            <Link
              href="/ai"
              className={[
                'px-3 py-1.5 rounded-xl text-sm transition-colors',
                isActive('/ai') ? 'bg-white/15' : 'hover:bg-white/10'
              ].join(' ')}
            >
              AI
            </Link>
          </div>
        ) : (
          <span /> /* spacer */
        )}

        {/* RIGHT SIDE AUTH */}
        {variant === 'app' ? (
          <button
            onClick={logout}
            disabled={loggingOut}
            className="px-3 py-1.5 rounded-xl text-sm bg-white/10 border border-white/10 hover:bg-white/20 disabled:opacity-50"
          >
            {loggingOut ? 'Logging out…' : 'Logout'}
          </button>
        ) : (
          <Link href="/login" className="px-3 py-1.5 rounded-xl text-sm hover:bg-white/10">
            Login
          </Link>
        )}
      </nav>
    </header>
  )
}
