# Sales-Agent Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a full-stack AI sales CRM at `/sales` where clients add leads and the system automatically sends three personalized follow-up emails on Day 1, Day 3, and Day 7.

**Architecture:** React Kanban frontend at `/sales` (auth-guarded, dark theme matching Steuerhelfer) + three Supabase tables with RLS + a Vercel Cron job that calls Anthropic for email generation and Resend REST API for delivery. All server-side calls use raw `fetch` — no new npm packages needed.

**Tech Stack:** React 19, TypeScript, Tailwind v4, Supabase (auth + database + RLS), Vercel Cron Jobs, Anthropic API (claude-haiku-4-5-20251001), Resend REST API, Vitest

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Modify | `src/lib/types.ts` | Add `SalesLead`, `SalesEmail`, `SalesSettings`, `SalesEmailWithLead`, `LeadStatus` types |
| Create | `src/lib/salesApi.ts` | Supabase CRUD for leads, emails, settings |
| Create | `api/sales-cron.ts` | Vercel Cron: find due leads, generate emails via Anthropic, send via Resend |
| Modify | `vercel.json` | Add cron schedule `0 7 * * *` for `/api/sales-cron` |
| Create | `src/pages/SalesAgentApp.tsx` | Page shell: header, tab nav, stats bar, state management |
| Modify | `src/App.tsx` | Add `/sales` route behind AuthGuard |
| Create | `src/components/sales/KanbanBoard.tsx` | 5-column kanban board with lead cards |
| Create | `src/components/sales/LeadModal.tsx` | Add lead form modal |
| Create | `src/components/sales/LeadDetail.tsx` | Lead detail: fields + email timeline + Won/Lost buttons |
| Create | `src/components/sales/EmailLog.tsx` | All sent emails table |
| Create | `src/components/sales/Settings.tsx` | Business settings form |
| Create | `src/tests/salesCron.test.ts` | Unit tests for `buildPrompt` |

---

### Task 1: Types + Supabase Migration

**Files:**
- Modify: `src/lib/types.ts`

- [ ] **Step 1: Apply the SQL migration in the Supabase Dashboard**

Go to your Supabase project → SQL Editor → New query. Paste and run this entire block:

```sql
-- sales_leads
CREATE TABLE IF NOT EXISTS sales_leads (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        text        NOT NULL,
  email       text        NOT NULL,
  phone       text,
  company     text,
  notes       text,
  status      text        NOT NULL DEFAULT 'new'
              CHECK (status IN ('new','day1_sent','day3_sent','day7_sent','won','lost')),
  created_at  timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE sales_leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_leads" ON sales_leads
  USING  (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- sales_emails
CREATE TABLE IF NOT EXISTS sales_emails (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id     uuid        NOT NULL REFERENCES sales_leads(id) ON DELETE CASCADE,
  day_number  int         NOT NULL CHECK (day_number IN (1, 3, 7)),
  subject     text        NOT NULL,
  body        text        NOT NULL,
  sent_at     timestamptz NOT NULL DEFAULT now(),
  status      text        NOT NULL CHECK (status IN ('sent','failed'))
);
ALTER TABLE sales_emails ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_emails" ON sales_emails
  USING (
    EXISTS (
      SELECT 1 FROM sales_leads
      WHERE sales_leads.id = sales_emails.lead_id
        AND sales_leads.user_id = auth.uid()
    )
  );

-- sales_settings
CREATE TABLE IF NOT EXISTS sales_settings (
  user_id              uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name        text NOT NULL,
  business_description text NOT NULL,
  reply_to_email       text NOT NULL
);
ALTER TABLE sales_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_settings" ON sales_settings
  USING  (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
```

Expected: "Success. No rows returned."

- [ ] **Step 2: Append Sales types to `src/lib/types.ts`**

The file currently ends after `ChatMessage`. Add these types at the bottom (do NOT remove the existing types):

```typescript
export type LeadStatus = 'new' | 'day1_sent' | 'day3_sent' | 'day7_sent' | 'won' | 'lost'

export interface SalesLead {
  id: string
  user_id: string
  name: string
  email: string
  phone: string | null
  company: string | null
  notes: string | null
  status: LeadStatus
  created_at: string
}

export interface SalesEmail {
  id: string
  lead_id: string
  day_number: 1 | 3 | 7
  subject: string
  body: string
  sent_at: string
  status: 'sent' | 'failed'
}

export interface SalesEmailWithLead extends SalesEmail {
  lead_name: string
}

export interface SalesSettings {
  user_id: string
  business_name: string
  business_description: string
  reply_to_email: string
}
```

- [ ] **Step 3: Verify types compile**

```bash
npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add src/lib/types.ts
git commit -m "feat: add Sales-Agent types and Supabase migration"
```

---

### Task 2: salesApi.ts

**Files:**
- Create: `src/lib/salesApi.ts`

All functions are thin Supabase wrappers. `getAllEmails` flattens the join result to a `SalesEmailWithLead[]`.

- [ ] **Step 1: Create `src/lib/salesApi.ts`**

