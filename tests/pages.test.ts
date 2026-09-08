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

describe('navigasyon sözleşmesi', () => {
  for (const route of ROUTES) {
    const doc = () => parseHTML(readFileSync(pathFor(route), 'utf8')).document;

    it(`/${route}: beş nav linkinin tamamı var`, () => {
      const hrefs = [...doc().querySelectorAll('nav a[href]')].map((a) => a.getAttribute('href'));
      for (const href of ['/', '/features', '/pricing', '/about', '/contact']) {
        expect(hrefs).toContain(href);
      }
    });

    it(`/${route}: aktif sayfa aria-current ile işaretli`, () => {
      const current = doc().querySelector('nav a[aria-current="page"]');
      expect(current).toBeTruthy();
    });

    it(`/${route}: header ve footer landmark'ları var`, () => {
      const d = doc();
      expect(d.querySelector('header')).toBeTruthy();
      expect(d.querySelector('footer')).toBeTruthy();
    });

    it(`/${route}: mobil menü native details — JS gerektirmez`, () => {
      expect(doc().querySelector('header details')).toBeTruthy();
    });
  }
});

describe('ana sayfa hero', () => {
  const doc = () => parseHTML(readFileSync('dist/index.html', 'utf8')).document;
  const html = () => readFileSync('dist/index.html', 'utf8');

  it('canlı sitedeki başlığı birebir taşır', () => {
    const h1 = doc().querySelector('h1')!.textContent!.replace(/\s+/g, ' ').trim();
    expect(h1).toBe('Alıcı daireyi gezip randevuya geliyor');
  });

  it('teknik künye şeridi gerçek proje verisini gösterir', () => {
    const h = html();
    // Kaynak metin DOĞAL halde; büyük harfi CSS text-transform yapar.
    // JS ile büyütmek Türkçe 'i' harfini bozardı (MELİKGAZİ -> MELIKGAZI).
    for (const s of ['DUMAN-ERSA ORT.', '12 kat', '48 daire', 'Melikgazi, Kayseri']) {
      expect(h).toContain(s);
    }
  });

  it('künye şeridi CSS ile büyütülür — kaynakta bozuk Türkçe yok', () => {
    const cap = doc().querySelector('.techcap')!;
    expect(cap.textContent).toContain('Melikgazi');
    expect(cap.textContent).not.toContain('MELIKGAZI');
  });

  it('bina kesiti erişilebilir etiket taşıyan gerçek SVG', () => {
    const svg = doc().querySelector('.hero__figure svg[role="img"]');
    expect(svg).toBeTruthy();
    expect(svg!.getAttribute('aria-label')).toContain('12 katlı');
  });

  it('kesit 12 katı da çizer, gezilebilir katlar işaretli', () => {
    const d = doc();
    expect(d.querySelectorAll('.hero__figure [data-floor]').length).toBe(12);
    expect(d.querySelectorAll('.hero__figure .sec__floor--tourable').length).toBe(2);
  });

  it('kesit çizgileri pathLength ile normalize — çizim animasyonu kontrollü', () => {
    const lines = [...doc().querySelectorAll('.hero__figure line')];
    expect(lines.length).toBeGreaterThan(20);
    for (const l of lines) expect(l.getAttribute('pathLength')).toBe('1');
  });

  it('başlık iki satır olarak kurulur — sarma tesadüfe bırakılmaz', () => {
    expect(doc().querySelectorAll('h1 .hero__line').length).toBe(2);
  });

  it('kot rayı gerçek kot değerleri taşır', () => {
    const h = html();
    for (const kot of ['+35.20', '+25.60', '+16.00', '+6.40', '+0.00']) {
      expect(h).toContain(kot);
    }
  });
});
