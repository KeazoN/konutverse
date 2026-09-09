/**
 * Kaynak fotoğrafları responsive boyutlara indirger ve WebP üretir.
 *
 * NEDEN NODE: bu iş önce optimize-images.py idi ve Vercel'de HİÇ
 * çalışmadı — build Node ile koşuyor, Python/Pillow yok. Üretilen
 * dosyalar .gitignore'da olduğu için canlıda bütün görseller 404
 * verdi. Artık prebuild'de burası koşuyor: depo Python olmadan
 * build edilebiliyor ve üretilen hiçbir dosya git'e girmiyor.
 *
 * Neden küçültüyoruz: konutverse.com'dan alınan orijinaller 1920px
 * ve 250–700 KB. Mobilde LCP'yi bu yük belirliyor. Her görsel için
 * iki genişlik + WebP üretilir; şablonlar srcset ile doğru boyutu
 * indirir.
 *
 * Girdi : public/img/_src/<ad>.jpg   (orijinaller, git'te)
 * Çıktı : public/img/<ad>-<genişlik>.webp ve .jpg  (git'te DEĞİL)
 */
import { mkdirSync, existsSync, readdirSync, statSync } from 'node:fs';
import sharp from 'sharp';

const SRC = 'public/img/_src';
const OUT = 'public/img';

/**
 * Görseller EKRANDA GÖRÜNECEKLERİ ORANA kırpılır.
 * Dosya oranı ile CSS'in dayattığı oran farklı olunca Lighthouse
 * "yanlış en-boy oranı" uyarısı veriyordu; kaynakta kırpmak kökten
 * çözer. focusY dikey odak (0 üst, 1 alt).
 */
const PLAN = {
  // Masaüstü hero: geniş kadraj
  'hero-poster': { widths: [1600, 900], ratio: [16, 9], focusY: 0.5 },
  // Aynı fotoğrafın /search kartı için 3:2 kadrajı. Kart ızgarasında
  // bütün kartlar aynı oranda olmalı; 16:9 kart daha kısa çıkıp
  // komşusuyla hizasız duruyordu.
  'hero-card': { from: 'hero-poster', widths: [1000, 560], ratio: [3, 2], focusY: 0.5 },
  living: { widths: [1000, 560], ratio: [3, 2], focusY: 0.5 },
  kitchen: { widths: [1000, 560], ratio: [3, 2], focusY: 0.5 },
  bedroom: { widths: [1000, 560], ratio: [3, 2], focusY: 0.5 },
};

/** Hedef orana kırpma dikdörtgeni. Dikey hero kadrajında merkez
 *  kırpma boş duvarı alıyordu; odak aşağı çekilince oturma grubu
 *  kadraja giriyor. */
function cropBox(width, height, [rw, rh], focusY) {
  const target = rw / rh;
  const current = width / height;
  if (Math.abs(current - target) < 0.001) {
    return { left: 0, top: 0, width, height };
  }
  if (current > target) {
    // Çok geniş -> yanlardan kırp
    const w = Math.round(height * target);
    return { left: Math.round((width - w) / 2), top: 0, width: w, height };
  }
  // Çok uzun -> dikey kırp
  const h = Math.round(width / target);
  const top = Math.min(Math.max(Math.round((height - h) * focusY), 0), height - h);
  return { left: 0, top, width, height: h };
}

if (!existsSync(SRC)) {
  console.error(`[görsel] kaynak klasör yok: ${SRC}`);
  process.exit(1);
}

mkdirSync(OUT, { recursive: true });

let before = 0;
let after = 0;

for (const [name, { widths, ratio, focusY, from }] of Object.entries(PLAN)) {
  // `from`: aynı orijinalden farklı kadrajlı türev üretmek için.
  const srcPath = `${SRC}/${from ?? name}.jpg`;
  if (!existsSync(srcPath)) {
    console.error(`[görsel] BULUNAMADI: ${srcPath}`);
    process.exit(1);
  }

  before += statSync(srcPath).size;

  const base = sharp(srcPath);
  const meta = await base.metadata();
  const box = cropBox(meta.width, meta.height, ratio, focusY);

  for (const w of widths) {
    const h = Math.round((box.height * w) / box.width);
    // Her çıktı için taze bir pipeline: sharp örneği tekrar kullanılamaz.
    const pipeline = sharp(srcPath)
      .extract(box)
      .resize(w, h, { kernel: 'lanczos3' });

    await pipeline.clone().jpeg({ quality: 78, progressive: true }).toFile(`${OUT}/${name}-${w}.jpg`);
    await pipeline.clone().webp({ quality: 76, effort: 6 }).toFile(`${OUT}/${name}-${w}.webp`);

    const jpg = statSync(`${OUT}/${name}-${w}.jpg`).size;
    const webp = statSync(`${OUT}/${name}-${w}.webp`).size;
    after += jpg + webp;
    console.log(
      `  ${name}-${w}: jpg ${Math.round(jpg / 1024)}KB · webp ${Math.round(webp / 1024)}KB  (${w}x${h})`
    );
  }
}

const count = readdirSync(OUT).filter((f) => /-\d+\.(jpg|webp)$/.test(f)).length;
console.log(
  `[görsel] ${count} dosya -> ${OUT} · orijinal ${Math.round(before / 1024)} KB ` +
    `-> üretilen ${Math.round(after / 1024)} KB`
);
