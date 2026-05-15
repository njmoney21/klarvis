import { motion } from 'framer-motion'

export default function SectionHero() {
  return (
    <section
      className="min-h-screen flex items-center pt-16"
      style={{ background: 'linear-gradient(160deg, #2e0854 0%, #0a0a0a 60%)' }}
    >
      <div className="max-w-6xl mx-auto px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <p className="text-purple-400 text-sm font-semibold uppercase tracking-widest mb-6">
            Mainburg · Ingolstadt · Bayern
          </p>
          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight text-white mb-6">
            Ihre Website.<br />
            <span className="text-purple-400">Professionell</span> &amp; lokal.
          </h1>
          <p className="text-white/60 text-lg md:text-xl max-w-xl mb-10">
            Wir bauen moderne Websites für lokale Unternehmen in Bayern — schnell, mobilfreundlich und zu einem fairen Preis.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="#kontakt"
              className="inline-block bg-purple-600 hover:bg-purple-600/80 text-white font-semibold px-8 py-4 rounded-full transition-colors text-center"
            >
              Kostenlos anfragen →
            </a>
            <a
              href="#preise"
              className="inline-block border border-white/20 hover:border-white/50 text-white/70 hover:text-white font-semibold px-8 py-4 rounded-full transition-colors text-center"
            >
              Preise ansehen
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
