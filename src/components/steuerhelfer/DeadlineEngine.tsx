import { useState } from 'react'

interface Deadline {
  name: string
  description: string
  dueDate: Date
  daysRemaining: number
  urgency: 'urgent' | 'soon' | 'ok'
  isEmployeeOnly: boolean
}

export function getDaysRemaining(date: Date): number {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const target = new Date(date)
  target.setHours(0, 0, 0, 0)
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

export function urgency(days: number): 'urgent' | 'soon' | 'ok' {
  if (days <= 14) return 'urgent'
  if (days <= 30) return 'soon'
  return 'ok'
}

function nextFutureDate(year: number, month: number, day: number): Date {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const d = new Date(year, month - 1, day)
  d.setHours(0, 0, 0, 0)
  return d > now ? d : new Date(year + 1, month - 1, day)
}

function nextQuarterlyUStVA(): Date {
  // Due: Apr 10, Jul 10, Oct 10, Jan 10 (following year)
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const year = now.getFullYear()
  const candidates = [
    new Date(year, 3, 10),
    new Date(year, 6, 10),
    new Date(year, 9, 10),
    new Date(year + 1, 0, 10),
  ]
  return candidates.find(d => { d.setHours(0, 0, 0, 0); return d > now }) ?? candidates[candidates.length - 1]
}

function nextQuarterlyVorauszahlung(): Date {
  // Due: Mar 10, Jun 10, Sep 10, Dec 10
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const year = now.getFullYear()
  const candidates = [
    new Date(year, 2, 10),
    new Date(year, 5, 10),
    new Date(year, 8, 10),
    new Date(year, 11, 10),
    new Date(year + 1, 2, 10),
  ]
  return candidates.find(d => { d.setHours(0, 0, 0, 0); return d > now }) ?? candidates[candidates.length - 1]
}

function nextMonthlyOn10th(): Date {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const year = now.getFullYear()
  const month = now.getMonth()
  const thisMonth = new Date(year, month, 10)
  thisMonth.setHours(0, 0, 0, 0)
  return thisMonth > now ? thisMonth : new Date(year, month + 1, 10)
}

export function computeDeadlines(includeEmployees: boolean): Deadline[] {
  const year = new Date().getFullYear()

  const all: Omit<Deadline, 'daysRemaining' | 'urgency'>[] = [
    {
      name: 'Umsatzsteuer-Voranmeldung (UStVA)',
      description: '10. des Folgemonats nach Quartalsende',
      dueDate: nextQuarterlyUStVA(),
      isEmployeeOnly: false,
    },
    {
      name: 'Einkommensteuer-Vorauszahlung',
      description: 'Quartalsweise: 10. März, Juni, September, Dezember',
      dueDate: nextQuarterlyVorauszahlung(),
      isEmployeeOnly: false,
    },
    {
      name: 'Umsatzsteuererklärung',
      description: `Jahreserklärung fällig 31. Juli ${year}`,
      dueDate: nextFutureDate(year, 7, 31),
      isEmployeeOnly: false,
    },
    {
      name: 'Einkommensteuererklärung',
      description: `Jahreserklärung fällig 31. Juli ${year}`,
      dueDate: nextFutureDate(year, 7, 31),
      isEmployeeOnly: false,
    },
    {
      name: 'Gewerbesteuererklärung',
      description: `Jahreserklärung fällig 31. Juli ${year}`,
      dueDate: nextFutureDate(year, 7, 31),
      isEmployeeOnly: false,
    },
    {
      name: 'Lohnsteuer-Anmeldung',
      description: '10. des Folgemonats (nur bei Angestellten)',
      dueDate: nextMonthlyOn10th(),
      isEmployeeOnly: true,
    },
  ]

  return all
    .filter(d => !d.isEmployeeOnly || includeEmployees)
    .map(d => {
      const days = getDaysRemaining(d.dueDate)
      return { ...d, daysRemaining: days, urgency: urgency(days) }
    })
    .sort((a, b) => a.daysRemaining - b.daysRemaining)
}

const URGENCY_STYLES: Record<Deadline['urgency'], string> = {
  urgent: 'bg-red-500/15 text-red-400 border border-red-500/20',
  soon: 'bg-amber-500/15 text-amber-400 border border-amber-500/20',
  ok: 'bg-green-500/15 text-green-400 border border-green-500/20',
}

const URGENCY_LABEL: Record<Deadline['urgency'], string> = {
  urgent: 'Dringend',
  soon: 'Bald fällig',
  ok: 'OK',
}

export default function DeadlineEngine() {
  const [hasEmployees, setHasEmployees] = useState(false)
  const deadlines = computeDeadlines(hasEmployees)

  return (
    <div className="space-y-4">
      <label className="flex items-center gap-2.5 text-sm text-slate-300 cursor-pointer">
        <input
          type="checkbox"
          checked={hasEmployees}
          onChange={e => setHasEmployees(e.target.checked)}
          className="w-4 h-4 rounded accent-cyan-500"
        />
        Ich habe Angestellte
      </label>

      <ul className="space-y-2">
        {deadlines.map(d => (
          <li
            key={d.name}
            className="bg-slate-800 rounded-xl border border-slate-700 p-4 flex justify-between items-start gap-3"
          >
            <div className="min-w-0">
              <p className="font-semibold text-slate-100 text-sm">{d.name}</p>
              <p className="text-xs text-slate-500 mt-0.5">{d.description}</p>
              <p className="text-xs text-slate-400 mt-1.5">
                Fällig: {d.dueDate.toLocaleDateString('de-DE')}
                {' '}
                <span className="text-slate-500">
                  ({d.daysRemaining > 0 ? `in ${d.daysRemaining} Tagen` : 'heute'})
                </span>
              </p>
            </div>
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${URGENCY_STYLES[d.urgency]}`}>
              {URGENCY_LABEL[d.urgency]}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
