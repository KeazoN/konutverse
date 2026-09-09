# -*- coding: utf-8 -*-
"""
Kaynak fotoğrafları responsive boyutlara indirger ve WebP üretir.

Neden: konutverse.com'dan alınan orijinaller 1920px ve 250–700 KB.
Mobilde LCP'yi bu yük belirliyor. Her görsel için iki genişlik +
WebP üretilir; şablonlar srcset ile doğru boyutu indirir.

Girdi : public/img/_src/*.jpg   (orijinaller)
Çıktı : public/img/<ad>-<genişlik>.webp ve .jpg
"""
import io, os, sys
from PIL import Image

SRC = 'public/img/_src'
OUT = 'public/img'

# Görseller EKRANDA GÖRÜNECEKLERİ ORANA kırpılır.
# Dosya oranı ile CSS'in dayattığı oran farklı olunca Lighthouse
# "yanlış en-boy oranı" uyarısı veriyordu; kaynakta kırpmak kökten çözer.
# (genişlikler, oran)
PLAN = {
    # Masaüstü hero: geniş kadraj
    'hero-poster':     ([1600, 900], (16, 9), 0.5),
    'living':          ([1000, 560], (3, 2), 0.5),
    'kitchen':         ([1000, 560], (3, 2), 0.5),
    'bedroom':         ([1000, 560], (3, 2), 0.5),
}


def crop_to(im, ratio, focus_y=0.5):
    """Hedef orana kırpar. focus_y dikey odak (0 üst, 1 alt).

    Dikey hero kadrajında merkez kırpma boş duvarı alıyordu; odak
    aşağı çekilince oturma grubu kadraja giriyor.
    """
    rw, rh = ratio
    target = rw / rh
    cur = im.width / im.height
    if abs(cur - target) < 0.001:
        return im
    if cur > target:                      # çok geniş -> yanlardan kırp
        w = round(im.height * target)
        x = (im.width - w) // 2
        return im.crop((x, 0, x + w, im.height))
    h = round(im.width / target)          # çok uzun -> dikey kırp
    y = round((im.height - h) * focus_y)
    y = max(0, min(y, im.height - h))
    return im.crop((0, y, im.width, y + h))

if not os.path.isdir(SRC):
    print(f'kaynak klasör yok: {SRC}', file=sys.stderr)
    sys.exit(1)

total_before = 0
total_after = 0

for name, (widths, ratio, focus) in PLAN.items():
    # '-tall' türevleri aynı kaynaktan üretilir
    base = name.replace('-tall', '')
    src_path = os.path.join(SRC, f'{base}.jpg')
    if not os.path.exists(src_path):
        print(f'  ATLANDI (yok): {src_path}')
        continue

    total_before += os.path.getsize(src_path)
    im = crop_to(Image.open(src_path).convert('RGB'), ratio, focus)

    for w in widths:
        h = round(im.height * w / im.width)
        resized = im.resize((w, h), Image.LANCZOS)

        jpg = os.path.join(OUT, f'{name}-{w}.jpg')
        webp = os.path.join(OUT, f'{name}-{w}.webp')
        resized.save(jpg, 'JPEG', quality=78, optimize=True, progressive=True)
        resized.save(webp, 'WEBP', quality=76, method=6)

        total_after += os.path.getsize(jpg) + os.path.getsize(webp)
        print(f'  {name}-{w}: jpg {os.path.getsize(jpg)//1024}KB · '
              f'webp {os.path.getsize(webp)//1024}KB  ({w}x{h})')

print()
print(f'orijinal toplam : {total_before // 1024} KB')
print(f'üretilen toplam : {total_after // 1024} KB (tüm boyutlar+formatlar)')
