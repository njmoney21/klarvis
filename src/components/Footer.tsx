export default function Footer() {
  return (
    <footer className="border-t border-dark-200 bg-dark py-10">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-white/40">
        <span className="font-bold text-white/70 text-lg">
          Klarvis<span className="text-purple-600">.</span>
        </span>
        <div className="flex gap-6">
          <a href="/impressum" className="hover:text-white transition-colors">Impressum</a>
          <a href="/datenschutz" className="hover:text-white transition-colors">Datenschutz</a>
        </div>
        <span>© {new Date().getFullYear()} Klarvis</span>
      </div>
    </footer>
  )
}
