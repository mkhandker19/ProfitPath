import { NextResponse } from 'next/server'

function yyyymmdd(d = new Date()) {
  const dt = new Date(d.getTime() - 24*60*60*1000) // yesterday (simple fallback)
  const y = dt.getFullYear()
  const m = String(dt.getMonth()+1).padStart(2,'0')
  const day = String(dt.getDate()).padStart(2,'0')
  return `${y}-${m}-${day}`
}

export async function GET() {
  const key = process.env.POLYGON_API_KEY
  if (!key) return NextResponse.json({ error: 'Missing POLYGON_API_KEY' }, { status: 500 })

  // Try snapshots first
  const snapGainers = `https://api.polygon.io/v2/snapshot/locale/us/markets/stocks/gainers?apiKey=${key}`
  const snapLosers  = `https://api.polygon.io/v2/snapshot/locale/us/markets/stocks/losers?apiKey=${key}`

  try {
    const [gRes, lRes] = await Promise.all([
      fetch(snapGainers, { cache: 'no-store' }),
      fetch(snapLosers,  { cache: 'no-store' }),
    ])

    if (gRes.ok && lRes.ok) {
      const [gainers, losers] = await Promise.all([gRes.json(), lRes.json()])
      const pick = (arr: any[] = [], n = 10) =>
        arr.slice(0, n).map((x: any) => ({
          symbol: x?.ticker ?? x?.T ?? '',
          name: x?.name ?? '',
          price: x?.day?.c ?? x?.min?.c ?? x?.lastTrade?.p ?? null,
          change: x?.todaysChange ?? null,
          changePct: x?.todaysChangePerc ?? null,
          volume: x?.day?.v ?? x?.volume ?? null,
        }))
      return NextResponse.json({
        gainers: pick(gainers?.tickers ?? gainers?.results ?? []),
        losers:  pick(losers?.tickers  ?? losers?.results  ?? []),
      })
    }

    // Fallback: previous-day grouped bars for all tickers, compute % change
    const day = yyyymmdd()
    const grouped = `https://api.polygon.io/v2/aggs/grouped/locale/us/market/stocks/${day}?adjusted=true&include_otc=false&apiKey=${key}`
    const gr = await fetch(grouped, { cache: 'no-store' })
    if (!gr.ok) {
      const detail = await gr.text()
      return NextResponse.json({ error: 'Polygon error', detail }, { status: gr.status })
    }
    const gj = await gr.json()
    const rows: any[] = gj?.results ?? []

    const mapped = rows
      .map((x: any) => {
        const o = x.o, c = x.c
        const pct = o ? ((c - o) / o) * 100 : null
        return {
          symbol: x.T,
          name: undefined,
          price: c ?? null,
          change: o != null && c != null ? (c - o) : null,
          changePct: pct,
          volume: x.v ?? null,
        }
      })
      .filter(r => r.changePct != null && isFinite(r.changePct as number))

    const gainers = [...mapped].sort((a,b) => (b.changePct! - a.changePct!)).slice(0,10)
    const losers  = [...mapped].sort((a,b) => (a.changePct! - b.changePct!)).slice(0,10)

    return NextResponse.json({ gainers, losers })
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: String(e) }, { status: 500 })
  }
}
