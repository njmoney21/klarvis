import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js'

const noise = `
  vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
  float snoise(vec2 v){
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
             -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy) );
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod(i, 289.0);
    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
    + i.x + vec3(0.0, i1.x, 1.0 ));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
      dot(x12.zw,x12.zw)), 0.0);
    m = m*m ;
    m = m*m ;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }
`

const gu = { time: { value: 0 } }

const ToQuads = (g: THREE.BufferGeometry) => {
  const p = (g as any).parameters
  const segmentsX =
    (g.type === 'TorusGeometry' ? p.tubularSegments : p.radialSegments) ||
    p.widthSegments ||
    p.thetaSegments ||
    (p.points && p.points.length - 1) ||
    1
  const segmentsY =
    (g.type === 'TorusGeometry' ? p.radialSegments : p.tubularSegments) ||
    p.heightSegments ||
    p.phiSegments ||
    p.segments ||
    1
  const indices: number[] = []
  for (let i = 0; i < segmentsY + 1; i++) {
    let index11 = 0, index12 = 0
    for (let j = 0; j < segmentsX; j++) {
      index11 = (segmentsX + 1) * i + j
      index12 = index11 + 1
      const index21 = index11
      const index22 = index11 + (segmentsX + 1)
      indices.push(index11, index12)
      if (index22 < (segmentsX + 1) * (segmentsY + 1) - 1) indices.push(index21, index22)
    }
    if (index12 + segmentsX + 1 <= (segmentsX + 1) * (segmentsY + 1) - 1)
      indices.push(index12, index12 + segmentsX + 1)
  }
  g.setIndex(indices)
}

class SeaBed extends THREE.LineSegments {
  constructor() {
    const g = new THREE.PlaneGeometry(100, 100, 120, 120)
      .rotateX(-Math.PI * 0.5)
      .rotateY(Math.PI * 0.25)
    ToQuads(g)
    const m = new THREE.MeshBasicMaterial({ color: '#048' })
    m.onBeforeCompile = (shader) => {
      shader.uniforms.time = gu.time
      shader.vertexShader = `
        uniform float time;
        varying float vN;
        varying vec3 vPos;
        ${noise}
        ${shader.vertexShader}
      `.replace(
        `#include <begin_vertex>`,
        `#include <begin_vertex>
        float t = time;
        float posX = position.x - mod(t, 2. * sqrt(2.));
        transformed.x = posX;
        float xShift = posX + t;
        float n = snoise(vec2(xShift, position.z) * 0.1);
        vN = n;
        transformed.y = n * 1.;
        vPos = transformed;
      `
      )
      shader.fragmentShader = `
        varying float vN;
        varying vec3 vPos;
        ${shader.fragmentShader}
      `.replace(
        `vec4 diffuseColor = vec4( diffuse, opacity );`,
        `
        vec3 col = mix(diffuse, vec3(0, 0.75, 1), 1. - smoothstep(-0.5, 0., vN));
        col += vec3(0, 0.2, 0.1) * (1. - smoothstep(10., 15., length(vPos)));
        vec4 diffuseColor = vec4( col, opacity );
      `
      )
    }
    super(g, m)
    this.position.y = -5
  }
}

class Background extends THREE.Mesh {
  constructor(scene: THREE.Scene) {
    const g = new THREE.SphereGeometry(300)
    const m = new THREE.MeshBasicMaterial({
      side: THREE.BackSide,
      fog: false,
      color: 'white',
      map: (() => {
        const c = document.createElement('canvas')
        c.width = 1
        c.height = 1024
        const ctx = c.getContext('2d')!
        const grd = ctx.createLinearGradient(0, 0, 0, c.height)
        grd.addColorStop(0.1, '#044')
        grd.addColorStop(0.4, '#' + (scene.background as THREE.Color).getHexString())
        ctx.fillStyle = grd
        ctx.fillRect(0, 0, c.width, c.height)
        const tex = new THREE.CanvasTexture(c)
        tex.colorSpace = 'srgb'
        tex.anisotropy = 16
        return tex
      })(),
    })
    super(g, m)
  }
}

class WaterStuff extends THREE.Group {
  items: THREE.Mesh[]
  constructor() {
    super()
    this.items = Array.from({ length: 30 }, () => {
      const item = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.25, 2, 3, 7, 3),
        new THREE.MeshBasicMaterial({ wireframe: true, color: '#068' })
      )
      this.setRandom(item, 50 - Math.random() * 100)
      this.add(item)
      return item
    })
  }
  setRandom(o: THREE.Mesh, x: number) {
    const a = Math.PI * Math.random()
    const r = 5 + Math.random() * 10
    o.position.set(x, Math.sin(a) * r, Math.cos(a) * r)
    o.rotation.setFromVector3(new THREE.Vector3().random().multiplyScalar(Math.PI * 2))
    o.scale.y = 1 + (Math.random() - 0.5) * 1.5
  }
  update(dt: number) {
    const lim = 50
    this.items.forEach((item) => {
      let iPos = item.position.x - dt
      item.position.x = iPos
      if (iPos < -lim) {
        iPos = (iPos + lim) % 100
        this.setRandom(item, lim + iPos)
      }
    })
  }
}

