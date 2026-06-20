import * as THREE from 'three'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js'

// ─── Floor & keyboard ───────────────────────────────────────────────────────

function createProjectedFloor(
  width: number,
  depth: number,
  material: THREE.Material,
  segments = 64,
) {
  const geometry = new THREE.PlaneGeometry(width, depth, segments, segments)
  geometry.rotateX(-Math.PI / 2)
  return new THREE.Mesh(geometry, material)
}

function createKeyboard(material: THREE.Material) {
  const group = new THREE.Group()

  const base = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.045, 0.42), material)
  base.position.y = 0.0225
  group.add(base)

  const cols = 10, rows = 3
  const keyW = 0.09, keyH = 0.072, keyD = 0.07
  const gapX = 0.012, gapZ = 0.01
  const startX = -((cols - 1) * (keyW + gapX)) / 2
  const startZ = -((rows - 1) * (keyD + gapZ)) / 2
  const keyGeo = new THREE.BoxGeometry(keyW, keyH, keyD)

  for (let rz = 0; rz < rows; rz++) {
    for (let cx = 0; cx < cols; cx++) {
      const key = new THREE.Mesh(keyGeo, material)
      key.position.set(
        startX + cx * (keyW + gapX),
        0.045 + keyH * 0.5 + 0.002,
        startZ + rz * (keyD + gapZ),
      )
      group.add(key)
    }
  }

  group.position.set(0, 0, 1.28)
  return group
}

// ─── Gradient shader ────────────────────────────────────────────────────────

const VERT = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`

const FRAG = `
precision highp float;
varying vec2 vUv;
uniform float uTime;
uniform float uProjectionIntensity;
uniform float uReflectionGain;
uniform float uHighlightBoost;
uniform float uLumaVisibilityThreshold;
uniform float uInvertColor;
uniform float uHalftone;
uniform float uToneCut;

vec3 mod289(vec3 x){return x-floor(x*(1./289.))*289.;}
vec2 mod289(vec2 x){return x-floor(x*(1./289.))*289.;}
vec3 permute(vec3 x){return mod289(((x*34.)+1.)*x);}

float snoise(vec2 v){
  const vec4 C=vec4(.211324865405187,.366025403784439,-.577350269189626,.024390243902439);
  vec2 i=floor(v+dot(v,C.yy));
  vec2 x0=v-i+dot(i,C.xx);
  vec2 i1=(x0.x>x0.y)?vec2(1.,0.):vec2(0.,1.);
  vec4 x12=x0.xyxy+C.xxzz;
  x12.xy-=i1;
  i=mod289(i);
  vec3 p=permute(permute(i.y+vec3(0.,i1.y,1.))+i.x+vec3(0.,i1.x,1.));
  vec3 m=max(.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.);
  m=m*m; m=m*m;
  vec3 x=2.*fract(p*C.www)-1.;
  vec3 h=abs(x)-.5;
  vec3 ox=floor(x+.5);
  vec3 a0=x-ox;
  m*=1.79284291400159-.85373472095314*(a0*a0+h*h);
  vec3 g;
  g.x=a0.x*x0.x+h.x*x0.y;
  g.yz=a0.yz*x12.xz+h.yz*x12.yw;
  return 130.*dot(m,g);
}

float fbm(vec2 p){
  float v=0.;float a=.5;
  for(int i=0;i<5;i++){v+=a*snoise(p);p=p*2.+vec2(17.,31.);a*=.5;}
  return v;
}

