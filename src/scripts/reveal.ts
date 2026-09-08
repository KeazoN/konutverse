import { onPage, prefersReducedMotion, hasScrollTimeline } from './on-page';

/**
 * Giriş animasyonu — YEDEK yol.
 * Tarayıcı CSS scroll-timeline destekliyorsa (motion.css) burası hiç
 * çalışmaz: o yol scroll'la kusursuz senkron ve ana iş parçacığını
 * meşgul etmez. Desteklemeyen tarayıcılarda IntersectionObserver devreye girer.
 */
onPage(() => {
  const targets = document.querySelectorAll<HTMLElement>('.reveal');
  if (!targets.length) return;

  if (prefersReducedMotion() || hasScrollTimeline() || !('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('is-in'));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.05 }
  );
  targets.forEach((el) => io.observe(el));
});
