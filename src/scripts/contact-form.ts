/**
 * Demo formu — istemci tarafı doğrulama ve görsel durumlar.
 * Gerçek gönderim kapsam dışıdır (spec §3); backend yok.
 *
 * KVKK onayı işaretlenmeden gönderim yapılamaz — ürünün kendi
 * taahhüdü ("KVKK onayı olmadan kayıt yok") arayüzde de geçerli.
 */
import { site } from '../content/site';

const form = document.querySelector<HTMLFormElement>('#demo-form');
const status = document.querySelector<HTMLElement>('#form-status');

if (form && status) {
  const setStatus = (message: string, state: 'error' | 'success') => {
    status.textContent = message;
    status.dataset.state = state;
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    // Tarayıcının kendi doğrulaması — mesajlar Türkçe ve yerleşik
    if (!form.checkValidity()) {
      form.reportValidity();
      const firstInvalid = form.querySelector<HTMLElement>(':invalid');
      firstInvalid?.focus();
      setStatus('Lütfen zorunlu alanları doldurun ve KVKK onayını işaretleyin.', 'error');
      return;
    }

    setStatus(site.contact.successMessage, 'success');
    form.reset();
  });

  // Kullanıcı düzeltmeye başlayınca hata mesajını temizle
  form.addEventListener('input', () => {
    if (status.dataset.state === 'error') {
      status.textContent = '';
      delete status.dataset.state;
    }
  });
}
