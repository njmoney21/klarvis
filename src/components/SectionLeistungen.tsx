import { Globe, Wrench } from 'lucide-react'
import { motion } from 'framer-motion'

const services = [
  {
    Icon: Globe,
    title: 'Website',
    subtitle: 'Einmalige Erstellung',
    description: 'Individuelle, mobilfreundliche Website — von der Konzeption bis zum Launch. Schnell, modern und auf Ihre Kunden zugeschnitten.',
    features: ['Responsives Design', 'Schnelle Ladezeiten', 'SEO-Grundoptimierung', 'Kontaktformular'],
  },
  {
    Icon: Wrench,
    title: 'Wartung & Support',
    subtitle: 'Monatlich kündbar',
    description: 'Wir kümmern uns um Hosting, Sicherheit und Updates — damit Sie sich auf Ihr Geschäft konzentrieren können.',
    features: ['Hosting inklusive', 'Sicherheits-Updates', 'Inhaltspflege', 'Persönlicher Ansprechpartner'],
  },
]

export default function SectionLeistungen() {
  return (
    <section id="leistungen" className="py-24 bg-dark">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-purple-400 text-sm font-semibold uppercase tracking-widest mb-3">Leistungen</p>
          <h2 className="text-4xl font-extrabold text-white mb-16">Was wir anbieten</h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {services.map(({ Icon, title, subtitle, description, features }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className="border border-dark-200 rounded-2xl p-8 bg-dark-100 hover:border-purple-600/40 transition-colors"
            >
              <Icon className="text-purple-400 mb-4" size={32} />
              <h3 className="text-2xl font-bold text-white mb-1">{title}</h3>
              <p className="text-purple-400/70 text-sm mb-4">{subtitle}</p>
              <p className="text-white/60 mb-6 leading-relaxed">{description}</p>
              <ul className="space-y-2">
                {features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-white/70 text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-600 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
