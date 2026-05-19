import { useState, type ReactNode } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/auth'

const STRIPE_LINK = import.meta.env.VITE_STRIPE_PAYMENT_LINK as string | undefined

export default function AuthGuard({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth()
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [step, setStep] = useState<'email' | 'code'>('email')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setBusy(true)
    setError('')
    const { error: err } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    })
    if (err) setError(err.message)
    else setStep('code')
    setBusy(false)
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code) return
    setBusy(true)
    setError('')
    const { error: err } = await supabase.auth.verifyOtp({
      email,
      token: code.trim(),
      type: 'email',
    })
    if (err) setError('Ungültiger Code. Bitte nochmals prüfen.')
    setBusy(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-sm text-gray-400">Wird geladen...</p>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 w-full max-w-sm">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Runly Steuerberater</h1>
          <p className="text-sm text-gray-500 mb-6">KI-Assistent für Kleinunternehmer</p>

          {step === 'email' ? (
            <form onSubmit={handleSendCode}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                E-Mail-Adresse
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="max@muster.de"
                required
                autoComplete="email"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
              <button
                type="submit"
                disabled={busy}
                className="w-full bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {busy ? 'Sende...' : 'Code senden'}
              </button>
              {STRIPE_LINK && (
                <p className="text-center text-xs text-gray-400 mt-4">
                  Noch kein Konto?{' '}
                  <a href={STRIPE_LINK} className="text-blue-600 hover:underline">
                    Jetzt abonnieren
                  </a>
                </p>
              )}
            </form>
          ) : (
            <form onSubmit={handleVerifyCode}>
              <p className="text-sm text-gray-600 mb-4">
                Wir haben einen 6-stelligen Code an <strong>{email}</strong> gesendet.
                Geben Sie ihn hier ein — kein Link nötig.
              </p>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bestätigungscode
              </label>
              <input
                type="text"
                value={code}
                onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="123456"
                required
                autoComplete="one-time-code"
                inputMode="numeric"
                maxLength={6}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500 tracking-widest text-center text-lg font-mono"
              />
              {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
              <button
                type="submit"
                disabled={busy || code.length < 6}
                className="w-full bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {busy ? 'Prüfe...' : 'Anmelden'}
              </button>
              <button
                type="button"
                onClick={() => { setStep('email'); setCode(''); setError('') }}
                className="w-full mt-2 text-sm text-gray-400 hover:text-gray-600 transition-colors"
              >
                Andere E-Mail verwenden
              </button>
            </form>
          )}
        </div>
      </div>
    )
  }

  return <>{children}</>
}
