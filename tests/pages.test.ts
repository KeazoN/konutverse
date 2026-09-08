import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { parseHTML } from 'linkedom';
import { gzipSync } from 'node:zlib';

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

const ROUTES = ['index', 'features', 'about', 'pricing'];

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

describe('kesit sahnesi', () => {
  const doc = () => parseHTML(readFileSync('dist/index.html', 'utf8')).document;
  const html = () => readFileSync('dist/index.html', 'utf8');

  it('üç durak da HTML içinde STATİK — JS olmadan okunur', () => {
    const stops = doc().querySelectorAll('#kesit [data-stop]');
    expect(stops.length).toBe(3);
    for (const s of stops) expect(s.textContent!.trim().length).toBeGreaterThan(10);
  });

  it('canlı sitedeki kesit metnini birebir taşır', () => {
    const h = html();
    expect(h).toContain('Sahaya gelen alıcı');
    expect(h).toContain('daireyi zaten gezmiş olur');
    expect(h).toContain('görüşme tanıtımla değil fiyat konuşmasıyla başlıyor');
  });

  it('kesit ve mekân katmanlarının ikisi de DOM\'da', () => {
    const d = doc();
    expect(d.querySelector('[data-layer="section"]')).toBeTruthy();
    expect(d.querySelector('[data-layer="room"]')).toBeTruthy();
  });

  it('perspektif mekân erişilebilir etiket taşır ve fotoğraf DEĞİL', () => {
    const d = doc();
    const room = d.querySelector('[data-layer="room"] svg[role="img"]');
    expect(room).toBeTruthy();
    expect(room!.getAttribute('aria-label')).toContain('360°');
    // Stok fotoğraf kullanılmadı — çizgi diliyle çizildi
    expect(d.querySelector('[data-layer="room"] img')).toBeNull();
  });

  it('kesit düzlemi ve scrub kancaları var', () => {
    const d = doc();
    expect(d.querySelector('[data-kesit]')).toBeTruthy();
    expect(d.querySelector('[data-cut-plane]')).toBeTruthy();
  });

  it('scrub varsayılan olarak KAPALI — JS açar, yoksa içerik statik kalır', () => {
    expect(doc().querySelector('[data-kesit]')!.getAttribute('data-scrub')).toBeNull();
  });
});

describe('JS bütçesi (spec §9)', () => {
  const BUDGET = { home: 80 * 1024, other: 20 * 1024 };

  const jsBytesOf = (route: string): number => {
    const { document } = parseHTML(readFileSync(pathFor(route), 'utf8'));
    const srcs = [...document.querySelectorAll('script[src]')]
      .map((s) => s.getAttribute('src')!)
      .filter((s) => s.startsWith('/'));
    let total = 0;
    for (const src of srcs) {
      total += gzipSync(readFileSync(`dist${src}`)).length;
    }
    return total;
  };

  it(`ana sayfa <= ${BUDGET.home / 1024} KB gzip`, () => {
    const bytes = jsBytesOf('index');
    expect(bytes, `ana sayfa ${(bytes / 1024).toFixed(1)} KB`).toBeLessThanOrEqual(BUDGET.home);
  });

  it(`künye sayfası <= ${BUDGET.other / 1024} KB gzip — ağır hareket yüklenmiyor`, () => {
    const bytes = jsBytesOf('kunye');
    expect(bytes, `künye ${(bytes / 1024).toFixed(1)} KB`).toBeLessThanOrEqual(BUDGET.other);
  });

  it('ağır hareket YALNIZCA ana sayfada — bundle gerçekten bölünmüş', () => {
    const home = jsBytesOf('index');
    const other = jsBytesOf('kunye');
    // GSAP + ScrollTrigger en az 30 KB gzip ekler
    expect(home - other).toBeGreaterThan(30 * 1024);
  });
});