```typescript
import { supabase } from './supabase'
import type { LeadStatus, SalesEmail, SalesEmailWithLead, SalesLead, SalesSettings } from './types'

export async function getLeads(): Promise<SalesLead[]> {
  const { data, error } = await supabase
    .from('sales_leads')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as SalesLead[]
}

export async function createLead(
  lead: Pick<SalesLead, 'name' | 'email' | 'phone' | 'company' | 'notes'>,
): Promise<SalesLead> {
  const { data, error } = await supabase
    .from('sales_leads')
    .insert(lead)
    .select()
    .single()
  if (error) throw error
  return data as SalesLead
}

export async function updateLeadStatus(id: string, status: LeadStatus): Promise<void> {
  const { error } = await supabase
    .from('sales_leads')
    .update({ status })
    .eq('id', id)
  if (error) throw error
}

export async function getEmailsForLead(leadId: string): Promise<SalesEmail[]> {
  const { data, error } = await supabase
    .from('sales_emails')
    .select('*')
    .eq('lead_id', leadId)
    .order('day_number', { ascending: true })
  if (error) throw error
  return data as SalesEmail[]
}

export async function getAllEmails(): Promise<SalesEmailWithLead[]> {
  const { data, error } = await supabase
    .from('sales_emails')
    .select('*, sales_leads(name)')
    .order('sent_at', { ascending: false })
  if (error) throw error
  return (data as Array<SalesEmail & { sales_leads: { name: string } | null }>).map(row => ({
    id: row.id,
    lead_id: row.lead_id,
    day_number: row.day_number,
    subject: row.subject,
    body: row.body,
    sent_at: row.sent_at,
    status: row.status,
    lead_name: row.sales_leads?.name ?? '',
  }))
}

export async function getEmailsSentCount(): Promise<number> {
  const { count, error } = await supabase
    .from('sales_emails')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'sent')
  if (error) throw error
  return count ?? 0
}

export async function getSettings(): Promise<SalesSettings | null> {
  const { data, error } = await supabase
    .from('sales_settings')
    .select('*')
    .maybeSingle()
  if (error) throw error
  return data as SalesSettings | null
}

export async function upsertSettings(
  settings: Pick<SalesSettings, 'business_name' | 'business_description' | 'reply_to_email'>,
): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  const { error } = await supabase
    .from('sales_settings')
    .upsert({ ...settings, user_id: user.id })
  if (error) throw error
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors from salesApi.ts (other missing component errors are fine)

- [ ] **Step 3: Commit**

```bash
git add src/lib/salesApi.ts
git commit -m "feat: add salesApi CRUD functions"
```

---

### Task 3: Cron API endpoint + vercel.json

**Files:**
- Create: `src/tests/salesCron.test.ts`
- Create: `api/sales-cron.ts`
- Modify: `vercel.json`

`buildPrompt` is exported as a named export so it can be unit-tested. The handler uses raw `fetch` against Supabase REST API and Resend REST API — no SDKs.

- [ ] **Step 1: Write the failing test**

Create `src/tests/salesCron.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { buildPrompt } from '../../api/sales-cron'

describe('buildPrompt', () => {
  it('day 1 prompt includes lead name, company and 120-word limit', () => {
    const p = buildPrompt(1, 'Anna Müller', 'ACME GmbH', 'Budget ~2000€', 'Meine Firma', 'Wir machen Webdesign')
    expect(p).toContain('Anna Müller')
    expect(p).toContain('ACME GmbH')
    expect(p).toContain('Meine Firma')
    expect(p).toContain('120 words')
  })

  it('day 3 prompt references follow-up', () => {
    const p = buildPrompt(3, 'Anna Müller', null, null, 'Meine Firma', 'Wir machen Webdesign')
    expect(p).toContain('Day 3')
    expect(p).toContain('follow-up')
  })

  it('day 7 prompt is the final touch with 80-word limit', () => {
    const p = buildPrompt(7, 'Anna Müller', null, null, 'Meine Firma', 'Wir machen Webdesign')
    expect(p).toContain('Day 7')
    expect(p).toContain('80 words')
  })

  it('null notes becomes "none" and never "null"', () => {
    const p = buildPrompt(1, 'Test', null, null, 'Firma', 'Desc')
    expect(p).toContain('none')
    expect(p).not.toContain('null')
  })
})
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
npx vitest run src/tests/salesCron.test.ts
```

Expected: FAIL — "Cannot find module '../../api/sales-cron'"

- [ ] **Step 3: Create `api/sales-cron.ts`**

```typescript
/* eslint-disable @typescript-eslint/no-explicit-any */
const env = (globalThis as any).process?.env ?? {}

interface CronLead {
  id: string
  user_id: string
  name: string
  email: string
  company: string | null
  notes: string | null
  status: string
  created_at: string
}

interface CronSettings {
  user_id: string
  business_name: string
  business_description: string
  reply_to_email: string
}

type DayNumber = 1 | 3 | 7

interface Rule {
  status: string
  days: number
  nextStatus: string
  dayNumber: DayNumber
}

const RULES: Rule[] = [
  { status: 'new',       days: 1, nextStatus: 'day1_sent', dayNumber: 1 },
  { status: 'day1_sent', days: 3, nextStatus: 'day3_sent', dayNumber: 3 },
  { status: 'day3_sent', days: 7, nextStatus: 'day7_sent', dayNumber: 7 },
]

