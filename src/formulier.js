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
// Maatkeuzes per veld (besluit Carst 11 nov., brief 2026-11-11-c5-babymaten; 44, 46 en 48 erbij: Story 16, 12 nov.,
// brief 2026-11-12-productrij-carrousel-en-maten; bij de box weer weg en 34 en 36 erbij bij prematuurkleding:
// Carst 14 nov., brief 2026-11-14-goedkeuringen-teksten).
// Andere waarden vallen weg;
// in de mail staat "maat 50". "anders" geeft geen maatregel, dan telt het vrije veld.
export const MATEN = {
  box_maat: ['50', '56', '62', '68', '74'],
  prem_maat: ['32', '34', '36', '38', '44', '46', '48', '50', 'anders'],
  op_maat: ['32', '38', '44', '46', '48', '50', '56', '62', '68', '74', '80', '86', 'anders'],
};
// Vrij veld bij "Anders" → het bijbehorende keuzeveld. Valt weg als daar een vaste maat is gekozen
// (een verborgen, eerder ingevuld vrij veld gaat dus niet mee naast een vaste maat).
const ANDERS_BIJ = { prem_maat_anders: 'prem_maat', op_maat_anders: 'op_maat' };
// Thema's zoals op de site (Kraamcadeauboxen en de keuzelijst in het formulier); andere waarden vallen weg.
export const THEMAS = ['Giraf', 'Vos', 'Tulp', 'Walvis', 'Wilde blaadjes', 'Framboos', 'Regenboog', 'Wilgentakjes', 'Blaadjes en bloemen', 'Een eigen stof of kleur'];
export const EIGEN_STOF = 'Een eigen stof of kleur';

