/** Lighthouse JSON içindeki tam sayfa ekran görüntüsünü dosyaya yazar. */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
const [, , src, out] = process.argv;
const r = JSON.parse(readFileSync(src, 'utf8'));
const a = r.fullPageScreenshot || r.audits['full-page-screenshot']?.details || r.audits['final-screenshot']?.details;
const data = a?.screenshot?.data || a?.data;
if (!data) { console.error('ekran görüntüsü yok:', src); process.exit(1); }
mkdirSync('shots', { recursive: true });
writeFileSync(out, Buffer.from(data.split(',')[1], 'base64'));
console.log('yazıldı:', out);
