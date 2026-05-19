import { useState } from 'react'
import { motion } from 'framer-motion'

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(0,255,255,0.12)',
  borderRadius: '4px',
  padding: '12px 16px',
  color: '#fff',
  fontSize: '14px',
  fontFamily: 'Outfit, sans-serif',
  outline: 'none',
}

export default function SectionKontakt() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('sending')
    const form = e.currentTarget
    try {
      const res = await fetch('https://formspree.io/f/YOUR_FORMSPREE_ID', {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      })
      if (res.ok) { setStatus('sent'); form.reset() }
      else setStatus('error')
    } catch {
      setStatus('error')
    }
  }

  return (
    <section id="kontakt" className="py-20 md:py-[88px] px-6 md:px-8">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="font-mono text-[10px] tracking-[2px]" style={{ color: 'rgba(0,255,255,0.45)' }}>05</span>
            <span className="w-8 h-px flex-shrink-0" style={{ background: 'rgba(0,255,255,0.2)' }} />
            <span className="font-mono text-[9px] uppercase tracking-[3px]" style={{ color: 'rgba(0,255,255,0.4)' }}>Kontakt</span>
          </div>
          <h2
            className="font-extrabold text-white mb-12"
            style={{ fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', letterSpacing: '-0.8px', lineHeight: 1.1 }}
          >
            Lassen Sie uns reden
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-[1.2fr_1fr] gap-16 items-start">
          <motion.form
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            onSubmit={handleSubmit}
          >
            <div className="mb-4">
              <label className="block mb-1.5" style={{ fontSize: '11px', color: 'rgba(255,255,255,0.38)', letterSpacing: '0.5px' }}>
                Name *
              </label>
              <input name="name" required style={inputStyle} placeholder="Max Mustermann" />
            </div>
            <div className="mb-4">
              <label className="block mb-1.5" style={{ fontSize: '11px', color: 'rgba(255,255,255,0.38)', letterSpacing: '0.5px' }}>
                E-Mail *
              </label>
              <input name="email" type="email" required style={inputStyle} placeholder="max@beispiel.de" />
            </div>
            <div className="mb-4">
              <label className="block mb-1.5" style={{ fontSize: '11px', color: 'rgba(255,255,255,0.38)', letterSpacing: '0.5px' }}>
                Nachricht
              </label>
              <textarea
                name="nachricht"
                rows={4}
                style={{ ...inputStyle, resize: 'none' }}
                placeholder="Kurze Beschreibung Ihres Projekts..."
              />
            </div>
            <button
              type="submit"
              disabled={status === 'sending' || status === 'sent'}
              className="w-full font-bold transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{
                background: 'rgba(0,255,255,0.1)',
                border: '1px solid rgba(0,255,255,0.35)',
                color: '#00ffff',
                borderRadius: '4px',
                fontSize: '14px',
                padding: '14px',
                cursor: 'pointer',
                fontFamily: 'Outfit, sans-serif',
              }}
            >
              {status === 'sending' ? 'Wird gesendet…' : status === 'sent' ? 'Nachricht gesendet ✓' : 'Nachricht senden →'}
            </button>
            {status === 'error' && (
              <p className="mt-3 text-center" style={{ fontSize: '12px', color: '#f87171' }}>
                Etwas ist schiefgelaufen. Schreiben Sie uns direkt an hallo@runly.de
              </p>
            )}
          </motion.form>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col gap-8 pt-2"
          >
            <div>
              <h4 className="font-semibold mb-1" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>E-Mail</h4>
              <a
                href="mailto:hallo@runly.de"
                className="transition-colors hover:opacity-70"
                style={{ fontSize: '13px', color: 'rgba(255,255,255,0.38)' }}
              >
                hallo@runly.de
              </a>
            </div>
            <div>
              <h4 className="font-semibold mb-1" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>WhatsApp</h4>
              <a
                href="https://wa.me/49XXXXXXXXXX"
                className="transition-colors hover:opacity-70"
                style={{ fontSize: '13px', color: 'rgba(255,255,255,0.38)' }}
              >
                Direkt schreiben →
              </a>
            </div>
            <div
              style={{ border: '1px solid rgba(0,255,255,0.08)', background: 'rgba(0,255,255,0.02)', borderRadius: '4px', padding: '20px' }}
            >
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.38)', lineHeight: '1.6' }}>
                <strong style={{ color: 'rgba(255,255,255,0.6)' }}>Antwortzeit:</strong>{' '}
                Wir melden uns in der Regel innerhalb von 24 Stunden bei Ihnen.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
