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

// ---------- Botbescherming (brief 2026-11-14-formulier-botbescherming, criterium 18) ----------
import { NA_TE_VEEL, NA_TE_SNEL, NA_CONTROLE, NA_FOUT, maakSiteverify, SITEVERIFY } from '../src/contact.js';

const IP = '203.0.113.77';
const TOKEN = 'token-van-de-bezoeker-123';
const postIp = (velden) => new Request(BASIS, { method: 'POST', body: new URLSearchParams(velden), headers: { 'cf-connecting-ip': IP } });
const door = async () => true;
// Turnstile-nep die bijhoudt hoe vaak en met wat hij is aangeroepen
const nepTurnstile = (uitslag) => { const f = async (token, ip) => { f.aanroepen.push([token, ip]); if (uitslag instanceof Error) throw uitslag; return uitslag; }; f.aanroepen = []; return f; };
const geenSporen = (regels) => { const alles = regels.join('\n'); for (const w of [IP, TOKEN, 'zoe@example.nl', 'Zoë', 'giraf']) assert.ok(!alles.includes(w), `"${w}" in het logboek`); };

test('tijdcontrole: zonder het veld formtijd gaat het bericht door (geen JavaScript)', async () => {
  const res = await verwerkContact(post(geldig), lukt);
  assert.equal(doel(res), '/bedankt');
});

test('tijdcontrole: 2999 → te-snel, niets verstuurd; 3000 → door', async () => {
  let verstuurd = false;
  const { uit: res, regels } = await metLog(() => verwerkContact(post({ ...geldig, formtijd: '2999' }), async () => { verstuurd = true; }));
  assert.equal(doel(res), NA_TE_SNEL);
  assert.equal(res.status, 303);
  assert.equal(verstuurd, false);
  assert.deepEqual(regels, ['Formulier geweigerd: te-snel']);
  assert.equal(doel(await verwerkContact(post({ ...geldig, formtijd: '3000' }), lukt)), '/bedankt');
  assert.equal(doel(await verwerkContact(post({ ...geldig, formtijd: '65432' }), lukt)), '/bedankt');
});

test('tijdcontrole: abc, -1, leeg en 3000.5 → te-snel', async () => {
  for (const w of ['abc', '-1', '', '3000.5', ' 4000']) {
    const { uit: res } = await metLog(() => verwerkContact(post({ ...geldig, formtijd: w }), lukt));
    assert.equal(doel(res), NA_TE_SNEL, `formtijd "${w}"`);
  }
});

test('tijdcontrole: formtijd en het Turnstile-token komen nooit in de mail', async () => {
  let verstuurd = null;
  await verwerkContact(post({ ...geldig, formtijd: '5000', 'cf-turnstile-response': TOKEN }), async (v) => { verstuurd = v; });
  const tekst = JSON.stringify(verstuurd);
  assert.ok(!tekst.includes('5000') && !tekst.includes(TOKEN) && !tekst.includes('formtijd'), tekst);
});

test('Turnstile uit (geen functie meegegeven): controle overgeslagen, ook zonder token', async () => {
  const res = await verwerkContact(postIp(geldig), lukt, { limiet: door, turnstile: null });
  assert.equal(doel(res), '/bedankt');
});

test('Turnstile aan met goedgekeurd token → verstuurd; het IP gaat mee', async () => {
  const ts = nepTurnstile(true);
  let verstuurd = false;
  const res = await verwerkContact(postIp({ ...geldig, 'cf-turnstile-response': TOKEN }), async () => { verstuurd = true; }, { limiet: door, turnstile: ts });
  assert.equal(doel(res), '/bedankt');
  assert.equal(verstuurd, true);
  assert.deepEqual(ts.aanroepen, [[TOKEN, IP]]);
});

