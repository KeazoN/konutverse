import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { parseHTML } from 'linkedom';
import { gzipSync } from 'node:zlib';
import { projects } from '../src/content/projects';

const DIST = 'dist';

/** Build edilmiş bir rotanın HTML yolu. */
export const pathFor = (route: string) =>
  route === 'index' ? `${DIST}/index.html` : `${DIST}/${route}/index.html`;

/**
 * Yayınlanan CSS'in tamamı. Astro `inlineStylesheets: 'always'` ile
 * stilleri HTML'e gömüyor (mobilde render-blocking istekleri sıfırlamak
 * için), o yüzden hem gömülü <style> blokları hem varsa dış dosyalar
 * birlikte okunur.
 */
function bundledCss(route = 'index'): string {
  const { document } = parseHTML(readFileSync(pathFor(route), 'utf8'));

  const inline = [...document.querySelectorAll('style')]
    .map((s) => s.textContent ?? '')
    .join('\n');

  const external = [...document.querySelectorAll('link[rel="stylesheet"]')]
    .map((l) => readFileSync(`${DIST}${l.getAttribute('href')}`, 'utf8'))
    .join('\n');

  return inline + '\n' + external;
}

const ROUTES = ['index', 'features', 'about', 'pricing', 'contact', 'search', 'demo'];

