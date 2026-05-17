# Underwater Scene + Cyan Theme Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the particle-swarm Three.js background with an interactive underwater scene, restyle the entire site from purple to cyan/teal, rename Portfolio→Gallery, and add clickable side panels for scene objects.

**Architecture:** All Three.js code stays inline in `index.html` (matching the existing pattern). React components are restyled in-place — no new abstractions, just colour and border-radius token swaps. The side panel is plain HTML/CSS/JS inside `index.html`, above `#root`.

**Tech Stack:** Three.js 0.182.0 (CDN, ES module), React 18, TypeScript, Tailwind v4, Vitest

---

## File Map

| File | Action |
|---|---|
| `src/index.css` | Update CSS vars + body bg + canvas container selector |
| `src/components/Navbar.tsx` | Cyan logo dot, Anfragen button, Portfolio→Gallery link |
| `src/components/SectionHero.tsx` | Remove "Click to evolve" button; update gradient colour |
| `src/components/SectionLeistungen.tsx` | Purple → cyan in all inline styles |
| `src/components/SectionProcess.tsx` | Purple → cyan in all inline styles |
| `src/components/SectionPortfolio.tsx` | Delete this file after Gallery is wired up |
| `src/components/SectionGallery.tsx` | Create: Gallery section with n8n project card, cyan theme |
| `src/components/SectionPreise.tsx` | Purple → cyan in all inline styles + badge + CTA |
| `src/components/SectionKontakt.tsx` | Submit button + label colours → cyan |
| `src/components/Footer.tsx` | Logo dot colour → cyan |
| `src/App.tsx` | Swap SectionPortfolio import → SectionGallery |
| `index.html` | New importmap, new HTML structure, inline style block, Three.js scene script, side panel logic |

---

## Task 1: Update CSS theme variables

**Files:**
- Modify: `src/index.css`

- [ ] **Step 1: Replace the `@theme` block and `:root` variables**

Replace the entire `@theme` and `:root` blocks in `src/index.css`:

```css
@theme {
  --color-cyan-500:  #00ffff;
  --color-cyan-400:  #88ffff;
  --color-teal-700:  #006688;
  --color-dark:      #020d14;
  --color-dark-100:  #03111c;
  --color-dark-200:  #061a28;
  --font-mono: 'JetBrains Mono', monospace;
}

:root {
  --accent:    #00ffff;
  --accent-2:  #88ffff;
  --font-code: 'JetBrains Mono', monospace;
}
```

- [ ] **Step 2: Update body background and canvas container rule**

Replace these two rules in `src/index.css`:

```css
body {
  margin: 0;
  padding: 0;
  background: #020d14;
  color: #e8e8f0;
  font-family: 'Outfit', sans-serif;
  overflow-x: hidden;
}
```

```css
/* Three.js underwater canvas — fixed full-screen background */
#underwater-container canvas {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
  z-index: 0 !important;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/index.css
git commit -m "feat: switch site theme to underwater cyan palette"
```

---

## Task 2: Restyle Navbar

**Files:**
- Modify: `src/components/Navbar.tsx`

- [ ] **Step 1: Swap all purple values to cyan**

Replace the entire contents of `src/components/Navbar.tsx`:

```tsx
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
        <a href="#" className="font-black text-white text-lg tracking-wide">
          Klarvis<span style={{ color: '#00ffff' }}>.</span>
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
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Navbar.tsx
git commit -m "feat: restyle navbar to cyan theme, rename Portfolio to Gallery"
```

---

## Task 3: Cleanup SectionHero

**Files:**
- Modify: `src/components/SectionHero.tsx`

- [ ] **Step 1: Remove button, update gradient colour**

Replace the entire contents of `src/components/SectionHero.tsx`:

```tsx
export default function SectionHero() {
  return (
    <section
      className="hero-section relative flex flex-col items-center justify-end text-center px-6"
      style={{ minHeight: '100dvh', paddingBottom: '36px', background: 'transparent', pointerEvents: 'none' }}
    >
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '200px',
          background: 'linear-gradient(to bottom, transparent, #020d14)',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />
    </section>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/SectionHero.tsx
git commit -m "feat: remove evolve button from hero, update gradient to cyan dark"
```

---

## Task 4: Restyle SectionLeistungen

**Files:**
- Modify: `src/components/SectionLeistungen.tsx`

- [ ] **Step 1: Replace all purple inline styles with cyan**

Replace the entire contents of `src/components/SectionLeistungen.tsx`:

```tsx
import { motion } from 'framer-motion'

const services = [
  {
    title: 'Website',
    subtitle: 'Einmalige Erstellung',
    description: 'Individuell, mobilfreundlich und auf Ihre Kunden zugeschnitten — von der Konzeption bis zum Launch.',
    features: ['Responsives Design', 'Schnelle Ladezeiten', 'SEO-Grundoptimierung', 'Kontaktformular'],
    icon: (
      <svg width="16" height="16" fill="none" stroke="#00ffff" strokeWidth="1.5" viewBox="0 0 24 24">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </svg>
    ),
  },
  {
    title: 'Wartung & Support',
    subtitle: 'Monatlich kündbar',
    description: 'Wir kümmern uns um Hosting, Sicherheit und Updates — damit Sie sich auf Ihr Geschäft konzentrieren können.',
    features: ['Hosting inklusive', 'Sicherheits-Updates', 'Inhaltspflege bis 2h/Mo', 'Persönlicher Ansprechpartner'],
    icon: (
      <svg width="16" height="16" fill="none" stroke="#00ffff" strokeWidth="1.5" viewBox="0 0 24 24">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      </svg>
    ),
  },
]

export default function SectionLeistungen() {
  return (
    <section id="leistungen" className="py-20 md:py-[88px] px-6 md:px-8">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="font-mono text-[10px] tracking-[2px]" style={{ color: 'rgba(0,255,255,0.45)' }}>01</span>
            <span className="w-8 h-px flex-shrink-0" style={{ background: 'rgba(0,255,255,0.2)' }} />
            <span className="font-mono text-[9px] uppercase tracking-[3px]" style={{ color: 'rgba(0,255,255,0.4)' }}>Leistungen</span>
          </div>
          <h2
            className="font-extrabold text-white mb-12"
            style={{ fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', letterSpacing: '-0.8px', lineHeight: 1.1 }}
          >
            Was wir anbieten
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="grid md:grid-cols-2 overflow-hidden"
          style={{ gap: '1px', background: 'rgba(0,255,255,0.06)', border: '1px solid rgba(0,255,255,0.1)', borderRadius: '4px' }}
        >
          {services.map(({ title, subtitle, description, features, icon }) => (
            <div
              key={title}
              className="flex flex-col p-9"
              style={{ background: '#020d14' }}
            >
              <div
                className="w-9 h-9 flex items-center justify-center mb-5 flex-shrink-0"
                style={{ background: 'rgba(0,255,255,0.08)', border: '1px solid rgba(0,255,255,0.2)', borderRadius: '4px' }}
              >
                {icon}
              </div>
              <h3 className="text-white font-bold mb-1" style={{ fontSize: '17px' }}>{title}</h3>
              <p className="font-mono mb-3" style={{ fontSize: '11px', color: 'rgba(0,255,255,0.55)', letterSpacing: '1px' }}>
                {subtitle}
              </p>
              <p className="mb-5 leading-relaxed" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.42)' }}>
                {description}
              </p>
              <div className="flex flex-col gap-1.5">
                {features.map(f => (
                  <span key={f} className="flex items-center gap-2" style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
                    <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: '#00ffff' }} />
                    {f}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/SectionLeistungen.tsx
git commit -m "feat: restyle SectionLeistungen to cyan theme"
```

