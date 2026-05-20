import { useState, useEffect } from 'react'
import type { SalesEmailWithLead } from '../../lib/types'
import { getAllEmails } from '../../lib/salesApi'

export default function EmailLog() {
  const [emails, setEmails] = useState<SalesEmailWithLead[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAllEmails().then(setEmails).finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="p-6 text-center text-sm text-slate-500">Lade E-Mails…</div>
  }

  if (emails.length === 0) {
    return <div className="p-6 text-center text-sm text-slate-500">Noch keine E-Mails gesendet.</div>
  }

  return (
    <div className="p-4">
      <h2 className="text-base font-bold text-slate-100 mb-4">E-Mail-Verlauf</h2>
      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700">
              {['Lead', 'Tag', 'Betreff', 'Gesendet', 'Status'].map(h => (
                <th key={h} className="text-left text-xs text-slate-500 uppercase tracking-wide px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {emails.map(email => (
              <tr key={email.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                <td className="px-4 py-3 text-slate-200 font-medium">{email.lead_name}</td>
                <td className="px-4 py-3 text-slate-400">Tag {email.day_number}</td>
                <td className="px-4 py-3 text-slate-300 max-w-xs truncate">{email.subject}</td>
                <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                  {new Date(email.sent_at).toLocaleDateString('de-DE', {
                    day: '2-digit', month: '2-digit', year: 'numeric',
                    hour: '2-digit', minute: '2-digit',
                  })}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    email.status === 'sent'
                      ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                      : 'bg-red-500/10 text-red-400 border border-red-500/20'
                  }`}>
                    {email.status === 'sent' ? '✓ Gesendet' : '✕ Fehler'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
