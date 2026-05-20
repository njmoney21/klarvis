import { useState, useEffect } from 'react'
import { useAuth } from '../lib/auth'
import { getLeads, createLead, updateLeadStatus, getEmailsSentCount } from '../lib/salesApi'
import type { SalesLead, LeadStatus } from '../lib/types'
import KanbanBoard from '../components/sales/KanbanBoard'
import LeadModal from '../components/sales/LeadModal'
import LeadDetail from '../components/sales/LeadDetail'
import EmailLog from '../components/sales/EmailLog'
import Settings from '../components/sales/Settings'

type SalesTab = 'pipeline' | 'emails' | 'settings'

const TAB_LABELS: Record<SalesTab, string> = {
  pipeline: 'Pipeline',
  emails: 'E-Mail-Verlauf',
  settings: 'Einstellungen',
}

const TABS: SalesTab[] = ['pipeline', 'emails', 'settings']

export default function SalesAgentApp() {
  const { session, signOut } = useAuth()
  const [activeTab, setActiveTab] = useState<SalesTab>('pipeline')
  const [leads, setLeads] = useState<SalesLead[]>([])
  const [emailCount, setEmailCount] = useState(0)
  const [selectedLead, setSelectedLead] = useState<SalesLead | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => { void load() }, [])

  const load = async () => {
    setLoadError(null)
    try {
      const [leadsData, count] = await Promise.all([getLeads(), getEmailsSentCount()])
      setLeads(leadsData)
      setEmailCount(count)
    } catch {
      setLoadError('Leads konnten nicht geladen werden.')
    }
  }

  const handleAddLead = async (lead: Pick<SalesLead, 'name' | 'email' | 'phone' | 'company' | 'notes'>) => {
    await createLead(lead)
    setShowAddModal(false)
    await load()
  }

  const handleStatusChange = async (id: string, status: LeadStatus) => {
    await updateLeadStatus(id, status)
    setSelectedLead(null)
    await load()
  }

  const activeLeads = leads.filter(l => l.status !== 'won' && l.status !== 'lost')
  const wonLeads = leads.filter(l => l.status === 'won')
  const lostLeads = leads.filter(l => l.status === 'lost')
  const totalDecided = wonLeads.length + lostLeads.length
  const conversionRate = totalDecided > 0 ? Math.round((wonLeads.length / totalDecided) * 100) : 0

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="bg-slate-800 border-b border-slate-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div aria-hidden="true" className="w-7 h-7 rounded-lg bg-cyan-500 flex items-center justify-center text-slate-900 text-sm font-bold shrink-0">
            ⬡
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-100">Runly Sales-Agent</h1>
            <p className="text-xs text-slate-500">KI-gestütztes Lead-Management</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500 mb-1 truncate max-w-[160px]">{session?.user.email}</p>
          <button
            onClick={signOut}
            className="text-xs text-cyan-500 hover:text-cyan-400 transition-colors"
          >
            Abmelden
          </button>
        </div>
      </header>

      <nav className="bg-slate-800 border-b border-slate-700 overflow-x-auto">
        <div className="flex min-w-max">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                activeTab === tab
                  ? 'border-cyan-500 text-cyan-500 bg-cyan-500/5'
                  : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}
            >
              {TAB_LABELS[tab]}
            </button>
          ))}
        </div>
      </nav>

      {loadError && (
        <div className="mx-4 mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
          {loadError}
        </div>
      )}

      {activeTab === 'pipeline' && (
        <>
          <div className="flex gap-3 p-4">
            {([
              { label: 'Aktive Leads',    value: activeLeads.length,  cls: 'text-cyan-500' },
              { label: 'E-Mails gesendet', value: emailCount,          cls: 'text-slate-100' },
              { label: 'Gewonnen',         value: wonLeads.length,     cls: 'text-green-400' },
              { label: 'Konversionsrate',  value: `${conversionRate}%`, cls: 'text-slate-100' },
            ] as const).map(stat => (
              <div key={stat.label} className="flex-1 bg-slate-800 border border-slate-700 rounded-lg p-3">
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">{stat.label}</p>
                <p className={`text-2xl font-bold ${stat.cls}`}>{stat.value}</p>
              </div>
            ))}
          </div>

          <KanbanBoard
            leads={leads}
            onLeadClick={setSelectedLead}
            onAddLead={() => setShowAddModal(true)}
          />
        </>
      )}

      {activeTab === 'emails' && <EmailLog />}
      {activeTab === 'settings' && <Settings />}

      {showAddModal && (
        <LeadModal
          onClose={() => setShowAddModal(false)}
          onSave={handleAddLead}
        />
      )}

      {selectedLead && (
        <LeadDetail
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  )
}
