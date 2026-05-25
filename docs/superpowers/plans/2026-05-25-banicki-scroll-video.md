# Banicki Scroll-Video Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a single standalone `banicki.html` file where a Three.js-rendered video scrubs forward/backward as the user scrolls, with a left-center text overlay for Banicki Garten- und Landschaftsbau.

**Architecture:** A scroll-pinned sticky viewport holds a fullscreen Three.js WebGL canvas. A hidden `<video>` element feeds frames into a `THREE.VideoTexture` on a fullscreen orthographic plane. Scroll progress (0–1) maps to `video.currentTime`, lerped each animation frame for smooth scrubbing.

**Tech Stack:** Vanilla HTML/CSS/JS, Three.js 0.184.0 via CDN importmap, no build step.

---

## File Structure

```
banicki.html    — single self-contained file (create)
video.mp4       — source video, must live alongside banicki.html (copy from Desktop)
```

---

### Task 1: HTML scaffold + scroll-pinned layout

**Files:**
- Create: `banicki.html`

- [ ] **Step 1: Create `banicki.html` with this exact content**

```html
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BANICKI — Garten- und Landschaftsbau</title>
  <style>
    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

    html, body {
      width: 100%;
      background: #0a0f0a;
      font-family: system-ui, sans-serif;
    }

    .scroll-container {
      height: 400vh;
      position: relative;
    }

    .sticky-viewport {
      position: sticky;
      top: 0;
      height: 100vh;
      width: 100%;
      overflow: hidden;
      background: #1a3a1a;
    }
  </style>
</head>
<body>
  <!-- Serve via `npx serve .` — video texture is blocked on file:// protocol -->
  <div class="scroll-container" id="scrollContainer">
    <div class="sticky-viewport" id="stickyViewport"></div>
  </div>
</body>
</html>
```

- [ ] **Step 2: Verify the scroll structure**

