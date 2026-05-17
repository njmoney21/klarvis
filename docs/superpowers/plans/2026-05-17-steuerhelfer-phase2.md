# Steuerhelfer Phase 2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Steuerhelfer AI tax assistant at `/app` inside the existing klarvis Vite + React 19 project, with receipt scanning, expense tracking via Supabase, AI chat, and deadline management.

**Architecture:** React Router v6 splits `/` (existing klarvis marketing site, untouched) from `/app` (Steuerhelfer shell). All AI calls route through n8n Cloud webhooks — the Anthropic API key never touches the frontend. Supabase browser client handles reads/deletes directly; n8n handles inserts using the service role key.

**Tech Stack:** Vite + React 19 + TypeScript + Tailwind CSS v4 · React Router v6 · @supabase/supabase-js · n8n Cloud webhooks · Vercel (SPA routing only)

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `package.json` | Modify | Add react-router-dom, @supabase/supabase-js |
| `vite.config.ts` | Modify | Add test env vars |
| `vercel.json` | Create | SPA rewrite rule |
| `.env.local` | Create | Supabase + n8n webhook URLs |
| `src/lib/types.ts` | Create | Shared TypeScript interfaces |
| `src/lib/supabase.ts` | Create | Supabase browser client |
| `src/lib/n8n.ts` | Create | Typed fetch helpers for 3 n8n webhooks |
| `src/App.tsx` | Modify | Add BrowserRouter + Routes |
| `src/pages/SteuerhelferApp.tsx` | Create | 4-tab shell, manages refreshKey |
| `src/components/steuerhelfer/Ausgaben.tsx` | Create | Supabase reads/deletes, CSV export |
| `src/components/steuerhelfer/TaxChat.tsx` | Create | n8n chat webhook, message history |
| `src/components/steuerhelfer/Belegscanner.tsx` | Create | Scan + §14 UStG invoice compliance |
| `src/components/steuerhelfer/DeadlineEngine.tsx` | Create | Pure frontend deadline calculator |
| `src/tests/n8n.test.ts` | Create | Unit tests for n8n fetch helpers |
| `src/tests/Ausgaben.test.ts` | Create | Unit test for CSV generation |
| `src/tests/DeadlineEngine.test.ts` | Create | Unit tests for deadline date logic |

---

## Task 1: Install dependencies, env setup, vercel.json

**Files:**
- Modify: `package.json`
- Create: `vercel.json`
- Create: `.env.local`
- Modify: `vite.config.ts`

- [ ] **Step 1: Install packages**

```bash
npm install react-router-dom @supabase/supabase-js
```

Expected: `package.json` updated, no errors.

- [ ] **Step 2: Create vercel.json**

Create `vercel.json` at project root:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

- [ ] **Step 3: Create .env.local**

Create `.env.local` at project root and fill in your actual values:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_N8N_SCAN=https://yourname.app.n8n.cloud/webhook/scan-receipt
VITE_N8N_CHAT=https://yourname.app.n8n.cloud/webhook/chat
VITE_N8N_INVOICE=https://yourname.app.n8n.cloud/webhook/check-invoice
```

- [ ] **Step 4: Add test env vars to vite.config.ts**

Replace the full contents of `vite.config.ts`:

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/tests/setup.ts'],
    globals: true,
    env: {
      VITE_N8N_SCAN: 'http://test/scan',
      VITE_N8N_CHAT: 'http://test/chat',
      VITE_N8N_INVOICE: 'http://test/invoice',
    },
  },
})
```

- [ ] **Step 5: Verify dev server still starts**

```bash
npm run dev
```

Expected: Vite starts on localhost:5173 with no errors.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json vite.config.ts vercel.json
git commit -m "chore: add react-router-dom, supabase, vercel SPA config"
```

---

## Task 2: Shared TypeScript types

**Files:**
- Create: `src/lib/types.ts`

- [ ] **Step 1: Create src/lib/types.ts**

```typescript
export interface Receipt {
  id: string
  created_at: string
  vendor: string | null
  amount_gross: number | null
  amount_net: number | null
  vat_rate: number | null
  vat_amount: number | null
  date: string | null
  category: string | null
  skr03_account: string | null
  description: string | null
  deductible: boolean
  notes: string | null
  image_url: string | null
}

export interface ExtractedReceipt {
  vendor: string
  amount_gross: number
  amount_net: number
  vat_rate: number
  vat_amount: number
  date: string
  category: string
  skr03_account: string
  description: string
  deductible: boolean
  notes: string
}

