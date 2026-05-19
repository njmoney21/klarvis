import { motion } from 'framer-motion'
import { useState } from 'react'

const projects = [
  {
    name: 'Bistro Koliba',
    category: 'Restaurant · Mainburg',
    url: 'https://koliba-sepia.vercel.app/',
    tags: ['Webdesign', 'Restaurant'],
    accent: '#D4A017',
  },
  {
    name: 'Rem Cosmetics',
    category: 'Beauty & Kosmetik',
    url: 'https://remcosmetics.vercel.app/',
    tags: ['Webdesign', 'Online Shop'],
    accent: '#f472b6',
  },
  {
    name: 'Runly',
    category: 'Webdesign Agentur',
    url: 'https://runly-six.vercel.app/',
    tags: ['Webdesign', 'SaaS'],
    accent: '#00ffff',
  },
  {
    name: 'La Locanda di Nino',
    category: 'Ristorante Italiano',
    url: 'https://lalocandadinino.de/',
    tags: ['Webdesign', 'KI-Agent'],
    accent: '#86efac',
  },
]

function ProjectCard({ project, index }: { project: (typeof projects)[0]; index: number }) {
  const [hovered, setHovered] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.65, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
      style={{ cursor: 'pointer' }}
      onClick={() => window.open(project.url, '_blank', 'noopener')}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Browser window */}
      <div
        style={{
          border: `1px solid ${hovered ? project.accent + '55' : 'rgba(0,255,255,0.12)'}`,
          borderRadius: '10px',
          overflow: 'hidden',
          background: '#010b11',
          boxShadow: hovered
            ? `0 0 32px ${project.accent}18, 0 8px 40px rgba(0,0,0,0.5)`
            : '0 4px 24px rgba(0,0,0,0.4)',
          transition: 'border-color 0.3s, box-shadow 0.3s',
        }}
      >
        {/* Chrome bar */}
        <div
          style={{
            background: 'rgba(255,255,255,0.035)',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            padding: '9px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <div style={{ display: 'flex', gap: '5px', flexShrink: 0 }}>
            <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#ff5f57', opacity: 0.85 }} />
            <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#ffbd2e', opacity: 0.85 }} />
            <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#28c840', opacity: 0.85 }} />
          </div>
          <div
            style={{
              flex: 1,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '5px',
              padding: '3px 10px',
              fontSize: '9px',
              color: 'rgba(255,255,255,0.28)',
              fontFamily: 'monospace',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {project.url.replace(/https?:\/\//, '')}
          </div>
          <div
            style={{
              width: 12,
              height: 12,
              flexShrink: 0,
              opacity: 0.3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg viewBox="0 0 12 12" fill="none" style={{ width: 10, height: 10 }}>
              <path d="M1 6h10M6 1l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'rgba(255,255,255,0.5)' }} />
            </svg>
          </div>
        </div>

        {/* iframe preview */}
        <div
          style={{
            position: 'relative',
            height: '240px',
            overflow: 'hidden',
            background: '#020d14',
          }}
        >
          <iframe
            src={project.url}
            title={project.name}
            loading="lazy"
            tabIndex={-1}
            style={{
              width: '1200px',
              height: '800px',
              border: 'none',
              transform: 'scale(0.355)',
              transformOrigin: 'top left',
              pointerEvents: 'none',
              display: 'block',
            }}
          />
          {/* Hover overlay */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: hovered ? 'rgba(2,13,20,0.72)' : 'rgba(2,13,20,0)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.25s',
            }}
          >
            <div
              style={{
                opacity: hovered ? 1 : 0,
                transform: hovered ? 'translateY(0)' : 'translateY(6px)',
                transition: 'opacity 0.25s, transform 0.25s',
                padding: '9px 22px',
                border: `1px solid ${project.accent}`,
                borderRadius: '5px',
                color: project.accent,
                fontSize: '11px',
                fontWeight: 700,
                fontFamily: 'monospace',
                letterSpacing: '1.5px',
                whiteSpace: 'nowrap',
              }}
            >
              BESUCHEN ↗
            </div>
          </div>
        </div>
      </div>

      {/* Info row */}
      <div style={{ padding: '14px 2px 0' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            gap: '8px',
            marginBottom: '8px',
          }}
        >
          <span
            style={{
              fontSize: '15px',
              fontWeight: 700,
              color: '#fff',
              letterSpacing: '-0.2px',
            }}
          >
            {project.name}
          </span>
          <span
            style={{
              fontSize: '9px',
              color: 'rgba(255,255,255,0.3)',
              fontFamily: 'monospace',
              letterSpacing: '0.5px',
              whiteSpace: 'nowrap',
            }}
          >
            {project.category}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
          {project.tags.map((tag) => (
            <span
              key={tag}
              style={{
                fontSize: '10px',
                padding: '2px 8px',
                border: `1px solid ${project.accent}30`,
                borderRadius: '3px',
                color: project.accent + 'aa',
                background: project.accent + '09',
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

export default function SectionGallery() {
  return (
    <section id="gallery" className="py-20 md:py-[88px] px-6 md:px-8">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          style={{ marginBottom: '52px' }}
        >
          <div className="flex items-center gap-3 mb-4">
            <span
              className="font-mono text-[10px] tracking-[2px]"
              style={{ color: 'rgba(0,255,255,0.45)' }}
            >
              03
            </span>
            <span
              className="w-8 h-px flex-shrink-0"
              style={{ background: 'rgba(0,255,255,0.2)' }}
            />
            <span
              className="font-mono text-[9px] uppercase tracking-[3px]"
              style={{ color: 'rgba(0,255,255,0.4)' }}
            >
              Referenzen
            </span>
          </div>
          <h2
            className="font-extrabold text-white"
            style={{ fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', letterSpacing: '-0.8px', lineHeight: 1.1 }}
          >
            Unsere Projekte
          </h2>
          <p
            style={{
              marginTop: '14px',
              fontSize: '14px',
              color: 'rgba(255,255,255,0.38)',
              maxWidth: '480px',
              lineHeight: 1.7,
            }}
          >
            Echte Websites für echte Unternehmen — klick rein und schau selbst.
          </p>
        </motion.div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: '32px',
          }}
        >
          {projects.map((project, i) => (
            <ProjectCard key={project.url} project={project} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
