'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function RegisterPage() {
  const [form, setForm] = useState({ username:'', email:'', password:'', firstName:'', lastName:'' })
  const [msg, setMsg] = useState<string | null>(null)

  const onChange = (e: any) => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async () => {
    setMsg(null)
    const r = await fetch('/api/auth/register', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(form) })
    const j = await r.json()
    if (!r.ok) { setMsg(j.error || 'Registration failed'); return }
    // After register, navigate to login
    window.location.href = '/login'
  }

  return (
    <main className="min-h-screen grid place-items-center p-6">
      <div className="glass w-full max-w-md p-6">
        <h1 className="text-2xl font-semibold mb-4">Create Account</h1>
        <div className="grid grid-cols-2 gap-3">
          <input name="firstName" placeholder="First name" className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 col-span-1" onChange={onChange} />
          <input name="lastName" placeholder="Last name" className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 col-span-1" onChange={onChange} />
          <input name="username" placeholder="Username (alphanumeric, ≥8)" className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 col-span-2" onChange={onChange} />
          <input name="email" placeholder="Email (must end with .com)" className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 col-span-2" onChange={onChange} />
          <input name="password" type="password" placeholder="Password (≥8 chars)" className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 col-span-2" onChange={onChange} />
        </div>
        <button onClick={submit} className="w-full mt-4 px-4 py-2 rounded-xl bg-white/10 border border-white/10 hover:bg-white/20">Create Account</button>
        {msg && <p className="text-red-300 text-sm mt-2">{msg}</p>}
        <p className="text-sm opacity-80 mt-3">Already have an account? <Link className="underline" href="/login">Sign in</Link></p>
      </div>
    </main>
  )
}