export interface ComplianceResult {
  has_vendor_name: boolean
  has_vendor_address: boolean
  has_recipient_name: boolean
  has_recipient_address: boolean
  has_tax_number_or_uid: boolean
  has_invoice_date: boolean
  has_invoice_number: boolean
  has_service_description: boolean
  has_service_period: boolean
  has_net_amount: boolean
  has_vat_rate_and_amount: boolean
  has_gross_amount: boolean
  missing_fields: string[]
  is_compliant: boolean
  notes: string
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/types.ts
git commit -m "feat: add shared TypeScript interfaces"
```

---

## Task 3: Supabase client

**Files:**
- Create: `src/lib/supabase.ts`

Before this step, make sure you have created the `receipts` table in your Supabase project. Run this SQL in the Supabase SQL editor:

```sql
create table receipts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  vendor text,
  amount_gross numeric,
  amount_net numeric,
  vat_rate numeric,
  vat_amount numeric,
  date date,
  category text,
  skr03_account text,
  description text,
  deductible boolean default true,
  notes text,
  image_url text  -- null for this prototype
);

-- Enable RLS
alter table receipts enable row level security;

-- Allow anon to read and delete (single-user prototype)
create policy "anon_select" on receipts for select to anon using (true);
create policy "anon_delete" on receipts for delete to anon using (true);

-- Service role (used by n8n) can insert without a policy (service role bypasses RLS)
```

- [ ] **Step 1: Create src/lib/supabase.ts**

```typescript
import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(url, key)
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/supabase.ts
git commit -m "feat: add Supabase browser client"
```

---

## Task 4: n8n fetch helpers + tests

**Files:**
- Create: `src/lib/n8n.ts`
- Create: `src/tests/n8n.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `src/tests/n8n.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { scanReceipt, sendChatMessage, checkInvoice } from '../lib/n8n'

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn())
})

afterEach(() => {
  vi.unstubAllGlobals()
})

const mockFetch = (body: unknown, ok = true) =>
  (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
    ok,
    status: ok ? 200 : 500,
    json: () => Promise.resolve(body),
  })

describe('scanReceipt', () => {
  it('posts base64 image and returns extracted receipt', async () => {
    const receipt = { vendor: 'REWE', amount_gross: 23.5 }
    mockFetch(receipt)
    const result = await scanReceipt('abc123')
    expect(fetch).toHaveBeenCalledWith(
      'http://test/scan',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: 'abc123' }),
      })
    )
    expect(result).toEqual(receipt)
  })

  it('throws on non-ok response', async () => {
    mockFetch(null, false)
    await expect(scanReceipt('x')).rejects.toThrow('scan-receipt failed: 500')
  })
})

describe('sendChatMessage', () => {
  it('posts message and history, returns reply string', async () => {
    mockFetch({ reply: 'Der MwSt-Satz für Hopfen beträgt 7%.' })
    const history = [{ role: 'user' as const, content: 'Frage' }, { role: 'assistant' as const, content: 'Antwort' }]
    const reply = await sendChatMessage('Neues', history)
    expect(fetch).toHaveBeenCalledWith(
      'http://test/chat',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ message: 'Neues', history }),
      })
    )
    expect(reply).toBe('Der MwSt-Satz für Hopfen beträgt 7%.')
  })

  it('throws on non-ok response', async () => {
    mockFetch(null, false)
    await expect(sendChatMessage('x', [])).rejects.toThrow('chat failed: 500')
  })
})

describe('checkInvoice', () => {
  it('posts base64 image and returns compliance result', async () => {
    const compliance = { is_compliant: false, missing_fields: ['Steuernummer'] }
    mockFetch(compliance)
    const result = await checkInvoice('img64')
    expect(fetch).toHaveBeenCalledWith(
      'http://test/invoice',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ image: 'img64' }),
      })
    )
    expect(result).toEqual(compliance)
  })

  it('throws on non-ok response', async () => {
    mockFetch(null, false)
    await expect(checkInvoice('x')).rejects.toThrow('check-invoice failed: 500')
  })
})
```

