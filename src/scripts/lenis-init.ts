import Lenis from 'lenis';

/** Yumuşak scroll. reduced-motion altında hiç kurulmaz —
 *  native scroll, klavye ve anchor davranışı aynen korunur. */
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

declare global {
  interface Window { __lenis?: Lenis }
}

if (!reduce) {
  const lenis = new Lenis({ duration: 1.05, smoothWheel: true });

  // ScrollTrigger'ın Lenis'i takip edebilmesi için örneği paylaş.
  // Senkronize edilmezse pinned sahne scroll'dan kopar.
  window.__lenis = lenis;
  window.dispatchEvent(new CustomEvent('kv:lenis-ready'));

  const raf = (time: number) => {
    lenis.raf(time);
    requestAnimationFrame(raf);
  };
  requestAnimationFrame(raf);

  // Anchor navigasyonu Lenis üzerinden, ama klavye erişimi bozulmadan
  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (event) => {
      const hash = a.getAttribute('href');
      if (!hash || hash === '#') return;
      const target = document.querySelector<HTMLElement>(hash);
      if (!target) return;
      event.preventDefault();
      lenis.scrollTo(target, { offset: -24 });
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    });
  });

  // Modal açıkken scroll kilidi
  document.addEventListener('kv:scroll-lock', (e) => {
    const locked = (e as CustomEvent<boolean>).detail;
    locked ? lenis.stop() : lenis.start();
  });
}
