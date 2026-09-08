import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://www.konutverse.com',
  output: 'static',
  build: { inlineStylesheets: 'auto' },
});