- [ ] **Step 2: Run tests — expect FAIL (module doesn't exist yet)**

```bash
npm test -- src/tests/n8n.test.ts
```

Expected: FAIL — "Cannot find module '../lib/n8n'"

- [ ] **Step 3: Create src/lib/n8n.ts**

```typescript
import type { ExtractedReceipt, ComplianceResult, ChatMessage } from './types'

const SCAN_URL = import.meta.env.VITE_N8N_SCAN as string
const CHAT_URL = import.meta.env.VITE_N8N_CHAT as string
const INVOICE_URL = import.meta.env.VITE_N8N_INVOICE as string

export async function scanReceipt(base64Image: string): Promise<ExtractedReceipt> {
  const res = await fetch(SCAN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: base64Image }),
  })
  if (!res.ok) throw new Error(`scan-receipt failed: ${res.status}`)
  return res.json() as Promise<ExtractedReceipt>
}

export async function sendChatMessage(
  message: string,
  history: ChatMessage[]
): Promise<string> {
  const res = await fetch(CHAT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history }),
  })
  if (!res.ok) throw new Error(`chat failed: ${res.status}`)
  const data = await res.json() as { reply: string }
  return data.reply
}

export async function checkInvoice(base64Image: string): Promise<ComplianceResult> {
  const res = await fetch(INVOICE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: base64Image }),
  })
  if (!res.ok) throw new Error(`check-invoice failed: ${res.status}`)
  return res.json() as Promise<ComplianceResult>
}
```

- [ ] **Step 4: Run tests — expect PASS**

```bash
npm test -- src/tests/n8n.test.ts
```

Expected: 6 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/lib/n8n.ts src/tests/n8n.test.ts
git commit -m "feat: add n8n webhook helpers with tests"
```

---

## Task 5: Wire React Router

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Update src/App.tsx**

Replace the full file:

```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import SectionHero from './components/SectionHero'
import SectionLeistungen from './components/SectionLeistungen'
import SectionProcess from './components/SectionProcess'
import SectionGallery from './components/SectionGallery'
import SectionPreise from './components/SectionPreise'
import SectionKontakt from './components/SectionKontakt'
import Footer from './components/Footer'
import SteuerhelferApp from './pages/SteuerhelferApp'

function KlarvisSite() {
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

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/app" element={<SteuerhelferApp />} />
        <Route path="/*" element={<KlarvisSite />} />
      </Routes>
    </BrowserRouter>
  )
}
```

- [ ] **Step 2: Create a placeholder SteuerhelferApp so the import doesn't break**

Create `src/pages/SteuerhelferApp.tsx` (temporary placeholder — will be replaced in Task 6):

```tsx
export default function SteuerhelferApp() {
  return <p style={{ padding: 32 }}>Steuerhelfer wird geladen...</p>
}
```

- [ ] **Step 3: Verify dev server compiles and both routes work**

```bash
npm run dev
```

Open `http://localhost:5173` — klarvis marketing site loads.  
Open `http://localhost:5173/app` — "Steuerhelfer wird geladen..." appears.

- [ ] **Step 4: Commit**

```bash
git add src/App.tsx src/pages/SteuerhelferApp.tsx
git commit -m "feat: add React Router, /app route placeholder"
```

---

## Task 6: SteuerhelferApp tab shell

**Files:**
- Modify: `src/pages/SteuerhelferApp.tsx` (replace placeholder)
- Create: `src/components/steuerhelfer/Ausgaben.tsx` (placeholder)
- Create: `src/components/steuerhelfer/TaxChat.tsx` (placeholder)
- Create: `src/components/steuerhelfer/Belegscanner.tsx` (placeholder)
- Create: `src/components/steuerhelfer/DeadlineEngine.tsx` (placeholder)

- [ ] **Step 1: Create placeholder child components**

Create `src/components/steuerhelfer/Ausgaben.tsx`:

```tsx
export default function Ausgaben({ refreshKey }: { refreshKey: number }) {
  return <p className="text-gray-500 py-8 text-center">Ausgaben ({refreshKey})</p>
}
```

Create `src/components/steuerhelfer/TaxChat.tsx`:

```tsx
export default function TaxChat() {
  return <p className="text-gray-500 py-8 text-center">Steuer-FAQ</p>
}
```

Create `src/components/steuerhelfer/Belegscanner.tsx`:

```tsx
export default function Belegscanner({ onApproved }: { onApproved: () => void }) {
  return (
    <button onClick={onApproved} className="text-gray-500 py-8 text-center block w-full">
      Belegscanner
    </button>
  )
}
```

Create `src/components/steuerhelfer/DeadlineEngine.tsx`:

```tsx
export default function DeadlineEngine() {
  return <p className="text-gray-500 py-8 text-center">Fristen</p>
}
```

- [ ] **Step 2: Replace src/pages/SteuerhelferApp.tsx**

