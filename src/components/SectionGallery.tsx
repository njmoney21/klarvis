import { motion } from 'framer-motion'

export default function SectionGallery() {
  return (
    <section id="gallery" className="py-20 md:py-[88px] px-6 md:px-8">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="font-mono text-[10px] tracking-[2px]" style={{ color: 'rgba(0,255,255,0.45)' }}>03</span>
            <span className="w-8 h-px flex-shrink-0" style={{ background: 'rgba(0,255,255,0.2)' }} />
            <span className="font-mono text-[9px] uppercase tracking-[3px]" style={{ color: 'rgba(0,255,255,0.4)' }}>Gallery</span>
          </div>
          <h2
            className="font-extrabold text-white mb-12"
            style={{ fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', letterSpacing: '-0.8px', lineHeight: 1.1 }}
          >
            Unsere Arbeit
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-[480px]"
          style={{ border: '1px solid rgba(0,255,255,0.12)', borderRadius: '4px', background: '#020d14', overflow: 'hidden' }}
        >
          {/* Node graph preview */}
          <div style={{ padding: '24px', borderBottom: '1px solid rgba(0,255,255,0.08)' }}>
            <div className="font-mono" style={{ fontSize: '8px', color: 'rgba(0,255,255,0.4)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '16px' }}>
              KI Workflow
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <div style={{ padding: '5px 10px', background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '3px', fontSize: '9px', color: '#86efac', fontWeight: 700, whiteSpace: 'nowrap' }}>
                Twilio Webhook
              </div>
              <div style={{ flex: 1, height: '1px', background: 'rgba(0,255,255,0.2)' }} />
              <div style={{ padding: '5px 10px', background: 'rgba(0,255,255,0.08)', border: '1px solid rgba(0,255,255,0.25)', borderRadius: '3px', fontSize: '9px', color: '#00ffff', fontWeight: 700, whiteSpace: 'nowrap' }}>
                GPT-4o-mini
              </div>
              <div style={{ flex: 1, height: '1px', background: 'rgba(0,255,255,0.2)' }} />
              <div style={{ padding: '5px 10px', background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: '3px', fontSize: '9px', color: '#93c5fd', fontWeight: 700, whiteSpace: 'nowrap' }}>
                WhatsApp Reply
              </div>
            </div>
            <div className="font-mono" style={{ fontSize: '9px', color: 'rgba(255,255,255,0.2)', textAlign: 'center' }}>
              Eingehende Nachricht → KI-Agent → Automatische Antwort
            </div>
          </div>

          {/* Project info */}
          <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px' }}>
              <h3 className="font-bold text-white" style={{ fontSize: '17px' }}>La Locanda di Nino</h3>
              <span className="font-mono" style={{ fontSize: '9px', color: 'rgba(0,255,255,0.5)', letterSpacing: '1px' }}>KI-Agent</span>
            </div>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.42)', lineHeight: '1.6', marginBottom: '16px' }}>
              Vollautomatischer Bestellassistent via WhatsApp — nimmt Bestellungen entgegen, beantwortet Fragen zum Menü, rund um die Uhr.
            </p>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {['n8n', 'GPT-4o-mini', 'Twilio', 'WhatsApp'].map(tag => (
                <span
                  key={tag}
                  style={{
                    background: 'rgba(0,255,255,0.06)',
                    border: '1px solid rgba(0,255,255,0.18)',
                    borderRadius: '3px',
                    padding: '3px 9px',
                    fontSize: '10px',
                    color: 'rgba(0,255,255,0.65)',
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
