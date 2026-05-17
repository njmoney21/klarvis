import { useState, type ReactNode } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/auth'

const STRIPE_LINK = import.meta.env.VITE_STRIPE_PAYMENT_LINK as string | undefined

export default function AuthGuard({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setSending(true)
    setError('')
    const { error: err } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: window.location.origin + '/app',
      },
    })
    if (err) setError(err.message)
    else setSent(true)
    setSending(false)
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
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Steuerhelfer</h1>
          <p className="text-sm text-gray-500 mb-6">KI-Assistent für Kleinunternehmer</p>

          {!sent ? (
            <form onSubmit={handleLogin}>
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
                disabled={sending}
                className="w-full bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {sending ? 'Sende...' : 'Anmeldelink senden'}
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
            <div className="text-center">
              <p className="font-medium text-gray-900 mb-2">Link gesendet!</p>
              <p className="text-sm text-gray-600">
                Prüfen Sie Ihre E-Mails bei <strong>{email}</strong> und klicken Sie auf den
                Anmeldelink.
              </p>
            </div>
          )}
        </div>
      </div>
    )
  }

  return <>{children}</>
}
