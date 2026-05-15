import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

const tiers = [
  {
    name: 'Website',
    price: '499',
    period: 'einmalig',
    description: 'Ihre professionelle Website — einmalig erstellt, launch-ready.',
    features: [
      'Individuelles Design',
      'Mobilfreundlich (Responsive)',
      'Bis zu 5 Unterseiten',
      'Kontaktformular',
      'SEO-Grundoptimierung',
      'Launch & Einrichtung inklusive',
    ],
    cta: 'Website anfragen',
    highlight: false,
  },
  {
    name: 'Wartung & Support',
    price: '37,99',
    period: 'pro Monat',
    description: 'Wir kümmern uns um alles — Sie konzentrieren sich aufs Geschäft.',
    features: [
      'Hosting inklusive',
      'SSL-Zertifikat',
      'Sicherheits-Updates',
      'Inhaltspflege (bis 2h/Mo)',
      'Technischer Support',
      'Monatlich kündbar',
    ],
    cta: 'Wartung hinzufügen',
    highlight: true,
  },
]

export default function SectionPreise() {
  return (
    <section id="preise" className="py-24 bg-dark-100">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-purple-400 text-sm font-semibold uppercase tracking-widest mb-3">Preise</p>
          <h2 className="text-4xl font-extrabold text-white mb-4">Transparent & fair</h2>
          <p className="text-white/60 mb-16 max-w-xl">Keine versteckten Kosten. Kein Kleingedrucktes.</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-3xl">
          {tiers.map(({ name, price, period, description, features, cta, highlight }, i) => (
            <motion.div
              key={name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className={`rounded-2xl p-8 flex flex-col ${
                highlight
                  ? 'bg-purple-600/10 border-2 border-purple-600'
                  : 'bg-dark border border-dark-200'
              }`}
            >
              <h3 className="text-xl font-bold text-white mb-2">{name}</h3>
              <div className="flex items-end gap-2 mb-2">
                <span className="text-4xl font-extrabold text-white">{price} €</span>
                <span className="text-white/50 text-sm mb-1">{period}</span>
              </div>
              <p className="text-white/60 text-sm mb-6 leading-relaxed">{description}</p>
              <ul className="space-y-3 mb-8 flex-1">
                {features.map(f => (
                  <li key={f} className="flex items-start gap-3 text-white/70 text-sm">
                    <Check size={16} className="text-purple-400 flex-shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href="#kontakt"
                className={`text-center font-semibold py-3 px-6 rounded-full transition-colors text-sm ${
                  highlight
                    ? 'bg-purple-600 hover:bg-purple-600/80 text-white'
                    : 'border border-white/20 hover:border-white/50 text-white/80 hover:text-white'
                }`}
              >
                {cta}
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
