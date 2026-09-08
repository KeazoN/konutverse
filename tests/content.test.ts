import { describe, it, expect } from 'vitest';
import { site } from '../src/content/site';
import { projects, kotOf, formatPrice, featuredProject } from '../src/content/projects';

describe('site içeriği', () => {
  it('5 navigasyon öğesi taşır ve rotalar canlı siteyle aynı', () => {
    expect(site.nav).toHaveLength(5);
    expect(site.nav.map((n) => n.href)).toEqual([
      '/', '/features', '/pricing', '/about', '/contact',
    ]);
  });

  it('hiçbir metin alanı boş değil', () => {
    const walk = (v: unknown): void => {
      if (typeof v === 'string') expect(v.trim().length).toBeGreaterThan(0);
      else if (typeof v === 'function') return;
      else if (Array.isArray(v)) v.forEach(walk);
      else if (v && typeof v === 'object') Object.values(v).forEach(walk);
    };
    walk(site);
  });

  it('canlı sitedeki hero başlığını birebir korur', () => {
    expect(site.home.hero.title.join(' ')).toBe('Alıcı daireyi gezip randevuya geliyor');
  });

  it('about sayfasının anahtar cümlesini korur — sanat yönünün dayanağı', () => {
    expect(site.about.keyline).toBe('Kat planı ve düz fotoğraf bir daireyi anlatmıyor.');
  });

  it('üç fiyat planını canlı siteyle aynı taşır', () => {
    expect(site.pricing.plans.map((p) => p.name)).toEqual([
      'Başlangıç', 'Profesyonel', 'Kurumsal',
    ]);
    expect(site.pricing.plans.map((p) => p.price)).toEqual(['₺2.900', '₺7.900', 'Özel']);
  });

  it('tam olarak bir plan öne çıkarılmış', () => {
    expect(site.pricing.plans.filter((p) => p.featured)).toHaveLength(1);
  });

  it('altı SSS maddesi taşır', () => {
    expect(site.pricing.faq).toHaveLength(6);
  });

  it('features 6 alıcı + 4 firma özelliği taşır', () => {
    expect(site.features.buyer.items).toHaveLength(6);
    expect(site.features.firm.items).toHaveLength(4);
  });

  it('KVKK onayı iletişim akışında tanımlı', () => {
    expect(site.contact.kvkk.linkLabel).toContain('KVKK');
    expect(site.contact.kvkk.rest).toContain('onay veriyorum');
  });

  it('demo sayfası 360° sınırını açıkça beyan eder', () => {
    expect(site.demo.handoff.boundary).toContain('KAPSAM DIŞI');
    expect(site.demo.handoff.href).toBe('https://konutverse.com/demo');
  });
});

describe('proje verisi', () => {
  it('gerçek ERSA projelerini taşır', () => {
    expect(projects).toHaveLength(2);
    expect(projects.find((p) => p.slug === 'duman-ersa-ort')).toMatchObject({
      firm: 'ERSA İNŞAAT',
      name: 'DUMAN-ERSA ORT.',
      floors: 12,
      units: 48,
      tourable: 3,
      stage: 'Boya',
      stagePct: 75,
    });
  });

  it('gezilebilir daire sayısı toplam daireyi aşmaz', () => {
    for (const p of projects) expect(p.tourable).toBeLessThanOrEqual(p.units);
  });

  it('aşama yüzdesi 0–100 aralığında', () => {
    for (const p of projects) {
      expect(p.stagePct).toBeGreaterThanOrEqual(0);
      expect(p.stagePct).toBeLessThanOrEqual(100);
    }
  });

  it('öne çıkan proje 12 katlı olan', () => {
    expect(featuredProject.floors).toBe(12);
  });
});

describe('biçimlendirme yardımcıları', () => {
  it('kot değerlerini iki ondalıkla üretir', () => {
    expect(kotOf(0)).toBe('+0.00');
    expect(kotOf(1)).toBe('+3.20');
    expect(kotOf(11)).toBe('+35.20');
  });

  it('fiyatları Türkçe biçimde basar', () => {
    expect(formatPrice(5_750_000)).toBe('5.750.000');
    expect(formatPrice(4_450_000)).toBe('4.450.000');
  });
});
