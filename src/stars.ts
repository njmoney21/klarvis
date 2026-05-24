import Lenis from 'lenis'

const lenis = new Lenis({
  duration: 1.2,
  easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
})

function raf(time: number) {
  lenis.raf(time)
  requestAnimationFrame(raf)
}
requestAnimationFrame(raf)

export { lenis }

// Star warp animation
;(function () {
  const container = document.getElementById('star-container')
  if (!container) return
  container.innerHTML = ''

  const count = 80
  const stars: Array<{ el: HTMLElement; initialY: number; speed: number }> = []

  for (let i = 0; i < count; i++) {
    const s = document.createElement('div')
    s.className = 'star'

    const x = Math.random() * 100
    const y = Math.random() * 100
    const isStatic = Math.random() < 0.3
    const z = isStatic ? 0 : 0.2 + Math.random() * 0.6
    const size = isStatic ? 1 + Math.random() : 1 + Math.random() * 2

    s.style.left = x + '%'
    s.style.top = y + '%'
    s.style.width = size + 'px'
    s.style.height = size + 'px'
    s.style.setProperty('--duration', (2 + Math.random() * 4) + 's')
    s.style.animationDelay = (Math.random() * 5) + 's'

    container.appendChild(s)
    stars.push({ el: s, initialY: y, speed: z })
  }

  lenis.on('scroll', ({ scroll, velocity }: { scroll: number; velocity: number }) => {
    const stretch = Math.max(1, Math.min(1 + Math.abs(velocity) * 0.15, 4))

    stars.forEach(star => {
      if (star.speed === 0) {
        star.el.style.transform = 'scaleY(1)'
        return
      }

      let pos = (star.initialY - (scroll * star.speed * 0.05)) % 100
      if (pos < 0) pos += 100

      star.el.style.top = pos + '%'
      star.el.style.transform = `scaleY(${stretch})`
    })
  })
})()
