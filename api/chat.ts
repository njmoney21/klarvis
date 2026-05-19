import type { IncomingMessage, ServerResponse } from 'node:http'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface RequestBody {
  message: string
  history: ChatMessage[]
}

type VercelReq = IncomingMessage & { body: RequestBody }

export default async function handler(req: VercelReq, res: ServerResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Content-Type', 'application/json')

  if (req.method !== 'POST') {
    res.writeHead(405)
    res.end(JSON.stringify({ error: 'Method not allowed' }))
    return
  }

  const { message, history } = req.body ?? {}
  if (!message) {
    res.writeHead(400)
    res.end(JSON.stringify({ error: 'message required' }))
    return
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    res.writeHead(500)
    res.end(JSON.stringify({ error: 'ANTHROPIC_API_KEY not configured' }))
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
    res.writeHead(upstream.status)
    res.end(JSON.stringify({ error: err }))
    return
  }

  const data = (await upstream.json()) as { content: Array<{ type: string; text: string }> }
  const reply = data.content.find(c => c.type === 'text')?.text ?? ''

  res.writeHead(200)
  res.end(JSON.stringify({ reply }))
}
