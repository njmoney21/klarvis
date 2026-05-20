import { vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import SectionPreise from '../components/SectionPreise'

vi.mock('../components/CardScanner', () => ({ default: () => null }))

test('shows website price', () => {
  render(<SectionPreise />)
  expect(screen.getByText(/499/)).toBeInTheDocument()
})

test('shows maintenance price', () => {
  render(<SectionPreise />)
  expect(screen.getAllByText(/€49/).length).toBeGreaterThan(0)
})

test('shows both tier names', () => {
  render(<SectionPreise />)
  expect(screen.getAllByText(/Website/).length).toBeGreaterThan(0)
  expect(screen.getAllByText(/Wartung/).length).toBeGreaterThan(0)
})
