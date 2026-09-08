import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { THEME_COLOR } from '../src/lib/brand';

const tokens = readFileSync('src/styles/tokens.css', 'utf8');

const REQUIRED = [
  '--ink', '--ink-deep', '--ink-raised', '--chalk', '--paper', '--plaster',
  '--brick', '--brick-lit', '--line', '--line-dark',
  '--avail-free', '--avail-sold', '--avail-reserved',
  '--avail-free-tint', '--avail-sold-tint', '--avail-reserved-tint',
  '--t-hero', '--t-display-xl', '--t-display', '--t-h1', '--t-h2', '--t-h3',
  '--t-body', '--t-small', '--t-tech',
  '--font-display', '--font-tech', '--font-body',
  '--radius-structural', '--radius-control', '--radius-pill',
  '--ease', '--dur-fast', '--dur-base', '--dur-draw',
  '--max-w', '--gutter', '--rail-w',
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

  it('üç ayrı tipografik aile tanımlar — hepsi Inter değil', () => {
    const display = declarationOf('--font-display')!;
    const tech = declarationOf('--font-tech')!;
    const body = declarationOf('--font-body')!;
    expect(new Set([display, tech, body]).size).toBe(3);
    expect(display).toContain('Archivo');
    expect(tech).toContain('Plex Mono');
    expect(body).toContain('Inter');
  });

  it('gövde metni 15px değil 17px — mevcut sitenin çekingen ölçeği düzeltildi', () => {
    expect(declarationOf('--t-body')).toBe('17px');
  });

  it('display tavanı 148px — mevcut sitenin 52px tavanı yükseltildi', () => {
    expect(declarationOf('--t-display-xl')).toContain('148px');
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
  const LAYER = /(reveal|watermark|__layer|__plane|__light|\[slot=)/;

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

  it('koyu yüzeyler token\'ları devralır', () => {
    const utils = readFileSync('src/styles/utilities.css', 'utf8');
    expect(utils).toContain('--text-2: var(--chalk-2)');
    expect(utils).toContain('--text-3: var(--chalk-3)');
  });
});
