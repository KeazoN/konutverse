/**
 * Gereken font alt kümelerini node_modules'tan public/fonts'a SABİT
 * adlarla kopyalar.
 *
 * Sabit ad şart: Astro hash'li ad üretir ve hash'li yola
 * <link rel="preload"> yazılamaz. Preload olmadan font ilk boyamadan
 * sonra gelir, metin yeniden sarar, sayfa zıplar (ölçülen CLS 0.104).
 *
 * Yalnızca Türkçe için gereken latin + latin-ext kopyalanır.
 */
import { copyFileSync, mkdirSync, existsSync } from 'node:fs';

const OUT = 'public/fonts';
mkdirSync(OUT, { recursive: true });

const FILES = [
  // Display — Bricolage Grotesque (wght ekseni; iri boyutta karakterli)
  ['@fontsource-variable/bricolage-grotesque/files/bricolage-grotesque-latin-wght-normal.woff2', 'display-latin.woff2'],
  ['@fontsource-variable/bricolage-grotesque/files/bricolage-grotesque-latin-ext-wght-normal.woff2', 'display-latin-ext.woff2'],
  // Gövde / arayüz — Schibsted Grotesk (metin boyutunda editoryal ve okunur)
  ['@fontsource-variable/schibsted-grotesk/files/schibsted-grotesk-latin-wght-normal.woff2', 'sans-latin.woff2'],
  ['@fontsource-variable/schibsted-grotesk/files/schibsted-grotesk-latin-ext-wght-normal.woff2', 'sans-latin-ext.woff2'],
  // Teknik katman — IBM Plex Mono
  ['@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-400-normal.woff2', 'mono-400-latin.woff2'],
  ['@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-ext-400-normal.woff2', 'mono-400-latin-ext.woff2'],
  ['@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-500-normal.woff2', 'mono-500-latin.woff2'],
  ['@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-ext-500-normal.woff2', 'mono-500-latin-ext.woff2'],
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