export function buildPrompt(
  dayNumber: DayNumber,
  leadName: string,
  leadCompany: string | null,
  leadNotes: string | null,
  businessName: string,
  businessDescription: string,
): string {
  const company = leadCompany ? ` from ${leadCompany}` : ''
  const notes = leadNotes ?? 'none'
  if (dayNumber === 1) {
    return `You are a professional sales assistant for ${businessName}. Write a short, warm, personalized first-contact email to ${leadName}${company}. Business context: ${businessDescription}. Lead notes: ${notes}. Keep it under 120 words. No hard sell. End with a clear, low-friction CTA. Return JSON: {"subject":"...","body":"..."}`
  }
  if (dayNumber === 3) {
    return `You are a professional sales assistant for ${businessName}. Write a brief follow-up email (Day 3) to ${leadName}. Reference the earlier email. Include one concrete value proposition. Business context: ${businessDescription}. Lead notes: ${notes}. Under 100 words. Return JSON: {"subject":"...","body":"..."}`
  }
  return `You are a professional sales assistant for ${businessName}. Write a final, graceful follow-up email (Day 7) to ${leadName}. Acknowledge you don't want to bother them. Leave the door open. Business context: ${businessDescription}. Lead notes: ${notes}. Under 80 words. Return JSON: {"subject":"...","body":"..."}`
}

async function generateEmail(
  prompt: string,
  apiKey: string,
): Promise<{ subject: string; body: string }> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      messages: [{ role: 'user', content: prompt }],
    }),
  })
  if (!res.ok) throw new Error(`Anthropic ${res.status}: ${await res.text()}`)
  const data = await res.json() as { content: Array<{ type: string; text: string }> }
  const text = data.content.find(c => c.type === 'text')?.text ?? '{}'
  return JSON.parse(text) as { subject: string; body: string }
}

async function sendEmail(
  to: string,
  subject: string,
  body: string,
  fromName: string,
  replyTo: string,
  resendKey: string,
): Promise<void> {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${resendKey}`,
    },
    body: JSON.stringify({
      from: `${fromName} <noreply@runly.de>`,
      to: [to],
      reply_to: replyTo,
      subject,
      text: body,
    }),
  })
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`)
}

export default async function handler(req: any, res: any) {
  const cronSecret = env.CRON_SECRET as string | undefined
  const authHeader = (req.headers['authorization'] ?? '') as string
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  const supabaseUrl  = env.VITE_SUPABASE_URL as string | undefined
  const serviceKey   = env.SUPABASE_SERVICE_ROLE_KEY as string | undefined
  const anthropicKey = env.ANTHROPIC_API_KEY as string | undefined
  const resendKey    = env.RESEND_API_KEY as string | undefined

  if (!supabaseUrl || !serviceKey || !anthropicKey || !resendKey) {
    res.status(500).json({ error: 'Missing environment variables' })
    return
  }

  const sbHeaders = {
    'Content-Type': 'application/json',
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
  }

  const results: Array<{ lead_id: string; day: number; status: string; error?: string }> = []

  for (const rule of RULES) {
    const targetDate = new Date()
    targetDate.setUTCDate(targetDate.getUTCDate() - rule.days)
    const dateStr = targetDate.toISOString().split('T')[0]
    const nextDate = new Date(targetDate)
    nextDate.setUTCDate(nextDate.getUTCDate() + 1)
    const nextDateStr = nextDate.toISOString().split('T')[0]

    const leadsRes = await fetch(
      `${supabaseUrl}/rest/v1/sales_leads?status=eq.${rule.status}&created_at=gte.${dateStr}T00%3A00%3A00Z&created_at=lt.${nextDateStr}T00%3A00%3A00Z&select=*`,
      { headers: sbHeaders },
    )
    if (!leadsRes.ok) continue
    const leads = await leadsRes.json() as CronLead[]

    for (const lead of leads) {
      const settingsRes = await fetch(
        `${supabaseUrl}/rest/v1/sales_settings?user_id=eq.${lead.user_id}&select=*`,
        { headers: sbHeaders },
      )
      if (!settingsRes.ok) continue
      const [settings] = await settingsRes.json() as CronSettings[]
      if (!settings) continue

      let emailStatus = 'failed'
      let emailSubject = ''
      let emailBody = ''
      let errorMsg: string | undefined

      try {
        const prompt = buildPrompt(
          rule.dayNumber, lead.name, lead.company, lead.notes,
          settings.business_name, settings.business_description,
        )
        const generated = await generateEmail(prompt, anthropicKey)
        emailSubject = generated.subject
        emailBody = generated.body
        await sendEmail(lead.email, emailSubject, emailBody, settings.business_name, settings.reply_to_email, resendKey)
        emailStatus = 'sent'
      } catch (err) {
        errorMsg = String(err)
      }

      await fetch(`${supabaseUrl}/rest/v1/sales_emails`, {
        method: 'POST',
        headers: sbHeaders,
        body: JSON.stringify({
          lead_id: lead.id,
          day_number: rule.dayNumber,
          subject: emailSubject || '(generation failed)',
          body: emailBody || errorMsg || '',
          status: emailStatus,
        }),
      })

      if (emailStatus === 'sent') {
        await fetch(`${supabaseUrl}/rest/v1/sales_leads?id=eq.${lead.id}`, {
          method: 'PATCH',
          headers: sbHeaders,
          body: JSON.stringify({ status: rule.nextStatus }),
        })
      }

      results.push({ lead_id: lead.id, day: rule.dayNumber, status: emailStatus, error: errorMsg })
    }
  }

  res.status(200).json({ processed: results.length, results })
}
```

- [ ] **Step 4: Run the test to confirm it passes**

```bash
npx vitest run src/tests/salesCron.test.ts
```

Expected: PASS — 4 tests

- [ ] **Step 5: Update `vercel.json`**

Replace the entire file:

```json
{
  "rewrites": [{ "source": "/((?!api/).*)", "destination": "/index.html" }],
  "crons": [{ "path": "/api/sales-cron", "schedule": "0 7 * * *" }]
}
```

- [ ] **Step 6: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors from the new files (other missing-component errors are expected)

- [ ] **Step 7: Commit**

```bash
git add api/sales-cron.ts vercel.json src/tests/salesCron.test.ts
git commit -m "feat: add sales-cron Vercel endpoint and daily schedule"
```

---

### Task 4: SalesAgentApp page shell + /sales route

**Files:**
- Create: `src/pages/SalesAgentApp.tsx`
- Modify: `src/App.tsx`

The page shell owns all state (leads list, email count, which modal is open, which lead is selected). Sub-components receive callbacks and do not fetch independently, except `LeadDetail` (loads its own emails) and `EmailLog`/`Settings` (self-contained).

- [ ] **Step 1: Create `src/pages/SalesAgentApp.tsx`**

```tsx
import { useState, useEffect } from 'react'
import { useAuth } from '../lib/auth'
import { getLeads, createLead, updateLeadStatus, getEmailsSentCount } from '../lib/salesApi'
import type { SalesLead, LeadStatus } from '../lib/types'
import KanbanBoard from '../components/sales/KanbanBoard'
import LeadModal from '../components/sales/LeadModal'
import LeadDetail from '../components/sales/LeadDetail'
import EmailLog from '../components/sales/EmailLog'
import Settings from '../components/sales/Settings'

