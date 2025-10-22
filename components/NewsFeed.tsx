'use client'
import { useEffect, useState } from 'react'

type Item = {
  title: string
  url: string
  source?: string
  publishedAt?: string
  image?: string
  summary?: string
}

export default function NewsFeed({ q }: { q?: string }) {
  const [items, setItems] = useState<Item[]>([])
  const [err, setErr] = useState<string | null>(null)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    (async () => {
      try {
        setErr(null)
        const r = await fetch(`/api/news${q ? `?q=${encodeURIComponent(q)}` : ''}`, { cache: 'no-store' })
        const j = await r.json()
        if (!r.ok) throw new Error(j?.detail || j?.error || 'Failed')
        setItems(j.items || [])
      } catch (e: any) {
        setErr(e.message)
      }
    })()
  }, [q])

  return (
    <div className="card p-0 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <h3 className="text-base font-semibold">Market News</h3>
        <button
          onClick={() => setExpanded(v => !v)}
          className="text-xs px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10"
          aria-expanded={expanded}
        >
          {expanded ? 'Collapse' : 'Expand'}
        </button>
      </div>

      {/* Scrollable content; collapsed height matches the stocks column nicely */}
      <div
        className={[
          'relative',
          expanded ? 'max-h-[72vh]' : 'max-h-[560px]', // tweak 560px to match your stock cards exactly
          'overflow-auto thin-scrollbar'
        ].join(' ')}
      >
        <div className="p-4 space-y-3">
          {err && (
            <div className="text-sm text-red-300">
              News error: {err}
            </div>
          )}

          {items.length === 0 && !err && (
            <div className="text-sm opacity-70">No news right now.</div>
          )}

          {items.map((n, i) => (
            <a
              key={i}
              href={n.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-xl hover:bg-white/5 p-3 border border-white/5"
            >
              <div className="flex gap-3">
                {n.image ? (
                  <img
                    src={n.image}
                    alt=""
                    className="w-16 h-16 object-cover rounded-md flex-shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-md bg-white/5 border border-white/10 flex items-center justify-center text-xs opacity-60">
                    News
                  </div>
                )}
                <div className="min-w-0">
                  <div className="text-sm font-medium line-clamp-2">{n.title}</div>
                  <div className="text-xs opacity-70 mt-0.5">
                    {n.source ? `${n.source} • ` : ''}
                    {n.publishedAt ? new Date(n.publishedAt).toLocaleString() : ''}
                  </div>
                  {n.summary && (
                    <div className="text-xs opacity-80 mt-1 line-clamp-2">
                      {n.summary}
                    </div>
                  )}
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* Fade hint when collapsed */}
        {!expanded && items.length > 0 && (
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-black/40 to-transparent" />
        )}
      </div>
    </div>
  )
}
