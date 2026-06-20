import { motion } from 'framer-motion'
import { fadeLeft, fadeRight, fadeUp, stagger, viewport } from '../lib/animations'

const bullets = [
  'Websites, die Kunden überzeugen',
  'Systeme, die Arbeit abnehmen',
  'Technologie, die man nicht erklären muss',
]

export default function SectionAbout() {
  return (
    <section id="about" className="py-20 md:py-[88px] px-6 md:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center gap-12 md:gap-16">

          <motion.div
            className="flex-1"
            variants={fadeLeft}
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="font-mono text-[10px] tracking-[2px]" style={{ color: 'rgba(255,255,255,0.3)' }}>02</span>
              <span className="w-8 h-px flex-shrink-0" style={{ background: 'rgba(255,255,255,0.12)' }} />
              <span className="font-mono text-[9px] uppercase tracking-[3px]" style={{ color: 'rgba(255,255,255,0.25)' }}>Über uns</span>
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

            <motion.div
              className="flex flex-col gap-3"
              variants={stagger(0.1)}
              initial="hidden"
              whileInView="visible"
              viewport={viewport}
            >
              {bullets.map(item => (
                <motion.span
                  key={item}
                  variants={fadeUp}
                  className="flex items-center gap-2"
                  style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}
                >
                  <span
                    className="flex-shrink-0"
                    style={{ width: 6, height: 6, borderRadius: '50%', background: '#ffffff' }}
                  />
                  {item}
                </motion.span>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            variants={fadeRight}
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
            className="flex-shrink-0"
            style={{
              width: 220,
              height: 220,
              borderRadius: '50%',
              overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.15)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
              alignSelf: 'center',
            }}
          >
            <img
              src="/about-team.png"
              alt="Runly Team"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
