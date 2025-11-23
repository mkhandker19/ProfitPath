import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function GET() {
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
            You are a witty, expert financial analyst. Your task is to provide three stock picks for the day.
            For each pick, provide a stock symbol and a brief, compelling reason for your choice.
            Return the data in a JSON object with a single key, "picks", which is an array of objects.
            Each object in the array should have two keys: "symbol" and "reason".
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
    return NextResponse.json({ error: 'Failed to fetch daily picks from AI' }, { status: 500 })
  }
}
