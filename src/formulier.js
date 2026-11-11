// Controle en opbouw van het contactbericht. Los van Cloudflare, zodat het te testen is.

// Volgorde zoals in het formulier: eerst waar de bezoeker voor komt (brief 2026-11-06).
export const ONDERWERPEN = [
  'Kraamcadeaubox',
  'Prematuurkleding',
  'Babynest',
  'Iets op maat laten maken',
  'Iets anders',
];

// Extra velden per onderwerp: [veldnaam, kop in de mail, maximale lengte].
// Alleen de velden van het gekozen onderwerp komen in de mail; alle extra velden zijn optioneel.
export const EXTRA_VELDEN = {
  Kraamcadeaubox: [
    ['box_formaat', 'Formaat', 4],
    ['box_thema', 'Thema', 80],
    ['box_naam', 'Naam op het product', 120],
    ['box_datum', 'Geboortedatum of uitgerekende datum', 60],
    ['box_maat', 'Kledingmaat', 20],
  ],
  Prematuurkleding: [
    ['prem_maat', 'Maat van de baby', 20],
    ['prem_maat_anders', 'Andere maat of gewicht', 80],
    ['prem_naam', 'Naam op het kledingstuk', 120],
  ],
  Babynest: [
    ['nest_stof', 'Stof of kleur', 120],
    ['nest_naam', 'Naam op het babynest', 120],
  ],
  'Iets op maat laten maken': [
    ['op_maat', 'Maat', 20],
    ['op_maat_anders', 'Andere maat', 80],
  ],
};
export const FORMATEN = ['35', '50', '65', '80'];
// Maatkeuzes per veld (besluit Carst 11 nov., brief 2026-11-11-c5-babymaten). Andere waarden vallen weg;
// in de mail staat "maat 50". "anders" geeft geen maatregel, dan telt het vrije veld.
export const MATEN = {
  box_maat: ['50', '56', '62', '68', '74'],
  prem_maat: ['32', '38', '44', '50', 'anders'],
  op_maat: ['32', '38', '44', '50', '56', '62', '68', '74', '80', '86', 'anders'],
};
// Vrij veld bij "Anders" → het bijbehorende keuzeveld. Valt weg als daar een vaste maat is gekozen
// (een verborgen, eerder ingevuld vrij veld gaat dus niet mee naast een vaste maat).
const ANDERS_BIJ = { prem_maat_anders: 'prem_maat', op_maat_anders: 'op_maat' };
// Thema's zoals op de site (Kraamcadeauboxen en de keuzelijst in het formulier); andere waarden vallen weg.
export const THEMAS = ['Giraf', 'Vos', 'Tulp', 'Walvis', 'Wilde blaadjes', 'Framboos', 'Regenboog', 'Wilgentakjes', 'Blaadjes en bloemen', 'Een eigen stof of kleur'];

const schoon = (waarde, max = 200) =>
  String(waarde ?? '').replace(/[\r\n]+/g, ' ').trim().slice(0, max);

const EMAIL = /^[^\s@<>"',;]+@[^\s@<>"',;]+\.[^\s@<>"',;]{2,}$/;

/** Leest de formuliervelden uit en controleert ze. Geeft { ok, spam, velden, fouten }.
 *  fouten: de namen van de velden die ontbreken of ongeldig zijn (naam, email, bericht), nooit de waarden. */
export function controleer(form) {
  const get = (k) => (typeof form.get === 'function' ? form.get(k) : form[k]);
  if (schoon(get('website'))) return { ok: false, spam: true };

  const velden = {
    naam: schoon(get('naam'), 120),
    email: schoon(get('email'), 160),
    telefoon: schoon(get('telefoon'), 40),
    onderwerp: schoon(get('onderwerp'), 80),
    bericht: String(get('bericht') ?? '').trim().slice(0, 5000),
  };
  if (!ONDERWERPEN.includes(velden.onderwerp)) velden.onderwerp = 'Iets anders';

  // extra velden: alleen die van het gekozen onderwerp, zonder regeleinden en met een maximumlengte
  velden.extra = [];
  for (const [naam, kop, max] of EXTRA_VELDEN[velden.onderwerp] || []) {
    let waarde = schoon(get(naam), max);
    if (naam === 'box_formaat') waarde = FORMATEN.includes(waarde) ? `€ ${waarde}` : '';
    if (naam === 'box_thema' && !THEMAS.includes(waarde)) waarde = '';
    if (MATEN[naam]) waarde = MATEN[naam].includes(waarde) && waarde !== 'anders' ? `maat ${waarde}` : '';
    if (ANDERS_BIJ[naam]) {
      const keuze = schoon(get(ANDERS_BIJ[naam]), 20);
      if (keuze !== 'anders' && keuze !== '') waarde = ''; // vrij veld alleen bij Anders (of zonder keuze, zonder JS)
    }
    if (waarde) velden.extra.push([kop, waarde]);
  }

  const fouten = [];
  if (velden.naam === '') fouten.push('naam');
  if (!EMAIL.test(velden.email)) fouten.push('email');
  if (velden.bericht === '') fouten.push('bericht');
  return { ok: fouten.length === 0, spam: false, velden, fouten };
}

const b64 = (tekst) => {
  const bytes = new TextEncoder().encode(tekst);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
};
const kop = (tekst) => `=?UTF-8?B?${b64(tekst)}?=`;
const regels = (s) => s.replace(/.{1,76}/g, '$&\r\n').trimEnd();

/** Bouwt een eenvoudig tekstbericht (MIME) voor Cloudflare Email Routing. */
export function bouwMail({ velden, afzender, ontvanger, nu = new Date(), id = crypto.randomUUID() }) {
  const domein = afzender.split('@')[1];
  const extra = (velden.extra || []).map(([k, w]) => `${k}: ${w}\n`).join('');
  const tekst =
    `Nieuw bericht via luxmini.nl\n\n` +
    `Naam: ${velden.naam}\n` +
    `E-mail: ${velden.email}\n` +
    `Telefoon: ${velden.telefoon || '-'}\n` +
    `Onderwerp: ${velden.onderwerp}\n` +
    (extra ? `\n${extra}` : '') +
    `\nBericht:\n${velden.bericht}\n`;

  return [
    `From: ${kop('LUX mini website')} <${afzender}>`,
    `To: <${ontvanger}>`,
    `Reply-To: <${velden.email}>`,
    `Subject: ${kop(`Website: ${velden.onderwerp} – ${velden.naam}`)}`,
    `Date: ${nu.toUTCString()}`,
    `Message-ID: <${id}@${domein}>`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
    '',
    regels(b64(tekst)),
    '',
  ].join('\r\n');
}