---

## Task 5: Restyle SectionProcess

**Files:**
- Modify: `src/components/SectionProcess.tsx`

- [ ] **Step 1: Replace entire file**

Replace the entire contents of `src/components/SectionProcess.tsx`:

```tsx
import { motion } from 'framer-motion'

const steps = [
  { number: '01', title: 'Gespräch', description: 'Wir besprechen Ihre Wünsche, Ziele und Zielgruppe — kostenlos und unverbindlich.' },
  { number: '02', title: 'Design & Entwicklung', description: 'Wir entwerfen und bauen Ihre Website — Sie sehen den Fortschritt zu jedem Schritt.' },
  { number: '03', title: 'Launch', description: 'Ihre Website geht online. Wir kümmern uns um Domain, Hosting und alles Technische.' },
]

export default function SectionProcess() {
  return (
    <section className="py-20 md:py-[88px] px-6 md:px-8">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="font-mono text-[10px] tracking-[2px]" style={{ color: 'rgba(0,255,255,0.45)' }}>02</span>
            <span className="w-8 h-px flex-shrink-0" style={{ background: 'rgba(0,255,255,0.2)' }} />
            <span className="font-mono text-[9px] uppercase tracking-[3px]" style={{ color: 'rgba(0,255,255,0.4)' }}>Ablauf</span>
          </div>
          <h2
            className="font-extrabold text-white mb-12"
            style={{ fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', letterSpacing: '-0.8px', lineHeight: 1.1 }}
          >
            So funktioniert's
          </h2>
        </motion.div>

        <div className="relative grid md:grid-cols-3 gap-10">
          <div
            className="absolute hidden md:block h-px top-[18px] left-0 right-0 pointer-events-none"
            style={{ background: 'linear-gradient(to right, transparent, rgba(0,255,255,0.25), transparent)' }}
          />

          {steps.map(({ number, title, description }, i) => (
            <motion.div
              key={number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
            >
              <div
                className="flex items-center gap-2 font-mono mb-5"
                style={{ fontSize: '10px', color: '#00ffff', letterSpacing: '2px' }}
              >
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#00ffff' }} />
                {number}
              </div>
              <h3 className="text-white font-bold mb-2" style={{ fontSize: '16px' }}>{title}</h3>
              <p className="leading-relaxed" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.38)' }}>
                {description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/SectionProcess.tsx
git commit -m "feat: restyle SectionProcess to cyan theme"
```

---

## Task 6: Create SectionGallery

**Files:**
- Create: `src/components/SectionGallery.tsx`
- Delete: `src/components/SectionPortfolio.tsx` (after Task 10 wires up the new component)

- [ ] **Step 1: Create the new Gallery component**

Create `src/components/SectionGallery.tsx`:

```tsx
import { motion } from 'framer-motion'

export default function SectionGallery() {
  return (
    <section id="gallery" className="py-20 md:py-[88px] px-6 md:px-8">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="font-mono text-[10px] tracking-[2px]" style={{ color: 'rgba(0,255,255,0.45)' }}>03</span>
            <span className="w-8 h-px flex-shrink-0" style={{ background: 'rgba(0,255,255,0.2)' }} />
            <span className="font-mono text-[9px] uppercase tracking-[3px]" style={{ color: 'rgba(0,255,255,0.4)' }}>Gallery</span>
          </div>
          <h2
            className="font-extrabold text-white mb-12"
            style={{ fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', letterSpacing: '-0.8px', lineHeight: 1.1 }}
          >
            Unsere Arbeit
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-[480px]"
          style={{ border: '1px solid rgba(0,255,255,0.12)', borderRadius: '4px', background: '#020d14', overflow: 'hidden' }}
        >
          {/* Node graph preview */}
          <div style={{ padding: '24px', borderBottom: '1px solid rgba(0,255,255,0.08)' }}>
            <div className="font-mono" style={{ fontSize: '8px', color: 'rgba(0,255,255,0.4)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '16px' }}>
              KI Workflow
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <div style={{ padding: '5px 10px', background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '3px', fontSize: '9px', color: '#86efac', fontWeight: 700, whiteSpace: 'nowrap' }}>
                Twilio Webhook
              </div>
              <div style={{ flex: 1, height: '1px', background: 'rgba(0,255,255,0.2)' }} />
              <div style={{ padding: '5px 10px', background: 'rgba(0,255,255,0.08)', border: '1px solid rgba(0,255,255,0.25)', borderRadius: '3px', fontSize: '9px', color: '#00ffff', fontWeight: 700, whiteSpace: 'nowrap' }}>
                GPT-4o-mini
              </div>
              <div style={{ flex: 1, height: '1px', background: 'rgba(0,255,255,0.2)' }} />
              <div style={{ padding: '5px 10px', background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: '3px', fontSize: '9px', color: '#93c5fd', fontWeight: 700, whiteSpace: 'nowrap' }}>
                WhatsApp Reply
              </div>
            </div>
            <div className="font-mono" style={{ fontSize: '9px', color: 'rgba(255,255,255,0.2)', textAlign: 'center' }}>
              Eingehende Nachricht → KI-Agent → Automatische Antwort
            </div>
          </div>

          {/* Project info */}
          <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px' }}>
              <h3 className="font-bold text-white" style={{ fontSize: '17px' }}>La Locanda di Nino</h3>
              <span className="font-mono" style={{ fontSize: '9px', color: 'rgba(0,255,255,0.5)', letterSpacing: '1px' }}>KI-Agent</span>
            </div>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.42)', lineHeight: '1.6', marginBottom: '16px' }}>
              Vollautomatischer Bestellassistent via WhatsApp — nimmt Bestellungen entgegen, beantwortet Fragen zum Menü, rund um die Uhr.
            </p>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {['n8n', 'GPT-4o-mini', 'Twilio', 'WhatsApp'].map(tag => (
                <span
                  key={tag}
                  style={{
                    background: 'rgba(0,255,255,0.06)',
                    border: '1px solid rgba(0,255,255,0.18)',
                    borderRadius: '3px',
                    padding: '3px 9px',
                    fontSize: '10px',
                    color: 'rgba(0,255,255,0.65)',
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/SectionGallery.tsx
git commit -m "feat: add SectionGallery with n8n La Locanda di Nino project"
```

