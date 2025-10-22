import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import bcrypt from 'bcryptjs'

export const runtime = 'nodejs'

const usersPath = path.join(process.cwd(), 'data', 'users.json')

function loadUsers(): any[] {
  try {
    if (!fs.existsSync(usersPath)) return []
    return JSON.parse(fs.readFileSync(usersPath, 'utf-8'))
  } catch {
    return []
  }
}
function saveUsers(users: any[]) {
  fs.mkdirSync(path.dirname(usersPath), { recursive: true })
  fs.writeFileSync(usersPath, JSON.stringify(users, null, 2))
}

export async function POST(req: Request) {
  try {
    const { firstName, lastName, email, username, password } = await req.json()

    if (!firstName || !lastName || !email || !username || !password) {
      return NextResponse.json({ message: 'All fields are required.' }, { status: 400 })
    }

    const users = loadUsers()
    if (users.some(u => u.email?.toLowerCase() === email.toLowerCase() ||
                        u.username?.toLowerCase() === username.toLowerCase())) {
      return NextResponse.json({ message: 'User already exists.' }, { status: 400 })
    }

    const hashed = bcrypt.hashSync(password, 10)
    users.push({
      id: Date.now().toString(),
      firstName, lastName, email, username,
      password: hashed,
      createdAt: new Date().toISOString(),
    })
    saveUsers(users)

    return NextResponse.json({ message: 'User created.' }, { status: 201 })
  } catch (e) {
    console.error('Register error:', e)
    return NextResponse.json({ message: 'Validation failed.' }, { status: 500 })
  }
}
