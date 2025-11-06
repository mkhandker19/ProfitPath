'use client'
import { useState } from 'react'
import NavBar from '@/components/NavBar'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

export default function SearchPage() {
  const [symbol, setSymbol] = useState('')
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [sentiment, setSentiment] = useState<any>(null)
  const [historical, setHistorical] = useState<any[] | null>(null)

  const handleSearch = async () => {
    if (!symbol) return
    setError(null)
    setData(null)
    setSentiment(null)
    setHistorical(null)

    try {
      const [tickerRes, sentimentRes, historicalRes] = await Promise.all([
        fetch(`/api/ticker/${symbol.toUpperCase()}`),
        fetch(`/api/ai/sentiment/${symbol.toUpperCase()}`),
        fetch(`/api/historical/${symbol.toUpperCase()}`),
      ])

      const tickerData = await tickerRes.json()
      if (!tickerRes.ok) throw new Error(tickerData.error || 'Failed to fetch ticker data')
      setData(tickerData)

      const sentimentData = await sentimentRes.json()
      if (sentimentRes.ok) setSentiment(sentimentData)

      const historicalData = await historicalRes.json()
      if (historicalRes.ok) setHistorical(historicalData.results || [])

    } catch (err: any) {
      setError(err.message)
    }
  }

  const sentimentColor = () => {
    if (!sentiment) return 'text-gray-400'
    if (sentiment.score > 0.5) return 'text-green-400'
    if (sentiment.score < -0.5) return 'text-red-400'
    return 'text-yellow-400'
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
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold">{data.name} ({data.symbol})</h3>
                <p className="text-lg">{data.price ? `$${data.price.toFixed(2)}` : 'Price not available'}</p>
              </div>
              {sentiment && (
                <div className="text-right">
                  <p className="font-semibold">AI Sentiment</p>
                  <p className={sentimentColor()}>{sentiment.sentiment}</p>
                </div>
              )}
            </div>

            {historical && (
              <div className="mt-6">
                <h4 className="font-semibold mb-2">Historical Performance (1Y)</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={historical}>
                    <XAxis dataKey="t" tickFormatter={(ts) => new Date(ts).toLocaleDateString()} />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="c" stroke="#8884d8" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

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
