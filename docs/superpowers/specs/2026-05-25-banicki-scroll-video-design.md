# Banicki Scroll-Video Website — Design Spec

**Date:** 2026-05-25  
**Status:** Approved

---

## Overview

A standalone single-file website for Banicki Garten- und Landschaftsbau. The entire page is a scroll-driven video experience: the video plays forward as the user scrolls down and reverses as they scroll up. A hero headline floats above the video. No React, no build step — one self-contained `banicki.html` file.

---

## File Structure

```
banicki.html         — single HTML file, all CSS and JS inline
video.mp4            — source video, in the same directory as the HTML
```

The HTML file references `video.mp4` via a relative path. To deploy, both files are uploaded together.

---

## Page Structure

The page uses a "scroll-pinned" pattern:

- **Scroll container** (`div.scroll-container`): `height: 400vh`. Provides 4 full screens of scroll distance, which maps to the full video duration. Adjust this value if the video is very short or very long.
- **Sticky viewport** (`div.sticky-viewport`): `position: sticky; top: 0; height: 100vh`. Stays pinned to the top of the viewport while the user scrolls through the tall container.
- **Three.js canvas**: fills the sticky viewport. `renderer.setClearAlpha(0)` makes the background transparent so the page background colour shows through any letterboxed areas.
- **Text overlay** (`div.overlay`): `position: absolute` on top of the canvas, left-center alignment, `pointer-events: none` so it never blocks scroll.

---

## Three.js Rendering

- **Renderer**: `WebGLRenderer({ alpha: true, antialias: true })`. Canvas sized to `window.innerWidth × window.innerHeight`, resizes on window resize.
- **Scene**: `OrthographicCamera` matching the viewport size, looking at a single fullscreen `PlaneGeometry` mesh. Orthographic avoids perspective distortion on a 2D fullscreen plane.
- **Material**: `MeshBasicMaterial` with a `THREE.VideoTexture` as the map.
- **Video element**: a hidden `<video>` element (`display: none`, `muted`, `playsInline`, `preload="auto"`). The video is NOT set to `autoplay` — playback is controlled entirely via `currentTime`.
- The plane is sized to cover the viewport while preserving the video's aspect ratio (`object-fit: cover` equivalent via plane scale).

---

## Scroll Mechanic

```
progress = scrollY / (scrollContainer.scrollHeight - window.innerHeight)   // 0 → 1
targetTime = progress * video.duration
```

Each `requestAnimationFrame`:
- Read `window.scrollY` to compute `progress` (clamped 0–1).
- Compute `targetTime`.
- Lerp `video.currentTime` toward `targetTime` with a factor of `0.12` for smooth scrubbing.
- Update the `VideoTexture` (`texture.needsUpdate = true`).
- Call `renderer.render(scene, camera)`.

Scrolling down → `progress` increases → video plays forward.  
Scrolling up → `progress` decreases → video reverses.  
The lerp prevents jitter from rapid scroll events.

---

## Text Overlay

Positioned left-center (`top: 50%; transform: translateY(-50%); left: clamp(32px, 6vw, 80px)`).

```
BANICKI
————————————————  (40px × 2px rule, white 35% opacity)
GARTEN- UND LANDSCHAFTSBAU   (small caps, spaced, white 55%)

Mache deinen Garten besonders.   (serif italic, white 38%)
```

Typography:
- **BANICKI**: `font-size: clamp(2.4rem, 5vw, 3.8rem)`, `font-weight: 900`, `letter-spacing: 0.12em`, `color: #fff`, sans-serif
- **Subtitle**: `font-size: 0.65rem`, `letter-spacing: 0.22em`, `text-transform: uppercase`, `color: rgba(255,255,255,0.55)`, sans-serif
- **Tagline**: `font-size: 0.95rem`, `font-style: italic`, `color: rgba(255,255,255,0.38)`, serif

Text has `text-shadow: 0 2px 20px rgba(0,0,0,0.6)` for legibility over bright video frames.

---

## Scroll Hint

A `↓ scroll` indicator sits at `bottom: 32px; left: 50%; transform: translateX(-50%)`. It fades out after the user first scrolls (`opacity` transitions from 1 to 0 once `scrollY > 10`).

---

## Colour & Background

- Page background: `#0a0f0a` (deep forest black). Visible only behind any letterboxed areas of the video.
- No other page sections — the scroll container is the entire page.

---

## Constraints

- **No audio**: the video must be muted for `currentTime` scrubbing to work reliably across browsers.
- **Video format**: MP4 (H.264) for broadest browser support.
- **CORS**: when opening as a local file (`file://`), some browsers block video texture loading. The site should be served via a local server (e.g., `npx serve .`) or deployed to a host. A note will be included in a comment in the HTML.
- **No IE support required**.

---

## Out of Scope

- Additional page sections (contact, gallery, etc.)
- Mobile-specific breakpoints beyond responsive font sizing
- CMS or dynamic content
