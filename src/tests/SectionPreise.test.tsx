import { render, screen } from '@testing-library/react'
import SectionPreise from '../components/SectionPreise'

test('shows website price', () => {
  render(<SectionPreise />)
  expect(screen.getByText(/499/)).toBeInTheDocument()
})

test('shows maintenance price', () => {
  render(<SectionPreise />)
  expect(screen.getByText(/37,99/)).toBeInTheDocument()
})

test('shows both tier names', () => {
  render(<SectionPreise />)
  expect(screen.getByText('Website')).toBeInTheDocument()
  expect(screen.getByText('Wartung & Support')).toBeInTheDocument()
})
