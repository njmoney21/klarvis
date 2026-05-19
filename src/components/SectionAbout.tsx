import { motion } from 'framer-motion'

export default function SectionAbout() {
  return (
    <section id="about" className="py-20 md:py-[88px] px-6 md:px-8">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col md:flex-row md:items-center gap-12 md:gap-16"
        >
          {/* Text */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <span className="font-mono text-[10px] tracking-[2px]" style={{ color: 'rgba(0,255,255,0.45)' }}>02</span>
              <span className="w-8 h-px flex-shrink-0" style={{ background: 'rgba(0,255,255,0.2)' }} />
              <span className="font-mono text-[9px] uppercase tracking-[3px]" style={{ color: 'rgba(0,255,255,0.4)' }}>Über uns</span>
            </div>

            <h2
              className="font-extrabold text-white mb-6"
              style={{ fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', letterSpacing: '-0.8px', lineHeight: 1.1 }}
            >
              Wir sind dort,<br />wo Technik wirkt.
            </h2>

            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.8, marginBottom: '16px' }}>
              Wir sind ein kleines Tech-Team mit einem klaren Fokus: digitale Lösungen bauen, die wirklich funktionieren. Ob moderne Website oder maßgeschneiderte Systemlösung — wir denken vom Ergebnis her.
            </p>

            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.8, marginBottom: '28px' }}>
              Neben Webdesign entwickeln wir auch digitale Systeme, die Firmen helfen einfacher und effizienter zu arbeiten — weniger manuelle Prozesse, mehr Überblick, mehr Zeit fürs Wesentliche.
            </p>

            <div className="flex flex-col gap-3">
              {[
                'Websites, die Kunden überzeugen',
                'Systeme, die Arbeit abnehmen',
                'Technologie, die man nicht erklären muss',
              ].map(item => (
                <span
                  key={item}
                  className="flex items-center gap-2"
                  style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}
                >
                  <span
                    className="flex-shrink-0"
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: '#00ffff',
                      boxShadow: '0 0 6px #00ffff88',
                    }}
                  />
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="flex-shrink-0"
            style={{
              width: 220,
              height: 220,
              borderRadius: '50%',
              overflow: 'hidden',
              border: '1px solid rgba(0,255,255,0.2)',
              boxShadow: '0 0 40px rgba(0,255,255,0.08), 0 8px 32px rgba(0,0,0,0.5)',
              alignSelf: 'center',
            }}
          >
            <img
              src="/about-team.png"
              alt="Runly Team"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
