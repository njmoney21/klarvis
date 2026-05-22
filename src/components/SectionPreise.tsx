import { motion } from 'framer-motion'
import { useState } from 'react'
import CardScanner from './CardScanner'
import { fadeUp, fadeLeft, stagger, viewport } from '../lib/animations'

const tiers = [
  {
    name: 'Starter',
    price: '499',
    priceLabel: 'einmalig',
    monthly: '+€49/Monat Wartung',
    badge: null,
    description: 'Perfekt für kleine Unternehmen, die eine saubere, schnelle Online-Präsenz brauchen.',
    features: [
      'Bis zu 5 Seiten',
      'Mobile Responsive Design',
      'Basis SEO-Setup',
      'Kontaktformular',
      'Monatliche Content-Updates',
      'Uptime-Monitoring',
    ],
    cta: 'Jetzt starten',
    highlight: false,
  },
  {
    name: 'Business',
    price: '1.200',
    priceLabel: 'einmalig',
    monthly: '+€99/Monat Wartung',
    badge: 'Beliebteste Wahl',
    description: 'Für wachsende Unternehmen, die mehr Seiten, Integrationen und Performance brauchen.',
    features: [
      'Bis zu 15 Seiten',
      'Custom Animationen & Interaktionen',
      'Advanced SEO + Analytics',
      'CMS Integration (Blog, News)',
      '3rd-Party Integrationen (CRM, Booking)',
      'Priority Support',
      'Zweiwöchentliche Updates',
    ],
    cta: 'Jetzt starten',
    highlight: true,
  },
  {
    name: 'Pro',
    price: 'Custom',
    priceLabel: 'auf Anfrage',
    monthly: 'Monatlicher Retainer inklusive',
    badge: null,
    description: 'Komplette Web-Präsenz für etablierte Unternehmen mit komplexen Anforderungen.',
    features: [
      'Unbegrenzte Seiten',
      'Custom Design System',
      'E-Commerce-ready',
      'Mehrsprachige Unterstützung',
      'Persönlicher Account Manager',
      'Monatliche Strategiegespräche',
      'Wöchentliche Updates & Reporting',
    ],
    cta: "Let's talk",
    highlight: false,
  },
]

const addons = [
  {
    id: 'chat',
    name: 'Chat-Agent',
    description: '24/7 KI-Assistent auf Ihrer Website beantwortet Fragen und qualifiziert Leads.',
    price: 49,
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    id: 'email',
    name: 'E-Mail Automatisierung',
    description: 'Automatisch antworten, weiterleiten und nachverfolgen — intelligent.',
    price: 59,
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    ),
  },
  {
    id: 'booking',
    name: 'Buchungsassistent',
    description: 'KI übernimmt Terminplanung, Erinnerungen und Kalenderverwaltung.',
    price: 69,
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    id: 'reporting',
    name: 'Reporting Dashboard',
    description: 'KI-generierte Wochenberichte zu Traffic, Leads und Performance.',
    price: 79,
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
  {
    id: 'workflow',
    name: 'Workflow-Automatisierung',
    description: 'Verbinden Sie Ihre Tools und automatisieren Sie repetitive Prozesse.',
    price: 89,
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <polyline points="17 1 21 5 17 9" />
        <path d="M3 11V9a4 4 0 0 1 4-4h14" />
        <polyline points="7 23 3 19 7 15" />
        <path d="M21 13v2a4 4 0 0 1-4 4H3" />
      </svg>
    ),
  },
  {
    id: 'sales',
    name: 'Sales-Agent',
    description: 'KI verfolgt Leads nach, sendet Angebote und pflegt Interessenten.',
    price: 99,
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
      </svg>
    ),
  },
]

