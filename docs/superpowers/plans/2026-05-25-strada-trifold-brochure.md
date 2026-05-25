# Strada Tri-Fold Brochure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Generate 4 print-ready files (Inner_spread.png, Inner_spread.pdf, Outer_spread.png, Outer_spread.pdf) from 6 source panel PNGs via a single Python script.

**Architecture:** One standalone script (`build_brochure.py`) uses Pillow to scale each portrait panel to the correct width, center it vertically on a black canvas, composite 3 panels per spread with 3mm bleed, convert to CMYK, and save PNG + PDF at 300 DPI.

**Tech Stack:** Python 3.10, Pillow 11.2.1

---

## Pixel Math Reference

| Measurement | mm | px (300 DPI) |
|---|---|---|
| Bleed | 3mm | 35px |
| Canvas W | 303mm | 3579px |
| Canvas H | 216mm | 2551px |
| Panel W | (3579-70)//3 | 1169px |
| Panel H | 2551-70 | 2481px |

Panel positions (x from canvas left):
- Panel 1: x = 35
- Panel 2: x = 1204
- Panel 3: x = 2373

---

## Task 1: Create `build_brochure.py`

**Files:**
- Create: `C:\Users\nikol\Desktop\Strada\build_brochure.py`

- [ ] **Step 1: Write the script**

Create `C:\Users\nikol\Desktop\Strada\build_brochure.py` with this exact content:

```python
from PIL import Image
import os

MM = 300 / 25.4

BLEED_PX = round(3 * MM)
CANVAS_W = round(303 * MM)
CANVAS_H = round(216 * MM)
PANEL_W  = (CANVAS_W - 2 * BLEED_PX) // 3
PANEL_H  = CANVAS_H - 2 * BLEED_PX

SRC = r"C:\Users\nikol\Desktop\Strada"
OUT = os.path.join(SRC, "output")

INNER_PANELS = [
    os.path.join(SRC, "BURGER.png"),
    os.path.join(SRC, "CHICKEN FERTIG.png"),
    os.path.join(SRC, "BEILAGEN FERTIG.png"),
]
OUTER_PANELS = [
    os.path.join(SRC, "ERSTE SEITE FERTIG.png"),
    os.path.join(SRC, "DRINKS FERTIG.png"),
    os.path.join(SRC, "Salate.png"),
]


def make_panel(img_path):
    img = Image.open(img_path).convert("RGB")
    scale = PANEL_W / img.width
    new_h = round(img.height * scale)
    img = img.resize((PANEL_W, new_h), Image.LANCZOS)
    canvas = Image.new("RGB", (PANEL_W, PANEL_H), (0, 0, 0))
    y = (PANEL_H - new_h) // 2
    canvas.paste(img, (0, y))
    return canvas


def make_spread(panel_paths, name):
    spread = Image.new("RGB", (CANVAS_W, CANVAS_H), (0, 0, 0))
    for i, path in enumerate(panel_paths):
        panel = make_panel(path)
        x = BLEED_PX + i * PANEL_W
        spread.paste(panel, (x, BLEED_PX))
    cmyk = spread.convert("CMYK")
    os.makedirs(OUT, exist_ok=True)
    cmyk.save(os.path.join(OUT, f"{name}.png"), "PNG", dpi=(300, 300))
    cmyk.save(os.path.join(OUT, f"{name}.pdf"), "PDF", resolution=300)
    print(f"  {name}.png   {CANVAS_W}x{CANVAS_H}px  CMYK  300dpi")
    print(f"  {name}.pdf   303x216mm  CMYK")


if __name__ == "__main__":
    print("Building inner spread...")
    make_spread(INNER_PANELS, "Inner_spread")
    print("Building outer spread...")
    make_spread(OUTER_PANELS, "Outer_spread")
    print(f"\nDone. Files saved to: {OUT}")
```

- [ ] **Step 2: Script is standalone — commit handled in Task 3 via klarvis repo copy.**

---

## Task 2: Run the script and verify outputs

**Files:**
- Creates: `C:\Users\nikol\Desktop\Strada\output\Inner_spread.png`
- Creates: `C:\Users\nikol\Desktop\Strada\output\Inner_spread.pdf`
- Creates: `C:\Users\nikol\Desktop\Strada\output\Outer_spread.png`
- Creates: `C:\Users\nikol\Desktop\Strada\output\Outer_spread.pdf`

- [ ] **Step 1: Run the script**

```powershell
py "C:\Users\nikol\Desktop\Strada\build_brochure.py"
```

Expected output:
```
Building inner spread...
  Inner_spread.png   3579x2551px  CMYK  300dpi
  Inner_spread.pdf   303x216mm  CMYK
Building outer spread...
  Outer_spread.png   3579x2551px  CMYK  300dpi
  Outer_spread.pdf   303x216mm  CMYK

Done. Files saved to: C:\Users\nikol\Desktop\Strada\output
```

- [ ] **Step 2: Verify dimensions, mode, and DPI of PNG outputs**

```powershell
py -c "
from PIL import Image
import os

out = r'C:\Users\nikol\Desktop\Strada\output'
for f in ['Inner_spread.png', 'Outer_spread.png']:
    img = Image.open(os.path.join(out, f))
    dpi = img.info.get('dpi', 'missing')
    print(f'{f}: size={img.size} mode={img.mode} dpi={dpi}')
"
```

Expected output:
```
Inner_spread.png: size=(3579, 2551) mode=CMYK dpi=(300.0, 300.0)
Outer_spread.png: size=(3579, 2551) mode=CMYK dpi=(300.0, 300.0)
```

- [ ] **Step 3: Verify file sizes are reasonable (not empty/corrupt)**

```powershell
Get-ChildItem "C:\Users\nikol\Desktop\Strada\output" | Select-Object Name, @{N='SizeMB';E={[math]::Round($_.Length/1MB, 2)}}
```

Expected: all 4 files present, PNGs between 5–30 MB, PDFs between 5–30 MB.

- [ ] **Step 4: Open and visually inspect one PNG**

```powershell
Start-Process "C:\Users\nikol\Desktop\Strada\output\Inner_spread.png"
Start-Process "C:\Users\nikol\Desktop\Strada\output\Outer_spread.png"
```

Check:
- 3 panels are visible side by side
- Black background fills top/bottom gaps seamlessly
- No cropping of text or logos
- Bleed border visible as black frame

---

## Task 3: Commit outputs and script to klarvis

- [ ] **Step 1: Copy script into klarvis repo for reference**

```powershell
Copy-Item "C:\Users\nikol\Desktop\Strada\build_brochure.py" "C:\Users\nikol\Desktop\klarvis\docs\superpowers\plans\strada-build_brochure.py"
```

- [ ] **Step 2: Commit**

```powershell
cd C:\Users\nikol\Desktop\klarvis
git add docs/superpowers/plans/strada-build_brochure.py
git commit -m "feat: add Strada tri-fold brochure build script"
```
