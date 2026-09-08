import { onPage } from './on-page';

onPage(() => {
  /**
   * Daire hücresine tıklanınca devir paneli açılır.
   * 360° görüntüleyici KAPSAM DIŞI — sahte bir görüntüleyici üretilmez.
   *
   * Erişilebilirlik: native <dialog> + showModal(), Escape ile kapanır,
   * odak açan hücreye geri döner.
   */
  const dialog = document.querySelector<HTMLDialogElement>('#handoff');
  const cells = document.querySelectorAll<HTMLButtonElement>('button[data-unit]');

  if (dialog && cells.length) {
    let opener: HTMLElement | null = null;

    const setText = (selector: string, value: string) => {
      const el = dialog.querySelector<HTMLElement>(selector);
      if (el) el.textContent = value;
    };

    const lockScroll = (locked: boolean) => {
      document.dispatchEvent(new CustomEvent('kv:scroll-lock', { detail: locked }));
    };

    for (const cell of cells) {
      cell.addEventListener('click', () => {
        opener = cell;
        const floorLabel = cell.dataset.floorLabel ?? '';
        const unit = cell.dataset.unit ?? '';

        setText('[data-unit-floor]', floorLabel);
        setText('[data-unit-id]', `${unit} No'lu Daire`);
        setText('[data-spec-floor]', floorLabel);
        setText('[data-spec-unit]', unit);
        setText('[data-spec-area]', cell.dataset.area ?? '—');

        // Durum çipini seçilen daireninkiyle değiştir
        const chip = dialog.querySelector<HTMLElement>('[data-spec-status] .chip');
        if (chip) {
          const status = cell.dataset.status ?? 'free';
          chip.className = `chip chip--${status}`;
          chip.textContent =
            status === 'sold' ? 'Satıldı' : status === 'reserved' ? 'Rezerve' : 'Boş';
        }

        dialog.showModal();
        lockScroll(true);
      });
    }

    dialog.querySelector('[data-handoff-close]')?.addEventListener('click', () => dialog.close());

    // Arka plana tıklayınca kapat
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) dialog.close();
    });

    dialog.addEventListener('close', () => {
      lockScroll(false);
      opener?.focus();
      opener = null;
    });
  }

});
