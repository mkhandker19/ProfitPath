import { NextResponse } from 'next/server'
import { subYears, format } from 'date-fns'

export async function GET(
  req: Request,
  { params }: { params: { symbol: string } }
) {
  const symbol = params.symbol?.toUpperCase()
  if (!symbol) {
    return NextResponse.json({ error: 'Symbol is required' }, { status: 400 })
  }

  const key = process.env.POLYGON_API_KEY
  if (!key) {
    return NextResponse.json({ error: 'Missing POLYGON_API_KEY' }, { status: 500 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const from = searchParams.get('from') || format(subYears(new Date(), 1), 'yyyy-MM-dd')
    const to = searchParams.get('to') || format(new Date(), 'yyyy-MM-dd')

    const url = `https://api.polygon.io/v2/aggs/ticker/${symbol}/range/1/day/${from}/${to}?adjusted=true&sort=asc&apiKey=${key}`

    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) {
      const errorText = await res.text()
      return NextResponse.json({ error: `Failed to fetch historical data for ${symbol}`, details: errorText }, { status: res.status })
    }

    const data = await res.json()
    return NextResponse.json(data)

  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: String(e) }, { status: 500 })
  }
}