/** Ana menüde yer alan rotalar — aria-current yalnızca bunlarda beklenir. */
const NAV_HREFS = ['/', '/features', '/pricing', '/about', '/contact'];

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
  it('display fontu değişken eksenlerle yüklenir', () => {
    const css = bundledCss();
    expect(css).toContain('woff2-variations');
    // Minify boşlukları siler; karşılaştırmadan önce normalize et
    const flat = css.replace(/\s+/g, '');
    expect(flat).toContain('font-weight:100900');
  });

  it('üç ses de yüklenir — display serif, gövde sans, teknik mono', () => {
    const css = bundledCss();
    expect(css).toContain('Fraunces');
    expect(css).toContain('Instrument Sans');
    expect(css).toContain('IBM Plex Mono');
  });

  /**
   * Fontlar sabit yolla self-host edilir (public/fonts). Yalnızca
   * Türkçe için gereken latin + latin-ext yayınlanır; vietnamese ve
   * cyrillic hiç kopyalanmaz. Mobil simülasyonda bant genişliğini
   * bu yük belirliyor.
   */
  it('font yükü mobil bütçe içinde (< 260 KB)', () => {
    const dir = `${DIST}/fonts`;
    const files = readdirSync(dir).filter((f) => f.endsWith('.woff2'));
    expect(files.length).toBe(8);
    const total = files.reduce((n, f) => n + statSync(`${dir}/${f}`).size, 0);
    const kb = total / 1024;
    expect(kb, `${kb.toFixed(0)} KB`).toBeLessThan(260);
  });

  it('gereksiz alt küme yayınlanmaz', () => {
    const files = readdirSync(`${DIST}/fonts`).join(' ');
    expect(files).not.toMatch(/vietnamese|cyrillic|greek/);
  });

  it('kritik fontlar ön yüklenir — CLS için şart', () => {
    const { document } = parseHTML(readFileSync(pathFor('index'), 'utf8'));
    const pre = [...document.querySelectorAll('link[rel="preload"][as="font"]')];
    expect(pre.length).toBeGreaterThanOrEqual(1);
    for (const l of pre) {
      expect(l.getAttribute('crossorigin')).not.toBeNull();
      expect(l.getAttribute('href')).toMatch(/^\/fonts\//);
    }
  });

  it('CSS render-blocking istek üretmez — HTML içine gömülü', () => {
    for (const route of ROUTES) {
      const { document } = parseHTML(readFileSync(pathFor(route), 'utf8'));
      expect(
        document.querySelectorAll('link[rel="stylesheet"]').length,
        `/${route} render-blocking CSS yüklüyor`
      ).toBe(0);
    }
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

    // aria-current yalnızca ANA MENÜDEKİ sayfalar için anlamlıdır.
    // /search, /demo, /kunye menüde değildir (canlı sitede de değil);
    // yönlendirmeyi sayfa başlığındaki kicker sağlar.
    const inNav = NAV_HREFS.includes(route === 'index' ? '/' : `/${route}`);

    it(`/${route}: ${inNav ? 'aktif sayfa aria-current ile işaretli' : 'menü dışı — sayfa kendi başlığıyla yönlendirir'}`, () => {
      const d = doc();
      if (inNav) {
        const current = d.querySelector('nav a[aria-current="page"]');
        expect(current).toBeTruthy();
        expect(current!.getAttribute('href')).toBe(route === 'index' ? '/' : `/${route}`);
      } else {
        expect(d.querySelector('nav a[aria-current="page"]')).toBeNull();
        // Menü dışı sayfa nerede olduğunu kendi başlık bloğunda söylemeli
        expect(d.querySelector('h1')?.textContent?.trim().length).toBeGreaterThan(0);
      }
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

  /**
   * GSAP artık ilk yükte HİÇ gelmiyor: kesit sahnesi ekranın altında
   * olduğu için IntersectionObserver yaklaşınca dinamik import ediyor.
   * Bu yüzden ana sayfanın ilk JS'i de küçük olmalı.
   */
  it('ağır hareket ilk yükte gelmiyor — tembel yükleniyor', () => {
    const bytes = jsBytesOf('index');
    expect(bytes, `ana sayfa ilk JS ${(bytes / 1024).toFixed(1)} KB`).toBeLessThan(15 * 1024);
  });

  it('GSAP ayrı bir parçaya bölünmüş ve ilk yükte referans edilmiyor', () => {
    const { document } = parseHTML(readFileSync(pathFor('index'), 'utf8'));
    const eager = [...document.querySelectorAll('script[src]')]
      .map((s) => readFileSync(`${DIST}${s.getAttribute('src')}`, 'utf8'))
      .join('');
    // Kütüphanenin kendisi ilk yüklenen dosyalarda bulunmamalı
    expect(eager).not.toContain('ScrollTrigger.create');
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

describe('/contact formu', () => {
  const doc = () => parseHTML(readFileSync('dist/contact/index.html', 'utf8')).document;

  it('her alanin bagli bir labelı var', () => {
    const d = doc();
    const controls = [...d.querySelectorAll('input, textarea')]
      .filter((c) => c.getAttribute('type') !== 'checkbox');
    expect(controls.length).toBe(5);
    for (const c of controls) {
      const id = c.getAttribute('id');
      expect(id, 'kontrolde id yok').toBeTruthy();
      expect(d.querySelector(`label[for="${id}"]`), `${id} icin label yok`).toBeTruthy();
    }
  });

  it('KVKK onay kutusu var ve zorunlu', () => {
    const kvkk = doc().querySelector('input[type="checkbox"][name="kvkk"]');
    expect(kvkk).toBeTruthy();
    expect(kvkk!.hasAttribute('required')).toBe(true);
    expect(doc().querySelector('label[for="f-kvkk"]')).toBeTruthy();
  });

  it('durum bolgesi ekran okuyucuya duyurulur', () => {
    const s = doc().querySelector('#form-status');
    expect(s).toBeTruthy();
    expect(s!.getAttribute('aria-live')).toBe('polite');
  });

  it('mono antet blogu iletisim bilgilerini tasir', () => {
    const h = readFileSync('dist/contact/index.html', 'utf8');
    expect(h).toContain('merhaba@konutverse.com');
    expect(h).toContain('Maslak, Sarıyer / İstanbul');
    expect(h).toContain('09:00 – 18:00');
  });

  it('autocomplete ipuclari tanimli', () => {
    const d = doc();
    expect(d.querySelector('#f-eposta')?.getAttribute('autocomplete')).toBe('email');
    expect(d.querySelector('#f-ad')?.getAttribute('autocomplete')).toBe('name');
  });

  it('e-posta alani type=email', () => {
    expect(doc().querySelector('#f-eposta')?.getAttribute('type')).toBe('email');
  });
});

describe('/search', () => {
  const doc = () => parseHTML(readFileSync('dist/search/index.html', 'utf8')).document;
  const html = () => readFileSync('dist/search/index.html', 'utf8');

  it('her projeyi pafta antet blogu olarak render eder', () => {
    const h = html();
    for (const p of projects) {
      expect(h).toContain(p.name);
      expect(h).toContain(p.firm);
      expect(h).toContain(`${p.district}, ${p.city}`);
    }
    expect(doc().querySelectorAll('[data-project]').length).toBe(projects.length);
  });

  it('teknik gostergeyi asama verisiyle gosterir', () => {
    const h = html();
    expect(h).toContain('Boya');
    expect(h).toContain('%75');
    expect(h).toContain('Teslim');
    expect(h).toContain('%100');
  });

  it('fiyatlari Turkce bicimde basar', () => {
    const h = html();
    expect(h).toContain('5.750.000');
    expect(h).toContain('4.450.000');
  });

  it('filtreler native select — klavye erisilebilir ve label bagli', () => {
    const d = doc();
    const selects = [...d.querySelectorAll('.filters__control')];
    expect(selects.length).toBeGreaterThanOrEqual(5);
    for (const el of selects) {
      const id = el.getAttribute('id')!;
      expect(d.querySelector(`label[for="${id}"]`), `${id} icin label yok`).toBeTruthy();
    }
  });

  it('sonuc sayaci ekran okuyucuya duyurulur', () => {
    const c = doc().querySelector('[data-result-count]');
    expect(c?.getAttribute('aria-live')).toBe('polite');
    expect(c?.textContent).toContain('(2)');
  });

  it('JS olmadan tum projeler gorunur — asamali iyilestirme', () => {
    for (const card of doc().querySelectorAll('[data-project]')) {
      expect(card.hasAttribute('hidden')).toBe(false);
    }
  });
});

describe('/demo', () => {
  const doc = () => parseHTML(readFileSync('dist/demo/index.html', 'utf8')).document;
  const html = () => readFileSync('dist/demo/index.html', 'utf8');

  it('12 kati cephe olarak dizer', () => {
    expect(doc().querySelectorAll('[data-elevation-floor]').length).toBe(12);
  });

  it('kat basina 4 daire hucresi — 48 daire, hepsi klavye erisilebilir', () => {
    const cells = doc().querySelectorAll('[data-elevation-floor] button[data-unit]');
    expect(cells.length).toBe(48);
    for (const c of cells) {
      expect(c.getAttribute('type')).toBe('button');
      expect(c.getAttribute('aria-label')?.length).toBeGreaterThan(10);
    }
  });

  it('en ust kat once dizilir — gercek cephe sirasi', () => {
    const first = doc().querySelector('[data-elevation-floor]');
    expect(first?.getAttribute('data-elevation-floor')).toBe('11');
  });

  it('3 gezilebilir daire isaretli — proje verisiyle tutarli', () => {
    const tourable = doc().querySelectorAll('[data-unit][data-tourable="true"]');
    expect(tourable.length).toBe(3);
  });

  it('SAHTE 360° goruntuleyici URETMEZ — sinir acikca beyan edilir', () => {
    const h = html();
    expect(h).toContain('360° GÖRÜNTÜLEYİCİ · MEVCUT SİSTEM · KAPSAM DIŞI');
    expect(h).toContain('https://konutverse.com/demo');
    // Hicbir panorama/viewer kutuphanesi yuklenmemeli
    expect(h).not.toMatch(/pannellum|photo-sphere|marzipano|krpano/i);
  });

  it('devir paneli native <dialog> — odak tuzagi ve Escape yerlesik', () => {
    const dlg = doc().querySelector('dialog#handoff');
    expect(dlg).toBeTruthy();
    expect(dlg!.getAttribute('aria-labelledby')).toBe('handoff-title');
    expect(doc().querySelector('#handoff-title')).toBeTruthy();
  });

  it('gercek siteye cikis guvenli acilir', () => {
    const a = doc().querySelector('a[href="https://konutverse.com/demo"]');
    expect(a?.getAttribute('rel')).toContain('noopener');
    expect(a?.getAttribute('target')).toBe('_blank');
  });

  it('musaitlik lejandi var', () => {
    const h = html();
    for (const s of ['Boş', 'Rezerve', 'Satıldı', '360° turu var']) {
      expect(h).toContain(s);
    }
  });
});

describe('ana sayfa — açık tema, fotoğraf öncelikli', () => {
  const doc = () => parseHTML(readFileSync('dist/index.html', 'utf8')).document;
  const html = () => readFileSync('dist/index.html', 'utf8');

  it('canlı sitedeki başlığı birebir taşır', () => {
    const h1 = doc().querySelector('h1')!.textContent!.replace(/\s+/g, ' ').trim();
    expect(h1).toBe('Alıcı daireyi gezip randevuya geliyor');
  });

  it('hero GERÇEK fotoğrafla açılır — soyut çizim değil', () => {
    const img = doc().querySelector('.hero__media img');
    expect(img, 'hero fotoğrafı yok').toBeTruthy();
    expect(img!.getAttribute('src')).toMatch(/^\/img\/hero-poster-\d+\.jpg$/);
    expect(img!.getAttribute('alt')?.length).toBeGreaterThan(10);
    // Boyut verilmeli: yoksa görsel yüklenince sayfa zıplar
    expect(img!.getAttribute('width')).toBeTruthy();
    expect(img!.getAttribute('height')).toBeTruthy();
  });

  it('görseller responsive sunulur — WebP + iki genişlik', () => {
    const d = doc();
    const webp = [...d.querySelectorAll('.hero__media source[type="image/webp"]')];
    expect(webp.length, 'WebP kaynağı yok').toBeGreaterThan(0);
    const all = webp.map((s) => s.getAttribute('srcset')).join(' ');
    expect(all).toContain('900w');
    expect(all).toContain('1600w');
    expect(d.querySelector('.hero__media img')!.getAttribute('sizes')).toBeTruthy();
  });


  it('yayınlanan görseller mobil bütçe içinde — en büyük tek dosya < 260 KB', () => {
    const files = readdirSync(`${DIST}/img`).filter((f) => /\.(jpg|webp)$/.test(f));
    expect(files.length).toBeGreaterThan(0);
    for (const f of files) {
      const kb = statSync(`${DIST}/img/${f}`).size / 1024;
      expect(kb, `${f} ${kb.toFixed(0)} KB`).toBeLessThan(260);
    }
  });

  it('hero görseli öncelikli yüklenir — LCP öğesi', () => {
    expect(doc().querySelector('.hero__media img')?.getAttribute('fetchpriority')).toBe('high');
  });

  it('üç kabiliyetin her biri gerçek daire fotoğrafı taşır', () => {
    const imgs = [...doc().querySelectorAll('.cap__media img')];
    expect(imgs.length).toBe(3);
    for (const img of imgs) {
      expect(img.getAttribute('src')).toMatch(/^\/img\//);
      expect(img.getAttribute('alt')?.length).toBeGreaterThan(10);
    }
    // İlki katlamaya yakın: eager. Diğerleri lazy.
    expect(imgs[0].getAttribute('loading')).toBe('eager');
    expect(imgs.slice(1).map((i) => i.getAttribute('loading'))).toEqual(['lazy', 'lazy']);
  });

  it('yayın durumu tarihli sicil damgası ve sıfır dolgulu sayılar', () => {
    expect(html()).toContain('YAYIN DURUMU · 08.09.2026');
    const values = [...doc().querySelectorAll('.status__value')].map((e) => e.textContent);
    expect(values).toEqual(['01', '02', '04']);
  });

  it('3 adımda pafta referansı numaralandırması', () => {
    const h = html();
    for (const no of ['01/03', '02/03', '03/03']) expect(h).toContain(no);
  });

  it('#nasil çapası var — footer linki kırık değil', () => {
    expect(doc().querySelector('#nasil')).toBeTruthy();
  });

  it('başlık hiyerarşisi geçerli — tek h1, birden çok h2', () => {
    const d = doc();
    expect(d.querySelectorAll('h1').length).toBe(1);
    expect(d.querySelectorAll('h2').length).toBeGreaterThanOrEqual(4);
  });
});

describe('/search — fotoğraflı proje kartları', () => {
  const doc = () => parseHTML(readFileSync('dist/search/index.html', 'utf8')).document;

  it('her kart gerçek fotoğrafla açılır — çizim değil', () => {
    const cards = [...doc().querySelectorAll('[data-project]')];
    expect(cards.length).toBe(projects.length);
    for (const c of cards) {
      const img = c.querySelector('.card__media img');
      expect(img, 'kart fotoğrafı yok').toBeTruthy();
      expect(img!.getAttribute('src')).toMatch(/^\/img\//);
    }
  });
});
