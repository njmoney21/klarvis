import { useState } from 'react'
import Belegscanner from '../components/steuerhelfer/Belegscanner'
import Ausgaben from '../components/steuerhelfer/Ausgaben'
import TaxChat from '../components/steuerhelfer/TaxChat'
import DeadlineEngine from '../components/steuerhelfer/DeadlineEngine'
import { useAuth } from '../lib/auth'

type Tab = 'scanner' | 'ausgaben' | 'chat' | 'fristen'

const TAB_LABELS: Record<Tab, string> = {
  scanner: 'Belegscanner',
  ausgaben: 'Ausgaben',
  chat: 'Steuer-FAQ',
  fristen: 'Fristen',
}

const TABS: Tab[] = ['scanner', 'ausgaben', 'chat', 'fristen']

export default function SteuerhelferApp() {
  const [activeTab, setActiveTab] = useState<Tab>('scanner')
  const [refreshKey, setRefreshKey] = useState(0)
  const { session, signOut } = useAuth()

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="bg-slate-800 border-b border-slate-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div aria-hidden="true" className="w-7 h-7 rounded-lg bg-cyan-500 flex items-center justify-center text-slate-900 text-sm font-bold shrink-0">
            ⬡
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-100">Runly Steuerberater</h1>
            <p className="text-xs text-slate-500">KI-Assistent für Kleinunternehmer</p>
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

      <main className="p-4 max-w-2xl mx-auto">
        {activeTab === 'scanner' && (
          <Belegscanner onApproved={() => setRefreshKey(k => k + 1)} />
        )}
        {activeTab === 'ausgaben' && <Ausgaben refreshKey={refreshKey} />}
        {activeTab === 'chat' && <TaxChat />}
        {activeTab === 'fristen' && <DeadlineEngine />}
      </main>
    </div>
  )
}
