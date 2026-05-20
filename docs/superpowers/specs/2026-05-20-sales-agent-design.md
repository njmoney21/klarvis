# Sales-Agent Design Spec

**Date:** 2026-05-20
**Status:** Approved

## Overview

A client-facing sales CRM add-on for the Runly platform (€99/Mo). Clients log in, manually add leads, and the AI automatically sends three personalized follow-up emails on Day 1, Day 3, and Day 7 after the lead is added. The pipeline is visualized as a Kanban board. Clients manually mark leads as Won or Lost.

## Architecture

Three moving parts inside the existing Runly repo:

1. **Frontend** — React Kanban app at `/sales`, auth-guarded, dark theme (same as Steuerhelfer)
2. **Supabase** — three new tables with Row Level Security
3. **Vercel Cron** — daily job that finds due leads, generates emails via Anthropic, sends via Resend

No new external services beyond Resend (email delivery). Everything else reuses the existing stack: Supabase auth, Anthropic API, Vercel hosting.

## Data Model

### `sales_leads`

| Column | Type | Constraints |
|---|---|---|
| `id` | uuid | PK, default gen_random_uuid() |
| `user_id` | uuid | FK → auth.users, NOT NULL |
| `name` | text | NOT NULL |
| `email` | text | NOT NULL |
| `phone` | text | nullable |
| `company` | text | nullable |
| `notes` | text | nullable — fed to AI for personalization |
| `status` | text | NOT NULL, default `'new'` — enum: `new`, `day1_sent`, `day3_sent`, `day7_sent`, `won`, `lost` |
| `created_at` | timestamptz | NOT NULL, default now() |

RLS: `user_id = auth.uid()` for all operations.

### `sales_emails`

| Column | Type | Constraints |
|---|---|---|
| `id` | uuid | PK, default gen_random_uuid() |
| `lead_id` | uuid | FK → sales_leads(id) ON DELETE CASCADE |
| `day_number` | int | NOT NULL — 1, 3, or 7 |
| `subject` | text | NOT NULL — AI-generated subject line |
| `body` | text | NOT NULL — AI-generated email body |
| `sent_at` | timestamptz | NOT NULL, default now() |
| `status` | text | NOT NULL — `sent` or `failed` |

RLS: via join to `sales_leads.user_id = auth.uid()`.

### `sales_settings`

| Column | Type | Constraints |
|---|---|---|
| `user_id` | uuid | PK, FK → auth.users |
| `business_name` | text | NOT NULL — shown as sender display name |
| `business_description` | text | NOT NULL — context for AI prompt |
| `reply_to_email` | text | NOT NULL — where lead replies go |

RLS: `user_id = auth.uid()`.

## Frontend

### Routing

New entry in `src/App.tsx`:
```tsx
<Route path="/sales" element={
  <AuthProvider>
    <AuthGuard>
      <SalesAgentApp />
    </AuthGuard>
  </AuthProvider>
} />
```

### File Structure

```
src/pages/SalesAgentApp.tsx           — page shell, header, tab routing
src/components/sales/KanbanBoard.tsx  — 5-column kanban, lead cards
src/components/sales/LeadModal.tsx    — add/edit lead form modal
src/components/sales/LeadDetail.tsx   — lead detail view with email timeline + won/lost buttons
src/components/sales/EmailLog.tsx     — full email history tab
src/components/sales/Settings.tsx     — business name, description, reply-to
src/lib/salesApi.ts                   — Supabase CRUD (leads, emails, settings)
```

### Page Shell (`SalesAgentApp.tsx`)

Same header pattern as Steuerhelfer:
- Dark header: `bg-slate-800` with logo, title "Runly Sales-Agent", user email + Abmelden
- Tab bar: **Pipeline** | **E-Mail-Verlauf** | **Einstellungen**
- Stats bar (Pipeline tab only): Active Leads, E-Mails gesendet, Gewonnen, Konversionsrate

### Kanban Board (`KanbanBoard.tsx`)

Five columns, left to right:

| Column | Status value | Header color |
|---|---|---|
| Neu | `new` | cyan-500 |
| Tag 1 gesendet | `day1_sent` | amber-400 |
| Tag 3 gesendet | `day3_sent` | orange-400 |
| Alle 3 gesendet | `day7_sent` | purple-400 |
| Gewonnen | `won` | green-400 |

