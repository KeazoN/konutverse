import { onPage } from './on-page';

onPage(() => {
  /**
   * Proje filtreleme — istemci tarafı, sıfır bağımlılık.
   * Kartlar sunucuda render edilir; filtre yalnızca görünürlüğü yönetir.
   * JS çalışmazsa tüm projeler görünür kalır (aşamalı iyileştirme).
   */
  const grid = document.querySelector<HTMLElement>('[data-results]');
  const countEl = document.querySelector<HTMLElement>('[data-result-count]');
  const emptyEl = document.querySelector<HTMLElement>('[data-empty]');

  if (grid && countEl) {
    const cards = [...grid.querySelectorAll<HTMLElement>('[data-project]')];
    const controls = [...document.querySelectorAll<HTMLSelectElement>('[data-filter]')];
    const clearBtn = document.querySelector<HTMLButtonElement>('[data-filter-clear]');

    const template = countEl.textContent?.trim() ?? '';

    const matches = (card: HTMLElement): boolean =>
      controls.every((control) => {
        const value = control.value;
        if (!value) return true;

        const key = control.dataset.filter!;
        if (key === 'floors') {
          const floors = Number(card.dataset.floors ?? 0);
          const min = Number(value);
          const max = min === 1 ? 4 : min === 5 ? 10 : Infinity;
          return floors >= min && floors <= max;
        }
        return card.dataset[key] === value;
      });

    const apply = () => {
      let visible = 0;
      for (const card of cards) {
        const ok = matches(card);
        card.hidden = !ok;
        if (ok) visible++;
      }

      // "Sonuçları Göster (2)" biçimini koruyarak sayıyı güncelle
      countEl.textContent = template.replace(/\(\d+\)/, `(${visible})`);
      if (emptyEl) emptyEl.hidden = visible !== 0;
    };

    controls.forEach((c) => c.addEventListener('change', apply));

    clearBtn?.addEventListener('click', () => {
      document
        .querySelectorAll<HTMLSelectElement | HTMLInputElement>('.filters__control')
        .forEach((el) => {
          el.value = '';
        });
      apply();
    });
  }

});
