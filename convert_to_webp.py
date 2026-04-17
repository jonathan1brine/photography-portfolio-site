"""
convert_to_webp.py — Bulk convert gallery JPGs to WebP thumbnails.

Creates smaller WebP versions in images/{city}/thumbs/ for use in the
gallery grid view. Original JPGs are preserved and still used in the
modal lightbox for full-resolution viewing.

gallery.js automatically tries the WebP thumb first, then falls back to
the original JPG if the thumb doesn't exist yet.

Requirements:
    pip install Pillow

Usage:
    python convert_to_webp.py
"""

from PIL import Image
import os
import glob

# ── Config ────────────────────────────────────────────────────────────────────

CITIES = ['japan', 'sydney', 'melbourne', 'adelaide']

# Max width for gallery thumbnails. Height scales automatically.
# At 1200px wide, images look sharp in the 3-column masonry grid and
# are roughly 60-80% smaller than the 4000px originals.
THUMB_MAX_WIDTH = 1200

# WebP quality (0–100). 82 is a good balance of quality vs file size.
# For reference: 75 = smaller/slightly softer, 90 = larger/near-lossless.
WEBP_QUALITY = 82

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
IMAGES_DIR = os.path.join(BASE_DIR, 'images')


# ── Conversion ────────────────────────────────────────────────────────────────

def convert_city(city):
    city_dir = os.path.join(IMAGES_DIR, city)
    thumbs_dir = os.path.join(city_dir, 'thumbs')

    if not os.path.isdir(city_dir):
        print(f'  Skipping {city}/ — directory not found')
        return

    os.makedirs(thumbs_dir, exist_ok=True)

    # Match both .jpg and .JPG (Adelaide has uppercase extensions)
    jpg_paths = []
    for pattern in ('*.jpg', '*.JPG', '*.jpeg', '*.JPEG'):
        jpg_paths.extend(glob.glob(os.path.join(city_dir, pattern)))

    if not jpg_paths:
        print(f'  No JPGs found in {city}/')
        return

    converted = 0
    skipped = 0

    for jpg_path in sorted(jpg_paths):
        stem = os.path.splitext(os.path.basename(jpg_path))[0]
        webp_path = os.path.join(thumbs_dir, stem + '.webp')

        if os.path.exists(webp_path):
            skipped += 1
            continue

        try:
            with Image.open(jpg_path) as img:
                # Ensure we're in RGB mode (strips EXIF rotation issues too)
                img = img.convert('RGB')

                # Resize if wider than THUMB_MAX_WIDTH, preserving aspect ratio
                if img.width > THUMB_MAX_WIDTH:
                    ratio = THUMB_MAX_WIDTH / img.width
                    new_size = (THUMB_MAX_WIDTH, int(img.height * ratio))
                    img = img.resize(new_size, Image.LANCZOS)

                img.save(webp_path, 'WEBP', quality=WEBP_QUALITY)
                print(f'  {stem}.jpg -> thumbs/{stem}.webp  ({img.width}x{img.height})')
                converted += 1

        except Exception as e:
            print(f'  ERROR converting {stem}.jpg: {e}')

    print(f'  Done: {converted} converted, {skipped} already existed.\n')


# ── Main ──────────────────────────────────────────────────────────────────────

if __name__ == '__main__':
    print('Converting gallery images to WebP thumbnails...\n')

    for city in CITIES:
        print(f'{city}/')
        convert_city(city)

    print('All done!')
    print()
    print('WebP thumbnails are in images/{city}/thumbs/')
    print('The gallery will now serve these smaller files in the grid,')
    print('and still open the full-size JPGs in the lightbox modal.')
