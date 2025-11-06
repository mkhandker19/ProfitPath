'use client'

import { useState } from 'react'
import { Sparkles, Loader2 } from 'lucide-react'

export default function QAModal() {
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
    <div className="glass w-full max-w-2xl p-6">
      <div className="space-y-3">
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="w-full min-h-[100px] rounded-xl bg-white/5 border border-white/10 p-3"
        />
        <div className="flex items-center gap-2">
          <button onClick={ask} className="px-4 py-2 rounded-xl bg-white/10 border border-white/10 hover:bg-white/20">
            {loading ? <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Thinking</span> : <span className="flex items-center gap-2"><Sparkles className="w-4 h-4" /> Ask</span>}
          </button>
          <p className="text-xs opacity-70">We use your question to generate an explanatory answer.</p>
        </div>
        {answer && (
          <div className="card p-4 leading-relaxed whitespace-pre-wrap">{answer}</div>
        )}
      </div>
    </div>
  )
}
