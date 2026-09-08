/**
 * Gerçek proje verisi — konutverse.com/search üzerinden doğrulandı (08.09.2026).
 * Uydurma proje eklenmez; sitenin güvenilirliği gerçek veriye dayanır.
 */

export type UnitStatus = 'free' | 'sold' | 'reserved';

export type Project = {
  slug: string;
  firm: string;
  name: string;
  district: string;
  city: string;
  /** Başlangıç fiyatı, TL. */
  priceFrom: number;
  /** İnşaat aşaması adı — "Boya", "Teslim" gibi. */
  stage: string;
  /** Aşama tamamlanma yüzdesi, 0–100. */
  stagePct: number;
  floors: number;
  units: number;
  /** 360° turu yayında olan daire sayısı. */
  tourable: number;
};

export const projects: Project[] = [
  {
    slug: 'duman-ersa-ort',
    firm: 'ERSA İNŞAAT',
    name: 'DUMAN-ERSA ORT.',
    district: 'Melikgazi',
    city: 'Kayseri',
    priceFrom: 5_750_000,
    stage: 'Boya',
    stagePct: 75,
    floors: 12,
    units: 48,
    tourable: 3,
  },
  {
    slug: 'ersa-vizyon',
    firm: 'ERSA İNŞAAT',
    name: 'ERSA VİZYON',
    district: 'Melikgazi',
    city: 'Kayseri',
    priceFrom: 4_450_000,
    stage: 'Teslim',
    stagePct: 100,
    floors: 1,
    units: 1,
    tourable: 1,
  },
];

export const featuredProject = projects[0];

/** Kat kotu, metre cinsinden. Standart kat yüksekliği 3.20 m. */
export const FLOOR_HEIGHT_M = 3.2;

export const kotOf = (floorIndex: number): string =>
  `+${(floorIndex * FLOOR_HEIGHT_M).toFixed(2)}`;

/** Türkçe fiyat biçimi: 5.750.000 */
export const formatPrice = (value: number): string =>
  new Intl.NumberFormat('tr-TR').format(value);
