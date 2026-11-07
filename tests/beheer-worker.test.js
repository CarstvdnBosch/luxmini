// Beheer S1: de echte Worker uit src/worker.js (brief 2026-11-07-beheer-administratie, R5–R9, R15b).
// cloudflare:email bestaat alleen op Cloudflare; hier vervangen door een lege klasse (alleen in deze test).
import { test, beforeEach, after } from 'node:test';
import assert from 'node:assert/strict';
import { register } from 'node:module';
import { TEAM, AUD, ROLLEN, maakSleutel, maakJwt, nepCerts } from './hulp/jwt.js';

register('data:text/javascript,' + encodeURIComponent(
  "export async function resolve(s, c, n) { return s === 'cloudflare:email' ? { url: 'data:text/javascript,export class EmailMessage {}', shortCircuit: true } : n(s, c); }"));
const { default: worker } = await import('../src/worker.js');
const { leegSleutelCache } = await import('../src/beheer/toegang.js');

const sleutel = await maakSleutel('sleutel-1');
const vreemd = await maakSleutel('sleutel-1'); // zelfde kid, andere sleutel
const nu = () => Math.floor(Date.now() / 1000);
const echteFetch = globalThis.fetch;
const certs = nepCerts(sleutel);
globalThis.fetch = certs;
after(() => { globalThis.fetch = echteFetch; });
beforeEach(() => leegSleutelCache());

const BASIS = 'https://luxmini.nl';
let assetsAangeroepen = 0;
const assets = { fetch: async (r) => { assetsAangeroepen++; return new Response('<!doctype html><title>beheer</title>', { status: 200, headers: { 'Content-Type': 'text/html' } }); } };
const env = (extra = {}) => ({ ASSETS: assets, BEHEER_ACCESS_TEAM: TEAM, BEHEER_ACCESS_AUD: AUD, BEHEER_ROLLEN: ROLLEN, ...extra });
const vraag = (pad, { token, method = 'GET', origin, omgeving = env() } = {}) => {
  const headers = {};
  if (token) headers['Cf-Access-Jwt-Assertion'] = token;
  if (origin) headers.Origin = origin;
  return worker.fetch(new Request(BASIS + pad, { method, headers }), omgeving);
};

const PADEN = ['/beheer', '/beheer/', '/beheer/index.html', '/beheer/beheer.js', '/beheer/beheer.css', '/api/beheer/ik', '/api/beheer/boekingen', '/BEHEER', '/Api/Beheer/ik'];

function controleerHeaders(res, wat) {
  const h = res.headers;
  assert.equal(h.get('cache-control'), 'no-store', `${wat}: Cache-Control`);
  assert.equal(h.get('x-robots-tag'), 'noindex, nofollow', `${wat}: X-Robots-Tag`);
  assert.equal(h.get('referrer-policy'), 'no-referrer', `${wat}: Referrer-Policy`);
  const csp = h.get('content-security-policy') || '';
  for (const deel of ["default-src 'self'", "frame-ancestors 'none'", "form-action 'self'"]) assert.ok(csp.includes(deel), `${wat}: CSP mist ${deel}`);
  assert.ok(!/unsafe-inline/.test(csp), `${wat}: CSP zonder unsafe-inline`);
}

async function geenToegang(res, wat) {
  assert.equal(res.status, 403, `${wat}: verwacht 403, kreeg ${res.status}`);
  controleerHeaders(res, wat);
  const tekst = await res.text();
  assert.ok(!tekst.includes('@') && !/boekjaar|rol/i.test(tekst), `${wat}: geen gegevens in het antwoord`);
}

test('zonder JWT: 403 op alle beheerpaden, en de bestanden worden niet opgehaald', async () => {
  assetsAangeroepen = 0;
  for (const p of PADEN) await geenToegang(await vraag(p), `${p} zonder JWT`);
  assert.equal(assetsAangeroepen, 0);
});

test('ongeldige JWT: 403', async () => {
  const goed = await maakJwt(sleutel);
  const [h, p] = goed.split('.');
  for (const token of ['onzin', `${h}.${p}.`, `${h}.${p}.AAAA`, await maakJwt(vreemd)]) {
    for (const pad of PADEN) await geenToegang(await vraag(pad, { token }), `${pad} ongeldige JWT`);
  }
});

test('verkeerde aud: 403', async () => {
  const token = await maakJwt(sleutel, { aud: ['een-andere-applicatie'] });
  for (const p of PADEN) await geenToegang(await vraag(p, { token }), `${p} verkeerde aud`);
});

test('verlopen JWT: 403', async () => {
  const token = await maakJwt(sleutel, { iat: nu() - 7200, exp: nu() - 60 });
  for (const p of PADEN) await geenToegang(await vraag(p, { token }), `${p} verlopen`);
});

test('verkeerd team (iss): 403', async () => {
  const token = await maakJwt(sleutel, { iss: 'https://ander-team.cloudflareaccess.com' });
  for (const p of PADEN) await geenToegang(await vraag(p, { token }), `${p} verkeerde iss`);
});

test('geldige JWT, maar adres niet in BEHEER_ROLLEN (of geen secret): 403', async () => {
  const token = await maakJwt(sleutel, { email: 'onbekend@voorbeeld.test' });
  await geenToegang(await vraag('/api/beheer/ik', { token }), 'onbekend adres');
  const w = console.warn; console.warn = () => {};
  try {
    await geenToegang(await vraag('/api/beheer/ik', { token: await maakJwt(sleutel), omgeving: env({ BEHEER_ROLLEN: undefined }) }), 'geen secret');
  } finally { console.warn = w; }
});

