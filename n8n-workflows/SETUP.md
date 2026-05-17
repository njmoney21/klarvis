# n8n Cloud Setup — Steuerhelfer

Three workflows to import. Total setup time: ~20 minutes.

---

## Step 1 — Create Credentials

In n8n Cloud go to **Settings → Credentials → New** and create these two:

### Credential 1: Anthropic API Key

- **Type:** `Header Auth`
- **Name:** `Anthropic API Key`
- **Name field:** `x-api-key`
- **Value field:** your Anthropic API key (starts with `sk-ant-`)

### Credential 2: Supabase Service Role

- **Type:** `Supabase`
- **Name:** `Supabase Service Role`
- **Host:** your Supabase project URL (e.g. `https://abcdefgh.supabase.co`)
- **Service Role Secret:** your Supabase service role key (Settings → API in Supabase dashboard — NOT the anon key)

---

## Step 2 — Import the Workflows

For each of the 3 JSON files in this folder:

1. Go to **Workflows** in n8n Cloud
2. Click **New** → **Import from file**
3. Select the JSON file
4. After import, open the workflow and link the credentials:
   - Click the `Call Claude Vision` or `Call Claude Chat` node → change credential from placeholder to `Anthropic API Key`
   - Click the `Save to Supabase` node → change credential to `Supabase Service Role`
5. Click **Save**, then **Activate** (toggle top-right)

### Files to import

| File | Workflow | Trigger URL |
|---|---|---|
| `scan-receipt.json` | Receipt scanner + Supabase insert | `/webhook/scan-receipt` |
| `chat.json` | Tax Q&A chat | `/webhook/chat` |
| `check-invoice.json` | §14 UStG invoice compliance | `/webhook/check-invoice` |

---

## Step 3 — Get Your Webhook URLs

After activating each workflow, click the **Webhook** node and copy the **Production URL**. It looks like:

```
https://yourname.app.n8n.cloud/webhook/scan-receipt
https://yourname.app.n8n.cloud/webhook/chat
https://yourname.app.n8n.cloud/webhook/check-invoice
```

---

## Step 4 — Update .env.local

Edit `C:\Users\nikol\Desktop\klarvis\.env.local` and replace the placeholder URLs:

```
VITE_N8N_SCAN=https://yourname.app.n8n.cloud/webhook/scan-receipt
VITE_N8N_CHAT=https://yourname.app.n8n.cloud/webhook/chat
VITE_N8N_INVOICE=https://yourname.app.n8n.cloud/webhook/check-invoice
```

Also fill in your Supabase values if not already done:

```
VITE_SUPABASE_URL=https://abcdefgh.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...  (the anon/public key, NOT service role)
```

---

## Step 5 — Create the Supabase Table

In Supabase dashboard → **SQL Editor**, run this once:

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
  image_url text
);

alter table receipts enable row level security;

create policy "anon_select" on receipts for select to anon using (true);
create policy "anon_delete" on receipts for delete to anon using (true);
```

---

## Testing a Workflow

In n8n, click a workflow → **Test workflow** to send a test request. Or use curl:

```bash
# Test chat workflow
curl -X POST https://yourname.app.n8n.cloud/webhook/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Wann ist die nächste UStVA fällig?", "history": []}'

# Expected response: {"reply": "..."}
```

---

## Troubleshooting

| Error | Fix |
|---|---|
| `401 Unauthorized` from Anthropic | API key credential is wrong or not linked to the node |
| `42501` from Supabase | Service role key not set — anon key cannot insert |
| `Claude did not return valid JSON` | Test with a clear, well-lit receipt photo |
| Webhook returns 404 | Workflow is saved but not **activated** — toggle top-right |
