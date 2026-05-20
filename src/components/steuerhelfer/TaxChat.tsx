import { useRef, useState } from 'react'
import { sendChatMessage } from '../../lib/n8n'
import type { ChatMessage } from '../../lib/types'

const QUICK_QUESTIONS = [
  'Welche Belege brauche ich für Bewirtung?',
  'Was ist der MwSt-Satz für Hopfen?',
  'Wann ist die nächste UStVA fällig?',
]

export default function TaxChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  async function send(text: string) {
    const trimmed = text.trim()
    if (!trimmed || loading) return

    const userMsg: ChatMessage = { role: 'user', content: trimmed }
    const updatedHistory = [...messages, userMsg]
    setMessages(updatedHistory)
    setInput('')
    setLoading(true)

    try {
      const reply = await sendChatMessage(trimmed, messages)
      setMessages([...updatedHistory, { role: 'assistant', content: reply }])
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unbekannter Fehler'
      setMessages([
        ...updatedHistory,
        { role: 'assistant', content: `Verbindungsfehler: ${msg}` },
      ])
    }

    setLoading(false)
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
  }

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 180px)' }}>
      <div className="flex gap-2 mb-3 flex-wrap">
        {QUICK_QUESTIONS.map(q => (
          <button
            key={q}
            onClick={() => send(q)}
            disabled={loading}
            className="text-xs px-3 py-1.5 bg-cyan-500/10 text-cyan-400 rounded-full border border-cyan-500/20 hover:bg-cyan-500/20 disabled:opacity-50 transition-colors"
          >
            {q}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 mb-3">
        {messages.length === 0 && (
          <p className="text-center text-slate-500 py-10 text-sm">
            Stellen Sie Ihre Steuerfrage oder wählen Sie eine Schnellfrage.
          </p>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                m.role === 'user'
                  ? 'bg-cyan-500 text-slate-900 font-medium rounded-br-sm'
                  : 'bg-slate-800 border border-slate-700 text-slate-300 rounded-bl-sm'
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-bl-sm px-4 py-2.5 text-sm text-slate-500">
              Runly Steuerberater schreibt...
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input) } }}
          placeholder="Ihre Frage..."
          disabled={loading}
          className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 disabled:opacity-50"
        />
        <button
          onClick={() => send(input)}
          disabled={loading || !input.trim()}
          className="px-4 py-2.5 bg-cyan-500 text-slate-900 rounded-xl text-sm font-bold disabled:opacity-40 hover:bg-cyan-400 transition-colors"
        >
          Senden
        </button>
      </div>
    </div>
  )
}
