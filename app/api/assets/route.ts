import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { cookies } from 'next/headers'
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

async function saveUsers(users: any[]) {
  await fs.mkdir(path.dirname(usersPath), { recursive: true });
  await fs.writeFile(usersPath, JSON.stringify(users, null, 2));
}

async function getUserIdFromCookie() {
  const cookie = cookies().get('auth_token')
  if (!cookie) return null
  try {
    const { payload } = await jose.jwtVerify(cookie.value, secret)
    return payload.sub
  } catch (e) {
    return null
  }
}

export async function GET() {
  const userId = await getUserIdFromCookie()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const users = await loadUsers()
  const user = users.find(u => u.id === userId)

  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  return NextResponse.json({ assets: user.assets || [] })
}

export async function POST(req: Request) {
  const userId = await getUserIdFromCookie()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { symbol } = await req.json()
  if (!symbol) return NextResponse.json({ error: 'Symbol is required' }, { status: 400 })

  const users = await loadUsers()
  const user = users.find(u => u.id === userId)

  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  if (!user.assets) user.assets = []
  if (!user.assets.includes(symbol)) {
    user.assets.push(symbol)
  }

  await saveUsers(users)
  return NextResponse.json({ message: 'Asset added' })
}

export async function DELETE(req: Request) {
    const userId = await getUserIdFromCookie()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const symbol = searchParams.get('symbol')

    if (!symbol) return NextResponse.json({ error: 'Symbol is required' }, { status: 400 })

    const users = await loadUsers()
    const user = users.find(u => u.id === userId)

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    if (user.assets) {
      user.assets = user.assets.filter((s: string) => s !== symbol)
    }

    await saveUsers(users)
    return NextResponse.json({ message: 'Asset removed' })
  }
