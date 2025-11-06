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
            You are an expert financial analyst. Your task is to provide a sentiment analysis for the stock symbol ${symbol}.
            Analyze recent news, market trends, and other relevant data to determine the sentiment.
            Return the data in a JSON object with two keys: "sentiment" (a string like "Positive", "Neutral", or "Negative")
            and "score" (a number between -1 and 1).
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
    return NextResponse.json({ error: 'Failed to fetch sentiment from AI' }, { status: 500 })
  }
}
