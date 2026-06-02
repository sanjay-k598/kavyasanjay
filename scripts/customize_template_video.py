#!/usr/bin/env python3
"""Burn Khambam's invitation + couple names into the Drive template video."""

from __future__ import annotations

from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont

try:
    import imageio.v2 as imageio
except ImportError as exc:
    raise SystemExit("pip install imageio imageio-ffmpeg pillow numpy") from exc

SRC = Path(__file__).resolve().parents[1] / "assets" / "video" / "template-source.mp4"
OUT = Path(__file__).resolve().parents[1] / "assets" / "video" / "intro-custom.mp4"

BRIDE = "Kavya"
GROOM = "Sanjay"
FAMILY_LINE = "Khambam's"
TITLE_WORD = "invitation"
GOLD = (232, 201, 118)
GOLD_EDGE = (61, 48, 16)
COVER = (18, 20, 26, 165)


def load_font(size: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates = [
        "/System/Library/Fonts/Supplemental/Georgia Bold.ttf",
        "/System/Library/Fonts/Supplemental/Times New Roman Bold.ttf",
        "/Library/Fonts/Arial Unicode.ttf",
    ]
    for path in candidates:
        if Path(path).exists():
            return ImageFont.truetype(path, size)
    return ImageFont.load_default()


def text_size(draw: ImageDraw.ImageDraw, text: str, font: ImageFont.FreeTypeFont) -> tuple[int, int]:
    box = draw.textbbox((0, 0), text, font=font)
    return box[2] - box[0], box[3] - box[1]


def draw_gold_text(
    draw: ImageDraw.ImageDraw,
    xy: tuple[float, float],
    text: str,
    font: ImageFont.FreeTypeFont,
    anchor: str = "mm",
) -> None:
    x, y = xy
    for dx, dy in [(-2, 0), (2, 0), (0, -2), (0, 2)]:
        draw.text((x + dx, y + dy), text, font=font, fill=GOLD_EDGE, anchor=anchor)
    draw.text(xy, text, font=font, fill=GOLD, anchor=anchor)


def cover_center_title(draw: ImageDraw.ImageDraw, w: int, h: int) -> None:
    """Hide template 'Wedding Invitation' text."""
    draw.rounded_rectangle(
        (int(w * 0.20), int(h * 0.33), int(w * 0.80), int(h * 0.60)),
        radius=18,
        fill=COVER,
    )


def cover_name_section(draw: ImageDraw.ImageDraw, w: int, h: int) -> None:
    """Hide template labels and placeholders around &."""
    draw.rounded_rectangle(
        (int(w * 0.30), int(h * 0.38), int(w * 0.70), int(h * 0.58)),
        radius=14,
        fill=COVER,
    )
    draw.rounded_rectangle(
        (int(w * 0.32), int(h * 0.08), int(w * 0.68), int(h * 0.22)),
        radius=10,
        fill=COVER,
    )


def draw_invitation_title(draw: ImageDraw.ImageDraw, w: int, h: int) -> None:
    cx = w / 2
    cy = h * 0.465
    family_font = load_font(40)
    title_font = load_font(88)

    fw, fh = text_size(draw, FAMILY_LINE, family_font)
    tw, th = text_size(draw, TITLE_WORD, title_font)
    gap = 10
    total_h = fh + gap + th
    y0 = cy - total_h / 2

    draw_gold_text(draw, (cx, y0 + fh / 2), FAMILY_LINE, family_font)
    draw_gold_text(draw, (cx, y0 + fh + gap + th / 2), TITLE_WORD, title_font)


def draw_couple_names(draw: ImageDraw.ImageDraw, w: int, h: int) -> None:
    cx = w / 2
    cy = h * 0.485
    name_font = load_font(58)
    ampersand_gap = 72

    bw, _ = text_size(draw, BRIDE, name_font)
    gw, _ = text_size(draw, GROOM, name_font)
    draw_gold_text(draw, (cx - ampersand_gap - bw / 2, cy), BRIDE, name_font)
    draw_gold_text(draw, (cx + ampersand_gap + gw / 2, cy), GROOM, name_font)


def customize_frame(img: Image.Image, t: float) -> Image.Image:
    frame = img.convert("RGBA")
    overlay = Image.new("RGBA", frame.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    w, h = frame.size

    if 4.0 <= t <= 24.0:
        cover_center_title(draw, w, h)
        draw_invitation_title(draw, w, h)

    if 34.0 <= t <= 74.0:
        cover_name_section(draw, w, h)
        draw_couple_names(draw, w, h)

    return Image.alpha_composite(frame, overlay).convert("RGB")


def main() -> None:
    reader = imageio.get_reader(SRC)
    meta = reader.get_meta_data()
    fps = meta.get("fps") or 24
    writer = imageio.get_writer(OUT, fps=fps, codec="libx264", quality=8, pixelformat="yuv420p")

    print(f"Customizing {SRC.name} -> {OUT.name}")
    for i, frame in enumerate(reader):
        t = i / fps
        out = customize_frame(Image.fromarray(frame), t)
        writer.append_data(np.array(out))
        if i % int(fps * 5) == 0:
            print(f"  {t:.0f}s")

    writer.close()
    print(f"Saved: {OUT}")


if __name__ == "__main__":
    main()
