import { motion } from 'framer-motion'

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.85, delay: i * 0.13, ease: [0.16, 1, 0.3, 1] },
  }),
}

export default function SectionHero() {
  return (
    <section
      className="hero-section relative flex flex-col justify-center px-8 md:px-20"
      style={{ minHeight: '100dvh', background: 'transparent', pointerEvents: 'none' }}
    >
      <motion.div
        style={{ pointerEvents: 'auto', maxWidth: 580 }}
        initial="hidden"
        animate="show"
      >
        <motion.div
          custom={0}
          variants={fadeUp}
          style={{
            fontSize: '0.7rem',
            fontFamily: 'var(--font-mono)',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: '#00ffff',
            opacity: 0.7,
            marginBottom: 24,
          }}
        >
          ◆ Runly Studio
        </motion.div>

        <motion.h1
          custom={1}
          variants={fadeUp}
          style={{
            fontSize: 'clamp(2.8rem, 6vw, 4.8rem)',
            fontWeight: 900,
            lineHeight: 1.06,
            letterSpacing: '-0.03em',
            color: '#fff',
            margin: '0 0 28px',
            textShadow: '0 4px 50px rgba(0,5,20,0.95)',
          }}
        >
          Deine Website.<br />
          <span style={{ color: '#00ffff', textShadow: '0 0 50px rgba(0,255,255,0.4)' }}>
            Professionell.
          </span>
          <br />Bezahlbar.
        </motion.h1>

        <motion.p
          custom={2}
          variants={fadeUp}
          style={{
            fontSize: '1rem',
            color: 'rgba(255,255,255,0.48)',
            lineHeight: 1.7,
            maxWidth: 400,
            margin: '0 0 36px',
            textShadow: '0 2px 12px rgba(0,0,0,0.9)',
          }}
        >
          Wir helfen lokalen Unternehmen, online sichtbar zu werden — mit Webseiten, die wirklich funktionieren.
        </motion.p>

        <motion.div custom={3} variants={fadeUp} style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <a href="#kontakt" style={{
            background: '#00ffff',
            color: '#020d14',
            fontWeight: 800,
            fontSize: '0.88rem',
            padding: '13px 28px',
            borderRadius: 40,
            textDecoration: 'none',
            boxShadow: '0 0 28px rgba(0,255,255,0.22)',
          }}>
            Kostenfreies Gespräch
          </a>
          <a href="#leistungen" style={{
            border: '1px solid rgba(0,255,255,0.25)',
            color: 'rgba(255,255,255,0.6)',
            fontWeight: 600,
            fontSize: '0.88rem',
            padding: '13px 28px',
            borderRadius: 40,
            textDecoration: 'none',
            backdropFilter: 'blur(4px)',
          }}>
            Leistungen
          </a>
        </motion.div>
      </motion.div>

      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: 220,
        background: 'linear-gradient(to bottom, transparent, #020d14)',
        pointerEvents: 'none',
        zIndex: 1,
      }} />
    </section>
  )
}
