import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { parseHTML } from 'linkedom';
import { credits } from '../src/components/signature/credits';

/** İmza her sayfada bulunmak zorunda — bu liste sayfa eklendikçe büyür. */
const PAGES = [
  'dist/index.html',
  'dist/features/index.html',
  'dist/about/index.html',
  'dist/pricing/index.html',
  'dist/kunye/index.html',
];

const docOf = (file: string) => parseHTML(readFileSync(file, 'utf8')).document;

// ── Katman 0 ────────────────────────────────────────────────
describe('Katman 0 — makine katmanı', () => {
  for (const file of PAGES) {
    it(`${file}: author meta ve rel=author var`, () => {
      const d = docOf(file);
      expect(d.querySelector('meta[name="author"]')?.getAttribute('content')).toBe(
        credits.maker.name
      );
      expect(d.querySelector('link[rel="author"]')?.getAttribute('href')).toBe(
        credits.maker.url
      );
    });

    it(`${file}: JSON-LD creator düğümü Alis Dijital'e işaret eder`, () => {
      const blocks = [...docOf(file).querySelectorAll('script[type="application/ld+json"]')];
      expect(blocks.length).toBeGreaterThan(0);

      const graph = blocks
        .map((b) => JSON.parse(b.textContent!))
        .flatMap((d: any) => d['@graph'] ?? [d]);

      const agency = graph.find((n: any) => String(n['@id'] ?? '').includes('alisdijital'));
      expect(agency, 'ajans Organization düğümü yok').toBeTruthy();
      expect(agency.name).toBe(credits.maker.name);
      expect(agency.url).toBe(credits.maker.url);

      const website = graph.find((n: any) => n['@type'] === 'WebSite');
      expect(website.creator['@id']).toBe(agency['@id']);

      // publisher müşteri, creator ajans — ikisi karışmamalı
      expect(website.publisher['@id']).not.toBe(agency['@id']);
    });

    it(`${file}: JSON-LD geçerli JSON`, () => {
      for (const b of docOf(file).querySelectorAll('script[type="application/ld+json"]')) {
        expect(() => JSON.parse(b.textContent!)).not.toThrow();
      }
    });
  }

  it('humans.txt yayınlanır ve ajansı adlandırır', () => {
    expect(existsSync('dist/humans.txt')).toBe(true);
    const txt = readFileSync('dist/humans.txt', 'utf8');
    expect(txt).toContain(credits.maker.name);
    expect(txt).toContain(credits.maker.url);
  });
});

// ── Katman 1 ────────────────────────────────────────────────
describe('Katman 1 — marka', () => {
  for (const file of PAGES) {
    it(`${file}: footer'da künyeye giden marka var`, () => {
      const mark = docOf(file).querySelector('footer a[href="/kunye"]');
      expect(mark, `${file} imza markası taşımıyor`).toBeTruthy();
      expect(mark!.textContent).toContain(credits.maker.name);
    });
  }

  it('monogram gerçek SVG — favicon değil', () => {
    const mark = docOf('dist/index.html').querySelector('footer a[href="/kunye"]');
    const svg = mark!.querySelector('svg');
    expect(svg, 'monogram SVG değil').toBeTruthy();
    expect(mark!.querySelector('img'), 'favicon <img> kullanılmış').toBeNull();
  });

  it('monogram pathLength ile normalize — çizim animasyonu tam kontrollü', () => {
    const svg = docOf('dist/index.html').querySelector('footer a[href="/kunye"] svg')!;
    const paths = [...svg.querySelectorAll('path')];
    expect(paths.length).toBeGreaterThanOrEqual(3);
    for (const p of paths) expect(p.getAttribute('pathLength')).toBe('1');
  });

  it('marka erişilebilir bir isim taşır', () => {
    const mark = docOf('dist/index.html').querySelector('footer a[href="/kunye"]')!;
    expect(mark.getAttribute('aria-label')).toContain(credits.maker.name);
  });
});

// ── Katman 2 ────────────────────────────────────────────────
describe('Katman 2 — künye sayfası', () => {
  const html = () => readFileSync('dist/kunye/index.html', 'utf8');

  it('ajansın kimlik bilgilerini taşır', () => {
    const h = html();
    for (const line of credits.maker.credentials) expect(h).toContain(line);
    expect(h).toContain(credits.artDirection);
    expect(h).toContain(credits.accessibility);
    expect(h).toContain(credits.project);
  });

  it('tipografi ve teknoloji künyesi eksiksiz', () => {
    const h = html();
    for (const t of credits.typography) expect(h).toContain(t);
    for (const t of credits.technology) expect(h).toContain(t);
  });

  it('semantik tanım listesi kullanır — düz metin değil', () => {
    const d = docOf('dist/kunye/index.html');
    expect(d.querySelectorAll('dl').length).toBeGreaterThan(0);
    expect(d.querySelectorAll('dt').length).toBeGreaterThanOrEqual(9);
  });

  it('dış linki yeni sekmede ve güvenli açar', () => {
    const a = docOf('dist/kunye/index.html').querySelector(`a[href="${credits.maker.url}"]`);
    expect(a).toBeTruthy();
    expect(a!.getAttribute('rel')).toContain('noopener');
    expect(a!.getAttribute('target')).toBe('_blank');
  });

  it('sayfada tek h1 var', () => {
    expect(docOf('dist/kunye/index.html').querySelectorAll('h1').length).toBe(1);
  });
});

