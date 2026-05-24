import Lenis from 'lenis'

const lenis = new Lenis({
  duration: 1.2,
  easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
})

export { lenis }

// ── canvas star field ─────────────────────────────────────────────────────

interface Star {
  xFrac: number
  yFrac: number
  radius: number
  speed: number   // 0 = static
  phase: number
  twinkleRate: number
  baseAlpha: number
}

let W = window.innerWidth
let H = window.innerHeight
let scrollY = 0
let scrollVelocity = 0
let lastTime = 0
let ctx: CanvasRenderingContext2D | null = null
const stars: Star[] = []

const container = document.getElementById('star-container')
if (container) {
  const canvas = document.createElement('canvas')
  canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;'
  container.innerHTML = ''
  container.appendChild(canvas)

  canvas.width = W
  canvas.height = H
  ctx = canvas.getContext('2d', { alpha: true })!

  window.addEventListener('resize', () => {
    W = window.innerWidth
    H = window.innerHeight
    canvas.width = W
    canvas.height = H
  }, { passive: true })

  for (let i = 0; i < 80; i++) {
    const isStatic = Math.random() < 0.3
    stars.push({
      xFrac: Math.random(),
      yFrac: Math.random(),
      radius: isStatic ? 0.5 + Math.random() * 0.5 : 0.7 + Math.random() * 1.1,
      speed: isStatic ? 0 : 0.2 + Math.random() * 0.6,
      phase: Math.random() * Math.PI * 2,
      twinkleRate: 0.4 + Math.random() * 1.2,
      baseAlpha: 0.3 + Math.random() * 0.35,
    })
  }
}

lenis.on('scroll', (e: { scroll: number; velocity: number }) => {
  scrollY = e.scroll
  scrollVelocity = e.velocity
})

function drawStars(time: number) {
  if (!ctx) return
  const dt = Math.min((time - lastTime) / 1000, 0.05)
  lastTime = time

  ctx.clearRect(0, 0, W, H)
  ctx.fillStyle = 'white'

  const stretch = Math.max(1, Math.min(1 + Math.abs(scrollVelocity) * 0.15, 4))

  for (const star of stars) {
    star.phase += star.twinkleRate * dt

    let y: number
    if (star.speed === 0) {
      y = star.yFrac * H
    } else {
      const raw = star.yFrac * H - scrollY * star.speed * 0.05
      y = ((raw % H) + H) % H
    }

    ctx.globalAlpha = Math.max(0, Math.min(0.85, star.baseAlpha + Math.sin(star.phase) * 0.18))
    ctx.setTransform(1, 0, 0, star.speed > 0 ? stretch : 1, star.xFrac * W, y)
    ctx.beginPath()
    ctx.arc(0, 0, star.radius, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.globalAlpha = 1
}

// Single RAF drives both Lenis smooth scroll and the star canvas
function tick(time: number) {
  lenis.raf(time)
  drawStars(time)
  requestAnimationFrame(tick)
}
requestAnimationFrame(tick)
