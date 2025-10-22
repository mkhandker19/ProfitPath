import { verifyAuth } from '@/lib/auth'
import Link from 'next/link'

export default async function Dashboard() {
  const user = await verifyAuth()
  if (!user) {
    return (
      <main className="min-h-screen grid place-items-center p-6">
        <div className="glass w-full max-w-md p-6 text-center">
          <h1 className="text-2xl font-semibold mb-2">Please sign in</h1>
          <Link className="underline" href="/login">Go to login</Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen p-6">
      <div className="glass max-w-2xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-2">Welcome, {user.name || user.username}!</h1>
        <p className="opacity-80">This is your dashboard. You’re now authenticated.</p>
        <form action="/api/auth/logout" method="post" className="mt-4">
          <button className="px-4 py-2 rounded-xl bg-white/10 border border-white/10 hover:bg-white/20">Log out</button>
        </form>
      </div>
    </main>
  )
}
