import { useState } from 'react'
import type { SalesLead } from '../../lib/types'

interface Props {
  onClose: () => void
  onSave: (lead: Pick<SalesLead, 'name' | 'email' | 'phone' | 'company' | 'notes'>) => Promise<void>
}

const INPUT = 'w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs text-slate-500 uppercase tracking-wide mb-1">{label}</label>
      {children}
    </div>
  )
}

export default function LeadModal({ onClose, onSave }: Props) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [company, setCompany] = useState('')
  const [phone, setPhone] = useState('')
  const [notes, setNotes] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await onSave({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || null,
        company: company.trim() || null,
        notes: notes.trim() || null,
      })
    } catch {
      setError('Fehler beim Speichern. Bitte erneut versuchen.')
      setBusy(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-sm">
        <h2 className="text-base font-bold text-slate-100 mb-5">Neuen Lead hinzufügen</h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Name *">
              <input type="text" value={name} onChange={e => setName(e.target.value)}
                placeholder="Anna Müller" required className={INPUT} />
            </Field>
            <Field label="Unternehmen">
              <input type="text" value={company} onChange={e => setCompany(e.target.value)}
                placeholder="Müller GmbH" className={INPUT} />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="E-Mail *">
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="anna@firma.de" required className={INPUT} />
            </Field>
            <Field label="Telefon">
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                placeholder="+49 …" className={INPUT} />
            </Field>
          </div>

          <Field label="Notizen (für KI-Personalisierung)">
            <textarea value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="z.B. Interesse an Website-Redesign, Budget ca. 2.000 €…"
              rows={3} className={`${INPUT} resize-none`} />
          </Field>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 bg-slate-700 text-slate-300 text-sm py-2.5 rounded-lg hover:bg-slate-600 transition-colors">
              Abbrechen
            </button>
            <button type="submit" disabled={busy}
              className="flex-1 bg-cyan-500 text-slate-900 text-sm font-bold py-2.5 rounded-lg hover:bg-cyan-400 disabled:opacity-50 transition-colors">
              {busy ? 'Wird gespeichert…' : 'Lead hinzufügen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
