import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const Section = ({ num, title, children }: { num: string; title: string; children: React.ReactNode }) => (
  <div style={{ marginBottom: '48px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', letterSpacing: '2px', color: 'rgba(0,255,255,0.45)' }}>
        {num}
      </span>
      <span style={{ width: 24, height: 1, background: 'rgba(0,255,255,0.2)', display: 'block' }} />
    </div>
    <h2
      style={{
        fontSize: '16px',
        fontWeight: 700,
        color: '#fff',
        letterSpacing: '-0.3px',
        marginBottom: '14px',
      }}
    >
      {title}
    </h2>
    <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.9 }}>
      {children}
    </div>
  </div>
)

const Sub = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div style={{ marginTop: '20px', marginBottom: '4px' }}>
    <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'rgba(255,255,255,0.75)', marginBottom: '8px' }}>
      {title}
    </h3>
    {children}
  </div>
)

const Tag = ({ children }: { children: React.ReactNode }) => (
  <span
    style={{
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
    }}
  >
    {children}
  </span>
)

export default function Datenschutz() {
  return (
    <>
      <Navbar />
      <main
        style={{
          minHeight: '100vh',
          background: '#020d14',
          paddingTop: '100px',
          paddingBottom: '80px',
          paddingLeft: '24px',
          paddingRight: '24px',
        }}
      >
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>

          {/* Header */}
          <div style={{ marginBottom: '56px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', letterSpacing: '2px', color: 'rgba(0,255,255,0.45)' }}>
                LEGAL
              </span>
              <span style={{ width: 32, height: 1, background: 'rgba(0,255,255,0.2)', display: 'block' }} />
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', textTransform: 'uppercase', letterSpacing: '3px', color: 'rgba(0,255,255,0.4)' }}>
                DSGVO
              </span>
            </div>
            <h1
              style={{
                fontWeight: 800,
                color: '#fff',
                fontSize: 'clamp(1.8rem, 3vw, 2.6rem)',
                letterSpacing: '-1px',
                lineHeight: 1.1,
                marginBottom: '12px',
              }}
            >
              Datenschutzerklärung
            </h1>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.28)', fontFamily: "'JetBrains Mono', monospace" }}>
              Stand: Mai 2026 — gemäß DSGVO, BDSG und BayDSG
            </p>
          </div>

          <div style={{ width: '100%', height: 1, background: 'rgba(0,255,255,0.08)', marginBottom: '48px' }} />

          {/* 1 */}
          <Section num="01" title="Verantwortlicher">
            <p>
              Verantwortlicher im Sinne der Datenschutz-Grundverordnung (DSGVO) ist:
            </p>
            <div
              style={{
                marginTop: '16px',
                padding: '16px 20px',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(0,255,255,0.08)',
                borderRadius: '6px',
                lineHeight: 2,
              }}
            >
              <strong style={{ color: '#fff' }}>Nikola Todorovic</strong><br />
              Hainbuchenweg 2a<br />
              84048 Mainburg<br />
              E-Mail:{' '}
              <a href="mailto:nikolatodorovic800@gmail.com" style={{ color: '#00ffff', textDecoration: 'none' }}>
                nikolatodorovic800@gmail.com
              </a>
            </div>
          </Section>

          {/* 2 */}
          <Section num="02" title="Allgemeines zur Datenverarbeitung">
            <p>
              Wir verarbeiten personenbezogene Daten unserer Nutzer grundsätzlich nur, soweit dies
              zur Bereitstellung einer funktionsfähigen Website sowie unserer Inhalte und Leistungen
              erforderlich ist. Die Verarbeitung personenbezogener Daten erfolgt regelmäßig nur nach
              Einwilligung des Nutzers. Eine Ausnahme gilt in solchen Fällen, in denen eine
              vorherige Einholung einer Einwilligung aus tatsächlichen Gründen nicht möglich ist und
              die Verarbeitung der Daten durch gesetzliche Vorschriften gestattet ist.
            </p>
            <Sub title="Rechtsgrundlagen">
              <p>
                Soweit wir für Verarbeitungsvorgänge personenbezogener Daten eine Einwilligung der
                betroffenen Person einholen, dient Art. 6 Abs. 1 lit. a DSGVO als Rechtsgrundlage.
                Bei der Verarbeitung von personenbezogenen Daten, die zur Erfüllung eines Vertrages
                erforderlich sind, dient Art. 6 Abs. 1 lit. b DSGVO als Rechtsgrundlage. Zur Wahrung
                berechtigter Interessen nach Art. 6 Abs. 1 lit. f DSGVO verarbeiten wir Daten im
                Rahmen des Betriebs dieser Website.
              </p>
            </Sub>
          </Section>

          {/* 3 */}
          <Section num="03" title="Hosting — Vercel">
            <Tag>Art. 6 Abs. 1 lit. f DSGVO</Tag>
            <p style={{ marginTop: '10px' }}>
              Diese Website wird bei Vercel Inc., 340 Pine Street, Suite 701, San Francisco, CA 94104,
              USA gehostet. Beim Aufruf unserer Website werden durch den Hosting-Anbieter automatisch
              Server-Logfiles erfasst. Diese enthalten:
            </p>
            <ul style={{ marginTop: '12px', paddingLeft: '20px', lineHeight: 2.2 }}>
              <li>IP-Adresse des anfragenden Geräts</li>
              <li>Datum und Uhrzeit des Zugriffs</li>
              <li>Name und URL der abgerufenen Datei</li>
              <li>Übertragene Datenmenge</li>
              <li>Meldung über erfolgreichen Abruf</li>
              <li>Browsertyp und -version</li>
              <li>Betriebssystem des Nutzers</li>
              <li>Referrer-URL</li>
            </ul>
            <p style={{ marginTop: '12px' }}>
              Die Daten werden von Vercel auf Grundlage von Standardvertragsklauseln (SCC) gemäß
              Art. 46 Abs. 2 lit. c DSGVO auch in die USA übertragen. Weitere Informationen:{' '}
              <a
                href="https://vercel.com/legal/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#00ffff', textDecoration: 'none' }}
              >
                vercel.com/legal/privacy-policy
              </a>
            </p>
          </Section>

          {/* 4 */}
          <Section num="04" title="Google Fonts">
            <Tag>Art. 6 Abs. 1 lit. f DSGVO</Tag>
            <p style={{ marginTop: '10px' }}>
              Diese Website verwendet Google Fonts, einen Dienst der Google LLC, 1600 Amphitheatre
              Parkway, Mountain View, CA 94043, USA (innerhalb der EU: Google Ireland Limited, Gordon
              House, Barrow Street, Dublin 4, Irland).
            </p>
            <p style={{ marginTop: '12px' }}>
              Beim Laden einer Seite wird die Schriftart direkt von Google-Servern abgerufen. Dabei
              wird Ihre IP-Adresse an Google übertragen. Es besteht ein Angemessenheitsbeschluss der
              EU-Kommission für Google (EU-U.S. Data Privacy Framework). Weitere Informationen:{' '}
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#00ffff', textDecoration: 'none' }}
              >
                policies.google.com/privacy
              </a>
            </p>
          </Section>

          {/* 5 */}
          <Section num="05" title="Kontaktformular">
            <Tag>Art. 6 Abs. 1 lit. b DSGVO</Tag>
            <Tag>Art. 6 Abs. 1 lit. f DSGVO</Tag>
            <p style={{ marginTop: '10px' }}>
              Bei der Nutzung unseres Kontaktformulars werden folgende Daten erhoben:
            </p>
            <ul style={{ marginTop: '10px', paddingLeft: '20px', lineHeight: 2.2 }}>
              <li>Name</li>
              <li>E-Mail-Adresse</li>
              <li>Nachrichteninhalt</li>
            </ul>
            <p style={{ marginTop: '12px' }}>
              Die Übermittlung erfolgt über Formspree Inc., 340 S Lemon Ave #8687, Walnut, CA 91789,
              USA. Die Daten werden ausschließlich zur Bearbeitung Ihrer Anfrage verwendet und nicht
              an Dritte weitergegeben. Die Daten werden nach abschließender Bearbeitung gelöscht,
              sofern keine gesetzlichen Aufbewahrungspflichten bestehen.
            </p>
          </Section>

          {/* 6 */}
          <Section num="06" title="Steuerhelfer-App (/app)">
            <p>
              Der Bereich <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', color: 'rgba(0,255,255,0.6)' }}>/app</span>{' '}
              dieser Website ist ein gesonderter, passwortgeschützter Bereich mit erweiterten
              Datenverarbeitungsvorgängen.
            </p>

            <Sub title="Supabase — Authentifizierung & Datenbank">
              <Tag>Art. 6 Abs. 1 lit. b DSGVO</Tag>
              <p style={{ marginTop: '8px' }}>
                Zur Nutzerauthentifizierung (Magic Link per E-Mail) und Speicherung von hochgeladenen
                Belegen wird Supabase (Supabase Inc., 970 Trestle Glen Rd, Oakland, CA 94610, USA)
                verwendet. Gespeicherte Daten: E-Mail-Adresse, Scan-Daten hochgeladener Belege.
                Rechtsgrundlage: Vertragserfüllung. Weitere Informationen:{' '}
                <a
                  href="https://supabase.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#00ffff', textDecoration: 'none' }}
                >
                  supabase.com/privacy
                </a>
              </p>
            </Sub>

            <Sub title="n8n — Workflow-Automatisierung">
              <Tag>Art. 6 Abs. 1 lit. b DSGVO</Tag>
              <p style={{ marginTop: '8px' }}>
                Zur Verarbeitung von Belegdaten, Rechnungsprüfung und Chat-Anfragen wird n8n (n8n GmbH,
                Urbanstraße 71, 10967 Berlin) als Workflow-Automatisierungsdienst eingesetzt.
                Übermittelte Daten werden ausschließlich zur Verarbeitung der jeweiligen Anfrage
                verwendet und nicht dauerhaft gespeichert.
              </p>
            </Sub>

            <Sub title="Stripe — Zahlungsabwicklung">
              <Tag>Art. 6 Abs. 1 lit. b DSGVO</Tag>
              <p style={{ marginTop: '8px' }}>
                Zahlungen werden über Stripe Payments Europe, Ltd., 1 Grand Canal Street Lower,
                Grand Canal Dock, Dublin D02 H210, Irland, abgewickelt. Stripe verarbeitet
                Zahlungsdaten gemäß PCI-DSS. Weitere Informationen:{' '}
                <a
                  href="https://stripe.com/de/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#00ffff', textDecoration: 'none' }}
                >
                  stripe.com/de/privacy
                </a>
              </p>
            </Sub>
          </Section>

          {/* 7 */}
          <Section num="07" title="Cookies">
            <p>
              Diese Website verwendet technisch notwendige Cookies, die für den Betrieb der Website
              erforderlich sind (z. B. Session-Cookies für den eingeloggten Bereich). Es werden
              keine Tracking- oder Marketing-Cookies eingesetzt. Eine Einwilligung ist für
              technisch notwendige Cookies nach § 25 Abs. 2 TTDSG nicht erforderlich.
            </p>
          </Section>

          {/* 8 */}
          <Section num="08" title="Ihre Rechte als betroffene Person">
            <p>Sie haben gegenüber uns folgende Rechte hinsichtlich der Sie betreffenden personenbezogenen Daten:</p>
            <ul style={{ marginTop: '12px', paddingLeft: '20px', lineHeight: 2.4 }}>
              <li><strong style={{ color: 'rgba(255,255,255,0.75)' }}>Auskunftsrecht</strong> — Art. 15 DSGVO</li>
              <li><strong style={{ color: 'rgba(255,255,255,0.75)' }}>Recht auf Berichtigung</strong> — Art. 16 DSGVO</li>
              <li><strong style={{ color: 'rgba(255,255,255,0.75)' }}>Recht auf Löschung</strong> — Art. 17 DSGVO</li>
              <li><strong style={{ color: 'rgba(255,255,255,0.75)' }}>Recht auf Einschränkung der Verarbeitung</strong> — Art. 18 DSGVO</li>
              <li><strong style={{ color: 'rgba(255,255,255,0.75)' }}>Recht auf Datenübertragbarkeit</strong> — Art. 20 DSGVO</li>
              <li><strong style={{ color: 'rgba(255,255,255,0.75)' }}>Widerspruchsrecht</strong> — Art. 21 DSGVO</li>
              <li><strong style={{ color: 'rgba(255,255,255,0.75)' }}>Recht auf Widerruf einer Einwilligung</strong> — Art. 7 Abs. 3 DSGVO</li>
            </ul>
            <p style={{ marginTop: '16px' }}>
              Zur Ausübung Ihrer Rechte wenden Sie sich bitte an:{' '}
              <a href="mailto:nikolatodorovic800@gmail.com" style={{ color: '#00ffff', textDecoration: 'none' }}>
                nikolatodorovic800@gmail.com
              </a>
            </p>
          </Section>

          {/* 9 */}
          <Section num="09" title="Beschwerderecht bei der Aufsichtsbehörde">
            <p>
              Sie haben das Recht, sich bei der für uns zuständigen Datenschutz-Aufsichtsbehörde
              zu beschweren (Art. 77 DSGVO):
            </p>
            <div
              style={{
                marginTop: '16px',
                padding: '16px 20px',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(0,255,255,0.08)',
                borderRadius: '6px',
                lineHeight: 2,
              }}
            >
              <strong style={{ color: '#fff' }}>Bayerisches Landesamt für Datenschutzaufsicht (BayLDA)</strong><br />
              Promenade 18<br />
              91522 Ansbach<br />
              Bayern, Deutschland<br />
              <a
                href="https://www.lda.bayern.de"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#00ffff', textDecoration: 'none' }}
              >
                www.lda.bayern.de
              </a>
            </div>
          </Section>

          {/* 10 */}
          <Section num="10" title="Aktualität und Änderung dieser Datenschutzerklärung">
            <p>
              Diese Datenschutzerklärung ist aktuell gültig und hat den Stand Mai 2026. Durch die
              Weiterentwicklung unserer Website und Angebote oder aufgrund geänderter gesetzlicher
              bzw. behördlicher Vorgaben kann es notwendig werden, diese Datenschutzerklärung zu
              ändern. Die jeweils aktuelle Datenschutzerklärung kann jederzeit auf der Website unter{' '}
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', color: 'rgba(0,255,255,0.6)' }}>
                /datenschutz
              </span>{' '}
              abgerufen werden.
            </p>
          </Section>

          <div
            style={{
              marginTop: '24px',
              padding: '16px 20px',
              background: 'rgba(0,255,255,0.03)',
              border: '1px solid rgba(0,255,255,0.08)',
              borderRadius: '6px',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '11px',
              color: 'rgba(255,255,255,0.2)',
              letterSpacing: '0.5px',
            }}
          >
            Stand: Mai 2026 — DSGVO, BDSG, BayDSG, TTDSG — Gerichtsstand Mainburg, Bayern
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
