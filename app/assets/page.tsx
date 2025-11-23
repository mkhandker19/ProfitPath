'use client'
import { useState, useEffect } from 'react'
import NavBar from '@/components/NavBar'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { subDays, subMonths, subYears, format } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

function AIReviewModal({ symbol, onClose }: { symbol: string; onClose: () => void }) {
  const [review, setReview] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchReview = async () => {
      try {
        const res = await fetch(`/api/ai/review/${symbol}`)
        const data = await res.json()
        setReview(data.review)
      } catch (error) {
        setReview('Failed to fetch AI review.')
      } finally {
        setLoading(false)
      }
    }
    fetchReview()
  }, [symbol])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    >
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        className="bg-gray-800 p-6 rounded-lg shadow-xl max-w-2xl w-full"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">AI Review for {symbol}</h3>
          <button onClick={onClose}><X size={24} /></button>
        </div>
        {loading ? <p>Loading review...</p> : <p className="whitespace-pre-wrap">{review}</p>}
      </motion.div>
    </motion.div>
  )
}

function HistoricalChart({ symbol, compareSymbol }: { symbol: string; compareSymbol?: string }) {
  const [data, setData] = useState<any[]>([])
  const [compareData, setCompareData] = useState<any[]>([])
  const [timeRange, setTimeRange] = useState('1Y')

  useEffect(() => {
    const fetchData = async (symbol: string, isCompare = false) => {
      if (!symbol) return
      let from: Date
      const to = new Date()
      switch (timeRange) {
        case '1M': from = subMonths(to, 1); break
        case '6M': from = subMonths(to, 6); break
        case '1Y': from = subYears(to, 1); break
        case '5Y': from = subYears(to, 5); break
        default: from = subYears(to, 1)
      }
      const fromDate = format(from, 'yyyy-MM-dd')
      const toDate = format(to, 'yyyy-MM-dd')
      try {
        const res = await fetch(`/api/historical/${symbol}?from=${fromDate}&to=${toDate}`)
        const jsonData = await res.json()
        if (isCompare) {
          setCompareData(jsonData.results || [])
        } else {
          setData(jsonData.results || [])
        }
      } catch (error) {
        console.error('Failed to fetch historical data', error)
      }
    }
    fetchData(symbol)
    if (compareSymbol) {
      fetchData(compareSymbol, true)
    } else {
      setCompareData([])
    }
  }, [symbol, compareSymbol, timeRange])

  const combinedData = data.map((d, i) => ({
    ...d,
    compare: compareData[i]?.c,
  }));

  return (
    <div>
      <div className="flex gap-2 mb-4">
        {['1M', '6M', '1Y', '5Y'].map(range => (
          <button key={range} onClick={() => setTimeRange(range)} className={`btn-secondary ${timeRange === range ? 'bg-blue-500' : ''}`}>
            {range}
          </button>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={combinedData}>
          <XAxis dataKey="t" tickFormatter={(ts) => new Date(ts).toLocaleDateString()} />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="c" name={symbol} stroke="#8884d8" dot={false} />
          {compareSymbol && <Line type="monotone" dataKey="compare" name={compareSymbol} stroke="#82ca9d" dot={false} />}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default function AssetsPage() {
  const [assets, setAssets] = useState<any[]>([])
  const [symbol, setSymbol] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [selectedAsset, setSelectedAsset] = useState<any>(null)
  const [compareAsset, setCompareAsset] = useState<any>(null)
  const [showReviewModal, setShowReviewModal] = useState(false)

  const fetchAssetDetails = async (symbol: string) => {
    try {
      const res = await fetch(`/api/ticker/${symbol}`)
      if (!res.ok) return { symbol, error: 'Failed to fetch details' }
      return res.json()
    } catch {
      return { symbol, error: 'Failed to fetch details' }
    }
  }

  const fetchAssets = async () => {
    try {
      const res = await fetch('/api/assets')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to fetch assets')
      const assetDetails = await Promise.all(
        (data.assets || []).map((s: string) => fetchAssetDetails(s))
      )
      setAssets(assetDetails)
      if (assetDetails.length > 0) {
        setSelectedAsset(assetDetails[0])
      }
    } catch (err: any) {
      setError(err.message)
    }
  }

  useEffect(() => {
    fetchAssets()
  }, [])

  const handleAddAsset = async () => {
    if (!symbol) return
    try {
      const res = await fetch('/api/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol: symbol.toUpperCase() }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to add asset')
      }
      setSymbol('')
      fetchAssets()
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleCompare = (assetToCompare: any) => {
    if (selectedAsset?.symbol === assetToCompare.symbol) {
      setCompareAsset(null)
    } else {
      setCompareAsset(assetToCompare)
    }
  }

  return (
    <main className="min-h-screen">
      <NavBar variant="app" />
      <div className="max-w-7xl mx-auto p-6 pt-20 grid grid-cols-1 md:grid-cols-4 gap-6">
        <aside className="md:col-span-1 space-y-4">
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              placeholder="Add symbol"
              className="input-glass w-full"
            />
            <button onClick={handleAddAsset} className="btn-primary">
              Add
            </button>
          </div>
          <div className="space-y-2">
            {assets.map((asset) => (
              <div key={asset.symbol} className="card-glass p-3">
                <div onClick={() => setSelectedAsset(asset)} className="cursor-pointer">
                  <h4 className="font-bold">{asset.symbol}</h4>
                  <p className="text-sm">{asset.price ? `$${asset.price.toFixed(2)}` : ''}</p>
                </div>
                <button onClick={() => handleCompare(asset)} className={`btn-secondary mt-2 w-full ${compareAsset?.symbol === asset.symbol ? 'bg-green-500' : ''}`}>
                  Compare
                </button>
              </div>
            ))}
          </div>
        </aside>
        <section className="md:col-span-3">
          {selectedAsset && (
            <div className="card-glass p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold">{selectedAsset.name} ({selectedAsset.symbol})</h3>
                  {compareAsset && <span className="text-lg">vs. {compareAsset.name} ({compareAsset.symbol})</span>}
                </div>
                <button onClick={() => setShowReviewModal(true)} className="btn-secondary">AI Review</button>
              </div>
              <p className="text-lg mb-4">{selectedAsset.price ? `$${selectedAsset.price.toFixed(2)}` : 'Price not available'}</p>
              <HistoricalChart symbol={selectedAsset.symbol} compareSymbol={compareAsset?.symbol} />
            </div>
          )}
        </section>
      </div>
      <AnimatePresence>
        {showReviewModal && selectedAsset && (
          <AIReviewModal symbol={selectedAsset.symbol} onClose={() => setShowReviewModal(false)} />
        )}
      </AnimatePresence>
    </main>
  )
}
