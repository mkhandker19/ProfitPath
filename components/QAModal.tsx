'use client'

import { useState } from 'react'
import { Sparkles, X, Loader2 } from 'lucide-react'

export default function QAModal() {
  const [open, setOpen] = useState(false)
  const [question, setQuestion] = useState('Why is AAPL a good investment this month?')
  const [answer, setAnswer] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const ask = async () => {
    setLoading(true)
    setAnswer(null)
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      })
      const json = await res.json()
      setAnswer(json.answer || 'No answer.')
    } catch (e) {
      setAnswer('Error reaching AI service.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="glass px-4 py-2 flex items-center gap-2 hover:bg-white/15 transition"
      >
        <Sparkles className="w-4 h-4" /> Ask AI
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="relative glass w-full max-w-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">AI Q&A</h3>
              <button onClick={() => setOpen(false)} aria-label="Close"><X /></button>
            </div>
            <div className="space-y-3">
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="w-full min-h-[100px] rounded-xl bg-white/5 border border-white/10 p-3"
              />
              <div className="flex items-center gap-2">
                <button onClick={ask} className="px-4 py-2 rounded-xl bg-white/10 border border-white/10 hover:bg-white/20">
                  {loading ? <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Thinking</span> : 'Ask'}
                </button>
                <p className="text-xs opacity-70">We use your question to generate an explanatory answer.</p>
              </div>
              {answer && (
                <div className="card p-4 leading-relaxed whitespace-pre-wrap">{answer}</div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