describe('ana sayfa — kalan bölümler', () => {
  const doc = () => parseHTML(readFileSync('dist/index.html', 'utf8')).document;
  const html = () => readFileSync('dist/index.html', 'utf8');

  it('üç kabiliyet bloğu, pafta numaralarıyla', () => {
    const h = html();
    for (const no of ['. 01', '. 02', '. 03']) expect(h).toContain(no);
    expect(doc().querySelectorAll('.caps__item').length).toBe(3);
  });

  it('kabiliyet görselleri KOD İLE çizilmiş — ekran görüntüsü yok', () => {
    const figs = [...doc().querySelectorAll('.caps__figure')];
    expect(figs.length).toBe(3);
    for (const f of figs) {
      expect(f.querySelector('svg'), 'SVG temsili yok').toBeTruthy();
      expect(f.querySelector('img'), 'ekran görüntüsü kullanılmış').toBeNull();
    }
  });

  it('kabiliyet görselleri erişilebilir etiket taşır', () => {
    for (const svg of doc().querySelectorAll('.caps__figure svg')) {
      expect(svg.getAttribute('aria-label')?.length).toBeGreaterThan(10);
    }
  });

  it('yayın durumu: tarihli sicil damgası ve sıfır dolgulu sayılar', () => {
    const h = html();
    expect(h).toContain('YAYIN DURUMU · 08.09.2026');
    const values = [...doc().querySelectorAll('.metric__value')].map((e) => e.textContent);
    expect(values).toEqual(['01', '02', '04']);
  });

  it('3 adımda: pafta referansı numaralandırması', () => {
    const h = html();
    for (const no of ['01/03', '02/03', '03/03']) expect(h).toContain(no);
  });

  it('adım metinleri canlı siteyle birebir', () => {
    const h = html();
    expect(h).toContain('Daire fotoğraflarınızı ve varsa kat planlarını iletin');
    expect(h).toContain('Bina, kat ve daire yapısını kurup odaları birbirine bağlıyoruz');
  });

  it('başlık hiyerarşisi geçerli — tek h1, h2 atlanmamış', () => {
    const d = doc();
    expect(d.querySelectorAll('h1').length).toBe(1);
    expect(d.querySelectorAll('h2').length).toBeGreaterThanOrEqual(4);
  });

  it('#nasil çapası var — footer linki kırık değil', () => {
    expect(doc().querySelector('#nasil')).toBeTruthy();
  });
});

describe('/pricing', () => {
  const doc = () => parseHTML(readFileSync('dist/pricing/index.html', 'utf8')).document;
  const html = () => readFileSync('dist/pricing/index.html', 'utf8');

  it('uc plani ve fiyatlari canli siteyle ayni tasir', () => {
    const h = html();
    for (const s of ['Baslangic', 'Profesyonel', 'Kurumsal']) {
      expect(h).toContain(s.replace('Baslangic', 'Başlangıç'));
    }
    for (const s of ['₺2.900', '₺7.900']) expect(h).toContain(s);
  });

  it('En populer rozeti pafta etiketi — yuvarlak pill DEGIL', () => {
    const badge = [...doc().querySelectorAll('.sheet-label')]
      .find((e) => e.textContent?.includes('En popüler'));
    expect(badge, 'pafta etiketi bulunamadi').toBeTruthy();
    expect(badge!.getAttribute('class')).not.toContain('chip');
  });

  it('SSS native details — JS gerektirmez', () => {
    expect(doc().querySelectorAll('details').length).toBeGreaterThanOrEqual(6);
  });

  it('alti SSS sorusunun tamami var', () => {
    const h = html();
    expect(h).toContain('Turu kurmak için 360° kamera şart mı?');
    expect(h).toContain('Sözleşme ve iptal nasıl işliyor?');
  });

  it('KDV notu ve uc guvence var', () => {
    const h = html();
    expect(h).toContain('Fiyatlara KDV dahil değildir.');
    for (const s of ['Taahhüt yok', 'Kurulum ücreti yok', 'Kart bilgisi istenmez']) {
      expect(h).toContain(s);
    }
  });

  it('tam olarak bir plan one cikarilmis', () => {
    expect(doc().querySelectorAll('.plan--featured').length).toBe(1);
  });
});
