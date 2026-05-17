import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { Receipt } from '../../lib/types'

export function generateCSV(receipts: Receipt[]): string {
  const header = 'Datum,Händler,Kategorie,Brutto,Netto,MwSt-Satz,Vorsteuer,SKR03'
  const rows = receipts.map(r =>
    [r.date, r.vendor, r.category, r.amount_gross, r.amount_net, r.vat_rate, r.vat_amount, r.skr03_account]
      .map(v => `"${String(v ?? '').replace(/"/g, '""')}"`)
      .join(',')
  )
  return [header, ...rows].join('\n')
}

interface Props {
  refreshKey: number
}

export default function Ausgaben({ refreshKey }: Props) {
  const [receipts, setReceipts] = useState<Receipt[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    supabase
      .from('receipts')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) setReceipts(data as Receipt[])
        setLoading(false)
      })
  }, [refreshKey])

  async function deleteReceipt(id: string) {
    await supabase.from('receipts').delete().eq('id', id)
    setReceipts(prev => prev.filter(r => r.id !== id))
  }

  function exportCSV() {
    const csv = generateCSV(receipts)
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ausgaben-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const totalGross = receipts.reduce((sum, r) => sum + (r.amount_gross ?? 0), 0)
  const totalVAT = receipts.reduce((sum, r) => sum + (r.vat_amount ?? 0), 0)

  if (loading) {
    return <p className="text-center py-8 text-gray-400">Lade Ausgaben...</p>
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <div className="bg-white rounded-xl p-4 border border-gray-200 flex-1">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Ausgaben (brutto)</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{totalGross.toFixed(2)} €</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 flex-1">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Vorsteuer gesamt</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{totalVAT.toFixed(2)} €</p>
        </div>
      </div>

      <button
        onClick={exportCSV}
        className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
      >
        DATEV-Export (CSV)
      </button>

      {receipts.length === 0 ? (
        <p className="text-center py-12 text-gray-400 text-sm">
          Noch keine Belege erfasst. Scannen Sie Ihren ersten Beleg.
        </p>
      ) : (
        <ul className="space-y-2">
          {receipts.map(r => (
            <li key={r.id} className="bg-white rounded-xl border border-gray-200 p-4 flex justify-between items-start gap-3">
              <div className="min-w-0">
                <p className="font-medium text-gray-900 truncate">{r.vendor ?? '—'}</p>
                <p className="text-xs text-gray-500 mt-0.5">{r.date} · {r.category}</p>
                <p className="text-sm text-gray-700 mt-1">{r.amount_gross?.toFixed(2)} € brutto</p>
                {r.description && (
                  <p className="text-xs text-gray-400 mt-0.5 truncate">{r.description}</p>
                )}
              </div>
              <button
                onClick={() => deleteReceipt(r.id)}
                className="text-red-400 hover:text-red-600 text-xs shrink-0 mt-1"
                aria-label="Beleg löschen"
              >
                Löschen
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
