import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, MessageSquare } from 'lucide-react'

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
    <section id="kontakt" className="py-24 bg-dark">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-purple-400 text-sm font-semibold uppercase tracking-widest mb-3">Kontakt</p>
          <h2 className="text-4xl font-extrabold text-white mb-4">Lassen Sie uns reden</h2>
          <p className="text-white/60 mb-16 max-w-xl">Kostenlose Erstberatung — unverbindlich und unkompliziert.</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-16">
          <motion.form
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm text-white/60 mb-2">Name *</label>
                <input name="name" required className="w-full bg-dark-100 border border-dark-200 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-purple-600 transition-colors" placeholder="Max Mustermann" />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-2">Firma</label>
                <input name="firma" className="w-full bg-dark-100 border border-dark-200 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-purple-600 transition-colors" placeholder="Muster GmbH" />
              </div>
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-2">E-Mail *</label>
              <input name="email" type="email" required className="w-full bg-dark-100 border border-dark-200 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-purple-600 transition-colors" placeholder="max@beispiel.de" />
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-2">Nachricht</label>
              <textarea name="nachricht" rows={4} className="w-full bg-dark-100 border border-dark-200 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-purple-600 transition-colors resize-none" placeholder="Kurze Beschreibung Ihres Projekts..." />
            </div>
            <button
              type="submit"
              disabled={status === 'sending' || status === 'sent'}
              className="w-full bg-purple-600 hover:bg-purple-600/80 disabled:opacity-50 text-white font-semibold py-4 rounded-full transition-colors"
            >
              {status === 'sending' ? 'Wird gesendet…' : status === 'sent' ? 'Nachricht gesendet ✓' : 'Nachricht senden'}
            </button>
            {status === 'error' && (
              <p className="text-red-400 text-sm text-center">
                Etwas ist schiefgelaufen. Schreiben Sie uns direkt an hallo@klarvis.de
              </p>
            )}
          </motion.form>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col gap-8 justify-center"
          >
            <div className="flex items-start gap-4">
              <Mail className="text-purple-400 flex-shrink-0 mt-1" size={22} />
              <div>
                <p className="text-white font-semibold mb-1">E-Mail</p>
                <a href="mailto:hallo@klarvis.de" className="text-white/60 hover:text-purple-400 transition-colors">
                  hallo@klarvis.de
                </a>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <MessageSquare className="text-purple-400 flex-shrink-0 mt-1" size={22} />
              <div>
                <p className="text-white font-semibold mb-1">WhatsApp</p>
                <a href="https://wa.me/49XXXXXXXXXX" className="text-white/60 hover:text-purple-400 transition-colors">
                  Direkt schreiben →
                </a>
              </div>
            </div>
            <div className="border border-dark-200 rounded-2xl p-6 bg-dark-100">
              <p className="text-white/80 text-sm leading-relaxed">
                <span className="text-white font-semibold">Antwortzeit:</span> Wir melden uns in der Regel innerhalb von 24 Stunden bei Ihnen.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
