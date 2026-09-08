/**
 * Türkçe-doğru büyük harf dönüşümü.
 *
 * JavaScript'in düz `toUpperCase()`'i invariant locale kullanır:
 *   'Melikgazi'.toUpperCase()  → 'MELIKGAZI'   ✗ (noktasız I)
 *   upperTr('Melikgazi')       → 'MELİKGAZİ'   ✓
 *
 * KURAL: Görsel büyük harf için JS DEĞİL, CSS `text-transform: uppercase`
 * kullanın — <html lang="tr"> ile tarayıcı dönüşümü doğru yapar ve
 * ekran okuyucular metni doğal halinde okur.
 *
 * Bu yardımcı yalnızca CSS'in ulaşamadığı yerler içindir:
 * konsol çıktısı, dosya adı, veri işleme.
 */
export const upperTr = (value: string): string => value.toLocaleUpperCase('tr-TR');

export const lowerTr = (value: string): string => value.toLocaleLowerCase('tr-TR');
