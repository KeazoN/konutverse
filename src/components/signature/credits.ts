/**
 * Yapım künyesi — TEK KAYNAK.
 *
 * Katman 0 (meta/JSON-LD), Katman 1 (footer markası), Katman 2 (/kunye)
 * ve Katman 3 (konsol) bu nesneden beslenir. Bilgiyi tek yerde değiştir.
 *
 * Katman 4 (signature.js) bunu KASITLI OLARAK yeniden bildirir:
 * o dosya framework'süz ve bağımlılıksız olmak zorunda.
 */
export const credits = {
  project: 'Konutverse — 360° Sanal Daire Turu',
  client: 'Konutverse',
  year: '2026',
  artDirection: 'Plandan Mekâna',

  maker: {
    name: 'Alis Dijital',
    url: 'https://alisdijital.com',
    city: 'Kayseri',
    country: 'Türkiye',
    since: "2016'dan beri",
    credentials: ['200+ marka', 'İkas Premium Partner', 'Shopify Partner'],
  },

  design: 'Alis Dijital',
  development: 'Alis Dijital',

  typography: ['Archivo', 'IBM Plex Mono'],
  technology: ['Astro', 'GSAP ScrollTrigger', 'Lenis'],
  accessibility: 'WCAG 2.2 AA',

  labels: {
    kicker: 'Yapım',
    sheetTitle: 'Yapım Künyesi',
    sheetNo: '01/01',
    rows: {
      project: 'Proje',
      client: 'Müşteri',
      year: 'Yıl',
      artDirection: 'Sanat yönü',
      design: 'Tasarım',
      development: 'Geliştirme',
      typography: 'Tipografi',
      technology: 'Teknoloji',
      accessibility: 'Erişilebilirlik',
      maker: 'Alis Dijital',
    },
    visit: 'alisdijital.com',
  },
} as const;

export type Credits = typeof credits;
