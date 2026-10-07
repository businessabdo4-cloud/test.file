"""Cut out the supplied Ray-Ban Meta Gen 2 images -> assets/rayban/products/ + public/rayban/products/."""
import json, pathlib, shutil, sys
from PIL import Image
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[2] / "scripts"))
from cutout_products import cutout  # noqa: E402

ROOT = pathlib.Path(__file__).resolve().parents[2]
src = ROOT / "assets" / "rayban" / "products" / "src"
dst = ROOT / "assets" / "rayban" / "products"
pub = ROOT / "public" / "rayban" / "products"
pub.mkdir(parents=True, exist_ok=True)
# key -> (source file, background colour)
IMAGES = {
    "headliner_front": ("headliner_gen2_front.png", (242, 242, 242)),
    "headliner_angle": ("headliner_gen2_angle.webp", None),
    "wayfarer_front": ("wayfarer_gen2_front.png", (242, 242, 242)),
    "wayfarer_angle": ("wayfarer_gen2_angle.webp", None),
}
manifest = {}
for key, (name, bg) in IMAGES.items():
    if not (src / name).exists():
        continue
    im = Image.open(src / name)
    if im.mode == "RGBA" and im.getextrema()[3][0] < 250:
        # already transparent: keep the supplied alpha, just crop to content
        im.crop(im.getchannel("A").point(lambda a: 255 if a > 8 else 0).getbbox()).save(dst / f"{key}.png")
    else:
        if bg is None:
            bg = tuple(int(v) for v in im.convert("RGB").getpixel((1, 1)))
        cutout(name, f"{key}.png", bg, tol=6, soft=14, src_dir=src, dst_dir=dst, hole_min_area=600)
    shutil.copy(dst / f"{key}.png", pub / f"{key}.png")
    w, h = Image.open(dst / f"{key}.png").size
    manifest[key] = {"src": f"rayban/products/{key}.png", "w": w, "h": h}
(ROOT / "public" / "rayban" / "data" / "products.json").write_text(json.dumps(manifest, indent=1) + "\n")
print(json.dumps(manifest))


# --- clean-up specific to these shots ---------------------------------------
# The glasses are black: the leftover floor reflection (front shots) and the white
# under-glow (angled Wayfarer) are light and low-saturation, so key them out by luminance.
import numpy as np  # noqa: E402


def luma_key(key, lo, hi, only_soft=False):
    p = dst / f"{key}.png"
    a = np.asarray(Image.open(p).convert("RGBA")).astype(np.float32)
    rgb, al = a[..., :3], a[..., 3] / 255
    lum = rgb @ np.array([0.2126, 0.7152, 0.0722], dtype=np.float32)
    k = np.clip((hi - lum) / (hi - lo), 0, 1)
    # keep small light details printed on the frame/lenses (logo script, markings): only key light
    # regions that are large or touch the image edge (floor reflection, glow)
    from scipy import ndimage
    lab, n = ndimage.label((k < 1) & (al > 0))
    if n:
        sizes = ndimage.sum(np.ones_like(k), lab, index=np.arange(1, n + 1))
        edge = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
        small = np.array([sizes[i - 1] < 400 and i not in edge for i in range(1, n + 1)])
        k = np.where(small[np.maximum(lab - 1, 0)] & (lab > 0), 1, k)
    if only_soft:  # leave the solid frame (incl. silver hinge details) untouched
        k = np.where(al > 0.9, 1, k)
    a[..., 3] = al * k * 255
    out = Image.fromarray(a.astype(np.uint8), "RGBA")
    out = out.crop(out.getchannel("A").point(lambda v: 255 if v > 8 else 0).getbbox())
    out.save(p)
    shutil.copy(p, pub / f"{key}.png")
    manifest[key].update(w=out.width, h=out.height)


luma_key("headliner_front", 105, 150)
luma_key("wayfarer_front", 105, 150)
luma_key("wayfarer_angle", 70, 140, only_soft=True)
(ROOT / "public" / "rayban" / "data" / "products.json").write_text(json.dumps(manifest, indent=1) + "\n")
print("cleaned", json.dumps(manifest))
