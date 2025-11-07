'use client';

import './globals.css';
import Link from 'next/link';
import FloatingWidget from '@/components/FloatingWidget';
import { usePathname } from 'next/navigation';
import { Sun, Moon } from 'lucide-react';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';

function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideWidgetOn = ['/', '/login', '/register'];
  const showWidget = !hideWidgetOn.includes(pathname);
  const hideNavbar = hideWidgetOn.includes(pathname);

  const { theme, toggleTheme } = useTheme();

  return (
    <html lang="en" className={theme === 'dark' ? 'dark' : ''}>
      <body
        className={`min-h-screen transition-colors duration-500 ${
          theme === 'dark'
            ? 'bg-gradient-to-b from-black via-gray-950 to-black text-white'
            : 'bg-gradient-to-b from-[#f5f7fa] via-[#c3e0dc] to-[#9ad0c2] text-gray-900'
        }`}
      >
        {!hideNavbar && (
          <header
            className={`flex justify-between items-center px-8 py-4 border-b transition-all duration-300 ${
              theme === 'dark'
                ? 'bg-zinc-900 border-zinc-800 text-white'
                : 'bg-[#eaf5f3] border-[#cde3dd] text-gray-900 shadow-sm'
            }`}
          >
            {/* Logo / Title */}
            <h1 className="text-lg font-bold">ProfitPath</h1>

            {/* Navigation Links */}
            <nav className="flex items-center space-x-6">
              <Link
                href="/home"
                className={`hover:underline ${
                  pathname === '/home'
                    ? theme === 'dark'
                      ? 'text-blue-400 font-semibold'
                      : 'text-blue-700 font-semibold'
                    : ''
                }`}
              >
                Home
              </Link>

              <Link
                href="/assets"
                className={`hover:underline ${
                  pathname === '/assets'
                    ? theme === 'dark'
                      ? 'text-blue-400 font-semibold'
                      : 'text-blue-700 font-semibold'
                    : ''
                }`}
              >
                My Assets
              </Link>
            </nav>

            {/* Right-side Buttons */}
            <div className="flex items-center gap-4">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-full border transition-all duration-300 ${
                  theme === 'dark'
                    ? 'border-gray-600 hover:bg-gray-800'
                    : 'border-gray-400 hover:bg-[#d4ebe6]'
                }`}
                title="Toggle Theme"
              >
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5 text-yellow-400" />
                ) : (
                  <Moon className="w-5 h-5 text-blue-600" />
                )}
              </button>

              {/* Logout */}
              <button
                className={`px-4 py-2 rounded transition-all duration-300 ${
                  theme === 'dark'
                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                    : 'bg-[#cce9e0] hover:bg-[#bfe1d6] text-gray-900'
                }`}
              >
                Logout
              </button>
            </div>
          </header>
        )}

        <main className="transition-colors duration-500">{children}</main>

        {showWidget && <FloatingWidget />}
      </body>
    </html>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <LayoutContent>{children}</LayoutContent>
    </ThemeProvider>
  );
}
