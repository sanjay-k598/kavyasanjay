#!/usr/bin/env python3
"""Blend couple photo as soft fade into invitation cream background."""

from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

INVITATION = Path(
    "/Users/sanjaykumar/.cursor/projects/Users-sanjaykumar-Projects-wed/assets/"
    "WhatsApp_Image_2026-05-18_at_2.40.24_PM-0e0d82f6-a3d6-4bc4-9310-f62c18326369.png"
)
COUPLE = Path(
    "/Users/sanjaykumar/.cursor/projects/Users-sanjaykumar-Projects-wed/assets/"
    "kavyasanjay-a2780be7-cf4a-4ecb-9294-8e641899d03c.png"
)
OUTPUT = Path(__file__).resolve().parents[1] / "assets" / "invitation_with_couple_background.png"


def cover_resize(img: Image.Image, target_w: int, target_h: int) -> Image.Image:
    """Center-crop resize to fill target dimensions."""
    sw, sh = img.size
    scale = max(target_w / sw, target_h / sh)
    nw, nh = int(sw * scale), int(sh * scale)
    resized = img.resize((nw, nh), Image.Resampling.LANCZOS)
    left = (nw - target_w) // 2
    top = (nh - target_h) // 2
    return resized.crop((left, top, left + target_w, top + target_h))


def cream_background_mask(rgb: np.ndarray) -> np.ndarray:
    """Mask for parchment/cream areas (not text, gold, or saturated art)."""
    r = rgb[..., 0].astype(np.float32)
    g = rgb[..., 1].astype(np.float32)
    b = rgb[..., 2].astype(np.float32)
    lum = 0.299 * r + 0.587 * g + 0.114 * b
    mx = np.maximum(np.maximum(r, g), b)
    mn = np.minimum(np.minimum(r, g), b)
    sat = np.where(mx > 0, (mx - mn) / mx, 0.0)

    # Cream parchment: bright, low saturation, warm-neutral
    warm = (r >= g - 8) & (g >= b - 20)
    mask = (lum > 175) & (lum < 252) & (sat < 0.22) & warm
    return mask.astype(np.float32)


def radial_center_mask(h: int, w: int) -> np.ndarray:
    """Stronger blend in center behind names; softer at edges."""
    y = np.linspace(-1, 1, h)[:, None]
    x = np.linspace(-1, 1, w)[None, :]
    dist = np.sqrt(x * x + y * y * 0.85)
    # Peak ~0.55 at center, fade toward borders
    return np.clip(1.0 - dist * 0.55, 0.15, 1.0).astype(np.float32)


def main() -> None:
    inv = Image.open(INVITATION).convert("RGB")
    couple = Image.open(COUPLE).convert("RGB")
    w, h = inv.size

    bg = cover_resize(couple, w, h)
    # Slight upward shift so faces sit behind the names
    bg_arr = np.array(bg, dtype=np.float32)
    shift = int(h * 0.06)
    bg_arr_shifted = np.zeros_like(bg_arr)
    bg_arr_shifted[shift:, :, :] = bg_arr[: h - shift, :, :]
    bg_arr_shifted[:shift, :, :] = bg_arr[0:1, :, :]

    bg_img = Image.fromarray(bg_arr_shifted.astype(np.uint8))
    bg_img = bg_img.filter(ImageFilter.GaussianBlur(radius=1.2))

    # Warm, softened photo to match invitation palette
    bg_soft = np.array(bg_img, dtype=np.float32)
    cream_tint = np.array([245, 238, 225], dtype=np.float32)
    bg_soft = bg_soft * 0.72 + cream_tint * 0.28
    bg_soft = np.clip(bg_soft, 0, 255)

    inv_arr = np.array(inv, dtype=np.float32)
    cream = cream_background_mask(inv_arr.astype(np.uint8))
    radial = radial_center_mask(h, w)

    # Feather mask edges
    from PIL import Image as PILImage

    feather = PILImage.fromarray((cream * 255).astype(np.uint8))
    feather = feather.filter(ImageFilter.GaussianBlur(radius=6))
    cream_feather = np.array(feather, dtype=np.float32) / 255.0

    alpha = cream_feather * radial * 0.38
    alpha = np.clip(alpha, 0, 0.42)[..., None]

    result = inv_arr * (1.0 - alpha) + bg_soft * alpha
    result = np.clip(result, 0, 255).astype(np.uint8)

    out = Image.fromarray(result)
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    out.save(OUTPUT, quality=95)
    print(f"Saved: {OUTPUT} ({w}x{h})")


if __name__ == "__main__":
    main()
