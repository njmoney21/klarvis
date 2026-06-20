import { motion } from 'framer-motion'

const projects = [
  {
    name:     'Bistro Koliba',
    url:      'https://koliba-sepia.vercel.app/',
    img:      '/screenshots/koliba.jpg',
    subtitle: 'Restaurant Website',
  },
  {
    name:     'Rem Cosmetics',
    url:      'https://remcosmetics.vercel.app/',
    img:      '/screenshots/remcosmetics.jpg',
    subtitle: 'Beauty & Cosmetics',
  },
  {
    name:     'Runly',
    url:      'https://runly-six.vercel.app/',
    img:      '/screenshots/runly.jpg',
    subtitle: 'Web Agency',
  },
  {
    name:     'La Locanda di Nino',
    url:      'https://lalocandadinino.de/',
    img:      '/screenshots/lalocanda.jpg',
    subtitle: 'Italian Restaurant',
  },
  {
    name:     'Banicki',
    url:      'https://banicki.vercel.app/',
    img:      '/screenshots/banicki.jpg',
    subtitle: 'Garten & Landschaftsbau',
  },
  {
    name:     'Dream Residence Lux',
    url:      'https://dreamresidencelux.vercel.app/',
    img:      '/screenshots/dreamresidencelux.jpg',
    subtitle: 'Luxury Real Estate',
  },
  {
    name:     'Gasthaus Lippnwirt',
    url:      'https://gasthaus-lippnwirt.vercel.app/',
    img:      '/screenshots/gasthaus_lippnwirt.jpg',
    subtitle: 'Traditionelles Gasthaus',
  },
]

export default function SectionGallery() {
  return (
    <section id="gallery" style={{ padding: '48px 32px', boxSizing: 'border-box' }}>
      <div style={{ maxWidth: 1140, margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          style={{ marginBottom: '24px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <span style={{ fontFamily: 'monospace', fontSize: '10px', letterSpacing: '2px', color: 'rgba(0,255,255,0.45)' }}>03</span>
            <span style={{ width: 32, height: 1, background: 'rgba(0,255,255,0.2)', display: 'block' }} />
            <span style={{ fontFamily: 'monospace', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '3px', color: 'rgba(0,255,255,0.4)' }}>Referenzen</span>
          </div>
          <h2 style={{ fontWeight: 800, color: '#fff', fontSize: 'clamp(1.4rem, 2.5vw, 2.2rem)', letterSpacing: '-0.8px', lineHeight: 1.1, margin: 0 }}>
            Unsere Projekte
          </h2>
        </motion.div>

        <main className="gallery-wrapper">
          <div className="hex-grid">
            {projects.map(project => (
              <div
                key={project.url}
                className="hex"
                tabIndex={0}
                role="button"
                onClick={() => window.open(project.url, '_blank', 'noopener')}
                onKeyDown={e => e.key === 'Enter' && window.open(project.url, '_blank', 'noopener')}
              >
                <div className="hex-shape">
                  <img src={project.img} alt={project.name} />
                  <div className="hex-caption">
                    <h3>{project.name}</h3>
                    <p>{project.subtitle}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </section>
  )
}
