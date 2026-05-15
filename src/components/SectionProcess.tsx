import { motion } from 'framer-motion'

const steps = [
  { number: '01', title: 'Gespräch', description: 'Wir besprechen Ihre Wünsche, Ziele und Zielgruppe — kostenlos und unverbindlich.' },
  { number: '02', title: 'Design & Entwicklung', description: 'Wir entwerfen und bauen Ihre Website — Sie sehen den Fortschritt zu jedem Schritt.' },
  { number: '03', title: 'Launch', description: 'Ihre Website geht online. Wir kümmern uns um Domain, Hosting und alles Technische.' },
]

export default function SectionProcess() {
  return (
    <section className="py-24 bg-dark-100">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-purple-400 text-sm font-semibold uppercase tracking-widest mb-3">Ablauf</p>
          <h2 className="text-4xl font-extrabold text-white mb-16">So funktioniert's</h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-12">
          {steps.map(({ number, title, description }, i) => (
            <motion.div
              key={number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
            >
              <div className="text-6xl font-extrabold text-purple-600/20 mb-4 select-none">{number}</div>
              <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
              <p className="text-white/60 leading-relaxed">{description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
