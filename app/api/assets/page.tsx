'use client'
import { useEffect, useMemo, useState } from 'react'
import NavBar from '@/components/NavBar'

type TQuote = {
  symbol: string
  price: number | null
  change?: number | null
  changePct?: number | null
}

async function fetchQuote(symbol: string): Promise<TQuote> {
  // Uses your existing /api/quote route
  const r = await fetch(`/api/quote?ticker=${encodeURIComponent(symbol)}`, { cache: 'no-store' })
  if (!r.ok) return { symbol, price: null }
  const j = await r.json()
  return {
    symbol,
    price: j?.price ?? null,
    change: j?.change ?? null,
    changePct: j?.changePct ?? null,
  }
}

export default function AssetsPage() {
  const [input, setInput] = useState('')
  const [tickers, setTickers] = useState<string[]>([])
  const [quotes, setQuotes] = useState<Record<string, TQuote>>({})
  const [loading, setLoading] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // fetch user favorites
  useEffect(() => {
    let mounted = true
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const r = await fetch('/api/assets', { cache: 'no-store' })
        const j = await r.json()
        if (!r.ok) throw new Error(j?.error || 'Failed to load favorites')
        if (mounted) setTickers(j.tickers || [])
      } catch (e: any) {
        if (mounted) setError(e.message)
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [])

  // fetch quotes whenever tickers change
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const entries = await Promise.all(
        tickers.map(async t => [t, await fetchQuote(t)] as const)
      )
      if (!cancelled) {
        const map: Record<string, TQuote> = {}
        for (const [t, q] of entries) map[t] = q
        setQuotes(map)
      }
    })()
    return () => { cancelled = true }
  }, [tickers])

  const onAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    const t = input.toUpperCase().trim()
    if (!t) return
    setBusy(true); setError(null)
    try {
      const r = await fetch('/api/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticker: t }),
      })
      const j = await r.json()
      if (!r.ok) throw new Error(j?.error || 'Failed to add ticker')
      setTickers(j.tickers || [])
      setInput('')
    } catch (e: any) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  const remove = async (t: string) => {
    setBusy(true); setError(null)
    try {
      const r = await fetch(`/api/assets?ticker=${encodeURIComponent(t)}`, { method: 'DELETE' })
      const j = await r.json()
      if (!r.ok) throw new Error(j?.error || 'Failed to remove ticker')
      setTickers(j.tickers || [])
    } catch (e: any) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  const rows = useMemo(() => {
    return tickers.map(t => {
      const q = quotes[t]
      return {
        symbol: t,
        price: q?.price ?? null,
        changePct: q?.changePct ?? null,
        change: q?.change ?? null,
      }
    })
  }, [tickers, quotes])

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black text-white">
      <NavBar variant="app" />
      <div className="max-w-6xl mx-auto pt-20 p-6">
        <h1 className="text-2xl font-semibold mb-4">My Assets</h1>

        <form onSubmit={onAdd} className="flex items-center gap-3 mb-6">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Add ticker (e.g., AAPL)"
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 outline-none w-64"
            maxLength={10}
            pattern="[A-Za-z.\-]+"
            title="Only letters, dots or dashes"
          />
          <button
            disabled={busy || !input.trim()}
            className="px-4 py-2 rounded-xl bg-white/10 border border-white/10 hover:bg-white/20 disabled:opacity-50"
          >
            {busy ? 'Saving…' : 'Add'}
          </button>
        </form>

        {error && <div className="text-red-300 text-sm mb-4">Error: {error}</div>}

        <div className="card p-0 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <div className="text-base font-semibold">
              Favorites {loading && <span className="opacity-60 text-sm ml-2">loading…</span>}
            </div>
            <div className="text-xs opacity-70">{tickers.length} tickers</div>
          </div>

          {tickers.length === 0 ? (
            <div className="p-6 opacity-80">No favorites yet. Add a ticker above.</div>
          ) : (
            <ul className="divide-y divide-white/5">
              {rows.map(({ symbol, price, changePct, change }) => {
                const up = (changePct ?? 0) >= 0
                return (
                  <li key={symbol} className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center font-semibold">
                        {symbol.slice(0,4)}
                      </div>
                      <div>
                        <div className="font-medium">{symbol}</div>
                        <div className="text-xs opacity-70">
                          {price != null ? `$${price.toFixed(2)}` : '—'}
                          {changePct != null && (
                            <span className={up ? 'text-emerald-400 ml-2' : 'text-rose-400 ml-2'}>
                              {up ? '▲' : '▼'} {changePct.toFixed(2)}%
                              {change != null && <> ({up ? '+' : ''}{change.toFixed(2)})</>}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => remove(symbol)}
                      className="text-xs px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10"
                    >
                      Remove
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </main>
  )
}
