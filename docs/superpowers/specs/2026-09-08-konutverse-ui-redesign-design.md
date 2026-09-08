# Konutverse — UI/UX Yeniden Tasarımı

**Tarih:** 2026-09-08
**Sanat yönü:** "Plandan Mekâna"
**Yapım:** Alis Dijital
**Durum:** Onaylandı, uygulama planına hazır

---

## 1. Bağlam

Konutverse, emlak ve inşaat firmalarına 360° sanal daire turu satan bir B2B SaaS ürünü.
Canlı site: `konutverse.com` — Next.js / Vercel, Türkçe tek dil.

**Ürünün tezi:** Alıcı satış ofisine gelmeden önce daireyi 360° turda gezer. Sahaya gelen kişi planı bilir; görüşme tanıtımla değil fiyat konuşmasıyla başlar.

**Gerçek ölçek (2026-09-08 itibarıyla):**

| Veri | Değer |
|---|---|
| Firma | 1 — ERSA İNŞAAT (Melikgazi, Kayseri) |
| Proje | 2 — DUMAN-ERSA ORT., ERSA VİZYON |
| Gezilebilir daire | 4 |
| Fiyat | ₺2.900 / ₺7.900 / Özel teklif — aylık, taahhütsüz |

### Mevcut sitenin teşhisi

