import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { THEME_COLOR } from '../src/lib/brand';

const tokens = readFileSync('src/styles/tokens.css', 'utf8');

const REQUIRED = [
  // Zeminler — sıcak açık palet
  '--paper', '--sand', '--linen', '--stone',
  // Metin
  '--ink', '--ink-2', '--ink-3', '--text-2', '--text-3',
  // Vurgu
  '--brick', '--brick-ink', '--brick-lit', '--brick-wash',
  // Koyu yüzey (az kullanılır)
  '--ink-surface', '--on-ink', '--on-ink-2',
  // Durum
  '--avail-free', '--avail-sold', '--avail-reserved',
  // Tipografi
  '--t-hero', '--t-display-xl', '--t-display', '--t-h1', '--t-h2', '--t-h3',
  '--t-lead', '--t-body', '--t-small', '--t-tech',
  '--font-display', '--font-tech', '--font-body',
  // Form / uzay / hareket
  '--radius-structural', '--radius-control', '--radius-pill',
  '--ease', '--dur-fast', '--dur-base', '--dur-draw',
  '--max-w', '--gutter',
];

/** `--ink` gibi bir token adının bildirimini bulur. */
function declarationOf(name: string): string | null {
  const re = new RegExp(name + '\\s*:([^;]+);');
  const m = tokens.match(re);
  return m ? m[1].trim() : null;
}

describe('tokens.css', () => {
  for (const name of REQUIRED) {
    it(`${name} tanımlı`, () => {
      expect(declarationOf(name)).not.toBeNull();
    });
  }

  it('yapısal yarıçap sıfır — jenerik SaaS yuvarlatması yok', () => {
    expect(declarationOf('--radius-structural')).toBe('0');
  });

  /**
   * Mevcut sitenin problemi: --font-display / --font-serif / --font-mono
   * / --font-sans token'larının DÖRDÜ de "Inter" idi. Tipografik ses yoktu.
   *
   * Yeni sistem: İKİ superaile, ÜÇ ses. Display ile gövde ayrımı
   * üçüncü bir aileden değil, Archivo'nun GENİŞLİK EKSENİNDEN gelir.
   */
  it('teknik katman gövdeden ayrı bir aile', () => {
    expect(declarationOf('--font-tech')).toContain('Plex Mono');
    expect(declarationOf('--font-tech')).not.toBe(declarationOf('--font-body'));
  });

  it('display serif, gövde sans — üç ayrı aile', () => {
    expect(declarationOf('--font-display')).toContain('Fraunces');
    expect(declarationOf('--font-body')).toContain('Instrument Sans');
    expect(declarationOf('--font-tech')).toContain('Plex Mono');
  });

  it('üç ses gerçekten üç AYRI aile', () => {
    const fams = ['--font-display', '--font-tech', '--font-body']
      .map((n) => declarationOf(n)!.split(',')[0].trim());
    expect(new Set(fams).size).toBe(3);
  });

  it('Fraunces eksenleri ciddi tonda sabitlenmiş — WONK kapalı', () => {
    const display = declarationOf('--fraunces-display')!;
    expect(display).toContain('"WONK" 0');
    expect(display).toContain('"opsz" 144');
  });

  it('mevcut sitenin tek-aile problemi geri gelmemiş', () => {
    const fams = ['--font-display', '--font-tech', '--font-body'].map((n) => declarationOf(n));
    expect(fams.every((f) => f && f.includes('Inter'))).toBe(false);
    expect(fams.every((f) => f && f.includes('Archivo'))).toBe(false);
  });

  it('gövde metni 15px değil 17px — mevcut sitenin çekingen ölçeği düzeltildi', () => {
    expect(declarationOf('--t-body')).toBe('17px');
  });

  it('tipografi ölçeği mevcut sitenin çekingen tavanını aşar', () => {
    // Mevcut site: --t-display tavanı 52px. Yeni ölçek belirgin biçimde iri.
    expect(declarationOf('--t-display')).toContain('68px');
    expect(declarationOf('--t-display-xl')).toContain('132px');
  });

  it('AÇIK zemin varsayılan — koyu yüzey istisna', () => {
    const base = readFileSync('src/styles/base.css', 'utf8');
    expect(base).toContain('background: var(--paper)');
    expect(base).toContain('color: var(--ink)');
  });

  it('reduced-motion altında tüm süreleri sıfırlar', () => {
    expect(tokens).toContain('prefers-reduced-motion: reduce');
  });
});

