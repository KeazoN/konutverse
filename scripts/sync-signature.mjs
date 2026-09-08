/**
 * İmza sisteminin tek kaynağı src/components/signature/signature.js'tir.
 * Bu script onu public/signature.js olarak yayınlar; böylece her proje
 * <script src="/signature.js"> ile doğrudan kullanabilir.
 * tests/signature.test.ts iki kopyanın aynı kalmasını kilitler.
 */
import { readFileSync, writeFileSync } from 'node:fs';

const SRC = 'src/components/signature/signature.js';
const OUT = 'public/signature.js';

writeFileSync(OUT, readFileSync(SRC, 'utf8'), 'utf8');
console.log(`[imza] ${SRC} -> ${OUT}`);
