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
    ['box_maat', 'Kledingmaat', 60],
  ],
  Prematuurkleding: [
    ['prem_maat', 'Maat of gewicht van de baby', 80],
    ['prem_naam', 'Naam op het kledingstuk', 120],
  ],
  Babynest: [
    ['nest_stof', 'Stof of kleur', 120],
    ['nest_naam', 'Naam', 120],
  ],
};
export const FORMATEN = ['35', '50', '65', '80'];
// Thema's zoals op de site (Kraamcadeauboxen en de keuzelijst in het formulier); andere waarden vallen weg.
export const THEMAS = ['Giraf', 'Vos', 'Tulp', 'Walvis', 'Wilde blaadjes', 'Framboos', 'Regenboog', 'Wilgentakjes', 'Blaadjes en bloemen', 'Een eigen stof of kleur'];

const schoon = (waarde, max = 200) =>
  String(waarde ?? '').replace(/[\r\n]+/g, ' ').trim().slice(0, max);

const EMAIL = /^[^\s@<>"',;]+@[^\s@<>"',;]+\.[^\s@<>"',;]{2,}$/;

/** Leest de formuliervelden uit en controleert ze. Geeft { ok, spam, velden }. */
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
    if (waarde) velden.extra.push([kop, waarde]);
  }

  const ok = velden.naam !== '' && velden.bericht !== '' && EMAIL.test(velden.email);
  return { ok, spam: false, velden };
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
