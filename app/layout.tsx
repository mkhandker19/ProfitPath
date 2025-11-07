'use client';

import './globals.css';
import Link from 'next/link';
import FloatingWidget from '@/components/FloatingWidget';
import { usePathname } from 'next/navigation';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideWidgetOn = ['/', '/login', '/register'];
  const showWidget = !hideWidgetOn.includes(pathname);

  // Hide navbar on login/register pages
  const hideNavbar = ['/', '/login', '/register'].includes(pathname);

  return (
    <html lang="en">
      <body className="bg-black text-white min-h-screen">
        {/* ✅ Global Navbar */}
        {!hideNavbar && (
          <header className="flex justify-between items-center px-8 py-4 bg-zinc-900 border-b border-zinc-800">
            <h1 className="text-lg font-bold">ProfitPath</h1>

            <nav className="flex items-center space-x-6">
              <Link
                href="/home"
                className={`hover:underline ${
                  pathname === '/home' ? 'text-gray-300 font-semibold' : ''
                }`}
              >
                Home
              </Link>

              <Link
                href="/assets"
                className={`hover:underline ${
                  pathname === '/myassets' ? 'text-gray-300 font-semibold' : ''
                }`}
              >
                My Assets
              </Link>
            </nav>

            <button className="bg-gray-700 px-4 py-2 rounded hover:bg-gray-600">
              Logout
            </button>
          </header>
        )}

        {/* ✅ Page Content */}
        <main>{children}</main>

        {/* ✅ Floating Widget */}
        {showWidget && <FloatingWidget />}
      </body>
    </html>
  );
}