```tsx
import { useState } from 'react'
import Belegscanner from '../components/steuerhelfer/Belegscanner'
import Ausgaben from '../components/steuerhelfer/Ausgaben'
import TaxChat from '../components/steuerhelfer/TaxChat'
import DeadlineEngine from '../components/steuerhelfer/DeadlineEngine'

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

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <h1 className="text-xl font-bold text-gray-900">Steuerhelfer</h1>
        <p className="text-sm text-gray-500">KI-Assistent für Kleinunternehmer</p>
      </header>

      <nav className="bg-white border-b border-gray-200 overflow-x-auto">
        <div className="flex min-w-max">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap ${
                activeTab === tab
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
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

- [ ] **Step 3: Verify in browser**

```bash
npm run dev
```

Open `http://localhost:5173/app`. Check: 4 tabs render, clicking each switches the content pane. No console errors.

- [ ] **Step 4: Commit**

```bash
git add src/pages/SteuerhelferApp.tsx src/components/steuerhelfer/
git commit -m "feat: add SteuerhelferApp tab shell with placeholder children"
```

---

## Task 7: Ausgaben component

**Files:**
- Modify: `src/components/steuerhelfer/Ausgaben.tsx`
- Create: `src/tests/Ausgaben.test.ts`

- [ ] **Step 1: Write failing test for generateCSV**

Create `src/tests/Ausgaben.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { generateCSV } from '../components/steuerhelfer/Ausgaben'
import type { Receipt } from '../lib/types'

const makeReceipt = (overrides: Partial<Receipt> = {}): Receipt => ({
  id: 'abc',
  created_at: '2026-05-01T10:00:00Z',
  vendor: 'REWE',
  amount_gross: 23.5,
  amount_net: 19.75,
  vat_rate: 19,
  vat_amount: 3.75,
  date: '2026-05-01',
  category: 'Büromaterial',
  skr03_account: '4930',
  description: 'Bürobedarf',
  deductible: true,
  notes: null,
  image_url: null,
  ...overrides,
})

describe('generateCSV', () => {
  it('produces correct DATEV header', () => {
    const csv = generateCSV([])
    const header = csv.split('\n')[0]
    expect(header).toBe('Datum,Händler,Kategorie,Brutto,Netto,MwSt-Satz,Vorsteuer,SKR03')
  })

  it('produces one row per receipt with quoted values', () => {
    const csv = generateCSV([makeReceipt()])
    const lines = csv.split('\n')
    expect(lines).toHaveLength(2)
    expect(lines[1]).toBe('"2026-05-01","REWE","Büromaterial","23.5","19.75","19","3.75","4930"')
  })

  it('handles null fields with empty quotes', () => {
    const csv = generateCSV([makeReceipt({ vendor: null, skr03_account: null })])
    const row = csv.split('\n')[1]
    expect(row).toContain('""')
  })
})
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
npm test -- src/tests/Ausgaben.test.ts
```

