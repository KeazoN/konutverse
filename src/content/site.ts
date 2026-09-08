/**
 * TÜM Türkçe metin. Şablonlarda sabit cümle bulunamaz.
 *
 * Metinler canlı konutverse.com'dan BİREBİR alınmıştır ve
 * değiştirilmez (spec §3). Yalnızca yeni teknik etiketler
 * (kot değerleri, pafta numaraları, damgalar) bu projeye aittir.
 */

export const site = {
  brand: {
    name: 'Konutverse',
    /** Wordmark iki parça olarak dizilir: "Konut" + "verse" */
    wordmark: ['Konut', 'verse'] as const,
    tagline: 'Emlak ve inşaat firmaları için sanal daire turu',
  },

  nav: [
    { label: 'Anasayfa', href: '/' },
    { label: 'Özellikler', href: '/features' },
    { label: 'Fiyatlandırma', href: '/pricing' },
    { label: 'Hakkımızda', href: '/about' },
    { label: 'İletişim', href: '/contact' },
  ],

  ctaPrimary: { label: 'Demo isteyin', href: '/contact' },
  ctaSecondary: { label: 'Örnek turu gezin', href: '/demo' },

  // ── Ana sayfa ─────────────────────────────────────────────
  home: {
    meta: {
      title: 'Emlak Sanal Tur Yazılımı: 360° Daire Gezintisi | Konutverse',
      description:
        'Alıcı daireyi görmeye gelmeden önce 360° sanal turla içeride geziyor. Dairelerinizin fotoğraflarını gönderin, turu kurup yayına alalım. Demo formunu doldurun.',
    },

    hero: {
      title: ['Alıcı daireyi gezip', 'randevuya geliyor'],
      body: 'Dairelerinizin fotoğraflarını gönderin; alıcı bina, kat ve daireyi seçip 360° içeride gezsin. Şehir dışındaki alıcı da aynı bağlantıdan girer.',
      cta: { label: 'Sanal Tura Başla', href: '/demo' },
      scrollHint: 'Aşağı kaydır',
    },

    kesit: {
      title: ['Sahaya gelen alıcı', 'daireyi zaten gezmiş olur'],
      body: 'Alıcı, ilgilenmediği daireyi ekranda eliyor. Satış ofisine gelen kişi planı biliyor; görüşme tanıtımla değil fiyat konuşmasıyla başlıyor.',
      /** Kesit sahnesinin üç durağı — teknik etiketler bu projeye ait. */
      stops: [
        { kot: '+0.00', label: 'Bina', line: 'Alıcı binayı ve katı seçer' },
        { kot: '+19.20', label: 'Kat', line: 'Boş daireye dokunur, içeri girer' },
        { kot: '+35.20', label: 'Daire', line: 'Odadan odaya yürür' },
      ],
    },

    capabilities: [
      {
        no: '01',
        kicker: 'Sanal daire turu',
        title: ['Bina, kat, daire:', 'üçü de tek bağlantıda'],
        body: 'Tur telefonun tarayıcısında açılır, uygulama indirilmez. Alıcı katı seçer, daireye girer, odaların arasında yürür.',
        cta: { label: 'Örnek turu gezin', href: '/demo' },
      },
      {
        no: '02',
        kicker: 'Proje sayfalarınız',
        title: ['Tüm projeleriniz', 'tek adreste'],
        body: 'Her projeniz kendi sayfasında yayında. Alıcı firmanızı seçip yayındaki bütün binaları ve daireleri aynı yerden gezer.',
        cta: { label: 'Firma sayfalarına bakın', href: '/search' },
      },
      {
        no: '03',
        kicker: 'Kurulum',
        title: ['Fotoğrafları gönderin,', 'turu biz kuralım'],
        body: 'Daire fotoğraflarını gönderin; bina, kat ve daire yapısını kurup turu yayına biz alıyoruz. Sizin tarafınızda yazılım işi yok.',
        cta: { label: 'Demo isteyin', href: '/contact' },
      },
    ],

    status: {
      kicker: 'Şu an yayında',
      title: 'Alıcılar bu daireleri şimdi geziyor',
      /** Teknik sicil damgası — bu projeye ait. */
      stamp: 'YAYIN DURUMU · 08.09.2026',
      metrics: [
        { value: 1, label: 'emlak ve inşaat firması' },
        { value: 2, label: 'yayındaki konut projesi' },
        { value: 4, label: 'gezilebilir daire' },
      ],
    },

    steps: {
      kicker: '3 adımda',
      title: 'Fotoğraftan yayına',
      items: [
        {
          no: '01/03',
          title: 'Fotoğrafları gönderin',
          body: 'Daire fotoğraflarınızı ve varsa kat planlarını iletin. 360° çekim yoksa nasıl çekileceğini anlatıyoruz.',
        },
        {
          no: '02/03',
          title: 'Turu biz kuruyoruz',
          body: 'Bina, kat ve daire yapısını kurup odaları birbirine bağlıyoruz. Sizin tarafınızda kurulum ya da yazılım işi yok.',
        },
        {
          no: '03/03',
          title: 'Bağlantıyı paylaşın',
          body: "Tek bağlantı; ilanda, WhatsApp'ta ve satış ofisi ekranında aynı şekilde açılır. Alıcı uygulama indirmez.",
        },
      ],
    },
  },

  // ── /features ─────────────────────────────────────────────
  features: {
    meta: {
      title: '360° Sanal Daire Turu Yazılımı Özellikleri | Konutverse',
      description:
        'Sanal daire turunu firmanız panelden kurar; alıcı bağlantıya dokunur, dairenin içinde gezer.',
    },
    kicker: 'Özellikler',
    title: 'Alıcı daireyi, gelmeden önce geziyor',
    lead: 'Sanal daire turunu firmanız panelden kurar; alıcı bağlantıya dokunur, dairenin içinde gezer. Yerinde gösterime yalnız daireyi baştan aşağı görmüş alıcı gelir.',

    buyer: {
      kicker: 'Alıcı tarafı',
      title: 'Alıcı turda ne yapıyor',
      items: [
        {
          title: 'Bina, kat, daire seçimi',
          body: 'Alıcı binayı ve katı seçer, o kattaki dairelerin durumunu görür: satılan, rezerve ve boş ayrı ayrı işaretli. Boş daireye dokununca içeri girer.',
        },
        {
          title: 'Dairede 360° gezinti',
          body: 'Parmakla sürükleyip etrafına bakar, kapıdaki oka dokunup diğer odaya geçer. Modeli yüklenmiş dairelerde klavyeyle serbest de yürünür.',
        },
        {
          title: 'Planda nerede olduğu',
          body: 'Köşedeki daire planında alıcının durduğu nokta ve baktığı yön işaretli kalır. Dairenin kattaki yeri de tek dokunuşla açılır.',
        },
        {
          title: 'Seçimleri belgeye dönüşür',
          body: 'Zemin ve duvar kaplamasını değiştirdikçe ek maliyet aralığı yanında görünür. Alıcı listeyi tek tuşla yazdırır, görüşmeye onunla gelir.',
        },
        {
          title: 'Tek link, uygulama yok',
          body: "Turu WhatsApp'tan ya da e-postayla gönderirsiniz, alıcı telefonda açar. Üyelik ve indirme yok; eski telefonlarda görüntü kendiliğinden hafifler.",
        },
        {
          title: 'Kaydırmadan, tek ekranda',
          body: 'Daire her zaman ekrana tam sığar; alıcı sayfayı aşağı kaydırmaz, kadrajı kaybetmez. Telefonda da bilgisayarda da aynı akış.',
        },
      ],
    },

    firm: {
      kicker: 'Firma tarafı',
      title: 'Turun size getirdiği',
      items: [
        {
          title: 'Turu firmanız kuruyor',
          body: 'Panelden bina, kat ve daire eklersiniz; oda görüntüsünde kapıya tıklayıp geçiş okunu koyar, yayınlarsınız. Yeni daire için ajans beklemezsiniz.',
        },
        {
          title: 'Hangi daire kaç kez gezildi',
          body: 'Panelde ziyaret sayısı, en çok gezilen daireler ve gelen talepler görünür. İlgi hangi daireye gidiyorsa bütçeyi oraya ayırırsınız.',
        },
        {
          title: 'KVKK onayı olmadan kayıt yok',
          body: 'İletişim formunda açık rıza kutusu işaretlenmeden hiçbir kayıt oluşmaz. Her firma yalnız kendi projelerini ve kendine gelen talepleri görür.',
        },
        {
          title: 'Kendi markanızla yayında',
          body: 'Firma sayfanız kendi logonuz ve renginizle açılır; projeleriniz orada listelenir. Turu kendi sitenize de gömebilirsiniz.',
        },
      ],
    },
  },

  // ── /pricing ──────────────────────────────────────────────
  pricing: {
    meta: {
      title: '360° Sanal Daire Turu Fiyatları ve Paketleri | Konutverse',
      description:
        'Fark proje ve daire sayısında. Aylık ödersiniz, taahhüt yok; planınızı istediğiniz ay yükseltip düşürebilirsiniz.',
    },
    kicker: 'Fiyatlandırma',
    title: '360° sanal daire turu fiyatları',
    lead: 'Fark proje ve daire sayısında. Aylık ödersiniz, taahhüt yok; planınızı istediğiniz ay yükseltip düşürebilirsiniz.',

    plans: [
      {
        name: 'Başlangıç',
        blurb: 'Tek projesi olan, 5 daireyle başlamak isteyen emlak ofisleri için.',
        price: '₺2.900',
        period: '/ ay',
        featured: false,
        items: [
          '1 proje · 5 daire turu',
          'Bina, kat ve daire seçimi; daire içinde 360° gezinme',
          'Tek link ile paylaşım, kendi sitenize gömme',
          '1 kullanıcı hesabı',
          'E-posta desteği',
        ],
      },
      {
        name: 'Profesyonel',
        blurb: 'Aynı anda birkaç projede satış yapan inşaat ve emlak firmaları için.',
        price: '₺7.900',
        period: '/ ay',
        featured: true,
        badge: 'En popüler',
        items: [
          '5 proje · 50 daire turu',
          'Kendi logonuz, renginiz ve alan adınızla yayın',
          'Müşteri talebi formu ve en çok gezilen daire raporu',
          'Eski telefonlarda da açılır, uygulama indirmek gerekmez',
          '5 kullanıcı hesabı',
          'Öncelikli destek',
        ],
      },
      {
        name: 'Kurumsal',
        blurb: 'Birden çok şubede satış yapan, yüksek portföylü firmalar için.',
        price: 'Özel',
        period: 'teklif',
        featured: false,
        items: [
          'Sınırsız proje ve daire turu',
          'Kurumsal tek şifreyle giriş, kişiye göre yetkilendirme',
          'Verilerinizin nerede tutulacağını siz seçersiniz',
          'Sözleşmeye yazılan çalışma süresi taahhüdü',
          'Sınırsız kullanıcı hesabı',
          'Size atanmış müşteri temsilcisi',
        ],
      },
    ],

    vatNote: 'Fiyatlara KDV dahil değildir.',

    assurances: [
      { title: 'Taahhüt yok', body: 'Aylık ödersiniz, istediğiniz ay bırakırsınız.' },
      { title: 'Kurulum ücreti yok', body: 'İlk dairenizi görüşmede birlikte kuruyoruz.' },
      { title: 'Kart bilgisi istenmez', body: 'Demo için ödeme aracı girmeniz gerekmez.' },
    ],

    faqTitle: 'Sık sorulanlar',
    faq: [
      {
        q: 'Turu kurmak için 360° kamera şart mı?',
        a: 'Hayır. Elinizdeki 3B modeli (.glb/.gltf) yükleyebilir ya da düz oda fotoğraflarıyla sınırlı bakışlı bir tur kurabilirsiniz. En zengin sonuç 360° panorama veya 3B modelle çıkar.',
      },
      {
        q: 'Turu kurmak ne kadar sürer?',
        a: 'İçerik hazırsa ilk daireyi demo görüşmesinde birlikte kuruyoruz. Sonraki daireleri panelden kendiniz ekliyorsunuz; ortalama bir daire yarım saat sürüyor.',
      },
      {
        q: 'Daire sayısı kotamı aşarsam ne olur?',
        a: 'Planınızı istediğiniz zaman yükseltebilirsiniz; ek daire paketleri de var. Yayındaki turlarınız kesintiye uğramaz, paylaştığınız bağlantılar çalışmaya devam eder.',
      },
      {
        q: 'Turu kendi sitemize gömebilir miyiz?',
        a: 'Evet. Her turun paylaşılabilir bir bağlantısı var ve bu bağlantı kendi sitenize iframe olarak gömülebiliyor. İlanlarınıza da aynı bağlantıyı koyabilirsiniz.',
      },
      {
        q: 'Alıcı tarafında ekstra ücret var mı?',
        a: 'Yok. Alıcı üyelik açmaz, uygulama indirmez, ücret ödemez. Tur bağlantıyı açtığı tarayıcıda çalışır.',
      },
      {
        q: 'Sözleşme ve iptal nasıl işliyor?',
        a: 'Aylık ödersiniz, süre taahhüdü yoktur; istediğiniz ay planı yükseltip düşürebilir ya da bırakabilirsiniz. Yıllık ödemede iki ay hediye uygulanır.',
      },
    ],
  },

  // ── /about ────────────────────────────────────────────────
  about: {
    meta: {
      title: 'Emlak ve İnşaat İçin 360° Sanal Daire Turu | Konutverse',
      description:
        'Emlak ve inşaat firmalarının dairelerini 360° sanal tura çeviriyoruz; alıcı binayı, katı ve daireyi seçip odadan odaya geziyor.',
    },
    kicker: 'Hakkımızda',
    title: 'Alıcı daireyi, gelmeden önce geziyor',

    /** Sanat yönünün dayandığı cümle. Tipografik an olarak kurulur. */
    keyline: 'Kat planı ve düz fotoğraf bir daireyi anlatmıyor.',
    keylineRest:
      'Emlak ve inşaat firmalarının dairelerini 360° sanal tura çeviriyoruz; alıcı binayı, katı ve daireyi seçip odadan odaya geziyor.',

    body: [
      'Konutverse, emlak ve inşaat firmalarının binalarını ve dairelerini yükleyip alıcıların uzaktan sanal turla gezebildiği bir platformdur. Alıcı binayı, katı ve daireyi seçer; dış kapıdan başlayıp odadan odaya dolaşır.',
      'Turu firmanın kendisi kurar: panelden bina, kat ve daire eklenir, oda görüntüsünde kapıya tıklanıp geçiş oku konur ve yayına alınır. Yeni bir daire eklemek için ajans beklemek gerekmez.',
      'Alıcı tarafında üyelik ya da uygulama indirme yoktur. Tur tek bir bağlantıdır; ilanda, WhatsApp\'ta ve satış ofisi ekranında aynı şekilde açılır.',
    ],

    promises: {
      kicker: 'Çalışma biçimimiz',
      title: 'Neye söz veriyoruz',
      items: [
        {
          title: 'Ne göreceğini söyleriz',
          body: 'Hangi dairede 360° gezinti, hangisinde tek açı olduğu turun içinde yazar. Alıcı beklediğinden azıyla karşılaşmaz.',
        },
        {
          title: 'Turu firmanız kurar',
          body: 'Yeni daire eklemek için bizi beklemezsiniz. Panelden bina, kat ve daireyi açar, odaları bağlar, yayına alırsınız.',
        },
        {
          title: 'Telefonda da açılır',
          body: "Turlar WhatsApp'tan gönderilip telefonda açılıyor. Eski cihazlarda görüntü kendiliğinden hafifler, tur yine çalışır.",
        },
        {
          title: 'Veriniz size ait',
          body: 'Her firma yalnız kendi projelerini ve kendine gelen talepleri görür. Talep kaydı, KVKK onayı işaretlenmeden oluşmaz.',
        },
      ],
    },
  },

  // ── /contact ──────────────────────────────────────────────
  contact: {
    meta: {
      title: 'Emlak Sanal Tur Yazılımı için Demo İsteyin | Konutverse',
      description:
        'Projenizi anlatın; örnek akışı birlikte gezip kendi dairenize nasıl uyarlayacağımızı 15 dakikada gösterelim.',
    },
    kicker: 'İletişim',
    title: 'Demo isteyin, turunuzu birlikte kuralım',
    lead: 'Projenizi anlatın; örnek akışı birlikte gezip kendi dairenize nasıl uyarlayacağımızı 15 dakikada gösterelim.',

    fields: [
      { name: 'ad', label: 'Ad Soyad', type: 'text', required: true, as: 'input' },
      { name: 'firma', label: 'Firma', type: 'text', required: true, as: 'input' },
      { name: 'eposta', label: 'E-posta', type: 'email', required: true, as: 'input' },
      { name: 'telefon', label: 'Telefon', type: 'tel', required: false, as: 'input' },
      { name: 'mesaj', label: 'Mesajınız', type: 'text', required: false, as: 'textarea' },
    ],

    kvkk: {
      linkLabel: 'KVKK Aydınlatma Metni',
      href: '/privacy',
      rest: "'ni okudum; iletişim bilgilerimin demo talebimin değerlendirilmesi amacıyla işlenmesine onay veriyorum.",
    },

    submit: 'Demo talebini gönder',
    reassurance: '1 iş günü içinde dönüş · 15 dakikalık görüşme · Sözleşme veya kart bilgisi istenmez',
    successMessage: 'Demo talebiniz alındı. 1 iş günü içinde dönüş yapılacak.',

    details: [
      { label: 'E-posta', value: 'merhaba@konutverse.com', href: 'mailto:merhaba@konutverse.com' },
      { label: 'Adres', value: 'Maslak, Sarıyer / İstanbul' },
      { label: 'Çalışma saatleri', value: 'Hafta içi 09:00 – 18:00' },
    ],

    seeFirst: { title: 'Önce görmek ister misiniz?', cta: 'Örnek turu gezin', href: '/demo' },
  },

  // ── /search ───────────────────────────────────────────────
  search: {
    meta: {
      title: '360° Sanal Turla Gezilebilen Konut Projeleri | Konutverse',
      description:
        'Yayındaki konut projelerini filtreleyin, 360° sanal turla daireleri içeriden gezin.',
    },
    kicker: 'Projeler',
    title: 'Arama & Filtreleme',
    lead: 'İhtiyaçlarınıza uygun mülkleri filtreleyin.',
    filters: {
      firm: 'İnşaat Firması',
      location: 'İl / İlçe',
      floors: 'Kat Aralığı',
      unitType: 'Daire Tipi',
      area: 'Metrekare (m²)',
      all: 'Tümü',
      clear: 'Filtreleri Temizle',
    },
    resultsLabel: (n: number) => `Sonuçları Göster (${n})`,
    priceSuffix: "'den başlayan fiyatlarla",
    tourBadge: '360° Tur',
    startTour: 'Turu Başlat',
    units: { floors: 'kat', units: 'daire', tourable: 'gezilebilir' },
  },

  // ── /demo ─────────────────────────────────────────────────
  demo: {
    meta: {
      title: '360° Sanal Daire Turu Demosu — Canlı Proje | Konutverse',
      description: 'Bina, kat ve daire seçin; 360° sanal turla dairenin içinde gezin.',
    },
    kicker: 'Sanal Tur',
    backLabel: 'Ana sayfa',
    floorHint: 'bir katı seçin',
    /** 3D görüntüleyici kapsam dışı — sınır açıkça beyan edilir. */
    handoff: {
      boundary: '360° GÖRÜNTÜLEYİCİ · MEVCUT SİSTEM · KAPSAM DIŞI',
      body: 'Bu arayüz yeniden tasarım kapsamındadır. 360° gezinti motoru Konutverse\'ün mevcut sistemindedir ve bu çalışmada değiştirilmemiştir.',
      cta: 'Gerçek turu konutverse.com\'da aç',
      href: 'https://konutverse.com/demo',
      close: 'Kapat',
    },
  },

  // ── /privacy ──────────────────────────────────────────────
  privacy: {
    meta: {
      title: 'KVKK Aydınlatma Metni ve Gizlilik Politikası | Konutverse',
      description:
        '6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında kişisel verilerinizin nasıl işlendiğine dair bilgilendirme.',
    },
    kicker: 'Yasal',
    title: 'KVKK Aydınlatma Metni',
    lead: '6698 sayılı Kişisel Verilerin Korunması Kanunu (“KVKK”) kapsamında, kişisel verilerinizin nasıl işlendiğine dair bilgilendirme.',
    updated: 'Son güncelleme: 17 Temmuz 2026',

    sections: [
      {
        no: '1',
        title: 'Veri Sorumlusu',
        paragraphs: [
          "Kişisel verileriniz, veri sorumlusu sıfatıyla Konutverse (“Şirket”) tarafından, aşağıda açıklanan kapsamda işlenmektedir. Bu metin, Şirket'in web sitesi ve hizmetleri aracılığıyla elde edilen kişisel veriler için geçerlidir.",
        ],
        items: [],
      },
      {
        no: '2',
        title: 'İşlenen Kişisel Veriler',
        paragraphs: [],
        items: [
          'Kimlik ve iletişim: ad-soyad, firma adı, e-posta, telefon.',
          'Talep içeriği: demo/iletişim formu aracılığıyla ilettiğiniz mesaj ve proje bilgileri.',
          'İşlem güvenliği: IP adresi, tarayıcı/cihaz bilgisi, çerez kayıtları.',
          'Kullanım verisi: gezilen sahneler, seçilen malzemeler gibi anonim/örüntü verileri (analitik).',
        ],
      },
      {
        no: '3',
        title: 'İşleme Amaçları',
        paragraphs: [],
        items: [
          'Demo ve iletişim taleplerinizin karşılanması, sizinle iletişim kurulması.',
          'Hizmetlerin sunulması, iyileştirilmesi ve performansının ölçülmesi.',
          'Sözleşmesel ve yasal yükümlülüklerin yerine getirilmesi.',
          'Bilgi güvenliğinin sağlanması ve kötüye kullanımın önlenmesi.',
        ],
      },
      {
        no: '4',
        title: 'Hukuki Sebepler',
        paragraphs: [
          "Kişisel verileriniz KVKK m.5 uyarınca; açık rızanız, bir sözleşmenin kurulması veya ifasıyla doğrudan ilgili olması, Şirket'in hukuki yükümlülüğünü yerine getirmesi ve meşru menfaati hukuki sebeplerine dayanılarak işlenir.",
        ],
        items: [],
      },
      {
        no: '5',
        title: 'Kimlere ve Hangi Amaçla Aktarılabilir',
        paragraphs: [
          'Verileriniz; barındırma ve içerik dağıtım (CDN) sağlayıcıları, e-posta ve analitik hizmet sağlayıcıları gibi tedarikçilerle ve yasal olarak yetkili kamu kurumlarıyla, yalnızca yukarıdaki amaçlarla sınırlı olarak ve gerekli teknik/idari tedbirler alınarak paylaşılabilir. Yurt dışına aktarım söz konusu olduğunda KVKK m.9 hükümlerine uyulur.',
        ],
        items: [],
      },
      {
        no: '6',
        title: 'Saklama Süresi',
        paragraphs: [
          'Kişisel verileriniz, işleme amacının gerektirdiği süre boyunca ve ilgili mevzuatta öngörülen zamanaşımı süreleri kadar saklanır; sürenin sonunda silinir, yok edilir veya anonim hale getirilir. Oluşturulan tur konfigürasyonları, kimlik referansı yerine anonim bir kopya (snapshot) olarak tutulur.',
        ],
        items: [],
      },
      {
        no: '7',
        title: 'Çerezler',
        paragraphs: [
          'Sitemiz; oturum yönetimi, tercihlerin hatırlanması (örn. tema) ve performans ölçümü için zorunlu ve işlevsel çerezler kullanır. Tarayıcı ayarlarınızdan çerezleri yönetebilir veya engelleyebilirsiniz; ancak bazı işlevler bundan etkilenebilir.',
        ],
        items: [],
      },
      {
        no: '8',
        title: 'İlgili Kişi Olarak Haklarınız (KVKK m.11)',
        paragraphs: [],
        items: [
          'Kişisel verinizin işlenip işlenmediğini öğrenme ve buna ilişkin bilgi talep etme.',
          'İşlenme amacını ve amaca uygun kullanılıp kullanılmadığını öğrenme.',
          'Yurt içinde/dışında aktarıldığı üçüncü kişileri bilme.',
          'Eksik/yanlış işlenmişse düzeltilmesini, şartlar oluştuğunda silinmesini isteme.',
          'İşlemenin münhasıran otomatik sistemlerle analizi sonucu aleyhinize bir sonuç çıkmasına itiraz etme.',
          'Kanuna aykırı işleme nedeniyle zararınızın giderilmesini talep etme.',
        ],
      },
      {
        no: '9',
        title: 'Başvuru ve İletişim',
        paragraphs: [
          'Haklarınıza ilişkin taleplerinizi kvkk@konutverse.com adresine iletebilirsiniz. Başvurunuz en geç 30 gün içinde sonuçlandırılır.',
        ],
        items: [],
      },
    ],

    disclaimer:
      'Bu metin bilgilendirme amaçlıdır ve yayına almadan önce hukuk danışmanınızca gözden geçirilmelidir.',
    contactEmail: 'kvkk@konutverse.com',
  },

  // ── Footer ────────────────────────────────────────────────
  footer: {
    blurb:
      'Emlak ve inşaat firmaları için sanal daire turu. Dairelerinizin fotoğraflarını gönderin, turu kurup yayına alalım; siz tek bağlantı paylaşın.',
    columns: [
      {
        head: 'Ürün',
        links: [
          { label: 'Özellikler', href: '/features' },
          { label: 'Nasıl çalışır', href: '/#nasil' },
          { label: 'Fiyatlandırma', href: '/pricing' },
          { label: '3D daireyi gez', href: '/demo' },
        ],
      },
      {
        head: 'Şirket',
        links: [
          { label: 'Hakkımızda', href: '/about' },
          { label: 'İletişim', href: '/contact' },
          { label: 'KVKK', href: '/privacy' },
        ],
      },
      {
        head: 'İletişim',
        links: [
          { label: 'merhaba@konutverse.com', href: 'mailto:merhaba@konutverse.com' },
          { label: 'Demo iste', href: '/contact' },
        ],
      },
    ],
    copyright: '© 2026 Konutverse',
  },
} as const;

export type Site = typeof site;