test('Turnstile aan: zonder token, afgekeurd token of een fout van siteverify → controle, niets verstuurd', async () => {
  for (const [naam, velden, ts] of [
    ['zonder token', geldig, nepTurnstile(true)],
    ['leeg token', { ...geldig, 'cf-turnstile-response': '' }, nepTurnstile(true)],
    ['afgekeurd', { ...geldig, 'cf-turnstile-response': TOKEN }, nepTurnstile(false)],
    ['time-out', { ...geldig, 'cf-turnstile-response': TOKEN }, nepTurnstile(new Error('The operation was aborted due to timeout'))],
  ]) {
    let verstuurd = false;
    const { uit: res, regels } = await metLog(() => verwerkContact(postIp(velden), async () => { verstuurd = true; }, { limiet: door, turnstile: ts }));
    assert.equal(doel(res), NA_CONTROLE, naam);
    assert.equal(verstuurd, false, naam);
    assert.deepEqual(regels, ['Formulier geweigerd: controle'], naam);
    geenSporen(regels);
    if (naam.includes('token') && naam !== 'afgekeurd') assert.equal(ts.aanroepen.length, 0, `${naam}: siteverify niet aangeroepen`);
  }
});

test('siteverify: POST met secret, response en remoteip; success true/false; time-out, netwerkfout en 500 gooien', async () => {
  let gezien = null;
  const haal = async (url, init) => { gezien = { url, init, body: Object.fromEntries(init.body) }; return new Response(JSON.stringify({ success: true }), { status: 200 }); };
  assert.equal(await maakSiteverify('geheim-voor-de-test', haal)(TOKEN, IP), true);
  assert.equal(gezien.url, SITEVERIFY);
  assert.equal(gezien.url, 'https://challenges.cloudflare.com/turnstile/v0/siteverify');
  assert.equal(gezien.init.method, 'POST');
  assert.deepEqual(gezien.body, { secret: 'geheim-voor-de-test', response: TOKEN, remoteip: IP });
  assert.ok(gezien.init.signal instanceof AbortSignal, 'met een time-out');
  assert.equal(await maakSiteverify('s', async () => new Response('{"success":false,"error-codes":["invalid-input-response"]}'))(TOKEN, IP), false);
  await assert.rejects(maakSiteverify('s', async () => new Response('kapot', { status: 500 }))(TOKEN, IP));
  await assert.rejects(maakSiteverify('s', async () => { throw new TypeError('fetch failed'); })(TOKEN, IP));
  // echte time-out: siteverify antwoordt niet binnen de tijd
  // (AbortSignal.timeout houdt Node niet wakker; de nep houdt daarom zelf een timer van 1 s aan)
  const traag = (url, init) => new Promise((klaar, mis) => {
    const wakker = setTimeout(() => klaar(new Response('{"success":true}')), 1000);
    init.signal.addEventListener('abort', () => { clearTimeout(wakker); mis(init.signal.reason); });
  });
  await assert.rejects(maakSiteverify('s', traag, 20)(TOKEN, IP));
});

test('siteverify-fout via verwerkContact → controle (fail closed), logboek zonder token of IP', async () => {
  const ts = maakSiteverify('s', async () => { throw new TypeError('fetch failed'); });
  const { uit: res, regels } = await metLog(() => verwerkContact(postIp({ ...geldig, 'cf-turnstile-response': TOKEN }), lukt, { limiet: door, turnstile: ts }));
  assert.equal(doel(res), NA_CONTROLE);
  assert.deepEqual(regels, ['Formulier geweigerd: controle']);
});

test('rate limit: success false → te-veel, vóór het lezen van de body; de sleutel is het IP', async () => {
  let gelezen = false, sleutel = null;
  const req = postIp(geldig);
  const origineel = req.formData.bind(req);
  req.formData = async () => { gelezen = true; return origineel(); };
  const { uit: res, regels } = await metLog(() => verwerkContact(req, lukt, { limiet: async (k) => { sleutel = k; return false; } }));
  assert.equal(res.status, 303);
  assert.equal(doel(res), NA_TE_VEEL);
  assert.equal(doel(res), '/contact?verzonden=fout&reden=te-veel#formulier');
  assert.equal(gelezen, false, 'body niet gelezen');
  assert.equal(sleutel, IP);
  assert.deepEqual(regels, ['Formulier geweigerd: te-veel']);
});