// <meta name="theme-color"> CSS değişkeni kabul etmez, literal ister.
// Kopya kaçınılmaz; bu test kopyanın token'dan KAYMASINI engeller.
describe('brand.ts / tokens.css eşleşmesi', () => {
  it('THEME_COLOR ile --ink aynı değer', () => {
    expect(THEME_COLOR).toBe(declarationOf('--ink'));
  });
});

const BACKSLASH = String.fromCharCode(92);

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) walk(p, out);
    else out.push(p.split(BACKSLASH).join('/'));
  }
  return out;
}

describe('ham değer yasağı', () => {
  const EXEMPT = ['src/styles/tokens.css', 'src/components/signature/signature.css'];
  const files = walk('src').filter(
    (f) => /\.(css|astro)$/.test(f) && !EXEMPT.some((e) => f.endsWith(e))
  );

  it('taranacak dosya bulur', () => {
    expect(files.length).toBeGreaterThan(0);
  });

  for (const file of files) {
    it(`${file} ham hex rengi içermiyor`, () => {
      const source = readFileSync(file, 'utf8');
      expect(source.match(/#[0-9a-fA-F]{6}\b/g) ?? []).toEqual([]);
    });
  }
});

/**
 * Bu bölüm, tüm erişilebilirlik hatalarının KÖK SEBEBİNİ engeller.
 *
 * Opaklıkla soldurmak birikimlidir ve CSS'te çocuk, ebeveyninin
 * opaklığını AŞAMAZ. Bir kapsayıcıya opacity verildiğinde içindeki
 * vurgu rengi de soluyor; zaten sınırda olan tuğla (4.99) AA'nın
 * altına düşüyor. Ölçülen gerçek değerler: 3.68, 2.59, 2.28.
 *
 * Çözüm: metni soldurmak için OPAKLIK değil, ölçülmüş RENK token'ları.
 */
describe('opaklıkla soldurma yasağı', () => {
  /**
   * Metin TAŞIYAN bir kuralda opacity kullanılamaz.
   * SVG çizgi/dolgu opaklığı (stroke/fill taşıyan kurallar) ve
   * geçiş katmanları serbesttir — onlar metin değildir.
   */
  const GRAPHIC = /(stroke[a-z-]*|fill|background)\s*:/;
  const LAYER = /(reveal|watermark|__layer|__plane|__light|__quote|\[slot=)/;

  const files = walk('src').filter((f) => /\.astro$/.test(f));

  for (const file of files) {
    it(`${file}: metin sönükleştirmede opacity kullanmıyor`, () => {
      const source = readFileSync(file, 'utf8');
      const offenders: string[] = [];

      // Kaba ama yeterli kural-bloğu ayrıştırma: '{ ... }' arası
      const blocks = source.match(/[^{}]*\{[^{}]*\}/g) ?? [];
      for (const block of blocks) {
        if (!/opacity:\s*0?\.[0-9]+/.test(block)) continue;
        if (GRAPHIC.test(block)) continue;   // çizim öğesi
        if (LAYER.test(block)) continue;     // geçiş katmanı
        offenders.push(block.replace(/\s+/g, ' ').trim().slice(0, 110));
      }

      const NL = String.fromCharCode(10);
      expect(
        offenders,
        `metin opaklığı — renk token'ı kullan (--text-2 / --text-3):` +
          NL +
          offenders.join(NL)
      ).toEqual([]);
    });
  }
});

describe('metin renk token\'ları', () => {
  it('zemin-duyarlı --text-2 / --text-3 tanımlı', () => {
    expect(declarationOf('--text-2')).toBe('var(--ink-2)');
    expect(declarationOf('--text-3')).toBe('var(--ink-3)');
  });

  it('koyu yüzey metin token\'larını devralır', () => {
    const utils = readFileSync('src/styles/utilities.css', 'utf8');
    expect(utils).toContain('--text-2: var(--on-ink-2)');
    expect(utils).toContain('--text-3: var(--on-ink-2)');
  });
});
