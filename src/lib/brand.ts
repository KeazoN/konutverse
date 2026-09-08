/**
 * HTML meta özelliklerinin CSS değişkeni kabul etmediği tek nokta.
 * <meta name="theme-color"> literal değer ister.
 *
 * Bu sabit tokens.css'teki --ink ile AYNI olmak zorundadır;
 * tests/tokens.test.ts eşleşmeyi kilitler. Birini değiştirirsen
 * diğerini de değiştir, yoksa test kırılır.
 */
export const THEME_COLOR = '#0F1B33';