export default function SectionPreise() {
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const toggle = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const total = addons.filter(a => selected.has(a.id)).reduce((sum, a) => sum + a.price, 0)

  return (
    <section id="preise" className="py-20 md:py-[88px] px-6 md:px-8">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <motion.div
          variants={fadeLeft}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          style={{ marginBottom: '40px' }}
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="font-mono text-[10px] tracking-[2px]" style={{ color: 'rgba(0,255,255,0.45)' }}>04</span>
            <span className="w-8 h-px flex-shrink-0" style={{ background: 'rgba(0,255,255,0.2)' }} />
            <span className="font-mono text-[9px] uppercase tracking-[3px]" style={{ color: 'rgba(0,255,255,0.4)' }}>Website Pakete</span>
          </div>
          <h2
            className="font-extrabold text-white"
            style={{ fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', letterSpacing: '-0.8px', lineHeight: 1.1, marginBottom: '10px' }}
          >
            Wähle deinen Startpunkt
          </h2>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.38)' }}>
            Jedes Paket beinhaltet Hosting, SSL und monatliche Wartung.
          </p>
        </motion.div>

        {/* Pricing cards */}
        <motion.div
          variants={stagger(0.15)}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          className="grid md:grid-cols-3"
          style={{ gap: '16px', marginBottom: '72px' }}
        >
          {tiers.map(({ name, price, priceLabel, monthly, badge, description, features, cta, highlight }) => (
            <motion.div
              variants={fadeUp}
              key={name}
              className="flex flex-col relative"
              style={{
                background: '#020d14',
                border: `1px solid ${highlight ? 'rgba(0,255,255,0.35)' : 'rgba(0,255,255,0.1)'}`,
                borderRadius: '8px',
                padding: '28px 24px',
                boxShadow: highlight ? '0 0 32px rgba(0,255,255,0.06)' : undefined,
              }}
            >
              {badge && (
                <div
                  style={{
                    position: 'absolute',
                    top: -1,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'rgba(0,255,255,0.12)',
                    border: '1px solid rgba(0,255,255,0.3)',
                    borderTop: 'none',
                    borderRadius: '0 0 6px 6px',
                    padding: '3px 14px',
                    fontSize: '10px',
                    fontWeight: 700,
                    color: '#00ffff',
                    fontFamily: 'monospace',
                    letterSpacing: '0.5px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {badge}
                </div>
              )}

              <h3 className="font-bold text-white" style={{ fontSize: '18px', marginBottom: '6px', marginTop: badge ? '12px' : 0 }}>{name}</h3>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.38)', marginBottom: '20px', lineHeight: 1.6 }}>{description}</p>

              <div style={{ marginBottom: '4px' }}>
                <span className="font-black text-white" style={{ fontSize: price === 'Custom' ? '32px' : '40px', letterSpacing: '-1px' }}>
                  {price === 'Custom' ? 'Custom' : `€${price}`}
                </span>
                <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)', marginLeft: '6px' }}>{priceLabel}</span>
              </div>
              <p style={{ fontSize: '12px', color: 'rgba(0,255,255,0.5)', marginBottom: '20px' }}>{monthly}</p>

              <hr style={{ border: 'none', borderTop: '1px solid rgba(0,255,255,0.08)', marginBottom: '20px' }} />

              <ul className="flex flex-col gap-2 flex-1" style={{ marginBottom: '24px' }}>
                {features.map(f => (
                  <li key={f} className="flex items-start gap-2" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.55)', listStyle: 'none' }}>
                    <span style={{ color: '#00ffff', fontWeight: 700, flexShrink: 0, marginTop: '1px' }}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              <a
                href="#kontakt"
                className="block text-center font-bold transition-all"
                style={{
                  fontSize: '13px',
                  padding: '12px 0',
                  borderRadius: '6px',
                  background: highlight ? 'rgba(0,255,255,0.1)' : 'transparent',
                  color: highlight ? '#00ffff' : 'rgba(255,255,255,0.6)',
                  border: highlight ? '1px solid rgba(0,255,255,0.35)' : '1px solid rgba(255,255,255,0.15)',
                }}
              >
                {cta} ↗
              </a>
            </motion.div>
          ))}
        </motion.div>

        {/* AI Add-ons */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="font-mono text-[10px] tracking-[2px]" style={{ color: 'rgba(0,255,255,0.45)' }}>KI</span>
            <span className="w-8 h-px flex-shrink-0" style={{ background: 'rgba(0,255,255,0.2)' }} />
            <span className="font-mono text-[9px] uppercase tracking-[3px]" style={{ color: 'rgba(0,255,255,0.4)' }}>KI Add-ons</span>
          </div>
          <h3
            className="font-extrabold text-white"
            style={{ fontSize: 'clamp(1.3rem, 2.5vw, 2rem)', letterSpacing: '-0.6px', marginBottom: '8px' }}
          >
            Mit KI auf das nächste Level
          </h3>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.38)', marginBottom: '32px' }}>
            Füge KI-Agenten zu jedem Paket hinzu. Kombiniere was dein Unternehmen braucht.
          </p>

          <div className="grid md:grid-cols-3" style={{ gap: '12px', marginBottom: '20px' }}>
            {addons.map(addon => {
              const isSelected = selected.has(addon.id)
              return (
                <button
                  key={addon.id}
                  onClick={() => toggle(addon.id)}
                  style={{
                    background: isSelected ? 'rgba(0,255,255,0.07)' : '#020d14',
                    border: `1px solid ${isSelected ? 'rgba(0,255,255,0.35)' : 'rgba(0,255,255,0.1)'}`,
                    borderRadius: '8px',
                    padding: '20px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'border-color 0.2s, background 0.2s',
                    position: 'relative',
                  }}
                >
                  {/* Checkbox */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 16,
                      right: 16,
                      width: 18,
                      height: 18,
                      borderRadius: '50%',
                      border: `1.5px solid ${isSelected ? '#00ffff' : 'rgba(255,255,255,0.2)'}`,
                      background: isSelected ? '#00ffff' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s',
                      flexShrink: 0,
                    }}
                  >
                    {isSelected && (
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M2 5l2.5 2.5L8 3" stroke="#020d14" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>

                  <div
                    style={{
                      color: isSelected ? '#00ffff' : 'rgba(255,255,255,0.4)',
                      marginBottom: '10px',
                      transition: 'color 0.2s',
                    }}
                  >
                    {addon.icon}
                  </div>
                  <div className="font-bold text-white" style={{ fontSize: '14px', marginBottom: '6px' }}>{addon.name}</div>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.38)', lineHeight: 1.6, marginBottom: '12px' }}>{addon.description}</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: isSelected ? '#00ffff' : 'rgba(255,255,255,0.5)', transition: 'color 0.2s' }}>
                    +€{addon.price}/Mo
                  </div>
                </button>
              )
            })}
          </div>

          {/* Running total bar */}
          <div
            style={{
              background: 'rgba(0,255,255,0.04)',
              border: '1px solid rgba(0,255,255,0.12)',
              borderRadius: '8px',
              padding: '18px 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
            }}
          >
            <div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.38)', marginBottom: '2px' }}>
                Ausgewählte Add-ons monatlich gesamt
              </div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>
                €{total}/Mo
              </div>
              {selected.size === 0 && (
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)' }}>Wähle Add-ons aus um dein Paket zu bauen</div>
              )}
            </div>
            <a
              href="#kontakt"
              style={{
                background: 'rgba(0,255,255,0.1)',
                border: '1px solid rgba(0,255,255,0.3)',
                color: '#00ffff',
                padding: '12px 24px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 700,
                whiteSpace: 'nowrap',
                textDecoration: 'none',
                transition: 'background 0.2s',
              }}
            >
              Angebot anfragen ↗
            </a>
          </div>
        </motion.div>
      </div>

      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={viewport}
        className="mt-16 -mx-6 md:-mx-8"
      >
        <CardScanner />
      </motion.div>
    </section>
  )
}
