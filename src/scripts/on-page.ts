/**
 * View Transitions (ClientRouter) ile sayfa içeriği JS yeniden
 * yüklenmeden değişir. Sayfaya bağlı her kurulum bu yardımcıdan
 * geçmeli, yoksa ilk gezinmeden sonra ölür.
 */
export function onPage(setup: () => void): void {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setup, { once: true });
  } else {
    setup();
  }
  document.addEventListener('astro:page-load', setup);
}

export const prefersReducedMotion = (): boolean =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** CSS scroll-driven animation destekleniyorsa giriş animasyonunu CSS yapar. */
export const hasScrollTimeline = (): boolean =>
  CSS.supports('animation-timeline: view()');
