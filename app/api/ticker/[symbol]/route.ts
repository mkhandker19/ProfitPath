import { NextResponse } from 'next/server'

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
    // Fetch previous day's close
    const prevDayUrl = `https://api.polygon.io/v2/aggs/ticker/${symbol}/prev?adjusted=true&apiKey=${key}`
    const tickerDetailsUrl = `https://api.polygon.io/v3/reference/tickers/${symbol}?apiKey=${key}`

    const [prevDayRes, tickerDetailsRes] = await Promise.all([
      fetch(prevDayUrl, { cache: 'no-store' }),
      fetch(tickerDetailsUrl, { cache: 'no-store' }),
    ])

    if (!prevDayRes.ok) {
      const errorText = await prevDayRes.text()
      return NextResponse.json({ error: `Failed to fetch previous day data for ${symbol}`, details: errorText }, { status: prevDayRes.status })
    }

    if (!tickerDetailsRes.ok) {
        const errorText = await tickerDetailsRes.text()
        return NextResponse.json({ error: `Failed to fetch ticker details for ${symbol}`, details: errorText }, { status: tickerDetailsRes.status })
    }

    const prevDayData = await prevDayRes.json()
    const tickerDetailsData = await tickerDetailsRes.json()

    const result = {
      symbol: prevDayData.results?.[0]?.T ?? symbol,
      name: tickerDetailsData.results?.name ?? 'N/A',
      price: prevDayData.results?.[0]?.c ?? null,
      open: prevDayData.results?.[0]?.o ?? null,
      high: prevDayData.results?.[0]?.h ?? null,
      low: prevDayData.results?.[0]?.l ?? null,
      close: prevDayData.results?.[0]?.c ?? null,
      volume: prevDayData.results?.[0]?.v ?? null,
    }

    return NextResponse.json(result)
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: String(e) }, { status: 500 })
  }
}
