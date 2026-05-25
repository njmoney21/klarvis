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
    os.makedirs(OUT, exist_ok=True)
    # PNG does not support CMYK — save as RGB at 300 DPI
    spread.save(os.path.join(OUT, f"{name}.png"), "PNG", dpi=(300, 300))
    # PDF supports CMYK
    spread.convert("CMYK").save(os.path.join(OUT, f"{name}.pdf"), "PDF", resolution=300)
    print(f"  {name}.png   {CANVAS_W}x{CANVAS_H}px  RGB   300dpi")
    print(f"  {name}.pdf   303x216mm  CMYK")


if __name__ == "__main__":
    print("Building inner spread...")
    make_spread(INNER_PANELS, "Inner_spread")
    print("Building outer spread...")
    make_spread(OUTER_PANELS, "Outer_spread")
    print(f"\nDone. Files saved to: {OUT}")
