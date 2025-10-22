import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export const runtime = 'nodejs'

const usersPath = path.join(process.cwd(), 'data', 'users.json')
const JWT_SECRET = process.env.JWT_SECRET || 'CHANGE_ME_SUPER_SECRET'

function loadUsers(): any[] {
  try {
    if (!fs.existsSync(usersPath)) return []
    return JSON.parse(fs.readFileSync(usersPath, 'utf-8'))
  } catch {
    return []
  }
}

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json() as { username: string; password: string }
    if (!username || !password) {
      return NextResponse.json({ message: 'Username/email and password required.' }, { status: 400 })
    }

    const key = username.toLowerCase()
    const users = loadUsers()
    const user = users.find(
      (u) => u.username?.toLowerCase() === key || u.email?.toLowerCase() === key
    )
    if (!user) return NextResponse.json({ message: 'User not found.' }, { status: 404 })

    const ok = bcrypt.compareSync(password, user.password)
    if (!ok) return NextResponse.json({ message: 'Invalid credentials.' }, { status: 401 })

    const token = jwt.sign(
      { sub: user.username, name: `${user.firstName} ${user.lastName}`, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    const res = NextResponse.json({ message: 'Logged in.' })
    res.cookies.set('auth', token, {
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