Expected: FAIL — "generateCSV is not a function" (module doesn't export it yet).

- [ ] **Step 3: Replace src/components/steuerhelfer/Ausgaben.tsx**

```tsx
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { Receipt } from '../../lib/types'

export function generateCSV(receipts: Receipt[]): string {
  const header = 'Datum,Händler,Kategorie,Brutto,Netto,MwSt-Satz,Vorsteuer,SKR03'
  const rows = receipts.map(r =>
    [r.date, r.vendor, r.category, r.amount_gross, r.amount_net, r.vat_rate, r.vat_amount, r.skr03_account]
      .map(v => `"${v ?? ''}"`)
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
    return <p className="text-center py-8 text-gray-400">Lade Ausgaben...</p>
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <div className="bg-white rounded-xl p-4 border border-gray-200 flex-1">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Ausgaben (brutto)</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{totalGross.toFixed(2)} €</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 flex-1">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Vorsteuer gesamt</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{totalVAT.toFixed(2)} €</p>
        </div>
      </div>

      <button
        onClick={exportCSV}
        className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
      >
        DATEV-Export (CSV)
      </button>

      {receipts.length === 0 ? (
        <p className="text-center py-12 text-gray-400 text-sm">
          Noch keine Belege erfasst. Scannen Sie Ihren ersten Beleg.
        </p>
      ) : (
        <ul className="space-y-2">
          {receipts.map(r => (
            <li key={r.id} className="bg-white rounded-xl border border-gray-200 p-4 flex justify-between items-start gap-3">
              <div className="min-w-0">
                <p className="font-medium text-gray-900 truncate">{r.vendor ?? '—'}</p>
                <p className="text-xs text-gray-500 mt-0.5">{r.date} · {r.category}</p>
                <p className="text-sm text-gray-700 mt-1">{r.amount_gross?.toFixed(2)} € brutto</p>
                {r.description && (
                  <p className="text-xs text-gray-400 mt-0.5 truncate">{r.description}</p>
                )}
              </div>
              <button
                onClick={() => deleteReceipt(r.id)}
                className="text-red-400 hover:text-red-600 text-xs shrink-0 mt-1"
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

- [ ] **Step 4: Run tests — expect PASS**

```bash
npm test -- src/tests/Ausgaben.test.ts
```

Expected: 3 tests pass.

- [ ] **Step 5: Verify in browser**

Start dev server, go to `/app`, switch to Ausgaben tab. Should show loading state then "Noch keine Belege erfasst."

- [ ] **Step 6: Commit**

```bash
git add src/components/steuerhelfer/Ausgaben.tsx src/tests/Ausgaben.test.ts
git commit -m "feat: Ausgaben component with Supabase integration and DATEV CSV export"
```

---

## Task 8: TaxChat component

**Files:**
- Modify: `src/components/steuerhelfer/TaxChat.tsx`

- [ ] **Step 1: Replace src/components/steuerhelfer/TaxChat.tsx**

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
    } catch {
      setMessages([
        ...updatedHistory,
        { role: 'assistant', content: 'Verbindungsfehler. Bitte erneut versuchen.' },
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
            className="text-xs px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full border border-blue-200 hover:bg-blue-100 disabled:opacity-50 transition-colors"
          >
            {q}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 mb-3">
        {messages.length === 0 && (
          <p className="text-center text-gray-400 py-10 text-sm">
            Stellen Sie Ihre Steuerfrage oder wählen Sie eine Schnellfrage.
          </p>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                m.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-sm'
                  : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm'
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-2.5 text-sm text-gray-400">
              Steuerhelfer schreibt...
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
          className="flex-1 border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400 disabled:opacity-50"
        />
        <button
          onClick={() => send(input)}
          disabled={loading || !input.trim()}
          className="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium disabled:opacity-40 hover:bg-blue-700 transition-colors"
        >
          Senden
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify in browser**

Go to `/app`, click "Steuer-FAQ" tab. Check:
- Quick-question buttons appear
- Clicking one sends a message (will fail to reach n8n if webhooks not configured yet — that's OK, the error message "Verbindungsfehler" should appear)
- Typing in input and pressing Enter submits
- No console errors

- [ ] **Step 3: Commit**

```bash
git add src/components/steuerhelfer/TaxChat.tsx
git commit -m "feat: TaxChat component with quick questions and n8n chat webhook"
```

---

## Task 9: Belegscanner component

**Files:**
- Modify: `src/components/steuerhelfer/Belegscanner.tsx`

- [ ] **Step 1: Replace src/components/steuerhelfer/Belegscanner.tsx**

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
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
            }`}
          >
            {m === 'scan' ? 'Beleg scannen' : 'Ausgangsrechnung prüfen'}
          </button>
        ))}
      </div>

      {/* Upload area */}
      {uiState === 'idle' && (
        <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-10 cursor-pointer hover:border-blue-400 transition-colors">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
          />
          <span className="text-3xl mb-2">📷</span>
          <p className="text-sm text-gray-600 font-medium">Foto hochladen</p>
          <p className="text-xs text-gray-400 mt-1">JPG, PNG, HEIC</p>
        </label>
      )}

      {/* Loading */}
      {uiState === 'loading' && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-sm">Analysiere Dokument...</p>
        </div>
      )}

      {/* Receipt preview */}
      {uiState === 'preview' && extracted && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
          <h3 className="font-semibold text-gray-900">Extrahierte Daten</h3>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <dt className="text-gray-500">Händler</dt>
            <dd className="text-gray-900 font-medium">{extracted.vendor}</dd>
            <dt className="text-gray-500">Datum</dt>
            <dd>{extracted.date}</dd>
            <dt className="text-gray-500">Brutto</dt>
            <dd>{extracted.amount_gross.toFixed(2)} €</dd>
            <dt className="text-gray-500">Netto</dt>
            <dd>{extracted.amount_net.toFixed(2)} €</dd>
            <dt className="text-gray-500">MwSt-Satz</dt>
            <dd>{extracted.vat_rate} %</dd>
            <dt className="text-gray-500">Vorsteuer</dt>
            <dd>{extracted.vat_amount.toFixed(2)} €</dd>
            <dt className="text-gray-500">Kategorie</dt>
            <dd>{extracted.category}</dd>
            <dt className="text-gray-500">SKR03</dt>
            <dd>{extracted.skr03_account}</dd>
          </dl>
          {extracted.notes && (
            <p className="text-xs text-gray-500 italic bg-gray-50 rounded p-2">{extracted.notes}</p>
          )}
          <div className="flex gap-2 pt-1">
            <button
              onClick={handleApprove}
              className="flex-1 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
            >
              Bestätigen & speichern
            </button>
            <button
              onClick={reset}
              className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              Verwerfen
            </button>
          </div>
        </div>
      )}

      {/* Compliance result */}
      {uiState === 'compliance' && compliance && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">§14 UStG Prüfung</h3>
            <span
              className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                compliance.is_compliant
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
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
                  <span className={present ? 'text-green-500' : 'text-red-500'}>
                    {present ? '✓' : '✗'}
                  </span>
                  <span className={present ? 'text-gray-700' : 'text-red-700 font-medium'}>
                    {label}
                  </span>
                </li>
              )
            })}
          </ul>
          {compliance.missing_fields.length > 0 && (
            <div className="bg-red-50 rounded-lg p-3 text-sm">
              <p className="font-medium text-red-800 mb-1">Bitte vor dem Versand ergänzen:</p>
              <ul className="list-disc list-inside text-red-700 space-y-0.5">
                {compliance.missing_fields.map(f => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </div>
          )}
          {compliance.notes && (
            <p className="text-xs text-gray-500 italic">{compliance.notes}</p>
          )}
          <button
            onClick={reset}
            className="w-full py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            Neue Prüfung
          </button>
        </div>
      )}

      {error && (
        <p className="text-red-600 text-sm text-center bg-red-50 rounded-lg py-3">{error}</p>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Verify in browser**

Go to `/app`, Belegscanner tab. Check:
- Mode toggle switches between "Beleg scannen" and "Ausgangsrechnung prüfen"
- File input appears, accepts images
- Loading state shows while processing
- Error state appears if n8n not yet configured
- No TypeScript errors: `npx tsc --noEmit`

- [ ] **Step 3: Commit**

```bash
git add src/components/steuerhelfer/Belegscanner.tsx
git commit -m "feat: Belegscanner with receipt scan and §14 UStG invoice compliance modes"
```

---

## Task 10: DeadlineEngine component + tests

**Files:**
- Modify: `src/components/steuerhelfer/DeadlineEngine.tsx`
- Create: `src/tests/DeadlineEngine.test.ts`

- [ ] **Step 1: Write failing tests**

Create `src/tests/DeadlineEngine.test.ts`:

```typescript
import { describe, it, expect, vi, afterEach } from 'vitest'
import { getDaysRemaining, urgency, computeDeadlines } from '../components/steuerhelfer/DeadlineEngine'

afterEach(() => {
  vi.useRealTimers()
})

describe('getDaysRemaining', () => {
  it('returns 0 for today', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-05-17'))
    expect(getDaysRemaining(new Date('2026-05-17'))).toBe(0)
  })

  it('returns 7 for a date 7 days from now', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-05-17'))
    expect(getDaysRemaining(new Date('2026-05-24'))).toBe(7)
  })

  it('returns negative for past dates', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-05-17'))
    expect(getDaysRemaining(new Date('2026-05-10'))).toBeLessThan(0)
  })
})

describe('urgency', () => {
  it('returns urgent for 0 days', () => {
    expect(urgency(0)).toBe('urgent')
  })

  it('returns urgent for 14 days', () => {
    expect(urgency(14)).toBe('urgent')
  })

  it('returns soon for 15 days', () => {
    expect(urgency(15)).toBe('soon')
  })

  it('returns soon for 30 days', () => {
    expect(urgency(30)).toBe('soon')
  })

  it('returns ok for 31 days', () => {
    expect(urgency(31)).toBe('ok')
  })
})

describe('computeDeadlines', () => {
  it('returns 5 deadlines without employees', () => {
    const deadlines = computeDeadlines(false)
    expect(deadlines).toHaveLength(5)
  })

  it('returns 6 deadlines with employees', () => {
    const deadlines = computeDeadlines(true)
    expect(deadlines).toHaveLength(6)
  })

  it('sorts deadlines by daysRemaining ascending', () => {
    const deadlines = computeDeadlines(false)
    for (let i = 1; i < deadlines.length; i++) {
      expect(deadlines[i].daysRemaining).toBeGreaterThanOrEqual(deadlines[i - 1].daysRemaining)
    }
  })

  it('all deadlines have future due dates', () => {
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    computeDeadlines(true).forEach(d => {
      expect(d.dueDate.getTime()).toBeGreaterThan(now.getTime())
    })
  })
})
```

- [ ] **Step 2: Run tests — expect FAIL**

```bash
npm test -- src/tests/DeadlineEngine.test.ts
```

Expected: FAIL — exported functions not found.

- [ ] **Step 3: Replace src/components/steuerhelfer/DeadlineEngine.tsx**

```tsx
import { useState } from 'react'

interface Deadline {
  name: string
  description: string
  dueDate: Date
  daysRemaining: number
  urgency: 'urgent' | 'soon' | 'ok'
  isEmployeeOnly: boolean
}

export function getDaysRemaining(date: Date): number {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const target = new Date(date)
  target.setHours(0, 0, 0, 0)
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

export function urgency(days: number): 'urgent' | 'soon' | 'ok' {
  if (days <= 14) return 'urgent'
  if (days <= 30) return 'soon'
  return 'ok'
}

function nextFutureDate(year: number, month: number, day: number): Date {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const d = new Date(year, month - 1, day)
  d.setHours(0, 0, 0, 0)
  return d > now ? d : new Date(year + 1, month - 1, day)
}

function nextQuarterlyUStVA(): Date {
  // Due: Apr 10, Jul 10, Oct 10, Jan 10 (following year)
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const year = now.getFullYear()
  const candidates = [
    new Date(year, 3, 10),
    new Date(year, 6, 10),
    new Date(year, 9, 10),
    new Date(year + 1, 0, 10),
  ]
  return candidates.find(d => { d.setHours(0, 0, 0, 0); return d > now }) ?? candidates[candidates.length - 1]
}

function nextQuarterlyVorauszahlung(): Date {
  // Due: Mar 10, Jun 10, Sep 10, Dec 10
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const year = now.getFullYear()
  const candidates = [
    new Date(year, 2, 10),
    new Date(year, 5, 10),
    new Date(year, 8, 10),
    new Date(year, 11, 10),
    new Date(year + 1, 2, 10),
  ]
  return candidates.find(d => { d.setHours(0, 0, 0, 0); return d > now }) ?? candidates[candidates.length - 1]
}

function nextMonthlyOn10th(): Date {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const year = now.getFullYear()
  const month = now.getMonth()
  const thisMonth = new Date(year, month, 10)
  thisMonth.setHours(0, 0, 0, 0)
  return thisMonth > now ? thisMonth : new Date(year, month + 1, 10)
}

export function computeDeadlines(includeEmployees: boolean): Deadline[] {
  const year = new Date().getFullYear()

  const all: Omit<Deadline, 'daysRemaining' | 'urgency'>[] = [
    {
      name: 'Umsatzsteuer-Voranmeldung (UStVA)',
      description: '10. des Folgemonats nach Quartalsende',
      dueDate: nextQuarterlyUStVA(),
      isEmployeeOnly: false,
    },
    {
      name: 'Einkommensteuer-Vorauszahlung',
      description: 'Quartalsweise: 10. März, Juni, September, Dezember',
      dueDate: nextQuarterlyVorauszahlung(),
      isEmployeeOnly: false,
    },
    {
      name: 'Umsatzsteuererklärung',
      description: `Jahreserklärung fällig 31. Juli ${year}`,
      dueDate: nextFutureDate(year, 7, 31),
      isEmployeeOnly: false,
    },
    {
      name: 'Einkommensteuererklärung',
      description: `Jahreserklärung fällig 31. Juli ${year}`,
      dueDate: nextFutureDate(year, 7, 31),
      isEmployeeOnly: false,
    },
    {
      name: 'Gewerbesteuererklärung',
      description: `Jahreserklärung fällig 31. Juli ${year}`,
      dueDate: nextFutureDate(year, 7, 31),
      isEmployeeOnly: false,
    },
    {
      name: 'Lohnsteuer-Anmeldung',
      description: '10. des Folgemonats (nur bei Angestellten)',
      dueDate: nextMonthlyOn10th(),
      isEmployeeOnly: true,
    },
  ]

  return all
    .filter(d => !d.isEmployeeOnly || includeEmployees)
    .map(d => {
      const days = getDaysRemaining(d.dueDate)
      return { ...d, daysRemaining: days, urgency: urgency(days) }
    })
    .sort((a, b) => a.daysRemaining - b.daysRemaining)
}

const URGENCY_STYLES: Record<Deadline['urgency'], string> = {
  urgent: 'bg-red-100 text-red-700 border border-red-200',
  soon: 'bg-amber-100 text-amber-700 border border-amber-200',
  ok: 'bg-green-100 text-green-700 border border-green-200',
}

const URGENCY_LABEL: Record<Deadline['urgency'], string> = {
  urgent: 'Dringend',
  soon: 'Bald fällig',
  ok: 'OK',
}

export default function DeadlineEngine() {
  const [hasEmployees, setHasEmployees] = useState(false)
  const deadlines = computeDeadlines(hasEmployees)

  return (
    <div className="space-y-4">
      <label className="flex items-center gap-2.5 text-sm text-gray-700 cursor-pointer">
        <input
          type="checkbox"
          checked={hasEmployees}
          onChange={e => setHasEmployees(e.target.checked)}
          className="w-4 h-4 rounded accent-blue-600"
        />
        Ich habe Angestellte
      </label>

      <ul className="space-y-2">
        {deadlines.map(d => (
          <li
            key={d.name}
            className="bg-white rounded-xl border border-gray-200 p-4 flex justify-between items-start gap-3"
          >
            <div className="min-w-0">
              <p className="font-medium text-gray-900 text-sm">{d.name}</p>
              <p className="text-xs text-gray-500 mt-0.5">{d.description}</p>
              <p className="text-xs text-gray-700 mt-1.5">
                Fällig: {d.dueDate.toLocaleDateString('de-DE')}
                {' '}
                <span className="text-gray-500">
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

- [ ] **Step 4: Run tests — expect PASS**

```bash
npm test -- src/tests/DeadlineEngine.test.ts
```

Expected: 10 tests pass.

- [ ] **Step 5: Run all tests**

```bash
npm test
```

Expected: All tests pass (n8n, Ausgaben, DeadlineEngine, Navbar, SectionPreise).

- [ ] **Step 6: Verify in browser**

Go to `/app`, click "Fristen" tab. Check:
- 5 deadlines shown without employee checkbox
- 6 shown when checkbox is ticked
- Colour badges reflect urgency
- Dates are formatted in German locale (DD.MM.YYYY)

- [ ] **Step 7: Final TypeScript check**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 8: Commit**

```bash
git add src/components/steuerhelfer/DeadlineEngine.tsx src/tests/DeadlineEngine.test.ts
git commit -m "feat: DeadlineEngine tab with urgency-coded German tax deadlines"
```

---

## n8n Cloud Setup Checklist (manual steps — no code)

After all code tasks are complete, configure n8n to make the webhooks live:

- [ ] In n8n Cloud, create **Workflow 1: scan-receipt**
  - Trigger: Webhook (POST `/webhook/scan-receipt`)
  - Node: Anthropic — send `{{ $json.image }}` (base64) with the receipt extraction prompt
  - Node: Supabase — Insert row into `receipts` table using service role key
  - Node: Respond to Webhook — return the extracted JSON

- [ ] Create **Workflow 2: chat**
  - Trigger: Webhook (POST `/webhook/chat`)
  - Node: Anthropic — send `message` + `history` with the Steuerhelfer system prompt
  - Node: Respond to Webhook — return `{ "reply": "..." }`

- [ ] Create **Workflow 3: check-invoice**
  - Trigger: Webhook (POST `/webhook/check-invoice`)
  - Node: Anthropic — send `{{ $json.image }}` with the §14 UStG compliance prompt
  - Node: Respond to Webhook — return the compliance JSON

- [ ] Copy the 3 production webhook URLs into `.env.local` (replacing the placeholder values)

- [ ] Restart dev server and test the full flow end-to-end

---

## Stretch Goal: WhatsApp Reminders (Task 4)

This requires no frontend code — configure entirely in n8n:

- [ ] Create **Workflow 4: reminders** with a Schedule trigger (daily, 08:00)
- [ ] Add a Code node to compute deadlines within 14 days (same logic as DeadlineEngine)
- [ ] Add a Twilio node to send WhatsApp: `"Steuerhelfer Erinnerung: Ihre {name} ist in {days} Tagen fällig ({date})."`
- [ ] Add a settings screen to `SteuerhelferApp` where the user can save their phone number to Supabase (a separate `settings` table)
- [ ] In the n8n workflow, read the phone number from Supabase before sending
