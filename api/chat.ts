/* eslint-disable @typescript-eslint/no-explicit-any */
interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Content-Type', 'application/json')

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const { message, history } = (req.body ?? {}) as { message?: string; history?: ChatMessage[] }
  if (!message) {
    res.status(400).json({ error: 'message required' })
    return
  }

  const apiKey = (process as any).env.ANTHROPIC_API_KEY as string | undefined
  if (!apiKey) {
    res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' })
    return
  }

  const messages = [
    ...(history ?? []).map((m: ChatMessage) => ({ role: m.role, content: m.content })),
    { role: 'user', content: message },
  ]

  const upstream = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system:
        'Du bist ein hilfreicher Steuerberater-Assistent für deutsche Kleinunternehmer. ' +
        'Beantworte Steuerfragen auf Deutsch, klar und verständlich. ' +
        'Weise immer darauf hin, dass deine Antworten keine Rechtsberatung ersetzen.',
      messages,
    }),
  })

  if (!upstream.ok) {
    const err = await upstream.text()
    res.status(upstream.status).json({ error: err })
    return
  }

  const data = (await upstream.json()) as { content: Array<{ type: string; text: string }> }
  const reply = data.content.find((c: { type: string; text: string }) => c.type === 'text')?.text ?? ''

  res.status(200).json({ reply })
}
