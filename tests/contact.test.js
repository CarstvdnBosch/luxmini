import test from 'node:test';
import assert from 'node:assert/strict';
import { verwerkContact } from '../src/contact.js';

const BASIS = 'https://luxmini.nl/api/contact';
const geldig = { naam: 'Zoë de Vries', email: 'zoe@example.nl', telefoon: '', onderwerp: 'Kraamcadeaubox', bericht: 'Graag een box Giraf', website: '' };

const post = (velden) => new Request(BASIS, { method: 'POST', body: new URLSearchParams(velden) });
const doel = (res) => { const u = new URL(res.headers.get('location')); return u.pathname + u.search + u.hash; };
const lukt = async () => {};
const mislukt = async () => { throw new Error('mail kapot'); };

test('GET op /api/contact stuurt (303) naar /contact#formulier', async () => {
  const res = await verwerkContact(new Request(BASIS), lukt);
  assert.equal(res.status, 303);
  assert.equal(doel(res), '/contact#formulier');
});

test('geldig bericht gaat naar /bedankt', async () => {
  let verstuurd = null;
  const res = await verwerkContact(post(geldig), async (v) => { verstuurd = v; });
  assert.equal(res.status, 303);
  assert.equal(doel(res), '/bedankt');
  assert.equal(verstuurd.naam, 'Zoë de Vries');
});

test('spamval: doet alsof het gelukt is (/bedankt) en verstuurt niets', async () => {
  let verstuurd = false;
  const res = await verwerkContact(post({ ...geldig, website: 'http://spam' }), async () => { verstuurd = true; });
  assert.equal(doel(res), '/bedankt');
  assert.equal(verstuurd, false);
});

// Logboek opvangen: geeft de regels terug die tijdens fn() naar console.warn/console.error gingen.
async function metLog(fn) {
  const regels = [], warn = console.warn, error = console.error;
  console.warn = console.error = (...a) => regels.push(a.join(' '));
  try { return { uit: await fn(), regels }; } finally { console.warn = warn; console.error = error; }
}

test('mislukte controle gaat naar /contact?verzonden=fout#formulier', async () => {
  const { uit: res } = await metLog(() => verwerkContact(post({ ...geldig, email: 'geen-adres' }), lukt));
  assert.equal(res.status, 303);
  assert.equal(doel(res), '/contact?verzonden=fout#formulier');
});

test('ongeldig: het logboek noemt alleen de veldnamen, nooit de waarden', async () => {
  const invoer = { ...geldig, naam: '', email: 'geheim-adres-zonder-apenstaartje', bericht: 'Heel persoonlijk bericht' };
  const { uit: res, regels } = await metLog(() => verwerkContact(post(invoer), lukt));
  assert.equal(doel(res), '/contact?verzonden=fout#formulier');
  assert.deepEqual(regels, ['Formulier ongeldig: naam, email']);
  for (const w of ['geheim-adres', 'persoonlijk', 'Kraamcadeaubox']) assert.ok(!regels.join('\n').includes(w), `waarde "${w}" in het logboek`);
});

test('mislukte verzending gaat naar /contact?verzonden=fout&reden=versturen#formulier', async () => {
  const { uit: res, regels } = await metLog(() => verwerkContact(post(geldig), mislukt));
  assert.equal(res.status, 303);
  assert.equal(doel(res), '/contact?verzonden=fout&reden=versturen#formulier');
  assert.deepEqual(regels, ['Versturen mislukt: mail kapot']);
});

test('onleesbaar formulier gaat naar /contact?verzonden=fout#formulier', async () => {
  const kapot = new Request(BASIS, { method: 'POST', headers: { 'content-type': 'multipart/form-data; boundary=x' }, body: 'geen formulier' });
  const { uit: res } = await metLog(() => verwerkContact(kapot, lukt));
  assert.equal(res.status, 303);
  assert.equal(doel(res), '/contact?verzonden=fout#formulier');
});

test('extra velden van een ander onderwerp gaan niet mee naar de mail', async () => {
  let verstuurd = null;
  const res = await verwerkContact(post({ ...geldig, onderwerp: 'Babynest', nest_stof: 'teddy', box_formaat: '50', box_naam: 'Sem' }), async (v) => { verstuurd = v; });
  assert.equal(doel(res), '/bedankt');
  assert.equal(verstuurd.onderwerp, 'Babynest');
  assert.deepEqual(verstuurd.extra, [['Stof of kleur', 'teddy']]);
});
