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
      style={{
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
      }}
    >
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          border: `1px solid ${hovered ? project.accent + '55' : 'rgba(0,255,255,0.12)'}`,
          borderRadius: '10px',
          overflow: 'hidden',
          background: '#010b11',
          boxShadow: hovered
            ? `0 0 32px ${project.accent}18, 0 8px 40px rgba(0,0,0,0.5)`
            : '0 4px 24px rgba(0,0,0,0.4)',
          transition: 'border-color 0.3s, box-shadow 0.3s',
          minHeight: 0,
        }}
      >
        {/* Chrome bar */}
        <div
          style={{
            flexShrink: 0,
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
        </div>

        {/* iframe preview */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden', minHeight: 0 }}>
          <iframe
            src={project.url}
            title={project.name}
            loading="lazy"
            tabIndex={-1}
            style={{
              width: '1200px',
              height: '900px',
              border: 'none',
              transform: 'scale(0.355)',
              transformOrigin: 'top left',
              pointerEvents: 'none',
              display: 'block',
            }}
          />
          {/* hover overlay */}
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
    <section
      id="gallery"
      style={{
        height: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        padding: '48px 32px 32px',
        boxSizing: 'border-box',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        style={{ flexShrink: 0, marginBottom: '28px' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
          <span style={{ fontFamily: 'monospace', fontSize: '10px', letterSpacing: '2px', color: 'rgba(0,255,255,0.45)' }}>03</span>
          <span style={{ width: 32, height: 1, background: 'rgba(0,255,255,0.2)', flexShrink: 0, display: 'block' }} />
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
          flex: 1,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gridTemplateRows: '1fr 1fr',
          gap: '20px',
          minHeight: 0,
        }}
      >
        {projects.map((project, i) => (
          <ProjectCard key={project.url} project={project} index={i} />
        ))}
      </div>
    </section>
  )
}
