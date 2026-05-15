import { motion } from 'framer-motion'
import { ExternalLink } from 'lucide-react'

export default function SectionPortfolio() {
  return (
    <section id="portfolio" className="py-24 bg-dark">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-purple-400 text-sm font-semibold uppercase tracking-widest mb-3">Portfolio</p>
          <h2 className="text-4xl font-extrabold text-white mb-16">Unsere Arbeit</h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="border border-dark-200 rounded-2xl overflow-hidden bg-dark-100 hover:border-purple-600/40 transition-colors"
        >
          <div className="aspect-video bg-dark-200 overflow-hidden">
            <img
              src="/remcosmetics-preview.png"
              alt="remcosmetics Website Vorschau"
              className="w-full h-full object-cover object-top"
            />
          </div>
          <div className="p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-white mb-1">remcosmetics</h3>
              <p className="text-white/60 text-sm">Kosmetikstudio · Mainburg, Bayern</p>
              <p className="text-white/50 text-sm mt-2">
                Komplette Website mit Buchungsmodal, Leistungsübersicht und Google Maps — auf Deutsch.
              </p>
            </div>
            <a
              href="https://remcosmetics.de"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 border border-purple-600/50 hover:border-purple-600 text-purple-400 hover:text-purple-300 px-5 py-2.5 rounded-full transition-colors text-sm font-semibold whitespace-nowrap"
            >
              Live ansehen <ExternalLink size={14} />
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
