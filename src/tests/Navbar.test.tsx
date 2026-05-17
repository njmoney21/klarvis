import { render, screen } from '@testing-library/react'
import Navbar from '../components/Navbar'

test('renders logo text', () => {
  render(<Navbar />)
  expect(screen.getByText('Klarvis')).toBeInTheDocument()
})

test('renders all nav links', () => {
  render(<Navbar />)
  expect(screen.getByText('Leistungen')).toBeInTheDocument()
  expect(screen.getByText('Gallery')).toBeInTheDocument()
  expect(screen.getByText('Preise')).toBeInTheDocument()
  expect(screen.getByText('Kontakt')).toBeInTheDocument()
})

test('renders CTA link', () => {
  render(<Navbar />)
  const cta = screen.getAllByText('Anfragen')
  expect(cta.length).toBeGreaterThan(0)
})
