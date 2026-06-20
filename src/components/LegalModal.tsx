import { useEffect } from 'react'

type LegalType = 'impressum' | 'datenschutz'

interface Props {
  type: LegalType
  onClose: () => void
}

const Tag = ({ children }: { children: React.ReactNode }) => (
  <span style={{
    display: 'inline-block',
    background: 'rgba(0,255,255,0.07)',
    border: '1px solid rgba(0,255,255,0.15)',
    borderRadius: '3px',
    padding: '2px 8px',
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '11px',
    color: 'rgba(0,255,255,0.6)',
    marginRight: '6px',
    marginBottom: '4px',
  }}>{children}</span>
)

const Sec = ({ num, title, children }: { num: string; title: string; children: React.ReactNode }) => (
  <div style={{ marginBottom: '40px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', letterSpacing: '2px', color: 'rgba(0,255,255,0.45)' }}>{num}</span>
      <span style={{ width: 20, height: 1, background: 'rgba(0,255,255,0.2)', display: 'block' }} />
    </div>
    <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#fff', letterSpacing: '-0.2px', marginBottom: '12px' }}>{title}</h2>
    <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.9 }}>{children}</div>
  </div>
)

const Sub = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div style={{ marginTop: '18px' }}>
    <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'rgba(255,255,255,0.7)', marginBottom: '8px' }}>{title}</h3>
    {children}
  </div>
)

const InfoBox = ({ children }: { children: React.ReactNode }) => (
  <div style={{
    marginTop: '14px',
    padding: '14px 18px',
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(0,255,255,0.08)',
    borderRadius: '6px',
    lineHeight: 2,
  }}>{children}</div>
)