Kaynak koddan (`konutverse.com` inline CSS token'ları) doğrulanmış bulgular:

1. **Tipografik ses sıfır.** `--font-serif`, `--font-display`, `--font-mono`, `--font-sans` token'larının **dördü de** `"Inter"` değerine sahip. Tipografik hiyerarşi yalnızca ağırlık ve boyutla kuruluyor.
2. **Ölçek çekingen.** `--t-display: clamp(32px, 4.2vw, 52px)`, `--t-h1` tavanı 38px, `--t-body: 15px`. Konut/mimari kategorisinde editoryal güven vermiyor.
3. **Ürün mekânsal, site düz.** Ürünün sattığı bina → kat → daire hiyerarşisi sitenin hiçbir yerinde forma dönüşmüyor.
4. **Jenerik form dili.** `--radius: 10px` tüm yapısal öğelerde. Ayırt edici tek bir biçim kararı yok.
5. **Zayıf sosyal kanıta yaslanma.** Ana sayfa "1 emlak ve inşaat firması" yazıyor. Tasarımın bu sayıyı taşıması değil, otoriteyi başka bir yerden kurması gerekiyor.

**Değerlendirme:** İçerik ve metin güçlü. Problem tamamen görsel/deneyimsel katmanda. Metinlere dokunulmayacak.

---

## 2. Hedefler

1. Ürünün mekânsal tezini **formun kendisiyle** savunan bir görsel dil kurmak.
2. Muhafazakâr Türk inşaat/emlak alıcısına satabilecek kadar ciddi, ajans karar vericisini etkileyecek kadar iddialı olmak (hibrit: vitrin ana sayfada, dönüşüm iç sayfalarda).
3. Konutverse'ün güven açığını **alan hâkimiyeti** ile kapatmak — logo duvarıyla değil.
4. Alis Dijital için **portatif, yeniden kullanılabilir** bir ajans imza sistemi üretmek.
5. Ölçülebilir kalite: WCAG 2.2 AA, Lighthouse performans ≥ 92 (mobil).

## 3. Hedef olmayanlar (kapsam dışı)

- 360° görüntüleyicinin kendisi (panorama motoru, oda geçişleri, 3B model yükleme). Mevcut ekip yapmış; dokunulmayacak.
- Yönetim paneli / firma paneli arayüzü.
- Backend, veritabanı, form gönderimi (form yalnızca istemci tarafı doğrulama + görsel durumlar).
- Metin yazımı. Canlı sitedeki Türkçe metin **birebir korunacak**; yalnızca yeni teknik etiketler (kot değerleri, pafta numaraları) eklenecek.
- Çok dillilik. TR tek dil.

---

## 4. Sanat yönü — "Plandan Mekâna"

### 4.1 Konsept

Konutverse'ün kendi `/about` sayfasındaki cümle konseptin brief'i:

> "Kat planı ve düz fotoğraf bir daireyi anlatmıyor."

Site **mimari kesit çizimi olarak başlar, mekâna dönüşür.** Çizgi → ışık. Blueprint → gerçeklik.

Kesit çizimi, Konutverse'ün veri modelinin birebir görsel karşılığıdır: bina → kat → daire. Organizasyon metaforu böylece hem ürünü açıklar hem de inşaat sektörünün kendi dilini konuşur.

### 4.2 Neden bu yön

| Gerekçe | Açıklama |
|---|---|
| Form = argüman | Diğer yönlerde tasarım içeriğin üstüne giydirilen bir kıyafet. Burada tasarım tezin kendisi. |
| Alıcıya uygun | İnşaatçı kesit çizimini tanır ve sayar. "Bunlar inşaatı biliyor" sinyali. |
| Güven açığını kapatır | Otorite logolardan değil alan hâkimiyetinden gelir — 1 firmalık sosyal kanıtı taşımak zorunda kalmayız. |
| Ayırt edici | Türk proptech'inde mimari çizim dili kullanan yok. |
| Kanıtlanabilir kas | Scroll-scrubbed SVG kesit, üç sesli tip sistemi, çizim→fotoğraf geçişi. Zevk değil, ölçülebilir frontend becerisi. |

### 4.3 Reddedilen yönler

- **"Boş Oda"** (fotoğraf öncelikli, editoryal serif): güzel ama stratejik hata riski — daire satıyormuş gibi görünür. Konutverse daire satmıyor, daire satanlara yazılım satıyor.
- **"Kontrol Kulesi"** (koyu konsol, cam paneller, Linear dili): teşhis edilen jenerik SaaS probleminin daha iyi yapılmış hâli. Ayrıca tam koyu konsol muhafazakâr alıcıya en zor satan seçenek.

---

## 5. Tasarım sistemi

Tüm token'lar `src/styles/tokens.css` içinde tek kaynak olarak tanımlanır. Başka hiçbir dosyada ham renk/boyut değeri bulunmaz.

### 5.1 Tipografi — üç ses

| Rol | Aile | Paket | Kullanım |
|---|---|---|---|
| Display | `Archivo` variable (`wght` + `wdth`) | `@fontsource-variable/archivo` | Başlıklar. `wdth` 110–125 arası açık kurulum. |
| Teknik | `IBM Plex Mono` (400, 500) | `@fontsource/ibm-plex-mono` | Kotlar, m², kat no, etiketler, veri, künye. |
| Gövde | `Inter` variable | `@fontsource-variable/inter` | Yalnızca okuma metni. |

Üç aile de Latin Extended kapsar; Türkçe karakterler (ğ Ğ ş Ş ı İ ç Ç ö Ö ü Ü) tam desteklenir.

**Yükleme:** Fontsource npm paketleriyle **self-host**. Üçüncü taraf CDN yok, `font-display: swap`, yalnızca kullanılan ağırlıklar import edilir. Kritik olanlar (`Archivo` variable, `Inter` variable) `<link rel="preload">` ile ön yüklenir.

**Yedek plan:** Fontsource kurulumu başarısız olursa Google Fonts CDN (`fonts.googleapis.com` + `fonts.gstatic.com`, `preconnect` ile). Bu durum spec'ten sapma sayılır ve raporlanır.

**Ölçek:**

```css
--t-display-xl: clamp(48px, 9vw, 148px);   /* hero */
--t-display:    clamp(38px, 5.5vw, 84px);
--t-h1:         clamp(30px, 3.6vw, 54px);
--t-h2:         clamp(23px, 2.4vw, 34px);
--t-h3:         19px;
--t-body:       17px;   /* satır yüksekliği 1.65 */
--t-small:      15px;
--t-tech:       12px;   /* mono, UPPERCASE, ls .08em */
```

Display tavanı 52px → 148px. Gövde 15px → 17px.

**Kurulum kuralları:**
- Display: `wdth` 112, `wght` 600, `letter-spacing: -0.03em`, `line-height: 0.98`
- Teknik: `text-transform: uppercase`, `letter-spacing: 0.08em`, `font-feature-settings: "tnum" 1`
- Gövde: `letter-spacing: 0`, ölçü genişliği maks. `68ch`

### 5.2 Renk

Palet **tamamen mevcut siteden türetildi**; hiçbir renk atılmadı, roller yeniden dağıtıldı.

```css
--ink:        #0F1B33;   /* blueprint laciverti — eski --surface-3 / --sidebar */
--ink-deep:   #0A1222;   /* hero zemini — eski --glass-bg-strong tabanı */
--ink-raised: #182A4A;   /* yükseltilmiş yüzey — eski --navy-raised */
--chalk:      #F7F8FA;   /* çizgi & kâğıt — eski --bg */
--paper:      #FFFFFF;
--plaster:    #E6E1D6;   /* "gerçek" tarafın sıcaklığı — eski --rail-empty */
--brick:      #C23616;   /* tek vurgu — eski --accent */
--brick-lit:  #ED5A34;   /* koyu zemin üstü küçük metin — eski dark --accent-strong */
--line:       rgba(255,255,255,0.14);
--line-dark:  rgba(22,32,58,0.12);

/* durum renkleri — mevcut token'lardan aynen */
--avail-free:     #5B7DB1;
--avail-sold:     #C6443A;
--avail-reserved: #CE7C1B;
```

**Kontrast kararı (hesaplanmış, WCAG 2.2):**

| Çift | Oran | Karar |
|---|---|---|
| `--brick` #C23616 üzerine `--ink` #0F1B33 | **3.13:1** | Yalnızca ≥24px metin, grafik öğe ve çizgi. Küçük metin **yasak**. |
| `--brick-lit` #ED5A34 üzerine `--ink` #0F1B33 | **4.99:1** | Küçük metin dahil serbest (AA ✓). |
| `--chalk` #F7F8FA üzerine `--ink` #0F1B33 | ~16.9:1 | Serbest (AAA ✓). |

Bu ayrım token seviyesinde zorunludur: koyu zeminde 24px altı hiçbir metin `--brick` kullanamaz.

### 5.3 Form dili

```css
--radius-structural: 0;      /* panel, kart, bölüm, medya — çizimin yuvarlak köşesi yoktur */
--radius-control:    2px;    /* buton, input, select */
--radius-pill:       999px;  /* yalnızca durum çipleri */
```

10px genel yuvarlatmanın kaldırılması, jenerik SaaS okumasını bitiren tek en etkili karardır.

**Çizgi kalınlıkları:** `1px` saç teli (kılavuz, kural), `2px` (aktif/vurgu), `1px dashed` (kesit düzlemi, ölçü çizgisi).

### 5.4 Grid & uzay

- 12 kolon, maks. içerik genişliği `1440px`, oluk `24px` (mobil `16px`).
- **Görünür teknik grid:** saç teli kolon kılavuzları, `--line-dark` / `--line` ile, bölüm sınırlarında yatay kot çizgileri.
- **Kot rayı:** desktop'ta sol kenarda sabit `72px` şerit — kat işaretleri (`+3.20`, `+6.40`…) ve aktif konum işareti (`--brick`). `<1024px`'te sayfanın üstünde yatay ilerleme rayına dönüşür.
- Uzay ölçeği (4 tabanlı): `4 8 12 16 24 32 48 64 96 128 192`.

### 5.5 Hareket

| Katman | Teknoloji | Kapsam |
|---|---|---|
| Yumuşak scroll | Lenis | Tüm site. `prefers-reduced-motion` ile **tamamen** devre dışı. Klavye ve anchor navigasyonu korunur. |
| Kesit scrub | GSAP + ScrollTrigger | **Yalnızca `/`**. Diğer sayfalara yüklenmez. |
| Giriş animasyonları | IntersectionObserver + CSS | Tüm sayfalar. Yalnızca `opacity` + `transform`. |
| SVG çizim | `stroke-dashoffset` | Hero kesiti, monogram. |

- Easing: `cubic-bezier(0.22, 1, 0.36, 1)` — mevcut siteden korundu.
- Süre: `220ms` (hızlı) / `400ms` (temel) / `900ms` (SVG çizim).
- `will-change` yalnızca aktif animasyon sırasında, sonra kaldırılır.

**`prefers-reduced-motion: reduce` davranışı:** Lenis kapalı, ScrollTrigger scrub kapalı, kesit çizimi **tam çizili** başlar, fotoğraf zaten görünür, tüm giriş animasyonları anında son duruma atlar. Sayfa içerik olarak eksiksizdir.

---

## 6. Bileşen envanteri

```
site/     Header · Nav · Footer · KotRayi · TechCaption · SheetRule
ui/       Button · Chip · StatusChip · Card · Field · Checkbox ·
          Accordion · Metric · DimensionLine · SheetLabel
viz/      BuildingSection (SVG) · ElevationStack · AvailabilityGrid ·
          ProgressGauge · FloorPlanBadge
signature/ MakerMark · Colophon   (bkz. §8)
```

Her bileşen: tek sorumluluk, props ile yapılandırılır, ham renk/boyut değeri içermez (yalnızca token okur).

---

## 7. Sayfa spesifikasyonları

**URL'ler canlı siteden birebir korunur.** Bu bir yeniden tasarım, yeniden mimari değil — SEO ve mevcut bağlantılar bozulmaz, çıktı drop-in olur.

| Rota | Dosya | Ton |
|---|---|---|
| `/` | `index.astro` | Sinematik |
| `/features` | `features.astro` | Sakin editoryal |
| `/pricing` | `pricing.astro` | Sıfır gösteri |
| `/about` | `about.astro` | Tipografik |
| `/contact` | `contact.astro` | Form önde |
| `/search` | `search.astro` | Ürün yüzeyi |
| `/demo` | `demo.astro` | Ürün kabuğu |
| `/kunye` | `kunye.astro` | **Yeni** — imza künyesi |

### 7.1 `/` — Ana sayfa (sinematik)

**Bölüm 1 — Hero (100dvh)**
- Sol: kot rayı, kat işaretleriyle.
- Merkez-sol: `--t-display-xl` başlık — "Alıcı daireyi gezip randevuya geliyor" (birebir korunur).
- Arka/sağ: SVG bina kesiti, yüklenmede `stroke-dashoffset` ile kendini çizer (900ms, katlar 60ms arayla).
- Alt: mono teknik künye şeridi — `DUMAN-ERSA ORT. · 12 KAT · 48 DAİRE · MELİKGAZİ, KAYSERİ`
- CTA: "Sanal Tura Başla" (birebir korunur).

**Bölüm 2 — Kesit sahnesi (pinned, imza an)** ⭐
- ScrollTrigger ile pin'lenir. Scroll, kesit düzlemini bina boyunca yukarı sürer.
- Üç durakta üç iddia; metinler mevcut siteden alınır (`.01` / `.02` / `.03` bölümleri).
- Üçüncü durakta çizgi çözülür, yerini **gerçek iç mekân fotoğrafına** bırakır (opacity + clip-path geçişi).
- Sitenin **tek** gösteri anıdır. Başka hiçbir yerde bu ölçekte hareket olmayacak.

**Bölüm 3 — Üç kabiliyet**
Editoryal üçleme. Her biri: pafta numarası (`. 01`), başlık, gövde ve bir görsel. Metinler korunur.

Görsel, **kod ile çizilen arayüz temsili**dir (SVG + HTML) — mevcut ürünün ekran görüntüsü değil. Gerekçe: 360° görüntüleyici kapsam dışı olduğu için canlı ürün ekranına erişimimiz yok, ve yeniden tasarlanmış bir sitede eski arayüzün fotoğrafını göstermek tasarım dilini bozar. Temsiller yeni tasarım sistemiyle çizilir: `.01` kat seçici, `.02` firma sayfası kartı, `.03` kurulum akışı.

**Bölüm 4 — Yayın durumu**
"1 firma / 2 proje / 4 daire" verisi **saklanmaz, sahiplenilir.** Mono, tarihli, canlı sicil formatında:
```
YAYIN DURUMU · 08.09.2026
01  emlak ve inşaat firması
02  yayındaki konut projesi
04  gezilebilir daire
```
Küçük ama kesin sayı, teknik çerçevede *şeffaf* okunur — *yetersiz* değil.

**Bölüm 5 — 3 adımda / Fotoğraftan yayına**
Pafta referansı numaralandırması (`01/03`, `02/03`, `03/03`). Metinler korunur.

**Bölüm 6 — CTA + Footer** (imza sistemi Katman 1 burada).

### 7.2 `/features`
"Alıcı tarafı" ve "Firma tarafı" karşılıklı iki pafta olarak. 6 + 4 özellik, mevcut metinler birebir. İri tipografi, yalnızca giriş animasyonu.

### 7.3 `/pricing`
Üç kolon, saç teli kurallar, sıfır dekorasyon. Fiyatlar (`₺2.900` / `₺7.900` / `Özel teklif`) display tipte. "En popüler" rozeti yuvarlak pill değil, **tuğla renkli pafta etiketi** (dikdörtgen, mono, uppercase). Altta üç güvence + SSS akordiyonu (mevcut metinler).

### 7.4 `/about`
"Kat planı ve düz fotoğraf bir daireyi anlatmıyor." cümlesi tam genişlik tipografik an olarak kurulur. Ardından dört taahhüt 2×2 pafta gridinde.

### 7.5 `/contact`
Sol: form (Ad Soyad, Firma, E-posta, Telefon, Mesaj, KVKK onay kutusu). Cömert alanlar, `--radius-control`, görünür focus halkası.
Sağ: mono "antet bloğu" — e-posta, `Maslak, Sarıyer / İstanbul`, `Hafta içi 09:00 – 18:00`.
Form yalnızca istemci tarafı doğrulama + görsel durumlar (boş/hata/gönderiliyor/başarılı). Gerçek gönderim kapsam dışı.

### 7.6 `/search` — en büyük UI kazancı
Proje kartları **pafta antet bloğuna** dönüşür:
- Proje adı display tipte, firma adı mono
- Minik cephe diyagramı: kat sayısı + müsaitlik dağılımı
- `Boya %75` / `Teslim %100` gerçek bir teknik gösterge (ProgressGauge) olarak
- Fiyat display tipte

Filtreler solda drafting paneli (İnşaat Firması, İl/İlçe, Kat Aralığı, Daire Tipi, m²). Gerçek veri kullanılır: ERSA İNŞAAT / DUMAN-ERSA ORT. (12 kat, 48 daire, 3 gezilebilir, ₺5.750.000, Boya %75) ve ERSA VİZYON (1 kat, 1 daire, 1 gezilebilir, ₺4.450.000, Teslim %100).

### 7.7 `/demo` — kabuk
12 kat **gerçek bir cephe** olarak dikey dizilir. Her kat: kot etiketi, 4 daire hücresi, müsaitlik renkleri (`--avail-free/sold/reserved`), gezilebilir daire işareti.
**3D görüntüleyiciye dokunulmaz.** Bir daire hücresine tıklandığında görüntüleyici açılmaz; onun yerine tam ekran bir **devir paneli** açılır. Panel içeriği: seçilen dairenin künyesi (kat, daire no, m², durum), ve mono etiketle net bir sınır beyanı — `360° GÖRÜNTÜLEYİCİ · MEVCUT SİSTEM · KAPSAM DIŞI`. Panelde `konutverse.com/demo`ya giden gerçek bir çıkış linki bulunur. Sahte bir 360° görüntüleyici **üretilmeyecektir**.

### 7.8 `/kunye` — yeni
Bkz. §8.3.

---

## 8. Ajans imza sistemi

**Mevcut durum:** Footer'ın en altında `18×18px` favicon + "Alis Dijital" düz metin, `alisdijital.com`'a link. Ajansın ağırlığından hiçbir iz yok.

**Hedef:** Beş katmanlı, portatif, ölçülü ama sahiplenici bir sistem.

### 8.1 Katman 0 — Makine katmanı (görünmez)

Her sayfanın `<head>`inde:
```html
<meta name="author" content="Alis Dijital">
<link rel="author" href="https://alisdijital.com">
```
JSON-LD `@graph`ına `creator` düğümü eklenir; Alis Dijital ayrı bir `Organization` olarak `@id` ile tanımlanır ve `WebSite` düğümünden referans verilir. Ayrıca `public/humans.txt`.

Arama motorları siteyi kimin yaptığını makine okunur biçimde bilir. Sektörde neredeyse hiç yapılmayan bir hamle.

### 8.2 Katman 1 — Marka (her sayfada)

Footer'da, saç teli kuralın üstünde:
```
YAPIM
ALIS DİJİTAL              [monogram]
Kayseri · 2016'dan beri
```
- **Monogram:** favicon değil, çizilmiş SVG işaret. Drafting türevi, açısal, 16px'te okunur.
- Etiket mono/uppercase, isim display ağırlığında — sitenin **kendi tip sistemi**nde kurulur, sonradan yapıştırılmış değil tasarlanmış okunur.
- Hover: monogram çizgileri yeniden çizilir (200ms). **Tek jest.**
- `/kunye`ye link verir.

Görsel ağırlık mevcut imzanın yaklaşık 2 katı — fark edilir ama müşterinin sitesinde küstah değil.

### 8.3 Katman 2 — Künye `/kunye`

Tam yapım künyesi. Film jeneriği / kitap kolofonu mantığı, **pafta antet bloğu** olarak kurulur (konseptin tam içinde):

```
YAPIM KÜNYESİ                                        01/01
──────────────────────────────────────────────────────────
PROJE             Konutverse — 360° Sanal Daire Turu
YIL               2026
SANAT YÖNÜ        Plandan Mekâna
──────────────────────────────────────────────────────────
TASARIM           Alis Dijital
GELİŞTİRME        Alis Dijital
──────────────────────────────────────────────────────────
TİPOGRAFİ         Archivo · IBM Plex Mono · Inter
TEKNOLOJİ         Astro · GSAP ScrollTrigger · Lenis
ERİŞİLEBİLİRLİK   WCAG 2.2 AA
──────────────────────────────────────────────────────────
ALIS DİJİTAL      Kayseri, Türkiye · 2016'dan beri
                  200+ marka · İkas Premium Partner
                  Shopify Partner
                  alisdijital.com
```

Ajansın kimlik bilgileri müşterinin ana sayfasında bağırmadan taşınır. "Global" okuması tam da bu ölçüden gelir.

### 8.4 Katman 3 — Konsol imzası

DevTools açan geliştiriciye ASCII monogram + künye satırı, `console.log` ile. Tek seferlik, tek blok, gürültüsüz.

### 8.5 Katman 4 — Portatiflik (sistemi "sistem" yapan katman)

```
src/components/signature/
├── MakerMark.astro     props: variant (inline|stacked|compact), theme (light|dark|auto)
├── Colophon.astro      credits.ts'ten beslenir
├── credits.ts          tek veri kaynağı
├── signature.css       kendi scoped token'ları — host site token'larına bağımlı DEĞİL
├── signature.js        framework-bağımsız web component (<alis-signature>)
└── README.md           5 satırlık kurulum talimatı
```

**Kritik gereksinim:** Konutverse'ün gerçek sitesi Next.js. `signature.js` web component sürümü sayesinde imza sistemi bu Astro demosuna değil, **mevcut canlı Next.js sitesine de** doğrudan eklenebilir olmalıdır. Bileşen host'un CSS token'larına, framework'üne veya build sistemine bağımlı olamaz.

Varyantlar: `light` / `dark` / `auto`, `inline` / `stacked` / `compact`, print stili, `prefers-reduced-motion` desteği.

---

## 9. Teknik mimari

```
konutverse.com/
├── astro.config.mjs
├── package.json
├── public/
│   ├── humans.txt
│   └── img/
├── docs/superpowers/specs/
└── src/
    ├── styles/       tokens.css · base.css · utilities.css
    ├── layouts/      Base.astro
    ├── components/   site/ · ui/ · viz/ · signature/
    ├── content/      site.ts (tüm TR metin) · projects.ts (gerçek proje verisi)
    ├── scripts/      kesit-scrub.ts · reveal.ts · lenis-init.ts
    └── pages/        index · features · pricing · about · contact · search · demo · kunye
```

**Kararlar:**
- **Astro**, `output: 'static'`. Varsayılan sıfır JS; ada (island) yalnızca gerektiğinde.
- **İçerik tek kaynak:** tüm Türkçe metin `src/content/site.ts` içinde. Sayfa şablonlarında sabit metin yok.
- **Token tek kaynak:** `tokens.css` dışında ham renk/boyut değeri yok.
- **GSAP + ScrollTrigger yalnızca `/`** sayfasına yüklenir. Diğer sayfalar CSS + IntersectionObserver.
- Fontlar self-host (Fontsource npm).

**JS bütçesi (gzip, sayfa başına):**

| Sayfa | Bütçe |
|---|---|
| `/` | ≤ 80 KB (GSAP + ScrollTrigger + Lenis dahil) |
| Diğer tüm sayfalar | ≤ 20 KB |

---

## 10. Erişilebilirlik & performans

**Erişilebilirlik — WCAG 2.2 AA, pazarlık yok:**
- Tüm metin/zemin çiftleri ≥ 4.5:1 (büyük metin ≥ 3:1). §5.2'deki brick kısıtı zorunlu.
- Klavye ile tam gezinilebilir; her odaklanabilir öğede görünür focus halkası (`--brick-lit`, 2px offset).
- Anlamlı `<h1>`–`<h3>` hiyerarşisi, her sayfada tek `<h1>`.
- Dekoratif SVG'ler `aria-hidden`, anlamlı olanlarda `<title>`.
- Kesit sahnesi klavye kullanıcısı için erişilebilir: pin'lenmiş bölüm odak tuzağı oluşturmaz.
- `prefers-reduced-motion` tam destek (§5.5).
- Form: her alanda `<label>`, hata mesajları `aria-describedby` ile bağlı, KVKK onayı olmadan gönderim engellenir.

**Performans hedefleri (mobil, Lighthouse):**

| Metrik | Hedef |
|---|---|
| Performans | ≥ 92 |
| Erişilebilirlik | 100 |
| Best Practices | ≥ 95 |
| SEO | ≥ 95 |
| LCP | < 2.0s |
| CLS | < 0.05 |

Görseller: AVIF + WebP, `loading="lazy"` (hero hariç), açık `width`/`height`, responsive `srcset`.

---

## 11. Görsel varlıklar

- **İç mekân fotoğrafı:** boş, ışık dolu, henüz yaşanmamış daire. Kaynak: Unsplash (lisans uygun, atıf `credits.ts`e kaydedilir).
- **Bina kesiti:** el yapımı SVG, DUMAN-ERSA ORT.'nin gerçek verisiyle (12 kat, kat başına 4 daire).
- **Monogram:** el yapımı SVG.
- **Arayüz temsilleri:** kod ile çizilir (SVG + HTML), mevcut üründen ekran görüntüsü alınmaz (§7.1 Bölüm 3 gerekçesi).
- Stok fotoğraf yalnızca iç mekân için. İkon, doku, arka plan, diyagram üretimi kod ile.

---

## 12. Doğrulama planı

Uygulama tamamlandığında, iddia edilmeden önce her madde fiilen çalıştırılır:

1. `npm run build` hatasız tamamlanır.
2. 8 sayfanın tamamı 404'süz açılır; iç linkler doğrulanır.
3. Lighthouse 8 sayfada koşulur; §10 hedefleri karşılanır. Karşılanmayan varsa **rakamla** raporlanır.
4. Klavye-only geçiş: 8 sayfa, tüm etkileşimli öğeler.
5. `prefers-reduced-motion: reduce` ile 8 sayfa: içerik eksiksiz, scrub kapalı.
6. Viewport geçişi: 360 / 768 / 1024 / 1440 / 1920 px.
7. Kontrast: her metin/zemin çifti ölçülür, tablo hâlinde raporlanır.
8. İmza sistemi: `signature.js` web component'i boş bir HTML sayfasına eklenip Astro'suz çalıştığı doğrulanır.

Herhangi bir madde geçmezse rapor edilir; "tamamlandı" denmez.

---

## 13. Açık kararlar / riskler

| Konu | Karar |
|---|---|
| Lenis scroll hijack'i erişilebilirlik riski taşır | `prefers-reduced-motion`'da tamamen kapalı; klavye ve anchor navigasyonu native bırakılır. Kabul edilebilir. |
| GSAP dosya boyutu | Yalnızca `/` sayfasına yüklenerek sınırlanır. Bütçe §9'da tanımlı. |
| `--brick` kontrast yetersizliği | Token seviyesinde iki tonlu ayrım ile çözüldü (§5.2). |
| Sosyal kanıt zayıflığı | Tasarım kararı: sayı saklanmaz, teknik sicil formatında sahiplenilir (§7.1 Bölüm 4). |
| Astro çıktısı Next.js siteye doğrudan taşınamaz | Kabul edilmiş sınır. Sunum/vitrin parçasıdır. İstisna: imza sistemi web component olarak taşınabilir (§8.5). |
