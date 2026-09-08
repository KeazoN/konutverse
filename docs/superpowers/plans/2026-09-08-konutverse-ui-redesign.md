# Konutverse UI/UX Yeniden Tasarımı — Uygulama Planı

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Konutverse'ün 8 sayfalık pazarlama + ürün kabuğu arayüzünü "Plandan Mekâna" sanat yönüyle Astro'da yeniden inşa etmek ve Alis Dijital için portatif bir ajans imza sistemi üretmek.

**Architecture:** Astro statik çıktı, varsayılan sıfır JS. Tüm tasarım değerleri tek bir `tokens.css` dosyasında; tüm Türkçe metin tek bir `site.ts` dosyasında. Ağır hareket (GSAP ScrollTrigger) yalnızca ana sayfaya yüklenir. İmza sistemi host'a bağımsız, framework'süz çalışabilen ayrı bir modül olarak paketlenir.

**Tech Stack:** Astro 5 · TypeScript · Vitest · linkedom · GSAP ScrollTrigger · Lenis · Fontsource (Archivo / IBM Plex Mono / Inter)

**Spec:** `docs/superpowers/specs/2026-09-08-konutverse-ui-redesign-design.md`

## Global Constraints

Bu bölüm her task'ın gereksinimlerine örtük olarak dahildir.

