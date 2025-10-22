import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { question } = await req.json() as { question: string }
  if (!question) return NextResponse.json({ error: 'question required' }, { status: 400 })

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY
  if (!OPENAI_API_KEY) return NextResponse.json({ error: 'Server missing OPENAI_API_KEY' }, { status: 500 })

  // Simple REST call to Chat Completions for portability
  const resp = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are an investing assistant. Be clear, brief, and avoid financial advice language.'},
        { role: 'user', content: question }
      ],
      temperature: 0.3
    })
  })

  if (!resp.ok) {
    const err = await resp.text()
    return NextResponse.json({ error: 'OpenAI error', detail: err }, { status: 500 })
  }
  const json = await resp.json()
  const answer = json.choices?.[0]?.message?.content ?? 'No answer.'
  return NextResponse.json({ answer })
}
