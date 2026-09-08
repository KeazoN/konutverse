import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://www.konutverse.com',
  output: 'static',
  build: {
    // CSS HTML'e gömülür: mobilde iki render-blocking istek (33 KB)
    // yavaş bağlantıda ~2.1 sn bloke ediyordu. Gömünce istek sıfır.
    inlineStylesheets: 'always',
  },
});
