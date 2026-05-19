import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div style={{ marginBottom: '40px' }}>
    <h2
      style={{
        fontSize: '13px',
        fontWeight: 700,
        color: '#00ffff',
        fontFamily: "'JetBrains Mono', monospace",
        letterSpacing: '2px',
        textTransform: 'uppercase',
        marginBottom: '14px',
      }}
    >
      {title}
    </h2>
    <div style={{ fontSize: '15px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.9 }}>
      {children}
    </div>
  </div>
)

export default function Impressum() {
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
                §5 DDG
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
              Impressum
            </h1>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.28)', fontFamily: "'JetBrains Mono', monospace" }}>
              Angaben gemäß § 5 Digitale-Dienste-Gesetz (DDG)
            </p>
          </div>

          <div style={{ width: '100%', height: 1, background: 'rgba(0,255,255,0.08)', marginBottom: '48px' }} />

          <Section title="Anbieter">
            <p>Nikola Todorovic</p>
            <p>Hainbuchenweg 2a</p>
            <p>84048 Mainburg</p>
            <p>Deutschland</p>
          </Section>

          <Section title="Kontakt">
            <p>
              E-Mail:{' '}
              <a
                href="mailto:nikolatodorovic800@gmail.com"
                style={{ color: '#00ffff', textDecoration: 'none' }}
              >
                nikolatodorovic800@gmail.com
              </a>
            </p>
          </Section>

          <Section title="Verantwortlich für den Inhalt">
            <p>Nikola Todorovic</p>
            <p>Hainbuchenweg 2a</p>
            <p>84048 Mainburg</p>
            <p style={{ marginTop: '8px', fontSize: '13px', color: 'rgba(255,255,255,0.35)' }}>
              gemäß § 18 Abs. 2 Medienstaatsvertrag (MStV)
            </p>
          </Section>

          <Section title="Gewerbeanmeldung">
            <p>
              Einzelunternehmen, eingetragen beim zuständigen Gewerbeamt der Stadt Mainburg.
            </p>
          </Section>

          <Section title="Streitschlichtung">
            <p>
              Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{' '}
              <a
                href="https://ec.europa.eu/consumers/odr/"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#00ffff', textDecoration: 'none' }}
              >
                https://ec.europa.eu/consumers/odr/
              </a>
            </p>
            <p style={{ marginTop: '12px' }}>
              Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer
              Verbraucherschlichtungsstelle teilzunehmen.
            </p>
          </Section>

          <Section title="Haftung für Inhalte">
            <p>
              Als Diensteanbieter sind wir gemäß § 7 Abs. 1 DDG für eigene Inhalte auf diesen Seiten
              nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 DDG sind wir als
              Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde
              Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige
              Tätigkeit hinweisen.
            </p>
            <p style={{ marginTop: '12px' }}>
              Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den
              allgemeinen Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung ist jedoch
              erst ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich. Bei
              Bekanntwerden von entsprechenden Rechtsverletzungen werden wir diese Inhalte umgehend
              entfernen.
            </p>
          </Section>

          <Section title="Haftung für Links">
            <p>
              Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen
              Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr
              übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter
              oder Betreiber der Seiten verantwortlich.
            </p>
            <p style={{ marginTop: '12px' }}>
              Die verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße
              überprüft. Rechtswidrige Inhalte waren zum Zeitpunkt der Verlinkung nicht erkennbar.
              Eine permanente inhaltliche Kontrolle der verlinkten Seiten ist jedoch ohne konkrete
              Anhaltspunkte einer Rechtsverletzung nicht zumutbar. Bei Bekanntwerden von
              Rechtsverletzungen werden wir derartige Links umgehend entfernen.
            </p>
          </Section>

          <Section title="Urheberrecht">
            <p>
              Die durch den Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten
              unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung
              und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der
              schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
            </p>
          </Section>

          <div
            style={{
              marginTop: '56px',
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
            Stand: Mai 2026 — Bayerisches Recht, Gerichtsstand Mainburg
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
