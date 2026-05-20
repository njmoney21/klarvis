# Steuerhelfer Dark Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle the Runly Steuerberater app (5 components) from a plain white/gray palette to a dark navy + cyan theme matching the main Runly marketing site.

**Architecture:** Pure CSS class swaps in JSX — no logic, props, routing, or API changes. Each component is updated independently and committed separately. Existing tests (Navbar, SectionPreise) are run after each task to catch accidental regressions.

**Tech Stack:** React, TypeScript, Tailwind CSS v4 (utility classes only — no new CSS variables or dependencies)

**Spec:** `docs/superpowers/specs/2026-05-20-steuerhelfer-dark-redesign.md`

---

## File Map

| File | Change |
|---|---|
| `src/pages/SteuerhelferApp.tsx` | Dark page bg, dark header/nav, cyan active tab, logo icon |
| `src/components/steuerhelfer/Belegscanner.tsx` | Dark surfaces, cyan CTAs, dark upload area, dark compliance badges |
| `src/components/steuerhelfer/Ausgaben.tsx` | Dark stat cards, cyan gradient export btn, dark receipt list |
| `src/components/steuerhelfer/TaxChat.tsx` | Cyan pills/send btn, dark input, restyled bubbles |
| `src/components/steuerhelfer/DeadlineEngine.tsx` | Dark deadline cards, translucent urgency badges |

---

## Task 1: SteuerhelferApp — page shell, header, tabs

**Files:**
- Modify: `src/pages/SteuerhelferApp.tsx`

- [ ] **Step 1: Replace the file content**

```tsx
import { useState } from 'react'
import Belegscanner from '../components/steuerhelfer/Belegscanner'
import Ausgaben from '../components/steuerhelfer/Ausgaben'
import TaxChat from '../components/steuerhelfer/TaxChat'
import DeadlineEngine from '../components/steuerhelfer/DeadlineEngine'
import { useAuth } from '../lib/auth'

type Tab = 'scanner' | 'ausgaben' | 'chat' | 'fristen'

const TAB_LABELS: Record<Tab, string> = {
  scanner: 'Belegscanner',
  ausgaben: 'Ausgaben',
  chat: 'Steuer-FAQ',
  fristen: 'Fristen',
}

const TABS: Tab[] = ['scanner', 'ausgaben', 'chat', 'fristen']

export default function SteuerhelferApp() {
  const [activeTab, setActiveTab] = useState<Tab>('scanner')
  const [refreshKey, setRefreshKey] = useState(0)
  const { session, signOut } = useAuth()

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="bg-slate-800 border-b border-slate-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-cyan-500 flex items-center justify-center text-slate-900 text-sm font-bold shrink-0">
            ⬡
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-100">Runly Steuerberater</h1>
            <p className="text-xs text-slate-500">KI-Assistent für Kleinunternehmer</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500 mb-1 truncate max-w-[160px]">{session?.user.email}</p>
          <button
            onClick={signOut}
            className="text-xs text-cyan-500 hover:text-cyan-400 transition-colors"
          >
            Abmelden
          </button>
        </div>
      </header>

      <nav className="bg-slate-800 border-b border-slate-700 overflow-x-auto">
        <div className="flex min-w-max">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                activeTab === tab
                  ? 'border-cyan-500 text-cyan-500 bg-cyan-500/5'
                  : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}
            >
              {TAB_LABELS[tab]}
            </button>
          ))}
        </div>
      </nav>

      <main className="p-4 max-w-2xl mx-auto">
        {activeTab === 'scanner' && (
          <Belegscanner onApproved={() => setRefreshKey(k => k + 1)} />
        )}
        {activeTab === 'ausgaben' && <Ausgaben refreshKey={refreshKey} />}
        {activeTab === 'chat' && <TaxChat />}
        {activeTab === 'fristen' && <DeadlineEngine />}
      </main>
    </div>
  )
}
```

- [ ] **Step 2: Run tests**

```bash
npx vitest run
```

Expected: all existing tests pass (Navbar, SectionPreise).

- [ ] **Step 3: Commit**

```bash
git add src/pages/SteuerhelferApp.tsx
git commit -m "style: dark theme for SteuerhelferApp shell"
```

---

## Task 2: Belegscanner — dark surfaces, cyan CTAs

**Files:**
- Modify: `src/components/steuerhelfer/Belegscanner.tsx`

- [ ] **Step 1: Replace the file content**

