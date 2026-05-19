export default function Footer() {
  return (
    <footer className="flex flex-col md:flex-row items-center justify-between gap-4 px-8 py-7">
      <span className="font-black" style={{ fontSize: '15px', color: 'rgba(255,255,255,0.6)' }}>
        Runly<span style={{ color: '#00ffff' }}>.</span>
      </span>
      <div className="flex gap-5">
        <a
          href="/impressum"
          className="transition-opacity hover:opacity-70"
          style={{ fontSize: '12px', color: 'rgba(255,255,255,0.28)' }}
        >
          Impressum
        </a>
        <a
          href="/datenschutz"
          className="transition-opacity hover:opacity-70"
          style={{ fontSize: '12px', color: 'rgba(255,255,255,0.28)' }}
        >
          Datenschutz
        </a>
      </div>
      <span className="font-mono" style={{ fontSize: '12px', color: 'rgba(255,255,255,0.2)' }}>
        © {new Date().getFullYear()} Runly
      </span>
    </footer>
  )
}
