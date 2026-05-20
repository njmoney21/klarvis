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