---

## Task 7: Restyle SectionPreise

**Files:**
- Modify: `src/components/SectionPreise.tsx`

- [ ] **Step 1: Replace entire file with cyan-themed version**

Replace the entire contents of `src/components/SectionPreise.tsx`:

```tsx
import { motion } from 'framer-motion'
import CardScanner from './CardScanner'

const tiers = [
  {
    name: 'Website',
    price: '499',
    originalPrice: '575',
    period: 'einmalig',
    saving: '76 € gespart',
    badge: null,
    description: 'Ihre professionelle Website — einmalig erstellt, launch-ready.',
    features: [
      'Individuelles Design',
      'Mobilfreundlich (Responsive)',
      'Bis zu 5 Unterseiten',
      'Kontaktformular',
      'SEO-Grundoptimierung',
      'Launch & Einrichtung inklusive',
    ],
    cta: 'Website anfragen',
    highlight: false,
  },
  {
    name: 'Wartung & Support',
    price: '37,99',
    originalPrice: '49,99',
    period: 'pro Monat',
    saving: '24 % günstiger',
    badge: 'BEST DEAL',
    description: 'Wir kümmern uns um alles — Sie konzentrieren sich aufs Geschäft.',
    features: [
      'Hosting inklusive',
      'SSL-Zertifikat',
      'Sicherheits-Updates',
      'Inhaltspflege bis 2h/Mo',
      'Technischer Support',
      'Monatlich kündbar',
    ],
    cta: 'Wartung hinzufügen',
    highlight: true,
  },
]

export default function SectionPreise() {
  return (
    <section id="preise" className="py-20 md:py-[88px] px-6 md:px-8">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="font-mono text-[10px] tracking-[2px]" style={{ color: 'rgba(0,255,255,0.45)' }}>04</span>
            <span className="w-8 h-px flex-shrink-0" style={{ background: 'rgba(0,255,255,0.2)' }} />
            <span className="font-mono text-[9px] uppercase tracking-[3px]" style={{ color: 'rgba(0,255,255,0.4)' }}>Preise</span>
          </div>
          <h2
            className="font-extrabold text-white mb-12"
            style={{ fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', letterSpacing: '-0.8px', lineHeight: 1.1 }}
          >
            Transparent &amp; fair
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="grid md:grid-cols-2 overflow-hidden max-w-[720px]"
          style={{ gap: '1px', background: 'rgba(0,255,255,0.06)', border: '1px solid rgba(0,255,255,0.1)', borderRadius: '4px' }}
        >
          {tiers.map(({ name, price, originalPrice, period, saving, badge, description, features, cta, highlight }) => (
            <div
              key={name}
              className="flex flex-col p-9 relative"
              style={{
                background: highlight ? 'rgba(0,255,255,0.05)' : '#020d14',
                borderLeft: highlight ? '1px solid rgba(0,255,255,0.15)' : undefined,
              }}
            >
              {badge && (
                <div
                  className="absolute top-0 right-0 font-mono font-bold"
                  style={{
                    fontSize: '9px',
                    letterSpacing: '2px',
                    background: 'rgba(0,255,255,0.12)',
                    color: '#00ffff',
                    border: '1px solid rgba(0,255,255,0.3)',
                    padding: '5px 12px',
                    borderBottomLeftRadius: '4px',
                  }}
                >
                  {badge}
                </div>
              )}

              <h3 className="font-bold mb-3" style={{ fontSize: '15px', color: 'rgba(255,255,255,0.7)' }}>{name}</h3>

              <div className="flex items-center gap-2 mb-1">
                <span
                  className="font-mono line-through"
                  style={{ fontSize: '13px', color: 'rgba(255,255,255,0.25)', textDecorationColor: 'rgba(255,255,255,0.2)' }}
                >
                  {originalPrice} €
                </span>
                <span
                  className="font-mono font-bold"
                  style={{
                    fontSize: '10px',
                    color: 'rgba(0,255,255,0.7)',
                    background: 'rgba(0,255,255,0.08)',
                    border: '1px solid rgba(0,255,255,0.2)',
                    padding: '2px 7px',
                    borderRadius: '3px',
                    letterSpacing: '0.5px',
                  }}
                >
                  {saving}
                </span>
              </div>

              <div className="mb-4 leading-none">
                <span className="font-black text-white" style={{ fontSize: '42px', letterSpacing: '-2px' }}>
                  {price} €
                </span>
                <span className="ml-2" style={{ fontSize: '14px', color: 'rgba(255,255,255,0.35)' }}>{period}</span>
              </div>

              <p className="mb-6 leading-relaxed" style={{ fontSize: '12px', color: 'rgba(255,255,255,0.38)' }}>
                {description}
              </p>

              <ul className="flex flex-col gap-2 mb-7 flex-1">
                {features.map(f => (
                  <li key={f} className="flex items-center gap-2" style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', listStyle: 'none' }}>
                    <span style={{ color: '#00ffff', fontSize: '11px', fontWeight: 700 }}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              <a
                href="#kontakt"
                className="block text-center font-bold transition-opacity hover:opacity-90"
                style={{
                  fontSize: '13px',
                  padding: '11px 0',
                  borderRadius: '4px',
                  background: highlight ? 'rgba(0,255,255,0.1)' : undefined,
                  color: highlight ? '#00ffff' : 'rgba(255,255,255,0.55)',
                  border: highlight ? '1px solid rgba(0,255,255,0.35)' : '1px solid rgba(255,255,255,0.12)',
                }}
              >
                {cta}
              </a>
            </div>
          ))}
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="mt-16 -mx-6 md:-mx-8"
      >
        <CardScanner />
      </motion.div>
    </section>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/SectionPreise.tsx
git commit -m "feat: restyle SectionPreise to cyan theme"
```