```tsx
import { useState } from 'react'
import { scanReceipt, checkInvoice } from '../../lib/n8n'
import type { ComplianceResult, ExtractedReceipt } from '../../lib/types'

type Mode = 'scan' | 'invoice'
type State = 'idle' | 'loading' | 'preview' | 'compliance'

interface Props {
  onApproved: () => void
}

const COMPLIANCE_FIELDS: { key: keyof ComplianceResult; label: string }[] = [
  { key: 'has_vendor_name', label: 'Name des Ausstellers' },
  { key: 'has_vendor_address', label: 'Anschrift des Ausstellers' },
  { key: 'has_recipient_name', label: 'Name des Empfängers' },
  { key: 'has_recipient_address', label: 'Anschrift des Empfängers' },
  { key: 'has_tax_number_or_uid', label: 'Steuernummer oder USt-IdNr.' },
  { key: 'has_invoice_date', label: 'Ausstellungsdatum' },
  { key: 'has_invoice_number', label: 'Fortlaufende Rechnungsnummer' },
  { key: 'has_service_description', label: 'Leistungsbeschreibung' },
  { key: 'has_service_period', label: 'Leistungszeitraum' },
  { key: 'has_net_amount', label: 'Nettobetrag' },
  { key: 'has_vat_rate_and_amount', label: 'MwSt-Satz und -Betrag' },
  { key: 'has_gross_amount', label: 'Gesamtbetrag (brutto)' },
]

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve((reader.result as string).split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default function Belegscanner({ onApproved }: Props) {
  const [mode, setMode] = useState<Mode>('scan')
  const [uiState, setUiState] = useState<State>('idle')
  const [extracted, setExtracted] = useState<ExtractedReceipt | null>(null)
  const [compliance, setCompliance] = useState<ComplianceResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  function reset() {
    setExtracted(null)
    setCompliance(null)
    setError(null)
    setUiState('idle')
  }

  function switchMode(m: Mode) {
    setMode(m)
    reset()
  }

  async function handleFile(file: File) {
    setError(null)
    setUiState('loading')
    try {
      const base64 = await fileToBase64(file)
      if (mode === 'scan') {
        const result = await scanReceipt(base64)
        setExtracted(result)
        setUiState('preview')
      } else {
        const result = await checkInvoice(base64)
        setCompliance(result)
        setUiState('compliance')
      }
    } catch {
      setError('Fehler beim Verarbeiten. Bitte erneut versuchen.')
      setUiState('idle')
    }
  }

  function handleApprove() {
    reset()
    onApproved()
  }

  return (
    <div className="space-y-4">
      {/* Mode toggle */}
      <div className="flex gap-2">
        {(['scan', 'invoice'] as Mode[]).map(m => (
          <button
            key={m}
            onClick={() => switchMode(m)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
              mode === m
                ? 'bg-cyan-500 text-slate-900 border-cyan-500'
                : 'bg-transparent text-slate-500 border-slate-700 hover:border-slate-500'
            }`}
          >
            {m === 'scan' ? 'Beleg scannen' : 'Ausgangsrechnung prüfen'}
          </button>
        ))}
      </div>

      {/* Upload area */}
      {uiState === 'idle' && (
        <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-700 rounded-xl p-10 cursor-pointer hover:border-cyan-500 transition-colors">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
          />
          <span className="text-3xl mb-2">📷</span>
          <p className="text-sm text-slate-400 font-medium">Foto hochladen</p>
          <p className="text-xs text-slate-500 mt-1">JPG, PNG, HEIC</p>
        </label>
      )}

      {/* Loading */}
      {uiState === 'loading' && (
        <div className="text-center py-12">
          <p className="text-slate-400 text-sm">Analysiere Dokument...</p>
        </div>
      )}

      {/* Receipt preview */}
      {uiState === 'preview' && extracted && (
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 space-y-3">
          <h3 className="font-semibold text-slate-100">Extrahierte Daten</h3>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <dt className="text-slate-500">Händler</dt>
            <dd className="text-slate-100 font-medium">{extracted.vendor}</dd>
            <dt className="text-slate-500">Datum</dt>
            <dd className="text-slate-100">{extracted.date}</dd>
            <dt className="text-slate-500">Brutto</dt>
            <dd className="text-slate-100">{extracted.amount_gross.toFixed(2)} €</dd>
            <dt className="text-slate-500">Netto</dt>
            <dd className="text-slate-100">{extracted.amount_net.toFixed(2)} €</dd>
            <dt className="text-slate-500">MwSt-Satz</dt>
            <dd className="text-slate-100">{extracted.vat_rate} %</dd>
            <dt className="text-slate-500">Vorsteuer</dt>
            <dd className="text-slate-100">{extracted.vat_amount.toFixed(2)} €</dd>
            <dt className="text-slate-500">Kategorie</dt>
            <dd className="text-slate-100">{extracted.category}</dd>
            <dt className="text-slate-500">SKR03</dt>
            <dd className="text-slate-100">{extracted.skr03_account}</dd>
          </dl>
          {extracted.notes && (
            <p className="text-xs text-slate-400 italic bg-slate-900 rounded p-2">{extracted.notes}</p>
          )}
          <div className="flex gap-2 pt-1">
            <button
              onClick={handleApprove}
              className="flex-1 py-2.5 bg-cyan-500 text-slate-900 rounded-lg text-sm font-medium hover:bg-cyan-400 transition-colors"
            >
              Bestätigen & speichern
            </button>
            <button
              onClick={reset}
              className="flex-1 py-2.5 bg-slate-700 text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-600 transition-colors"
            >
              Verwerfen
            </button>
          </div>
        </div>
      )}

      {/* Compliance result */}
      {uiState === 'compliance' && compliance && (
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-100">§14 UStG Prüfung</h3>
            <span
              className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                compliance.is_compliant
                  ? 'bg-green-500/15 text-green-400 border border-green-500/20'
                  : 'bg-red-500/15 text-red-400 border border-red-500/20'
              }`}
            >
              {compliance.is_compliant ? 'Vollständig' : 'Unvollständig'}
            </span>
          </div>
          <ul className="space-y-1.5 text-sm">
            {COMPLIANCE_FIELDS.map(({ key, label }) => {
              const present = compliance[key] as boolean
              return (
                <li key={key} className="flex items-center gap-2">
                  <span className={present ? 'text-green-400' : 'text-red-400'}>
                    {present ? '✓' : '✗'}
                  </span>
                  <span className={present ? 'text-slate-300' : 'text-red-400 font-medium'}>
                    {label}
                  </span>
                </li>
              )
            })}
          </ul>
          {compliance.missing_fields.length > 0 && (
            <div className="bg-red-500/10 rounded-lg p-3 text-sm">
              <p className="font-medium text-red-400 mb-1">Bitte vor dem Versand ergänzen:</p>
              <ul className="list-disc list-inside text-red-400 space-y-0.5">
                {compliance.missing_fields.map(f => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </div>
          )}
          {compliance.notes && (
            <p className="text-xs text-slate-400 italic">{compliance.notes}</p>
          )}
          <button
            onClick={reset}
            className="w-full py-2.5 bg-slate-700 text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-600 transition-colors"
          >
            Neue Prüfung
          </button>
        </div>
      )}

      {error && (
        <p className="text-red-400 text-sm text-center bg-red-500/10 rounded-lg py-3">{error}</p>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Run tests**

```bash
npx vitest run
```

Expected: all existing tests pass.

- [ ] **Step 3: Commit**

```bash
git add src/components/steuerhelfer/Belegscanner.tsx
git commit -m "style: dark theme for Belegscanner"
```

---

## Task 3: Ausgaben — dark cards, cyan export, cyan amounts

**Files:**
- Modify: `src/components/steuerhelfer/Ausgaben.tsx`

- [ ] **Step 1: Replace the file content**

```tsx
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { Receipt } from '../../lib/types'

export function generateCSV(receipts: Receipt[]): string {
  const header = 'Datum,Händler,Kategorie,Brutto,Netto,MwSt-Satz,Vorsteuer,SKR03'
  const rows = receipts.map(r =>
    [r.date, r.vendor, r.category, r.amount_gross, r.amount_net, r.vat_rate, r.vat_amount, r.skr03_account]
      .map(v => `"${String(v ?? '').replace(/"/g, '""')}"`)
      .join(',')
  )
  return [header, ...rows].join('\n')
}

interface Props {
  refreshKey: number
}

export default function Ausgaben({ refreshKey }: Props) {
  const [receipts, setReceipts] = useState<Receipt[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    supabase
      .from('receipts')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) setReceipts(data as Receipt[])
        setLoading(false)
      })
  }, [refreshKey])

  async function deleteReceipt(id: string) {
    await supabase.from('receipts').delete().eq('id', id)
    setReceipts(prev => prev.filter(r => r.id !== id))
  }

  function exportCSV() {
    const csv = generateCSV(receipts)
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ausgaben-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const totalGross = receipts.reduce((sum, r) => sum + (r.amount_gross ?? 0), 0)
  const totalVAT = receipts.reduce((sum, r) => sum + (r.vat_amount ?? 0), 0)

  if (loading) {
    return <p className="text-center py-8 text-slate-500">Lade Ausgaben...</p>
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 flex-1">
          <p className="text-xs text-slate-500 uppercase tracking-wide">Ausgaben (brutto)</p>
          <p className="text-2xl font-bold text-slate-100 mt-1">{totalGross.toFixed(2)} €</p>
        </div>
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 flex-1">
          <p className="text-xs text-slate-500 uppercase tracking-wide">Vorsteuer gesamt</p>
          <p className="text-2xl font-bold text-cyan-500 mt-1">{totalVAT.toFixed(2)} €</p>
        </div>
      </div>

      <button
        onClick={exportCSV}
        className="w-full py-2 px-4 bg-gradient-to-r from-cyan-500 to-cyan-600 text-slate-900 rounded-lg text-sm font-bold hover:from-cyan-400 hover:to-cyan-500 transition-all"
      >
        DATEV-Export (CSV)
      </button>

      {receipts.length === 0 ? (
        <p className="text-center py-12 text-slate-500 text-sm">
          Noch keine Belege erfasst. Scannen Sie Ihren ersten Beleg.
        </p>
      ) : (
        <ul className="space-y-2">
          {receipts.map(r => (
            <li key={r.id} className="bg-slate-800 rounded-xl border border-slate-700 p-4 flex justify-between items-start gap-3">
              <div className="min-w-0">
                <p className="font-semibold text-slate-100 truncate">{r.vendor ?? '—'}</p>
                <p className="text-xs text-slate-500 mt-0.5">{r.date} · {r.category}</p>
                <p className="text-sm text-cyan-400 mt-1">{r.amount_gross?.toFixed(2)} € brutto</p>
                {r.description && (
                  <p className="text-xs text-slate-500 mt-0.5 truncate">{r.description}</p>
                )}
              </div>
              <button
                onClick={() => deleteReceipt(r.id)}
                className="text-slate-600 hover:text-red-400 text-xs shrink-0 mt-1 transition-colors"
                aria-label="Beleg löschen"
              >
                Löschen
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Run tests**

```bash
npx vitest run
```

Expected: all existing tests pass.

- [ ] **Step 3: Commit**

```bash
git add src/components/steuerhelfer/Ausgaben.tsx
git commit -m "style: dark theme for Ausgaben"
```

---

## Task 4: TaxChat — dark input, cyan bubbles and pills

**Files:**
- Modify: `src/components/steuerhelfer/TaxChat.tsx`

- [ ] **Step 1: Replace the file content**

```tsx
import { useRef, useState } from 'react'
import { sendChatMessage } from '../../lib/n8n'
import type { ChatMessage } from '../../lib/types'

const QUICK_QUESTIONS = [
  'Welche Belege brauche ich für Bewirtung?',
  'Was ist der MwSt-Satz für Hopfen?',
  'Wann ist die nächste UStVA fällig?',
]

export default function TaxChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  async function send(text: string) {
    const trimmed = text.trim()
    if (!trimmed || loading) return

    const userMsg: ChatMessage = { role: 'user', content: trimmed }
    const updatedHistory = [...messages, userMsg]
    setMessages(updatedHistory)
    setInput('')
    setLoading(true)

    try {
      const reply = await sendChatMessage(trimmed, messages)
      setMessages([...updatedHistory, { role: 'assistant', content: reply }])
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unbekannter Fehler'
      setMessages([
        ...updatedHistory,
        { role: 'assistant', content: `Verbindungsfehler: ${msg}` },
      ])
    }

    setLoading(false)
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
  }

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 180px)' }}>
      <div className="flex gap-2 mb-3 flex-wrap">
        {QUICK_QUESTIONS.map(q => (
          <button
            key={q}
            onClick={() => send(q)}
            disabled={loading}
            className="text-xs px-3 py-1.5 bg-cyan-500/10 text-cyan-400 rounded-full border border-cyan-500/20 hover:bg-cyan-500/20 disabled:opacity-50 transition-colors"
          >
            {q}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 mb-3">
        {messages.length === 0 && (
          <p className="text-center text-slate-500 py-10 text-sm">
            Stellen Sie Ihre Steuerfrage oder wählen Sie eine Schnellfrage.
          </p>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                m.role === 'user'
                  ? 'bg-cyan-500 text-slate-900 font-medium rounded-br-sm'
                  : 'bg-slate-800 border border-slate-700 text-slate-300 rounded-bl-sm'
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-bl-sm px-4 py-2.5 text-sm text-slate-500">
              Runly Steuerberater schreibt...
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input) } }}
          placeholder="Ihre Frage..."
          disabled={loading}
          className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 disabled:opacity-50"
        />
        <button
          onClick={() => send(input)}
          disabled={loading || !input.trim()}
          className="px-4 py-2.5 bg-cyan-500 text-slate-900 rounded-xl text-sm font-bold disabled:opacity-40 hover:bg-cyan-400 transition-colors"
        >
          Senden
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Run tests**

```bash
npx vitest run
```

Expected: all existing tests pass.

- [ ] **Step 3: Commit**

```bash
git add src/components/steuerhelfer/TaxChat.tsx
git commit -m "style: dark theme for TaxChat"
```

---

## Task 5: DeadlineEngine — dark cards, translucent urgency badges

**Files:**
- Modify: `src/components/steuerhelfer/DeadlineEngine.tsx`

- [ ] **Step 1: Update URGENCY_STYLES and all className strings**

Change only the `URGENCY_STYLES` constant and the JSX classNames — all logic stays identical.

In `DeadlineEngine.tsx`, replace the `URGENCY_STYLES` constant:

```ts
const URGENCY_STYLES: Record<Deadline['urgency'], string> = {
  urgent: 'bg-red-500/15 text-red-400 border border-red-500/20',
  soon: 'bg-amber-500/15 text-amber-400 border border-amber-500/20',
  ok: 'bg-green-500/15 text-green-400 border border-green-500/20',
}
```

Replace the `DeadlineEngine` component's JSX return:

```tsx
export default function DeadlineEngine() {
  const [hasEmployees, setHasEmployees] = useState(false)
  const deadlines = computeDeadlines(hasEmployees)

  return (
    <div className="space-y-4">
      <label className="flex items-center gap-2.5 text-sm text-slate-300 cursor-pointer">
        <input
          type="checkbox"
          checked={hasEmployees}
          onChange={e => setHasEmployees(e.target.checked)}
          className="w-4 h-4 rounded accent-cyan-500"
        />
        Ich habe Angestellte
      </label>

      <ul className="space-y-2">
        {deadlines.map(d => (
          <li
            key={d.name}
            className="bg-slate-800 rounded-xl border border-slate-700 p-4 flex justify-between items-start gap-3"
          >
            <div className="min-w-0">
              <p className="font-semibold text-slate-100 text-sm">{d.name}</p>
              <p className="text-xs text-slate-500 mt-0.5">{d.description}</p>
              <p className="text-xs text-slate-400 mt-1.5">
                Fällig: {d.dueDate.toLocaleDateString('de-DE')}
                {' '}
                <span className="text-slate-500">
                  ({d.daysRemaining > 0 ? `in ${d.daysRemaining} Tagen` : 'heute'})
                </span>
              </p>
            </div>
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${URGENCY_STYLES[d.urgency]}`}>
              {URGENCY_LABEL[d.urgency]}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
```

- [ ] **Step 2: Run tests**

```bash
npx vitest run
```

Expected: all existing tests pass.

- [ ] **Step 3: Commit**

```bash
git add src/components/steuerhelfer/DeadlineEngine.tsx
git commit -m "style: dark theme for DeadlineEngine"
```

---

## Task 6: Verify full build

- [ ] **Step 1: Run TypeScript build**

```bash
npx tsc --noEmit
```

Expected: no type errors.

- [ ] **Step 2: Run dev server and visually check all 4 tabs**

```bash
npm run dev
```

Open `http://localhost:5173` in the browser, navigate to the Steuerhelfer app, and verify:
- Dark navy background on all tabs
- Cyan accent on active tab indicator, buttons, and amounts
- No white or gray backgrounds remaining in any panel

- [ ] **Step 3: Final commit if any touch-ups were needed**

```bash
git add -p
git commit -m "style: dark theme touch-ups after visual review"
```
