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
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  const { data, error } = await supabase
    .from('sales_leads')
    .insert({ ...lead, user_id: user.id })
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
  if (!Array.isArray(data)) return []
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
