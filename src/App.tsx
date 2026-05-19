import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import SectionHero from './components/SectionHero'
import SectionLeistungen from './components/SectionLeistungen'
import SectionAbout from './components/SectionAbout'
import SectionGallery from './components/SectionGallery'
import SectionPreise from './components/SectionPreise'
import SectionKontakt from './components/SectionKontakt'
import Footer from './components/Footer'
import LegalModal from './components/LegalModal'
import SteuerhelferApp from './pages/SteuerhelferApp'
import { AuthProvider } from './lib/auth'
import AuthGuard from './components/steuerhelfer/AuthGuard'

type LegalType = 'impressum' | 'datenschutz'

function RunlySite() {
  const [legal, setLegal] = useState<LegalType | null>(null)

  return (
    <>
      <Navbar />
      <SectionHero />
      <SectionLeistungen />
      <SectionAbout />
      <SectionGallery />
      <SectionPreise />
      <SectionKontakt />
      <Footer onLegal={setLegal} />
      {legal && <LegalModal type={legal} onClose={() => setLegal(null)} />}
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/app" element={
          <AuthProvider>
            <AuthGuard>
              <SteuerhelferApp />
            </AuthGuard>
          </AuthProvider>
        } />
        <Route path="/*" element={<RunlySite />} />
      </Routes>
    </BrowserRouter>
  )
}