test('team of AUD nog leeg (zoals nu in wrangler.jsonc): altijd 403, ook met een verder geldige JWT', async () => {
  const token = await maakJwt(sleutel);
  for (const extra of [{ BEHEER_ACCESS_TEAM: '' }, { BEHEER_ACCESS_AUD: '' }, { BEHEER_ACCESS_TEAM: undefined, BEHEER_ACCESS_AUD: undefined }]) {
    for (const p of PADEN) await geenToegang(await vraag(p, { token, omgeving: env(extra) }), `${p} ${JSON.stringify(extra)}`);
  }
});

test('GET /api/beheer/ik geeft rol en e-mail', async () => {
  let res = await vraag('/api/beheer/ik', { token: await maakJwt(sleutel) });
  assert.equal(res.status, 200);
  controleerHeaders(res, '/api/beheer/ik');
  assert.deepEqual(await res.json(), { rol: 'schrijven', email: 'schrijver@voorbeeld.test' });
  res = await vraag('/api/beheer/ik', { token: await maakJwt(sleutel, { email: 'meekijker@voorbeeld.test' }) });
  assert.deepEqual(await res.json(), { rol: 'lezen', email: 'meekijker@voorbeeld.test' });
});

test('/api/beheer/ik werkt zonder BEHEER_DB; routes met opslag geven 503 "Opslag nog niet ingesteld"', async () => {
  const token = await maakJwt(sleutel);
  assert.equal((await vraag('/api/beheer/ik', { token })).status, 200);
  const res = await vraag('/api/beheer/boekjaren', { token });
  assert.equal(res.status, 503);
  controleerHeaders(res, '503');
  assert.equal((await res.json()).fout, 'Opslag nog niet ingesteld');
});

test('met BEHEER_DB: boekjaren uit D1', async () => {
  const db = { prepare: () => ({ all: async () => ({ results: [{ jaar: 2026, afgesloten: 0 }] }) }) };
  const res = await vraag('/api/beheer/boekjaren', { token: await maakJwt(sleutel), omgeving: env({ BEHEER_DB: db }) });
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { boekjaren: [{ jaar: 2026, afgesloten: false }] });
});

test('beheerschermen: met geldige JWT uit de assets, met de headers van R9', async () => {
  const token = await maakJwt(sleutel);
  for (const p of ['/beheer', '/beheer/beheer.css', '/beheer/beheer.js']) {
    const res = await vraag(p, { token });
    assert.equal(res.status, 200, p);
    controleerHeaders(res, p);
  }
});

test('schrijfactie met rol lezen: 403 (ook met eigen Origin)', async () => {
  const token = await maakJwt(sleutel, { email: 'meekijker@voorbeeld.test' });
  for (const method of ['POST', 'PUT', 'PATCH', 'DELETE']) {
    await geenToegang(await vraag('/api/beheer/boekingen', { token, method, origin: BASIS }), `${method} lezen`);
  }
});

test('schrijfactie zonder of met vreemde Origin: 403 (ook met rol schrijven)', async () => {
  const token = await maakJwt(sleutel);
  for (const origin of [undefined, 'https://evil.example', 'https://www.luxmini.nl', 'null']) {
    await geenToegang(await vraag('/api/beheer/boekingen', { token, method: 'POST', origin }), `POST Origin ${origin}`);
  }
});

test('schrijfactie met rol schrijven en eigen Origin komt door de controle (route volgt in S2)', async () => {
  const res = await vraag('/api/beheer/boekingen', { token: await maakJwt(sleutel), method: 'POST', origin: BASIS });
  assert.notEqual(res.status, 403);
  controleerHeaders(res, 'POST schrijven');
});

test('het contactformulier en de publieke site werken nog zoals voorheen', async () => {
  const res = await worker.fetch(new Request(BASIS + '/api/contact'), env());
  assert.equal(res.status, 303);
  assetsAangeroepen = 0;
  const thuis = await worker.fetch(new Request(BASIS + '/werkwijze'), env());
  assert.equal(thuis.status, 200);
  assert.equal(assetsAangeroepen, 1);
  assert.equal(thuis.headers.get('x-robots-tag'), null);
});

test('logs bevatten geen e-mailadressen of tokens', async () => {
  const regels = [];
  const oud = { log: console.log, warn: console.warn, error: console.error, info: console.info };
  for (const k of Object.keys(oud)) console[k] = (...a) => regels.push(a.map(String).join(' '));
  try {
    const token = await maakJwt(sleutel, { email: 'onbekend@voorbeeld.test' });
    await vraag('/api/beheer/ik', { token });
    await vraag('/api/beheer/ik', { token: await maakJwt(sleutel), omgeving: env({ BEHEER_ROLLEN: '{kapot' }) });
    const kapotteDb = { prepare: () => ({ all: async () => { throw new Error('schrijver@voorbeeld.test 12,50'); } }) };
    const res = await vraag('/api/beheer/boekjaren', { token: await maakJwt(sleutel), omgeving: env({ BEHEER_DB: kapotteDb }) });
    assert.equal(res.status, 500);
  } finally { Object.assign(console, oud); }
  for (const r of regels) {
    assert.ok(!r.includes('@'), `log met e-mailadres: ${r}`);
    assert.ok(!r.includes('12,50') && !r.includes('eyJ'), `log met gegevens: ${r}`);
  }
});
