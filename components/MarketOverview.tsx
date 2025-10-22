'use client'
import { useEffect, useState } from 'react'
type Row = { symbol: string; name?: string; price?: number|null; changePct?: number|null }
export default function MarketOverview() {
  const [gainers, setGainers] = useState<Row[]>([])
  const [losers, setLosers] = useState<Row[]>([])
  const [err, setErr] = useState<string | null>(null)
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch('/api/market/top', { cache: 'no-store' })
        const j = await r.json()
        if (!r.ok) throw new Error(j?.error || 'Failed')
        setGainers(j.gainers || [])
        setLosers(j.losers || [])
      } catch (e: any) { setErr(e.message) }
    })()
  }, [])
  const List = ({ title, items }: { title: string; items: Row[] }) => (
    <div className="card p-4">
      <h3 className="font-semibold mb-3">{title}</h3>
      <div className="space-y-2">
        {items.map(r => (
          <div key={r.symbol} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="font-mono">{r.symbol}</span>
              <span className="opacity-70">{r.name?.slice(0,28)}</span>
            </div>
            <div className="text-right">
              <div className="opacity-80">${(r.price ?? 0).toFixed(2)}</div>
              <div className={(r.changePct ?? 0) >= 0 ? 'text-green-400' : 'text-red-400'}>
                {(r.changePct ?? 0).toFixed(2)}%
              </div>
            </div>
          </div>
        ))}
        {!items.length && <div className="text-sm opacity-60">No data.</div>}
      </div>
    </div>
  )
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {err && <div className="card p-4 text-red-300 text-sm">Market data error: {err}</div>}
      <List title="Top Gainers" items={gainers} />
      <List title="Top Losers"  items={losers} />
    </div>
  )
}
