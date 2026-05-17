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
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
            }`}
          >
            {m === 'scan' ? 'Beleg scannen' : 'Ausgangsrechnung prüfen'}
          </button>
        ))}
      </div>

      {/* Upload area */}
      {uiState === 'idle' && (
        <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-10 cursor-pointer hover:border-blue-400 transition-colors">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
          />
          <span className="text-3xl mb-2">📷</span>
          <p className="text-sm text-gray-600 font-medium">Foto hochladen</p>
          <p className="text-xs text-gray-400 mt-1">JPG, PNG, HEIC</p>
        </label>
      )}

      {/* Loading */}
      {uiState === 'loading' && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-sm">Analysiere Dokument...</p>
        </div>
      )}

      {/* Receipt preview */}
      {uiState === 'preview' && extracted && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
          <h3 className="font-semibold text-gray-900">Extrahierte Daten</h3>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <dt className="text-gray-500">Händler</dt>
            <dd className="text-gray-900 font-medium">{extracted.vendor}</dd>
            <dt className="text-gray-500">Datum</dt>
            <dd>{extracted.date}</dd>
            <dt className="text-gray-500">Brutto</dt>
            <dd>{extracted.amount_gross.toFixed(2)} €</dd>
            <dt className="text-gray-500">Netto</dt>
            <dd>{extracted.amount_net.toFixed(2)} €</dd>
            <dt className="text-gray-500">MwSt-Satz</dt>
            <dd>{extracted.vat_rate} %</dd>
            <dt className="text-gray-500">Vorsteuer</dt>
            <dd>{extracted.vat_amount.toFixed(2)} €</dd>
            <dt className="text-gray-500">Kategorie</dt>
            <dd>{extracted.category}</dd>
            <dt className="text-gray-500">SKR03</dt>
            <dd>{extracted.skr03_account}</dd>
          </dl>
          {extracted.notes && (
            <p className="text-xs text-gray-500 italic bg-gray-50 rounded p-2">{extracted.notes}</p>
          )}
          <div className="flex gap-2 pt-1">
            <button
              onClick={handleApprove}
              className="flex-1 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
            >
              Bestätigen & speichern
            </button>
            <button
              onClick={reset}
              className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              Verwerfen
            </button>
          </div>
        </div>
      )}

      {/* Compliance result */}
      {uiState === 'compliance' && compliance && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">§14 UStG Prüfung</h3>
            <span
              className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                compliance.is_compliant
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
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
                  <span className={present ? 'text-green-500' : 'text-red-500'}>
                    {present ? '✓' : '✗'}
                  </span>
                  <span className={present ? 'text-gray-700' : 'text-red-700 font-medium'}>
                    {label}
                  </span>
                </li>
              )
            })}
          </ul>
          {compliance.missing_fields.length > 0 && (
            <div className="bg-red-50 rounded-lg p-3 text-sm">
              <p className="font-medium text-red-800 mb-1">Bitte vor dem Versand ergänzen:</p>
              <ul className="list-disc list-inside text-red-700 space-y-0.5">
                {compliance.missing_fields.map(f => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </div>
          )}
          {compliance.notes && (
            <p className="text-xs text-gray-500 italic">{compliance.notes}</p>
          )}
          <button
            onClick={reset}
            className="w-full py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            Neue Prüfung
          </button>
        </div>
      )}

      {error && (
        <p className="text-red-600 text-sm text-center bg-red-50 rounded-lg py-3">{error}</p>
      )}
    </div>
  )
}
