import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import bcrypt from 'bcryptjs'

export const runtime = 'nodejs'

const usersPath = path.join(process.cwd(), 'data', 'users.json')

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

async function saveUsers(users: any[]) {
  await fs.mkdir(path.dirname(usersPath), { recursive: true });
  await fs.writeFile(usersPath, JSON.stringify(users, null, 2));
}

export async function POST(req: Request) {
  try {
    const { firstName, lastName, email, username, password } = await req.json()

    if (!firstName || !lastName || !email || !username || !password) {
      return NextResponse.json({ message: 'All fields are required.' }, { status: 400 })
    }

    const users = await loadUsers()
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
    await saveUsers(users)

    return NextResponse.json({ message: 'User created.' }, { status: 201 })
  } catch (e) {
    console.error('Register error:', e)
    return NextResponse.json({ message: 'Validation failed.' }, { status: 500 })
  }
}
