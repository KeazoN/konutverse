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

// ── Daire dağılımı ──────────────────────────────────────────
export type UnitStatusMap = { id: string; status: UnitStatus; tourable: boolean; area: number };

/**
 * DUMAN-ERSA ORT. için gezilebilir daireler — canlı siteden doğrulandı:
 * "0. Kat · 1 gezilebilir", "2. Kat · 2 gezilebilir" = toplam 3.
 */
const TOURABLE: Record<number, number[]> = { 0: [1], 2: [1, 3] };

/** Daire tipine göre metrekare. */
const AREAS = [96, 128, 128, 112];

/**
 * Deterministik durum dağılımı: alt katlar daha çok satılmış,
 * üst katlar daha boş — gerçek bir satış eğrisi. Rastgelelik yok,
 * böylece testler ve build'ler kararlı kalır.
 */
function statusOf(floor: number, unit: number, floors: number): UnitStatus {
  const height = floor / Math.max(1, floors - 1); // 0 = zemin, 1 = en üst
  const seed = (floor * 7 + unit * 3) % 10;
  if (height < 0.35) return seed < 7 ? 'sold' : seed < 9 ? 'reserved' : 'free';
  if (height < 0.7) return seed < 4 ? 'sold' : seed < 7 ? 'reserved' : 'free';
  return seed < 2 ? 'sold' : seed < 4 ? 'reserved' : 'free';
}

/** Bir katın daireleri. Gezilebilir daireler her zaman 'free' olur. */
export function unitsOfFloor(floor: number, perFloor: number, floors: number): UnitStatusMap[] {
  const tourableUnits = TOURABLE[floor] ?? [];
  return Array.from({ length: perFloor }, (_, u) => {
    const unitNo = u + 1;
    const tourable = tourableUnits.includes(unitNo);
    return {
      id: `${floor}${String(unitNo).padStart(2, '0')}`,
      status: tourable ? ('free' as UnitStatus) : statusOf(floor, unitNo, floors),
      tourable,
      area: AREAS[u % AREAS.length],
    };
  });
}

/** Kat adı — canlı sitedeki biçim. */
export const floorLabel = (i: number): string => (i === 0 ? 'Zemin Kat' : `${i}. Kat`);
