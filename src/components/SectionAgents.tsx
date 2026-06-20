import { motion, type Variants } from 'framer-motion'

const agents = [
  {
    name: 'Steuerberater',
    description: 'KI-gestützter Steuerassistent — Belege scannen, MwSt-Fragen beantworten, Rechnungen prüfen.',
    href: '/app',
    tag: 'Steuer & Buchhaltung',
  },
  {
    name: 'Sales-Agent',
    description: 'Automatisches Lead-Management — KI sendet personalisierte Follow-up-E-Mails an Tag 1, 3 und 7.',
    href: '/sales',
    tag: 'Vertrieb & CRM',
  },
]

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const } },
}

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
          <p className="mb-12" style={{ fontSize: '14px', color: 'rgba(255,255,255,0.38)' }}>
            {agents.length} aktive Agenten im Einsatz.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="grid md:grid-cols-2 gap-4"
        >
          {agents.map(({ name, description, href, tag }, i) => (
            <motion.a
              key={name}
              href={href}
              variants={cardVariants}
              whileHover={{ scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="relative overflow-hidden flex flex-col p-7 group"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, #0f0f0f 60%)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '6px',
              }}
            >
              {/* Scan-line sweep on hover */}
              <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'linear-gradient(90deg, transparent 0%, rgba(0,255,255,0.06) 50%, transparent 100%)',
                  x: '-100%',
                }}
                whileHover={{ x: '200%' }}
                transition={{ duration: 0.6, ease: 'easeInOut' }}
              />

              {/* Glow top-left corner accent */}
              <div
                className="absolute top-0 left-0 w-24 h-24 pointer-events-none"
                style={{
                  background: 'radial-gradient(circle at top left, rgba(0,255,255,0.08), transparent 70%)',
                }}
              />

              {/* Header row */}
              <div className="flex items-center justify-between mb-4 relative">
                <span
                  className="font-mono text-[9px] uppercase tracking-[2px] px-2 py-0.5"
                  style={{
                    color: 'rgba(0,255,255,0.55)',
                    border: '1px solid rgba(0,255,255,0.15)',
                    borderRadius: '2px',
                  }}
                >
                  {tag}
                </span>

                {/* Pulsing live dot */}
                <span className="flex items-center gap-1.5">
                  <motion.span
                    className="block w-1.5 h-1.5 rounded-full"
                    style={{ background: '#00ffcc' }}
                    animate={{ opacity: [1, 0.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: i * 0.4 }}
                  />
                  <span className="font-mono text-[9px]" style={{ color: 'rgba(0,255,204,0.55)', letterSpacing: '1px' }}>AKTIV</span>
                </span>
              </div>

              {/* Agent index */}
              <p className="font-mono mb-1 relative" style={{ fontSize: '10px', color: 'rgba(0,255,255,0.25)' }}>
                AGENT_{String(i + 1).padStart(2, '0')}
              </p>

              {/* Name */}
              <h3
                className="font-extrabold text-white mb-2 relative"
                style={{ fontSize: '22px', letterSpacing: '-0.5px' }}
              >
                {name}
              </h3>

              {/* Description */}
              <p className="relative flex-1" style={{ fontSize: '12px', color: 'rgba(255,255,255,0.38)', lineHeight: 1.7 }}>
                {description}
              </p>

              {/* Footer */}
              <div className="flex items-center gap-2 mt-6 relative">
                <span style={{ fontSize: '11px', color: 'rgba(0,255,255,0.6)', fontWeight: 700, letterSpacing: '0.5px' }}>
                  Öffnen
                </span>
                <motion.span
                  style={{ color: 'rgba(0,255,255,0.6)', fontSize: '13px' }}
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut', delay: i * 0.3 }}
                >
                  →
                </motion.span>
              </div>
            </motion.a>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
