import { motion } from 'framer-motion'
import { useState } from 'react'

const projects = [
  {
    name: 'Bistro Koliba',
    url: 'https://koliba-sepia.vercel.app/',
    accent: '#D4A017',
  },
  {
    name: 'Rem Cosmetics',
    url: 'https://remcosmetics.vercel.app/',
    accent: '#f472b6',
  },
  {
    name: 'Runly',
    url: 'https://runly-six.vercel.app/',
    accent: '#00ffff',
  },
  {
    name: 'La Locanda di Nino',
    url: 'https://lalocandadinino.de/',
    accent: '#86efac',
  },
]

// iframe is rendered at 1200×750, then scaled to fill ~540px card width
const IFRAME_W = 1200
const IFRAME_H = 750
const SCALE = 0.45
const PREVIEW_H = Math.round(IFRAME_H * SCALE) // 337px

function ProjectCard({ project, index }: { project: (typeof projects)[0]; index: number }) {
  const [hovered, setHovered] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
      onClick={() => window.open(project.url, '_blank', 'noopener')}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ cursor: 'pointer' }}
    >
      <div
        style={{
          border: `1px solid ${hovered ? project.accent + '55' : 'rgba(0,255,255,0.12)'}`,
          borderRadius: '10px',
          overflow: 'hidden',
          background: '#010b11',
          boxShadow: hovered
            ? `0 0 40px ${project.accent}18, 0 12px 48px rgba(0,0,0,0.6)`
            : '0 4px 28px rgba(0,0,0,0.5)',
          transition: 'border-color 0.3s, box-shadow 0.3s',
        }}
      >
        {/* Chrome bar */}
        <div
          style={{
            background: 'rgba(255,255,255,0.04)',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f57' }} />
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ffbd2e' }} />
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#28c840' }} />
          </div>
          <div
            style={{
              flex: 1,
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '5px',
              padding: '4px 12px',
              fontSize: '10px',
              color: 'rgba(255,255,255,0.35)',
              fontFamily: 'monospace',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {project.url.replace(/https?:\/\//, '')}
          </div>
        </div>

        {/* Iframe preview */}
        <div
          style={{
            position: 'relative',
            height: PREVIEW_H,
            overflow: 'hidden',
          }}
        >
          <iframe
            src={project.url}
            title={project.name}
            loading="lazy"
            tabIndex={-1}
            style={{
              width: IFRAME_W,
              height: IFRAME_H,
              border: 'none',
              transform: `scale(${SCALE})`,
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
              background: hovered ? 'rgba(2,13,20,0.68)' : 'rgba(2,13,20,0)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.25s',
            }}
          >
            <div
              style={{
                opacity: hovered ? 1 : 0,
                transform: hovered ? 'translateY(0)' : 'translateY(8px)',
                transition: 'opacity 0.25s, transform 0.25s',
                padding: '10px 28px',
                border: `1px solid ${project.accent}`,
                borderRadius: '5px',
                color: project.accent,
                fontSize: '12px',
                fontWeight: 700,
                fontFamily: 'monospace',
                letterSpacing: '1.5px',
              }}
            >
              BESUCHEN ↗
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default function SectionGallery() {
  return (
    <section id="gallery" style={{ padding: '80px 32px', boxSizing: 'border-box' }}>
      <div style={{ maxWidth: 1140, margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          style={{ marginBottom: '48px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <span style={{ fontFamily: 'monospace', fontSize: '10px', letterSpacing: '2px', color: 'rgba(0,255,255,0.45)' }}>03</span>
            <span style={{ width: 32, height: 1, background: 'rgba(0,255,255,0.2)', display: 'block' }} />
            <span style={{ fontFamily: 'monospace', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '3px', color: 'rgba(0,255,255,0.4)' }}>Referenzen</span>
          </div>
          <h2
            style={{
              fontWeight: 800,
              color: '#fff',
              fontSize: 'clamp(1.4rem, 2.5vw, 2.2rem)',
              letterSpacing: '-0.8px',
              lineHeight: 1.1,
              margin: 0,
            }}
          >
            Unsere Projekte
          </h2>
        </motion.div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '24px',
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
