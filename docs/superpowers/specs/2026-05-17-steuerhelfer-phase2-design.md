# Steuerhelfer Phase 2 — Design Spec

**Date:** 2026-05-17  
**Status:** Approved

---

## Overview

Add a Steuerhelfer AI tax assistant as a separate `/app` route inside the existing `klarvis` Vite + React 19 project. The assistant targets Bavarian small businesses (farmers, tradespeople, Gastronomy) and provides receipt scanning, expense tracking, tax Q&A, and deadline management.

---

## Architecture

### Stack (existing + additions)
- **Frontend:** Vite + React 19 + TypeScript + Tailwind CSS v4 (unchanged)
- **Routing:** React Router v6 (new) — `/` keeps klarvis marketing site, `/app` mounts Steuerhelfer
- **AI backend:** n8n Cloud webhooks (replaces all custom API routes — no `api/` directory)
- **Database:** Supabase — browser client for reads/deletes; n8n service role for inserts
- **Deployment:** Vercel (SPA routing via `vercel.json` rewrites only)

### n8n Cloud Workflows

| Workflow | Trigger | Responsibility |
|---|---|---|
| `scan-receipt` | `POST /webhook/scan-receipt` | Receives base64 image → Claude vision → extracts receipt JSON → inserts to Supabase → returns data |
| `chat` | `POST /webhook/chat` | Receives `{message, history[]}` → Claude with Steuerhelfer system prompt → returns reply text |
| `check-invoice` | `POST /webhook/check-invoice` | Receives base64 image → Claude §14 UStG compliance check → returns compliance JSON |
| `reminders` | Schedule: daily 08:00 | Checks deadlines within 14 days → sends WhatsApp via Twilio (Task 4) |

**Credentials in n8n Cloud (never in frontend):**
- `ANTHROPIC_API_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (for inserts)
- Twilio credentials (Task 4)

### Frontend Environment Variables (`.env.local`)
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_N8N_SCAN=https://yourname.app.n8n.cloud/webhook/scan-receipt
VITE_N8N_CHAT=https://yourname.app.n8n.cloud/webhook/chat
VITE_N8N_INVOICE=https://yourname.app.n8n.cloud/webhook/check-invoice
```

---

## Data Model

### Supabase `receipts` table
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
  image_url text  -- null for this prototype (no image storage)
);
```

### RLS Policy (single-user prototype)
- Enable RLS
- Anon role: `SELECT`, `DELETE`
- Service role (n8n): `INSERT`

---

## Frontend File Structure

```
src/
  pages/
    SteuerhelferApp.tsx       ← 4-tab shell
  components/steuerhelfer/
    Belegscanner.tsx          ← Tab 1: receipt scanner + invoice compliance toggle
    Ausgaben.tsx              ← Tab 2: expense list (Supabase reads, CSV export, delete)
    TaxChat.tsx               ← Tab 3: AI chat (n8n/chat webhook)
    DeadlineEngine.tsx        ← Tab 4: deadline display (pure frontend, no API)
  lib/
    supabase.ts               ← Supabase browser client
    n8n.ts                    ← Typed fetch helpers for the 3 webhook URLs
