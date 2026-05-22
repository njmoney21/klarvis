import { motion } from 'framer-motion'

const agents = [
  {
    name: 'Steuerberater',
    description: 'KI-gestützter Steuerassistent — Belege scannen, MwSt-Fragen beantworten, Rechnungen prüfen.',
    href: '/app',
    label: 'Öffnen',
  },
  {
    name: 'Sales-Agent',
    description: 'Automatisches Lead-Management — KI sendet personalisierte Follow-up-E-Mails an Tag 1, 3 und 7.',
    href: '/sales',
    label: 'Öffnen',
  },
]

export default function SectionAgents() {
  return (
    <section id="agenten" className="py-20 md:py-[88px] px-6 md:px-8">
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
            <span className="font-mono text-[9px] uppercase tracking-[3px]" style={{ color: 'rgba(0,255,255,0.4)' }}>KI-Agenten</span>
          </div>
          <h2
            className="font-extrabold text-white mb-3"
            style={{ fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', letterSpacing: '-0.8px', lineHeight: 1.1 }}
          >
            Deine Agenten
          </h2>
          <p className="mb-10" style={{ fontSize: '14px', color: 'rgba(255,255,255,0.38)' }}>
            Alle KI-Agenten, die du bisher erstellt hast.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col gap-3"
        >
          {agents.map(({ name, description, href, label }) => (
            <a
              key={name}
              href={href}
              className="flex items-center justify-between p-6 group transition-colors"
              style={{
                background: '#020d14',
                border: '1px solid rgba(0,255,255,0.1)',
                borderRadius: '4px',
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(0,255,255,0.35)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(0,255,255,0.1)')}
            >
              <div>
                <p className="font-bold text-white mb-1" style={{ fontSize: '15px' }}>{name}</p>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.38)' }}>{description}</p>
              </div>
              <span
                className="flex-shrink-0 ml-6 font-mono text-[11px] px-3 py-1.5 transition-colors"
                style={{
                  color: 'rgba(0,255,255,0.7)',
                  border: '1px solid rgba(0,255,255,0.2)',
                  borderRadius: '3px',
                  letterSpacing: '1px',
                }}
              >
                {label} →
              </span>
            </a>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
