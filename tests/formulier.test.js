import test from 'node:test';
import assert from 'node:assert/strict';
import { controleer, bouwMail } from '../src/formulier.js';

const geldig = {
  naam: 'Zoë de Vries', email: 'zoe@example.nl', telefoon: '0612345678',
  onderwerp: 'Kraamcadeaubox', bericht: 'Graag een box Giraf\nmaat 56', website: '',
};

test('geldig formulier wordt geaccepteerd', () => {
  const r = controleer(geldig);
  assert.equal(r.ok, true);
  assert.equal(r.velden.onderwerp, 'Kraamcadeaubox');
});

test('spamveld ingevuld wordt herkend', () => {
  assert.equal(controleer({ ...geldig, website: 'http://spam' }).spam, true);
});

test('ongeldig e-mailadres of lege velden worden geweigerd', () => {
  assert.equal(controleer({ ...geldig, email: 'geen-adres' }).ok, false);
  assert.equal(controleer({ ...geldig, naam: '  ' }).ok, false);
  assert.equal(controleer({ ...geldig, bericht: '' }).ok, false);
});

test('regeleinden in naam of e-mail kunnen geen extra mailkoppen maken', () => {
  const r = controleer({ ...geldig, naam: 'Piet\r\nBcc: x@y.nl', email: 'a@b.nl\nBcc: c@d.nl' });
  assert.equal(r.ok, false);
  assert.ok(!r.velden.naam.includes('\n'));
});

test('onbekend onderwerp wordt "Iets anders"', () => {
  assert.equal(controleer({ ...geldig, onderwerp: 'hack' }).velden.onderwerp, 'Iets anders');
});

test('mail heeft de juiste koppen en leesbare inhoud', () => {
  const { velden } = controleer(geldig);
  const raw = bouwMail({ velden, afzender: 'website@luxmini.nl', ontvanger: 'info.luxmini@gmail.com', id: 'test' });
  assert.match(raw, /^From: =\?UTF-8\?B\?.+\?= <website@luxmini\.nl>\r\n/);
  assert.match(raw, /\r\nTo: <info\.luxmini@gmail\.com>\r\n/);
  assert.match(raw, /\r\nReply-To: <zoe@example\.nl>\r\n/);
  assert.match(raw, /\r\nMessage-ID: <test@luxmini\.nl>\r\n/);
  const body = raw.split('\r\n\r\n')[1].replace(/\r\n/g, '');
  const tekst = new TextDecoder().decode(Uint8Array.from(atob(body), (c) => c.charCodeAt(0)));
  assert.match(tekst, /Naam: Zoë de Vries/);
  assert.match(tekst, /maat 56/);
});

// Brief 2026-11-06 (homepage zoals Stock): onderwerp Babynest en extra velden per onderwerp
const leesTekst = (raw) => { const body = raw.split('\r\n\r\n')[1].replace(/\r\n/g, '');
  return new TextDecoder().decode(Uint8Array.from(atob(body), (c) => c.charCodeAt(0))); };
const mail = (velden) => bouwMail({ velden, afzender: 'website@luxmini.nl', ontvanger: 'info.luxmini@gmail.com', id: 'test' });

test('Babynest wordt als onderwerp geaccepteerd', () => {
  const r = controleer({ ...geldig, onderwerp: 'Babynest' });
  assert.equal(r.ok, true);
  assert.equal(r.velden.onderwerp, 'Babynest');
});

test('extra velden komen alleen in de mail bij het gekozen onderwerp', () => {
  const alles = { ...geldig, box_formaat: '50', box_thema: 'Giraf', box_naam: 'Sem', box_datum: '3 maart', box_maat: '56',
    prem_maat: 'anders', prem_maat_anders: '1800 gram', prem_naam: 'Noor', nest_stof: 'teddy', nest_naam: 'Lot', op_maat: '86' };
  const box = controleer(alles).velden;
  assert.deepEqual(box.extra, [['Formaat', '€ 50'], ['Thema', 'Giraf'], ['Naam op het product', 'Sem'], ['Geboortedatum of uitgerekende datum', '3 maart'], ['Kledingmaat', 'maat 56']]);
  const tekst = leesTekst(mail(box));
  assert.match(tekst, /Formaat: € 50/);
  assert.match(tekst, /Kledingmaat: maat 56/);
  assert.doesNotMatch(tekst, /1800 gram|teddy|Lot/);
  const nest = controleer({ ...alles, onderwerp: 'Babynest' }).velden;
  assert.deepEqual(nest.extra, [['Stof of kleur', 'teddy'], ['Naam op het babynest', 'Lot']]);
  assert.doesNotMatch(leesTekst(mail(nest)), /Thema:|Naam op het product|1800 gram/);
  const prem = controleer({ ...alles, onderwerp: 'Prematuurkleding' }).velden;
  assert.deepEqual(prem.extra, [['Andere maat of gewicht', '1800 gram'], ['Naam op het kledingstuk', 'Noor']]);
  assert.deepEqual(controleer({ ...alles, onderwerp: 'Iets op maat laten maken' }).velden.extra, [['Maat', 'maat 86']]);
  assert.deepEqual(controleer({ ...alles, onderwerp: 'Iets anders' }).velden.extra, []);
  assert.deepEqual(controleer({ ...alles, onderwerp: 'hack' }).velden.extra, []);
});

