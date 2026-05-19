import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import SectionHero from './components/SectionHero'
import SectionLeistungen from './components/SectionLeistungen'
import SectionGallery from './components/SectionGallery'
import SectionPreise from './components/SectionPreise'
import SectionKontakt from './components/SectionKontakt'
import Footer from './components/Footer'
import SteuerhelferApp from './pages/SteuerhelferApp'
import { AuthProvider } from './lib/auth'
import AuthGuard from './components/steuerhelfer/AuthGuard'

function RunlySite() {
  return (
    <>
      <Navbar />
      <SectionHero />
      <SectionLeistungen />
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
