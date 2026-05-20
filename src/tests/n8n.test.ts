import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { scanReceipt, sendChatMessage, checkInvoice } from '../lib/n8n'

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn())
})

afterEach(() => {
  vi.unstubAllGlobals()
})

const mockFetch = (body: unknown, ok = true) =>
  (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
    ok,
    status: ok ? 200 : 500,
    json: () => Promise.resolve(body),
    text: () => Promise.resolve(''),
  })

describe('scanReceipt', () => {
  it('posts base64 image and returns extracted receipt', async () => {
    const receipt = { vendor: 'REWE', amount_gross: 23.5 }
    mockFetch(receipt)
    const result = await scanReceipt('abc123')
    expect(fetch).toHaveBeenCalledWith(
      'http://test/scan',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: 'abc123' }),
      })
    )
    expect(result).toEqual(receipt)
  })

  it('throws on non-ok response', async () => {
    mockFetch(null, false)
    await expect(scanReceipt('x')).rejects.toThrow('scan-receipt failed: 500')
  })
})

describe('sendChatMessage', () => {
  it('posts message and history, returns reply string', async () => {
    mockFetch({ reply: 'Der MwSt-Satz für Hopfen beträgt 7%.' })
    const history = [{ role: 'user' as const, content: 'Frage' }, { role: 'assistant' as const, content: 'Antwort' }]
    const reply = await sendChatMessage('Neues', history)
    expect(fetch).toHaveBeenCalledWith(
      '/api/chat',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ message: 'Neues', history }),
      })
    )
    expect(reply).toBe('Der MwSt-Satz für Hopfen beträgt 7%.')
  })

  it('throws on non-ok response', async () => {
    mockFetch(null, false)
    await expect(sendChatMessage('x', [])).rejects.toThrow('chat 500')
  })
})

describe('checkInvoice', () => {
  it('posts base64 image and returns compliance result', async () => {
    const compliance = { is_compliant: false, missing_fields: ['Steuernummer'] }
    mockFetch(compliance)
    const result = await checkInvoice('img64')
    expect(fetch).toHaveBeenCalledWith(
      'http://test/invoice',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ image: 'img64' }),
      })
    )
    expect(result).toEqual(compliance)
  })

  it('throws on non-ok response', async () => {
    mockFetch(null, false)
    await expect(checkInvoice('x')).rejects.toThrow('check-invoice failed: 500')
  })
})
