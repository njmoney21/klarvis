import { useEffect, useRef, useState, useCallback } from 'react'
import * as THREE from 'three'

export default function CardScanner() {
  const particleCanvasRef = useRef<HTMLCanvasElement>(null)
  const scannerCanvasRef = useRef<HTMLCanvasElement>(null)
  const cardLineRef = useRef<HTMLDivElement>(null)
  const cardStreamRef = useRef<HTMLDivElement>(null)
  const speedValueRef = useRef<HTMLSpanElement>(null)
  const ctrlRef = useRef<any>(null)
  const [isPaused, setIsPaused] = useState(false)

  const handlePause = useCallback(() => {
    if (!ctrlRef.current) return
    ctrlRef.current.toggleAnimation()
    setIsPaused(p => !p)
  }, [])

  const handleReset = useCallback(() => {
    ctrlRef.current?.resetPosition()
    setIsPaused(false)
  }, [])

  const handleDirection = useCallback(() => {
    ctrlRef.current?.changeDirection()
  }, [])

  useEffect(() => {
    const particleCanvas = particleCanvasRef.current!
    const scannerCanvas = scannerCanvasRef.current!
    const cardLine = cardLineRef.current!
    const cardStream = cardStreamRef.current!
    const speedValue = speedValueRef.current!
    let destroyed = false
    let scannerInst: any = null

    // ── helpers ──────────────────────────────────────────
    function generateCode(w: number, h: number): string {
      const ri = (mn: number, mx: number) => Math.floor(Math.random() * (mx - mn + 1)) + mn
      const pick = (a: string[]) => a[ri(0, a.length - 1)]
      const lib = [
        '// compiled preview • scanner demo',
        'const SCAN_WIDTH = 8; const FADE_ZONE = 35; const MAX_PARTICLES = 2500;',
        'function clamp(n,a,b){return Math.max(a,Math.min(b,n));}',
        'function lerp(a,b,t){return a+(b-a)*t;}',
        'const now=()=>performance.now();',
        'class Particle{constructor(x,y,vx,vy,r,a){this.x=x;this.y=y;this.vx=vx;this.vy=vy;this.r=r;this.a=a;}step(dt){this.x+=this.vx*dt;this.y+=this.vy*dt;}}',
        'const scanner={x:Math.floor(window.innerWidth/2),width:SCAN_WIDTH,glow:3.5};',
        'function drawParticle(ctx,p){ctx.globalAlpha=clamp(p.a,0,1);ctx.drawImage(gradient,p.x-p.r,p.y-p.r,p.r*2,p.r*2);}',
        'function tick(t){const dt=0.016;}',
        'const state={intensity:1.2,particles:MAX_PARTICLES};',
        'const bounds={w:window.innerWidth,h:300};',
      ]
      for (let i = 0; i < 40; i++) lib.push(`const v${i}=(${ri(1,9)}+${ri(10,99)})*0.${ri(1,9)};`)
      for (let i = 0; i < 20; i++) lib.push(`if(state.intensity>${1+(i%3)}){scanner.glow+=0.01;}`)

      let flow = lib.join(' ').replace(/\s+/g, ' ').trim()
      const total = w * h
      while (flow.length < total + w) flow += ' ' + pick(lib).replace(/\s+/g, ' ').trim()

      let out = ''
      let off = 0
      for (let row = 0; row < h; row++) {
        let line = flow.slice(off, off + w)
        if (line.length < w) line += ' '.repeat(w - line.length)
        out += line + (row < h - 1 ? '\n' : '')
        off += w
      }
      return out
    }

    function calcCodeDims(cw: number, ch: number) {
      return { w: Math.floor(cw / 6), h: Math.floor(ch / 13) }
    }

    function createCardWrapper(idx: number): HTMLDivElement {
      const wrapper = document.createElement('div')
      wrapper.className = 'cs-card-wrapper'

      const normal = document.createElement('div')
      normal.className = 'cs-card cs-card-normal'

      const imgs = [
        'https://cdn.prod.website-files.com/68789c86c8bc802d61932544/689f20b55e654d1341fb06f8_4.1.png',
        'https://cdn.prod.website-files.com/68789c86c8bc802d61932544/689f20b5a080a31ee7154b19_1.png',
        'https://cdn.prod.website-files.com/68789c86c8bc802d61932544/689f20b5c1e4919fd69672b8_3.png',
        'https://cdn.prod.website-files.com/68789c86c8bc802d61932544/689f20b5f6a5e232e7beb4be_2.png',
        'https://cdn.prod.website-files.com/68789c86c8bc802d61932544/689f20b5bea2f1b07392d936_4.png',
      ]

      const img = document.createElement('img')
      img.className = 'cs-card-image'
      img.src = imgs[idx % imgs.length]
      img.alt = 'Card'
      img.onerror = () => {
        const fc = document.createElement('canvas')
        fc.width = 400; fc.height = 250
        const fctx = fc.getContext('2d')!
        const g = fctx.createLinearGradient(0, 0, 400, 250)
        g.addColorStop(0, '#667eea'); g.addColorStop(1, '#764ba2')
        fctx.fillStyle = g; fctx.fillRect(0, 0, 400, 250)
        img.src = fc.toDataURL()
      }
      normal.appendChild(img)

      const ascii = document.createElement('div')
      ascii.className = 'cs-card cs-card-ascii'
      const content = document.createElement('div')
      content.className = 'cs-ascii-content'
      const { w, h } = calcCodeDims(400, 250)
      content.textContent = generateCode(w, h)
      ascii.appendChild(content)

      wrapper.appendChild(normal)
      wrapper.appendChild(ascii)
      return wrapper
    }

    // ── CardStreamController ──────────────────────────────
    class CardStreamController {
      position = 0; velocity = 120; direction = -1
      isAnimating = true; isDragging = false
      lastTime = 0; lastMouseX = 0; mouseVelocity = 0
      friction = 0.95; minVelocity = 30
      containerWidth = 0; cardLineWidth = 0

      constructor() {
        this.populate(); this.calcDims()
        this.setupListeners(); this.updatePos()
        this.animate(); this.startUpdates()
      }

      populate() {
        cardLine.innerHTML = ''
        for (let i = 0; i < 30; i++) cardLine.appendChild(createCardWrapper(i))
      }

      calcDims() {
        this.containerWidth = cardStream.offsetWidth
        this.cardLineWidth = (400 + 60) * cardLine.children.length
      }

      setupListeners() {
        cardLine.addEventListener('mousedown', e => this.startDrag(e))
        document.addEventListener('mousemove', e => this.onDrag(e))
        document.addEventListener('mouseup', () => this.endDrag())
        cardLine.addEventListener('touchstart', (e: TouchEvent) => { e.preventDefault(); this.startDrag(e.touches[0] as any) }, { passive: false })
        document.addEventListener('touchmove', (e: TouchEvent) => {
          if (this.isDragging) { e.preventDefault(); this.onDrag(e.touches[0] as any) }
        }, { passive: false })
        document.addEventListener('touchend', () => this.endDrag())
        cardLine.addEventListener('wheel', (e: WheelEvent) => {
          e.preventDefault()
          this.position += e.deltaY > 0 ? 20 : -20
          this.updatePos()
        }, { passive: false })
        cardLine.addEventListener('selectstart', (e: Event) => e.preventDefault())
        window.addEventListener('resize', () => this.calcDims())
      }

      startDrag(e: any) {
        this.isDragging = true; this.isAnimating = false
        this.lastMouseX = e.clientX; this.mouseVelocity = 0
        const t = window.getComputedStyle(cardLine).transform
        if (t !== 'none') this.position = new DOMMatrix(t).m41
        cardLine.classList.add('cs-dragging')
        document.body.style.userSelect = 'none'
        document.body.style.cursor = 'grabbing'
      }

      onDrag(e: any) {
        if (!this.isDragging) return
        const dx = e.clientX - this.lastMouseX
        this.position += dx; this.mouseVelocity = dx * 60; this.lastMouseX = e.clientX
        cardLine.style.transform = `translateX(${this.position}px)`
        this.updateClipping()
      }

      endDrag() {
        if (!this.isDragging) return
        this.isDragging = false; cardLine.classList.remove('cs-dragging')
        if (Math.abs(this.mouseVelocity) > this.minVelocity) {
          this.velocity = Math.abs(this.mouseVelocity)
          this.direction = this.mouseVelocity > 0 ? 1 : -1
        } else { this.velocity = 120 }
        this.isAnimating = true; this.updateSpeed()
        document.body.style.userSelect = ''; document.body.style.cursor = ''
      }

      animate() {
        if (destroyed) return
        const now = performance.now()
        const dt = (now - this.lastTime) / 1000
        this.lastTime = now
        if (this.isAnimating && !this.isDragging) {
          this.velocity = this.velocity > this.minVelocity ? this.velocity * this.friction : Math.max(this.minVelocity, this.velocity)
          this.position += this.velocity * this.direction * dt
          this.updatePos(); this.updateSpeed()
        }
        requestAnimationFrame(() => this.animate())
      }

      updatePos() {
        if (this.position < -this.cardLineWidth) this.position = this.containerWidth
        else if (this.position > this.containerWidth) this.position = -this.cardLineWidth
        cardLine.style.transform = `translateX(${this.position}px)`
        this.updateClipping()
      }

      updateSpeed() {
        if (speedValue) speedValue.textContent = String(Math.round(this.velocity))
      }

      updateClipping() {
        const sx = window.innerWidth / 2
        const sl = sx - 4; const sr = sx + 4
        let anyScanning = false

        cardLine.querySelectorAll<HTMLElement>('.cs-card-wrapper').forEach(wrapper => {
          const rect = wrapper.getBoundingClientRect()
          const norm = wrapper.querySelector<HTMLElement>('.cs-card-normal')!
          const asc = wrapper.querySelector<HTMLElement>('.cs-card-ascii')!
          if (rect.left < sr && rect.right > sl) {
            anyScanning = true
            const intL = Math.max(sl - rect.left, 0)
            const intR = Math.min(sr - rect.left, rect.width)
            norm.style.setProperty('--clip-right', `${(intL / rect.width) * 100}%`)
            asc.style.setProperty('--clip-left', `${(intR / rect.width) * 100}%`)
            if (!wrapper.dataset.scanned && intL > 0) {
              wrapper.dataset.scanned = 'true'
              const fx = document.createElement('div')
              fx.className = 'cs-scan-effect'
              wrapper.appendChild(fx)
              setTimeout(() => fx.parentNode?.removeChild(fx), 600)
            }
          } else {
            const past = rect.right < sl
            norm.style.setProperty('--clip-right', past ? '100%' : '0%')
            asc.style.setProperty('--clip-left', past ? '100%' : '0%')
            delete wrapper.dataset.scanned
          }
        })
        ;(window as any).setScannerScanning?.(anyScanning)
      }

      updateAscii() {
        cardLine.querySelectorAll<HTMLElement>('.cs-ascii-content').forEach(el => {
          if (Math.random() < 0.15) {
            const { w, h } = calcCodeDims(400, 250)
            el.textContent = generateCode(w, h)
          }
        })
      }

      toggleAnimation() { this.isAnimating = !this.isAnimating }
      resetPosition() {
        this.position = this.containerWidth; this.velocity = 120
        this.direction = -1; this.isAnimating = true; this.isDragging = false
        cardLine.style.transform = `translateX(${this.position}px)`
        this.updateSpeed()
      }
      changeDirection() { this.direction *= -1 }

      startUpdates() {
        setInterval(() => { if (!destroyed) this.updateAscii() }, 200)
        const loop = () => { if (!destroyed) { this.updateClipping(); requestAnimationFrame(loop) } }
        loop()
      }
    }

    // ── Three.js particle strip ───────────────────────────
    class ParticleSystem {
      scene: THREE.Scene
      camera: THREE.OrthographicCamera
      renderer: THREE.WebGLRenderer
      pts: THREE.Points | null = null
      velocities = new Float32Array(400)
      count = 400

      constructor() {
        this.scene = new THREE.Scene()
        this.camera = new THREE.OrthographicCamera(-window.innerWidth / 2, window.innerWidth / 2, 125, -125, 1, 1000)
        this.camera.position.z = 100
        this.renderer = new THREE.WebGLRenderer({ canvas: particleCanvas, alpha: true, antialias: true })
        this.renderer.setSize(window.innerWidth, 250)
        this.renderer.setClearColor(0x000000, 0)
        this.buildParticles()
        this.animate()
        window.addEventListener('resize', () => this.onResize())
      }

      buildParticles() {
        const geo = new THREE.BufferGeometry()
        const pos = new Float32Array(this.count * 3)
        const cols = new Float32Array(this.count * 3)
        const alphas = new Float32Array(this.count)
        const sizes = new Float32Array(this.count)

        const tc = document.createElement('canvas')
        tc.width = 100; tc.height = 100
        const tctx = tc.getContext('2d')!
        const grd = tctx.createRadialGradient(50, 50, 0, 50, 50, 50)
        grd.addColorStop(0.025, '#fff')
        grd.addColorStop(0.1, 'hsl(217,61%,33%)')
        grd.addColorStop(0.25, 'hsl(217,64%,6%)')
        grd.addColorStop(1, 'transparent')
        tctx.fillStyle = grd; tctx.beginPath(); tctx.arc(50, 50, 50, 0, Math.PI * 2); tctx.fill()
        const tex = new THREE.CanvasTexture(tc)

        for (let i = 0; i < this.count; i++) {
          pos[i * 3] = (Math.random() - 0.5) * window.innerWidth * 2
          pos[i * 3 + 1] = (Math.random() - 0.5) * 250
          pos[i * 3 + 2] = 0
          cols[i * 3] = cols[i * 3 + 1] = cols[i * 3 + 2] = 1
          const r = Math.random() * 200 + 100
          sizes[i] = (Math.random() * (r - 60) + 60) / 8
          this.velocities[i] = Math.random() * 60 + 30
          alphas[i] = (Math.random() * 8 + 2) / 10
        }

        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
        geo.setAttribute('color', new THREE.BufferAttribute(cols, 3))
        geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1))
        geo.setAttribute('alpha', new THREE.BufferAttribute(alphas, 1))

        const mat = new THREE.ShaderMaterial({
          uniforms: { pointTexture: { value: tex }, size: { value: 15 } },
          vertexShader: `
            attribute float alpha; varying float vAlpha; varying vec3 vColor; uniform float size;
            void main() {
              vAlpha = alpha; vColor = color;
              gl_PointSize = size;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }`,
          fragmentShader: `
            uniform sampler2D pointTexture; varying float vAlpha; varying vec3 vColor;
            void main() { gl_FragColor = vec4(vColor, vAlpha) * texture2D(pointTexture, gl_PointCoord); }`,
          transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, vertexColors: true,
        })
        this.pts = new THREE.Points(geo, mat)
        this.scene.add(this.pts)
      }

      animate() {
        if (destroyed) return
        requestAnimationFrame(() => this.animate())
        if (!this.pts) return
        const pos = this.pts.geometry.attributes.position.array as Float32Array
        const alphas = this.pts.geometry.attributes.alpha.array as Float32Array
        const t = Date.now() * 0.001
        for (let i = 0; i < this.count; i++) {
          pos[i * 3] += this.velocities[i] * 0.016
          if (pos[i * 3] > window.innerWidth / 2 + 100) {
            pos[i * 3] = -window.innerWidth / 2 - 100
            pos[i * 3 + 1] = (Math.random() - 0.5) * 250
          }
          pos[i * 3 + 1] += Math.sin(t + i * 0.1) * 0.5
          const tw = Math.floor(Math.random() * 10)
          if (tw === 1 && alphas[i] > 0) alphas[i] -= 0.05
          else if (tw === 2 && alphas[i] < 1) alphas[i] += 0.05
          alphas[i] = Math.max(0, Math.min(1, alphas[i]))
        }
        this.pts.geometry.attributes.position.needsUpdate = true
        this.pts.geometry.attributes.alpha.needsUpdate = true
        this.renderer.render(this.scene, this.camera)
      }

      onResize() {
        this.camera.left = -window.innerWidth / 2; this.camera.right = window.innerWidth / 2
        this.camera.updateProjectionMatrix()
        this.renderer.setSize(window.innerWidth, 250)
      }

      destroy() {
        this.renderer.dispose()
        if (this.pts) { this.scene.remove(this.pts); this.pts.geometry.dispose(); (this.pts.material as THREE.Material).dispose() }
      }
    }

    // ── 2-D scanner canvas ────────────────────────────────
    class ParticleScanner {
      ctx: CanvasRenderingContext2D
      w = window.innerWidth; h = 300
      particles: any[] = []; count = 0
      maxParticles = 800; intensity = 0.8
      lightBarX = window.innerWidth / 2; lightBarWidth = 3
      fadeZone = 60
      scanTargetIntensity = 1.8; scanTargetParticles = 2500; scanTargetFadeZone = 35
      scanningActive = false
      baseIntensity = 0.8; baseMaxParticles = 800; baseFadeZone = 60
      currentIntensity = 0.8; currentMaxParticles = 800; currentFadeZone = 60
      currentGlowIntensity = 1; transitionSpeed = 0.05
      gradCanvas!: HTMLCanvasElement; gradCtx!: CanvasRenderingContext2D

      constructor() {
        this.ctx = scannerCanvas.getContext('2d')!
        this.setupCanvas(); this.buildGradCache(); this.initParticles(); this.animate()
        window.addEventListener('resize', () => this.onResize())
      }

      setupCanvas() {
        scannerCanvas.width = this.w; scannerCanvas.height = this.h
        scannerCanvas.style.width = this.w + 'px'; scannerCanvas.style.height = this.h + 'px'
      }

      onResize() { this.w = window.innerWidth; this.lightBarX = this.w / 2; this.setupCanvas() }

      buildGradCache() {
        this.gradCanvas = document.createElement('canvas')
        this.gradCanvas.width = 16; this.gradCanvas.height = 16
        this.gradCtx = this.gradCanvas.getContext('2d')!
        const g = this.gradCtx.createRadialGradient(8, 8, 0, 8, 8, 8)
        g.addColorStop(0, 'rgba(255,255,255,1)')
        g.addColorStop(0.3, 'rgba(136,255,255,0.8)')
        g.addColorStop(0.7, 'rgba(0,255,255,0.4)')
        g.addColorStop(1, 'transparent')
        this.gradCtx.fillStyle = g
        this.gradCtx.beginPath(); this.gradCtx.arc(8, 8, 8, 0, Math.PI * 2); this.gradCtx.fill()
      }

      rf(mn: number, mx: number) { return Math.random() * (mx - mn) + mn }

      newParticle() {
        const ir = this.intensity / this.baseIntensity; const sm = 1 + (ir - 1) * 1.2
        const p = {
          x: this.lightBarX + this.rf(-this.lightBarWidth / 2, this.lightBarWidth / 2),
          y: this.rf(0, this.h), vx: this.rf(0.2, 1.0) * sm, vy: this.rf(-0.15, 0.15) * sm,
          radius: this.rf(0.4, 1) * (1 + (ir - 1) * 0.7),
          alpha: this.rf(0.6, 1), decay: this.rf(0.005, 0.025) * (2 - ir * 0.5),
          originalAlpha: 0, life: 1.0, time: 0,
          twinkleSpeed: this.rf(0.02, 0.08) * sm, twinkleAmount: this.rf(0.1, 0.25),
        }
        p.originalAlpha = p.alpha; return p
      }

      initParticles() {
        for (let i = 0; i < this.maxParticles; i++) { this.count++; this.particles[this.count] = this.newParticle() }
      }

      updateP(p: any) {
        p.x += p.vx; p.y += p.vy; p.time++
        p.alpha = p.originalAlpha * p.life + Math.sin(p.time * p.twinkleSpeed) * p.twinkleAmount
        p.life -= p.decay
        if (p.x > this.w + 10 || p.life <= 0) {
          p.x = this.lightBarX + this.rf(-this.lightBarWidth / 2, this.lightBarWidth / 2)
          p.y = this.rf(0, this.h); p.vx = this.rf(0.2, 1.0); p.vy = this.rf(-0.15, 0.15)
          p.alpha = this.rf(0.6, 1); p.originalAlpha = p.alpha; p.life = 1.0; p.time = 0
        }
      }

      drawP(p: any) {
        if (p.life <= 0) return
        let fade = 1
        if (p.y < this.fadeZone) fade = p.y / this.fadeZone
        else if (p.y > this.h - this.fadeZone) fade = (this.h - p.y) / this.fadeZone
        this.ctx.globalAlpha = p.alpha * Math.max(0, Math.min(1, fade))
        this.ctx.drawImage(this.gradCanvas, p.x - p.radius, p.y - p.radius, p.radius * 2, p.radius * 2)
      }

      drawBar() {
        const vg = this.ctx.createLinearGradient(0, 0, 0, this.h)
        vg.addColorStop(0, 'rgba(255,255,255,0)')
        vg.addColorStop(this.fadeZone / this.h, 'rgba(255,255,255,1)')
        vg.addColorStop(1 - this.fadeZone / this.h, 'rgba(255,255,255,1)')
        vg.addColorStop(1, 'rgba(255,255,255,0)')

        this.ctx.globalCompositeOperation = 'lighter'
        this.currentGlowIntensity += ((this.scanningActive ? 3.5 : 1) - this.currentGlowIntensity) * this.transitionSpeed
        const gi = this.currentGlowIntensity; const lx = this.lightBarX; const lw = this.lightBarWidth

        const cg = this.ctx.createLinearGradient(lx - lw / 2, 0, lx + lw / 2, 0)
        cg.addColorStop(0, 'rgba(255,255,255,0)'); cg.addColorStop(0.5, `rgba(255,255,255,${Math.min(1, gi)})`); cg.addColorStop(1, 'rgba(255,255,255,0)')
        this.ctx.globalAlpha = 1; this.ctx.fillStyle = cg
        this.ctx.beginPath(); this.ctx.roundRect(lx - lw / 2, 0, lw, this.h, 15); this.ctx.fill()

        const g1 = this.ctx.createLinearGradient(lx - lw * 2, 0, lx + lw * 2, 0)
        g1.addColorStop(0, 'rgba(0,255,255,0)'); g1.addColorStop(0.5, `rgba(136,255,255,${Math.min(1, 0.8 * gi)})`); g1.addColorStop(1, 'rgba(0,255,255,0)')
        this.ctx.globalAlpha = this.scanningActive ? 1 : 0.8; this.ctx.fillStyle = g1
        this.ctx.beginPath(); this.ctx.roundRect(lx - lw * 2, 0, lw * 4, this.h, 25); this.ctx.fill()

        const g2 = this.ctx.createLinearGradient(lx - lw * 4, 0, lx + lw * 4, 0)
        g2.addColorStop(0, 'rgba(0,255,255,0)'); g2.addColorStop(0.5, `rgba(0,255,255,${Math.min(1, 0.4 * gi)})`); g2.addColorStop(1, 'rgba(0,255,255,0)')
        this.ctx.globalAlpha = this.scanningActive ? 0.8 : 0.6; this.ctx.fillStyle = g2
        this.ctx.beginPath(); this.ctx.roundRect(lx - lw * 4, 0, lw * 8, this.h, 35); this.ctx.fill()

        if (this.scanningActive) {
          const g3 = this.ctx.createLinearGradient(lx - lw * 8, 0, lx + lw * 8, 0)
          g3.addColorStop(0, 'rgba(0,255,255,0)'); g3.addColorStop(0.5, 'rgba(0,255,255,0.2)'); g3.addColorStop(1, 'rgba(0,255,255,0)')
          this.ctx.globalAlpha = 0.6; this.ctx.fillStyle = g3
          this.ctx.beginPath(); this.ctx.roundRect(lx - lw * 8, 0, lw * 16, this.h, 45); this.ctx.fill()
        }

        this.ctx.globalCompositeOperation = 'destination-in'
        this.ctx.globalAlpha = 1; this.ctx.fillStyle = vg; this.ctx.fillRect(0, 0, this.w, this.h)
      }

      render() {
        const ti = this.scanningActive ? this.scanTargetIntensity : this.baseIntensity
        const tm = this.scanningActive ? this.scanTargetParticles : this.baseMaxParticles
        const tf = this.scanningActive ? this.scanTargetFadeZone : this.baseFadeZone
        this.currentIntensity += (ti - this.currentIntensity) * this.transitionSpeed
        this.currentMaxParticles += (tm - this.currentMaxParticles) * this.transitionSpeed
        this.currentFadeZone += (tf - this.currentFadeZone) * this.transitionSpeed
        this.intensity = this.currentIntensity
        this.maxParticles = Math.floor(this.currentMaxParticles)
        this.fadeZone = this.currentFadeZone

        this.ctx.globalCompositeOperation = 'source-over'
        this.ctx.clearRect(0, 0, this.w, this.h)
        this.drawBar()
        this.ctx.globalCompositeOperation = 'lighter'
        for (let i = 1; i <= this.count; i++) { if (this.particles[i]) { this.updateP(this.particles[i]); this.drawP(this.particles[i]) } }

        const ir = this.intensity / this.baseIntensity
        if (Math.random() < this.intensity && this.count < this.maxParticles) { this.count++; this.particles[this.count] = this.newParticle() }
        if (ir > 1.1 && Math.random() < (ir - 1.0) * 1.2) { this.count++; this.particles[this.count] = this.newParticle() }
        if (ir > 1.3 && Math.random() < (ir - 1.3) * 1.4) { this.count++; this.particles[this.count] = this.newParticle() }
        if (ir > 1.5 && Math.random() < (ir - 1.5) * 1.8) { this.count++; this.particles[this.count] = this.newParticle() }
        if (ir > 2.0 && Math.random() < (ir - 2.0) * 2.0) { this.count++; this.particles[this.count] = this.newParticle() }
        if (this.count > this.maxParticles + 200) {
          const ex = Math.min(15, this.count - this.maxParticles)
          for (let i = 0; i < ex; i++) delete this.particles[this.count - i]
          this.count -= ex
        }
      }

      animate() { if (destroyed) return; this.render(); requestAnimationFrame(() => this.animate()) }
      setScanningActive(v: boolean) { this.scanningActive = v }
      destroy() { this.particles = []; this.count = 0 }
    }

    // ── init ─────────────────────────────────────────────
    const ctrl = new CardStreamController()
    ctrlRef.current = ctrl
    const ps = new ParticleSystem()
    scannerInst = new ParticleScanner()
    ;(window as any).setScannerScanning = (v: boolean) => scannerInst?.setScanningActive(v)

    return () => {
      destroyed = true
      delete (window as any).setScannerScanning
      ps.destroy()
      scannerInst?.destroy()
    }
  }, [])

  return (
    <div className="cs-wrap">
      <div className="cs-container">
        <canvas ref={particleCanvasRef} className="cs-particle-canvas" />
        <canvas ref={scannerCanvasRef} className="cs-scanner-canvas" />
        <div className="cs-card-stream" ref={cardStreamRef}>
          <div className="cs-card-line" ref={cardLineRef} />
        </div>
      </div>
    </div>
  )
}