test('rate limit: de zesde verzending binnen 60 s van hetzelfde IP → te-veel (nep-teller zoals de binding)', async () => {
  const tellers = new Map();
  const limiet = async (k) => { const n = (tellers.get(k) || 0) + 1; tellers.set(k, n); return n <= 5; };
  const uitkomsten = [];
  for (let i = 0; i < 6; i++) uitkomsten.push(doel((await metLog(() => verwerkContact(postIp(geldig), lukt, { limiet }))).uit));
  assert.deepEqual(uitkomsten, [...Array(5).fill('/bedankt'), NA_TE_VEEL]);
});

test('rate limit: ontbrekende binding (null) of een limit() die gooit → door, met alleen "Rate limit niet beschikbaar"', async () => {
  for (const limiet of [async () => null, async () => { throw new Error(`platform kapot ${IP}`); }]) {
    let verstuurd = false;
    const { uit: res, regels } = await metLog(() => verwerkContact(postIp(geldig), async () => { verstuurd = true; }, { limiet }));
    assert.equal(doel(res), '/bedankt');
    assert.equal(verstuurd, true);
    assert.deepEqual(regels, ['Rate limit niet beschikbaar']);
    geenSporen(regels);
  }
});

test('volgorde: rate limit vóór te groot verzoek', async () => {
  const groot = new Request(BASIS, { method: 'POST', headers: { 'content-length': String(7 * 1024 * 1024), 'cf-connecting-ip': IP }, body: 'x' });
  const { uit: res } = await metLog(() => verwerkContact(groot, lukt, { limiet: async () => false }));
  assert.equal(doel(res), NA_TE_VEEL);
});

test('volgorde: honeypot → /bedankt zonder Turnstile-aanroep en zonder tijdcontrole', async () => {
  const ts = nepTurnstile(true);
  const res = await verwerkContact(postIp({ ...geldig, website: 'http://spam', formtijd: '10' }), async () => { throw new Error('mag niet'); }, { limiet: door, turnstile: ts });
  assert.equal(doel(res), '/bedankt');
  assert.equal(ts.aanroepen.length, 0);
});

test('volgorde: ongeldige invoer met Turnstile aan → precies NA_FOUT, zonder siteverify (rooktest blijft geldig)', async () => {
  const ts = nepTurnstile(true);
  const { uit: res } = await metLog(() => verwerkContact(postIp({ naam: '', email: '', bericht: '', 'cf-turnstile-response': TOKEN, formtijd: '10' }), lukt, { limiet: door, turnstile: ts }));
  assert.equal(doel(res), NA_FOUT);
  assert.equal(doel(res), '/contact?verzonden=fout#formulier');
  assert.equal(ts.aanroepen.length, 0);
});

test('volgorde: tijdcontrole vóór Turnstile (een te snel bericht verbruikt geen token)', async () => {
  const ts = nepTurnstile(true);
  const { uit: res } = await metLog(() => verwerkContact(postIp({ ...geldig, formtijd: '100', 'cf-turnstile-response': TOKEN }), lukt, { limiet: door, turnstile: ts }));
  assert.equal(doel(res), NA_TE_SNEL);
  assert.equal(ts.aanroepen.length, 0);
});

test('logboek: bij alle drie de weigeringen alleen de vaste regel, nooit IP, token of waarden', async () => {
  const gevallen = [
    [{ limiet: async () => false }, geldig],
    [{ limiet: door }, { ...geldig, formtijd: '1' }],
    [{ limiet: door, turnstile: nepTurnstile(false) }, { ...geldig, 'cf-turnstile-response': TOKEN }],
  ];
  const alle = [];
  for (const [opties, velden] of gevallen) alle.push(...(await metLog(() => verwerkContact(postIp(velden), lukt, opties))).regels);
  assert.deepEqual(alle, ['Formulier geweigerd: te-veel', 'Formulier geweigerd: te-snel', 'Formulier geweigerd: controle']);
  geenSporen(alle);
});
