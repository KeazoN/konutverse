# -*- coding: utf-8 -*-
"""Uzun tam-sayfa ekran görüntüsünü şeritlere böler, yan yana dizer.

Neden: mobil tam-sayfa görüntü 400x4500. Tek parça bakınca her şey
küçülüyor. Şeritler yan yana konunca sayfanın tamamı okunur kalıyor.
"""
import sys
from PIL import Image

src, out = sys.argv[1], sys.argv[2]
band = int(sys.argv[3]) if len(sys.argv) > 3 else 1500
im = Image.open(src)
w, h = im.size
n = -(-h // band)
gap = 12
sheet = Image.new('RGB', (n * w + (n - 1) * gap, min(band, h)), (120, 120, 120))
for i in range(n):
    part = im.crop((0, i * band, w, min((i + 1) * band, h)))
    sheet.paste(part, (i * (w + gap), 0))
sheet.save(out, 'JPEG', quality=82)
print(out, sheet.size)
