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
    prem_maat: '1800 gram', prem_naam: 'Noor', nest_stof: 'teddy', nest_naam: 'Lot' };
  const box = controleer(alles).velden;
  assert.deepEqual(box.extra, [['Formaat', '€ 50'], ['Thema', 'Giraf'], ['Naam op het product', 'Sem'], ['Geboortedatum of uitgerekende datum', '3 maart'], ['Kledingmaat', '56']]);
  const tekst = leesTekst(mail(box));
  assert.match(tekst, /Formaat: € 50/);
  assert.doesNotMatch(tekst, /1800 gram|teddy|Lot/);
  const nest = controleer({ ...alles, onderwerp: 'Babynest' }).velden;
  assert.deepEqual(nest.extra, [['Stof of kleur', 'teddy'], ['Naam', 'Lot']]);
  assert.doesNotMatch(leesTekst(mail(nest)), /Thema:|Naam op het product|1800 gram/);
  const prem = controleer({ ...alles, onderwerp: 'Prematuurkleding' }).velden;
  assert.deepEqual(prem.extra, [['Maat of gewicht van de baby', '1800 gram'], ['Naam op het kledingstuk', 'Noor']]);
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
  const r = controleer({ ...geldig, box_naam: 'Sem\r\nBcc: x@y.nl', box_thema: 'a'.repeat(500), onderwerp: 'Kraamcadeaubox' });
  for (const [, w] of r.velden.extra) assert.ok(!/[\r\n]/.test(w));
  assert.equal(r.velden.extra.find(([k]) => k === 'Thema')[1].length, 80);
  const raw = mail(r.velden);
  assert.match(raw, /\r\nSubject: =\?UTF-8\?B\?.+\?=\r\n/);
  assert.ok(!/^Bcc:/mi.test(raw.split('\r\n\r\n')[0]), 'geen Bcc-kop in de mail');
  // de onderwerpregel heeft dezelfde vorm
  const onderwerp = raw.match(/\r\nSubject: =\?UTF-8\?B\?(.+)\?=\r\n/)[1];
  assert.equal(new TextDecoder().decode(Uint8Array.from(atob(onderwerp), (c) => c.charCodeAt(0))), 'Website: Kraamcadeaubox – Zoë de Vries');
});
