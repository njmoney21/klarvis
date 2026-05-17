import { motion } from 'framer-motion'

const services = [
  {
    title: 'Website',
    subtitle: 'Einmalige Erstellung',
    description: 'Individuell, mobilfreundlich und auf Ihre Kunden zugeschnitten — von der Konzeption bis zum Launch.',
    features: ['Responsives Design', 'Schnelle Ladezeiten', 'SEO-Grundoptimierung', 'Kontaktformular'],
    icon: (
      <svg width="16" height="16" fill="none" stroke="#00ffff" strokeWidth="1.5" viewBox="0 0 24 24">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </svg>
    ),
  },
  {
    title: 'Wartung & Support',
    subtitle: 'Monatlich kündbar',
    description: 'Wir kümmern uns um Hosting, Sicherheit und Updates — damit Sie sich auf Ihr Geschäft konzentrieren können.',
    features: ['Hosting inklusive', 'Sicherheits-Updates', 'Inhaltspflege bis 2h/Mo', 'Persönlicher Ansprechpartner'],
    icon: (
      <svg width="16" height="16" fill="none" stroke="#00ffff" strokeWidth="1.5" viewBox="0 0 24 24">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      </svg>
    ),
  },
]

export default function SectionLeistungen() {
  return (
    <section id="leistungen" className="py-20 md:py-[88px] px-6 md:px-8">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="font-mono text-[10px] tracking-[2px]" style={{ color: 'rgba(0,255,255,0.45)' }}>01</span>
            <span className="w-8 h-px flex-shrink-0" style={{ background: 'rgba(0,255,255,0.2)' }} />
            <span className="font-mono text-[9px] uppercase tracking-[3px]" style={{ color: 'rgba(0,255,255,0.4)' }}>Leistungen</span>
          </div>
          <h2
            className="font-extrabold text-white mb-12"
            style={{ fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', letterSpacing: '-0.8px', lineHeight: 1.1 }}
          >
            Was wir anbieten
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="grid md:grid-cols-2 overflow-hidden"
          style={{ gap: '1px', background: 'rgba(0,255,255,0.06)', border: '1px solid rgba(0,255,255,0.1)', borderRadius: '4px' }}
        >
          {services.map(({ title, subtitle, description, features, icon }) => (
            <div
              key={title}
              className="flex flex-col p-9"
              style={{ background: '#020d14' }}
            >
              <div
                className="w-9 h-9 flex items-center justify-center mb-5 flex-shrink-0"
                style={{ background: 'rgba(0,255,255,0.08)', border: '1px solid rgba(0,255,255,0.2)', borderRadius: '4px' }}
              >
                {icon}
              </div>
              <h3 className="text-white font-bold mb-1" style={{ fontSize: '17px' }}>{title}</h3>
              <p className="font-mono mb-3" style={{ fontSize: '11px', color: 'rgba(0,255,255,0.55)', letterSpacing: '1px' }}>
                {subtitle}
              </p>
              <p className="mb-5 leading-relaxed" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.42)' }}>
                {description}
              </p>
              <div className="flex flex-col gap-1.5">
                {features.map(f => (
                  <span key={f} className="flex items-center gap-2" style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
                    <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: '#00ffff' }} />
                    {f}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