---

## Task 8: Restyle SectionKontakt

**Files:**
- Modify: `src/components/SectionKontakt.tsx`

- [ ] **Step 1: Replace entire file**

Replace the entire contents of `src/components/SectionKontakt.tsx`:

```tsx
import { useState } from 'react'
import { motion } from 'framer-motion'

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(0,255,255,0.12)',
  borderRadius: '4px',
  padding: '12px 16px',
  color: '#fff',
  fontSize: '14px',
  fontFamily: 'Outfit, sans-serif',
  outline: 'none',
}

export default function SectionKontakt() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('sending')
    const form = e.currentTarget
    try {
      const res = await fetch('https://formspree.io/f/YOUR_FORMSPREE_ID', {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      })
      if (res.ok) { setStatus('sent'); form.reset() }
      else setStatus('error')
    } catch {
      setStatus('error')
    }
  }

  return (
    <section id="kontakt" className="py-20 md:py-[88px] px-6 md:px-8">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="font-mono text-[10px] tracking-[2px]" style={{ color: 'rgba(0,255,255,0.45)' }}>05</span>
            <span className="w-8 h-px flex-shrink-0" style={{ background: 'rgba(0,255,255,0.2)' }} />
            <span className="font-mono text-[9px] uppercase tracking-[3px]" style={{ color: 'rgba(0,255,255,0.4)' }}>Kontakt</span>
          </div>
          <h2
            className="font-extrabold text-white mb-12"
            style={{ fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', letterSpacing: '-0.8px', lineHeight: 1.1 }}
          >
            Lassen Sie uns reden
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-[1.2fr_1fr] gap-16 items-start">
          <motion.form
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            onSubmit={handleSubmit}
          >
            <div className="mb-4">
              <label className="block mb-1.5" style={{ fontSize: '11px', color: 'rgba(255,255,255,0.38)', letterSpacing: '0.5px' }}>
                Name *
              </label>
              <input name="name" required style={inputStyle} placeholder="Max Mustermann" />
            </div>
            <div className="mb-4">
              <label className="block mb-1.5" style={{ fontSize: '11px', color: 'rgba(255,255,255,0.38)', letterSpacing: '0.5px' }}>
                E-Mail *
              </label>
              <input name="email" type="email" required style={inputStyle} placeholder="max@beispiel.de" />
            </div>
            <div className="mb-4">
              <label className="block mb-1.5" style={{ fontSize: '11px', color: 'rgba(255,255,255,0.38)', letterSpacing: '0.5px' }}>
                Nachricht
              </label>
              <textarea
                name="nachricht"
                rows={4}
                style={{ ...inputStyle, resize: 'none' }}
                placeholder="Kurze Beschreibung Ihres Projekts..."
              />
            </div>
            <button
              type="submit"
              disabled={status === 'sending' || status === 'sent'}
              className="w-full font-bold transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{
                background: 'rgba(0,255,255,0.1)',
                border: '1px solid rgba(0,255,255,0.35)',
                color: '#00ffff',
                borderRadius: '4px',
                fontSize: '14px',
                padding: '14px',
                cursor: 'pointer',
                fontFamily: 'Outfit, sans-serif',
              }}
            >
              {status === 'sending' ? 'Wird gesendet…' : status === 'sent' ? 'Nachricht gesendet ✓' : 'Nachricht senden →'}
            </button>
            {status === 'error' && (
              <p className="mt-3 text-center" style={{ fontSize: '12px', color: '#f87171' }}>
                Etwas ist schiefgelaufen. Schreiben Sie uns direkt an hallo@klarvis.de
              </p>
            )}
          </motion.form>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col gap-8 pt-2"
          >
            <div>
              <h4 className="font-semibold mb-1" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>E-Mail</h4>
              <a
                href="mailto:hallo@klarvis.de"
                className="transition-colors hover:opacity-70"
                style={{ fontSize: '13px', color: 'rgba(255,255,255,0.38)' }}
              >
                hallo@klarvis.de
              </a>
            </div>
            <div>
              <h4 className="font-semibold mb-1" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>WhatsApp</h4>
              <a
                href="https://wa.me/49XXXXXXXXXX"
                className="transition-colors hover:opacity-70"
                style={{ fontSize: '13px', color: 'rgba(255,255,255,0.38)' }}
              >
                Direkt schreiben →
              </a>
            </div>
            <div
              style={{ border: '1px solid rgba(0,255,255,0.08)', background: 'rgba(0,255,255,0.02)', borderRadius: '4px', padding: '20px' }}
            >
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.38)', lineHeight: '1.6' }}>
                <strong style={{ color: 'rgba(255,255,255,0.6)' }}>Antwortzeit:</strong>{' '}
                Wir melden uns in der Regel innerhalb von 24 Stunden bei Ihnen.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/SectionKontakt.tsx
git commit -m "feat: restyle SectionKontakt to cyan theme"
```

---

## Task 9: Restyle Footer

**Files:**
- Modify: `src/components/Footer.tsx`

- [ ] **Step 1: Replace logo dot colour**

Replace the entire contents of `src/components/Footer.tsx`:

```tsx
export default function Footer() {
  return (
    <footer className="flex flex-col md:flex-row items-center justify-between gap-4 px-8 py-7">
      <span className="font-black" style={{ fontSize: '15px', color: 'rgba(255,255,255,0.6)' }}>
        Klarvis<span style={{ color: '#00ffff' }}>.</span>
      </span>
      <div className="flex gap-5">
        <a
          href="/impressum"
          className="transition-opacity hover:opacity-70"
          style={{ fontSize: '12px', color: 'rgba(255,255,255,0.28)' }}
        >
          Impressum
        </a>
        <a
          href="/datenschutz"
          className="transition-opacity hover:opacity-70"
          style={{ fontSize: '12px', color: 'rgba(255,255,255,0.28)' }}
        >
          Datenschutz
        </a>
      </div>
      <span className="font-mono" style={{ fontSize: '12px', color: 'rgba(255,255,255,0.2)' }}>
        © {new Date().getFullYear()} Klarvis
      </span>
    </footer>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Footer.tsx
git commit -m "feat: restyle Footer logo dot to cyan"
```

