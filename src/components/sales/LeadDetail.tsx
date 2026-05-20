import { useState, useEffect } from 'react'
import type { SalesLead, SalesEmail, LeadStatus } from '../../lib/types'
import { getEmailsForLead } from '../../lib/salesApi'

interface Props {
  lead: SalesLead
  onClose: () => void
  onStatusChange: (id: string, status: LeadStatus) => Promise<void>
}

const STATUS_LABEL: Record<string, string> = {
  new:       '✦ Neu',
  day1_sent: '📧 Tag 1 gesendet',
  day3_sent: '📧 Tag 3 gesendet',
  day7_sent: '📧 Alle 3 gesendet',
  won:       '✓ Gewonnen',
  lost:      '✕ Verloren',
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">{label}</p>
      <p className="text-sm text-slate-300">{value}</p>
    </div>
  )
}

export default function LeadDetail({ lead, onClose, onStatusChange }: Props) {
  const [emails, setEmails] = useState<SalesEmail[]>([])
  const [busy, setBusy] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  useEffect(() => {
    getEmailsForLead(lead.id).then(setEmails).catch(() => {})
  }, [lead.id])

  const handleAction = async (status: LeadStatus) => {
    setActionError(null)
    setBusy(true)
    try {
      await onStatusChange(lead.id, status)
    } catch {
      setActionError('Status konnte nicht geändert werden.')
      setBusy(false)
    }
  }

  const isDecided = lead.status === 'won' || lead.status === 'lost'

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md max-h-[90vh] flex flex-col">
        <div className="flex items-start justify-between p-5 border-b border-slate-700">
          <div>
            <h2 className="text-base font-bold text-slate-100">{lead.name}</h2>
            {lead.company && <p className="text-xs text-slate-500 mt-0.5">{lead.company}</p>}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 bg-slate-900 border border-slate-700 px-2 py-1 rounded-full">
              {STATUS_LABEL[lead.status] ?? lead.status}
            </span>
            <button
              onClick={onClose}
              className="text-slate-500 hover:text-slate-300 transition-colors text-xl leading-none"
              aria-label="Schließen"
            >
              ×
            </button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <InfoField label="E-Mail" value={lead.email} />
            {lead.phone && <InfoField label="Telefon" value={lead.phone} />}
          </div>

          {lead.notes && (
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Notizen</p>
              <p className="text-sm text-slate-300 bg-slate-900 border border-slate-700 rounded-lg p-3">
                {lead.notes}
              </p>
            </div>
          )}

          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wide mb-3">Follow-up Verlauf</p>
            {emails.length === 0 ? (
              <p className="text-xs text-slate-600 italic">Noch keine E-Mails gesendet.</p>
            ) : (
              <div className="space-y-3">
                {emails.map((email, i) => (
                  <div key={email.id} className="flex gap-3">
                    <div className="flex flex-col items-center pt-1">
                      <div className={`w-2 h-2 rounded-full shrink-0 ${email.status === 'sent' ? 'bg-cyan-500' : 'bg-red-500'}`} />
                      {i < emails.length - 1 && <div className="w-px flex-1 bg-slate-700 mt-1" />}
                    </div>
                    <div className="pb-3">
                      <p className="text-xs font-semibold text-slate-200">
                        Tag {email.day_number} — {email.status === 'sent' ? 'Gesendet' : 'Fehlgeschlagen'}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">{email.subject}</p>
                      <p className="text-xs text-slate-600 mt-0.5">
                        {new Date(email.sent_at).toLocaleDateString('de-DE', {
                          day: '2-digit', month: '2-digit', year: 'numeric',
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {!isDecided && (
          <div className="p-4 border-t border-slate-700 flex flex-col gap-2">
            {actionError && (
              <p className="text-xs text-red-400 mb-2">{actionError}</p>
            )}
            <div className="flex gap-2">
              <button
                onClick={() => handleAction('won')}
                disabled={busy}
                className="flex-1 bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 text-sm font-semibold py-2.5 rounded-lg disabled:opacity-50 transition-colors"
              >
                ✓ Gewonnen
              </button>
              <button
                onClick={() => handleAction('lost')}
                disabled={busy}
                className="flex-1 bg-slate-700 text-slate-400 hover:bg-slate-600 text-sm font-semibold py-2.5 rounded-lg disabled:opacity-50 transition-colors"
              >
                ✕ Verloren
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