type SalesTab = 'pipeline' | 'emails' | 'settings'

const TAB_LABELS: Record<SalesTab, string> = {
  pipeline: 'Pipeline',
  emails: 'E-Mail-Verlauf',
  settings: 'Einstellungen',
}

const TABS: SalesTab[] = ['pipeline', 'emails', 'settings']

export default function SalesAgentApp() {
  const { session, signOut } = useAuth()
  const [activeTab, setActiveTab] = useState<SalesTab>('pipeline')
  const [leads, setLeads] = useState<SalesLead[]>([])
  const [emailCount, setEmailCount] = useState(0)
  const [selectedLead, setSelectedLead] = useState<SalesLead | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)

  useEffect(() => { void load() }, [])

  const load = async () => {
    const [leadsData, count] = await Promise.all([getLeads(), getEmailsSentCount()])
    setLeads(leadsData)
    setEmailCount(count)
  }

  const handleAddLead = async (lead: Pick<SalesLead, 'name' | 'email' | 'phone' | 'company' | 'notes'>) => {
    await createLead(lead)
    setShowAddModal(false)
    await load()
  }

  const handleStatusChange = async (id: string, status: LeadStatus) => {
    await updateLeadStatus(id, status)
    setSelectedLead(null)
    await load()
  }

  const activeLeads = leads.filter(l => l.status !== 'won' && l.status !== 'lost')
  const wonLeads = leads.filter(l => l.status === 'won')
  const lostLeads = leads.filter(l => l.status === 'lost')
  const totalDecided = wonLeads.length + lostLeads.length
  const conversionRate = totalDecided > 0 ? Math.round((wonLeads.length / totalDecided) * 100) : 0

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="bg-slate-800 border-b border-slate-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div aria-hidden="true" className="w-7 h-7 rounded-lg bg-cyan-500 flex items-center justify-center text-slate-900 text-sm font-bold shrink-0">
            ⬡
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-100">Runly Sales-Agent</h1>
            <p className="text-xs text-slate-500">KI-gestütztes Lead-Management</p>
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

      {activeTab === 'pipeline' && (
        <>
          <div className="flex gap-3 p-4">
            {([
              { label: 'Aktive Leads',    value: activeLeads.length,  cls: 'text-cyan-500' },
              { label: 'E-Mails gesendet', value: emailCount,          cls: 'text-slate-100' },
              { label: 'Gewonnen',         value: wonLeads.length,     cls: 'text-green-400' },
              { label: 'Konversionsrate',  value: `${conversionRate}%`, cls: 'text-slate-100' },
            ] as const).map(stat => (
              <div key={stat.label} className="flex-1 bg-slate-800 border border-slate-700 rounded-lg p-3">
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">{stat.label}</p>
                <p className={`text-2xl font-bold ${stat.cls}`}>{stat.value}</p>
              </div>
            ))}
          </div>

          <KanbanBoard
            leads={leads}
            onLeadClick={setSelectedLead}
            onAddLead={() => setShowAddModal(true)}
          />
        </>
      )}

      {activeTab === 'emails' && <EmailLog />}
      {activeTab === 'settings' && <Settings />}

      {showAddModal && (
        <LeadModal
          onClose={() => setShowAddModal(false)}
          onSave={handleAddLead}
        />
      )}

      {selectedLead && (
        <LeadDetail
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  )
}
```

- [ ] **Step 2: Modify `src/App.tsx` to add the `/sales` route**

Replace the entire file:

```tsx
import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import SectionHero from './components/SectionHero'
import SectionLeistungen from './components/SectionLeistungen'
import SectionAbout from './components/SectionAbout'
import SectionGallery from './components/SectionGallery'
import SectionPreise from './components/SectionPreise'
import SectionKontakt from './components/SectionKontakt'
import Footer from './components/Footer'
import LegalModal from './components/LegalModal'
import SteuerhelferApp from './pages/SteuerhelferApp'
import SalesAgentApp from './pages/SalesAgentApp'
import { AuthProvider } from './lib/auth'
import AuthGuard from './components/steuerhelfer/AuthGuard'