Open `banicki.html` directly in a browser (file:// is fine for this step — no video yet).

Expected: dark green viewport fills the screen. Scrolling makes the page move but the green box stays pinned at the top. The page is 4× the viewport height tall.

- [ ] **Step 3: Commit**

```bash
git add banicki.html
git commit -m "feat: banicki HTML scaffold with scroll-pinned layout"
```

---

### Task 2: Three.js renderer + orthographic camera

**Files:**
- Modify: `banicki.html`

- [ ] **Step 1: Add the importmap and script block**

Inside `<head>`, just before `</head>`, add:

```html
  <script type="importmap">
    { "imports": { "three": "https://cdn.jsdelivr.net/npm/three@0.184.0/build/three.module.js" } }
  </script>
```

Inside `<body>`, just before `</body>`, add:

```html
  <script type="module">
    import * as THREE from 'three';

    const stickyViewport = document.getElementById('stickyViewport');

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    stickyViewport.style.background = 'none';
    stickyViewport.appendChild(renderer.domElement);

    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const scene = new THREE.Scene();

    const geo = new THREE.PlaneGeometry(2, 2);
    const mat = new THREE.MeshBasicMaterial({ color: 0x2a5a2a });
    const mesh = new THREE.Mesh(geo, mat);
    scene.add(mesh);

    function animate() {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    }
    animate();
  </script>
```

- [ ] **Step 2: Verify the renderer**

Open `banicki.html` in a browser (file:// still fine). You need an internet connection for the CDN import.

Expected: solid green plane fills the entire viewport. No scrollbars on the canvas itself. Scrolling still works normally.

- [ ] **Step 3: Commit**

```bash
git add banicki.html
git commit -m "feat: add Three.js renderer and orthographic camera"
```

---

### Task 3: Video element + VideoTexture on the plane

**Files:**
- Modify: `banicki.html`

- [ ] **Step 1: Add the hidden video element**

Inside `<body>`, just after the `<div class="scroll-container">` closing tag and before the `<script>` block, add:

```html
  <video id="video" src="video.mp4" muted playsinline preload="auto" style="display:none"></video>
```

- [ ] **Step 2: Replace the placeholder material with VideoTexture**

Replace the entire `<script type="module">` block with:

```html
  <script type="module">
    import * as THREE from 'three';

    const video = document.getElementById('video');
    const scrollContainer = document.getElementById('scrollContainer');
    const stickyViewport = document.getElementById('stickyViewport');

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    stickyViewport.style.background = 'none';
    stickyViewport.appendChild(renderer.domElement);

    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const scene = new THREE.Scene();

    const texture = new THREE.VideoTexture(video);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;

    const geo = new THREE.PlaneGeometry(2, 2);
    const mat = new THREE.MeshBasicMaterial({ map: texture });
    const mesh = new THREE.Mesh(geo, mat);
    scene.add(mesh);

    function animate() {
      requestAnimationFrame(animate);
      texture.needsUpdate = true;
      renderer.render(scene, camera);
    }
    animate();
  </script>
```

- [ ] **Step 3: Copy `video.mp4` to the project root**

Run in PowerShell from project root:

```powershell
Copy-Item "C:\Users\nikol\Desktop\video.mp4" "C:\Users\nikol\Desktop\klarvis\video.mp4"
```

- [ ] **Step 4: Serve and verify**

```bash
npx serve . --listen 3001
```

Open `http://localhost:3001/banicki.html`.

Expected: the first frame of `video.mp4` fills the canvas. The video does not autoplay — it stays on frame 0.

- [ ] **Step 5: Commit**

```bash
git add banicki.html
git commit -m "feat: add VideoTexture — first frame rendered via Three.js"
```

---

### Task 4: Scroll-driven video scrubbing

**Files:**
- Modify: `banicki.html`

- [ ] **Step 1: Add scroll state and scroll listener**

Inside the `<script type="module">` block, add these variables after the `scene.add(mesh)` line:

```js
    let targetTime = 0;
    let lerpedTime = 0;

    window.addEventListener('scroll', () => {
      const scrollable = scrollContainer.scrollHeight - window.innerHeight;
      const progress = Math.min(Math.max(window.scrollY / scrollable, 0), 1);
      targetTime = progress * (video.duration || 0);
    });
```

- [ ] **Step 2: Add the lerp seek inside the animation loop**

Replace the existing `animate` function with:

```js
    function animate() {
      requestAnimationFrame(animate);

      const diff = targetTime - lerpedTime;
      if (Math.abs(diff) > 0.001) {
        lerpedTime += diff * 0.12;
        video.currentTime = lerpedTime;
      }

      texture.needsUpdate = true;
      renderer.render(scene, camera);
    }
    animate();
```

- [ ] **Step 3: Verify scroll scrubbing**

With the server still running (`http://localhost:3001/banicki.html`):

- Scroll down slowly → video plays forward frame by frame.
- Scroll back up → video reverses.
- Scroll to the very bottom → video reaches its last frame.
- Scroll to the very top → video returns to frame 0.

- [ ] **Step 4: Commit**

```bash
git add banicki.html
git commit -m "feat: scroll-driven video scrubbing with lerp"
```

---

### Task 5: Cover aspect ratio (object-fit: cover equivalent)

**Files:**
- Modify: `banicki.html`

- [ ] **Step 1: Add `updateTextureAspect` function**

Inside the script block, add this function after the `mesh` is added to the scene:

```js
    function updateTextureAspect() {
      if (!video.videoWidth) return;
      const vA = video.videoWidth / video.videoHeight;
      const wA = window.innerWidth / window.innerHeight;
      if (wA > vA) {
        texture.repeat.set(1, vA / wA);
        texture.offset.set(0, (1 - vA / wA) / 2);
      } else {
        texture.repeat.set(wA / vA, 1);
        texture.offset.set((1 - wA / vA) / 2, 0);
      }
    }

    video.addEventListener('loadedmetadata', updateTextureAspect);
```

- [ ] **Step 2: Verify cover behaviour**

In `http://localhost:3001/banicki.html`:

- The video fills the entire viewport with no black bars.
- Resize the browser window — the video stays full-coverage, cropping rather than letterboxing.
- The image is not stretched or distorted.

- [ ] **Step 3: Commit**

```bash
git add banicki.html
git commit -m "feat: VideoTexture aspect ratio cover via repeat/offset"
```

---

### Task 6: Text overlay + scroll hint

**Files:**
- Modify: `banicki.html`

- [ ] **Step 1: Add overlay CSS to `<style>`**

Inside the `<style>` block, after the `.sticky-viewport` rule, add:

```css
    canvas {
      position: absolute;
      top: 0;
      left: 0;
      width: 100% !important;
      height: 100% !important;
    }

    .overlay {
      position: absolute;
      top: 50%;
      left: clamp(32px, 6vw, 80px);
      transform: translateY(-50%);
      pointer-events: none;
      z-index: 10;
    }

    .brand-name {
      font-size: clamp(2.4rem, 5vw, 3.8rem);
      font-weight: 900;
      color: #fff;
      letter-spacing: 0.12em;
      line-height: 1;
      text-shadow: 0 2px 20px rgba(0,0,0,0.6);
    }

    .rule {
      width: 40px;
      height: 2px;
      background: rgba(255,255,255,0.35);
      margin: 14px 0;
    }

    .subtitle {
      font-size: 0.65rem;
      color: rgba(255,255,255,0.55);
      letter-spacing: 0.22em;
      text-transform: uppercase;
      text-shadow: 0 2px 20px rgba(0,0,0,0.6);
    }

    .tagline {
      font-size: 0.95rem;
      font-style: italic;
      color: rgba(255,255,255,0.38);
      font-family: Georgia, serif;
      margin-top: 14px;
      text-shadow: 0 2px 20px rgba(0,0,0,0.6);
    }

    .scroll-hint {
      position: fixed;
      bottom: 32px;
      left: 50%;
      transform: translateX(-50%);
      font-size: 0.65rem;
      color: rgba(255,255,255,0.4);
      letter-spacing: 0.2em;
      text-transform: uppercase;
      pointer-events: none;
      z-index: 10;
      transition: opacity 0.6s ease;
    }
```

- [ ] **Step 2: Add overlay HTML inside `.sticky-viewport`**

Replace:

```html
    <div class="sticky-viewport" id="stickyViewport"></div>
```

With:

```html
    <div class="sticky-viewport" id="stickyViewport">
      <div class="overlay">
        <div class="brand-name">BANICKI</div>
        <div class="rule"></div>
        <div class="subtitle">Garten- und Landschaftsbau</div>
        <div class="tagline">Mache deinen Garten besonders.</div>
      </div>
    </div>
```

- [ ] **Step 3: Add scroll hint element**

After the closing `</div>` of `.scroll-container` and before the `<video>` element, add:

```html
  <div class="scroll-hint" id="scrollHint">↓ &nbsp; Scroll</div>
```

- [ ] **Step 4: Wire up scroll hint fade**

Inside the `scroll` event listener, after the `targetTime` line, add:

```js
      if (window.scrollY > 10) {
        document.getElementById('scrollHint').style.opacity = '0';
      }
```

- [ ] **Step 5: Verify overlay and hint**

In `http://localhost:3001/banicki.html`:

- "BANICKI" appears large and white, left-center on screen.
- Thin white rule below it, then "GARTEN- UND LANDSCHAFTSBAU" in small caps, then italic tagline.
- "↓ Scroll" is centered at the bottom.
- Scroll down slightly → hint fades out.
- Video still scrubs normally with scroll.

- [ ] **Step 6: Commit**

```bash
git add banicki.html
git commit -m "feat: add text overlay and scroll hint"
```

---

### Task 7: Resize handler + final verification

**Files:**
- Modify: `banicki.html`

- [ ] **Step 1: Add resize handler**

Inside the script block, after the `video.addEventListener('loadedmetadata', ...)` line, add:

```js
    window.addEventListener('resize', () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      updateTextureAspect();
    });
```

- [ ] **Step 2: Verify resize**

In `http://localhost:3001/banicki.html`:

- Drag the browser window to a narrow portrait shape → video still covers the viewport without distortion.
- Drag to a wide landscape shape → same.
- Canvas always fills the sticky viewport edge-to-edge.

- [ ] **Step 3: Full end-to-end test**

Test each of the following:

| Action | Expected |
|--------|----------|
| Page load | First frame of video visible. "↓ Scroll" hint visible. |
| Scroll down slowly | Video plays forward, frame by frame. |
| Scroll up | Video reverses smoothly. |
| Scroll to bottom | Video reaches final frame. |
| Scroll back to top | Returns to frame 0. |
| Resize window | Video covers viewport, no distortion. |
| Scroll 10px | "↓ Scroll" hint fades out. |

- [ ] **Step 4: Commit**

```bash
git add banicki.html
git commit -m "feat: resize handler — complete Banicki scroll-video page"
```

---

## Complete Final File Reference

After all tasks, `banicki.html` should match this exactly:

```html
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BANICKI — Garten- und Landschaftsbau</title>
  <style>
    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

    html, body {
      width: 100%;
      background: #0a0f0a;
      font-family: system-ui, sans-serif;
    }

    .scroll-container {
      height: 400vh;
      position: relative;
    }

    .sticky-viewport {
      position: sticky;
      top: 0;
      height: 100vh;
      width: 100%;
      overflow: hidden;
    }

    canvas {
      position: absolute;
      top: 0;
      left: 0;
      width: 100% !important;
      height: 100% !important;
    }

    .overlay {
      position: absolute;
      top: 50%;
      left: clamp(32px, 6vw, 80px);
      transform: translateY(-50%);
      pointer-events: none;
      z-index: 10;
    }

    .brand-name {
      font-size: clamp(2.4rem, 5vw, 3.8rem);
      font-weight: 900;
      color: #fff;
      letter-spacing: 0.12em;
      line-height: 1;
      text-shadow: 0 2px 20px rgba(0,0,0,0.6);
    }

    .rule {
      width: 40px;
      height: 2px;
      background: rgba(255,255,255,0.35);
      margin: 14px 0;
    }

    .subtitle {
      font-size: 0.65rem;
      color: rgba(255,255,255,0.55);
      letter-spacing: 0.22em;
      text-transform: uppercase;
      text-shadow: 0 2px 20px rgba(0,0,0,0.6);
    }

    .tagline {
      font-size: 0.95rem;
      font-style: italic;
      color: rgba(255,255,255,0.38);
      font-family: Georgia, serif;
      margin-top: 14px;
      text-shadow: 0 2px 20px rgba(0,0,0,0.6);
    }

    .scroll-hint {
      position: fixed;
      bottom: 32px;
      left: 50%;
      transform: translateX(-50%);
      font-size: 0.65rem;
      color: rgba(255,255,255,0.4);
      letter-spacing: 0.2em;
      text-transform: uppercase;
      pointer-events: none;
      z-index: 10;
      transition: opacity 0.6s ease;
    }
  </style>
  <script type="importmap">
    { "imports": { "three": "https://cdn.jsdelivr.net/npm/three@0.184.0/build/three.module.js" } }
  </script>
</head>
<body>
  <!-- Serve via `npx serve .` — video texture is blocked on file:// protocol -->
  <div class="scroll-container" id="scrollContainer">
    <div class="sticky-viewport" id="stickyViewport">
      <div class="overlay">
        <div class="brand-name">BANICKI</div>
        <div class="rule"></div>
        <div class="subtitle">Garten- und Landschaftsbau</div>
        <div class="tagline">Mache deinen Garten besonders.</div>
      </div>
    </div>
  </div>

  <div class="scroll-hint" id="scrollHint">↓ &nbsp; Scroll</div>

  <video id="video" src="video.mp4" muted playsinline preload="auto" style="display:none"></video>

  <script type="module">
    import * as THREE from 'three';

    const video = document.getElementById('video');
    const scrollContainer = document.getElementById('scrollContainer');
    const stickyViewport = document.getElementById('stickyViewport');

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    stickyViewport.appendChild(renderer.domElement);

    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const scene = new THREE.Scene();

    const texture = new THREE.VideoTexture(video);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;

    const geo = new THREE.PlaneGeometry(2, 2);
    const mat = new THREE.MeshBasicMaterial({ map: texture });
    const mesh = new THREE.Mesh(geo, mat);
    scene.add(mesh);

    function updateTextureAspect() {
      if (!video.videoWidth) return;
      const vA = video.videoWidth / video.videoHeight;
      const wA = window.innerWidth / window.innerHeight;
      if (wA > vA) {
        texture.repeat.set(1, vA / wA);
        texture.offset.set(0, (1 - vA / wA) / 2);
      } else {
        texture.repeat.set(wA / vA, 1);
        texture.offset.set((1 - wA / vA) / 2, 0);
      }
    }

    video.addEventListener('loadedmetadata', updateTextureAspect);

    window.addEventListener('resize', () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      updateTextureAspect();
    });

    let targetTime = 0;
    let lerpedTime = 0;

    window.addEventListener('scroll', () => {
      const scrollable = scrollContainer.scrollHeight - window.innerHeight;
      const progress = Math.min(Math.max(window.scrollY / scrollable, 0), 1);
      targetTime = progress * (video.duration || 0);
      if (window.scrollY > 10) {
        document.getElementById('scrollHint').style.opacity = '0';
      }
    });

    function animate() {
      requestAnimationFrame(animate);
      const diff = targetTime - lerpedTime;
      if (Math.abs(diff) > 0.001) {
        lerpedTime += diff * 0.12;
        video.currentTime = lerpedTime;
      }
      texture.needsUpdate = true;
      renderer.render(scene, camera);
    }
    animate();
  </script>
</body>
</html>
```
