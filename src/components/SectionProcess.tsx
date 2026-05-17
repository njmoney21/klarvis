import { motion } from 'framer-motion'

const steps = [
  { number: '01', title: 'Gespräch', description: 'Wir besprechen Ihre Wünsche, Ziele und Zielgruppe — kostenlos und unverbindlich.' },
  { number: '02', title: 'Design & Entwicklung', description: 'Wir entwerfen und bauen Ihre Website — Sie sehen den Fortschritt zu jedem Schritt.' },
  { number: '03', title: 'Launch', description: 'Ihre Website geht online. Wir kümmern uns um Domain, Hosting und alles Technische.' },
]

export default function SectionProcess() {
  return (
    <section className="py-20 md:py-[88px] px-6 md:px-8">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="font-mono text-[10px] tracking-[2px]" style={{ color: 'rgba(0,255,255,0.45)' }}>02</span>
            <span className="w-8 h-px flex-shrink-0" style={{ background: 'rgba(0,255,255,0.2)' }} />
            <span className="font-mono text-[9px] uppercase tracking-[3px]" style={{ color: 'rgba(0,255,255,0.4)' }}>Ablauf</span>
          </div>
          <h2
            className="font-extrabold text-white mb-12"
            style={{ fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', letterSpacing: '-0.8px', lineHeight: 1.1 }}
          >
            So funktioniert's
          </h2>
        </motion.div>

        <div className="relative grid md:grid-cols-3 gap-10">
          <div
            className="absolute hidden md:block h-px top-[18px] left-0 right-0 pointer-events-none"
            style={{ background: 'linear-gradient(to right, transparent, rgba(0,255,255,0.25), transparent)' }}
          />

          {steps.map(({ number, title, description }, i) => (
            <motion.div
              key={number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
            >
              <div
                className="flex items-center gap-2 font-mono mb-5"
                style={{ fontSize: '10px', color: '#00ffff', letterSpacing: '2px' }}
              >
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#00ffff' }} />
                {number}
              </div>
              <h3 className="text-white font-bold mb-2" style={{ fontSize: '16px' }}>{title}</h3>
              <p className="leading-relaxed" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.38)' }}>
                {description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
