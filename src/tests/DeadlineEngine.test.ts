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
