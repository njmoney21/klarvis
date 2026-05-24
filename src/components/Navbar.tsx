import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const links = [
  { label: 'Leistungen', href: '#leistungen' },
  { label: 'Gallery',    href: '#gallery'    },
  { label: 'Preise',     href: '#preise'     },
  { label: 'Kontakt',    href: '#kontakt'    },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-5">
        <a href="#">
          <img src="/logo.png" alt="Runly" style={{ height: '64px', width: 'auto', mixBlendMode: 'screen' }} />
        </a>

        <div className="hidden md:flex items-center gap-7">
          {links.map(l => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm transition-colors"
              style={{ color: 'rgba(255,255,255,0.42)' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.8)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.42)')}
            >
              {l.label}
            </a>
          ))}
          <a
            href="#kontakt"
            className="text-xs font-bold rounded transition-opacity hover:opacity-90"
            style={{
              color: '#00ffff',
              background: 'rgba(0,255,255,0.1)',
              border: '1px solid rgba(0,255,255,0.35)',
              padding: '8px 18px',
            }}
          >
            Anfragen
          </a>
        </div>

        <button
          className="md:hidden transition-colors"
          style={{ color: 'rgba(255,255,255,0.6)' }}
          onClick={() => setOpen(o => !o)}
          aria-label="Menü"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="fixed top-0 left-0 right-0 z-40 md:hidden pt-16"
            style={{
              background: '#020d14',
              borderBottom: '1px solid rgba(0,255,255,0.1)',
            }}
          >
            <div className="flex flex-col gap-5 px-8 py-6">
              {links.map(l => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="text-base transition-colors"
                  style={{ color: 'rgba(255,255,255,0.6)' }}
                >
                  {l.label}
                </a>
              ))}
              <a
                href="#kontakt"
                onClick={() => setOpen(false)}
                className="mt-2 text-sm font-bold text-center py-3 rounded"
                style={{
                  color: '#00ffff',
                  background: 'rgba(0,255,255,0.1)',
                  border: '1px solid rgba(0,255,255,0.35)',
                }}
              >
                Anfragen
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
