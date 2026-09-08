import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const tokens = readFileSync('src/styles/tokens.css', 'utf8');

const REQUIRED = [
  '--ink', '--ink-deep', '--ink-raised', '--chalk', '--paper', '--plaster',
  '--brick', '--brick-lit', '--line', '--line-dark',
  '--avail-free', '--avail-sold', '--avail-reserved',
  '--avail-free-tint', '--avail-sold-tint', '--avail-reserved-tint',
  '--t-display-xl', '--t-display', '--t-h1', '--t-h2', '--t-h3',
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
