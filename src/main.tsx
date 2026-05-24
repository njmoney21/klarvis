import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './underwater'
import './stars'
import App from './App'

// On touch devices, override the CSS pointer-events:none on #root via inline
// style — inline styles beat any stylesheet rule, ensuring touches reach the
// React tree instead of falling through to the canvas and blocking scroll.
if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
  const root = document.getElementById('root')
  if (root) root.style.pointerEvents = 'auto'
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
