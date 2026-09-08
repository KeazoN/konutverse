import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { upperTr, lowerTr } from '../src/lib/turkish';

const BACKSLASH = String.fromCharCode(92);

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) walk(p, out);
    else out.push(p.split(BACKSLASH).join('/'));
  }
  return out;
}

describe('Türkçe büyük/küçük harf', () => {
  it('noktalı İ üretir — düz toUpperCase noktasız I üretirdi', () => {
    expect(upperTr('Melikgazi')).toBe('MELİKGAZİ');
    expect('Melikgazi'.toUpperCase()).toBe('MELIKGAZI'); // hatalı davranışın kanıtı
  });

  it('marka adını doğru büyütür', () => {
    expect(upperTr('Alis Dijital')).toBe('ALİS DİJİTAL');
  });

  it('noktasız ı üretir', () => {
    expect(lowerTr('IŞIK')).toBe('ışık');
    expect(upperTr('ışık')).toBe('IŞIK');
  });

  it('diğer Türkçe karakterleri korur', () => {
    expect(upperTr('çğöşü')).toBe('ÇĞÖŞÜ');
  });
});

describe('Türkçe i tuzağına karşı koruma', () => {
  const files = walk('src').filter((f) => /\.(ts|astro|js)$/.test(f));
  const EXEMPT = ['src/lib/turkish.ts'];

  it('taranacak dosya bulur', () => {
    expect(files.length).toBeGreaterThan(10);
  });

  for (const file of files.filter((f) => !EXEMPT.some((e) => f.endsWith(e)))) {
    it(`${file}: çıplak toUpperCase/toLowerCase kullanmıyor`, () => {
      const src = readFileSync(file, 'utf8');
      // Görsel büyük harf CSS text-transform ile yapılır (lang="tr" doğru çalışır).
      // JS gerekiyorsa upperTr/lowerTr kullanılmalı.
      expect(src).not.toMatch(/\.toUpperCase\s*\(\s*\)/);
      expect(src).not.toMatch(/\.toLowerCase\s*\(\s*\)/);
    });
  }
});

describe('metin bütünlüğü', () => {
  it('site metinlerinde bozuk Türkçe karakter yok', () => {
    const src = readFileSync('src/content/site.ts', 'utf8');
    // Mojibake belirtileri
    for (const bad of ['Ã', 'Ä±', 'Å', 'â€', 'ï¿½']) {
      expect(src, `bozuk kodlama işareti bulundu: ${bad}`).not.toContain(bad);
    }
  });

  it('Türkçe karakterler gerçekten mevcut — kodlama kaybı yok', () => {
    const src = readFileSync('src/content/site.ts', 'utf8');
    for (const ch of ['ı', 'İ', 'ş', 'ğ', 'ç', 'ö', 'ü']) {
      expect(src, `${ch} harfi hiç geçmiyor — kodlama kaybı olabilir`).toContain(ch);
    }
  });
});
