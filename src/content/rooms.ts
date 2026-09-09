/**
 * Gerçek daire fotoğrafları — TEK KAYNAK.
 *
 * Görseller konutverse.com'un kendi projelerinden alındı ve
 * scripts/optimize-images.py ile iki genişlik + WebP olarak üretildi.
 * Hem Capabilities hem MediaBand buradan besleniyor; alt metni
 * iki yerde ayrı yazılırsa biri eskiyordu.
 */
export const ROOMS = [
  { name: 'living', ratio: '1000/667', alt: 'Oturma odası — 360° turda gezilebilen daire' },
  { name: 'kitchen', ratio: '1000/667', alt: 'Mutfak — 360° turda gezilebilen daire' },
  { name: 'bedroom', ratio: '1000/667', alt: 'Yatak odası — 360° turda gezilebilen daire' },
] as const;

export type Room = (typeof ROOMS)[number];