// ── Katman 3 ────────────────────────────────────────────────
describe('Katman 3 — konsol imzası', () => {
  it('konsol scripti ajans künyesini taşır', () => {
    const src = readFileSync('src/scripts/console-signature.ts', 'utf8');
    expect(src).toContain('console.log');
    expect(src).toContain('credits.maker.url');
  });
});

// ── Katman 4 ────────────────────────────────────────────────
describe('Katman 4 — web component portatifliği', () => {
  const SOURCE = readFileSync('src/components/signature/signature.js', 'utf8');

  it('boş bir HTML sayfasında Astro/framework olmadan render eder', () => {
    const w = parseHTML('<!doctype html><html><body></body></html>');
    const { document, customElements, HTMLElement } = w as any;

    // Bileşenin ihtiyaç duyduğu global ortam — başka hiçbir şey yok
    const sandbox = { customElements, HTMLElement, Reflect, Object, console };
    // eslint-disable-next-line no-new-func
    new Function(...Object.keys(sandbox), SOURCE)(...Object.values(sandbox));

    document.body.innerHTML = '<alis-signature variant="inline"></alis-signature>';
    const el = document.querySelector('alis-signature') as any;
    customElements.upgrade(el);

    expect(el.shadowRoot, 'shadow root oluşmadı').toBeTruthy();
    const html = el.shadowRoot.innerHTML;
    expect(html).toContain('Alis Dijital');
    expect(el.shadowRoot.querySelector('svg')).toBeTruthy();
    expect(el.shadowRoot.querySelector('a')?.getAttribute('href')).toBe('/kunye');
  });

  it('href niteliği künye yolunu değiştirebilir', () => {
    const w = parseHTML('<!doctype html><html><body></body></html>');
    const { document, customElements, HTMLElement } = w as any;
    const sandbox = { customElements, HTMLElement, Reflect, Object, console };
    // eslint-disable-next-line no-new-func
    new Function(...Object.keys(sandbox), SOURCE)(...Object.values(sandbox));

    document.body.innerHTML = '<alis-signature href="/credits"></alis-signature>';
    const el = document.querySelector('alis-signature') as any;
    customElements.upgrade(el);
    expect(el.shadowRoot.querySelector('a')?.getAttribute('href')).toBe('/credits');
  });

  it('stil host sayfaya sızmaz — shadow DOM kullanır', () => {
    expect(SOURCE).toContain('attachShadow');
  });

  it('host token bağımlılığı taşımaz — yalnız kendi --ad-* değişkenleri', () => {
    const vars = SOURCE.match(/var\(--[a-z0-9-]+/gi) ?? [];
    expect(vars.length).toBeGreaterThan(0);
    for (const v of vars) expect(v).toMatch(/var\(--ad-/);
  });

  it('hiçbir şey import/require etmez — tek dosya, sıfır bağımlılık', () => {
    expect(SOURCE).not.toMatch(/^\s*import\s/m);
    expect(SOURCE).not.toMatch(/\brequire\s*\(/);
  });

  it('monogramı Astro sürümüyle aynı yolları taşır', () => {
    const astro = readFileSync('src/components/signature/Monogram.astro', 'utf8');
    for (const d of ['M1 21 L7 3 L13 21', 'M3.2 16 H10.8', 'M17 3 H20 A9 9 0 0 1 20 21 H17 Z']) {
      expect(astro, `Astro monogramında ${d} yok`).toContain(d);
      expect(SOURCE, `web component monogramında ${d} yok`).toContain(d);
    }
  });

  it('reduced-motion ve print stilleri taşır', () => {
    expect(SOURCE).toContain('prefers-reduced-motion');
    expect(SOURCE).toContain('@media print');
  });

  it('üç varyantı da destekler', () => {
    for (const v of ['inline', 'compact', 'stacked']) expect(SOURCE).toContain(v);
  });
});

describe('Katman 4 — yayın', () => {
  it('public/signature.js kaynakla birebir aynı — tek kaynak korunuyor', () => {
    const src = readFileSync('src/components/signature/signature.js', 'utf8');
    const pub = readFileSync('public/signature.js', 'utf8');
    expect(pub).toBe(src);
  });

  it('build çıktısında /signature.js yayınlanır', () => {
    expect(existsSync('dist/signature.js')).toBe(true);
  });

  it('taşınabilirlik demosu framework kullanmadan bileşeni yükler', () => {
    const demo = readFileSync('public/signature-demo.html', 'utf8');
    expect(demo).toContain('src="/signature.js"');
    expect(demo).toContain('<alis-signature');
    // Hiçbir framework/CDN yüklenmemeli
    expect(demo).not.toMatch(/react|vue|jquery|tailwind|cdn\./i);
  });
});
