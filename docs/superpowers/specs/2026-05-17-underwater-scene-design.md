# Underwater Three.js Scene with Clickable Side Panels

**Date:** 2026-05-17  
**Status:** Approved

## Overview

Replace the current particle-swarm Three.js background in `index.html` with an underwater scene featuring a fish (`Thing`), floating capsule creatures (`WaterStuff`), an animated wave grid sea bed (`SeaBed`), and a gradient sphere (`Background`). Objects are raycasted on click to open a right-side panel showing relevant site content. The section previously called "Portfolio" is renamed "Gallery" throughout, and the single gallery item becomes the n8n AI ordering agent for La Locanda di Nino.

---

## Architecture

### Files changed

| File | Change |
|---|---|
| `index.html` | New importmap (`three@0.182.0` + `three/addons/`), remove `#ui` div, add `#side-panel` div, replace entire inline module script with underwater scene + raycasting + panel logic |
| `src/components/SectionHero.tsx` | Remove "Click to evolve" button — section becomes a transparent spacer + bottom gradient only |
| `src/components/SectionPortfolio.tsx` | Rename file to `SectionGallery.tsx`, rename component, change section ID `#portfolio` → `#gallery`, replace LivePreview iframe with n8n project card |
| `src/components/Navbar.tsx` | Update nav link label Portfolio → Gallery, href `#portfolio` → `#gallery` |
| `src/index.css` | Rename `#swarm-container canvas` rule → `#underwater-container canvas`. The container div in `index.html` also changes from `id="swarm-container"` to `id="underwater-container"`. |

`body` keeps `overflow: auto` — no `overflow: hidden` — so the page scrolls to sections below the hero.

---

## Three.js Scene (index.html inline module)

### Importmap
```json
{
  "imports": {
    "three": "https://unpkg.com/three@0.182.0/build/three.module.js",
    "three/addons/": "https://unpkg.com/three@0.182.0/examples/jsm/"
  }
}
```

### Simplex noise
Inlined as a GLSL string constant `noise` inside the module script (verbatim from the user's provided code).

### Scene objects

| Class | Type | Description |
|---|---|---|
| `Background` | `THREE.Mesh` (SphereGeometry, BackSide) | Canvas gradient texture sphere, no fog |
| `SeaBed` | `THREE.LineSegments` | 100×100 plane, 400×400 segments, rotated to horizontal, animated wave via simplex noise in vertex shader, colour shift on noise value |
| `WaterStuff` | `THREE.Group` of 50 `THREE.Mesh` (CapsuleGeometry) | Wireframe teal capsules drifting left, looped via `setRandom` respawn |
| `Thing` | `THREE.Group` (LineSegments + Points) | Fish-shaped morphing sphere — 4-petal cross-section, body waving, wing swaying, glowing cyan |

Scene background: `#024`. Fog: `Fog(#024, 8, 30)`.  
Camera: `PerspectiveCamera(45)`, initial position `(0.5, 0.25, -1).setLength(7.25)`.  
OrbitControls: damping on, no pan, maxDistance 15, maxPolarAngle 60%.

### Animation loop
`gu.time` uniform increments at `dt * 1.25`. `WaterStuff.update(dt)` drifts capsules. OrbitControls updated each frame.

---

## Raycasting & Click Detection

On `click` event (and `touchend`), cast a ray through the scene using `THREE.Raycaster`:

1. An invisible `THREE.Mesh(SphereGeometry(3.5), MeshBasicMaterial({visible:false}))` is added as a hit-proxy child of `Thing` — raycasting a fish's LineSegments/Points is unreliable, so the invisible sphere acts as the click target.
2. Collect all meshes from `waterStuff.items` (CapsuleGeometry — raycasts cleanly).
3. Collect `seaBed` mesh.

Priority: **Thing hit-proxy → WaterStuff → SeaBed**. First intersection found wins.

To distinguish OrbitControls drag from click: record `mousedown` position; on `mouseup`/`click`, ignore if pointer moved more than 5px.

---

## Side Panel

### HTML structure (in index.html, above `#root`)
```html
<div id="side-panel" class="side-panel">
  <button id="panel-close">✕</button>
  <div id="panel-content"></div>
</div>
```

### CSS (in index.html `<style>` block)
- `position: fixed; right: 0; top: 0; height: 100vh; width: 320px`
- `transform: translateX(100%)` when hidden, `translateX(0)` when open
- `transition: transform 0.35s cubic-bezier(0.16,1,0.3,1)`
- Background: `rgba(6,10,15,0.97)`, border-left: `1px solid rgba(124,58,237,0.35)`
- `z-index: 10` (above Three.js canvas, below React nav)
- On mobile (< 640px): full-width, slides up from bottom

### Panel content per object

**Fish (Thing) → Leistungen**
- Label: `01 — Leistungen`
- Heading: "Was wir anbieten"
- Two service cards (Website, Wartung & Support) — title + one-line description
- CTA button: "Mehr erfahren →" scrolls to `#leistungen`

**Capsule (WaterStuff) → Gallery**
- Label: `02 — Gallery`
- Heading: "Unsere Arbeit"
- Mini node-graph preview (Webhook → GPT-4o-mini → Twilio nodes)
- Project name: "La Locanda di Nino"
- Description: KI-Bestellassistent via WhatsApp
- Tech tags: n8n, GPT-4o-mini, Twilio
- CTA: "Gallery ansehen →" scrolls to `#gallery`

**Sea bed (SeaBed) → Preise**
- Label: `03 — Preise`
- Heading: "Unsere Pakete"
- Two price cards: Website (499 € einmalig) + Wartung & Support (37,99 €/Mo, BEST DEAL badge)
- CTA: "Preise ansehen →" scrolls to `#preise`

### Hover cursor
`cursor: pointer` on canvas when hovering over a raycasted object (update on `mousemove`).

---

## Gallery Section (SectionGallery.tsx)

Replaces `SectionPortfolio.tsx`. Removes the `LivePreview` iframe component. Adds a single project card for the n8n agent:

```ts
const projects = [
  {
    name: 'La Locanda di Nino',
    type: 'KI-Ordering-Agent',
    description: 'Vollautomatischer Bestellassistent via WhatsApp — nimmt Bestellungen entgegen, beantwortet Fragen zum Menü, rund um die Uhr.',
    tags: ['n8n', 'GPT-4o-mini', 'Twilio', 'WhatsApp'],
  }
]
```

Visual: node-graph mini diagram (same style as panel preview) above the project details.

---

## Out of Scope

- Uploading or hosting the n8n workflow JSON file
- Multiple gallery items beyond La Locanda di Nino
- Mobile-specific Three.js performance optimisation
- Persisting panel open/close state across scroll
