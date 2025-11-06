import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function GET(
  req: Request,
  { params }: { params: { symbol: string } }
) {
  const symbol = params.symbol?.toUpperCase()
  if (!symbol) {
    return NextResponse.json({ error: 'Symbol is required' }, { status: 400 })
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: 'Missing OPENAI_API_KEY' }, { status: 500 })
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `
            You are a senior financial analyst providing a detailed review of the stock ${symbol}.
            Your review should be comprehensive, covering the company's background, recent performance,
            strengths, weaknesses, and future outlook. The review should be well-structured and easy to read.
            Return the review as a JSON object with a single key, "review".
          `,
        },
      ],
      response_format: { type: 'json_object' },
    })

    const content = completion.choices[0].message.content
    if (!content) {
      return NextResponse.json({ error: 'No content from AI' }, { status: 500 })
    }

    const data = JSON.parse(content)
    return NextResponse.json(data)
  } catch (error) {
    console.error('OpenAI API error:', error)
    return NextResponse.json({ error: 'Failed to generate AI review' }, { status: 500 })
  }
}
