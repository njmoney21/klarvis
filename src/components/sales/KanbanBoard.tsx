import { useState } from 'react'
import type { SalesLead, LeadStatus } from '../../lib/types'

interface Props {
  leads: SalesLead[]
  onLeadClick: (lead: SalesLead) => void
  onAddLead: () => void
}

const COLUMNS: Array<{ status: LeadStatus; label: string; color: string }> = [
  { status: 'new',       label: 'Neu',            color: 'text-cyan-500' },
  { status: 'day1_sent', label: 'Tag 1 gesendet',  color: 'text-amber-400' },
  { status: 'day3_sent', label: 'Tag 3 gesendet',  color: 'text-orange-400' },
  { status: 'day7_sent', label: 'Alle 3 gesendet', color: 'text-purple-400' },
  { status: 'won',       label: 'Gewonnen',        color: 'text-green-400' },
]

const BADGE_CLASS: Record<LeadStatus, string> = {
  new:       'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20',
  day1_sent: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  day3_sent: 'bg-orange-500/10 text-orange-400 border border-orange-500/20',
  day7_sent: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
  won:       'bg-green-500/10 text-green-400 border border-green-500/20',
  lost:      'bg-slate-700/50 text-slate-400 border border-slate-600',
}

const BADGE_LABEL: Record<LeadStatus, string> = {
  new:       '✦ Neu',
  day1_sent: '📧 Tag 1',
  day3_sent: '📧 Tag 3',
  day7_sent: '📧 Tag 7',
  won:       '✓ Gewonnen',
  lost:      '✕ Verloren',
}

function relativeDate(isoString: string): string {
  const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 86400000)
  if (diff === 0) return 'Heute'
  if (diff === 1) return 'Gestern'
  return `Vor ${diff} Tagen`
}

function LeadCard({ lead, onClick }: { lead: SalesLead; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-slate-900 border border-slate-700 hover:border-cyan-500/50 rounded-lg p-2.5 transition-colors"
    >
      <p className="text-xs font-semibold text-slate-100 mb-0.5">{lead.name}</p>
      <p className="text-xs text-slate-500 mb-2 min-h-[1rem]">{lead.company ?? ''}</p>
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-600">{relativeDate(lead.created_at)}</span>
        <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${BADGE_CLASS[lead.status]}`}>
          {BADGE_LABEL[lead.status]}
        </span>
      </div>
    </button>
  )
}

export default function KanbanBoard({ leads, onLeadClick, onAddLead }: Props) {
  const [showLost, setShowLost] = useState(false)

  const lostLeads = leads.filter(l => l.status === 'lost')

  return (
    <div className="px-4 pb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-base font-bold text-slate-100">Pipeline</h2>
          <span className="text-xs text-slate-500 bg-slate-800 border border-slate-700 px-2.5 py-0.5 rounded-full">
            {leads.length} Leads gesamt
          </span>
        </div>
        <div className="flex items-center gap-3">
          {lostLeads.length > 0 && (
            <button
              onClick={() => setShowLost(v => !v)}
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              {showLost ? 'Verlorene ausblenden' : `${lostLeads.length} Verlorene anzeigen`}
            </button>
          )}
          <button
            onClick={onAddLead}
            className="flex items-center gap-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-900 text-sm font-bold px-3 py-1.5 rounded-lg transition-colors"
          >
            <span>+</span> Lead hinzufügen
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div
          className="grid gap-3 min-w-max"
          style={{ gridTemplateColumns: `repeat(${showLost ? 6 : 5}, 220px)` }}
        >
          {COLUMNS.map(col => {
            const colLeads = leads.filter(l => l.status === col.status)
            return (
              <div key={col.status} className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-3 py-2.5 border-b border-slate-700">
                  <span className={`text-xs font-bold uppercase tracking-wide ${col.color}`}>{col.label}</span>
                  <span className="text-xs font-bold text-slate-500 bg-slate-900 border border-slate-700 w-5 h-5 rounded flex items-center justify-center">
                    {colLeads.length}
                  </span>
                </div>
                <div className="p-2.5 flex flex-col gap-2 min-h-[120px]">
                  {colLeads.map(lead => (
                    <LeadCard key={lead.id} lead={lead} onClick={() => onLeadClick(lead)} />
                  ))}
                </div>
              </div>
            )
          })}

          {showLost && (
            <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden opacity-60">
              <div className="flex items-center justify-between px-3 py-2.5 border-b border-slate-700">
                <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Verloren</span>
                <span className="text-xs font-bold text-slate-500 bg-slate-900 border border-slate-700 w-5 h-5 rounded flex items-center justify-center">
                  {lostLeads.length}
                </span>
              </div>
              <div className="p-2.5 flex flex-col gap-2 min-h-[120px]">
                {lostLeads.map(lead => (
                  <LeadCard key={lead.id} lead={lead} onClick={() => onLeadClick(lead)} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
