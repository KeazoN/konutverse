import Lenis from 'lenis';
import { prefersReducedMotion } from './on-page';

declare global {
  interface Window { __lenis?: Lenis }
}

/**
 * Yumuşak scroll. Bir kez kurulur ve sayfa geçişleri boyunca yaşar.
 * reduced-motion altında HİÇ kurulmaz: native scroll, klavye ve
 * anchor davranışı aynen korunur.
 */
if (!prefersReducedMotion() && !window.__lenis) {
  const lenis = new Lenis({ duration: 1.05, smoothWheel: true });
  window.__lenis = lenis;

  const raf = (time: number) => {
    lenis.raf(time);
    requestAnimationFrame(raf);
  };
  requestAnimationFrame(raf);

  // Yeni sayfaya geçildiğinde başa sar
  document.addEventListener('astro:after-swap', () => lenis.scrollTo(0, { immediate: true }));

  document.addEventListener('click', (event) => {
    const link = (event.target as HTMLElement)?.closest?.('a[href^="#"]') as HTMLAnchorElement | null;
    if (!link) return;
    const hash = link.getAttribute('href');
    if (!hash || hash === '#') return;
    const target = document.querySelector<HTMLElement>(hash);
    if (!target) return;
    event.preventDefault();
    lenis.scrollTo(target, { offset: -28 });
    target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  });

  document.addEventListener('kv:scroll-lock', (e) => {
    (e as CustomEvent<boolean>).detail ? lenis.stop() : lenis.start();
  });
}
