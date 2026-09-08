/** Lighthouse JSON çıktılarını özet tabloya çevirir. */
import { readFileSync } from 'node:fs';

const ORDER = ['home', 'features', 'pricing', 'about', 'contact', 'search', 'demo', 'kunye', 'privacy'];
const DEVICES = [['desktop', 'MASAÜSTÜ'], ['mobile', 'MOBİL']];

const rows = {};
const fails = {};

for (const [dev] of DEVICES) {
  rows[dev] = [];
  for (const name of ORDER) {
    const r = JSON.parse(readFileSync(`lh/${dev}/${name}.json`, 'utf8'));
    if (r.runtimeError) {
      rows[dev].push({ name, error: r.runtimeError.code });
      continue;
    }
    const c = r.categories;
    const a = r.audits;
    const S = (k) => Math.round(c[k].score * 100);
    rows[dev].push({
      name,
      perf: S('performance'),
      a11y: S('accessibility'),
      bp: S('best-practices'),
      seo: S('seo'),
      lcp: a['largest-contentful-paint'].numericValue / 1000,
      cls: a['cumulative-layout-shift'].numericValue,
      tbt: a['total-blocking-time'].numericValue,
    });
    for (const g of ['accessibility', 'best-practices', 'seo']) {
      for (const ref of c[g].auditRefs) {
        const x = a[ref.id];
        if (x && x.score === 0) (fails[ref.id] ??= []).push(`${dev}/${name}`);
      }
    }
  }
}

const pad = (v, w) => String(v).padStart(w);

for (const [dev, title] of DEVICES) {
  console.log('');
  console.log(title);
  console.log('sayfa        perf a11y   bp  seo     LCP     CLS    TBT');
  console.log('─'.repeat(55));
  for (const r of rows[dev]) {
    if (r.error) { console.log(r.name.padEnd(12), r.error); continue; }
    console.log(
      r.name.padEnd(12), pad(r.perf, 4), pad(r.a11y, 4), pad(r.bp, 5), pad(r.seo, 4),
      ' ', pad(r.lcp.toFixed(2) + 's', 6), pad(r.cls.toFixed(3), 6), pad(Math.round(r.tbt) + 'ms', 6)
    );
  }
  const ok = rows[dev].filter((r) => !r.error);
  const min = (k) => Math.min(...ok.map((r) => r[k]));
  const max = (k) => Math.max(...ok.map((r) => r[k]));
  console.log('─'.repeat(55));
  console.log(
    'en kötü     ', pad(min('perf'), 4), pad(min('a11y'), 4), pad(min('bp'), 5), pad(min('seo'), 4),
    ' ', pad(max('lcp').toFixed(2) + 's', 6), pad(max('cls').toFixed(3), 6), pad(Math.round(max('tbt')) + 'ms', 6)
  );
}

console.log('');
const keys = Object.keys(fails);
console.log(
  keys.length
    ? keys.map((k) => `✗ ${k} → ${fails[k].join(', ')}`).join('\n')
    : '✓ 18 koşuda başarısız erişilebilirlik / best-practices / SEO denetimi YOK'
);
