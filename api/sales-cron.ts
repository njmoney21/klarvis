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

    let leadsRes: Response
    try {
      leadsRes = await fetch(
        `${supabaseUrl}/rest/v1/sales_leads?status=eq.${rule.status}&created_at=gte.${dateStr}T00%3A00%3A00Z&created_at=lt.${nextDateStr}T00%3A00%3A00Z&select=*`,
        { headers: sbHeaders },
      )
    } catch {
      continue
    }
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

      try {
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
      } catch (dbErr) {
        results.push({ lead_id: lead.id, day: rule.dayNumber, status: 'failed', error: `DB write error: ${String(dbErr)}` })
        continue
      }

      results.push({ lead_id: lead.id, day: rule.dayNumber, status: emailStatus, error: errorMsg })
    }
  }

  res.status(200).json({ processed: results.length, results })
}