vercel.json                   ← SPA rewrite: all routes → index.html
```

---

## Component Details

### SteuerhelferApp.tsx
Tab shell with 4 tabs: Belegscanner · Ausgaben · Steuer-FAQ · Fristen. Manages active tab state only.

### Belegscanner.tsx (Tab 1)
- Toggle at top: "Beleg scannen" vs "Ausgangsrechnung prüfen"
- **Scan mode:** Upload image → POST to `VITE_N8N_SCAN` (base64) → display extracted JSON → "Bestätigen" / "Verwerfen"
- **Invoice mode:** Upload image → POST to `VITE_N8N_INVOICE` → display §14 UStG checklist (green ✓ / red ✗) + missing fields summary
- Approved receipts call an `onApproved` callback prop; `SteuerhelferApp` increments a `refreshKey` state which `Ausgaben` watches to re-fetch

### Ausgaben.tsx (Tab 2)
- On mount: fetch all receipts from Supabase ordered by `created_at desc`
- Shows running totals: Ausgaben (brutto) and Vorsteuer gesamt
- CSV export (DATEV columns: Datum, Händler, Kategorie, Brutto, Netto, MwSt-Satz, Vorsteuer, SKR03)
- Delete: calls Supabase `.delete()` with anon key, removes from local state
- Loading state while fetching

### TaxChat.tsx (Tab 3)
- Full chat UI with message history (local state — no persistence)
- Quick-question shortcuts: "Welche Belege brauche ich für Bewirtung?", "Was ist der MwSt-Satz für Hopfen?", "Wann ist die nächste UStVA fällig?"
- Posts `{message: string, history: {role, content}[]}` to `VITE_N8N_CHAT`

### DeadlineEngine.tsx (Tab 4)
- Pure frontend — no API calls
- Hardcoded recurring deadlines for the current calendar year, next-instance calculated at render time
- Urgency colours: red (≤14 days), amber (15–30 days), green (>30 days)
- Toggle: "Ich habe Angestellte" — shows/hides Lohnsteuer-Anmeldung (monthly, 10th)
- Deadlines:
  - UStVA (quarterly, 10th of month after quarter end)
  - Einkommensteuer-Vorauszahlung (Mar/Jun/Sep/Dec 10th)
  - Umsatzsteuererklärung (31 Jul)
  - Einkommensteuererklärung (31 Jul)
  - Gewerbesteuererklärung (31 Jul)
  - Lohnsteuer-Anmeldung (monthly, 10th) — toggled

---

## n8n Workflow Payloads

### scan-receipt
Request: `{ image: string }` (base64, any common image format)  
Response: receipt JSON object (vendor, amount_gross, amount_net, vat_rate, vat_amount, date, category, skr03_account, description, deductible, notes)

### chat
Request: `{ message: string, history: Array<{ role: "user" | "assistant", content: string }> }`  
Response: `{ reply: string }`

### check-invoice
Request: `{ image: string }` (base64)  
Response: compliance JSON (has_vendor_name, has_vendor_address, …, missing_fields[], is_compliant, notes)

---

## Claude Prompts (to configure in n8n)

### Receipt extraction
```
Analysiere diesen Kassenbon oder diese Rechnung und extrahiere folgende Daten als JSON:
{ "vendor": "...", "amount_gross": 0.00, "amount_net": 0.00, "vat_rate": 19,
  "vat_amount": 0.00, "date": "YYYY-MM-DD", "category": "...",
  "skr03_account": "...", "description": "...", "deductible": true, "notes": "..." }
Antworte NUR mit dem JSON-Objekt, ohne Markdown-Backticks oder zusätzlichen Text.
```

### Tax Q&A system prompt
```
Du bist Steuerhelfer, ein freundlicher KI-Assistent für deutsche Kleinunternehmer und
Selbstständige — besonders im ländlichen Bayern. Du hilfst bei Umsatzsteuer,
Betriebsausgaben, Rechnungspflichten (§14 UStG), ELSTER-Fristen, und SKR03/SKR04
Buchungskategorien. Antworte immer auf Deutsch, klar und verständlich. Weise bei
komplexen Fragen darauf hin, dass ein Steuerberater die endgültige Beratung
übernehmen sollte.
```

### Invoice compliance (§14 UStG)
```
Prüfe diese Ausgangsrechnung auf die Pflichtangaben gemäß §14 UStG und antworte als JSON:
{ "has_vendor_name": true, "has_vendor_address": true, "has_recipient_name": true,
  "has_recipient_address": true, "has_tax_number_or_uid": true, "has_invoice_date": true,
  "has_invoice_number": true, "has_service_description": true, "has_service_period": true,
  "has_net_amount": true, "has_vat_rate_and_amount": true, "has_gross_amount": true,
  "missing_fields": [], "is_compliant": true, "notes": "..." }
Antworte NUR mit dem JSON-Objekt.
```

---

## Phase 2 Tasks (in order)

1. **Supabase persistence** — wire `Ausgaben.tsx` to real DB; n8n inserts on receipt approval
2. **DeadlineEngine tab** — pure frontend deadline calculator with urgency badges
3. **Invoice compliance checker** — second mode in `Belegscanner.tsx`
4. **WhatsApp reminders** *(stretch)* — n8n scheduled workflow with Twilio; settings screen for phone number

---

## Constraints
- All UI text in German
- Claude model: `claude-sonnet-4-20250514`
- No authentication — single-user prototype
- No `any` types in TypeScript
- Existing klarvis components remain completely unchanged
