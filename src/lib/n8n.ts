import type { ExtractedReceipt, ComplianceResult, ChatMessage } from './types'

const SCAN_URL = import.meta.env.VITE_N8N_SCAN as string
const CHAT_URL = import.meta.env.VITE_N8N_CHAT as string
const INVOICE_URL = import.meta.env.VITE_N8N_INVOICE as string

export async function scanReceipt(base64Image: string): Promise<ExtractedReceipt> {
  const res = await fetch(SCAN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: base64Image }),
  })
  if (!res.ok) throw new Error(`scan-receipt failed: ${res.status}`)
  return res.json() as Promise<ExtractedReceipt>
}

export async function sendChatMessage(
  message: string,
  history: ChatMessage[]
): Promise<string> {
  const res = await fetch(CHAT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history }),
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`chat ${res.status}: ${body}`)
  }

  // n8n can return several shapes — handle them all
  const data = await res.json() as unknown
  if (typeof data === 'string') return data
  if (Array.isArray(data) && data.length > 0) {
    const first = data[0] as Record<string, unknown>
    const text = first.reply ?? first.output ?? first.text ?? first.message ?? first.content
    if (typeof text === 'string') return text
  }
  if (data && typeof data === 'object') {
    const obj = data as Record<string, unknown>
    const text = obj.reply ?? obj.output ?? obj.text ?? obj.message ?? obj.content
    if (typeof text === 'string') return text
  }
  throw new Error('Unbekanntes Antwortformat vom Server')
}

export async function checkInvoice(base64Image: string): Promise<ComplianceResult> {
  const res = await fetch(INVOICE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: base64Image }),
  })
  if (!res.ok) throw new Error(`check-invoice failed: ${res.status}`)
  return res.json() as Promise<ComplianceResult>
}
