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
    expect(r).toBeGreaterThanOrEqual(3.0);
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

// Bu blok, ölçüm sırasında yakalanan gerçek bir erişilebilirlik hatasını kilitler:
// özgün --avail-* renklerinde beyaz metin AA'dan kalıyordu (4.19 / 3.22).
describe('durum çipleri — beyaz metin AA geçmek zorunda', () => {
  const PAPER = '#FFFFFF';
  const CHIPS = { free: '#3F5D8A', sold: '#A8392F', reserved: '#8A5210' };

  for (const [name, bg] of Object.entries(CHIPS)) {
    it(`${name} çipi 12px beyaz metinle AA geçer`, () => {
      expect(contrastRatio(PAPER, bg)).toBeGreaterThanOrEqual(4.5);
    });
  }
});

describe('brick iki tonlu kural — her iki zeminde de bir güvenli ton var', () => {
  it('açık zeminde brick metin için yeterli', () => {
    expect(contrastRatio('#C23616', '#F7F8FA')).toBeGreaterThanOrEqual(4.5);
  });

  it('koyu zeminde brick-lit metin için yeterli', () => {
    expect(contrastRatio('#ED5A34', '#0F1B33')).toBeGreaterThanOrEqual(4.5);
  });

  it('brick-lit açık zeminde YETERSİZ — bu yüzden açık zeminde yasak', () => {
    expect(contrastRatio('#ED5A34', '#F7F8FA')).toBeLessThan(4.5);
  });
});

/**
 * Bölüm numarası (/features'taki iri 02 · 03) aria-hidden ama yine de
 * METİN düğümü: Lighthouse onu da ölçüyor ve --stone ile 95 puana
 * düştük. İri metin eşiği 3:1; hem paper hem sand üstünde geçmeli.
 */
describe('iri ikincil işaretler — 3:1 iri metin eşiği', () => {
  const GHOST = '#8F836F';
  const SURFACES = { paper: '#FCFBF9', sand: '#F2EDE6' };

  for (const [name, bg] of Object.entries(SURFACES)) {
    it(`ghost tonu ${name} üstünde iri metin eşiğini geçer`, () => {
      expect(contrastRatio(GHOST, bg)).toBeGreaterThanOrEqual(3.0);
    });
  }

  it('eski --stone tonu geçmiyordu — gerileme koruması', () => {
    expect(contrastRatio('#DED6CA', SURFACES.paper)).toBeLessThan(3.0);
  });
});
