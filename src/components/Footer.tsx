type LegalType = 'impressum' | 'datenschutz'

interface Props {
  onLegal: (type: LegalType) => void
}

export default function Footer({ onLegal }: Props) {
  return (
    <footer className="flex flex-col md:flex-row items-center justify-between gap-4 px-8 py-7">
      <span className="font-black" style={{ fontSize: '15px', color: 'rgba(255,255,255,0.6)' }}>
        Runly<span style={{ color: '#00ffff' }}>.</span>
      </span>
      <div className="flex gap-5">
        <button
          onClick={() => onLegal('impressum')}
          className="transition-opacity hover:opacity-70"
          style={{ fontSize: '12px', color: 'rgba(255,255,255,0.28)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          Impressum
        </button>
        <button
          onClick={() => onLegal('datenschutz')}
          className="transition-opacity hover:opacity-70"
          style={{ fontSize: '12px', color: 'rgba(255,255,255,0.28)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          Datenschutz
        </button>
      </div>
      <span className="font-mono" style={{ fontSize: '12px', color: 'rgba(255,255,255,0.2)' }}>
        © {new Date().getFullYear()} Runly
      </span>
    </footer>
  )
}