test('een ongeldig formaat valt weg', () => {
  for (const f of ['99', '35 ', '€ 35', '<script>', '3500', '']) {
    const extra = controleer({ ...geldig, box_formaat: f }).velden.extra;
    if (f === '35 ') assert.deepEqual(extra, [['Formaat', '€ 35']]); // spaties eromheen tellen niet
    else assert.equal(extra.some(([k]) => k === 'Formaat'), false, `formaat ${JSON.stringify(f)}`);
  }
});

test('geen regeleinden en een maximumlengte in extra velden (geen kopinjectie)', () => {
  const r = controleer({ ...geldig, box_naam: 'Sem\r\nBcc: x@y.nl', box_datum: 'a'.repeat(500), onderwerp: 'Kraamcadeaubox' });
  for (const [, w] of r.velden.extra) assert.ok(!/[\r\n]/.test(w));
  assert.equal(r.velden.extra.find(([k]) => k.startsWith('Geboortedatum'))[1].length, 60);
  const anders = controleer({ ...geldig, onderwerp: 'Prematuurkleding', prem_maat: 'anders', prem_maat_anders: '1800\r\nBcc: x@y.nl' + 'g'.repeat(500) });
  assert.equal(anders.velden.extra[0][1].length, 80);
  assert.ok(!/[\r\n]/.test(anders.velden.extra[0][1]));
  const raw = mail(r.velden);
  assert.match(raw, /\r\nSubject: =\?UTF-8\?B\?.+\?=\r\n/);
  assert.ok(!/^Bcc:/mi.test(raw.split('\r\n\r\n')[0]), 'geen Bcc-kop in de mail');
  // de onderwerpregel heeft dezelfde vorm
  const onderwerp = raw.match(/\r\nSubject: =\?UTF-8\?B\?(.+)\?=\r\n/)[1];
  assert.equal(new TextDecoder().decode(Uint8Array.from(atob(onderwerp), (c) => c.charCodeAt(0))), 'Website: Kraamcadeaubox – Zoë de Vries');
});

test('thema geldt alleen als het een van de negen thema\'s of "Een eigen stof of kleur" is', () => {
  const thema = (t) => (controleer({ ...geldig, box_thema: t }).velden.extra.find(([k]) => k === 'Thema') || [])[1];
  assert.equal(thema('Wilde blaadjes'), 'Wilde blaadjes');
  assert.equal(thema('Een eigen stof of kleur'), 'Een eigen stof of kleur');
  for (const t of ['giraf', 'Olifant', '<script>', 'Giraf\r\nBcc: x@y.nl', '']) assert.equal(thema(t), undefined, `thema ${JSON.stringify(t)}`);
});

// Brief 2026-11-11-c5-babymaten: maatkeuzes per onderwerp (besluit Carst 11 nov.); maat 44, 46 en 48 erbij (Story 16, 12 nov.), bij de box weer weg, 34 en 36 erbij bij prematuurkleding (Carst 14 nov.)
const maatIn = (onderwerp, velden) => controleer({ ...geldig, onderwerp, ...velden }).velden.extra;

