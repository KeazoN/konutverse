# Alis Dijital — İmza Sistemi

Yaptığınız her işe koyabileceğiniz yapım imzası.
**Bağımlılık yok. Framework yok. Build adımı yok.** Shadow DOM ile izole:
host sayfanın CSS'i imzayı bozamaz, imzanın CSS'i host sayfaya sızmaz.

---

## Sistem beş katmandan oluşur

| Katman | Nedir | Nerede |
|---|---|---|
| **0 · Makine** | `<meta name="author">`, `<link rel="author">`, JSON-LD `creator`, `humans.txt` | Her sayfanın `<head>`i |
| **1 · Marka** | Footer'daki monogram + isim, künyeye açılır | Her sayfanın footer'ı |
| **2 · Künye** | `/kunye` — tam yapım künyesi, pafta antet bloğu | Tek sayfa |
| **3 · Konsol** | DevTools açan geliştiriciye ASCII künye | Her sayfa |
| **4 · Taşınabilir** | `signature.js` web component | Her proje |

Katman 0–3 bu projeye gömülüdür. **Katman 4 taşınır** — asıl değer burada.

---

## Kurulum (Katman 4)

1. `signature.js` dosyasını projenin public/static klasörüne kopyala.
2. Sayfaya ekle:

```html
<script src="/signature.js" defer></script>
<alis-signature variant="stacked" theme="auto" href="/kunye"></alis-signature>
```

Hepsi bu.

### Nitelikler

| Nitelik | Değerler | Varsayılan | Ne yapar |
|---|---|---|---|
| `variant` | `stacked` · `inline` · `compact` | `stacked` | `stacked`: monogram + "Yapım" + isim + konum. `inline`: monogram + isim. `compact`: yalnız monogram. |
| `theme` | `auto` · `light` · `dark` | `auto` | `auto`, sistem tercihini izler. Koyu footer'da `dark` yazın. |
| `href` | herhangi bir yol | `/kunye` | Künye sayfasının adresi. Projede künye yoksa `https://alisdijital.com` verin. |

---

## Framework örnekleri

### Next.js (App Router)

```jsx
import Script from 'next/script';

export default function Footer() {
  return (
    <footer>
      <Script src="/signature.js" strategy="lazyOnload" />
      <alis-signature variant="stacked" theme="dark" />
    </footer>
  );
}
```

TypeScript kullanıyorsanız bir kez tip bildirin:

```ts
// global.d.ts
declare namespace JSX {
  interface IntrinsicElements {
    'alis-signature': React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement>, HTMLElement
    > & { variant?: string; theme?: string; href?: string };
  }
}
```

### Astro

```astro
---
import MakerMark from '../components/signature/MakerMark.astro';
---
<MakerMark variant="stacked" theme="dark" />
```

### WordPress

`functions.php`:

```php
add_action('wp_enqueue_scripts', function () {
  wp_enqueue_script('alis-signature',
    get_template_directory_uri() . '/js/signature.js', [], null, true);
});
```

Footer şablonuna: `<alis-signature variant="inline" theme="dark"></alis-signature>`

### Shopify / düz HTML

`</body>` etiketinden önce script, istediğiniz yere bileşen.

---

## Katman 0'ı da taşımak

Katman 4 görünür imzadır. **Katman 0 görünmez ama SEO düzeyinde gerçektir** —
arama motorları siteyi kimin yaptığını bilir. Onu da taşımak için her sayfanın
`<head>`ine:

```html
<meta name="author" content="Alis Dijital">
<link rel="author" href="https://alisdijital.com">
```

Ve mevcut JSON-LD grafiğinize ajansı `creator` olarak ekleyin:

```json
{
  "@type": "Organization",
  "@id": "https://alisdijital.com/#organization",
  "name": "Alis Dijital",
  "url": "https://alisdijital.com"
}
```

Sonra `WebSite` düğümünüze:

```json
"creator": { "@id": "https://alisdijital.com/#organization" }
```

> **Dikkat:** `publisher` müşterinin kuruluşudur, `creator` ajanstır.
> İkisini karıştırmayın — Google ikisini farklı yorumlar.

Son olarak `public/humans.txt` dosyasını kopyalayın.

---

## Kontrast

Monogram ve isim, üzerine geldiği zemine göre iki ton kullanır:

| Zemin | Vurgu rengi | Oran |
|---|---|---|
| Açık | `#C23616` | 5.16 · AA ✓ |
| Koyu | `#ED5A34` | 4.99 · AA ✓ |

Tek renk her iki zeminde de AA geçmediği için ayrım zorunludur.
`theme` niteliğini doğru verin.

---

## Taşınabilirliği doğrulama

`signature-demo.html` dosyasını tarayıcıda açın. Bu sayfa hiçbir framework,
CSS kütüphanesi veya build adımı kullanmadan altı varyantı yan yana gösterir.
İmza orada doğru görünüyorsa her yerde doğru görünür.

---

## Dosyalar

```
signature/
├── credits.ts        Künye verisi — TEK KAYNAK (Katman 0–3)
├── Monogram.astro    SVG monogram
├── MakerMark.astro   Katman 1 — Astro bileşeni
├── Colophon.astro    Katman 2 — künye sayfası gövdesi
├── signature.css     Kendi scoped token'ları, host'a bağımsız
├── signature.js      Katman 4 — taşınabilir web component
└── README.md         bu dosya
```

`signature.js` kasıtlı olarak `credits.ts`'i **import etmez**. Bağımsız olmak
zorundadır; bilgi orada tekrar bildirilir. Ajans adı veya şehir değişirse
iki dosyayı da güncelleyin.

---

© Alis Dijital · [alisdijital.com](https://alisdijital.com) · Kayseri
