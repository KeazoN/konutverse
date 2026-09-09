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

  // Künye DOĞRU olmak zorunda: imza sisteminin tamamı bu sayfanın
  // doğruluğuna dayanıyor. tests/signature.test.ts bu iki satırı
  // fonts.css ve package.json ile karşılaştırır.
  typography: ['Bricolage Grotesque', 'Schibsted Grotesk', 'IBM Plex Mono'],
  technology: ['Astro', 'Lenis', 'CSS Scroll-Driven Animations'],
  accessibility: 'WCAG 2.2 AA',

  /**
   * ÖLÇÜM — künyenin kanıt bölümü.
   *
   * Bunlar iddia değil, TARİHLİ ÖLÇÜM. Üretim derlemesinde
   * `astro preview` üzerinde Lighthouse ile alındı. Tarihi taşımak
   * şart: tarihsiz bir "100" birkaç ay sonra yalan olur.
   * tests/signature.test.ts font yükünü gerçek dosyalarla
   * karşılaştırıyor; uydurulamaz.
   */
  measuredOn: '09.09.2026',
  metrics: [
    { value: '100', label: 'Erişilebilirlik', note: 'Lighthouse · 9 sayfanın hepsi' },
    { value: '100', label: 'Performans', note: 'Masaüstü · mobil 94+' },
    { value: '0', label: 'Düzen kayması', note: 'CLS · masaüstü' },
    { value: '180 KB', label: 'Yazı tipi yükü', note: '3 aile · 8 alt küme' },
  ],

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
    measured: 'Ölçüm',
    visit: 'alisdijital.com',
  },
} as const;

export type Credits = typeof credits;