`lost` leads are hidden from the board by default (accessible via a toggle).

**Lead card** shows: name, company, badge for current stage, date added. Clicking a card opens `LeadDetail` in a modal/slide-over.

**"+ Lead hinzufügen"** button opens `LeadModal`.

### Lead Modal (`LeadModal.tsx`)

Fields: Name (required), E-Mail (required), Unternehmen, Telefon, Notizen.

On submit: inserts row into `sales_leads` with `status = 'new'`. The cron will pick it up the next morning.

### Lead Detail (`LeadDetail.tsx`)

Shows all lead fields + a vertical timeline of sent emails (day number, subject, timestamp). Two action buttons at the bottom: **Gewonnen** (sets status → `won`) and **Verloren** (sets status → `lost`).

### Email Log (`EmailLog.tsx`)

Table of all sent emails across all leads: lead name, day number, subject, sent timestamp, status badge.

### Settings (`Settings.tsx`)

Form with: Business Name, Business Description (textarea, used in AI prompt), Reply-To E-Mail. Upserts `sales_settings` on save.

## Backend

### Vercel Cron (`api/sales-cron.ts`)

Configured in `vercel.json`:
```json
{
  "crons": [{ "path": "/api/sales-cron", "schedule": "0 7 * * *" }]
}
```

Runs at 07:00 UTC daily. Protected by `Authorization: Bearer $CRON_SECRET` header (Vercel injects this automatically; validated in the handler).

**Per-run logic:**

```
for each rule in [(status='new', days=1), (status='day1_sent', days=3), (status='day3_sent', days=7)]:
  leads = SELECT * FROM sales_leads
    WHERE status = rule.status
    AND created_at::date = (now() - rule.days * interval '1 day')::date

  for each lead:
    settings = SELECT * FROM sales_settings WHERE user_id = lead.user_id
    email = generateEmail(lead, settings, rule.days)  // Anthropic API
    send(email, lead.email, settings)                  // Resend API
    INSERT INTO sales_emails (...)
    UPDATE sales_leads SET status = nextStatus(rule.status)
```

### AI Email Generation (Anthropic)

Uses `claude-haiku-4-5-20251001` for speed and cost. Three system prompts — one per day:

**Day 1 — First contact:**
> You are a professional sales assistant for {business_name}. Write a short, warm, personalized first-contact email to {lead_name} from {lead_company}. Business context: {business_description}. Lead notes: {notes}. Keep it under 120 words. No hard sell. End with a clear, low-friction CTA.

**Day 3 — Follow-up with light offer:**
> You are a professional sales assistant for {business_name}. Write a brief follow-up email (Day 3) to {lead_name}. Reference the earlier email. Include one concrete value proposition. Business context: {business_description}. Lead notes: {notes}. Under 100 words.

**Day 7 — Final touch:**
> You are a professional sales assistant for {business_name}. Write a final, graceful follow-up email (Day 7) to {lead_name}. Acknowledge you don't want to bother them. Leave the door open. Business context: {business_description}. Lead notes: {notes}. Under 80 words.

Return format: JSON `{ "subject": "...", "body": "..." }` — parse with `JSON.parse()`.

### Email Sending (Resend)

- **From:** `{business_name} <noreply@runly.de>`
- **Reply-To:** client's `reply_to_email` from settings
- **To:** `lead.email`

New env var: `RESEND_API_KEY`.

## Environment Variables

| Variable | Used in | Notes |
|---|---|---|
| `VITE_SUPABASE_URL` | frontend | existing |
| `VITE_SUPABASE_ANON_KEY` | frontend | existing |
| `ANTHROPIC_API_KEY` | api/sales-cron | existing |
| `SUPABASE_SERVICE_ROLE_KEY` | api/sales-cron | new — needed for server-side Supabase writes |
| `RESEND_API_KEY` | api/sales-cron | new |
| `CRON_SECRET` | api/sales-cron | new — Vercel injects automatically |

## Scope

- This spec covers the complete first version of the Sales-Agent
- No drag-and-drop (client uses the Won/Lost buttons — columns are display-only)
- No email open/click tracking
- No custom drip timing (fixed Day 1/3/7)
- No multi-language email support
- Supabase migration applied directly (no local dev branch needed for now)
