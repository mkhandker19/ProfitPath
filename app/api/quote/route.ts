import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const symbol = url.searchParams.get('symbol')
  if (!symbol) return NextResponse.json({ error: 'symbol required' }, { status: 400 })

  const key = process.env.POLYGON_API_KEY
  if (!key) return NextResponse.json({ error: 'Server missing POLYGON_API_KEY' }, { status: 500 })

  // Previous day aggregate (close, high, low, volume)
  const endpoint = `https://api.polygon.io/v2/aggs/ticker/${symbol}/prev?adjusted=true&apiKey=${key}`

  const r = await fetch(endpoint, { cache: 'no-store' })
  const data = await r.json()
  return NextResponse.json(data)
}
