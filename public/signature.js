/*!
 * Alis Dijital — İmza Sistemi, Katman 4
 * Taşınabilir yapım imzası. Bağımlılık yok, framework yok, build yok.
 *
 * Kullanım:
 *   <script src="/signature.js" defer></script>
 *   <alis-signature variant="stacked" theme="auto" href="/kunye"></alis-signature>
 *
 * Shadow DOM ile izole: host sayfanın CSS'i bileşene, bileşenin CSS'i
 * host sayfaya sızmaz. Host'un token'larına, sınıflarına veya font
 * yüklemesine BAĞIMLI DEĞİLDİR — kendi değerlerini taşır.
 *
 * © Alis Dijital · https://alisdijital.com
 */
(function () {
  'use strict';

  if (typeof customElements === 'undefined') return;
  if (customElements.get('alis-signature')) return;

  var CREDITS = {
    kicker: 'Yapım',
    name: 'Alis Dijital',
    url: 'https://alisdijital.com',
    city: 'Kayseri',
    since: '2016’dan beri',
  };

  /* Monogram — MakerMark.astro ile aynı yollar.
     Yinelenme kasıtlı: bu dosya bağımsız olmak zorunda. */
  var GLYPH =
    '<svg class="glyph" viewBox="0 0 30 24" aria-hidden="true" fill="none" ' +
    'stroke="currentColor" stroke-width="1.5" stroke-linecap="butt" stroke-linejoin="miter">' +
    '<path pathLength="1" d="M1 21 L7 3 L13 21"/>' +
    '<path pathLength="1" d="M3.2 16 H10.8"/>' +
    '<path pathLength="1" d="M17 3 H20 A9 9 0 0 1 20 21 H17 Z"/>' +
    '</svg>';

  var CSS = [
    ':host { display: inline-block; }',
    ':host([hidden]) { display: none; }',

    'a {',
    '  --ad-fg: #16203A;',
    '  --ad-muted: rgba(22,32,58,0.55);',
    '  --ad-accent: #C23616;',
    '  --ad-mono: "IBM Plex Mono", ui-monospace, SFMono-Regular, monospace;',
    '  --ad-sans: "Schibsted Grotesk", system-ui, -apple-system, sans-serif;',
    '  --ad-ease: cubic-bezier(0.22, 1, 0.36, 1);',
    '  display: inline-flex; align-items: center; gap: 12px;',
    '  text-decoration: none; color: var(--ad-fg);',
    '}',

    /* Koyu tema — açık seçim ya da sistem tercihi */
    ':host([theme="dark"]) a {',
    '  --ad-fg: #FFFFFF; --ad-muted: rgba(255,255,255,0.55); --ad-accent: #ED5A34;',
    '}',
    '@media (prefers-color-scheme: dark) {',
    '  :host([theme="auto"]) a {',
    '    --ad-fg: #FFFFFF; --ad-muted: rgba(255,255,255,0.55); --ad-accent: #ED5A34;',
    '  }',
    '}',

    '.glyph { width: 34px; height: 27px; flex: none; overflow: visible; }',
    '.glyph path { stroke-dasharray: 1; stroke-dashoffset: 0; }',
    'a:hover .glyph path, a:focus-visible .glyph path {',
    '  animation: ad-draw 560ms var(--ad-ease) both;',
    '}',
    'a:hover .glyph path:nth-child(2) { animation-delay: 90ms; }',
    'a:hover .glyph path:nth-child(3) { animation-delay: 150ms; }',
    '@keyframes ad-draw { from { stroke-dashoffset: 1; } to { stroke-dashoffset: 0; } }',

    '.t { display: grid; gap: 2px; }',
    '.k, .m {',
    '  font-family: var(--ad-mono); font-size: 10px; line-height: 1.3;',
    '  text-transform: uppercase; letter-spacing: 0.11em; color: var(--ad-muted);',
    '}',
    '.n {',
    '  font-family: var(--ad-sans); font-size: 15px;',
    '  font-weight: 600; line-height: 1.15; letter-spacing: -0.01em;',
    '  transition: color 220ms var(--ad-ease);',
    '}',
    'a:hover .n { color: var(--ad-accent); }',

    ':host([variant="inline"]) .k, :host([variant="inline"]) .m { display: none; }',
    ':host([variant="compact"]) .t { display: none; }',
    ':host([variant="compact"]) .glyph { width: 26px; height: 21px; }',

    'a:focus-visible { outline: 2px solid var(--ad-accent); outline-offset: 3px; }',

    '@media print { a { --ad-fg: #000000; --ad-muted: #444444; } }',
    '@media (prefers-reduced-motion: reduce) {',
    '  a:hover .glyph path, a:focus-visible .glyph path {',
    '    animation: none; stroke-dashoffset: 0;',
    '  }',
    '}',
  ].join('\n');

  function AlisSignature() {
    return Reflect.construct(HTMLElement, [], AlisSignature);
  }

  AlisSignature.prototype = Object.create(HTMLElement.prototype);
  AlisSignature.prototype.constructor = AlisSignature;
  Object.setPrototypeOf(AlisSignature, HTMLElement);

  AlisSignature.prototype.connectedCallback = function () {
    if (this.shadowRoot) return;

    if (!this.hasAttribute('variant')) this.setAttribute('variant', 'stacked');
    if (!this.hasAttribute('theme')) this.setAttribute('theme', 'auto');

    var href = this.getAttribute('href') || '/kunye';
    var root = this.attachShadow({ mode: 'open' });

    root.innerHTML =
      '<style>' + CSS + '</style>' +
      '<a href="' + href + '" aria-label="' + CREDITS.kicker + ': ' + CREDITS.name + '">' +
      GLYPH +
      '<span class="t">' +
      '<span class="k">' + CREDITS.kicker + '</span>' +
      '<span class="n">' + CREDITS.name + '</span>' +
      '<span class="m">' + CREDITS.city + ' · ' + CREDITS.since + '</span>' +
      '</span></a>';
  };

  customElements.define('alis-signature', AlisSignature);
})();
