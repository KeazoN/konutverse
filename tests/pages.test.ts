import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';

const DIST = 'dist';

describe('build çıktısı', () => {
  it('ana sayfayı üretir', () => {
    expect(existsSync(`${DIST}/index.html`)).toBe(true);
  });

  it('dili Türkçe olarak işaretler', () => {
    const html = readFileSync(`${DIST}/index.html`, 'utf8');
    expect(html).toContain('lang="tr"');
  });
});
