import { motion } from 'framer-motion'
import CardScanner from './CardScanner'

const tiers = [
  {
    name: 'Website',
    price: '499',
    originalPrice: '575',
    period: 'einmalig',
    saving: '76 € gespart',
    badge: null,
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
    name: 'KI-Agent',
    price: '999',
    originalPrice: '1.299',
    period: 'einmalig',
    saving: '300 € gespart',
    badge: 'BEST DEAL',
    description: 'Vollautomatischer KI-Assistent — WhatsApp, Bestellungen, Support, rund um die Uhr.',
    features: [
      'Individuelle Automatisierung',
      'WhatsApp / Messenger Integration',
      'GPT-4o-mini powered',
      'n8n Workflow-Setup',
      'Bestellungen & FAQ-Antworten',
      'Launch & Einrichtung inklusive',
    ],
    cta: 'KI-Agent anfragen',
    highlight: true,
  },
  {
    name: 'Wartung & Support',
    price: '49',
    originalPrice: '69',
    period: 'pro Monat',
    saving: '29 % günstiger',
    badge: null,
    description: 'Wir kümmern uns um alles — Sie konzentrieren sich aufs Geschäft.',
    features: [
      'Hosting inklusive',
      'SSL-Zertifikat',
      'Sicherheits-Updates',
      'Inhaltspflege bis 2h/Mo',
      'Technischer Support',
      'Monatlich kündbar',
    ],
    cta: 'Wartung hinzufügen',
    highlight: false,
  },
]

export default function SectionPreise() {
  return (
    <section id="preise" className="py-20 md:py-[88px] px-6 md:px-8">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="font-mono text-[10px] tracking-[2px]" style={{ color: 'rgba(0,255,255,0.45)' }}>04</span>
            <span className="w-8 h-px flex-shrink-0" style={{ background: 'rgba(0,255,255,0.2)' }} />
            <span className="font-mono text-[9px] uppercase tracking-[3px]" style={{ color: 'rgba(0,255,255,0.4)' }}>Preise</span>
          </div>
          <h2
            className="font-extrabold text-white mb-12"
            style={{ fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', letterSpacing: '-0.8px', lineHeight: 1.1 }}
          >
            Transparent &amp; fair
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="grid md:grid-cols-3 overflow-hidden"
          style={{ gap: '1px', background: 'rgba(0,255,255,0.06)', border: '1px solid rgba(0,255,255,0.1)', borderRadius: '4px' }}
        >
          {tiers.map(({ name, price, originalPrice, period, saving, badge, description, features, cta, highlight }) => (
            <div
              key={name}
              className="flex flex-col p-9 relative"
              style={{
                background: highlight ? 'rgba(0,255,255,0.05)' : '#020d14',
              boxShadow: highlight ? 'inset 0 0 0 1px rgba(0,255,255,0.18)' : undefined,
              }}
            >
              {badge && (
                <div
                  className="absolute top-0 right-0 font-mono font-bold"
                  style={{
                    fontSize: '9px',
                    letterSpacing: '2px',
                    background: 'rgba(0,255,255,0.12)',
                    color: '#00ffff',
                    border: '1px solid rgba(0,255,255,0.3)',
                    padding: '5px 12px',
                    borderBottomLeftRadius: '4px',
                  }}
                >
                  {badge}
                </div>
              )}

              <h3 className="font-bold mb-3" style={{ fontSize: '15px', color: 'rgba(255,255,255,0.7)' }}>{name}</h3>

              <div className="flex items-center gap-2 mb-1">
                <span
                  className="font-mono line-through"
                  style={{ fontSize: '13px', color: 'rgba(255,255,255,0.25)', textDecorationColor: 'rgba(255,255,255,0.2)' }}
                >
                  {originalPrice} €
                </span>
                <span
                  className="font-mono font-bold"
                  style={{
                    fontSize: '10px',
                    color: 'rgba(0,255,255,0.7)',
                    background: 'rgba(0,255,255,0.08)',
                    border: '1px solid rgba(0,255,255,0.2)',
                    padding: '2px 7px',
                    borderRadius: '3px',
                    letterSpacing: '0.5px',
                  }}
                >
                  {saving}
                </span>
              </div>

              <div className="mb-4 leading-none">
                <span className="font-black text-white" style={{ fontSize: '42px', letterSpacing: '-2px' }}>
                  {price} €
                </span>
                <span className="ml-2" style={{ fontSize: '14px', color: 'rgba(255,255,255,0.35)' }}>{period}</span>
              </div>

              <p className="mb-6 leading-relaxed" style={{ fontSize: '12px', color: 'rgba(255,255,255,0.38)' }}>
                {description}
              </p>

              <ul className="flex flex-col gap-2 mb-7 flex-1">
                {features.map(f => (
                  <li key={f} className="flex items-center gap-2" style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', listStyle: 'none' }}>
                    <span style={{ color: '#00ffff', fontSize: '11px', fontWeight: 700 }}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              <a
                href="#kontakt"
                className="block text-center font-bold transition-opacity hover:opacity-90"
                style={{
                  fontSize: '13px',
                  padding: '11px 0',
                  borderRadius: '4px',
                  background: highlight ? 'rgba(0,255,255,0.1)' : undefined,
                  color: highlight ? '#00ffff' : 'rgba(255,255,255,0.55)',
                  border: highlight ? '1px solid rgba(0,255,255,0.35)' : '1px solid rgba(255,255,255,0.12)',
                }}
              >
                {cta}
              </a>
            </div>
          ))}
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="mt-16 -mx-6 md:-mx-8"
      >
        <CardScanner />
      </motion.div>
    </section>
  )
}
