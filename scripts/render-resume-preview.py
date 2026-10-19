"""Render page one of the resume PDF as the image the resume previews show.

The previews are a picture of the PDF rather than an embedded viewer, because
an iframe pointing at a PDF shows nothing on Android Chrome and in headless
browsers. A picture has to be redrawn whenever the PDF changes, or it shows an
old resume next to a download button for the new one, which is what happened
when this was a hand-made screenshot. The Pages workflow runs this before every
build, so the deployed image always matches the deployed PDF.

    pip install pymupdf pillow
    python scripts/render-resume-preview.py
"""

from pathlib import Path

import pymupdf
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "public/resume/resume.pdf"
OUTPUT = ROOT / "public/studio/resume-page.webp"
# The <Image> width and height in the previews are 900x1165, US Letter at 900
# pixels wide. Change them together.
WIDTH = 900

with pymupdf.open(SOURCE) as pdf:
    page = pdf[0]
    # Rendered at twice the target and scaled down, so the small type stays
    # legible rather than coming out as a grey smear.
    zoom = 2 * WIDTH / page.rect.width
    pix = page.get_pixmap(matrix=pymupdf.Matrix(zoom, zoom), alpha=False)

image = Image.frombytes("RGB", (pix.width, pix.height), pix.samples)
height = round(image.height * WIDTH / image.width)
image.resize((WIDTH, height), Image.LANCZOS).save(OUTPUT, "WEBP", quality=88)
print(f"{OUTPUT.relative_to(ROOT)}: {WIDTH}x{height} from {SOURCE.relative_to(ROOT)}")