---

## Task 10: Wire up SectionGallery in App.tsx

**Files:**
- Modify: `src/App.tsx`
- Delete: `src/components/SectionPortfolio.tsx`

- [ ] **Step 1: Swap import and usage**

Replace the entire contents of `src/App.tsx`:

```tsx
import Navbar from './components/Navbar'
import SectionHero from './components/SectionHero'
import SectionLeistungen from './components/SectionLeistungen'
import SectionProcess from './components/SectionProcess'
import SectionGallery from './components/SectionGallery'
import SectionPreise from './components/SectionPreise'
import SectionKontakt from './components/SectionKontakt'
import Footer from './components/Footer'

export default function App() {
  return (
    <>
      <Navbar />
      <SectionHero />
      <SectionLeistungen />
      <SectionProcess />
      <SectionGallery />
      <SectionPreise />
      <SectionKontakt />
      <Footer />
    </>
  )
}
```

- [ ] **Step 2: Delete the old portfolio file**

```bash
rm src/components/SectionPortfolio.tsx
```

- [ ] **Step 3: Verify the build compiles**

```bash
npm run build
```

Expected: no TypeScript errors, build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/App.tsx
git rm src/components/SectionPortfolio.tsx
git commit -m "feat: wire SectionGallery into app, remove SectionPortfolio"
```

---

## Task 11: Replace Three.js scene in index.html

**Files:**
- Modify: `index.html`

This replaces the entire particle-swarm setup with the underwater scene. The file currently has: an importmap (three@0.174), a `#swarm-container` div, a `#ui` div, a `<script>` with the noise string, and the inline module script.

- [ ] **Step 1: Replace the importmap**

In `index.html`, replace:
```html
    <!-- Three.js importmap (native browser support) -->
    <script type="importmap">
      {
        "imports": {
          "three": "https://cdn.jsdelivr.net/npm/three@0.174.0/build/three.module.js"
        }
      }
    </script>
```

With:
```html
    <!-- Three.js importmap -->
    <script type="importmap">
      {
        "imports": {
          "three": "https://unpkg.com/three@0.182.0/build/three.module.js",
          "three/addons/": "https://unpkg.com/three@0.182.0/examples/jsm/"
        }
      }
    </script>
```

- [ ] **Step 2: Replace the HTML structure above `#root`**

In `index.html`, replace:
```html
    <!-- Particle swarm background -->
    <div id="swarm-container"></div>

    <!-- Evolve button -->
    <div id="ui">CLICK TO EVOLVE</div>
```

With:
```html
    <!-- Underwater Three.js background -->
    <div id="underwater-container"></div>

    <!-- Side panel -->
    <div id="side-panel">
      <button id="panel-close" aria-label="Schließen">✕</button>
      <div id="panel-content"></div>
    </div>
```

- [ ] **Step 3: Add the side panel style block**

Immediately after `</title>` (or at the end of `<head>`), add:

```html
    <style>
      #side-panel {
        position: fixed;
        right: 0;
        top: 0;
        height: 100vh;
        width: 320px;
        background: rgba(2,13,20,0.97);
        border-left: 1px solid rgba(0,255,255,0.2);
        z-index: 10;
        transform: translateX(100%);
        transition: transform 0.35s cubic-bezier(0.16,1,0.3,1);
        overflow-y: auto;
        padding: 24px 20px;
        box-sizing: border-box;
        backdrop-filter: blur(8px);
      }
      #side-panel.open { transform: translateX(0); }
      #panel-close {
        position: absolute;
        top: 14px;
        right: 14px;
        background: rgba(255,255,255,0.06);
        border: 1px solid rgba(255,255,255,0.08);
        color: rgba(255,255,255,0.4);
        width: 28px;
        height: 28px;
        border-radius: 50%;
        cursor: pointer;
        font-size: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.15s, color 0.15s;
      }
      #panel-close:hover { background: rgba(0,255,255,0.1); color: #00ffff; }
      @media (max-width: 639px) {
        #side-panel {
          width: 100vw;
          height: 65vh;
          top: auto;
          bottom: 0;
          transform: translateY(100%);
          border-left: none;
          border-top: 1px solid rgba(0,255,255,0.2);
        }
        #side-panel.open { transform: translateY(0); }
      }
    </style>
```

- [ ] **Step 4: Replace the inline noise `<script>` tag and the entire module script**

Remove the existing `<script>` (the one that sets `const noise = ...`) and the `<script type="module">` that follows it. Replace both with the new module script below.

The new script goes just before `</body>`:

