import { credits } from '../components/signature/credits';
import { upperTr } from '../lib/turkish';

/** İmza Sistemi — Katman 3: DevTools açan geliştiriciye künye.
 *  Tek blok, tek seferlik, gürültüsüz. */
const mark = [
  '',
  '   /\    ___',
  '  /––\  |   \    ' + upperTr(credits.maker.name),
  ' /    \ |___/    ' + credits.maker.city + ' · ' + credits.maker.since,
  '',
  '   ' + credits.project,
  '   Sanat yönü · ' + credits.artDirection,
  '   ' + credits.technology.join(' · '),
  '',
  '   ' + credits.maker.url,
  '',
].join('\n');

console.log(
  '%c' + mark,
  'color:#ED5A34;font-family:ui-monospace,monospace;font-size:11px;line-height:1.5'
);