type LegalType = 'impressum' | 'datenschutz'

function RunlySite() {
  const [legal, setLegal] = useState<LegalType | null>(null)

  return (
    <>
      <Navbar />
      <SectionHero />
      <SectionLeistungen />
      <SectionAbout />
      <SectionGallery />
      <SectionPreise />
      <SectionKontakt />
      <Footer onLegal={setLegal} />
      {legal && <LegalModal type={legal} onClose={() => setLegal(null)} />}
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/app" element={
          <AuthProvider>
            <AuthGuard>
              <SteuerhelferApp />
            </AuthGuard>
          </AuthProvider>
        } />
        <Route path="/sales" element={
          <AuthProvider>
            <AuthGuard>
              <SalesAgentApp />
            </AuthGuard>
          </AuthProvider>
        } />
        <Route path="/*" element={<RunlySite />} />
      </Routes>
    </BrowserRouter>
  )
}
```

- [ ] **Step 3: Verify TypeScript (partial — missing components expected)**

```bash
npx tsc --noEmit
```

Expected: errors about missing `KanbanBoard`, `LeadModal`, `LeadDetail`, `EmailLog`, `Settings` — those are fine. Fix any other errors that appear.

- [ ] **Step 4: Commit**

```bash
git add src/pages/SalesAgentApp.tsx src/App.tsx
git commit -m "feat: add SalesAgentApp page shell and /sales route"
```

---

### Task 5: KanbanBoard component

**Files:**
- Create: `src/components/sales/KanbanBoard.tsx`

Five columns. No drag-and-drop. `lost` leads are hidden by default with a toggle button.

- [ ] **Step 1: Create `src/components/sales/KanbanBoard.tsx`**

```tsx
import { useState } from 'react'
import type { SalesLead, LeadStatus } from '../../lib/types'

interface Props {
  leads: SalesLead[]
  onLeadClick: (lead: SalesLead) => void
  onAddLead: () => void
}

const COLUMNS: Array<{ status: LeadStatus; label: string; color: string }> = [
  { status: 'new',       label: 'Neu',            color: 'text-cyan-500' },
  { status: 'day1_sent', label: 'Tag 1 gesendet',  color: 'text-amber-400' },
  { status: 'day3_sent', label: 'Tag 3 gesendet',  color: 'text-orange-400' },
  { status: 'day7_sent', label: 'Alle 3 gesendet', color: 'text-purple-400' },
  { status: 'won',       label: 'Gewonnen',        color: 'text-green-400' },
]

const BADGE_CLASS: Record<LeadStatus, string> = {
  new:       'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20',
  day1_sent: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  day3_sent: 'bg-orange-500/10 text-orange-400 border border-orange-500/20',
  day7_sent: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
  won:       'bg-green-500/10 text-green-400 border border-green-500/20',
  lost:      'bg-slate-700/50 text-slate-400 border border-slate-600',
}

const BADGE_LABEL: Record<LeadStatus, string> = {
  new:       '✦ Neu',
  day1_sent: '📧 Tag 1',
  day3_sent: '📧 Tag 3',
  day7_sent: '📧 Tag 7',
  won:       '✓ Gewonnen',
  lost:      '✕ Verloren',
}

function relativeDate(isoString: string): string {
  const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 86400000)
  if (diff === 0) return 'Heute'
  if (diff === 1) return 'Gestern'
  return `Vor ${diff} Tagen`
}

