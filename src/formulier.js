// Controle en opbouw van het contactbericht. Los van Cloudflare, zodat het te testen is.

export const ONDERWERPEN = [
  'Iets op maat laten maken',
  'Prematuurkleding',
  'Kraamcadeaubox',
  'Iets anders',
];

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
  const tekst =
    `Nieuw bericht via luxmini.nl\n\n` +
    `Naam: ${velden.naam}\n` +
    `E-mail: ${velden.email}\n` +
    `Telefoon: ${velden.telefoon || '-'}\n` +
    `Onderwerp: ${velden.onderwerp}\n\n` +
    `Bericht:\n${velden.bericht}\n`;

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
