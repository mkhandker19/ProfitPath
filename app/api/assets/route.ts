import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth'
import fs from 'fs/promises'
import path from 'path'

const STORE = path.join(process.cwd(), 'data', 'favorites.json')

async function readStore(): Promise<Record<string, string[]>> {
  try {
    const raw = await fs.readFile(STORE, 'utf8')
    return JSON.parse(raw || '{}')
  } catch {
    return {}
  }
}

async function writeStore(data: Record<string, string[]>) {
  await fs.mkdir(path.dirname(STORE), { recursive: true })
  await fs.writeFile(STORE, JSON.stringify(data, null, 2), 'utf8')
}

export async function GET() {
  const user = await verifyAuth()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = await readStore()
  const list = db[user.email] || []
  return NextResponse.json({ tickers: list })
}

export async function POST(req: NextRequest) {
  const user = await verifyAuth()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  let ticker: string = (body?.ticker || '').toUpperCase().trim()

  if (!/^[A-Z.\-]{1,10}$/.test(ticker)) {
    return NextResponse.json({ error: 'Invalid ticker' }, { status: 400 })
  }

  const db = await readStore()
  const current = new Set((db[user.email] || []).map(t => t.toUpperCase()))
  current.add(ticker)
  db[user.email] = Array.from(current).slice(0, 50) // simple cap

  await writeStore(db)
  return NextResponse.json({ ok: true, tickers: db[user.email] })
}

export async function DELETE(req: NextRequest) {
  const user = await verifyAuth()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const ticker = (searchParams.get('ticker') || '').toUpperCase().trim()
  if (!ticker) return NextResponse.json({ error: 'Missing ticker' }, { status: 400 })

  const db = await readStore()
  const list = (db[user.email] || []).filter(t => t.toUpperCase() !== ticker)
  db[user.email] = list
  await writeStore(db)

  return NextResponse.json({ ok: true, tickers: list })
}
