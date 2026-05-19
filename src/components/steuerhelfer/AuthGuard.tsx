import { useState, type ReactNode } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/auth'

const STRIPE_LINK = import.meta.env.VITE_STRIPE_PAYMENT_LINK as string | undefined

type Mode = 'login' | 'register' | 'verify'

export default function AuthGuard({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth()
  const [mode, setMode] = useState<Mode>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const switchMode = (next: Mode) => {
    setMode(next)
    setError('')
    setPassword('')
    setConfirmPassword('')
    setCode('')
  }

  // Step 1 of register — send signup + trigger confirmation email with code
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (password !== confirmPassword) { setError('Passwörter stimmen nicht überein.'); return }
    if (password.length < 6) { setError('Passwort muss mindestens 6 Zeichen haben.'); return }
    setBusy(true)
    const { data, error: err } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    })
    setBusy(false)
    if (err) { setError(translateError(err.message)); return }
    // If email confirmation is disabled, Supabase returns a session immediately
    if (data.session) return // onAuthStateChange will handle login
    setMode('verify')
  }

  // Step 2 of register — verify the 6-digit code, then sign in immediately
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    const { error: err } = await supabase.auth.verifyOtp({
      email,
      token: code.trim(),
      type: 'signup',
    })
    if (err) {
      setError('Ungültiger oder abgelaufener Code. Bitte prüfen.')
      setBusy(false)
      return
    }
    // verifyOtp confirmed the email — sign in explicitly so the session is guaranteed
    const { error: loginErr } = await supabase.auth.signInWithPassword({ email, password })
    if (loginErr) setError(`Bestätigt, aber Login fehlgeschlagen: ${loginErr.message}`)
    setBusy(false)
  }

  // Login — email + password, no code ever
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    setBusy(false)
    if (err) setError(err.message) // show raw error so we can debug
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
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 w-full max-w-sm">

          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Runly Steuerberater</h1>
            <p className="text-sm text-gray-500">KI-Assistent für Kleinunternehmer</p>
          </div>

          {/* ── LOGIN ── */}
          {mode === 'login' && (
            <>
              <div className="flex rounded-lg border border-gray-200 p-1 mb-6 bg-gray-50">
                <button className="flex-1 py-1.5 text-sm font-medium rounded-md bg-white text-gray-900 shadow-sm">
                  Anmelden
                </button>
                <button
                  onClick={() => switchMode('register')}
                  className="flex-1 py-1.5 text-sm font-medium rounded-md text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Registrieren
                </button>
              </div>

              <form onSubmit={handleLogin} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">E-Mail</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="max@muster.de"
                    required
                    autoComplete="email"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Passwort</label>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                {error && <p className="text-xs text-red-600">{error}</p>}
                <button
                  type="submit"
                  disabled={busy}
                  className="w-full bg-blue-600 text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {busy ? 'Anmelden...' : 'Anmelden'}
                </button>
              </form>

              <p className="text-center text-xs text-gray-400 mt-4">
                Noch kein Konto?{' '}
                <button onClick={() => switchMode('register')} className="text-blue-600 hover:underline">
                  Jetzt registrieren
                </button>
              </p>
            </>
          )}

          {/* ── REGISTER step 1 ── */}
          {mode === 'register' && (
            <>
              <div className="flex rounded-lg border border-gray-200 p-1 mb-6 bg-gray-50">
                <button
                  onClick={() => switchMode('login')}
                  className="flex-1 py-1.5 text-sm font-medium rounded-md text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Anmelden
                </button>
                <button className="flex-1 py-1.5 text-sm font-medium rounded-md bg-white text-gray-900 shadow-sm">
                  Registrieren
                </button>
              </div>

              <form onSubmit={handleRegister} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Max Mustermann"
                    required
                    autoComplete="name"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">E-Mail</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="max@muster.de"
                    required
                    autoComplete="email"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Passwort</label>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Mindestens 6 Zeichen"
                    required
                    autoComplete="new-password"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Passwort bestätigen</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    autoComplete="new-password"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                {error && <p className="text-xs text-red-600">{error}</p>}
                <button
                  type="submit"
                  disabled={busy}
                  className="w-full bg-blue-600 text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {busy ? 'Konto erstellen...' : 'Konto erstellen'}
                </button>
              </form>

              {STRIPE_LINK && (
                <p className="text-center text-xs text-gray-400 mt-4">
                  Bereits ein Abo?{' '}
                  <button onClick={() => switchMode('login')} className="text-blue-600 hover:underline">
                    Anmelden
                  </button>
                </p>
              )}
            </>
          )}

          {/* ── VERIFY step 2 (only during registration) ── */}
          {mode === 'verify' && (
            <form onSubmit={handleVerify} className="space-y-4">
              <div className="text-center mb-2">
                <div className="text-3xl mb-3">📬</div>
                <p className="text-sm font-medium text-gray-800 mb-1">Code eingeben</p>
                <p className="text-xs text-gray-500">
                  Wir haben einen 6-stelligen Code an <strong>{email}</strong> gesendet.
                  Danach können Sie sich immer nur mit Passwort anmelden.
                </p>
              </div>
              <input
                type="text"
                value={code}
                onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="123456"
                required
                autoComplete="one-time-code"
                inputMode="numeric"
                maxLength={6}
                className="w-full border border-gray-300 rounded-lg px-3 py-3 text-center text-xl font-mono tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {error && <p className="text-xs text-red-600 text-center">{error}</p>}
              <button
                type="submit"
                disabled={busy || code.length < 6}
                className="w-full bg-blue-600 text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {busy ? 'Prüfe...' : 'Bestätigen & Anmelden'}
              </button>
              <button
                type="button"
                onClick={() => switchMode('register')}
                className="w-full text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                Zurück
              </button>
            </form>
          )}

        </div>
      </div>
    )
  }

  return <>{children}</>
}

function translateError(msg: string): string {
  if (msg.includes('Invalid login credentials')) return 'E-Mail oder Passwort falsch.'
  if (msg.includes('Email not confirmed')) return 'E-Mail noch nicht bestätigt. Bitte zuerst registrieren.'
  if (msg.includes('User already registered')) return 'Diese E-Mail ist bereits registriert. Bitte anmelden.'
  if (msg.includes('Password should be')) return 'Passwort muss mindestens 6 Zeichen haben.'
  if (msg.includes('rate limit')) return 'Zu viele Versuche. Bitte kurz warten.'
  return msg
}
