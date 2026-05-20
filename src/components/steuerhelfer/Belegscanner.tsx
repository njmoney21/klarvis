import { useState } from 'react'
import { scanReceipt, checkInvoice } from '../../lib/n8n'
import type { ComplianceResult, ExtractedReceipt } from '../../lib/types'

type Mode = 'scan' | 'invoice'
type State = 'idle' | 'loading' | 'preview' | 'compliance'

interface Props {
  onApproved: () => void
}

const COMPLIANCE_FIELDS: { key: keyof ComplianceResult; label: string }[] = [
  { key: 'has_vendor_name', label: 'Name des Ausstellers' },
  { key: 'has_vendor_address', label: 'Anschrift des Ausstellers' },
  { key: 'has_recipient_name', label: 'Name des Empfängers' },
  { key: 'has_recipient_address', label: 'Anschrift des Empfängers' },
  { key: 'has_tax_number_or_uid', label: 'Steuernummer oder USt-IdNr.' },
  { key: 'has_invoice_date', label: 'Ausstellungsdatum' },
  { key: 'has_invoice_number', label: 'Fortlaufende Rechnungsnummer' },
  { key: 'has_service_description', label: 'Leistungsbeschreibung' },
  { key: 'has_service_period', label: 'Leistungszeitraum' },
  { key: 'has_net_amount', label: 'Nettobetrag' },
  { key: 'has_vat_rate_and_amount', label: 'MwSt-Satz und -Betrag' },
  { key: 'has_gross_amount', label: 'Gesamtbetrag (brutto)' },
]

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve((reader.result as string).split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default function Belegscanner({ onApproved }: Props) {
  const [mode, setMode] = useState<Mode>('scan')
  const [uiState, setUiState] = useState<State>('idle')
  const [extracted, setExtracted] = useState<ExtractedReceipt | null>(null)
  const [compliance, setCompliance] = useState<ComplianceResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  function reset() {
    setExtracted(null)
    setCompliance(null)
    setError(null)
    setUiState('idle')
  }

  function switchMode(m: Mode) {
    setMode(m)
    reset()
  }

  async function handleFile(file: File) {
    setError(null)
    setUiState('loading')
    try {
      const base64 = await fileToBase64(file)
      if (mode === 'scan') {
        const result = await scanReceipt(base64)
        setExtracted(result)
        setUiState('preview')
      } else {
        const result = await checkInvoice(base64)
        setCompliance(result)
        setUiState('compliance')
      }
    } catch {
      setError('Fehler beim Verarbeiten. Bitte erneut versuchen.')
      setUiState('idle')
    }
  }

  function handleApprove() {
    reset()
    onApproved()
  }

  return (
    <div className="space-y-4">
      {/* Mode toggle */}
      <div className="flex gap-2">
        {(['scan', 'invoice'] as Mode[]).map(m => (
          <button
            key={m}
            onClick={() => switchMode(m)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
              mode === m
                ? 'bg-cyan-500 text-slate-900 border-cyan-500'
                : 'bg-slate-800 text-slate-500 border-slate-700 hover:border-slate-500'
            }`}
          >
            {m === 'scan' ? 'Beleg scannen' : 'Ausgangsrechnung prüfen'}
          </button>
        ))}
      </div>

      {/* Upload area */}
      {uiState === 'idle' && (
        <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-700 rounded-xl p-10 cursor-pointer hover:border-cyan-500 transition-colors">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
          />
          <span className="text-3xl mb-2">📷</span>
          <p className="text-sm text-slate-400 font-medium">Foto hochladen</p>
          <p className="text-xs text-slate-500 mt-1">JPG, PNG, HEIC</p>
        </label>
      )}

      {/* Loading */}
      {uiState === 'loading' && (
        <div className="text-center py-12">
          <p className="text-slate-400 text-sm">Analysiere Dokument...</p>
        </div>
      )}

      {/* Receipt preview */}
      {uiState === 'preview' && extracted && (
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 space-y-3">
          <h3 className="font-semibold text-slate-100">Extrahierte Daten</h3>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <dt className="text-slate-500">Händler</dt>
            <dd className="text-slate-100 font-medium">{extracted.vendor}</dd>
            <dt className="text-slate-500">Datum</dt>
            <dd className="text-slate-100">{extracted.date}</dd>
            <dt className="text-slate-500">Brutto</dt>
            <dd className="text-slate-100">{extracted.amount_gross.toFixed(2)} €</dd>
            <dt className="text-slate-500">Netto</dt>
            <dd className="text-slate-100">{extracted.amount_net.toFixed(2)} €</dd>
            <dt className="text-slate-500">MwSt-Satz</dt>
            <dd className="text-slate-100">{extracted.vat_rate} %</dd>
            <dt className="text-slate-500">Vorsteuer</dt>
            <dd className="text-slate-100">{extracted.vat_amount.toFixed(2)} €</dd>
            <dt className="text-slate-500">Kategorie</dt>
            <dd className="text-slate-100">{extracted.category}</dd>
            <dt className="text-slate-500">SKR03</dt>
            <dd className="text-slate-100">{extracted.skr03_account}</dd>
          </dl>
          {extracted.notes && (
            <p className="text-xs text-slate-400 italic bg-slate-900 rounded p-2">{extracted.notes}</p>
          )}
          <div className="flex gap-2 pt-1">
            <button
              onClick={handleApprove}
              className="flex-1 py-2.5 bg-cyan-500 text-slate-900 rounded-lg text-sm font-medium hover:bg-cyan-400 transition-colors"
            >
              Bestätigen & speichern
            </button>
            <button
              onClick={reset}
              className="flex-1 py-2.5 bg-slate-700 text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-600 transition-colors"
            >
              Verwerfen
            </button>
          </div>
        </div>
      )}

      {/* Compliance result */}
      {uiState === 'compliance' && compliance && (
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-100">§14 UStG Prüfung</h3>
            <span
              className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                compliance.is_compliant
                  ? 'bg-green-500/15 text-green-400 border border-green-500/20'
                  : 'bg-red-500/15 text-red-400 border border-red-500/20'
              }`}
            >
              {compliance.is_compliant ? 'Vollständig' : 'Unvollständig'}
            </span>
          </div>
          <ul className="space-y-1.5 text-sm">
            {COMPLIANCE_FIELDS.map(({ key, label }) => {
              const present = compliance[key] as boolean
              return (
                <li key={key} className="flex items-center gap-2">
                  <span className={present ? 'text-green-400' : 'text-red-400'}>
                    {present ? '✓' : '✗'}
                  </span>
                  <span className={present ? 'text-slate-300' : 'text-red-400 font-medium'}>
                    {label}
                  </span>
                </li>
              )
            })}
          </ul>
          {compliance.missing_fields.length > 0 && (
            <div className="bg-red-500/10 rounded-lg p-3 text-sm">
              <p className="font-medium text-red-400 mb-1">Bitte vor dem Versand ergänzen:</p>
              <ul className="list-disc list-inside text-red-400 space-y-0.5">
                {compliance.missing_fields.map(f => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </div>
          )}
          {compliance.notes && (
            <p className="text-xs text-slate-400 italic">{compliance.notes}</p>
          )}
          <button
            onClick={reset}
            className="w-full py-2.5 bg-slate-700 text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-600 transition-colors"
          >
            Neue Prüfung
          </button>
        </div>
      )}

      {error && (
        <p className="text-red-400 text-sm text-center bg-red-500/10 rounded-lg py-3">{error}</p>
      )}
    </div>
  )
}
