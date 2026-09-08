/**
 * Kesit sahnesi scroll scrub — YALNIZCA ana sayfaya yüklenir.
 *
 * Scroll ilerlemesi bir kesit düzlemini bina boyunca yukarı sürer;
 * aktif katı işaretler, durakları sırayla açar ve son üçte birde
 * ortografik kesitten perspektif mekâna geçer.
 *
 * reduced-motion: hiç kurulmaz. Sahne statik olarak eksiksizdir —
 * üç durak da okunur, kesit görünür. İçerik kaybı yok.
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const scene = document.querySelector<HTMLElement>('[data-kesit]');
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (scene && !reduce) {
  gsap.registerPlugin(ScrollTrigger);

  const stage = scene.querySelector<HTMLElement>('.kesit__stage')!;
  const stops = [...scene.querySelectorAll<HTMLElement>('[data-stop]')];
  const floors = [...scene.querySelectorAll<SVGGElement>('[data-floor]')];
  const plane = scene.querySelector<HTMLElement>('[data-cut-plane]');

  // Scrub devrede: CSS kontrolü JS'e geçer
  scene.dataset.scrub = 'on';

  /** Son üçte birde kesit → mekân geçişi. */
  const ROOM_START = 0.62;

  const apply = (progress: number) => {
    // 1 · Kesit düzlemi bina boyunca yükselir (alt %12'den üst %6'ya)
    if (plane) plane.style.bottom = `${12 + progress * 82}%`;

    // 2 · Aktif kat işareti
    const active = Math.min(floors.length - 1, Math.floor(progress * floors.length));
    floors.forEach((f, i) => {
      if (i === active) f.setAttribute('data-active', 'true');
      else f.removeAttribute('data-active');
    });

    // 3 · Duraklar sırayla
    const stopIndex = Math.min(stops.length - 1, Math.floor(progress * stops.length));
    stops.forEach((s, i) => {
      if (i === stopIndex) s.setAttribute('data-active', 'true');
      else s.removeAttribute('data-active');
    });

    // 4 · Çizim → mekân
    const t = progress <= ROOM_START ? 0 : (progress - ROOM_START) / (1 - ROOM_START);
    const eased = t * t * (3 - 2 * t); // smoothstep
    scene.style.setProperty('--room-opacity', String(eased));
    scene.style.setProperty('--section-opacity', String(1 - eased * 0.88));
  };

  // Lenis senkronizasyonu — yumuşak scroll ScrollTrigger'ı beslemeli
  const bindLenis = () => {
    const lenis = window.__lenis;
    if (!lenis) return false;
    lenis.on('scroll', ScrollTrigger.update);
    ScrollTrigger.refresh();
    return true;
  };
  if (!bindLenis()) {
    window.addEventListener('kv:lenis-ready', bindLenis, { once: true });
  }

  ScrollTrigger.create({
    trigger: scene,
    start: 'top top',
    end: () => `+=${window.innerHeight * 2.2}`,
    pin: stage,
    pinSpacing: true,
    scrub: 0.7,
    invalidateOnRefresh: true,
    onUpdate: (self) => apply(self.progress),
    onRefresh: (self) => apply(self.progress),
  });

  apply(0);
}