void main(){
  vec2 uv=vUv;
  vec2 p=uv*2.-1.;
  float t=uTime;

  vec2 flow=vec2(t*.19,t*.13);
  vec2 q=vec2(fbm(p*1.05+flow),fbm(p*1.05+vec2(-flow.y*1.1,flow.x*.9)));
  vec2 w=p+q*.62;

  float nA=.5+.5*fbm(w*2.15+flow*.8);
  float nB=.5+.5*fbm(w*4.8+vec2(-flow.x*.5,flow.y*.35));
  float ridge=1.-abs(2.*nB-1.);
  float mask=clamp(.18+1.12*(.58*nA+.42*ridge),0.,1.);
  float edgeFade=1.-clamp(length(p)*.7,0.,1.);
  float intensity=pow(clamp(mask*(.72+edgeFade*.45),0.,1.),1.05);

  float base=nA*.82+ridge*.18;
  vec3 col=vec3(
    .18+.86*(.5+.5*cos(6.28318*(base+.02+t*.07))),
    .14+.9 *(.5+.5*cos(6.28318*(base+.37+t*.06))),
    .2 +.9 *(.5+.5*cos(6.28318*(base+.72+t*.065)))
  );
  col*=intensity;

  float highlight=pow(clamp((nA*1.1+ridge*.75)-1.1,0.,1.),2.2);
  col=mix(col,vec3(1.,.96,.92),highlight*vec3(.22,.16,.1));
  vec3 tex=clamp(col,0.,1.);

  if(uInvertColor>.5) tex=vec3(1.)-tex;

  if(uToneCut>.5){
    float levels=5.;
    tex=floor(tex*(levels-1.)+.5)/(levels-1.);
  }

  float lum=dot(tex,vec3(.2126,.7152,.0722));
  float lumaStart=clamp(uLumaVisibilityThreshold,0.,1.);
  float lumaEnd=min(1.,lumaStart+.1);
  float darkMask=1.;
  if(lumaStart>1e-4) darkMask=smoothstep(lumaStart,lumaEnd,lum);

  if(uHalftone>.5){
    vec2 hUv=vUv*vec2(180.,120.);
    vec2 hCell=fract(hUv)-.5;
    float dotRadius=mix(.02,.45,clamp(lum,0.,1.));
    float dotMask=1.-smoothstep(dotRadius,dotRadius+.035,length(hCell));
    tex*=dotMask*darkMask;
  }

  float hi=smoothstep(.5,1.,lum);
  tex*=darkMask;
  tex*=mix(1.,uHighlightBoost,hi);
  tex*=max(0.,uProjectionIntensity)*max(0.,uReflectionGain);

  gl_FragColor=vec4(tex,1.);
}
`

// ─── Gradient render source ──────────────────────────────────────────────────

interface GradientEffects {
  projectionIntensity: number
  reflectionGain: number
  highlightBoost: number
  lumaVisibilityThreshold: number
  invertColor: boolean
  halftone: boolean
  toneCut: boolean
}

function createGradientRenderSource(width = 1024, height = 576) {
  const sourceScene = new THREE.Scene()
  const sourceCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
  const sourceMaterial = new THREE.ShaderMaterial({
    vertexShader: VERT,
    fragmentShader: FRAG,
    uniforms: {
      uTime:                     { value: 0 },
      uProjectionIntensity:      { value: 0.5 },
      uReflectionGain:           { value: 1.0 },
      uHighlightBoost:           { value: 1.65 },
      uLumaVisibilityThreshold:  { value: 0.3 },
      uInvertColor:              { value: 0 },
      uHalftone:                 { value: 0 },
      uToneCut:                  { value: 0 },
    },
    depthTest: false,
    depthWrite: false,
  })
  const sourceQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), sourceMaterial)
  sourceScene.add(sourceQuad)

  const target = new THREE.WebGLRenderTarget(
    Math.max(2, Math.floor(width)),
    Math.max(2, Math.floor(height)),
    {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      type: THREE.UnsignedByteType,
      colorSpace: THREE.SRGBColorSpace,
      depthBuffer: false,
      stencilBuffer: false,
    },
  )

  return {
    texture: target.texture,
    render(renderer: THREE.WebGLRenderer, timeSec: number) {
      const prev = renderer.getRenderTarget()
      const prevXr = renderer.xr.enabled
      renderer.xr.enabled = false
      sourceMaterial.uniforms.uTime.value = timeSec
      renderer.setRenderTarget(target)
      renderer.clear()
      renderer.render(sourceScene, sourceCamera)
      renderer.setRenderTarget(prev)
      renderer.xr.enabled = prevXr
    },
    setEffects(fx: GradientEffects) {
      sourceMaterial.uniforms.uProjectionIntensity.value     = fx.projectionIntensity
      sourceMaterial.uniforms.uReflectionGain.value          = fx.reflectionGain
      sourceMaterial.uniforms.uHighlightBoost.value          = fx.highlightBoost
      sourceMaterial.uniforms.uLumaVisibilityThreshold.value = fx.lumaVisibilityThreshold
      sourceMaterial.uniforms.uInvertColor.value             = fx.invertColor ? 1 : 0
      sourceMaterial.uniforms.uHalftone.value                = fx.halftone   ? 1 : 0
      sourceMaterial.uniforms.uToneCut.value                 = fx.toneCut    ? 1 : 0
    },
    dispose() {
      sourceQuad.geometry.dispose()
      sourceMaterial.dispose()
      target.dispose()
    },
  }
}

// ─── Screen mesh ────────────────────────────────────────────────────────────

function createScreen(texture: THREE.Texture) {
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 1.3),
    new THREE.MeshBasicMaterial({ map: texture, toneMapped: false, side: THREE.DoubleSide }),
  )
  mesh.position.set(0, 1.0, 0.5)
  return mesh
}

// ─── Scene setup ────────────────────────────────────────────────────────────

const container = document.getElementById('underwater-container')!

const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' })
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.outputColorSpace = THREE.SRGBColorSpace
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 0.78
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
container.appendChild(renderer.domElement)

const scene = new THREE.Scene()
scene.background = new THREE.Color(0x101014)

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100)
camera.position.set(0, 1.2, 5.5)
camera.lookAt(0, 0.8, 0)

// Gradient sources
const screenGradientSource     = createGradientRenderSource(1024, 576)
const projectionGradientSource = createGradientRenderSource(1024, 576)

const fx: GradientEffects = {
  projectionIntensity:     1.64,
  reflectionGain:          1.0,
  highlightBoost:          1.65,
  lumaVisibilityThreshold: 0.12,
  invertColor:             false,
  halftone:                true,
  toneCut:                 false,
}

screenGradientSource.setEffects({
  projectionIntensity: 1, reflectionGain: 1, highlightBoost: 1,
  lumaVisibilityThreshold: 0, invertColor: false, halftone: false, toneCut: false,
})
screenGradientSource.render(renderer, 0)
projectionGradientSource.render(renderer, 0)

// Meshes
const floorKeyboardMat = new THREE.MeshStandardMaterial({
  color: 0x1a1a22,
  roughness: 0.88,
  metalness: 0.06,
})

const floorMesh = createProjectedFloor(100, 100, floorKeyboardMat)
floorMesh.receiveShadow = true

const keyboard = createKeyboard(floorKeyboardMat)
keyboard.traverse(obj => {
  if (obj instanceof THREE.Mesh) {
    obj.receiveShadow = true
    obj.castShadow   = true
  }
})

const screen = createScreen(screenGradientSource.texture)
scene.add(screen, floorMesh, keyboard)

// Lights
const spot = new THREE.SpotLight(0xffffff, 220)
spot.decay    = 6
spot.distance = 35
spot.angle    = Math.PI / 3.1
spot.penumbra = 0.58
spot.map      = projectionGradientSource.texture
spot.castShadow = true
spot.shadow.mapSize.set(2048, 2048)
spot.shadow.bias       = -0.0002
spot.shadow.normalBias =  0.02
spot.position.set(0, 1.0, 0.52)
spot.target.position.set(0, 0.02, 1.15)
scene.add(spot, spot.target)

const hemi = new THREE.HemisphereLight(0xffffff, 0x060608, 0.04)
hemi.position.set(0, 10, 0)
scene.add(hemi)

// Post-processing
const composer = new EffectComposer(renderer)
composer.addPass(new RenderPass(scene, camera))
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  0.22, 0.42, 0.72,
)
composer.addPass(bloomPass)
composer.addPass(new OutputPass())

function syncFx() {
  const blend = Math.max(0, fx.projectionIntensity) * Math.max(0, fx.reflectionGain)
  spot.intensity              = 220 * blend
  bloomPass.radius            = THREE.MathUtils.clamp(64 / 128, 0, 1)
  bloomPass.strength          = 0.22 * Math.max(0.2, fx.highlightBoost)
  bloomPass.threshold         = THREE.MathUtils.clamp(fx.lumaVisibilityThreshold, 0, 1)
  projectionGradientSource.setEffects(fx)
}
syncFx()

// ─── Animation loop ──────────────────────────────────────────────────────────

let rafId: number | null = null
let running = true

function setLoop(active: boolean) {
  running = active
  if (active && rafId === null) animate()
  if (!active && rafId !== null) { cancelAnimationFrame(rafId); rafId = null }
}

function animate() {
  rafId = requestAnimationFrame(animate)
  if (!running) return
  const t = performance.now() * 0.001
  screenGradientSource.render(renderer, t)
  projectionGradientSource.render(renderer, t)
  syncFx()
  composer.render()
}
animate()

// ─── Pause when off-screen ───────────────────────────────────────────────────

document.addEventListener('visibilitychange', () => {
  setLoop(!document.hidden)
})

window.addEventListener('scroll', () => {
  if (!document.hidden) setLoop(window.scrollY < window.innerHeight * 2)
}, { passive: true })

// ─── Resize ──────────────────────────────────────────────────────────────────

window.addEventListener('resize', () => {
  const w = window.innerWidth, h = window.innerHeight
  camera.aspect = w / h
  camera.updateProjectionMatrix()
  renderer.setSize(w, h)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  composer.setSize(w, h)
})

// ─── Cleanup ─────────────────────────────────────────────────────────────────

window.addEventListener('beforeunload', () => {
  if (rafId !== null) cancelAnimationFrame(rafId)
  screenGradientSource.dispose()
  projectionGradientSource.dispose()
  floorKeyboardMat.dispose()
  floorMesh.geometry.dispose()
  renderer.dispose()
})
