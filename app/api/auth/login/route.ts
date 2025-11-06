import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import bcrypt from 'bcryptjs'
import * as jose from 'jose'

export const runtime = 'nodejs'

const usersPath = path.join(process.cwd(), 'data', 'users.json')
const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-fallback-secret-here')

async function loadUsers(): Promise<any[]> {
  try {
    const data = await fs.readFile(usersPath, 'utf-8');
    return JSON.parse(data);
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return [];
    }
    console.error('Error reading users.json:', error);
    return [];
  }
}

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json() as { username: string; password: string }
    if (!username || !password) {
      return NextResponse.json({ message: 'Username/email and password required.' }, { status: 400 })
    }

    const key = username.toLowerCase()
    const users = await loadUsers()
    const user = users.find(
      (u) => u.username?.toLowerCase() === key || u.email?.toLowerCase() === key
    )
    if (!user) return NextResponse.json({ message: 'User not found.' }, { status: 404 })

    const ok = await bcrypt.compare(password, user.password)
    if (!ok) return NextResponse.json({ message: 'Invalid credentials.' }, { status: 401 })

    const token = await new jose.SignJWT({ name: `${user.firstName} ${user.lastName}`, email: user.email })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject(user.id)
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(secret)

    const res = NextResponse.json({ message: 'Logged in.' })
    res.cookies.set('auth_token', token, {
      httpOnly: true, sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/', maxAge: 60 * 60 * 24 * 7,
    })
    return res
  } catch (e) {
    console.error('Login error:', e)
    return NextResponse.json({ message: 'Login failed.' }, { status: 500 })
  }
}
