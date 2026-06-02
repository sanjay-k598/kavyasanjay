#!/usr/bin/env python3
"""Generate a looping wedding-style green-screen intro MP4 (4K by default)."""

from __future__ import annotations

import math
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw

try:
    import imageio.v2 as imageio
except ImportError as exc:
    raise SystemExit("Install: pip install imageio imageio-ffmpeg pillow numpy") from exc

OUTPUT = Path(__file__).resolve().parents[1] / "assets" / "video" / "intro-greenscreen.mp4"
GREEN = (0, 255, 0)
GOLD = (201, 169, 98)
CREAM = (255, 248, 235)

# 4K; use --preview for faster 1280x720 test render
WIDTH = 3840
HEIGHT = 2160
FPS = 30
DURATION_SEC = 8


def lerp(a: float, b: float, t: float) -> float:
    return a + (b - a) * t


def draw_frame(t: float) -> np.ndarray:
    """Wedding template style: green field + gold frame + bokeh + sweep."""
    img = Image.new("RGB", (WIDTH, HEIGHT), GREEN)
    draw = ImageDraw.Draw(img, "RGBA")

    pulse = 0.5 + 0.5 * math.sin(t * math.pi * 2)
    margin = int(min(WIDTH, HEIGHT) * 0.08)
    border = int(8 + 4 * pulse)

    # Ornamental frame
    draw.rounded_rectangle(
        (margin, margin, WIDTH - margin, HEIGHT - margin),
        radius=int(margin * 0.35),
        outline=GOLD + (220,),
        width=border,
    )
    draw.rounded_rectangle(
        (margin + 24, margin + 24, WIDTH - margin - 24, HEIGHT - margin - 24),
        radius=int(margin * 0.3),
        outline=CREAM + (90,),
        width=3,
    )

    # Corner flourishes
    corner = int(margin * 1.4)
    for cx, cy in (
        (margin, margin),
        (WIDTH - margin, margin),
        (margin, HEIGHT - margin),
        (WIDTH - margin, HEIGHT - margin),
    ):
        draw.ellipse(
            (cx - corner, cy - corner, cx + corner, cy + corner),
            outline=GOLD + (160,),
            width=4,
        )

    # Floating bokeh
    for i in range(18):
        phase = t * (0.35 + i * 0.04) + i * 1.7
        x = (math.sin(phase) * 0.38 + 0.5) * WIDTH
        y = (math.cos(phase * 0.9) * 0.38 + 0.5) * HEIGHT
        r = int(lerp(28, 72, (math.sin(phase * 2) + 1) / 2))
        alpha = int(lerp(35, 110, (math.sin(phase * 3) + 1) / 2))
        color = (CREAM[0], CREAM[1], CREAM[2], alpha) if i % 2 else (GOLD[0], GOLD[1], GOLD[2], alpha)
        draw.ellipse((x - r, y - r, x + r, y + r), fill=color)

    # Light sweep
    sweep_x = int((t % 1.0) * (WIDTH + 400)) - 200
    sweep = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    sdraw = ImageDraw.Draw(sweep)
    sdraw.polygon(
        [
            (sweep_x, 0),
            (sweep_x + 180, 0),
            (sweep_x + 420, HEIGHT),
            (sweep_x + 120, HEIGHT),
        ],
        fill=(255, 255, 255, 38),
    )
    img = Image.alpha_composite(img.convert("RGBA"), sweep).convert("RGB")

    return np.array(img)


def main(preview: bool = False) -> None:
    global WIDTH, HEIGHT
    if preview:
        WIDTH, HEIGHT = 1280, 720

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    frames = FPS * DURATION_SEC
    writer = imageio.get_writer(
        OUTPUT,
        fps=FPS,
        codec="libx264",
        pixelformat="yuv420p",
        quality=9,
        macro_block_size=1,
    )

    print(f"Rendering {frames} frames at {WIDTH}x{HEIGHT}...")
    for i in range(frames):
        t = i / frames
        writer.append_data(draw_frame(t))
        if i % FPS == 0:
            print(f"  {i // FPS}s / {DURATION_SEC}s")

    writer.close()
    print(f"Saved: {OUTPUT}")


if __name__ == "__main__":
    import sys

    main(preview="--preview" in sys.argv)