```html
    <script type="module">
      import * as THREE from "three";
      import { OrbitControls } from "three/addons/controls/OrbitControls.js";
      import * as BGU from "three/addons/utils/BufferGeometryUtils.js";

      const noise = `
        vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
        float snoise(vec2 v){
          const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                   -0.577350269189626, 0.024390243902439);
          vec2 i  = floor(v + dot(v, C.yy) );
          vec2 x0 = v -   i + dot(i, C.xx);
          vec2 i1;
          i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
          vec4 x12 = x0.xyxy + C.xxzz;
          x12.xy -= i1;
          i = mod(i, 289.0);
          vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
          + i.x + vec3(0.0, i1.x, 1.0 ));
          vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
            dot(x12.zw,x12.zw)), 0.0);
          m = m*m ;
          m = m*m ;
          vec3 x = 2.0 * fract(p * C.www) - 1.0;
          vec3 h = abs(x) - 0.5;
          vec3 ox = floor(x + 0.5);
          vec3 a0 = x - ox;
          m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
          vec3 g;
          g.x  = a0.x  * x0.x  + h.x  * x0.y;
          g.yz = a0.yz * x12.xz + h.yz * x12.yw;
          return 130.0 * dot(m, g);
        }
      `;

      const gu = { time: { value: 0 } };

      const ToQuads = (g) => {
        let p = g.parameters;
        let segmentsX = (g.type == "TorusGeometry" ? p.tubularSegments : p.radialSegments) || p.widthSegments || p.thetaSegments || (p.points && p.points.length - 1) || 1;
        let segmentsY = (g.type == "TorusGeometry" ? p.radialSegments : p.tubularSegments) || p.heightSegments || p.phiSegments || p.segments || 1;
        let indices = [];
        for (let i = 0; i < segmentsY + 1; i++) {
          let index11 = 0, index12 = 0;
          for (let j = 0; j < segmentsX; j++) {
            index11 = (segmentsX + 1) * i + j;
            index12 = index11 + 1;
            let index21 = index11;
            let index22 = index11 + (segmentsX + 1);
            indices.push(index11, index12);
            if (index22 < ((segmentsX + 1) * (segmentsY + 1) - 1)) indices.push(index21, index22);
          }
          if ((index12 + segmentsX + 1) <= ((segmentsX + 1) * (segmentsY + 1) - 1)) indices.push(index12, index12 + segmentsX + 1);
        }
        g.setIndex(indices);
      };

      class SeaBed extends THREE.LineSegments {
        constructor() {
          const g = new THREE.PlaneGeometry(100, 100, 400, 400).rotateX(-Math.PI * 0.5).rotateY(Math.PI * 0.25);
          ToQuads(g);
          const m = new THREE.MeshBasicMaterial({
            color: "#048",
            onBeforeCompile: shader => {
              shader.uniforms.time = gu.time;
              shader.vertexShader = `
                uniform float time;
                varying float vN;
                varying vec3 vPos;
                ${noise}
                ${shader.vertexShader}
              `.replace(`#include <begin_vertex>`, `#include <begin_vertex>
                float t = time;
                float posX = position.x - mod(t, 2. * sqrt(2.));
                transformed.x = posX;
                float xShift = posX + t;
                float n = snoise(vec2(xShift, position.z) * 0.1);
                vN = n;
                transformed.y = n * 1.;
                vPos = transformed;
              `);
              shader.fragmentShader = `
                varying float vN;
                varying vec3 vPos;
                ${shader.fragmentShader}
              `.replace(`vec4 diffuseColor = vec4( diffuse, opacity );`, `
                vec3 col = mix(diffuse, vec3(0, 0.75, 1), 1. - smoothstep(-0.5, 0., vN));
                col += vec3(0, 0.2, 0.1) * (1. - smoothstep(10., 15., length(vPos)));
                vec4 diffuseColor = vec4( col, opacity );
              `);
            }
          });
          super(g, m);
          this.position.y = -5;
        }
      }

      class Background extends THREE.Mesh {
        constructor() {
          const g = new THREE.SphereGeometry(300);
          const m = new THREE.MeshBasicMaterial({
            side: THREE.BackSide,
            fog: false,
            color: "white",
            map: (() => {
              const c = document.createElement("canvas");
              c.width = 1; c.height = 1024;
              const ctx = c.getContext("2d");
              const grd = ctx.createLinearGradient(0, 0, 0, c.height);
              grd.addColorStop(0.1, "#044");
              grd.addColorStop(0.4, "#" + scene.background.getHexString());
              ctx.fillStyle = grd;
              ctx.fillRect(0, 0, c.width, c.height);
              const tex = new THREE.CanvasTexture(c);
              tex.colorSpace = "srgb";
              tex.anisotropy = 16;
              return tex;
            })()
          });
          super(g, m);
        }
      }

      class WaterStuff extends THREE.Group {
        constructor() {
          super();
          this.items = Array.from({ length: 50 }, () => {
            const item = new THREE.Mesh(
              new THREE.CapsuleGeometry(0.25, 2, 3, 7, 3),
              new THREE.MeshBasicMaterial({ wireframe: true, color: "#068" })
            );
            this.setRandom(item, 50 - Math.random() * 100);
            this.add(item);
            return item;
          });
        }
        setRandom(o, x) {
          const a = Math.PI * Math.random();
          const r = 5 + Math.random() * 10;
          o.position.set(x, Math.sin(a) * r, Math.cos(a) * r);
          o.rotation.setFromVector3(new THREE.Vector3().random().multiplyScalar(Math.PI * 2));
          o.scale.y = 1 + (Math.random() - 0.5) * 1.5;
        }
        update(dt) {
          const lim = 50;
          this.items.forEach(item => {
            let iPos = item.position.x - dt;
            item.position.x = iPos;
            if (iPos < -lim) {
              iPos = (iPos + lim) % 100;
              this.setRandom(item, lim + iPos);
            }
          });
        }
      }

      class Thing extends THREE.Group {
        constructor() {
          super();
          const gBase = new THREE.SphereGeometry(3, 64, 32);
          const gLines = new THREE.EdgesGeometry(gBase, 0.5);
          const mLines = new THREE.LineBasicMaterial({ color: "#8ff", transparent: true, opacity: 0.75 });
          const lines = new THREE.LineSegments(gLines, mLines);
          this.add(lines);
          const gPoints = BGU.mergeVertices(gBase.clone().deleteAttribute("uv").deleteAttribute("normal"));
          const mPoints = new THREE.PointsMaterial({ color: "#0ff", size: 0.1, transparent: true });
          const points = new THREE.Points(gPoints, mPoints);
          this.add(points);
          [mLines, mPoints].forEach(m => {
            m.onBeforeCompile = shader => {
              shader.uniforms.time = gu.time;
              shader.vertexShader = `
                uniform float time;
                varying vec3 vPos;
                mat2 rot(float a){return mat2(cos(a), sin(a), -sin(a), cos(a));}
                ${shader.vertexShader}
              `.replace(`#include <begin_vertex>`, `#include <begin_vertex>
                vec3 pos = position;
                vPos = pos;
                pos.y *= 0.05;
                float a = atan(pos.z, pos.x);
                float s = cos(a * 4.);
                float r = s * 0.125 + 0.875;
                pos.xz *= r;
                pos.x -= (smoothstep(0., 3., pos.x)) * 0.75;
                float syncWave = sin(time * 1.25 + pos.x);
                float zSwaying = smoothstep(0.25, 2., abs(pos.z));
                mat2 zRot = rot(PI * 0.1 * zSwaying * syncWave * sign(pos.z));
                pos.yz *= zRot;
                pos.y += syncWave * 0.5 * ((1. - smoothstep(-3., 3., position.x)) * 0.5 + 0.5);
                transformed = pos;
              `);
              if (m.type == "PointsMaterial") {
                shader.fragmentShader = `
                  varying vec3 vPos;
                  ${shader.fragmentShader}
                `.replace(`vec4 diffuseColor = vec4( diffuse, opacity );`, `
                  vec2 uv = gl_PointCoord - 0.5;
                  float pl = length(uv);
                  float fw = length(fwidth(uv));
                  float f = 1. - smoothstep(0.5 - fw, 0.5, pl);
                  if (pl > 0.5) discard;
                  vec3 bodyColor = mix(vec3(1), diffuse, smoothstep(2., 1., vPos.x));
                  vec3 col = mix(bodyColor, diffuse, smoothstep(0.5, 1.0, abs(vPos.z)));
                  vec4 diffuseColor = vec4( col, opacity * f );
                `);
              }
            };
          });
          // Invisible hit-proxy sphere for reliable raycasting
          const proxy = new THREE.Mesh(
            new THREE.SphereGeometry(3.5),
            new THREE.MeshBasicMaterial({ visible: false })
          );
          proxy.userData.hitProxy = true;
          this.add(proxy);
          this.position.y = 1;
        }
      }

      const scene = new THREE.Scene();
      scene.background = new THREE.Color("#024");
      scene.fog = new THREE.Fog(scene.background, 8, 30);

      const camera = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 0.1, 500);
      camera.position.set(0.5, 0.25, -1).setLength(7.25);

      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setPixelRatio(devicePixelRatio);
      renderer.setSize(innerWidth, innerHeight);
      document.getElementById('underwater-container').appendChild(renderer.domElement);

      addEventListener("resize", () => {
        camera.aspect = innerWidth / innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(innerWidth, innerHeight);
      });

      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.enablePan = false;
      controls.maxDistance = 15;
      controls.maxPolarAngle = Math.PI * 0.6;

      const background = new Background();
      scene.add(background);
      const thing = new Thing();
      scene.add(thing);
      const seaBed = new SeaBed();
      scene.add(seaBed);
      const waterStuff = new WaterStuff();
      scene.add(waterStuff);

      const clock = new THREE.Clock();
      let t = 0;

      renderer.setAnimationLoop(() => {
        const dt = clock.getDelta();
        t += dt;
        gu.time.value = t * 1.25;
        controls.update();
        waterStuff.update(dt);
        renderer.render(scene, camera);
      });

      // ── Raycasting & Side Panel ──────────────────────────────────────────

      const raycaster = new THREE.Raycaster();
      const pointer = new THREE.Vector2();
      let mouseDownPos = { x: 0, y: 0 };

      const panel = document.getElementById('side-panel');
      const panelContent = document.getElementById('panel-content');
      const panelClose = document.getElementById('panel-close');

      function openPanel(type) {
        panelContent.innerHTML = getPanelContent(type);
        panel.classList.add('open');
      }

      function closePanel() {
        panel.classList.remove('open');
      }
      window.closePanel = closePanel;

      panelClose.addEventListener('click', closePanel);

      renderer.domElement.addEventListener('mousedown', e => {
        mouseDownPos = { x: e.clientX, y: e.clientY };
      });

      renderer.domElement.addEventListener('click', e => {
        const dx = e.clientX - mouseDownPos.x;
        const dy = e.clientY - mouseDownPos.y;
        if (Math.sqrt(dx * dx + dy * dy) > 5) return; // was a drag, not a click

        pointer.x =  (e.clientX / innerWidth)  * 2 - 1;
        pointer.y = -(e.clientY / innerHeight) * 2 + 1;
        raycaster.setFromCamera(pointer, camera);

        // 1. Check fish hit-proxy
        const proxyMesh = thing.children.find(c => c.userData.hitProxy);
        if (proxyMesh) {
          const hits = raycaster.intersectObject(proxyMesh);
          if (hits.length > 0) { openPanel('fish'); return; }
        }

        // 2. Check WaterStuff capsules
        const capsuleHits = raycaster.intersectObjects(waterStuff.items);
        if (capsuleHits.length > 0) { openPanel('capsule'); return; }

        // 3. Check SeaBed
        const bedHits = raycaster.intersectObject(seaBed);
        if (bedHits.length > 0) { openPanel('seabed'); return; }
      });

      // Change cursor on hover
      renderer.domElement.addEventListener('mousemove', e => {
        pointer.x =  (e.clientX / innerWidth)  * 2 - 1;
        pointer.y = -(e.clientY / innerHeight) * 2 + 1;
        raycaster.setFromCamera(pointer, camera);
        const proxyMesh = thing.children.find(c => c.userData.hitProxy);
        const hitProxy = proxyMesh ? raycaster.intersectObject(proxyMesh).length > 0 : false;
        const hitCapsule = raycaster.intersectObjects(waterStuff.items).length > 0;
        const hitBed = raycaster.intersectObject(seaBed).length > 0;
        renderer.domElement.style.cursor = (hitProxy || hitCapsule || hitBed) ? 'pointer' : 'default';
      });

      function getPanelContent(type) {
        if (type === 'fish') return `
          <div style="margin-top:8px">
            <div style="font-size:9px;font-weight:700;letter-spacing:3px;color:rgba(0,255,255,0.45);text-transform:uppercase;margin-bottom:12px">01 — Leistungen</div>
            <h2 style="font-size:18px;font-weight:800;color:#fff;margin:0 0 16px;line-height:1.2">Was wir<br>anbieten</h2>
            <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:20px">
              <div style="background:rgba(0,255,255,0.06);border:1px solid rgba(0,255,255,0.18);border-radius:4px;padding:12px">
                <div style="font-size:11px;font-weight:700;color:#fff;margin-bottom:4px">Website</div>
                <div style="font-size:10px;color:rgba(255,255,255,0.4);line-height:1.5">Responsiv, SEO-ready, launch-fertig. Einmalig erstellt.</div>
              </div>
              <div style="background:rgba(0,255,255,0.06);border:1px solid rgba(0,255,255,0.18);border-radius:4px;padding:12px">
                <div style="font-size:11px;font-weight:700;color:#fff;margin-bottom:4px">Wartung &amp; Support</div>
                <div style="font-size:10px;color:rgba(255,255,255,0.4);line-height:1.5">Hosting, Updates, persönlicher Ansprechpartner.</div>
              </div>
            </div>
            <a href="#leistungen" onclick="closePanel()" style="display:block;background:rgba(0,255,255,0.1);border:1px solid rgba(0,255,255,0.35);border-radius:4px;padding:11px;font-size:11px;color:#00ffff;text-align:center;font-weight:700;text-decoration:none">Mehr erfahren →</a>
          </div>`;

        if (type === 'capsule') return `
          <div style="margin-top:8px">
            <div style="font-size:9px;font-weight:700;letter-spacing:3px;color:rgba(0,255,255,0.45);text-transform:uppercase;margin-bottom:12px">02 — Gallery</div>
            <h2 style="font-size:18px;font-weight:800;color:#fff;margin:0 0 16px;line-height:1.2">Unsere<br>Arbeit</h2>
            <div style="background:rgba(10,20,30,0.9);border:1px solid rgba(0,255,255,0.15);border-radius:4px;padding:14px;margin-bottom:14px">
              <div style="font-size:8px;color:rgba(0,255,255,0.4);letter-spacing:2px;text-transform:uppercase;margin-bottom:10px">KI Workflow</div>
              <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px">
                <div style="padding:4px 8px;background:rgba(34,197,94,0.15);border:1px solid rgba(34,197,94,0.35);border-radius:3px;font-size:8px;color:#86efac;font-weight:700">Webhook</div>
                <div style="flex:1;height:1px;background:rgba(0,255,255,0.2)"></div>
                <div style="padding:4px 8px;background:rgba(0,255,255,0.1);border:1px solid rgba(0,255,255,0.3);border-radius:3px;font-size:8px;color:#00ffff;font-weight:700">GPT-4o</div>
                <div style="flex:1;height:1px;background:rgba(0,255,255,0.2)"></div>
                <div style="padding:4px 8px;background:rgba(59,130,246,0.15);border:1px solid rgba(59,130,246,0.35);border-radius:3px;font-size:8px;color:#93c5fd;font-weight:700">Twilio</div>
              </div>
              <div style="font-size:8px;color:rgba(255,255,255,0.2);text-align:center">WhatsApp → KI → Antwort</div>
            </div>
            <div style="font-size:13px;font-weight:700;color:#fff;margin-bottom:6px">La Locanda di Nino</div>
            <div style="font-size:10px;color:rgba(255,255,255,0.4);line-height:1.6;margin-bottom:14px">KI-Bestellassistent via WhatsApp — nimmt Bestellungen entgegen, beantwortet Fragen, rund um die Uhr.</div>
            <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:16px">
              <span style="background:rgba(0,255,255,0.08);border:1px solid rgba(0,255,255,0.2);border-radius:3px;padding:3px 8px;font-size:9px;color:rgba(0,255,255,0.7)">n8n</span>
              <span style="background:rgba(0,255,255,0.08);border:1px solid rgba(0,255,255,0.2);border-radius:3px;padding:3px 8px;font-size:9px;color:rgba(0,255,255,0.7)">GPT-4o-mini</span>
              <span style="background:rgba(0,255,255,0.08);border:1px solid rgba(0,255,255,0.2);border-radius:3px;padding:3px 8px;font-size:9px;color:rgba(0,255,255,0.7)">Twilio</span>
            </div>
            <a href="#gallery" onclick="closePanel()" style="display:block;background:rgba(0,255,255,0.1);border:1px solid rgba(0,255,255,0.35);border-radius:4px;padding:11px;font-size:11px;color:#00ffff;text-align:center;font-weight:700;text-decoration:none">Gallery ansehen →</a>
          </div>`;

        if (type === 'seabed') return `
          <div style="margin-top:8px">
            <div style="font-size:9px;font-weight:700;letter-spacing:3px;color:rgba(0,255,255,0.45);text-transform:uppercase;margin-bottom:12px">03 — Preise</div>
            <h2 style="font-size:18px;font-weight:800;color:#fff;margin:0 0 16px;line-height:1.2">Unsere<br>Pakete</h2>
            <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:20px">
              <div style="background:rgba(0,255,255,0.06);border:1px solid rgba(0,255,255,0.18);border-radius:4px;padding:12px">
                <div style="font-size:10px;font-weight:700;color:#fff;margin-bottom:3px">Website</div>
                <div style="font-size:22px;font-weight:800;color:#00ffff;line-height:1;margin-bottom:2px">499 €</div>
                <div style="font-size:9px;color:rgba(255,255,255,0.3)">einmalig</div>
              </div>
              <div style="background:rgba(0,255,255,0.08);border:1px solid rgba(0,255,255,0.28);border-radius:4px;padding:12px;position:relative">
                <div style="position:absolute;top:-9px;right:10px;background:rgba(0,255,255,0.12);border:1px solid rgba(0,255,255,0.35);border-radius:3px;padding:2px 8px;font-size:8px;font-weight:700;color:#00ffff;letter-spacing:1px">BEST DEAL</div>
                <div style="font-size:10px;font-weight:700;color:#fff;margin-bottom:3px">Wartung &amp; Support</div>
                <div style="font-size:22px;font-weight:800;color:#00ffff;line-height:1;margin-bottom:2px">37,99 €</div>
                <div style="font-size:9px;color:rgba(255,255,255,0.3)">pro Monat</div>
              </div>
            </div>
            <a href="#preise" onclick="closePanel()" style="display:block;background:rgba(0,255,255,0.1);border:1px solid rgba(0,255,255,0.35);border-radius:4px;padding:11px;font-size:11px;color:#00ffff;text-align:center;font-weight:700;text-decoration:none">Preise ansehen →</a>
          </div>`;

        return '';
      }
    </script>
```

