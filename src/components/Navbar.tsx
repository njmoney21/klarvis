import { useState } from 'react'
import { Menu, X } from 'lucide-react'

const links = [
  { label: 'Leistungen', href: '#leistungen' },
  { label: 'Portfolio', href: '#portfolio' },
  { label: 'Preise', href: '#preise' },
  { label: 'Kontakt', href: '#kontakt' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-dark/90 backdrop-blur border-b border-dark-200">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <a href="#" className="text-white font-extrabold text-xl tracking-tight">
          Klarvis<span className="text-purple-600">.</span>
        </a>

        <div className="hidden md:flex items-center gap-8">
          {links.map(l => (
            <a key={l.href} href={l.href} className="text-sm text-white/70 hover:text-white transition-colors">
              {l.label}
            </a>
          ))}
          <a
            href="#kontakt"
            className="text-sm font-semibold bg-purple-600 hover:bg-purple-600/80 text-white px-4 py-2 rounded-full transition-colors"
          >
            Jetzt anfragen
          </a>
        </div>

        <button className="md:hidden text-white" onClick={() => setOpen(o => !o)} aria-label="Menü">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-dark-100 border-t border-dark-200 px-6 py-4 flex flex-col gap-4">
          {links.map(l => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="text-white/80 hover:text-white text-sm">
              {l.label}
            </a>
          ))}
          <a
            href="#kontakt"
            onClick={() => setOpen(false)}
            className="bg-purple-600 text-white text-sm font-semibold px-4 py-2 rounded-full text-center"
          >
            Jetzt anfragen
          </a>
        </div>
      )}
    </nav>
  )
}
