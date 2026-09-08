/**
 * Gereken font alt kümelerini node_modules'tan public/fonts'a SABİT
 * adlarla kopyalar.
 *
 * Neden: Astro hash'li dosya adları üretir; sabit ad olmadan
 * <link rel="preload"> yazılamaz. Preload olmadan font ilk boyamadan
 * sonra geliyor, başlık yeniden sarıyor ve hero butonları zıplıyordu
 * (ölçülen CLS 0.108).
 *
 * Ayrıca yalnızca Türkçe için gereken alt kümeler kopyalanır:
 * vietnamese ve cyrillic hiç yayınlanmaz.
 */
import { copyFileSync, mkdirSync, existsSync } from 'node:fs';

const OUT = 'public/fonts';
mkdirSync(OUT, { recursive: true });

const FILES = [
  ['@fontsource-variable/archivo/files/archivo-latin-standard-normal.woff2', 'archivo-latin.woff2'],
  ['@fontsource-variable/archivo/files/archivo-latin-ext-standard-normal.woff2', 'archivo-latin-ext.woff2'],
  ['@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-400-normal.woff2', 'plex-mono-400-latin.woff2'],
  ['@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-ext-400-normal.woff2', 'plex-mono-400-latin-ext.woff2'],
  ['@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-500-normal.woff2', 'plex-mono-500-latin.woff2'],
  ['@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-ext-500-normal.woff2', 'plex-mono-500-latin-ext.woff2'],
];

for (const [from, to] of FILES) {
  const src = `node_modules/${from}`;
  if (!existsSync(src)) {
    console.error(`[font] BULUNAMADI: ${src}`);
    process.exit(1);
  }
  copyFileSync(src, `${OUT}/${to}`);
}

console.log(`[font] ${FILES.length} alt küme -> ${OUT}`);