// Eigen stof (wens Carst 11 nov., brief 2026-11-11-c7-stofkeuze): optioneel een foto en/of een link, alleen bij thema = eigen stof.
// De foto gaat alleen als bijlage mee in de mail; er wordt niets opgeslagen of gelogd (geen naam, geen inhoud).
export const FOTO_MAX = 5 * 1024 * 1024; // 5 MB
export const LINK_MAX = 300;
// toegestane typen: opgegeven type (leeg mag: sommige systemen geven HEIC geen type) en de eerste bytes moeten kloppen
export const FOTO_TYPEN = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/heic': 'heic' };
const bytesZijn = (b, start, lijst) => lijst.every((x, i) => b[start + i] === x);
const ascii = (b, start, lengte) => String.fromCharCode(...b.slice(start, start + lengte));
/** Herkent het formaat aan de eerste bytes; geeft het MIME-type of null. */
export function fotoType(b) {
  if (!b || b.length < 12) return null;
  if (bytesZijn(b, 0, [0xff, 0xd8, 0xff])) return 'image/jpeg';
  if (bytesZijn(b, 0, [0x89, 0x50, 0x4e, 0x47])) return 'image/png';
  if (ascii(b, 0, 4) === 'RIFF' && ascii(b, 8, 4) === 'WEBP') return 'image/webp';
  if (ascii(b, 4, 4) === 'ftyp') {
    // HEIC: hoofdmerk heic/heix, of mif1/msf1 met heic/heix bij de compatibele merken. AVIF (mif1 + avif zonder heic-merk)
    // is geen HEIC en wordt geweigerd (controle ronde 1): de site accepteert alleen JPG, PNG, WEBP en HEIC.
    const hoofd = ascii(b, 8, 4);
    if (hoofd === 'heic' || hoofd === 'heix') return 'image/heic';
    if (hoofd === 'mif1' || hoofd === 'msf1') {
      const lengte = Math.min(b.length, ((b[0] << 24) | (b[1] << 16) | (b[2] << 8) | b[3]) >>> 0, 64);
      for (let i = 16; i + 4 <= lengte; i += 4) if (['heic', 'heix'].includes(ascii(b, i, 4))) return 'image/heic';
    }
  }
  return null;
}
/** Bestandsnaam voor de bijlage: zonder map, alleen a-z, 0-9, punt, streepje en liggend streepje, met de juiste extensie. */
export function schoneNaam(naam, type) {
  const ext = FOTO_TYPEN[type];
  let basis = String(naam ?? '').split(/[\\/]/).pop().replace(/\.[^.]*$/, '')
    .normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-').replace(/^[-._]+|[-._]+$/g, '').slice(0, 60);
  if (!basis) basis = 'stof';
  return `${basis}.${ext}`;
}
/** Link naar de stof: alleen https://, max. 300 tekens, zonder regeleinden of spaties. Geeft { ok, link }. */
export function controleerLink(waarde) {
  const w = String(waarde ?? '').trim();
  if (w === '') return { ok: true, link: '' };
  if (w.length > LINK_MAX || /[\s<>"]/.test(w) || !/^https:\/\//i.test(w)) return { ok: false };
  try {
    const u = new URL(w);
    // geen gebruikersgegevens in de link (https://naam:wachtwoord@…): misleidend en nooit nodig voor een webshop
    if (u.protocol !== 'https:' || !u.hostname.includes('.') || u.username || u.password || /^https:\/\/[^/?#]*@/i.test(w)) return { ok: false };
  } catch { return { ok: false }; }
  return { ok: true, link: w };
}
/** Leest de foto (File of Blob) en controleert type, grootte en eerste bytes.
 *  Geeft { ok: true, foto: null } zonder foto, { ok: true, foto: { naam, type, bytes } } of { ok: false }. */
export async function controleerFoto(bestand) {
  if (!bestand || typeof bestand === 'string' || typeof bestand.arrayBuffer !== 'function' || !bestand.size) return { ok: true, foto: null };
  if (bestand.size > FOTO_MAX) return { ok: false };
  const opgegeven = String(bestand.type || '').toLowerCase();
  if (opgegeven && opgegeven !== 'application/octet-stream' && !FOTO_TYPEN[opgegeven]) return { ok: false };
  const bytes = new Uint8Array(await bestand.arrayBuffer());
  if (bytes.length > FOTO_MAX) return { ok: false };
  const type = fotoType(bytes);
  if (!type) return { ok: false };
  return { ok: true, foto: { naam: schoneNaam(bestand.name, type), type, bytes } };
}

const schoon = (waarde, max = 200) =>
  String(waarde ?? '').replace(/[\r\n]+/g, ' ').trim().slice(0, max);

const EMAIL = /^[^\s@<>"',;]+@[^\s@<>"',;]+\.[^\s@<>"',;]{2,}$/;

/** Leest de formuliervelden uit en controleert ze. Geeft { ok, spam, velden, fouten, stofFouten }.
 *  fouten: de namen van de velden die ontbreken of ongeldig zijn (naam, email, bericht), nooit de waarden.
 *  stofFouten: ['link'] als bij een eigen stof de link ongeldig is (de foto controleert controleerFoto). */
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
  // eigen stof: de link (platte tekst) telt alleen bij thema = eigen stof; de foto leest controleerFoto (async)
  velden.eigenStof = velden.onderwerp === 'Kraamcadeaubox' && schoon(get('box_thema'), 80) === EIGEN_STOF;
  const stofFouten = [];
  if (velden.eigenStof) {
    const l = controleerLink(get('stof_link'));
    if (!l.ok) stofFouten.push('link');
    else if (l.link) velden.extra.push(['Link naar de stof', l.link]);
  }

  const fouten = [];
  if (velden.naam === '') fouten.push('naam');
  if (!EMAIL.test(velden.email)) fouten.push('email');
  if (velden.bericht === '') fouten.push('bericht');
  return { ok: fouten.length === 0, spam: false, velden, fouten, stofFouten };
}

const b64Bytes = (bytes) => {
  let bin = '';
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  return btoa(bin);
};
const b64 = (tekst) => b64Bytes(new TextEncoder().encode(tekst));
const kop = (tekst) => `=?UTF-8?B?${b64(tekst)}?=`;
const regels = (s) => s.replace(/.{1,76}/g, '$&\r\n').trimEnd();

/** Bouwt een eenvoudig tekstbericht (MIME) voor Cloudflare Email Routing.
 *  Met `foto` ({ naam, type, bytes }) wordt het multipart/mixed: dezelfde tekst plus de foto als bijlage. */
export function bouwMail({ velden, foto = null, afzender, ontvanger, nu = new Date(), id = crypto.randomUUID() }) {
  const domein = afzender.split('@')[1];
  const extra = (velden.extra || []).map(([k, w]) => `${k}: ${w}\n`).join('');
  const tekst =
    `Nieuw bericht via luxmini.nl\n\n` +
    `Naam: ${velden.naam}\n` +
    `E-mail: ${velden.email}\n` +
    `Telefoon: ${velden.telefoon || '-'}\n` +
    `Onderwerp: ${velden.onderwerp}\n` +
    (extra ? `\n${extra}` : '') +
    (foto ? `Foto van de stof: bijlage (${foto.naam})\n` : '') +
    `\nBericht:\n${velden.bericht}\n`;

  const koppen = [
    `From: ${kop('LUX mini website')} <${afzender}>`,
    `To: <${ontvanger}>`,
    `Reply-To: <${velden.email}>`,
    `Subject: ${kop(`Website: ${velden.onderwerp} – ${velden.naam}`)}`,
    `Date: ${nu.toUTCString()}`,
    `Message-ID: <${id}@${domein}>`,
    'MIME-Version: 1.0',
  ];
  if (!foto) {
    return [
      ...koppen,
      'Content-Type: text/plain; charset=UTF-8',
      'Content-Transfer-Encoding: base64',
      '',
      regels(b64(tekst)),
      '',
    ].join('\r\n');
  }
  const grens = `=_luxmini_${String(id).replace(/[^A-Za-z0-9]/g, '')}`;
  return [
    ...koppen,
    `Content-Type: multipart/mixed; boundary="${grens}"`,
    '',
    `--${grens}`,
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
    '',
    regels(b64(tekst)),
    `--${grens}`,
    `Content-Type: ${foto.type}; name="${foto.naam}"`,
    `Content-Disposition: attachment; filename="${foto.naam}"`,
    'Content-Transfer-Encoding: base64',
    '',
    regels(b64Bytes(foto.bytes)),
    `--${grens}--`,
    '',
  ].join('\r\n');
}