- **Node ≥ 20.** Astro 5 gereği.
- **URL'ler değişmez.** Rotalar tam olarak: `/`, `/features`, `/pricing`, `/about`, `/contact`, `/search`, `/demo`, `/kunye`. Türkçeleştirilmez.
- **Metin birebir korunur.** Canlı `konutverse.com`daki Türkçe metin değiştirilmez. Yalnızca yeni teknik etiketler (kot değerleri, pafta numaraları, durum etiketleri) eklenir.
- **Ham değer yasağı.** `src/styles/tokens.css` ve `src/components/signature/signature.css` dışında hiçbir dosyada ham hex rengi, ham `px` tipografi boyutu veya ham `cubic-bezier` bulunamaz. Her şey `var(--token)` okur. Bu Task 2'de otomatik test edilir.
- **Metin tek kaynak.** `src/content/site.ts` ve `src/content/projects.ts` dışında `.astro` şablonlarında sabit Türkçe cümle bulunamaz. (Tek istisna: `aria-label` ve `alt` metinleri bileşen prop'u olarak geçer.)
- **Kontrast politikası.** Koyu zemin (`--ink`, `--ink-deep`) üzerinde 24px altı hiçbir metin `--brick` (#C23616) kullanamaz; `--brick-lit` (#ED5A34) kullanır. Task 2'de test edilir.
- **Köşe yarıçapı.** Yapısal öğeler `0`, kontroller `2px`, yalnızca durum çipleri `999px`.
- **JS bütçesi (gzip).** `/` ≤ 80 KB, diğer tüm sayfalar ≤ 20 KB. Task 18'de ölçülür.
- **Reduced motion.** Her animasyonlu bileşen `prefers-reduced-motion: reduce` altında tam içerikle, hareketsiz çalışmak zorundadır.
- **Sahte ürün yasağı.** 360° görüntüleyici taklidi üretilmez (spec §7.7).
- **Git.** Depo başlangıçta yok. Task 1 Adım 1'de `git init` yapılır — bu adım kullanıcı onayı gerektirir; onay yoksa commit adımları atlanır ve plan geri kalanında dosya değişiklikleri commit'siz ilerler.

---

## Dosya Yapısı

```
konutverse.com/
├── astro.config.mjs                 Astro yapılandırması, static output
├── vitest.config.ts                 Test yapılandırması
├── package.json
├── tsconfig.json
├── public/
│   ├── humans.txt                   Ajans künyesi, düz metin
│   └── img/                         İç mekân fotoğrafları (AVIF/WebP)
├── tests/
│   ├── contrast.test.ts             Kontrast matematiği + palet politikası
│   ├── tokens.test.ts               Token varlığı + ham değer yasağı
│   ├── content.test.ts              İçerik şeması bütünlüğü
│   ├── pages.test.ts                Built HTML sözleşmeleri (h1, meta, link)
│   └── signature.test.ts            Web component framework'süz çalışıyor mu
└── src/
    ├── lib/
    │   └── contrast.ts              WCAG kontrast hesabı (test edilebilir saf fonksiyon)
    ├── styles/
    │   ├── tokens.css               TEK KAYNAK: renk, tipografi, uzay, hareket
    │   ├── base.css                 Reset, tipografi uygulaması, focus stilleri
    │   └── utilities.css            Grid, kot rayı, teknik grid yardımcıları
    ├── layouts/
    │   └── Base.astro               <head>, meta, JSON-LD, font preload, chrome
    ├── content/
    │   ├── site.ts                  TÜM Türkçe metin
    │   └── projects.ts              Gerçek proje verisi (ERSA)
    ├── components/
    │   ├── site/
    │   │   ├── Header.astro
    │   │   ├── Nav.astro
    │   │   ├── Footer.astro
    │   │   ├── KotRayi.astro        Sol kot rayı / mobil ilerleme rayı
    │   │   └── TechCaption.astro    Mono teknik künye şeridi
    │   ├── ui/
    │   │   ├── Button.astro
    │   │   ├── StatusChip.astro
    │   │   ├── SheetLabel.astro     Pafta etiketi (dikdörtgen, mono)
    │   │   ├── SheetRule.astro      Saç teli kural + pafta numarası
    │   │   ├── Field.astro
    │   │   ├── Accordion.astro
    │   │   └── Metric.astro
    │   ├── viz/
    │   │   ├── BuildingSection.astro    Hero SVG bina kesiti
    │   │   ├── ElevationStack.astro     /demo dikey cephe
    │   │   ├── AvailabilityGrid.astro   Kat içi daire hücreleri
    │   │   └── ProgressGauge.astro      "Boya %75" teknik gösterge
    │   └── signature/
    │       ├── credits.ts           Künye verisi — TEK KAYNAK
    │       ├── MakerMark.astro      Katman 1
    │       ├── Colophon.astro       Katman 2 gövdesi
    │       ├── signature.css        Kendi scoped token'ları
    │       ├── signature.js         Katman 4 — web component
    │       └── README.md            Taşıma talimatı
    ├── scripts/
    │   ├── lenis-init.ts
    │   ├── reveal.ts                IntersectionObserver giriş animasyonları
    │   ├── kesit-scrub.ts           SADECE ana sayfa — GSAP ScrollTrigger
    │   └── console-signature.ts     Katman 3
    └── pages/
        ├── index.astro
        ├── features.astro
        ├── pricing.astro
        ├── about.astro
        ├── contact.astro
        ├── search.astro
        ├── demo.astro
        └── kunye.astro
```

---

## Task 1: Proje iskeleti ve test altyapısı

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `vitest.config.ts`, `.gitignore`
- Create: `src/pages/index.astro` (geçici iskelet)
- Test: `tests/pages.test.ts`

**Interfaces:**
- Consumes: yok
- Produces: `npm run build` → `dist/`; `npm test` → Vitest; `npm run verify` → build + test

- [ ] **Step 1: Depoyu başlat (kullanıcı onayı gerekir)**

```bash
cd "konutverse.com"
git init
```

Kullanıcı `git init`'i onaylamazsa bu adımı ve tüm sonraki `git commit` adımlarını atla; plan geri kalanı aynen ilerler.

- [ ] **Step 2: Bağımlılıkları kur**

```bash
npm init -y
npm install astro
npm install -D vitest linkedom typescript @types/node
```

- [ ] **Step 3: Yapılandırma dosyalarını yaz**

`package.json` scripts bloğu:
```json
{
  "type": "module",
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "test": "vitest run",
    "verify": "npm run build && npm run test"
  }
}
```

`astro.config.mjs`:
```js
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://www.konutverse.com',
  output: 'static',
  build: { inlineStylesheets: 'auto' },
});
```

`vitest.config.ts`:
```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: { environment: 'node', include: ['tests/**/*.test.ts'] },
});
```

`.gitignore`:
```
node_modules/
dist/
.astro/
```

- [ ] **Step 4: Başarısız testi yaz**

`tests/pages.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';

const DIST = 'dist';

describe('build çıktısı', () => {
  it('ana sayfayı üretir', () => {
    expect(existsSync(`${DIST}/index.html`)).toBe(true);
  });

  it('dili Türkçe olarak işaretler', () => {
    const html = readFileSync(`${DIST}/index.html`, 'utf8');
    expect(html).toContain('lang="tr"');
  });
});
```

- [ ] **Step 5: Testi çalıştır, başarısız olduğunu doğrula**

Run: `npm test`
Expected: FAIL — `dist/index.html` yok.

- [ ] **Step 6: Minimum sayfayı yaz**

`src/pages/index.astro`:
```astro
---
---
<!doctype html>
<html lang="tr">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Konutverse</title>
  </head>
  <body></body>
</html>
```

- [ ] **Step 7: Build al ve testi çalıştır**

Run: `npm run verify`
Expected: build başarılı, 2 test PASS.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "chore: Astro iskeleti ve test altyapısı"
```

---

## Task 2: Tasarım token'ları ve kontrast politikası

**Files:**
- Create: `src/lib/contrast.ts`, `src/styles/tokens.css`
- Test: `tests/contrast.test.ts`, `tests/tokens.test.ts`

**Interfaces:**
- Consumes: Task 1 test altyapısı
- Produces:
  - `hexToRgb(hex: string): { r: number; g: number; b: number }`
  - `relativeLuminance(hex: string): number`
  - `contrastRatio(a: string, b: string): number`
  - `src/styles/tokens.css` — sonraki tüm task'ların okuduğu tek token kaynağı

- [ ] **Step 1: Kontrast testini yaz**

`tests/contrast.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { contrastRatio } from '../src/lib/contrast';

const INK = '#0F1B33';
const INK_DEEP = '#0A1222';
const CHALK = '#F7F8FA';
const BRICK = '#C23616';
const BRICK_LIT = '#ED5A34';

describe('WCAG kontrast matematiği', () => {
  it('siyah/beyaz için 21:1 verir', () => {
    expect(contrastRatio('#FFFFFF', '#000000')).toBeCloseTo(21, 2);
  });

  it('aynı renk için 1:1 verir', () => {
    expect(contrastRatio(INK, INK)).toBeCloseTo(1, 5);
  });

  it('sıralamadan bağımsızdır', () => {
    expect(contrastRatio(CHALK, INK)).toBeCloseTo(contrastRatio(INK, CHALK), 5);
  });
});

describe('palet politikası', () => {
  it('brick küçük metin için lacivert üstünde YETERSİZ — iki tonlu kuralın gerekçesi', () => {
    const r = contrastRatio(BRICK, INK);
    expect(r).toBeLessThan(4.5);
    expect(r).toBeGreaterThanOrEqual(3.0); // büyük metin ve grafik için geçerli
  });

  it('brick-lit küçük metin için AA geçer', () => {
    expect(contrastRatio(BRICK_LIT, INK)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(BRICK_LIT, INK_DEEP)).toBeGreaterThanOrEqual(4.5);
  });

  it('chalk lacivert üstünde AAA geçer', () => {
    expect(contrastRatio(CHALK, INK)).toBeGreaterThanOrEqual(7);
    expect(contrastRatio(CHALK, INK_DEEP)).toBeGreaterThanOrEqual(7);
  });
});
```

- [ ] **Step 2: Testi çalıştır, başarısız olduğunu doğrula**

Run: `npx vitest run tests/contrast.test.ts`
Expected: FAIL — `src/lib/contrast` modülü yok.

- [ ] **Step 3: Kontrast modülünü yaz**

`src/lib/contrast.ts`:
```ts
export type RGB = { r: number; g: number; b: number };

export function hexToRgb(hex: string): RGB {
  const h = hex.replace('#', '').trim();
  if (!/^[0-9a-fA-F]{6}$/.test(h)) {
    throw new Error(`Geçersiz hex: ${hex}`);
  }
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

function channel(value: number): number {
  const s = value / 255;
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

export function relativeLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const hi = Math.max(la, lb);
  const lo = Math.min(la, lb);
  return (hi + 0.05) / (lo + 0.05);
}
```

- [ ] **Step 4: Testi çalıştır, geçtiğini doğrula**

Run: `npx vitest run tests/contrast.test.ts`
Expected: 6 test PASS.

Bir politika testi başarısız olursa palet spec'e uymuyordur — **kodu değil paleti düzelt** ve spec §5.2'yi gerçek değerle güncelle.

- [ ] **Step 5: Gerçek oranları ölç ve spec'i doğrula**

Run:
```bash
node --input-type=module -e "
import { contrastRatio } from './src/lib/contrast.ts';
" 2>/dev/null || npx vitest run tests/contrast.test.ts --reporter=verbose
```

Basitçe geçici bir test ile üç oranı yazdır ve spec §5.2 tablosundaki değerlerle karşılaştır (3.13 / 4.99 / ~16.1). Sapma varsa spec'teki sayıyı ölçülen değerle güncelle. Bu bir spec düzeltmesidir, hata değil.

- [ ] **Step 6: Token testini yaz**

`tests/tokens.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const tokens = readFileSync('src/styles/tokens.css', 'utf8');

const REQUIRED = [
  '--ink', '--ink-deep', '--ink-raised', '--chalk', '--paper', '--plaster',
  '--brick', '--brick-lit', '--line', '--line-dark',
  '--avail-free', '--avail-sold', '--avail-reserved',
  '--t-display-xl', '--t-display', '--t-h1', '--t-h2', '--t-h3',
  '--t-body', '--t-small', '--t-tech',
  '--font-display', '--font-tech', '--font-body',
  '--radius-structural', '--radius-control', '--radius-pill',
  '--ease', '--dur-fast', '--dur-base', '--dur-draw',
];

describe('tokens.css', () => {
  for (const name of REQUIRED) {
    it(`${name} tanımlı`, () => {
      expect(tokens).toMatch(new RegExp(`${name}\\s*:`));
    });
  }

  it('yapısal yarıçap sıfır', () => {
    expect(tokens).toMatch(/--radius-structural\s*:\s*0/);
  });
});

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

describe('ham değer yasağı', () => {
  // tokens.css ve signature.css kendi değerlerini tanımlamakta serbesttir.
  const EXEMPT = ['src/styles/tokens.css', 'src/components/signature/signature.css'];

  const files = walk('src').filter(
    (f) => /\.(css|astro)$/.test(f) && !EXEMPT.some((e) => f.replace(/\\/g, '/').endsWith(e))
  );

  for (const file of files) {
    it(`${file} ham hex rengi içermiyor`, () => {
      const source = readFileSync(file, 'utf8');
      // SVG currentColor ve none dışında hex yasak
      const hexes = source.match(/#[0-9a-fA-F]{6}\b/g) ?? [];
      expect(hexes).toEqual([]);
    });
  }
});
```

- [ ] **Step 7: Testi çalıştır, başarısız olduğunu doğrula**

Run: `npx vitest run tests/tokens.test.ts`
Expected: FAIL — `tokens.css` yok.

- [ ] **Step 8: tokens.css'i yaz**

`src/styles/tokens.css` — spec §5.1, §5.2, §5.3, §5.4, §5.5'in tamamı:
```css
:root {
  /* ── Renk — hepsi mevcut Konutverse paletinden türetildi ───────── */
  --ink:        #0F1B33;
  --ink-deep:   #0A1222;
  --ink-raised: #182A4A;
  --chalk:      #F7F8FA;
  --paper:      #FFFFFF;
  --plaster:    #E6E1D6;
  --brick:      #C23616;   /* ≥24px metin, grafik, çizgi. Küçük metin YASAK. */
  --brick-lit:  #ED5A34;   /* koyu zemin üstü küçük metin — AA ✓ */
  --line:       rgba(255, 255, 255, 0.14);
  --line-dark:  rgba(22, 32, 58, 0.12);

  --avail-free:     #5B7DB1;
  --avail-sold:     #C6443A;
  --avail-reserved: #CE7C1B;

  /* ── Tipografi ─────────────────────────────────────────────────── */
  --font-display: "Archivo Variable", "Archivo", system-ui, sans-serif;
  --font-tech:    "IBM Plex Mono", ui-monospace, monospace;
  --font-body:    "Inter Variable", "Inter", system-ui, sans-serif;

  --t-display-xl: clamp(48px, 9vw, 148px);
  --t-display:    clamp(38px, 5.5vw, 84px);
  --t-h1:         clamp(30px, 3.6vw, 54px);
  --t-h2:         clamp(23px, 2.4vw, 34px);
  --t-h3:         19px;
  --t-body:       17px;
  --t-small:      15px;
  --t-tech:       12px;

  --lh-display: 0.98;
  --lh-body:    1.65;
  --ls-display: -0.03em;
  --ls-tech:    0.08em;
  --wdth-display: 112;

  /* ── Form ──────────────────────────────────────────────────────── */
  --radius-structural: 0;
  --radius-control:    2px;
  --radius-pill:       999px;
  --hairline: 1px;

  /* ── Uzay ──────────────────────────────────────────────────────── */
  --s-1: 4px;   --s-2: 8px;   --s-3: 12px;  --s-4: 16px;
  --s-6: 24px;  --s-8: 32px;  --s-12: 48px; --s-16: 64px;
  --s-24: 96px; --s-32: 128px; --s-48: 192px;

  --max-w: 1440px;
  --gutter: 24px;
  --rail-w: 72px;

  /* ── Hareket ───────────────────────────────────────────────────── */
  --ease:     cubic-bezier(0.22, 1, 0.36, 1);
  --dur-fast: 220ms;
  --dur-base: 400ms;
  --dur-draw: 900ms;
}

@media (max-width: 768px) {
  :root { --gutter: 16px; }
}

@media (prefers-reduced-motion: reduce) {
  :root { --dur-fast: 0ms; --dur-base: 0ms; --dur-draw: 0ms; }
}
```

- [ ] **Step 9: Testleri çalıştır**

Run: `npm test`
Expected: tüm testler PASS.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "feat: tasarım token'ları ve kontrast politikası testleri"
```

---

## Task 3: Base layout, tipografi ve font yükleme

**Files:**
- Create: `src/styles/base.css`, `src/styles/utilities.css`, `src/layouts/Base.astro`
- Modify: `src/pages/index.astro`
- Test: `tests/pages.test.ts` (genişletilir)

**Interfaces:**
- Consumes: `src/styles/tokens.css`
- Produces: `Base.astro` — props: `{ title: string; description: string; route: string; heavy?: boolean }`. `heavy: true` yalnızca ana sayfada GSAP yüklenmesini tetikler.

- [ ] **Step 1: Fontları kur**

```bash
npm install @fontsource-variable/archivo @fontsource/ibm-plex-mono @fontsource-variable/inter
```

Kurulum başarısız olursa spec §5.1 "Yedek plan"a geç (Google Fonts CDN + preconnect) ve bunu sapma olarak raporla.

- [ ] **Step 2: Layout sözleşmesi testini yaz**

`tests/pages.test.ts` içine ekle:
```ts
import { parseHTML } from 'linkedom';

const ROUTES = ['index'];

describe('layout sözleşmesi', () => {
  for (const route of ROUTES) {
    const html = readFileSync(`dist/${route === 'index' ? 'index' : route + '/index'}.html`, 'utf8');
    const { document } = parseHTML(html);

    it(`${route}: tek h1 var`, () => {
      expect(document.querySelectorAll('h1').length).toBe(1);
    });

    it(`${route}: title ve description dolu`, () => {
      expect(document.querySelector('title')?.textContent?.trim().length).toBeGreaterThan(0);
      const desc = document.querySelector('meta[name="description"]');
      expect(desc?.getAttribute('content')?.trim().length).toBeGreaterThan(0);
    });

    it(`${route}: viewport meta var`, () => {
      expect(document.querySelector('meta[name="viewport"]')).toBeTruthy();
    });
  }
});
```

- [ ] **Step 3: Testi çalıştır, başarısız olduğunu doğrula**

Run: `npm run verify`
Expected: FAIL — h1 yok, description yok.

- [ ] **Step 4: base.css'i yaz**

`src/styles/base.css`:
```css
*, *::before, *::after { box-sizing: border-box; }

html { -webkit-text-size-adjust: 100%; }

body {
  margin: 0;
  background: var(--chalk);
  color: var(--ink);
  font-family: var(--font-body);
  font-size: var(--t-body);
  line-height: var(--lh-body);
  -webkit-font-smoothing: antialiased;
}

h1, h2, h3 {
  font-family: var(--font-display);
  font-variation-settings: "wdth" var(--wdth-display), "wght" 600;
  line-height: var(--lh-display);
  letter-spacing: var(--ls-display);
  margin: 0;
  text-wrap: balance;
}

h1 { font-size: var(--t-h1); }
h2 { font-size: var(--t-h2); }
h3 { font-size: var(--t-h3); font-variation-settings: "wdth" 100, "wght" 600; }

p { margin: 0; max-width: 68ch; }

.tech {
  font-family: var(--font-tech);
  font-size: var(--t-tech);
  text-transform: uppercase;
  letter-spacing: var(--ls-tech);
  font-feature-settings: "tnum" 1;
}

a { color: inherit; }

:focus-visible {
  outline: 2px solid var(--brick-lit);
  outline-offset: 2px;
  border-radius: var(--radius-control);
}

img, svg { display: block; max-width: 100%; }

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
    scroll-behavior: auto !important;
  }
}
```

- [ ] **Step 5: utilities.css'i yaz**

`src/styles/utilities.css`:
```css
.shell {
  max-width: var(--max-w);
  margin-inline: auto;
  padding-inline: var(--gutter);
}

/* Kot rayı için sol boşluk — desktop */
@media (min-width: 1024px) {
  .shell-railed { padding-left: calc(var(--rail-w) + var(--gutter)); }
}

/* Görünür teknik grid */
.grid-12 {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: var(--gutter);
}
@media (max-width: 768px) {
  .grid-12 { grid-template-columns: repeat(4, 1fr); }
}

.rule {
  border: 0;
  border-top: var(--hairline) solid var(--line-dark);
  margin: 0;
}
.on-dark .rule { border-top-color: var(--line); }

.on-dark { background: var(--ink); color: var(--chalk); }
.on-dark-deep { background: var(--ink-deep); color: var(--chalk); }

/* Giriş animasyonu — reveal.ts tarafından tetiklenir */
.reveal { opacity: 0; transform: translateY(16px); }
.reveal.is-in {
  opacity: 1;
  transform: none;
  transition: opacity var(--dur-base) var(--ease), transform var(--dur-base) var(--ease);
}
@media (prefers-reduced-motion: reduce) {
  .reveal { opacity: 1; transform: none; }
}
```

- [ ] **Step 6: Base.astro'yu yaz**

`src/layouts/Base.astro`:
```astro
---
import '@fontsource-variable/archivo';
import '@fontsource/ibm-plex-mono/400.css';
import '@fontsource/ibm-plex-mono/500.css';
import '@fontsource-variable/inter';
import '../styles/tokens.css';
import '../styles/base.css';
import '../styles/utilities.css';

interface Props {
  title: string;
  description: string;
  route: string;
  heavy?: boolean;
}
const { title, description, route, heavy = false } = Astro.props;
const canonical = new URL(route, Astro.site).href;
---
<!doctype html>
<html lang="tr">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title}</title>
    <meta name="description" content={description} />
    <link rel="canonical" href={canonical} />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:locale" content="tr_TR" />
    <meta property="og:type" content="website" />
    <slot name="head" />
  </head>
  <body>
    <slot />
    <script>
      import '../scripts/reveal.ts';
      import '../scripts/lenis-init.ts';
    </script>
    {heavy && <script>import '../scripts/kesit-scrub.ts';</script>}
  </body>
</html>
```

- [ ] **Step 7: reveal.ts ve lenis-init.ts'i yaz**

```bash
npm install lenis
```

`src/scripts/reveal.ts`:
```ts
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!reduce) {
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      }
    },
    { rootMargin: '0px 0px -12% 0px' }
  );
  document.querySelectorAll('.reveal').forEach((el) => io.observe(el));
} else {
  document.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-in'));
}
```

`src/scripts/lenis-init.ts`:
```ts
import Lenis from 'lenis';

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!reduce) {
  const lenis = new Lenis({ duration: 1.1, smoothWheel: true });
  const raf = (time: number) => {
    lenis.raf(time);
    requestAnimationFrame(raf);
  };
  requestAnimationFrame(raf);
  // Anchor navigasyonu ve klavye erişilebilirliği korunur
  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const target = document.querySelector(a.getAttribute('href')!);
      if (target) { e.preventDefault(); lenis.scrollTo(target as HTMLElement); }
    });
  });
}
```

- [ ] **Step 8: index.astro'yu layout'a taşı**

```astro
---
import Base from '../layouts/Base.astro';
---
<Base title="Konutverse" description="Emlak ve inşaat firmaları için 360° sanal daire turu." route="/">
  <h1>Konutverse</h1>
</Base>
```

- [ ] **Step 9: Doğrula ve commit**

Run: `npm run verify`
Expected: tüm testler PASS.

```bash
git add -A
git commit -m "feat: base layout, tipografi sistemi ve font yükleme"
```

---

## Task 4: İçerik tek kaynağı

**Files:**
- Create: `src/content/site.ts`, `src/content/projects.ts`
- Test: `tests/content.test.ts`

**Interfaces:**
- Produces:
  - `site.nav: { label: string; href: string }[]`
  - `site.home: { hero: { title: string[]; body: string; cta: string }, capabilities: Capability[], status: {...}, steps: Step[] }`
  - `site.features`, `site.pricing`, `site.about`, `site.contact`, `site.footer`
  - `type Project = { slug, firm, name, district, city, priceFrom, stage, stagePct, floors, units, tourable }`
  - `projects: Project[]`

- [ ] **Step 1: İçerik testini yaz**

`tests/content.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { site } from '../src/content/site';
import { projects } from '../src/content/projects';

describe('site içeriği', () => {
  it('5 navigasyon öğesi taşır', () => {
    expect(site.nav).toHaveLength(5);
    expect(site.nav.map((n) => n.href)).toEqual(['/', '/features', '/pricing', '/about', '/contact']);
  });

  it('hiçbir metin alanı boş değil', () => {
    const walk = (v: unknown): void => {
      if (typeof v === 'string') expect(v.trim().length).toBeGreaterThan(0);
      else if (Array.isArray(v)) v.forEach(walk);
      else if (v && typeof v === 'object') Object.values(v).forEach(walk);
    };
    walk(site);
  });

  it('canlı sitedeki hero başlığını birebir korur', () => {
    expect(site.home.hero.title.join(' ')).toBe('Alıcı daireyi gezip randevuya geliyor');
  });

  it('about sayfasının anahtar cümlesini korur', () => {
    expect(site.about.keyline).toBe('Kat planı ve düz fotoğraf bir daireyi anlatmıyor.');
  });
});

describe('proje verisi', () => {
  it('gerçek ERSA projelerini taşır', () => {
    expect(projects).toHaveLength(2);
    const duman = projects.find((p) => p.slug === 'duman-ersa-ort');
    expect(duman).toMatchObject({
      firm: 'ERSA İNŞAAT', floors: 12, units: 48, tourable: 3, stagePct: 75,
    });
  });

  it('gezilebilir daire sayısı toplam daireyi aşmaz', () => {
    for (const p of projects) expect(p.tourable).toBeLessThanOrEqual(p.units);
  });
});
```

- [ ] **Step 2: Testi çalıştır, başarısız olduğunu doğrula**

Run: `npx vitest run tests/content.test.ts`
Expected: FAIL — modüller yok.

- [ ] **Step 3: projects.ts'i yaz**

`src/content/projects.ts`:
```ts
export type Project = {
  slug: string;
  firm: string;
  name: string;
  district: string;
  city: string;
  priceFrom: number;
  stage: string;
  stagePct: number;
  floors: number;
  units: number;
  tourable: number;
};

export const projects: Project[] = [
  {
    slug: 'duman-ersa-ort',
    firm: 'ERSA İNŞAAT',
    name: 'DUMAN-ERSA ORT.',
    district: 'Melikgazi',
    city: 'Kayseri',
    priceFrom: 5_750_000,
    stage: 'Boya',
    stagePct: 75,
    floors: 12,
    units: 48,
    tourable: 3,
  },
  {
    slug: 'ersa-vizyon',
    firm: 'ERSA İNŞAAT',
    name: 'ERSA VİZYON',
    district: 'Melikgazi',
    city: 'Kayseri',
    priceFrom: 4_450_000,
    stage: 'Teslim',
    stagePct: 100,
    floors: 1,
    units: 1,
    tourable: 1,
  },
];
```

- [ ] **Step 4: site.ts'i yaz**

`src/content/site.ts` — canlı `konutverse.com`dan alınan metinlerle. Tüm metin birebir korunur; yalnızca teknik etiketler yenidir.

Yapı (metinlerin tamamı canlı siteden kopyalanacak):
```ts
export const site = {
  nav: [
    { label: 'Anasayfa', href: '/' },
    { label: 'Özellikler', href: '/features' },
    { label: 'Fiyatlandırma', href: '/pricing' },
    { label: 'Hakkımızda', href: '/about' },
    { label: 'İletişim', href: '/contact' },
  ],
  ctaPrimary: { label: 'Demo isteyin', href: '/contact' },

  home: {
    hero: {
      title: ['Alıcı daireyi gezip', 'randevuya geliyor'],
      body: 'Dairelerinizin fotoğraflarını gönderin; alıcı bina, kat ve daireyi seçip 360° içeride gezsin. Şehir dışındaki alıcı da aynı bağlantıdan girer.',
      cta: 'Sanal Tura Başla',
    },
    kesit: {
      title: ['Sahaya gelen alıcı', 'daireyi zaten gezmiş olur'],
      body: 'Alıcı, ilgilenmediği daireyi ekranda eliyor. Satış ofisine gelen kişi planı biliyor; görüşme tanıtımla değil fiyat konuşmasıyla başlıyor.',
    },
    capabilities: [
      {
        no: '01', kicker: 'Sanal daire turu',
        title: ['Bina, kat, daire:', 'üçü de tek bağlantıda'],
        body: 'Tur telefonun tarayıcısında açılır, uygulama indirilmez. Alıcı katı seçer, daireye girer, odaların arasında yürür.',
        cta: { label: 'Örnek turu gezin', href: '/demo' },
      },
      {
        no: '02', kicker: 'Proje sayfalarınız',
        title: ['Tüm projeleriniz', 'tek adreste'],
        body: 'Her projeniz kendi sayfasında yayında. Alıcı firmanızı seçip yayındaki bütün binaları ve daireleri aynı yerden gezer.',
        cta: { label: 'Firma sayfalarına bakın', href: '/search?tab=firms' },
      },
      {
        no: '03', kicker: 'Kurulum',
        title: ['Fotoğrafları gönderin,', 'turu biz kuralım'],
        body: 'Daire fotoğraflarını gönderin; bina, kat ve daire yapısını kurup turu yayına biz alıyoruz. Sizin tarafınızda yazılım işi yok.',
        cta: { label: 'Demo isteyin', href: '/contact' },
      },
    ],
    status: {
      kicker: 'Şu an yayında',
      title: 'Alıcılar bu daireleri şimdi geziyor',
      stamp: 'YAYIN DURUMU · 08.09.2026',
      metrics: [
        { value: 1, label: 'emlak ve inşaat firması' },
        { value: 2, label: 'yayındaki konut projesi' },
        { value: 4, label: 'gezilebilir daire' },
      ],
    },
    steps: {
      kicker: '3 adımda',
      title: 'Fotoğraftan yayına',
      items: [
        { no: '01/03', title: 'Fotoğrafları gönderin', body: 'Daire fotoğraflarınızı ve varsa kat planlarını iletin. 360° çekim yoksa nasıl çekileceğini anlatıyoruz.' },
        { no: '02/03', title: 'Turu biz kuruyoruz', body: 'Bina, kat ve daire yapısını kurup odaları birbirine bağlıyoruz. Sizin tarafınızda kurulum ya da yazılım işi yok.' },
        { no: '03/03', title: 'Bağlantıyı paylaşın', body: "Tek bağlantı; ilanda, WhatsApp'ta ve satış ofisi ekranında aynı şekilde açılır. Alıcı uygulama indirmez." },
      ],
    },
  },

  about: {
    kicker: 'Hakkımızda',
    title: 'Alıcı daireyi, gelmeden önce geziyor',
    keyline: 'Kat planı ve düz fotoğraf bir daireyi anlatmıyor.',
    // ... canlı sitedeki paragraflar ve 4 taahhüt
  },

  // features, pricing, contact, footer bloklarının tamamı
  // canlı siteden birebir kopyalanır.
} as const;
```

**Uygulayıcı için not:** `features`, `pricing`, `contact` ve `footer` blokları bu planda kısaltılmıştır. Metinlerin tamamı canlı `konutverse.com/features`, `/pricing`, `/contact` sayfalarından birebir alınacaktır — spec §3 gereği tek kelime değiştirilmeyecektir. Kaynak metinler bu görevin başında `curl` ile çekilip doğrulanır:

```bash
curl -sL https://konutverse.com/features -o /tmp/kv-features.html
curl -sL https://konutverse.com/pricing  -o /tmp/kv-pricing.html
curl -sL https://konutverse.com/contact  -o /tmp/kv-contact.html
```

- [ ] **Step 5: Testleri çalıştır ve commit**

Run: `npm test`
Expected: content testleri PASS.

```bash
git add -A
git commit -m "feat: içerik tek kaynağı — site metinleri ve proje verisi"
```

---

## Task 5: UI primitifleri

**Files:**
- Create: `src/components/ui/{Button,StatusChip,SheetLabel,SheetRule,Field,Accordion,Metric}.astro`
- Test: `tests/tokens.test.ts` ham değer taraması bu dosyaları otomatik kapsar

**Interfaces:**
- Produces:
  - `Button` props: `{ href: string; variant?: 'primary' | 'ghost'; size?: 'md' | 'lg' }`
  - `StatusChip` props: `{ status: 'free' | 'sold' | 'reserved' }`
  - `SheetLabel` props: `{ text: string; tone?: 'brick' | 'line' }`
  - `SheetRule` props: `{ no?: string }`
  - `Field` props: `{ name: string; label: string; type?: string; required?: boolean; as?: 'input' | 'textarea' }`
  - `Accordion` props: `{ items: { q: string; a: string }[] }`
  - `Metric` props: `{ value: number; label: string }` — değeri sıfır dolgulu iki hane olarak basar

- [ ] **Step 1: Button.astro'yu yaz**

```astro
---
interface Props { href: string; variant?: 'primary' | 'ghost'; size?: 'md' | 'lg'; }
const { href, variant = 'primary', size = 'md' } = Astro.props;
---
<a class:list={['btn', `btn--${variant}`, `btn--${size}`]} href={href}>
  <span><slot /></span>
</a>

<style>
  .btn {
    display: inline-flex; align-items: center; gap: var(--s-2);
    font-family: var(--font-tech);
    font-size: var(--t-tech);
    text-transform: uppercase;
    letter-spacing: var(--ls-tech);
    text-decoration: none;
    border-radius: var(--radius-control);
    border: var(--hairline) solid transparent;
    transition: background var(--dur-fast) var(--ease), border-color var(--dur-fast) var(--ease);
  }
  .btn--md { padding: 14px 20px; }
  .btn--lg { padding: 18px 28px; }
  .btn--primary { background: var(--brick); color: var(--paper); }
  .btn--primary:hover { background: var(--brick-lit); }
  .btn--ghost { border-color: var(--line-dark); color: var(--ink); }
  :global(.on-dark) .btn--ghost,
  :global(.on-dark-deep) .btn--ghost { border-color: var(--line); color: var(--chalk); }
  :global(.on-dark) .btn--ghost:hover,
  :global(.on-dark-deep) .btn--ghost:hover { background: var(--ink-raised); }
</style>
```

- [ ] **Step 2: StatusChip, SheetLabel, SheetRule, Metric'i yaz**

`StatusChip.astro`:
```astro
---
interface Props { status: 'free' | 'sold' | 'reserved'; }
const { status } = Astro.props;
const LABEL = { free: 'Boş', sold: 'Satıldı', reserved: 'Rezerve' } as const;
---
<span class:list={['chip', `chip--${status}`]}>{LABEL[status]}</span>

<style>
  .chip {
    display: inline-block;
    border-radius: var(--radius-pill);
    padding: 3px 10px;
    font-family: var(--font-tech);
    font-size: var(--t-tech);
    text-transform: uppercase;
    letter-spacing: var(--ls-tech);
    color: var(--paper);
  }
  .chip--free { background: var(--avail-free); }
  .chip--sold { background: var(--avail-sold); }
  .chip--reserved { background: var(--avail-reserved); }
</style>
```

`SheetLabel.astro` — pafta etiketi, yuvarlak DEĞİL:
```astro
---
interface Props { text: string; tone?: 'brick' | 'line'; }
const { text, tone = 'brick' } = Astro.props;
---
<span class:list={['sheet-label', `sheet-label--${tone}`]}>{text}</span>

<style>
  .sheet-label {
    display: inline-block;
    border-radius: var(--radius-structural);
    padding: 4px 10px;
    font-family: var(--font-tech);
    font-size: var(--t-tech);
    text-transform: uppercase;
    letter-spacing: var(--ls-tech);
  }
  .sheet-label--brick { background: var(--brick); color: var(--paper); }
  .sheet-label--line { border: var(--hairline) solid var(--line-dark); color: var(--ink); }
</style>
```

`Metric.astro` — sıfır dolgulu sicil formatı (spec §7.1 Bölüm 4):
```astro
---
interface Props { value: number; label: string; }
const { value, label } = Astro.props;
const padded = String(value).padStart(2, '0');
---
<div class="metric">
  <span class="metric__value">{padded}</span>
  <span class="metric__label tech">{label}</span>
</div>

<style>
  .metric { display: flex; align-items: baseline; gap: var(--s-4); }
  .metric__value {
    font-family: var(--font-display);
    font-variation-settings: "wdth" var(--wdth-display), "wght" 600;
    font-size: var(--t-display);
    line-height: 1;
    color: var(--brick);          /* ≥24px — kontrast politikası uygun */
    font-feature-settings: "tnum" 1;
  }
  .metric__label { color: var(--chalk); opacity: 0.72; }
</style>
```

`SheetRule.astro`:
```astro
---
interface Props { no?: string; }
const { no } = Astro.props;
---
<div class="sheet-rule">
  <hr class="rule" />
  {no && <span class="tech sheet-rule__no">{no}</span>}
</div>

<style>
  .sheet-rule { display: flex; align-items: center; gap: var(--s-4); }
  .sheet-rule .rule { flex: 1; }
  .sheet-rule__no { color: var(--brick-lit); }
</style>
```

- [ ] **Step 3: Field ve Accordion'ı yaz**

`Field.astro`:
```astro
---
interface Props { name: string; label: string; type?: string; required?: boolean; as?: 'input' | 'textarea'; }
const { name, label, type = 'text', required = false, as = 'input' } = Astro.props;
const id = `f-${name}`;
---
<div class="field">
  <label class="tech field__label" for={id}>{label}{required && ' *'}</label>
  {as === 'textarea'
    ? <textarea class="field__control" id={id} name={name} rows="5" required={required}></textarea>
    : <input class="field__control" id={id} name={name} type={type} required={required} />}
</div>

<style>
  .field { display: grid; gap: var(--s-2); }
  .field__label { color: var(--ink); opacity: 0.7; }
  .field__control {
    font-family: var(--font-body);
    font-size: var(--t-body);
    color: var(--ink);
    background: var(--paper);
    border: var(--hairline) solid var(--line-dark);
    border-radius: var(--radius-control);
    padding: 14px 16px;
    width: 100%;
  }
  .field__control:focus-visible { border-color: var(--brick); }
</style>
```

`Accordion.astro` — native `<details>`, sıfır JS:
```astro
---
interface Props { items: { q: string; a: string }[]; }
const { items } = Astro.props;
---
<div class="acc">
  {items.map((item, i) => (
    <details class="acc__item">
      <summary class="acc__q">
        <span class="tech acc__no">{String(i + 1).padStart(2, '0')}</span>
        <span>{item.q}</span>
      </summary>
      <p class="acc__a">{item.a}</p>
    </details>
  ))}
</div>

<style>
  .acc__item { border-top: var(--hairline) solid var(--line-dark); padding: var(--s-6) 0; }
  .acc__q {
    display: flex; gap: var(--s-4); align-items: baseline;
    cursor: pointer; font-size: var(--t-h3);
    font-family: var(--font-display);
    font-variation-settings: "wdth" 100, "wght" 600;
  }
  .acc__no { color: var(--brick); }
  .acc__a { margin-top: var(--s-4); padding-left: 44px; }
</style>
```

- [ ] **Step 4: Ham değer testini çalıştır**

Run: `npx vitest run tests/tokens.test.ts`
Expected: PASS — yeni `.astro` dosyalarının hiçbirinde ham hex yok.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: UI primitifleri — buton, çip, pafta etiketi, alan, akordiyon"
```

---

## Task 6: Site chrome — Header, Nav, Footer, KotRayi

**Files:**
- Create: `src/components/site/{Header,Nav,Footer,KotRayi,TechCaption}.astro`
- Modify: `src/layouts/Base.astro`
- Test: `tests/pages.test.ts` (navigasyon sözleşmesi eklenir)

**Interfaces:**
- Produces:
  - `Header` props: `{ current: string }` — aktif rotayı `aria-current="page"` ile işaretler
  - `KotRayi` props: `{ marks: { kot: string; id: string }[] }`
  - `TechCaption` props: `{ items: string[] }` — mono şerit, `·` ile ayrılır
  - `Footer` props: yok — `site.footer` ve imza sistemini (Task 7) render eder

- [ ] **Step 1: Navigasyon sözleşmesi testini yaz**

`tests/pages.test.ts` içine ekle:
```ts
describe('navigasyon sözleşmesi', () => {
  it('ana sayfada 5 nav linki ve aktif işaret var', () => {
    const html = readFileSync('dist/index.html', 'utf8');
    const { document } = parseHTML(html);
    const links = [...document.querySelectorAll('nav a[href]')];
    const hrefs = links.map((a) => a.getAttribute('href'));
    for (const href of ['/', '/features', '/pricing', '/about', '/contact']) {
      expect(hrefs).toContain(href);
    }
    expect(document.querySelector('nav a[aria-current="page"]')?.getAttribute('href')).toBe('/');
  });

  it('skip link ilk odaklanabilir öğedir', () => {
    const html = readFileSync('dist/index.html', 'utf8');
    const { document } = parseHTML(html);
    expect(document.querySelector('body a')?.getAttribute('href')).toBe('#main');
  });
});
```

- [ ] **Step 2: Testi çalıştır, başarısız olduğunu doğrula**

Run: `npm run verify`
Expected: FAIL — nav ve skip link yok.

- [ ] **Step 3: Nav.astro ve Header.astro'yu yaz**

`Nav.astro`:
```astro
---
import { site } from '../../content/site';
interface Props { current: string; }
const { current } = Astro.props;
---
<nav aria-label="Ana menü">
  <ul class="nav">
    {site.nav.map((item) => (
      <li>
        <a class="tech nav__link" href={item.href}
           aria-current={item.href === current ? 'page' : undefined}>{item.label}</a>
      </li>
    ))}
  </ul>
</nav>

<style>
  .nav { display: flex; gap: var(--s-6); list-style: none; margin: 0; padding: 0; }
  .nav__link { text-decoration: none; opacity: 0.72; }
  .nav__link:hover { opacity: 1; }
  .nav__link[aria-current="page"] {
    opacity: 1;
    box-shadow: 0 2px 0 var(--brick);
  }
</style>
```

`Header.astro`: wordmark ("Konutverse", display tipte) + `<Nav />` + `Button` (Demo isteyin). Mobilde `<details>` tabanlı menü — sıfır JS.

- [ ] **Step 4: KotRayi.astro ve TechCaption.astro'yu yaz**

`KotRayi.astro`:
```astro
---
interface Props { marks: { kot: string; id: string }[]; }
const { marks } = Astro.props;
---
<div class="kot" aria-hidden="true">
  {marks.map((m) => (
    <div class="kot__mark" data-kot={m.id}>
      <span class="tech kot__value">{m.kot}</span>
      <span class="kot__tick"></span>
    </div>
  ))}
</div>

<style>
  .kot { display: none; }
  @media (min-width: 1024px) {
    .kot {
      display: flex; flex-direction: column; justify-content: space-between;
      position: fixed; left: 0; top: 0; bottom: 0;
      width: var(--rail-w); padding: var(--s-24) var(--s-4);
      border-right: var(--hairline) solid var(--line);
      z-index: 2; pointer-events: none;
    }
    .kot__mark { display: flex; align-items: center; gap: var(--s-2); }
    .kot__value { color: var(--chalk); opacity: 0.45; font-size: 10px; }
    .kot__tick { flex: 1; height: 1px; background: var(--line); }
    .kot__mark[data-active="true"] .kot__value { opacity: 1; color: var(--brick-lit); }
    .kot__mark[data-active="true"] .kot__tick { background: var(--brick); height: 2px; }
  }
</style>
```

Mobil karşılığı: sayfanın üstünde `position: sticky` yatay ilerleme rayı — `scroll-timeline` destekliyse CSS ile, değilse `reveal.ts` içindeki scroll dinleyicisiyle.

- [ ] **Step 5: Footer.astro'yu yaz**

`site.footer` verisinden dört kolon (marka + Ürün + Şirket + İletişim) ve alt şerit. **İmza sistemi Task 7'de eklenecek** — şimdilik alt şeritte `© 2026 Konutverse` ve tagline yer alır.

- [ ] **Step 6: Base.astro'ya chrome ve skip link ekle**

`<body>` içine `<slot />`'tan önce:
```astro
<a class="skip" href="#main">İçeriğe atla</a>
<Header current={route} />
<main id="main"><slot /></main>
<Footer />
```

`base.css`'e:
```css
.skip {
  position: absolute; left: var(--s-4); top: -100px;
  background: var(--brick); color: var(--paper);
  padding: var(--s-3) var(--s-4);
  font-family: var(--font-tech); font-size: var(--t-tech);
  text-transform: uppercase; letter-spacing: var(--ls-tech);
  z-index: 100; text-decoration: none;
}
.skip:focus { top: var(--s-4); }
```

- [ ] **Step 7: Doğrula ve commit**

Run: `npm run verify`
Expected: tüm testler PASS.

```bash
git add -A
git commit -m "feat: site chrome — header, nav, footer, kot rayı"
```

---

## Task 7: İmza sistemi — Katman 0, 1, 2, 3

**Files:**
- Create: `src/components/signature/{credits.ts,MakerMark.astro,Colophon.astro,signature.css}`
- Create: `src/scripts/console-signature.ts`, `src/pages/kunye.astro`, `public/humans.txt`
- Modify: `src/components/site/Footer.astro`, `src/layouts/Base.astro`
- Test: `tests/signature.test.ts`

**Interfaces:**
- Produces:
  - `credits: { project, client, year, artDirection, maker: { name, url, city, since, credentials: string[] }, typography: string[], technology: string[], accessibility: string }`
  - `MakerMark` props: `{ variant?: 'inline' | 'stacked' | 'compact'; theme?: 'light' | 'dark' | 'auto' }`
  - `Colophon` props: yok — `credits`ten beslenir

- [ ] **Step 1: İmza sözleşmesi testini yaz**

`tests/signature.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { parseHTML } from 'linkedom';
import { credits } from '../src/components/signature/credits';

const pages = ['dist/index.html', 'dist/features/index.html', 'dist/kunye/index.html'];

describe('Katman 0 — makine katmanı', () => {
  for (const file of pages) {
    it(`${file}: author meta ve rel=author var`, () => {
      const { document } = parseHTML(readFileSync(file, 'utf8'));
      expect(document.querySelector('meta[name="author"]')?.getAttribute('content')).toBe('Alis Dijital');
      expect(document.querySelector('link[rel="author"]')?.getAttribute('href')).toBe('https://alisdijital.com');
    });

    it(`${file}: JSON-LD creator düğümü Alis Dijital'e işaret eder`, () => {
      const { document } = parseHTML(readFileSync(file, 'utf8'));
      const blocks = [...document.querySelectorAll('script[type="application/ld+json"]')];
      const graph = blocks.map((b) => JSON.parse(b.textContent!)).flatMap((d) => d['@graph'] ?? [d]);
      const org = graph.find((n: any) => n['@id']?.includes('alisdijital'));
      expect(org).toBeTruthy();
      expect(org.name).toBe('Alis Dijital');
      const site = graph.find((n: any) => n['@type'] === 'WebSite');
      expect(site.creator['@id']).toBe(org['@id']);
    });
  }

  it('humans.txt yayınlanır ve ajansı adlandırır', () => {
    expect(existsSync('dist/humans.txt')).toBe(true);
    expect(readFileSync('dist/humans.txt', 'utf8')).toContain('Alis Dijital');
  });
});

describe('Katman 1 — marka', () => {
  it('her sayfanın footerında künyeye giden marka var', () => {
    for (const file of pages) {
      const { document } = parseHTML(readFileSync(file, 'utf8'));
      const mark = document.querySelector('footer a[href="/kunye"]');
      expect(mark, `${file} imza markası taşımıyor`).toBeTruthy();
      expect(mark!.textContent).toContain(credits.maker.name);
    }
  });

  it('monogram gerçek SVG, favicon değil', () => {
    const { document } = parseHTML(readFileSync('dist/index.html', 'utf8'));
    expect(document.querySelector('footer a[href="/kunye"] svg')).toBeTruthy();
  });
});

describe('Katman 2 — künye sayfası', () => {
  it('ajansın kimlik bilgilerini taşır', () => {
    const html = readFileSync('dist/kunye/index.html', 'utf8');
    for (const line of credits.maker.credentials) expect(html).toContain(line);
    expect(html).toContain(credits.artDirection);
    expect(html).toContain(credits.accessibility);
  });

  it('dış linki yeni sekmede ve güvenli açar', () => {
    const { document } = parseHTML(readFileSync('dist/kunye/index.html', 'utf8'));
    const a = document.querySelector('a[href="https://alisdijital.com"]');
    expect(a?.getAttribute('rel')).toContain('noopener');
  });
});
```

- [ ] **Step 2: Testi çalıştır, başarısız olduğunu doğrula**

Run: `npm run verify`
Expected: FAIL — `credits` modülü ve künye sayfası yok.

- [ ] **Step 3: credits.ts'i yaz**

```ts
export const credits = {
  project: 'Konutverse — 360° Sanal Daire Turu',
  client: 'Konutverse',
  year: '2026',
  artDirection: 'Plandan Mekâna',
  maker: {
    name: 'Alis Dijital',
    url: 'https://alisdijital.com',
    city: 'Kayseri, Türkiye',
    since: "2016'dan beri",
    credentials: ['200+ marka', 'İkas Premium Partner', 'Shopify Partner'],
  },
  design: 'Alis Dijital',
  development: 'Alis Dijital',
  typography: ['Archivo', 'IBM Plex Mono', 'Inter'],
  technology: ['Astro', 'GSAP ScrollTrigger', 'Lenis'],
  accessibility: 'WCAG 2.2 AA',
} as const;
```

- [ ] **Step 4: MakerMark.astro'yu yaz (Katman 1)**

Monogram: `A` ve `D` harflerini birleştiren açısal SVG işaret — drafting türevi, `stroke` tabanlı (dolgu yok), 16px'te okunur. `stroke-dasharray` / `stroke-dashoffset` ile hover'da yeniden çizilir.

```astro
---
import { credits } from './credits';
import './signature.css';
interface Props { variant?: 'inline' | 'stacked' | 'compact'; theme?: 'light' | 'dark' | 'auto'; }
const { variant = 'stacked', theme = 'auto' } = Astro.props;
---
<a class:list={['ad-mark', `ad-mark--${variant}`, `ad-mark--${theme}`]}
   href="/kunye" data-ad-signature>
  <svg class="ad-mark__glyph" viewBox="0 0 24 24" aria-hidden="true"
       fill="none" stroke="currentColor" stroke-width="1.5">
    <!-- A: açısal çatı; D: dik kenar + yay. Drafting çizgisi karakteri. -->
    <path d="M2 20 L8 4 L14 20" />
    <path d="M4.6 14.5 H11.4" />
    <path d="M17 4 V20 H19 A3 3 0 0 0 22 17 V7 A3 3 0 0 0 19 4 Z" />
  </svg>
  <span class="ad-mark__text">
    <span class="ad-mark__kicker">Yapım</span>
    <span class="ad-mark__name">{credits.maker.name}</span>
    <span class="ad-mark__meta">{credits.maker.city.split(',')[0]} · {credits.maker.since}</span>
  </span>
</a>
```

`signature.css` — **kendi scoped token'ları**, host site token'larına bağımlı değil (spec §8.5 gereği):
```css
[data-ad-signature] {
  --ad-fg: #16203A;
  --ad-muted: rgba(22, 32, 58, 0.58);
  --ad-line: rgba(22, 32, 58, 0.16);
  --ad-accent: #C23616;
  --ad-mono: ui-monospace, "IBM Plex Mono", SFMono-Regular, monospace;
  --ad-sans: system-ui, -apple-system, "Inter", sans-serif;

  display: inline-flex; align-items: center; gap: 10px;
  text-decoration: none; color: var(--ad-fg);
}
.ad-mark--dark,
.ad-mark--auto:is(.on-dark *, .on-dark-deep *) {
  --ad-fg: #FFFFFF;
  --ad-muted: rgba(255, 255, 255, 0.58);
  --ad-line: rgba(255, 255, 255, 0.18);
  --ad-accent: #ED5A34;   /* koyu zeminde AA geçen ton */
}
.ad-mark__glyph { width: 26px; height: 26px; flex: none; }
.ad-mark__glyph path {
  stroke-dasharray: 64; stroke-dashoffset: 0;
  transition: stroke-dashoffset 420ms cubic-bezier(0.22, 1, 0.36, 1);
}
[data-ad-signature]:hover .ad-mark__glyph path { stroke-dashoffset: 64; animation: ad-draw 420ms cubic-bezier(0.22,1,0.36,1) forwards; }
@keyframes ad-draw { from { stroke-dashoffset: 64; } to { stroke-dashoffset: 0; } }

.ad-mark__text { display: grid; gap: 1px; }
.ad-mark__kicker,
.ad-mark__meta {
  font-family: var(--ad-mono); font-size: 10px;
  text-transform: uppercase; letter-spacing: 0.1em; color: var(--ad-muted);
}
.ad-mark__name { font-family: var(--ad-sans); font-size: 14px; font-weight: 600; }
[data-ad-signature]:hover .ad-mark__name { color: var(--ad-accent); }

.ad-mark--inline { gap: 8px; }
.ad-mark--inline .ad-mark__kicker,
.ad-mark--inline .ad-mark__meta { display: none; }
.ad-mark--compact .ad-mark__text { display: none; }

@media print { [data-ad-signature] { color: #000; } }
@media (prefers-reduced-motion: reduce) {
  .ad-mark__glyph path, [data-ad-signature]:hover .ad-mark__glyph path {
    transition: none; animation: none; stroke-dashoffset: 0;
  }
}
```

- [ ] **Step 5: Colophon.astro ve /kunye sayfasını yaz (Katman 2)**

Pafta antet bloğu düzeni: sol kolon mono etiket, sağ kolon değer, aralarda saç teli kural. Zemin `--ink`. Sağ üstte `01/01` pafta numarası. Spec §8.3'teki blokların tamamı: PROJE, YIL, SANAT YÖNÜ / TASARIM, GELİŞTİRME / TİPOGRAFİ, TEKNOLOJİ, ERİŞİLEBİLİRLİK / ALIS DİJİTAL kimlik bloğu.

`kunye.astro`, `Base.astro` layout'unu `title="Yapım Künyesi — Konutverse"` ile kullanır ve `<Colophon />` render eder.

- [ ] **Step 6: Katman 0'ı Base.astro'ya ekle**

`<head>` içine:
```astro
<meta name="author" content={credits.maker.name} />
<link rel="author" href={credits.maker.url} />
<script type="application/ld+json" set:html={JSON.stringify({
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': 'Organization', '@id': 'https://www.konutverse.com/#organization',
      name: 'Konutverse', url: 'https://www.konutverse.com' },
    { '@type': 'Organization', '@id': 'https://alisdijital.com/#organization',
      name: credits.maker.name, url: credits.maker.url },
    { '@type': 'WebSite', '@id': 'https://www.konutverse.com/#website',
      url: 'https://www.konutverse.com', name: 'Konutverse', inLanguage: 'tr-TR',
      publisher: { '@id': 'https://www.konutverse.com/#organization' },
      creator: { '@id': 'https://alisdijital.com/#organization' } },
  ],
})} />
```

`public/humans.txt`:
```
/* YAPIM */
Ajans: Alis Dijital
Site: https://alisdijital.com
Konum: Kayseri, Türkiye
Sanat yönü: Plandan Mekâna

/* PROJE */
Konutverse — 360° Sanal Daire Turu
Yıl: 2026

/* TEKNOLOJİ */
Astro, GSAP ScrollTrigger, Lenis
Archivo, IBM Plex Mono, Inter
```

- [ ] **Step 7: Konsol imzasını yaz (Katman 3)**

`src/scripts/console-signature.ts` — tek blok, tek seferlik, gürültüsüz:
```ts
import { credits } from '../components/signature/credits';

const art = [
  '',
  '   ⌐ᴀ   ' + credits.maker.name.toUpperCase(),
  '   ᴅ┘   ' + credits.maker.city + ' · ' + credits.maker.since,
  '',
  '   ' + credits.project,
  '   Sanat yönü: ' + credits.artDirection,
  '   ' + credits.maker.url,
  '',
].join('\n');

console.log('%c' + art, 'color:#ED5A34;font-family:monospace;line-height:1.5');
```

`Base.astro`'da `reveal.ts` ile birlikte import edilir.

- [ ] **Step 8: Footer'a markayı ekle**

`Footer.astro` alt şeridine `<MakerMark variant="stacked" theme="auto" />`.

- [ ] **Step 9: Doğrula ve commit**

Run: `npm run verify`
Expected: tüm imza testleri PASS.

```bash
git add -A
git commit -m "feat: ajans imza sistemi katman 0-3 — makine katmanı, marka, künye, konsol"
```

---

## Task 8: İmza sistemi — Katman 4, portatiflik

**Files:**
- Create: `src/components/signature/signature.js`, `src/components/signature/README.md`
- Test: `tests/signature.test.ts` (genişletilir)

**Interfaces:**
- Produces: `<alis-signature variant="stacked" theme="auto" href="/kunye">` custom element. Astro, React, Vue veya düz HTML fark etmeksizin çalışır.

**Neden bu task ayrı:** Konutverse'ün gerçek sitesi Next.js. Bu bileşen, imza sisteminin bu Astro demosuna değil **mevcut canlı siteye de** eklenebilmesini sağlar. Sistemi "sistem" yapan katman budur.

- [ ] **Step 1: Framework'süz çalışma testini yaz**

`tests/signature.test.ts` içine ekle:
```ts
import { describe, it, expect, beforeAll } from 'vitest';
import { parseHTML } from 'linkedom';
import { readFileSync } from 'node:fs';

describe('Katman 4 — web component portatifliği', () => {
  it('boş bir HTML sayfasında Astro olmadan render eder', async () => {
    const { window, document, customElements, HTMLElement } = parseHTML(
      '<!doctype html><html><body></body></html>'
    );
    // Global ortamı web component için hazırla
    (globalThis as any).window = window;
    (globalThis as any).document = document;
    (globalThis as any).customElements = customElements;
    (globalThis as any).HTMLElement = HTMLElement;

    const source = readFileSync('src/components/signature/signature.js', 'utf8');
    new Function(source)();

    document.body.innerHTML = '<alis-signature variant="inline"></alis-signature>';
    const el = document.querySelector('alis-signature')!;
    // upgrade tetikle
    customElements.upgrade(el);

    expect(el.shadowRoot).toBeTruthy();
    expect(el.shadowRoot!.innerHTML).toContain('Alis Dijital');
    expect(el.shadowRoot!.querySelector('svg')).toBeTruthy();
    expect(el.shadowRoot!.querySelector('a')?.getAttribute('href')).toBe('/kunye');
  });

  it('stil host sayfaya sızmaz — shadow DOM kullanır', () => {
    const source = readFileSync('src/components/signature/signature.js', 'utf8');
    expect(source).toContain('attachShadow');
  });

  it('host token bağımlılığı taşımaz', () => {
    const source = readFileSync('src/components/signature/signature.js', 'utf8');
    // Kendi --ad-* ön ekli token'ları dışında var() kullanmamalı
    const vars = source.match(/var\(--[a-z0-9-]+/gi) ?? [];
    for (const v of vars) expect(v).toMatch(/var\(--ad-/);
  });
});
```

- [ ] **Step 2: Testi çalıştır, başarısız olduğunu doğrula**

Run: `npx vitest run tests/signature.test.ts`
Expected: FAIL — `signature.js` yok.

- [ ] **Step 3: signature.js'i yaz**

Bağımlılıksız, tek dosya, shadow DOM'lu custom element. İçindeki SVG ve CSS, `MakerMark.astro` + `signature.css` ile birebir aynı görünümü üretir (yinelenme kabul edilmiştir: bileşenin taşınabilir olması için bağımsız olması şart).

```js
(() => {
  if (typeof customElements === 'undefined' || customElements.get('alis-signature')) return;

  const CREDITS = {
    name: 'Alis Dijital',
    url: 'https://alisdijital.com',
    city: 'Kayseri',
    since: "2016'dan beri",
  };

  const GLYPH = `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none"
    stroke="currentColor" stroke-width="1.5" part="glyph">
    <path d="M2 20 L8 4 L14 20"/><path d="M4.6 14.5 H11.4"/>
    <path d="M17 4 V20 H19 A3 3 0 0 0 22 17 V7 A3 3 0 0 0 19 4 Z"/></svg>`;

  const CSS = `
    :host { display: inline-block; }
    a { --ad-fg:#16203A; --ad-muted:rgba(22,32,58,.58); --ad-accent:#C23616;
        --ad-mono: ui-monospace,"IBM Plex Mono",SFMono-Regular,monospace;
        --ad-sans: system-ui,-apple-system,"Inter",sans-serif;
        display:inline-flex; align-items:center; gap:10px;
        text-decoration:none; color:var(--ad-fg); }
    :host([theme="dark"]) a { --ad-fg:#FFFFFF; --ad-muted:rgba(255,255,255,.58); --ad-accent:#ED5A34; }
    @media (prefers-color-scheme: dark) {
      :host([theme="auto"]) a { --ad-fg:#FFFFFF; --ad-muted:rgba(255,255,255,.58); --ad-accent:#ED5A34; }
    }
    svg { width:26px; height:26px; flex:none; }
    svg path { stroke-dasharray:64; stroke-dashoffset:0; }
    a:hover svg path { animation: draw 420ms cubic-bezier(.22,1,.36,1) forwards; }
    @keyframes draw { from{stroke-dashoffset:64} to{stroke-dashoffset:0} }
    .t { display:grid; gap:1px; }
    .k,.m { font-family:var(--ad-mono); font-size:10px; text-transform:uppercase;
            letter-spacing:.1em; color:var(--ad-muted); }
    .n { font-family:var(--ad-sans); font-size:14px; font-weight:600; }
    a:hover .n { color:var(--ad-accent); }
    :host([variant="inline"]) .k, :host([variant="inline"]) .m { display:none; }
    :host([variant="compact"]) .t { display:none; }
    @media (prefers-reduced-motion: reduce) { a:hover svg path { animation:none } }
  `;

  class AlisSignature extends HTMLElement {
    connectedCallback() {
      if (this.shadowRoot) return;
      const href = this.getAttribute('href') || '/kunye';
      const root = this.attachShadow({ mode: 'open' });
      root.innerHTML =
        `<style>${CSS}</style>` +
        `<a href="${href}" aria-label="Yapım: ${CREDITS.name}">${GLYPH}` +
        `<span class="t"><span class="k">Yapım</span>` +
        `<span class="n">${CREDITS.name}</span>` +
        `<span class="m">${CREDITS.city} · ${CREDITS.since}</span></span></a>`;
    }
  }

  customElements.define('alis-signature', AlisSignature);
})();
```

- [ ] **Step 4: README.md'yi yaz**

```markdown
# Alis Dijital — İmza Sistemi

Herhangi bir web projesine eklenebilen ajans imza bileşeni.
Bağımlılık yok. Framework yok. Shadow DOM ile izole.

## Kurulum

1. `signature.js` dosyasını projeye kopyala.
2. Sayfaya ekle:

   ```html
   <script src="/signature.js" defer></script>
   <alis-signature variant="stacked" theme="auto" href="/kunye"></alis-signature>
   ```

## Özellikler (attribute)

| Attribute | Değerler | Varsayılan |
|---|---|---|
| `variant` | `stacked` · `inline` · `compact` | `stacked` |
| `theme`   | `auto` · `light` · `dark`        | `auto` |
| `href`    | künye sayfası yolu               | `/kunye` |

## Next.js

```jsx
import Script from 'next/script';

export default function Footer() {
  return (
    <>
      <Script src="/signature.js" strategy="lazyOnload" />
      <alis-signature variant="stacked" theme="dark" />
    </>
  );
}
```

## Katmanlar

Bu dosya yalnızca **Katman 4**'tür. Tam sistem için ayrıca:
- **Katman 0:** `<meta name="author">`, `<link rel="author">`, JSON-LD `creator`, `humans.txt`
- **Katman 2:** `/kunye` künye sayfası
- **Katman 3:** konsol imzası
```

- [ ] **Step 5: Doğrula ve commit**

Run: `npm test`
Expected: portatiflik testleri PASS.

```bash
git add -A
git commit -m "feat: imza sistemi katman 4 — framework'süz web component"
```

---

## Task 9: Görselleştirme bileşenleri

**Files:**
- Create: `src/components/viz/{BuildingSection,ElevationStack,AvailabilityGrid,ProgressGauge}.astro`

**Interfaces:**
- Produces:
  - `BuildingSection` props: `{ floors: number; unitsPerFloor: number; tourableFloors: number[] }` — SVG kesit, her kata `data-floor` verir (Task 11 scrub'ı bunu hedefler)
  - `ElevationStack` props: `{ project: Project; tourableUnits: string[] }`
  - `AvailabilityGrid` props: `{ units: { id: string; status: 'free'|'sold'|'reserved'; tourable: boolean }[] }`
  - `ProgressGauge` props: `{ label: string; pct: number }`

- [ ] **Step 1: BuildingSection.astro'yu yaz**

viewBox tabanlı, `stroke`-only SVG. Her kat bir `<g data-floor="n">`. Katlar arası kot çizgileri, sağda kot etiketleri. `stroke-dasharray` yüklemede çizim animasyonu için hazır.

```astro
---
interface Props { floors: number; unitsPerFloor: number; tourableFloors: number[]; }
const { floors, unitsPerFloor, tourableFloors } = Astro.props;
const FH = 26;           // kat yüksekliği (viewBox birimi)
const W = 180;
const H = floors * FH + 40;
const kot = (i: number) => (i * 3.2).toFixed(2);
---
<svg class="section" viewBox={`0 0 ${W} ${H}`} role="img"
     aria-label={`${floors} katlı bina kesiti`}>
  {Array.from({ length: floors }, (_, i) => {
    const y = H - 20 - (i + 1) * FH;
    const tourable = tourableFloors.includes(i);
    return (
      <g data-floor={i} class:list={['floor', tourable && 'floor--tourable']}>
        <rect x="20" y={y} width={W - 60} height={FH} />
        {Array.from({ length: unitsPerFloor - 1 }, (_, u) => (
          <line x1={20 + ((W - 60) / unitsPerFloor) * (u + 1)} y1={y}
                x2={20 + ((W - 60) / unitsPerFloor) * (u + 1)} y2={y + FH} />
        ))}
        <text class="kotlabel" x={W - 34} y={y + FH - 8}>+{kot(i)}</text>
      </g>
    );
  })}
  <line class="ground" x1="8" y1={H - 20} x2={W - 8} y2={H - 20} />
</svg>

<style>
  .section { width: 100%; height: auto; }
  .floor rect, .floor line { fill: none; stroke: var(--line); stroke-width: 0.8; }
  .floor--tourable rect { stroke: var(--brick); stroke-width: 1.4; }
  .ground { stroke: var(--chalk); stroke-width: 1.2; opacity: 0.5; }
  .kotlabel {
    font-family: var(--font-tech); font-size: 5px;
    fill: var(--chalk); opacity: 0.4; letter-spacing: 0.06em;
  }
  .floor[data-active="true"] rect { stroke: var(--brick); stroke-width: 1.6; }
</style>
```

- [ ] **Step 2: ProgressGauge.astro'yu yaz**

"Boya %75" — yuvarlak progress bar değil, **teknik gösterge**: bölmeli ray, dolu bölmeler `--brick`, boş bölmeler `--line`.

```astro
---
interface Props { label: string; pct: number; }
const { label, pct } = Astro.props;
const TICKS = 20;
const filled = Math.round((pct / 100) * TICKS);
---
<div class="gauge">
  <div class="gauge__head">
    <span class="tech">{label}</span>
    <span class="tech gauge__pct">%{pct}</span>
  </div>
  <div class="gauge__rail" role="img" aria-label={`${label} yüzde ${pct}`}>
    {Array.from({ length: TICKS }, (_, i) => (
      <span class:list={['gauge__tick', i < filled && 'is-filled']}></span>
    ))}
  </div>
</div>

<style>
  .gauge__head { display: flex; justify-content: space-between; margin-bottom: var(--s-2); }
  .gauge__pct { color: var(--brick-lit); }
  .gauge__rail { display: flex; gap: 2px; }
  .gauge__tick { flex: 1; height: 8px; background: var(--line); }
  .gauge__tick.is-filled { background: var(--brick); }
</style>
```

- [ ] **Step 3: AvailabilityGrid ve ElevationStack'i yaz**

`AvailabilityGrid`: bir kattaki daireleri hücre olarak dizer; durum rengi `--avail-*`, gezilebilir daireye `--brick` çerçeve. Her hücre `<button>` (klavye erişilebilir), `aria-label` daire no + durum taşır.

`ElevationStack`: `project.floors` kadar satır, her satırda kot etiketi + `AvailabilityGrid`. `/demo` sayfasının gövdesi.

- [ ] **Step 4: Ham değer testini çalıştır ve commit**

Run: `npm test`

```bash
git add -A
git commit -m "feat: görselleştirme bileşenleri — bina kesiti, cephe, müsaitlik, gösterge"
```

---

## Task 10: Ana sayfa — hero

**Files:**
- Modify: `src/pages/index.astro`
- Test: `tests/pages.test.ts`

- [ ] **Step 1: Hero sözleşmesi testini yaz**

```ts
describe('ana sayfa hero', () => {
  it('canlı sitedeki başlığı birebir taşır', () => {
    const { document } = parseHTML(readFileSync('dist/index.html', 'utf8'));
    const h1 = document.querySelector('h1')!.textContent!.replace(/\s+/g, ' ').trim();
    expect(h1).toBe('Alıcı daireyi gezip randevuya geliyor');
  });

  it('teknik künye şeridi gerçek proje verisini gösterir', () => {
    const html = readFileSync('dist/index.html', 'utf8');
    expect(html).toContain('DUMAN-ERSA ORT.');
    expect(html).toContain('12 KAT');
    expect(html).toContain('48 DAİRE');
    expect(html).toContain('MELİKGAZİ, KAYSERİ');
  });

  it('bina kesiti SVG erişilebilir etiket taşır', () => {
    const { document } = parseHTML(readFileSync('dist/index.html', 'utf8'));
    const svg = document.querySelector('svg[role="img"]');
    expect(svg?.getAttribute('aria-label')).toContain('12 katlı');
  });
});
```

- [ ] **Step 2: Testi çalıştır, başarısız olduğunu doğrula**

Run: `npm run verify`
Expected: FAIL.

- [ ] **Step 3: Hero'yu yaz**

`100dvh`, `--ink-deep` zemin, `.on-dark-deep` sınıfı. Grid: sol 7 kolon metin, sağ 5 kolon `<BuildingSection floors={12} unitsPerFloor={4} tourableFloors={[0,2]} />`. `<KotRayi />` sabit. Altta `<TechCaption items={['DUMAN-ERSA ORT.','12 KAT','48 DAİRE','MELİKGAZİ, KAYSERİ']} />`. `<h1>` `--t-display-xl` boyutunda, `site.home.hero.title` satırları `<span>` olarak.

CSS çizim animasyonu:
```css
.hero .floor rect, .hero .floor line {
  stroke-dasharray: 400; stroke-dashoffset: 400;
  animation: draw var(--dur-draw) var(--ease) forwards;
  animation-delay: calc(var(--i, 0) * 60ms);
}
@keyframes draw { to { stroke-dashoffset: 0; } }
@media (prefers-reduced-motion: reduce) {
  .hero .floor rect, .hero .floor line { stroke-dashoffset: 0; animation: none; }
}
```

- [ ] **Step 4: Doğrula ve commit**

Run: `npm run verify`

```bash
git add -A
git commit -m "feat: ana sayfa hero — kesit çizimi ve teknik künye şeridi"
```

---

## Task 11: Ana sayfa — kesit sahnesi (scroll scrub)

**Files:**
- Create: `src/scripts/kesit-scrub.ts`
- Modify: `src/pages/index.astro`, `src/layouts/Base.astro` (`heavy` bayrağı)

**Interfaces:**
- Consumes: `BuildingSection`'ın `data-floor` nitelikleri (Task 9)
- Produces: `#kesit` bölümü — pinned, 3 duraklı scrub

- [ ] **Step 1: GSAP'i kur**

```bash
npm install gsap
```

- [ ] **Step 2: Reduced-motion sözleşmesi testini yaz**

```ts
describe('kesit sahnesi', () => {
  it('scrub scripti YALNIZCA ana sayfaya yüklenir', () => {
    const home = readFileSync('dist/index.html', 'utf8');
    const other = readFileSync('dist/pricing/index.html', 'utf8');
    const scriptOf = (html: string) =>
      [...parseHTML(html).document.querySelectorAll('script[src]')]
        .map((s) => s.getAttribute('src'))
        .join(' ');
    // GSAP yalnızca ana sayfanın bundle grafiğinde olmalı
    expect(scriptOf(home)).not.toBe(scriptOf(other));
  });

  it('üç durak da HTML içinde statik olarak var — JS olmadan okunur', () => {
    const html = readFileSync('dist/index.html', 'utf8');
    expect(html).toContain('Sahaya gelen alıcı');
    const { document } = parseHTML(html);
    expect(document.querySelectorAll('#kesit [data-stop]').length).toBe(3);
  });
});
```

- [ ] **Step 3: Testi çalıştır, başarısız olduğunu doğrula**

Run: `npm run verify`
Expected: FAIL.

- [ ] **Step 4: kesit-scrub.ts'i yaz**

```ts
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const scene = document.querySelector<HTMLElement>('#kesit');

if (scene && !reduce) {
  gsap.registerPlugin(ScrollTrigger);

  const stops = [...scene.querySelectorAll<HTMLElement>('[data-stop]')];
  const floors = [...scene.querySelectorAll<SVGGElement>('[data-floor]')];
  const plane = scene.querySelector<HTMLElement>('[data-cut-plane]')!;
  const photo = scene.querySelector<HTMLElement>('[data-photo]')!;

  gsap.set(stops.slice(1), { autoAlpha: 0 });
  gsap.set(photo, { autoAlpha: 0 });

  ScrollTrigger.create({
    trigger: scene,
    start: 'top top',
    end: () => `+=${window.innerHeight * 2.4}`,
    pin: true,
    scrub: 0.6,
    onUpdate(self) {
      const p = self.progress;

      // kesit düzlemi bina boyunca yükselir
      gsap.set(plane, { yPercent: -p * 100 });

      // aktif kat işareti
      const active = Math.min(floors.length - 1, Math.floor(p * floors.length));
      floors.forEach((f, i) => f.setAttribute('data-active', String(i === active)));

      // duraklar
      const stopIndex = Math.min(stops.length - 1, Math.floor(p * stops.length));
      stops.forEach((s, i) => gsap.to(s, { autoAlpha: i === stopIndex ? 1 : 0, duration: 0.25 }));

      // son durakta çizim → fotoğraf
      gsap.set(photo, { autoAlpha: Math.max(0, (p - 0.66) / 0.34) });
    },
  });
}
```

- [ ] **Step 5: #kesit bölümünü index.astro'ya ekle**

Pinned kapsayıcı. İçinde: `BuildingSection` (büyük), `[data-cut-plane]` (kesik çizgili yatay düzlem, `--brick`), üç `[data-stop]` metin bloğu (`site.home.kesit` + `capabilities` metinlerinden), ve `[data-photo]` (iç mekân fotoğrafı, `AVIF/WebP`, `loading="eager"`).

**Kritik:** Üç durağın da metni HTML'de statik olarak bulunur; `autoAlpha` yalnızca görünürlüğü yönetir. JS çalışmasa veya reduced-motion aktifse üç blok da normal akışta okunur.

`Base.astro` çağrısı: `<Base ... heavy={true}>`.

- [ ] **Step 6: Reduced-motion'ı elle doğrula**

Chrome DevTools → Rendering → `prefers-reduced-motion: reduce` → ana sayfayı gez.
Expected: pin yok, scrub yok, üç durak da görünür, fotoğraf görünür, sayfa dikey akar.

- [ ] **Step 7: Doğrula ve commit**

Run: `npm run verify`

```bash
git add -A
git commit -m "feat: kesit sahnesi — scroll scrub ve çizim→fotoğraf geçişi"
```

---

## Task 12: Ana sayfa — kalan bölümler

**Files:**
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Yayın durumu testini yaz**

```ts
describe('yayın durumu bölümü', () => {
  it('sicil damgası ve sıfır dolgulu sayılar var', () => {
    const html = readFileSync('dist/index.html', 'utf8');
    expect(html).toContain('YAYIN DURUMU · 08.09.2026');
    expect(html).toMatch(/>01</);
    expect(html).toMatch(/>02</);
    expect(html).toMatch(/>04</);
  });
});

describe('3 adımda bölümü', () => {
  it('pafta numaralandırması kullanır', () => {
    const html = readFileSync('dist/index.html', 'utf8');
    for (const no of ['01/03', '02/03', '03/03']) expect(html).toContain(no);
  });
});
```

- [ ] **Step 2: Testi çalıştır, başarısız olduğunu doğrula**

Run: `npm run verify`
Expected: FAIL.

- [ ] **Step 3: Üç kabiliyet bölümünü yaz**

`site.home.capabilities` üzerinden üçleme. Her biri: `SheetRule` + `. 01` numarası, kicker (mono), `h2`, gövde, `Button variant="ghost"`, ve **kod ile çizilen arayüz temsili** (spec §7.1 Bölüm 3): `.01` kat seçici minyatürü, `.02` firma sayfası kartı, `.03` kurulum akış diyagramı. Ekran görüntüsü kullanılmaz.

- [ ] **Step 4: Yayın durumu bölümünü yaz**

`--ink` zemin, `.on-dark`. Üstte `site.home.status.stamp` mono damga, altında üç `<Metric />` yatay dizili, aralarında saç teli kural.

- [ ] **Step 5: 3 adımda ve CTA bölümlerini yaz**

`site.home.steps` üçlemesi, `01/03` numaralandırmasıyla. Sonda CTA bloğu: `site.ctaPrimary` + "Örnek turu gezin".

- [ ] **Step 6: Doğrula ve commit**

Run: `npm run verify`

```bash
git add -A
git commit -m "feat: ana sayfa — kabiliyetler, yayın durumu, adımlar, CTA"
```

---

## Task 13: /features ve /about

**Files:**
- Create: `src/pages/features.astro`, `src/pages/about.astro`
- Modify: `tests/pages.test.ts` — `ROUTES` dizisine ekle

- [ ] **Step 1: ROUTES'u genişlet ve testi çalıştır**

`tests/pages.test.ts` içindeki `ROUTES` dizisini `['index', 'features', 'about']` yap.
Run: `npm run verify` → FAIL (sayfalar yok).

- [ ] **Step 2: features.astro'yu yaz**

`site.features` içeriğinden. "Alıcı tarafı" (6 özellik) ve "Firma tarafı" (4 özellik) iki karşılıklı pafta olarak; her pafta kendi `SheetRule` başlığı ve numaralandırmasıyla. `.reveal` sınıfı ile giriş animasyonu. Sonda ortak CTA bloğu.

- [ ] **Step 3: about.astro'yu yaz**

`site.about.keyline` ("Kat planı ve düz fotoğraf bir daireyi anlatmıyor.") tam genişlik tipografik an: `--t-display` boyutunda, `--ink` zemin üzerinde, üstünde ve altında cömert boşluk. Ardından üç paragraf, sonra dört taahhüt 2×2 pafta gridinde.

- [ ] **Step 4: Doğrula ve commit**

Run: `npm run verify`

```bash
git add -A
git commit -m "feat: /features ve /about sayfaları"
```

---

## Task 14: /pricing

**Files:**
- Create: `src/pages/pricing.astro`
- Modify: `tests/pages.test.ts`

- [ ] **Step 1: Fiyatlandırma testini yaz**

```ts
describe('/pricing', () => {
  it('üç planı ve fiyatları taşır', () => {
    const html = readFileSync('dist/pricing/index.html', 'utf8');
    for (const s of ['Başlangıç', 'Profesyonel', 'Kurumsal', '₺2.900', '₺7.900']) {
      expect(html).toContain(s);
    }
  });

  it('En popüler rozeti pafta etiketi — yuvarlak pill değil', () => {
    const { document } = parseHTML(readFileSync('dist/pricing/index.html', 'utf8'));
    const badge = [...document.querySelectorAll('.sheet-label')]
      .find((e) => e.textContent?.includes('En popüler'));
    expect(badge).toBeTruthy();
    expect(badge!.className).not.toContain('chip');
  });

  it('SSS native details kullanır — JS gerektirmez', () => {
    const { document } = parseHTML(readFileSync('dist/pricing/index.html', 'utf8'));
    expect(document.querySelectorAll('details').length).toBeGreaterThanOrEqual(2);
  });
});
```

- [ ] **Step 2: Testi çalıştır, başarısız olduğunu doğrula**

Run: `npm run verify` → FAIL.

- [ ] **Step 3: pricing.astro'yu yaz**

Üç kolon `grid-12` (her biri 4 kolon), aralarında dikey saç teli. Sıfır dekorasyon, `--radius-structural: 0`. Fiyat `--t-display` boyutunda, `font-feature-settings: "tnum" 1`. "En popüler" → `<SheetLabel text="En popüler" tone="brick" />`. Özellik listeleri `✓` yerine mono `+` işaretiyle. Altta üç güvence şeridi + `<Accordion items={site.pricing.faq} />`.

- [ ] **Step 4: Doğrula ve commit**

Run: `npm run verify`

```bash
git add -A
git commit -m "feat: /pricing sayfası"
```

---

## Task 15: /contact

**Files:**
- Create: `src/pages/contact.astro`, `src/scripts/contact-form.ts`
- Modify: `tests/pages.test.ts`

- [ ] **Step 1: Form erişilebilirlik testini yaz**

```ts
describe('/contact formu', () => {
  const { document } = parseHTML(readFileSync('dist/contact/index.html', 'utf8'));

  it('her alanın bağlı bir label\'ı var', () => {
    const controls = [...document.querySelectorAll('input, textarea')]
      .filter((c) => c.getAttribute('type') !== 'checkbox');
    expect(controls.length).toBeGreaterThan(0);
    for (const c of controls) {
      const id = c.getAttribute('id');
      expect(id, 'kontrolde id yok').toBeTruthy();
      expect(document.querySelector(`label[for="${id}"]`), `${id} için label yok`).toBeTruthy();
    }
  });

  it('KVKK onay kutusu var ve zorunlu', () => {
    const kvkk = document.querySelector('input[type="checkbox"][name="kvkk"]');
    expect(kvkk).toBeTruthy();
    expect(kvkk!.hasAttribute('required')).toBe(true);
  });

  it('mono antet bloğu iletişim bilgilerini taşır', () => {
    const html = readFileSync('dist/contact/index.html', 'utf8');
    expect(html).toContain('merhaba@konutverse.com');
    expect(html).toContain('Maslak, Sarıyer / İstanbul');
    expect(html).toContain('09:00 – 18:00');
  });
});
```

- [ ] **Step 2: Testi çalıştır, başarısız olduğunu doğrula**

Run: `npm run verify` → FAIL.

- [ ] **Step 3: contact.astro'yu yaz**

`grid-12`: sol 7 kolon form (`<Field />` bileşenleriyle: Ad Soyad, Firma, E-posta, Telefon, Mesajınız + KVKK checkbox), sağ 5 kolon mono antet bloğu (`--ink` zemin, saç teli kurallarla ayrılmış satırlar: E-POSTA / ADRES / ÇALIŞMA SAATLERİ).

- [ ] **Step 4: contact-form.ts'i yaz — istemci tarafı doğrulama**

```ts
const form = document.querySelector<HTMLFormElement>('#demo-form');
const status = document.querySelector<HTMLElement>('#form-status');

form?.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }
  // Gerçek gönderim kapsam dışı (spec §3). Görsel durum gösterilir.
  status!.textContent = 'Demo talebiniz alındı. 1 iş günü içinde dönüş yapılacak.';
  status!.dataset.state = 'success';
  form.reset();
});
```

`#form-status` `aria-live="polite"` taşır.

- [ ] **Step 5: Doğrula ve commit**

Run: `npm run verify`

```bash
git add -A
git commit -m "feat: /contact sayfası ve form doğrulaması"
```

---

## Task 16: /search

**Files:**
- Create: `src/pages/search.astro`, `src/components/site/ProjectSheet.astro`
- Modify: `tests/pages.test.ts`

**Interfaces:**
- Produces: `ProjectSheet` props: `{ project: Project }`

- [ ] **Step 1: Proje kartı testini yaz**

```ts
import { projects } from '../src/content/projects';

describe('/search', () => {
  const html = readFileSync('dist/search/index.html', 'utf8');

  it('her projeyi pafta antet bloğu olarak render eder', () => {
    for (const p of projects) {
      expect(html).toContain(p.name);
      expect(html).toContain(p.firm);
      expect(html).toContain(`${p.district}, ${p.city}`);
    }
  });

  it('teknik göstergeyi aşama verisiyle gösterir', () => {
    expect(html).toContain('Boya');
    expect(html).toContain('%75');
    expect(html).toContain('Teslim');
    expect(html).toContain('%100');
  });

  it('fiyatları Türkçe biçimde basar', () => {
    expect(html).toContain('5.750.000');
    expect(html).toContain('4.450.000');
  });
});
```

- [ ] **Step 2: Testi çalıştır, başarısız olduğunu doğrula**

Run: `npm run verify` → FAIL.

- [ ] **Step 3: ProjectSheet.astro'yu yaz**

Pafta antet bloğu düzeni:
- Üst satır: firma adı (mono, `--brick-lit`) + `SheetLabel text="360° Tur"`
- Proje adı: `--t-h2`, display
- Konum: mono
- Minik cephe diyagramı: `BuildingSection` küçük ölçekte (floors × unitsPerFloor)
- `<ProgressGauge label={project.stage} pct={project.stagePct} />`
- Alt satır: kat / daire / gezilebilir sayıları mono, `tnum` ile hizalı
- Fiyat: `--t-h2` display, `'den başlayan fiyatlarla` mono küçük
- CTA: "Turu Başlat →"

Fiyat biçimi: `new Intl.NumberFormat('tr-TR').format(project.priceFrom)`.

- [ ] **Step 4: Filtre panelini yaz**

Sol 3 kolon drafting paneli: İnşaat Firması, İl / İlçe, Kat Aralığı, Daire Tipi, Metrekare. Native `<select>` ve `<input type="range">`; `--radius-control`. "Filtreleri Temizle" ve "Sonuçları Göster (2)" butonları. Filtreleme istemci tarafında `data-*` nitelikleriyle, sıfır bağımlılık.

- [ ] **Step 5: Doğrula ve commit**

Run: `npm run verify`

```bash
git add -A
git commit -m "feat: /search — pafta antet bloğu proje kartları ve filtre paneli"
```

---

## Task 17: /demo

**Files:**
- Create: `src/pages/demo.astro`, `src/components/viz/HandoffPanel.astro`
- Modify: `tests/pages.test.ts`

**Interfaces:**
- Produces: `HandoffPanel` props: `{ }` — `<dialog>` tabanlı devir paneli

- [ ] **Step 1: Sahte ürün yasağı testini yaz**

```ts
describe('/demo', () => {
  const html = readFileSync('dist/demo/index.html', 'utf8');
  const { document } = parseHTML(html);

  it('12 katı cephe olarak dizer', () => {
    expect(document.querySelectorAll('[data-elevation-floor]').length).toBe(12);
  });

  it('kat başına 4 daire hücresi var ve hepsi klavye erişilebilir', () => {
    const cells = document.querySelectorAll('[data-elevation-floor] button[data-unit]');
    expect(cells.length).toBe(48);
    for (const c of cells) expect(c.getAttribute('aria-label')?.length).toBeGreaterThan(0);
  });

  it('sahte 360° görüntüleyici üretmez — sınırı açıkça beyan eder', () => {
    expect(html).toContain('360° GÖRÜNTÜLEYİCİ · MEVCUT SİSTEM · KAPSAM DIŞI');
    expect(html).toContain('https://konutverse.com/demo');
    // panorama/viewer kütüphanesi yüklenmemeli
    expect(html).not.toMatch(/pannellum|photo-sphere|three\.module/i);
  });
});
```

- [ ] **Step 2: Testi çalıştır, başarısız olduğunu doğrula**

Run: `npm run verify` → FAIL.

- [ ] **Step 3: demo.astro'yu yaz**

`<ElevationStack project={dumanErsa} tourableUnits={['0-1','2-1','2-3']} />`.
12 kat, en üstte 11. kat, en altta 0. kat (gerçek cephe sırası). Her satır: kot etiketi (`+0.00` … `+35.20`), kat adı, `AvailabilityGrid` 4 hücre. Gezilebilir daireler `--brick` çerçeveli ve `SheetLabel text="360°"` taşır.

- [ ] **Step 4: HandoffPanel.astro'yu yaz**

Native `<dialog>`. Bir daire hücresine tıklanınca açılır. İçerik:
- Daire künyesi: kat, daire no, m², durum (`StatusChip`)
- Mono sınır beyanı: `360° GÖRÜNTÜLEYİCİ · MEVCUT SİSTEM · KAPSAM DIŞI`
- Açıklama satırı: turun mevcut sistemde açıldığı
- `Button` → `https://konutverse.com/demo` (`target="_blank" rel="noopener noreferrer"`)
- Kapat butonu; `Escape` ile kapanır, odak açan hücreye döner

```ts
// src/scripts/demo-handoff.ts
const dialog = document.querySelector<HTMLDialogElement>('#handoff')!;
let opener: HTMLElement | null = null;

document.querySelectorAll<HTMLButtonElement>('button[data-unit]').forEach((btn) => {
  btn.addEventListener('click', () => {
    opener = btn;
    dialog.querySelector('[data-unit-id]')!.textContent = btn.dataset.unit!;
    dialog.querySelector('[data-unit-floor]')!.textContent = btn.dataset.floor!;
    dialog.showModal();
  });
});

dialog.addEventListener('close', () => opener?.focus());
```

- [ ] **Step 5: Doğrula ve commit**

Run: `npm run verify`

```bash
git add -A
git commit -m "feat: /demo — cephe seçici ve devir paneli"
```

---

## Task 18: Doğrulama ve teslim raporu

**Files:**
- Create: `docs/VERIFICATION.md`

**Bu task hiçbir özellik eklemez. Spec §12'nin sekiz maddesini fiilen çalıştırır ve sonucu rakamla raporlar.**

- [ ] **Step 1: Build ve test paketi**

Run: `npm run verify`
Expected: build hatasız, tüm testler PASS. Sayıyı not al.

- [ ] **Step 2: Rota bütünlüğü**

```bash
npx astro build
ls dist/*.html dist/*/index.html
```
8 rotanın tamamının üretildiğini doğrula. Ardından tüm iç `href`leri topla ve her birinin `dist` içinde karşılığı olduğunu kontrol et — kırık link sıfır olmalı.

- [ ] **Step 3: Lighthouse**

```bash
npm run build && npx astro preview --port 4321 &
npx lighthouse http://localhost:4321/ --preset=desktop --output=json --output-path=./lh-home.json --quiet
```
8 rotanın tamamı için tekrarla (mobil ve masaüstü). Spec §10 hedefleri: Performans ≥ 92, Erişilebilirlik 100, Best Practices ≥ 95, SEO ≥ 95.

**Hedef karşılanmazsa rakamla raporla; "tamamlandı" deme.**

- [ ] **Step 4: JS bütçesi ölçümü**

```bash
find dist/_astro -name "*.js" -exec sh -c 'printf "%s " "$1"; gzip -c "$1" | wc -c' _ {} \;
```
Ana sayfanın yüklediği toplamı ≤ 80 KB, diğer sayfaları ≤ 20 KB gzip olarak doğrula.

- [ ] **Step 5: Klavye-only geçiş**

8 sayfanın tamamında yalnızca `Tab` / `Shift+Tab` / `Enter` / `Escape` ile gez. Kontrol listesi:
- Skip link ilk odakta görünür
- Her odaklanabilir öğede görünür focus halkası
- `/demo` devir paneli `Escape` ile kapanır, odak açan hücreye döner
- `/pricing` akordiyonu klavyeyle açılır
- Kesit sahnesinin pin'i odak tuzağı oluşturmaz

- [ ] **Step 6: Reduced-motion geçişi**

DevTools → Rendering → `prefers-reduced-motion: reduce`. 8 sayfayı gez.
Expected: Lenis kapalı, scrub kapalı, kesit tam çizili, fotoğraf görünür, tüm içerik okunur.

- [ ] **Step 7: Viewport geçişi**

360 / 768 / 1024 / 1440 / 1920 px. Yatay taşma sıfır olmalı. Kot rayının 1024px altında yatay ilerleme rayına döndüğünü doğrula.

- [ ] **Step 8: Kontrast raporu**

`src/lib/contrast.ts` ile sitede fiilen kullanılan her metin/zemin çiftini ölç. Tabloyu `docs/VERIFICATION.md`'ye yaz. AA altında kalan çift sıfır olmalı.

- [ ] **Step 9: İmza sistemi portatiflik doğrulaması**

Boş bir `test.html` oluştur, yalnızca `signature.js` yükle, tarayıcıda aç:
```html
<!doctype html><html><body style="padding:40px">
<script src="./signature.js" defer></script>
<alis-signature variant="stacked" theme="light"></alis-signature>
<alis-signature variant="inline" theme="dark"></alis-signature>
</body></html>
```
Expected: Astro, build adımı ve CSS olmadan doğru render.

- [ ] **Step 10: VERIFICATION.md'yi yaz ve commit**

Her maddenin sonucunu rakamla yaz. Geçmeyen madde varsa açıkça listele.

```bash
git add -A
git commit -m "docs: doğrulama raporu"
```

---

## Öz-inceleme notları

**Spec kapsamı:** §4 → Task 9-11 · §5.1 → Task 3 · §5.2 → Task 2 · §5.3-5.4 → Task 2,3 · §5.5 → Task 3,11 · §6 → Task 5,6,9 · §7.1 → Task 10,11,12 · §7.2 → Task 13 · §7.3 → Task 14 · §7.4 → Task 13 · §7.5 → Task 15 · §7.6 → Task 16 · §7.7 → Task 17 · §7.8 → Task 7 · §8.1-8.4 → Task 7 · §8.5 → Task 8 · §9 → Task 1,3 · §10 → Task 18 · §11 → Task 10,12 · §12 → Task 18. **Kapsanmayan spec bölümü yok.**

**Tip tutarlılığı:** `Project` tipi Task 4'te tanımlanır; Task 16 ve 17 aynı alan adlarını kullanır (`floors`, `units`, `tourable`, `stage`, `stagePct`, `priceFrom`). `credits` şeması Task 7'de tanımlanır; Task 8 aynı alanları bağımsız olarak yeniden bildirir (portatiflik gereği, kasıtlı yinelenme — README'de belgelenmiştir). `contrastRatio` imzası Task 2'de sabitlenir, Task 18 Adım 8 aynı imzayı kullanır.

**Bilinen kısaltma:** Task 4 Adım 4'te `site.ts`'in `features`, `pricing`, `contact`, `footer` blokları kısaltılmıştır. Bu bir placeholder değil, kaynağı belirtilmiş bir kopyalama işidir — metinler canlı `konutverse.com`dan `curl` ile çekilip birebir aktarılacaktır; adımda komutlar verilmiştir.