function ImpressumContent() {
  return (
    <>
      <Sec num="01" title="Anbieter">
        <p>Runly</p>
        <p>Deutschland</p>
      </Sec>

      <Sec num="02" title="Kontakt">
        <p>E-Mail: <a href="mailto:runlyinternational@gmail.com" style={{ color: '#00ffff', textDecoration: 'none' }}>runlyinternational@gmail.com</a></p>
      </Sec>

      <Sec num="03" title="Verantwortlich für den Inhalt">
        <p>Runly</p>
        <p style={{ marginTop: '6px', fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>gemäß § 18 Abs. 2 Medienstaatsvertrag (MStV)</p>
      </Sec>

      <Sec num="04" title="Gewerbeanmeldung">
        <p>Einzelunternehmen, eingetragen beim Gewerbeamt der Stadt Mainburg.</p>
      </Sec>

      <Sec num="05" title="Streitschlichtung">
        <p>
          Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung bereit:{' '}
          <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer" style={{ color: '#00ffff', textDecoration: 'none' }}>
            ec.europa.eu/consumers/odr
          </a>
        </p>
        <p style={{ marginTop: '10px' }}>Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.</p>
      </Sec>

      <Sec num="06" title="Haftung für Inhalte">
        <p>Als Diensteanbieter sind wir gemäß § 7 Abs. 1 DDG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 DDG sind wir nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen.</p>
        <p style={{ marginTop: '10px' }}>Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen Gesetzen bleiben unberührt. Eine Haftung ist erst ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich.</p>
      </Sec>

      <Sec num="07" title="Haftung für Links">
        <p>Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter verantwortlich. Die verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße überprüft.</p>
      </Sec>

      <Sec num="08" title="Urheberrecht">
        <p>Die durch den Seitenbetreiber erstellten Inhalte und Werke unterliegen dem deutschen Urheberrecht. Vervielfältigung, Bearbeitung und Verbreitung außerhalb der Grenzen des Urheberrechts bedürfen der schriftlichen Zustimmung des Erstellers.</p>
      </Sec>
    </>
  )
}

function DatenschutzContent() {
  return (
    <>
      <Sec num="01" title="Verantwortlicher">
        <p>Verantwortlicher im Sinne der DSGVO:</p>
        <InfoBox>
          <strong style={{ color: '#fff' }}>Runly</strong><br />
          E-Mail: <a href="mailto:runlyinternational@gmail.com" style={{ color: '#00ffff', textDecoration: 'none' }}>runlyinternational@gmail.com</a><br />
          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>Vollständige Angaben im Impressum</span>
        </InfoBox>
      </Sec>

      <Sec num="02" title="Allgemeines zur Datenverarbeitung">
        <p>Wir verarbeiten personenbezogene Daten grundsätzlich nur, soweit dies zur Bereitstellung einer funktionsfähigen Website erforderlich ist. Die Verarbeitung erfolgt auf Grundlage der DSGVO, des BDSG sowie des BayDSG.</p>
      </Sec>

      <Sec num="03" title="Hosting — Vercel">
        <Tag>Art. 6 Abs. 1 lit. f DSGVO</Tag>
        <p style={{ marginTop: '10px' }}>Diese Website wird bei Vercel Inc., San Francisco, CA, USA gehostet. Beim Seitenaufruf werden automatisch Server-Logfiles erfasst (IP-Adresse, Datum/Uhrzeit, Browser, Betriebssystem, Referrer). Übertragung in die USA erfolgt auf Basis von Standardvertragsklauseln (SCC) gemäß Art. 46 Abs. 2 lit. c DSGVO.</p>
        <p style={{ marginTop: '8px' }}>
          <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" style={{ color: '#00ffff', textDecoration: 'none', fontSize: '13px' }}>
            vercel.com/legal/privacy-policy ↗
          </a>
        </p>
      </Sec>

      <Sec num="04" title="Google Fonts">
        <Tag>Art. 6 Abs. 1 lit. f DSGVO</Tag>
        <p style={{ marginTop: '10px' }}>Diese Website lädt Schriftarten von Google-Servern (Google Ireland Limited, Dublin). Dabei wird Ihre IP-Adresse an Google übertragen. Google ist im EU-U.S. Data Privacy Framework zertifiziert.</p>
        <p style={{ marginTop: '8px' }}>
          <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: '#00ffff', textDecoration: 'none', fontSize: '13px' }}>
            policies.google.com/privacy ↗
          </a>
        </p>
      </Sec>

      <Sec num="05" title="Kontaktformular">
        <Tag>Art. 6 Abs. 1 lit. b DSGVO</Tag>
        <p style={{ marginTop: '10px' }}>Das Kontaktformular übermittelt Name, E-Mail-Adresse und Nachricht über Formspree Inc. (USA) an uns. Daten werden ausschließlich zur Bearbeitung Ihrer Anfrage verwendet und nach Abschluss gelöscht, sofern keine Aufbewahrungspflichten bestehen.</p>
      </Sec>

      <Sec num="06" title="Steuerhelfer-App (/app)">
        <p>Der Bereich <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', color: 'rgba(0,255,255,0.6)' }}>/app</span> ist ein gesonderter, passwortgeschützter Bereich.</p>
        <Sub title="Supabase — Authentifizierung & Datenbank">
          <Tag>Art. 6 Abs. 1 lit. b DSGVO</Tag>
          <p style={{ marginTop: '8px' }}>Nutzeranmeldung per Magic Link und Speicherung von Belegdaten über Supabase Inc. (USA).{' '}
            <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: '#00ffff', textDecoration: 'none' }}>supabase.com/privacy ↗</a>
          </p>
        </Sub>
        <Sub title="n8n — Workflow-Automatisierung">
          <Tag>Art. 6 Abs. 1 lit. b DSGVO</Tag>
          <p style={{ marginTop: '8px' }}>Belegdaten und Chat-Anfragen werden über n8n GmbH (Berlin) verarbeitet. Keine dauerhafte Speicherung durch n8n.</p>
        </Sub>
        <Sub title="Stripe — Zahlungsabwicklung">
          <Tag>Art. 6 Abs. 1 lit. b DSGVO</Tag>
          <p style={{ marginTop: '8px' }}>Zahlungen werden über Stripe Payments Europe Ltd. (Dublin) abgewickelt.{' '}
            <a href="https://stripe.com/de/privacy" target="_blank" rel="noopener noreferrer" style={{ color: '#00ffff', textDecoration: 'none' }}>stripe.com/de/privacy ↗</a>
          </p>
        </Sub>
      </Sec>

      <Sec num="07" title="Cookies">
        <p>Diese Website verwendet ausschließlich technisch notwendige Cookies (z. B. Session-Cookies für den eingeloggten Bereich). Es werden keine Tracking- oder Marketing-Cookies eingesetzt. Eine Einwilligung ist nach § 25 Abs. 2 TTDSG nicht erforderlich.</p>
      </Sec>

      <Sec num="08" title="Ihre Rechte">
        <p>Sie haben folgende Rechte hinsichtlich Ihrer personenbezogenen Daten:</p>
        <ul style={{ marginTop: '10px', paddingLeft: '18px', lineHeight: 2.3 }}>
          <li>Auskunftsrecht — Art. 15 DSGVO</li>
          <li>Recht auf Berichtigung — Art. 16 DSGVO</li>
          <li>Recht auf Löschung — Art. 17 DSGVO</li>
          <li>Recht auf Einschränkung — Art. 18 DSGVO</li>
          <li>Recht auf Datenübertragbarkeit — Art. 20 DSGVO</li>
          <li>Widerspruchsrecht — Art. 21 DSGVO</li>
        </ul>
        <p style={{ marginTop: '12px' }}>
          Kontakt: <a href="mailto:runlyinternational@gmail.com" style={{ color: '#00ffff', textDecoration: 'none' }}>runlyinternational@gmail.com</a>
        </p>
      </Sec>

      <Sec num="09" title="Aufsichtsbehörde">
        <InfoBox>
          <strong style={{ color: '#fff' }}>Bayerisches Landesamt für Datenschutzaufsicht (BayLDA)</strong><br />
          Promenade 18, 91522 Ansbach<br />
          <a href="https://www.lda.bayern.de" target="_blank" rel="noopener noreferrer" style={{ color: '#00ffff', textDecoration: 'none' }}>
            www.lda.bayern.de ↗
          </a>
        </InfoBox>
      </Sec>
    </>
  )
}

