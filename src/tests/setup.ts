import '@testing-library/jest-dom'

// Mock IntersectionObserver for framer-motion viewport animations
;(globalThis as unknown as Record<string, unknown>).IntersectionObserver = class IntersectionObserver {
  root = null
  rootMargin = ''
  thresholds = []
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() { return [] }
}