function LeadCard({ lead, onClick }: { lead: SalesLead; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-slate-900 border border-slate-700 hover:border-cyan-500/50 rounded-lg p-2.5 transition-colors"
    >
      <p className="text-xs font-semibold text-slate-100 mb-0.5">{lead.name}</p>
      <p className="text-xs text-slate-500 mb-2 min-h-[1rem]">{lead.company ?? ''}</p>
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-600">{relativeDate(lead.created_at)}</span>
        <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${BADGE_CLASS[lead.status]}`}>
          {BADGE_LABEL[lead.status]}
        </span>
      </div>
    </button>
  )
}

export default function KanbanBoard({ leads, onLeadClick, onAddLead }: Props) {
  const [showLost, setShowLost] = useState(false)

  const lostLeads = leads.filter(l => l.status === 'lost')

  return (
    <div className="px-4 pb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-base font-bold text-slate-100">Pipeline</h2>
          <span className="text-xs text-slate-500 bg-slate-800 border border-slate-700 px-2.5 py-0.5 rounded-full">
            {leads.length} Leads gesamt
          </span>
        </div>
        <div className="flex items-center gap-3">
          {lostLeads.length > 0 && (
            <button
              onClick={() => setShowLost(v => !v)}
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              {showLost ? 'Verlorene ausblenden' : `${lostLeads.length} Verlorene anzeigen`}
            </button>
          )}
          <button
            onClick={onAddLead}
            className="flex items-center gap-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-900 text-sm font-bold px-3 py-1.5 rounded-lg transition-colors"
          >
            <span>+</span> Lead hinzufügen
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div
          className="grid gap-3 min-w-max"
          style={{ gridTemplateColumns: `repeat(${showLost ? 6 : 5}, 220px)` }}
        >
          {COLUMNS.map(col => {
            const colLeads = leads.filter(l => l.status === col.status)
            return (
              <div key={col.status} className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-3 py-2.5 border-b border-slate-700">
                  <span className={`text-xs font-bold uppercase tracking-wide ${col.color}`}>{col.label}</span>
                  <span className="text-xs font-bold text-slate-500 bg-slate-900 border border-slate-700 w-5 h-5 rounded flex items-center justify-center">
                    {colLeads.length}
                  </span>
                </div>
                <div className="p-2.5 flex flex-col gap-2 min-h-[120px]">
                  {colLeads.map(lead => (
                    <LeadCard key={lead.id} lead={lead} onClick={() => onLeadClick(lead)} />
                  ))}
                </div>
              </div>
            )
          })}

          {showLost && (
            <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden opacity-60">
              <div className="flex items-center justify-between px-3 py-2.5 border-b border-slate-700">
                <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Verloren</span>
                <span className="text-xs font-bold text-slate-500 bg-slate-900 border border-slate-700 w-5 h-5 rounded flex items-center justify-center">
                  {lostLeads.length}
                </span>
              </div>
              <div className="p-2.5 flex flex-col gap-2 min-h-[120px]">
                {lostLeads.map(lead => (
                  <LeadCard key={lead.id} lead={lead} onClick={() => onLeadClick(lead)} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: errors only for remaining missing components (LeadModal, LeadDetail, EmailLog, Settings).

- [ ] **Step 3: Commit**

```bash
git add src/components/sales/KanbanBoard.tsx
git commit -m "feat: add KanbanBoard component"
```

---

### Task 6: LeadModal component

**Files:**
- Create: `src/components/sales/LeadModal.tsx`

- [ ] **Step 1: Create `src/components/sales/LeadModal.tsx`**

```tsx
import { useState } from 'react'
import type { SalesLead } from '../../lib/types'

interface Props {
  onClose: () => void
  onSave: (lead: Pick<SalesLead, 'name' | 'email' | 'phone' | 'company' | 'notes'>) => Promise<void>
}

const INPUT = 'w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs text-slate-500 uppercase tracking-wide mb-1">{label}</label>
      {children}
    </div>
  )
}