export default function LegalModal({ type, onClose }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const isImpressum = type === 'impressum'

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(6px)',
        zIndex: 200,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        padding: '0',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '680px',
          maxHeight: '88vh',
          background: '#020d14',
          border: '1px solid rgba(0,255,255,0.12)',
          borderBottom: 'none',
          borderRadius: '12px 12px 0 0',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 -24px 80px rgba(0,0,0,0.8)',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 24px 16px',
          borderBottom: '1px solid rgba(0,255,255,0.08)',
          flexShrink: 0,
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', letterSpacing: '2px', color: 'rgba(0,255,255,0.4)', textTransform: 'uppercase' }}>
                {isImpressum ? '§5 DDG' : 'DSGVO 2026'}
              </span>
            </div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>
              {isImpressum ? 'Impressum' : 'Datenschutzerklärung'}
            </h2>
          </div>

          <button
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.4)',
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.15s, color 0.15s',
              flexShrink: 0,
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,255,255,0.08)'; (e.currentTarget as HTMLButtonElement).style.color = '#00ffff' }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)'; (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.4)' }}
          >
            ✕
          </button>
        </div>

        {/* Scrollable content */}
        <div style={{ overflowY: 'auto', padding: '28px 24px 40px', flex: 1 }}>
          {isImpressum ? <ImpressumContent /> : <DatenschutzContent />}

          <div style={{
            marginTop: '16px',
            padding: '12px 16px',
            background: 'rgba(0,255,255,0.03)',
            border: '1px solid rgba(0,255,255,0.07)',
            borderRadius: '5px',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '10px',
            color: 'rgba(255,255,255,0.18)',
            letterSpacing: '0.5px',
          }}>
            Stand: Mai 2026 — Bayerisches Recht, Gerichtsstand Mainburg
          </div>
        </div>
      </div>
    </div>
  )
}