- [ ] **Step 5: Run the dev server and verify the scene loads**

```bash
npm run dev
```

Open http://localhost:5173 in a browser.

Expected:
- Underwater scene renders (dark navy background, fish, drifting capsules, animated wave grid)
- Clicking the fish opens Leistungen panel from right
- Clicking a capsule opens Gallery panel
- Clicking the sea bed opens Preise panel
- Close button dismisses panel
- CTA links scroll to correct sections
- Cursor changes to pointer over clickable objects
- OrbitControls: drag to rotate, scroll to zoom

- [ ] **Step 6: Commit**

```bash
git add index.html
git commit -m "feat: add underwater Three.js scene with clickable side panels"
```

---

## Task 12: Final check and cleanup

- [ ] **Step 1: Run build to confirm no errors**

```bash
npm run build
```

Expected: clean build, no TypeScript errors.

- [ ] **Step 2: Visual check — scroll through full page**

Open http://localhost:5173. Verify:
- [ ] Underwater scene renders in hero
- [ ] Navbar: cyan dot on "Klarvis.", cyan "Anfragen" button, "Gallery" link present
- [ ] SectionLeistungen: cyan icons, cyan section label, thin border
- [ ] SectionProcess: cyan step numbers and connectors
- [ ] SectionGallery: n8n node graph card visible
- [ ] SectionPreise: cyan checkmarks, cyan badge, cyan CTA border
- [ ] SectionKontakt: cyan input borders, cyan submit button
- [ ] Footer: cyan dot
- [ ] Side panels open/close correctly for all 3 object types
- [ ] No purple anywhere on the page

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: complete underwater theme and gallery rename"
```
