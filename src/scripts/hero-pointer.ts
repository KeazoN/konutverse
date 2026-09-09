/**
 * Hero'daki 360° işaretini imlece bağlar.
 *
 * İşaret ürünün gerçek geçiş noktasına benziyor; imleci gecikmeli
 * takip edince hero "gezilebilir bir mekân" hissi veriyor. Konum
 * CSS değişkeniyle (--spot-x / --spot-y) yazılıyor, böylece
 * başlangıç yeri ve dar ekran davranışı Hero.astro'da kalıyor.
 *
 * Üç durumda hiç bağlanmaz:
 *   - prefers-reduced-motion: reduce
 *   - dokunmatik cihaz (pointer: fine değil) — imleç yok
 *   - hero DOM'da yok (ana sayfa dışındaki sayfalar)
 */
import { onPage, prefersReducedMotion } from './on-page';

/** İmleç ile işaret arasındaki yumuşatma; 1 = anında, 0 = hiç. */
const EASE = 0.12;

onPage(() => {
  const hero = document.querySelector<HTMLElement>('[data-hero]');
  if (!hero) return;
  if (prefersReducedMotion()) return;
  if (!window.matchMedia('(pointer: fine)').matches) return;

  const spot = hero.querySelector<HTMLElement>('.hero__spot');
  if (!spot) return;

  // Yüzde cinsinden: CSS'teki başlangıç değerleriyle aynı yer.
  let curX = 78;
  let curY = 34;
  let aimX = curX;
  let aimY = curY;
  let raf = 0;

  const frame = () => {
    curX += (aimX - curX) * EASE;
    curY += (aimY - curY) * EASE;
    spot.style.setProperty('--spot-x', `${curX.toFixed(2)}%`);
    spot.style.setProperty('--spot-y', `${curY.toFixed(2)}%`);

    // Hedefe oturduysa döngüyü bırak — boşta rAF yakmıyoruz.
    if (Math.abs(aimX - curX) < 0.05 && Math.abs(aimY - curY) < 0.05) {
      raf = 0;
      return;
    }
    raf = requestAnimationFrame(frame);
  };

  const start = () => {
    if (!raf) raf = requestAnimationFrame(frame);
  };

  const onMove = (e: PointerEvent) => {
    const r = hero.getBoundingClientRect();
    aimX = ((e.clientX - r.left) / r.width) * 100;
    aimY = ((e.clientY - r.top) / r.height) * 100;
    start();
  };

  const onLeave = () => {
    // İmleç çıkınca işaret kendi yerine dönsün, ekranda takılı kalmasın.
    aimX = 78;
    aimY = 34;
    start();
  };

  hero.addEventListener('pointermove', onMove, { passive: true });
  hero.addEventListener('pointerleave', onLeave, { passive: true });

  // ClientRouter sayfayı değiştirdiğinde bu hero DOM'dan çıkıyor;
  // dinleyiciler onunla birlikte gidiyor. Geriye rAF kalmasın.
  document.addEventListener(
    'astro:before-swap',
    () => {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    },
    { once: true }
  );
});
