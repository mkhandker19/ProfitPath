'use client'
import { useState } from 'react'
import NavBar from '@/components/NavBar'

export default function SearchPage() {
  const [symbol, setSymbol] = useState('')
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async () => {
    if (!symbol) return
    setError(null)
    setData(null)
    try {
      const res = await fetch(`/api/ticker/${symbol.toUpperCase()}`)
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to fetch data')
      setData(json)
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black text-white">
      <NavBar variant="app" />
      <div className="max-w-7xl mx-auto p-6 pt-20">
        <h2 className="text-2xl font-semibold mb-4">Stock Symbol Search</h2>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            placeholder="Enter stock symbol (e.g., AAPL)"
            className="input-glass w-full max-w-xs"
          />
          <button onClick={handleSearch} className="btn-primary">
            Search
          </button>
        </div>
        {error && <p className="text-red-400">{error}</p>}
        {data && (
          <div className="card-glass p-6">
            <h3 className="text-xl font-bold">{data.name} ({data.symbol})</h3>
            <p className="text-lg">{data.price ? `$${data.price.toFixed(2)}` : 'Price not available'}</p>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <p className="font-semibold">Open</p>
                <p>{data.open ?? 'N/A'}</p>
              </div>
              <div>
                <p className="font-semibold">High</p>
                <p>{data.high ?? 'N/A'}</p>
              </div>
              <div>
                <p className="font-semibold">Low</p>
                <p>{data.low ?? 'N/A'}</p>
              </div>
              <div>
                <p className="font-semibold">Close</p>
                <p>{data.close ?? 'N/A'}</p>
              </div>
              <div>
                <p className="font-semibold">Volume</p>
                <p>{data.volume?.toLocaleString() ?? 'N/A'}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
