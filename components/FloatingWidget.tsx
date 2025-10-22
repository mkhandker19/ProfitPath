'use client'

import { useState } from 'react'
import { MessageCircle, X, Loader2 } from 'lucide-react'

export default function FloatingWidget() {
  const [open, setOpen] = useState(false)
  const [symbol, setSymbol] = useState('AAPL')
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<any>(null)

  const fetchQuote = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/quote?symbol=${encodeURIComponent(symbol)}`, { cache: 'no-store' })
      const json = await res.json()
      setData(json)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="glass w-14 h-14 grid place-items-center hover:bg-white/15 transition"
          aria-label="Open quick stock widget"
        >
          <MessageCircle />
        </button>
      )}
      {open && (
        <div className="glass p-4 w-80">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-semibold">Quick Stock Lookup</h4>
            <button onClick={() => setOpen(false)} className="hover:opacity-80" aria-label="Close">
              <X />
            </button>
          </div>
          <div className="flex gap-2 mb-3">
            <input
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              placeholder="e.g., AAPL"
              className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 outline-none"
            />
            <button
              onClick={fetchQuote}
              className="px-3 py-2 rounded-xl bg-white/10 border border-white/10 hover:bg-white/20"
            >
              Go
            </button>
          </div>
          {loading && (
            <div className="flex items-center gap-2 text-sm text-white/80">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading...
            </div>
          )}
          {data && !loading && (
            <div className="text-sm space-y-1">
              <div className="font-mono opacity-80">Ticker: {symbol}</div>
              {'results' in data ? (
                <>
                  <div>Prev Close: <span className="font-semibold">${(data.results?.[0]?.c ?? 0).toFixed(2)}</span></div>
                  <div>High: ${(data.results?.[0]?.h ?? 0).toFixed(2)} • Low: ${(data.results?.[0]?.l ?? 0).toFixed(2)}</div>
                  <div>Volume: {(data.results?.[0]?.v ?? 0).toLocaleString()}</div>
                </>
              ) : (
                <div className="text-red-300">No data found.</div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
