import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { parseHTML } from 'linkedom';

const DIST = 'dist';

/** Build edilmiş bir rotanın HTML yolu. */
export const pathFor = (route: string) =>
  route === 'index' ? `${DIST}/index.html` : `${DIST}/${route}/index.html`;

/** dist/_astro içindeki tüm CSS'i tek metin olarak döndürür. */
function bundledCss(): string {
  return readdirSync(`${DIST}/_astro`)
    .filter((f) => f.endsWith('.css'))
    .map((f) => readFileSync(`${DIST}/_astro/${f}`, 'utf8'))
    .join('\n');
}

const ROUTES = ['index'];

describe('build çıktısı', () => {
  it('ana sayfayı üretir', () => {
    expect(existsSync(`${DIST}/index.html`)).toBe(true);
  });

  it('dili Türkçe olarak işaretler', () => {
    expect(readFileSync(`${DIST}/index.html`, 'utf8')).toContain('lang="tr"');
  });
});

describe('layout sözleşmesi', () => {
  for (const route of ROUTES) {
    const doc = () => parseHTML(readFileSync(pathFor(route), 'utf8')).document;

    it(`/${route}: tek h1 var`, () => {
      expect(doc().querySelectorAll('h1').length).toBe(1);
    });

    it(`/${route}: title ve description dolu`, () => {
      const d = doc();
      expect(d.querySelector('title')?.textContent?.trim().length).toBeGreaterThan(0);
      const desc = d.querySelector('meta[name="description"]')?.getAttribute('content');
      expect(desc?.trim().length).toBeGreaterThan(0);
    });

    it(`/${route}: viewport ve canonical var`, () => {
      const d = doc();
      expect(d.querySelector('meta[name="viewport"]')).toBeTruthy();
      expect(d.querySelector('link[rel="canonical"]')).toBeTruthy();
    });

    it(`/${route}: skip link ilk odaklanabilir öğe`, () => {
      expect(doc().querySelector('body a')?.getAttribute('href')).toBe('#main');
    });

    it(`/${route}: main landmark var`, () => {
      expect(doc().querySelector('main#main')).toBeTruthy();
    });
  }
});

describe('tipografi yüklemesi', () => {
  it('Archivo GENİŞLİK ekseniyle yüklenir — standard.css, index.css değil', () => {
    const css = bundledCss();
    expect(css).toContain('Archivo Variable');
    // font-stretch bildirimi yoksa wdth ekseni yüklenmemiş demektir
    expect(css).toContain('font-stretch');
  });

  it('üç ayrı aile de yüklenir — tek Inter problemi çözüldü', () => {
    const css = bundledCss();
    expect(css).toContain('Archivo Variable');
    expect(css).toContain('IBM Plex Mono');
    expect(css).toContain('Inter Variable');
  });

  it('Türkçe için latin-ext alt kümesi mevcut (ğ ş ı İ)', () => {
    const fonts = readdirSync(`${DIST}/_astro`).filter((f) => f.endsWith('.woff2'));
    expect(fonts.some((f) => f.includes('latin-ext'))).toBe(true);
  });

  it('fontlar self-host — üçüncü taraf font CDN yok', () => {
    for (const route of ROUTES) {
      const html = readFileSync(pathFor(route), 'utf8');
      expect(html).not.toContain('fonts.googleapis.com');
      expect(html).not.toContain('fonts.gstatic.com');
    }
  });
});
