import { useState, useEffect, useRef } from 'react'
import { getSettings, upsertSettings } from '../../lib/salesApi'

const INPUT = 'w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500'

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs text-slate-500 uppercase tracking-wide mb-1">
        {label}
        {hint && <span className="normal-case text-slate-600 ml-1">— {hint}</span>}
      </label>
      {children}
    </div>
  )
}

export default function Settings() {
  const [businessName, setBusinessName] = useState('')
  const [businessDescription, setBusinessDescription] = useState('')
  const [replyToEmail, setReplyToEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    getSettings().then(s => {
      if (s) {
        setBusinessName(s.business_name)
        setBusinessDescription(s.business_description)
        setReplyToEmail(s.reply_to_email)
      }
    })
      .catch(() => setError('Einstellungen konnten nicht geladen werden.'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaved(false)
    setBusy(true)
    try {
      await upsertSettings({
        business_name: businessName.trim(),
        business_description: businessDescription.trim(),
        reply_to_email: replyToEmail.trim(),
      })
      setSaved(true)
      timerRef.current = setTimeout(() => setSaved(false), 3000)
    } catch {
      setError('Fehler beim Speichern. Bitte erneut versuchen.')
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return <div className="p-6 text-center text-sm text-slate-500">Lade Einstellungen…</div>
  }

  return (
    <div className="p-4 max-w-lg">
      <h2 className="text-base font-bold text-slate-100 mb-1">Einstellungen</h2>
      <p className="text-xs text-slate-500 mb-5">Diese Informationen werden für die KI-E-Mail-Generierung verwendet.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Unternehmensname *">
          <input type="text" value={businessName} onChange={e => setBusinessName(e.target.value)}
            placeholder="Muster GmbH" required className={INPUT} />
        </Field>

        <Field label="Unternehmensbeschreibung *" hint="Kontext für die KI">
          <textarea value={businessDescription} onChange={e => setBusinessDescription(e.target.value)}
            placeholder="Wir sind eine Agentur für digitales Marketing mit Fokus auf KMUs…"
            required rows={4} className={`${INPUT} resize-none`} />
        </Field>

        <Field label="Antwort-E-Mail *" hint="Wohin sollen Antworten der Leads gehen?">
          <input type="email" value={replyToEmail} onChange={e => setReplyToEmail(e.target.value)}
            placeholder="kontakt@meinefirma.de" required className={INPUT} />
        </Field>

        {error && <p className="text-xs text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={busy}
          className="bg-cyan-500 hover:bg-cyan-400 text-slate-900 text-sm font-bold px-5 py-2.5 rounded-lg disabled:opacity-50 transition-colors"
        >
          {busy ? 'Wird gespeichert…' : saved ? '✓ Gespeichert' : 'Einstellungen speichern'}
        </button>
      </form>
    </div>
  )
}