test('kraamcadeaubox: alleen maat 50 t/m 74, als "maat 50" in de mail', () => {
  for (const m of ['50', '56', '62', '68', '74']) assert.deepEqual(maatIn('Kraamcadeaubox', { box_maat: m }), [['Kledingmaat', `maat ${m}`]]);
  for (const m of ['', '32', '42', '44', '46', '47', '48', '80', '92', 'anders', 'Weet ik nog niet', '56cm', '46cm', '<b>56</b>', '<b>46</b>', '5'.repeat(500)]) {
    assert.deepEqual(maatIn('Kraamcadeaubox', { box_maat: m }), [], `box_maat ${JSON.stringify(m)}`);
  }
  assert.match(leesTekst(mail(controleer({ ...geldig, box_maat: '62' }).velden)), /\nKledingmaat: maat 62\n/);
  assert.match(leesTekst(mail(controleer({ ...geldig, box_maat: '50' }).velden)), /\nKledingmaat: maat 50\n/);
});

test('prematuurkleding: maat 32 t/m 50 of anders met een vrij veld', () => {
  for (const m of ['32', '34', '36', '38', '44', '46', '48', '50']) assert.deepEqual(maatIn('Prematuurkleding', { prem_maat: m }), [['Maat van de baby', `maat ${m}`]]);
  for (const m of ['56', '33', '35', '37', '42', '47', '92', '0', 'hack', '<script>', '<b>46</b>', '46cm', '4'.repeat(500)]) assert.deepEqual(maatIn('Prematuurkleding', { prem_maat: m }), [], `prem_maat ${JSON.stringify(m)}`);
  // anders: alleen het vrije veld; leeg vrij veld geeft niets
  assert.deepEqual(maatIn('Prematuurkleding', { prem_maat: 'anders', prem_maat_anders: '1450 gram' }), [['Andere maat of gewicht', '1450 gram']]);
  assert.deepEqual(maatIn('Prematuurkleding', { prem_maat: 'anders', prem_maat_anders: '  ' }), []);
  // zonder keuze (zonder :has staat het vrije veld er altijd) telt het vrije veld ook
  assert.deepEqual(maatIn('Prematuurkleding', { prem_maat_anders: '1450 gram' }), [['Andere maat of gewicht', '1450 gram']]);
  // een vaste maat gaat voor: een eerder ingevuld (verborgen) vrij veld gaat niet mee
  assert.deepEqual(maatIn('Prematuurkleding', { prem_maat: '44', prem_maat_anders: '1450 gram' }), [['Maat van de baby', 'maat 44']]);
  const tekst = leesTekst(mail(controleer({ ...geldig, onderwerp: 'Prematuurkleding', prem_maat: 'anders', prem_maat_anders: '1450 gram' }).velden));
  assert.match(tekst, /\nAndere maat of gewicht: 1450 gram\n/);
  assert.match(leesTekst(mail(controleer({ ...geldig, onderwerp: 'Prematuurkleding', prem_maat: '48' }).velden)), /\nMaat van de baby: maat 48\n/);
  assert.match(leesTekst(mail(controleer({ ...geldig, onderwerp: 'Prematuurkleding', prem_maat: '34' }).velden)), /\nMaat van de baby: maat 34\n/);
  assert.doesNotMatch(tekst, /anders\n|Maat van de baby/);
});

test('iets op maat: maat 32 t/m 86 of anders met een vrij veld', () => {
  for (const m of ['32', '38', '44', '46', '48', '50', '56', '62', '68', '74', '80', '86']) assert.deepEqual(maatIn('Iets op maat laten maken', { op_maat: m }), [['Maat', `maat ${m}`]]);
  for (const m of ['92', '42', '47', '1', 'Anders', '<b>46</b>', '46cm', '86 ', 'x'.repeat(300)]) {
    const extra = maatIn('Iets op maat laten maken', { op_maat: m });
    if (m === '86 ') assert.deepEqual(extra, [['Maat', 'maat 86']]); // spaties eromheen tellen niet
    else assert.deepEqual(extra, [], `op_maat ${JSON.stringify(m)}`);
  }
  assert.deepEqual(maatIn('Iets op maat laten maken', { op_maat: 'anders', op_maat_anders: 'maat 98' }), [['Andere maat', 'maat 98']]);
  assert.deepEqual(maatIn('Iets op maat laten maken', { op_maat: '62', op_maat_anders: 'maat 98' }), [['Maat', 'maat 62']]);
  assert.match(leesTekst(mail(controleer({ ...geldig, onderwerp: 'Iets op maat laten maken', op_maat: '44' }).velden)), /\nMaat: maat 44\n/);
  // velden van andere onderwerpen gaan niet mee
  assert.deepEqual(maatIn('Iets anders', { op_maat: '62', box_maat: '56', prem_maat: '44' }), []);
  assert.deepEqual(maatIn('Kraamcadeaubox', { op_maat: '62', prem_maat: '44' }), []);
});
