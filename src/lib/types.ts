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