class Thing extends THREE.Group {
  constructor() {
    super()
    const gBase = new THREE.SphereGeometry(3, 64, 32)
    const gLines = new THREE.EdgesGeometry(gBase, 0.5)
    const mLines = new THREE.LineBasicMaterial({ color: '#8ff', transparent: true, opacity: 0.75 })
    const lines = new THREE.LineSegments(gLines, mLines)
    this.add(lines)
    const gPoints = mergeVertices(
      gBase.clone().deleteAttribute('uv').deleteAttribute('normal')
    )
    const mPoints = new THREE.PointsMaterial({ color: '#0ff', size: 0.1, transparent: true })
    const points = new THREE.Points(gPoints, mPoints)
    this.add(points)
    ;[mLines, mPoints].forEach((m) => {
      m.onBeforeCompile = (shader) => {
        shader.uniforms.time = gu.time
        shader.vertexShader = `
          uniform float time;
          varying vec3 vPos;
          mat2 rot(float a){return mat2(cos(a), sin(a), -sin(a), cos(a));}
          ${shader.vertexShader}
        `.replace(
          `#include <begin_vertex>`,
          `#include <begin_vertex>
          vec3 pos = position;
          vPos = pos;
          pos.y *= 0.05;
          float a = atan(pos.z, pos.x);
          float s = cos(a * 4.);
          float r = s * 0.125 + 0.875;
          pos.xz *= r;
          pos.x -= (smoothstep(0., 3., pos.x)) * 0.75;
          float syncWave = sin(time * 1.25 + pos.x);
          float zSwaying = smoothstep(0.25, 2., abs(pos.z));
          mat2 zRot = rot(PI * 0.1 * zSwaying * syncWave * sign(pos.z));
          pos.yz *= zRot;
          pos.y += syncWave * 0.5 * ((1. - smoothstep(-3., 3., position.x)) * 0.5 + 0.5);
          transformed = pos;
        `
        )
        if (m.type === 'PointsMaterial') {
          shader.fragmentShader = `
            varying vec3 vPos;
            ${shader.fragmentShader}
          `.replace(
            `vec4 diffuseColor = vec4( diffuse, opacity );`,
            `
            vec2 uv = gl_PointCoord - 0.5;
            float pl = length(uv);
            float fw = length(fwidth(uv));
            float f = 1. - smoothstep(0.5 - fw, 0.5, pl);
            if (pl > 0.5) discard;
            vec3 bodyColor = mix(vec3(1), diffuse, smoothstep(2., 1., vPos.x));
            vec3 col = mix(bodyColor, diffuse, smoothstep(0.5, 1.0, abs(vPos.z)));
            vec4 diffuseColor = vec4( col, opacity * f );
          `
          )
        }
      }
    })
    const proxy = new THREE.Mesh(
      new THREE.SphereGeometry(3.5),
      new THREE.MeshBasicMaterial({ visible: false })
    )
    proxy.userData.hitProxy = true
    this.add(proxy)
    this.position.y = 1
  }
}

const scene = new THREE.Scene()
scene.background = new THREE.Color('#024')
scene.fog = new THREE.Fog(scene.background as THREE.Color, 8, 30)

const camera = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 0.1, 500)
camera.position.set(0.5, 0.25, -1).setLength(7.25)

const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' })
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5))
renderer.setSize(innerWidth, innerHeight)
document.getElementById('underwater-container')!.appendChild(renderer.domElement)

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(innerWidth, innerHeight, false)
})

const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true
controls.enablePan = false
controls.enableZoom = false
controls.rotateSpeed = 0.6
controls.dampingFactor = 0.08

const background = new Background(scene)
scene.add(background)
const thing = new Thing()
scene.add(thing)
const seaBed = new SeaBed()
scene.add(seaBed)
const waterStuff = new WaterStuff()
scene.add(waterStuff)

const clock = new THREE.Clock()
let t = 0

renderer.setAnimationLoop(() => {
  const dt = clock.getDelta()
  t += dt
  gu.time.value = t * 1.25
  controls.update()
  waterStuff.update(dt)
  renderer.render(scene, camera)
})

const panel = document.getElementById('side-panel')!
const panelClose = document.getElementById('panel-close')!

function closePanel() {
  panel.classList.remove('open')
}

panelClose.addEventListener('click', closePanel)

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closePanel()
})

document.addEventListener('pointerdown', (e) => {
  if (
    panel.classList.contains('open') &&
    !panel.contains(e.target as Node) &&
    e.target !== renderer.domElement
  ) {
    closePanel()
  }
})
