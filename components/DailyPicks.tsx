'use client'
import { useState, useEffect } from 'react'

export default function DailyPicks() {
  const [picks, setPicks] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPicks = async () => {
      try {
        const res = await fetch('/api/ai/daily-picks')
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to fetch daily picks')
        setPicks(data.picks || [])
      } catch (err: any) {
        setError(err.message)
      }
    }
    fetchPicks()
  }, [])

  return (
    <div className="card-glass p-6">
      <h3 className="text-xl font-semibold mb-4">AI Daily Picks</h3>
      {error && <p className="text-red-400">{error}</p>}
      <div className="space-y-4">
        {picks.map((pick) => (
          <div key={pick.symbol}>
            <h4 className="font-bold">{pick.symbol}</h4>
            <p className="text-sm text-gray-400">{pick.reason}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