export default function LeadModal({ onClose, onSave }: Props) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [company, setCompany] = useState('')
  const [phone, setPhone] = useState('')
  const [notes, setNotes] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await onSave({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || null,
        company: company.trim() || null,
        notes: notes.trim() || null,
      })
    } catch {
      setError('Fehler beim Speichern. Bitte erneut versuchen.')
      setBusy(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-sm">
        <h2 className="text-base font-bold text-slate-100 mb-5">Neuen Lead hinzufügen</h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Name *">
              <input type="text" value={name} onChange={e => setName(e.target.value)}
                placeholder="Anna Müller" required className={INPUT} />
            </Field>
            <Field label="Unternehmen">
              <input type="text" value={company} onChange={e => setCompany(e.target.value)}
                placeholder="Müller GmbH" className={INPUT} />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="E-Mail *">
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="anna@firma.de" required className={INPUT} />
            </Field>
            <Field label="Telefon">
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                placeholder="+49 …" className={INPUT} />
            </Field>
          </div>

          <Field label="Notizen (für KI-Personalisierung)">
            <textarea value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="z.B. Interesse an Website-Redesign, Budget ca. 2.000 €…"
              rows={3} className={`${INPUT} resize-none`} />
          </Field>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 bg-slate-700 text-slate-300 text-sm py-2.5 rounded-lg hover:bg-slate-600 transition-colors">
              Abbrechen
            </button>
            <button type="submit" disabled={busy}
              className="flex-1 bg-cyan-500 text-slate-900 text-sm font-bold py-2.5 rounded-lg hover:bg-cyan-400 disabled:opacity-50 transition-colors">
              {busy ? 'Wird gespeichert…' : 'Lead hinzufügen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: errors only for remaining missing components (LeadDetail, EmailLog, Settings).

- [ ] **Step 3: Commit**

```bash
git add src/components/sales/LeadModal.tsx
git commit -m "feat: add LeadModal component"
```

---

### Task 7: LeadDetail component

**Files:**
- Create: `src/components/sales/LeadDetail.tsx`

Loads its own emails via `getEmailsForLead` on mount. Won/Lost buttons are hidden once the lead is already decided.

- [ ] **Step 1: Create `src/components/sales/LeadDetail.tsx`**

```tsx
import { useState, useEffect } from 'react'
import type { SalesLead, SalesEmail, LeadStatus } from '../../lib/types'
import { getEmailsForLead } from '../../lib/salesApi'

interface Props {
  lead: SalesLead
  onClose: () => void
  onStatusChange: (id: string, status: LeadStatus) => Promise<void>
}

const STATUS_LABEL: Record<string, string> = {
  new:       '✦ Neu',
  day1_sent: '📧 Tag 1 gesendet',
  day3_sent: '📧 Tag 3 gesendet',
  day7_sent: '📧 Alle 3 gesendet',
  won:       '✓ Gewonnen',
  lost:      '✕ Verloren',
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">{label}</p>
      <p className="text-sm text-slate-300">{value}</p>
    </div>
  )
}

export default function LeadDetail({ lead, onClose, onStatusChange }: Props) {
  const [emails, setEmails] = useState<SalesEmail[]>([])
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    getEmailsForLead(lead.id).then(setEmails).catch(() => {})
  }, [lead.id])

  const handleAction = async (status: LeadStatus) => {
    setBusy(true)
    await onStatusChange(lead.id, status)
    setBusy(false)
  }

  const isDecided = lead.status === 'won' || lead.status === 'lost'

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md max-h-[90vh] flex flex-col">
        <div className="flex items-start justify-between p-5 border-b border-slate-700">
          <div>
            <h2 className="text-base font-bold text-slate-100">{lead.name}</h2>
            {lead.company && <p className="text-xs text-slate-500 mt-0.5">{lead.company}</p>}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 bg-slate-900 border border-slate-700 px-2 py-1 rounded-full">
              {STATUS_LABEL[lead.status] ?? lead.status}
            </span>
            <button
              onClick={onClose}
              className="text-slate-500 hover:text-slate-300 transition-colors text-xl leading-none"
              aria-label="Schließen"
            >
              ×
            </button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <InfoField label="E-Mail" value={lead.email} />
            {lead.phone && <InfoField label="Telefon" value={lead.phone} />}
          </div>

          {lead.notes && (
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Notizen</p>
              <p className="text-sm text-slate-300 bg-slate-900 border border-slate-700 rounded-lg p-3">
                {lead.notes}
              </p>
            </div>
          )}

          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wide mb-3">Follow-up Verlauf</p>
            {emails.length === 0 ? (
              <p className="text-xs text-slate-600 italic">Noch keine E-Mails gesendet.</p>
            ) : (
              <div className="space-y-3">
                {emails.map((email, i) => (
                  <div key={email.id} className="flex gap-3">
                    <div className="flex flex-col items-center pt-1">
                      <div className={`w-2 h-2 rounded-full shrink-0 ${email.status === 'sent' ? 'bg-cyan-500' : 'bg-red-500'}`} />
                      {i < emails.length - 1 && <div className="w-px flex-1 bg-slate-700 mt-1" />}
                    </div>
                    <div className="pb-3">
                      <p className="text-xs font-semibold text-slate-200">
                        Tag {email.day_number} — {email.status === 'sent' ? 'Gesendet' : 'Fehlgeschlagen'}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">{email.subject}</p>
                      <p className="text-xs text-slate-600 mt-0.5">
                        {new Date(email.sent_at).toLocaleDateString('de-DE', {
                          day: '2-digit', month: '2-digit', year: 'numeric',
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {!isDecided && (
          <div className="p-4 border-t border-slate-700 flex gap-2">
            <button
              onClick={() => handleAction('won')}
              disabled={busy}
              className="flex-1 bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 text-sm font-semibold py-2.5 rounded-lg disabled:opacity-50 transition-colors"
            >
              ✓ Gewonnen
            </button>
            <button
              onClick={() => handleAction('lost')}
              disabled={busy}
              className="flex-1 bg-slate-700 text-slate-400 hover:bg-slate-600 text-sm font-semibold py-2.5 rounded-lg disabled:opacity-50 transition-colors"
            >
              ✕ Verloren
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: errors only for remaining missing components (EmailLog, Settings).

- [ ] **Step 3: Commit**

```bash
git add src/components/sales/LeadDetail.tsx
git commit -m "feat: add LeadDetail component with email timeline and Won/Lost actions"
```

---

### Task 8: EmailLog + Settings — full feature complete

**Files:**
- Create: `src/components/sales/EmailLog.tsx`
- Create: `src/components/sales/Settings.tsx`

After this task the full feature compiles and renders.

- [ ] **Step 1: Create `src/components/sales/EmailLog.tsx`**

```tsx
import { useState, useEffect } from 'react'
import type { SalesEmailWithLead } from '../../lib/types'
import { getAllEmails } from '../../lib/salesApi'

export default function EmailLog() {
  const [emails, setEmails] = useState<SalesEmailWithLead[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAllEmails().then(setEmails).finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="p-6 text-center text-sm text-slate-500">Lade E-Mails…</div>
  }

  if (emails.length === 0) {
    return <div className="p-6 text-center text-sm text-slate-500">Noch keine E-Mails gesendet.</div>
  }

  return (
    <div className="p-4">
      <h2 className="text-base font-bold text-slate-100 mb-4">E-Mail-Verlauf</h2>
      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700">
              {['Lead', 'Tag', 'Betreff', 'Gesendet', 'Status'].map(h => (
                <th key={h} className="text-left text-xs text-slate-500 uppercase tracking-wide px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {emails.map(email => (
              <tr key={email.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                <td className="px-4 py-3 text-slate-200 font-medium">{email.lead_name}</td>
                <td className="px-4 py-3 text-slate-400">Tag {email.day_number}</td>
                <td className="px-4 py-3 text-slate-300 max-w-xs truncate">{email.subject}</td>
                <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                  {new Date(email.sent_at).toLocaleDateString('de-DE', {
                    day: '2-digit', month: '2-digit', year: 'numeric',
                    hour: '2-digit', minute: '2-digit',
                  })}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    email.status === 'sent'
                      ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                      : 'bg-red-500/10 text-red-400 border border-red-500/20'
                  }`}>
                    {email.status === 'sent' ? '✓ Gesendet' : '✕ Fehler'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create `src/components/sales/Settings.tsx`**

```tsx
import { useState, useEffect } from 'react'
import { getSettings, upsertSettings } from '../../lib/salesApi'

const INPUT = 'w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500'

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs text-slate-500 uppercase tracking-wide mb-1">
        {label}
        {hint && <span className="normal-case text-slate-600 ml-1">— {hint}</span>}
      </label>
      {children}
    </div>
  )
}

export default function Settings() {
  const [businessName, setBusinessName] = useState('')
  const [businessDescription, setBusinessDescription] = useState('')
  const [replyToEmail, setReplyToEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    getSettings().then(s => {
      if (s) {
        setBusinessName(s.business_name)
        setBusinessDescription(s.business_description)
        setReplyToEmail(s.reply_to_email)
      }
    }).finally(() => setLoading(false))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaved(false)
    setBusy(true)
    try {
      await upsertSettings({
        business_name: businessName.trim(),
        business_description: businessDescription.trim(),
        reply_to_email: replyToEmail.trim(),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {
      setError('Fehler beim Speichern. Bitte erneut versuchen.')
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return <div className="p-6 text-center text-sm text-slate-500">Lade Einstellungen…</div>
  }

  return (
    <div className="p-4 max-w-lg">
      <h2 className="text-base font-bold text-slate-100 mb-1">Einstellungen</h2>
      <p className="text-xs text-slate-500 mb-5">Diese Informationen werden für die KI-E-Mail-Generierung verwendet.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Unternehmensname *">
          <input type="text" value={businessName} onChange={e => setBusinessName(e.target.value)}
            placeholder="Muster GmbH" required className={INPUT} />
        </Field>

        <Field label="Unternehmensbeschreibung *" hint="Kontext für die KI">
          <textarea value={businessDescription} onChange={e => setBusinessDescription(e.target.value)}
            placeholder="Wir sind eine Agentur für digitales Marketing mit Fokus auf KMUs…"
            required rows={4} className={`${INPUT} resize-none`} />
        </Field>

        <Field label="Antwort-E-Mail *" hint="Wohin sollen Antworten der Leads gehen?">
          <input type="email" value={replyToEmail} onChange={e => setReplyToEmail(e.target.value)}
            placeholder="kontakt@meinefirma.de" required className={INPUT} />
        </Field>

        {error && <p className="text-xs text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={busy}
          className="bg-cyan-500 hover:bg-cyan-400 text-slate-900 text-sm font-bold px-5 py-2.5 rounded-lg disabled:opacity-50 transition-colors"
        >
          {busy ? 'Wird gespeichert…' : saved ? '✓ Gespeichert' : 'Einstellungen speichern'}
        </button>
      </form>
    </div>
  )
}
```

- [ ] **Step 3: Run full TypeScript check — must be clean**

```bash
npx tsc --noEmit
```

Expected: **zero errors** — all components now exist

- [ ] **Step 4: Run all tests**

```bash
npx vitest run
```

Expected: all existing tests pass + 4 new salesCron tests pass

- [ ] **Step 5: Start dev server and smoke test**

```bash
npm run dev
```

Navigate to `http://localhost:5173/sales`. Verify:
- Dark header shows "Runly Sales-Agent" with ⬡ logo and user email / Abmelden
- Three tabs work: Pipeline, E-Mail-Verlauf, Einstellungen
- Stats bar shows zeros (no data)
- Empty Kanban board with 5 columns (Neu, Tag 1, Tag 3, Alle 3, Gewonnen)
- "+ Lead hinzufügen" button opens the modal
- Modal has all fields: Name, Unternehmen, E-Mail, Telefon, Notizen
- Clicking outside the modal closes it
- Einstellungen tab shows the settings form
- No console errors on any tab

- [ ] **Step 6: Commit**

```bash
git add src/components/sales/EmailLog.tsx src/components/sales/Settings.tsx
git commit -m "feat: add EmailLog and Settings — Sales-Agent complete"
```

---

## Environment Variables Checklist

Before deploying to Vercel, add these in the Vercel Dashboard → Project Settings → Environment Variables:

| Variable | Where to get it | Notes |
|----------|-----------------|-------|
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API → `service_role` key | Bypasses RLS — keep server-side only |
| `RESEND_API_KEY` | resend.com → API Keys | Create a new key with Send access |
| `CRON_SECRET` | Generate: `openssl rand -hex 32` | Vercel passes this automatically as the Bearer token |

`VITE_SUPABASE_URL` is already set for the frontend. Vercel makes all project env vars available to serverless functions at runtime regardless of the `VITE_` prefix, so no additional `SUPABASE_URL` variable is needed.
