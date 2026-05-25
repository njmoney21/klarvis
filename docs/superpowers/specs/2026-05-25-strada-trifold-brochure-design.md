# La Strada — Print-Ready A4 Tri-Fold Brochure

**Date:** 2026-05-25  
**Status:** Approved  
**Toolchain:** Python 3.10 + Pillow 11.2.1

---

## Overview

Convert 6 pre-designed portrait panel images into a print-ready A4 landscape tri-fold brochure. Output 4 files: PNG + PDF for each of the two sides (inner spread, outer spread).

---

## Technical Specifications

| Property | Value |
|---|---|
| Final trim size | 297 × 210mm (A4 landscape) |
| Bleed | 3mm all sides |
| Total canvas | 303 × 216mm |
| Resolution | 300 DPI |
| Color mode | CMYK |
| Panel count | 3 per side × 2 sides |
| Panel size | 99 × 210mm each |

### Pixel Dimensions (300 DPI)

| Measurement | mm | px |
|---|---|---|
| Total canvas width | 303mm | 3579px |
| Total canvas height | 216mm | 2551px |
| Bleed | 3mm | 35px |
| Content width | 297mm | 3508px |
| Content height | 210mm | 2480px |
| Panel width | 99mm | 1169px |
| Safe zone inset | 5mm | 59px |

---

## Source Files

Located at: `C:\Users\nikol\Desktop\Strada\`

All source images are ~1024×1536px RGB PNG at 96 DPI metadata.

### Inner Spread (Side 1)

| Position | File |
|---|---|
| Panel 1 — Inside Left | `BURGER.png` |
| Panel 2 — Inside Center | `CHICKEN FERTIG.png` |
| Panel 3 — Inside Right | `BEILAGEN FERTIG.png` |

### Outer Spread (Side 2)

| Position | File |
|---|---|
| Panel 1 — Outside Left (back) | `ERSTE SEITE FERTIG.png` |
| Panel 2 — Outside Center | `DRINKS FERTIG.png` |
| Panel 3 — Outside Right (front cover) | `Salate.png` |

*Panel order confirmed by cross-referencing `Inner FERTIG.png` and `Outer FERTIG.png` composite previews.*

---

## Composition Logic (per panel)

1. Load source PNG (RGB)
2. Scale to panel width (1169px) maintaining aspect ratio → results in ~1169×1753px
3. Create black canvas (1169×2480px, `#000000`)
4. Paste scaled image centered vertically → 364px black fill top and bottom
5. Result: full-height panel with all original content intact, no cropping

### Why black fill works
All 6 source panels have a solid black background. The 364px extension is visually seamless.

---

## Output Assembly

### Per spread:
1. Create canvas: 3579×2551px, CMYK, black background
2. Place Panel 1 at x=35px (bleed offset), y=35px
3. Place Panel 2 at x=35+1169=1204px, y=35px
4. Place Panel 3 at x=35+1169+1169=2373px, y=35px
5. Convert final canvas to CMYK
6. Save as PNG (300 DPI) and PDF (embedded image, A4 landscape)

---

## Output Files

Destination: `C:\Users\nikol\Desktop\Strada\output\`

| File | Description |
|---|---|
| `Inner_spread.png` | Inner side, 3579×2551px, 300 DPI, CMYK |
| `Inner_spread.pdf` | Inner side, print-ready PDF, 303×216mm |
| `Outer_spread.png` | Outer side, 3579×2551px, 300 DPI, CMYK |
| `Outer_spread.pdf` | Outer side, print-ready PDF, 303×216mm |

---

## Constraints

- No cropping of any content
- No distortion (aspect ratio preserved via fit-to-width)
- No redesign, rewriting, or reordering of content within panels
- Minimum 5mm safe zone from trim edge on all sides (maintained since no cropping occurs)
- Script: `C:\Users\nikol\Desktop\Strada\build_brochure.py`
