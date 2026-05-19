import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import SectionHero from './components/SectionHero'
import SectionLeistungen from './components/SectionLeistungen'
import SectionAbout from './components/SectionAbout'
import SectionGallery from './components/SectionGallery'
import SectionPreise from './components/SectionPreise'
import SectionKontakt from './components/SectionKontakt'
import Footer from './components/Footer'
import SteuerhelferApp from './pages/SteuerhelferApp'
import Impressum from './pages/Impressum'
import Datenschutz from './pages/Datenschutz'
import { AuthProvider } from './lib/auth'
import AuthGuard from './components/steuerhelfer/AuthGuard'

function RunlySite() {
  return (
    <>
      <Navbar />
      <SectionHero />
      <SectionLeistungen />
      <SectionAbout />
      <SectionGallery />
      <SectionPreise />
      <SectionKontakt />
      <Footer />
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/impressum" element={<Impressum />} />
        <Route path="/datenschutz" element={<Datenschutz />} />
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
