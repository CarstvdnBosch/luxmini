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
