import Navbar from './components/Navbar'
import SectionHero from './components/SectionHero'
import SectionLeistungen from './components/SectionLeistungen'
import SectionProcess from './components/SectionProcess'
import SectionPortfolio from './components/SectionPortfolio'
import SectionPreise from './components/SectionPreise'
import SectionKontakt from './components/SectionKontakt'
import Footer from './components/Footer'

export default function App() {
  return (
    <>
      <Navbar />
      <SectionHero />
      <SectionLeistungen />
      <SectionProcess />
      <SectionPortfolio />
      <SectionPreise />
      <SectionKontakt />
      <Footer />
    </>
  )
}
