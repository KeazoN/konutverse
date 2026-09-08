import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { parseHTML } from 'linkedom';

const BACKSLASH = String.fromCharCode(92);
const DIST = 'dist';

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) walk(p, out);
    else out.push(p.split(BACKSLASH).join('/'));
  }
  return out;
}

/**
 * signature-demo.html bir SİTE sayfası değil: imza sisteminin
 * framework'süz çalıştığını kanıtlayan bağımsız test aracı.
 * Bilerek chrome'suz, h1'siz ve skip link'sizdir.
 */
const STANDALONE = ['signature-demo.html'];

const pages = walk(DIST).filter(
  (f) => f.endsWith('.html') && !STANDALONE.some((x) => f.endsWith(x))
);

/** dist içindeki bir HTML dosyasının kanonik rotası. */
const routeOf = (file: string) =>
  file.replace(`${DIST}`, '').replace(/\/index\.html$/, '').replace(/\.html$/, '') || '/';

const routes = new Set(pages.map(routeOf));

describe('rota bütünlüğü', () => {
  it('sekiz rotanın tamamı üretilir', () => {
    for (const r of ['/', '/features', '/pricing', '/about', '/contact', '/search', '/demo', '/kunye', '/privacy']) {
      expect(routes.has(r), `${r} üretilmemiş`).toBe(true);
    }
  });

  it('beklenmeyen sayfa yok', () => {
    expect(pages.length).toBe(9);
  });
});

describe('iç link bütünlüğü — kırık link sıfır olmalı', () => {
  for (const file of pages) {
    it(`${routeOf(file)}: tüm iç linkler bir sayfaya gidiyor`, () => {
      const { document } = parseHTML(readFileSync(file, 'utf8'));
      const broken: string[] = [];

      for (const a of document.querySelectorAll('a[href]')) {
        const href = a.getAttribute('href')!;

        // Dış link, mail, tel ve çapa atlanır
        if (/^(https?:|mailto:|tel:|#)/.test(href)) continue;

        const [path] = href.split(/[?#]/);
        const target = path.replace(/\/$/, '') || '/';

        // Statik dosya olabilir (ör. /signature.js)
        const isFile = existsSync(`${DIST}${path}`);
        if (!routes.has(target) && !isFile) broken.push(href);
      }

      expect(broken, `kırık link: ${broken.join(', ')}`).toEqual([]);
    });
  }
});

describe('sayfa içi çapa bütünlüğü', () => {
  for (const file of pages) {
    it(`${routeOf(file)}: aynı sayfadaki çapalar hedefini buluyor`, () => {
      const { document } = parseHTML(readFileSync(file, 'utf8'));
      const missing: string[] = [];

      for (const a of document.querySelectorAll('a[href^="#"]')) {
        const href = a.getAttribute('href')!;
        if (href === '#') continue;
        if (!document.querySelector(href)) missing.push(href);
      }

      expect(missing, `hedefsiz çapa: ${missing.join(', ')}`).toEqual([]);
    });
  }
});

describe('erişilebilirlik temel sözleşmeleri', () => {
  for (const file of pages) {
    const { document } = parseHTML(readFileSync(file, 'utf8'));
    const route = routeOf(file);

    it(`${route}: her sayfada tam olarak bir h1`, () => {
      expect(document.querySelectorAll('h1').length).toBe(1);
    });

    it(`${route}: başlık seviyesi atlanmıyor`, () => {
      const levels = [...document.querySelectorAll('h1,h2,h3,h4')]
        .map((h) => Number(h.tagName[1]));
      for (let i = 1; i < levels.length; i++) {
        expect(
          levels[i] - levels[i - 1],
          `${route}: h${levels[i - 1]} sonrası h${levels[i]} geliyor`
        ).toBeLessThanOrEqual(1);
      }
    });

    it(`${route}: her görselin alt metni var`, () => {
      for (const img of document.querySelectorAll('img')) {
        expect(img.hasAttribute('alt'), `${route}: alt'sız img`).toBe(true);
      }
    });

    it(`${route}: anlamlı SVG'lerde etiket, dekoratiflerde aria-hidden`, () => {
      for (const svg of document.querySelectorAll('svg')) {
        const labelled =
          svg.getAttribute('role') === 'img' && (svg.getAttribute('aria-label') ?? '').length > 0;
        const hidden = svg.getAttribute('aria-hidden') === 'true';
        const inHiddenParent = svg.closest('[aria-hidden="true"]') !== null;
        expect(
          labelled || hidden || inHiddenParent,
          `${route}: etiketsiz ve gizlenmemiş SVG`
        ).toBe(true);
      }
    });

    it(`${route}: her butonun erişilebilir adı var`, () => {
      for (const btn of document.querySelectorAll('button')) {
        const name =
          (btn.getAttribute('aria-label') ?? '') + (btn.textContent ?? '');
        expect(name.trim().length, `${route}: adsız buton`).toBeGreaterThan(0);
      }
    });

    it(`${route}: dış linkler güvenli açılır`, () => {
      for (const a of document.querySelectorAll('a[target="_blank"]')) {
        expect(
          a.getAttribute('rel') ?? '',
          `${route}: ${a.getAttribute('href')} rel=noopener taşımıyor`
        ).toContain('noopener');
      }
    });

    it(`${route}: skip link var ve main'e gidiyor`, () => {
      const skip = document.querySelector('body a');
      expect(skip?.getAttribute('href')).toBe('#main');
      expect(document.querySelector('main#main')).toBeTruthy();
    });
  }
});

describe('hareket erişilebilirliği', () => {
  // CSS HTML'e gömülü (inlineStylesheets: 'always'), dosyadan değil
  // sayfadan okunur.
  const css = pages
    .map((f) => {
      const { document } = parseHTML(readFileSync(f, 'utf8'));
      return [...document.querySelectorAll('style')].map((s) => s.textContent ?? '').join('\n');
    })
    .join('\n');

  it('reduced-motion kuralı yayınlanan CSS içinde', () => {
    expect(css).toContain('prefers-reduced-motion');
  });

  it('hareketli scriptler reduced-motion kontrolü yapıyor', () => {
    for (const f of ['reveal.ts', 'lenis-init.ts']) {
      const src = readFileSync(`src/scripts/${f}`, 'utf8');
      expect(src, `${f} reduced-motion kontrolü yok`).toContain('prefers-reduced-motion');
    }
  });
});
