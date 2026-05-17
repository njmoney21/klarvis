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

  it('escapes double quotes inside cell values per RFC 4180', () => {
    const csv = generateCSV([makeReceipt({ vendor: 'REWE "Markt"' })])
    const row = csv.split('\n')[1]
    expect(row).toContain('"REWE ""Markt"""')
  })
})
