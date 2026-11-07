// Beheer S1: JWT van Cloudflare Access, rollen en Origin (brief 2026-11-07-beheer-administratie, R5–R8).
// Met een zelf gemaakt sleutelpaar; geen netwerk.
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { controleerJwt, rolVoor, eigenOrigin, identiteitUitAccess, teamDomein, leegSleutelCache } from '../src/beheer/toegang.js';
import { TEAM, AUD, ROLLEN, maakSleutel, maakJwt, nepCerts } from './hulp/jwt.js';

const sleutel = await maakSleutel('sleutel-1');
const ander = await maakSleutel('sleutel-2');
const nu = () => Math.floor(Date.now() / 1000);
const opties = (fetchImpl) => ({ team: TEAM, aud: AUD, fetchImpl });

beforeEach(() => leegSleutelCache());

test('geldig JWT: claims terug', async () => {
  const claims = await controleerJwt(await maakJwt(sleutel), opties(nepCerts(sleutel)));
  assert.equal(claims.email, 'schrijver@voorbeeld.test');
});

test('aud als losse tekst (geen lijst) mag ook', async () => {
  assert.ok(await controleerJwt(await maakJwt(sleutel, { aud: AUD }), opties(nepCerts(sleutel))));
});

test('team-domein met https:// en schuine streep werkt ook', async () => {
  assert.equal(teamDomein(`https://${TEAM}/`), TEAM);
  assert.ok(await controleerJwt(await maakJwt(sleutel), { ...opties(nepCerts(sleutel)), team: `https://${TEAM}/` }));
});

test('verkeerde handtekening (andere sleutel met dezelfde kid) wordt geweigerd', async () => {
  const nep = { ...ander, kid: 'sleutel-1' };
  assert.equal(await controleerJwt(await maakJwt(nep), opties(nepCerts(sleutel))), null);
});

test('aangepaste inhoud na ondertekenen wordt geweigerd', async () => {
  const [h, , s] = (await maakJwt(sleutel)).split('.');
  const p = Buffer.from(JSON.stringify({ aud: [AUD], iss: `https://${TEAM}`, email: 'indringer@voorbeeld.test', exp: nu() + 3600 })).toString('base64url');
  assert.equal(await controleerJwt(`${h}.${p}.${s}`, opties(nepCerts(sleutel))), null);
});

test('verkeerde aud wordt geweigerd', async () => {
  assert.equal(await controleerJwt(await maakJwt(sleutel, { aud: ['andere-aud'] }), opties(nepCerts(sleutel))), null);
});

test('verkeerde iss wordt geweigerd', async () => {
  assert.equal(await controleerJwt(await maakJwt(sleutel, { iss: 'https://ander-team.cloudflareaccess.com' }), opties(nepCerts(sleutel))), null);
});

test('verlopen JWT wordt geweigerd (ook precies op exp)', async () => {
  assert.equal(await controleerJwt(await maakJwt(sleutel, { exp: nu() - 1 }), opties(nepCerts(sleutel))), null);
  assert.equal(await controleerJwt(await maakJwt(sleutel, { exp: undefined }), opties(nepCerts(sleutel))), null);
});

test('nog niet geldig (nbf in de toekomst) wordt geweigerd', async () => {
  assert.equal(await controleerJwt(await maakJwt(sleutel, { nbf: nu() + 600 }), opties(nepCerts(sleutel))), null);
});

test('alleen RS256: alg none of HS256 wordt geweigerd', async () => {
  const [, p, s] = (await maakJwt(sleutel)).split('.');
  for (const alg of ['none', 'HS256', 'RS512']) {
    const h = Buffer.from(JSON.stringify({ alg, kid: 'sleutel-1' })).toString('base64url');
    assert.equal(await controleerJwt(`${h}.${p}.${s}`, opties(nepCerts(sleutel))), null, alg);
    assert.equal(await controleerJwt(`${h}.${p}.`, opties(nepCerts(sleutel))), null, alg + ' zonder handtekening');
  }
});

test('onzin, lege of half token wordt geweigerd', async () => {
  for (const t of ['', 'abc', 'a.b', 'a.b.c', '!!.??.**', undefined]) {
    assert.equal(await controleerJwt(t, opties(nepCerts(sleutel))), null, String(t));
  }
});

test('zonder team-domein of AUD (nog niet ingesteld) is er nooit toegang en wordt niets opgehaald', async () => {
  const f = nepCerts(sleutel);
  const token = await maakJwt(sleutel);
  assert.equal(await controleerJwt(token, { team: '', aud: AUD, fetchImpl: f }), null);
  assert.equal(await controleerJwt(token, { team: TEAM, aud: '', fetchImpl: f }), null);
  assert.equal(f.aantal, 0);
});

test('sleutels worden bewaard (cache); een nieuwe kid haalt ze één keer opnieuw op', async () => {
  const f = nepCerts(sleutel);
  await controleerJwt(await maakJwt(sleutel), opties(f));
  await controleerJwt(await maakJwt(sleutel), opties(f));
  assert.equal(f.aantal, 1);
  // onbekende kid binnen een minuut: niet opnieuw ophalen (geen storm van verzoeken)
  assert.equal(await controleerJwt(await maakJwt(ander), opties(f)), null);
  assert.equal(f.aantal, 1);
  // na een minuut wel, en dan klopt de nieuwe sleutel (sleutelwissel bij Cloudflare)
  const f2 = nepCerts(sleutel, ander);
  f2.aantal = 0;
  const later = Date.now() + 61_000;
  const token = await maakJwt(ander, { exp: nu() + 7200 });
  assert.ok(await controleerJwt(token, { ...opties(f2), nu: later }));
  assert.equal(f2.aantal, 1);
});

test('verlopen cache en ophalen mislukt: hooguit eens per minuut opnieuw proberen', async () => {
  const f = nepCerts(sleutel);
  const start = Date.now();
  const token = await maakJwt(sleutel, { exp: nu() + 3 * 3600 });
  assert.ok(await controleerJwt(token, { ...opties(f), nu: start }));
  // na het uur: Access onbereikbaar
  let pogingen = 0;
  const kapot = async () => { pogingen++; throw new Error('netwerk'); };
  const w = console.warn; console.warn = () => {};
  try {
    const na = start + 60 * 60 * 1000 + 1000;
    await controleerJwt(token, { ...opties(kapot), nu: na });
    assert.equal(pogingen, 1);
    // binnen een minuut: niet opnieuw ophalen
    await controleerJwt(token, { ...opties(kapot), nu: na + 1000 });
    await controleerJwt(token, { ...opties(kapot), nu: na + 59_000 });
    assert.equal(pogingen, 1);
    // na een minuut wel weer één poging
    await controleerJwt(token, { ...opties(kapot), nu: na + 61_000 });
    assert.equal(pogingen, 2);
  } finally { console.warn = w; }
  // en zodra Access weer werkt, worden de sleutels opnieuw opgehaald
  const f2 = nepCerts(sleutel);
  assert.ok(await controleerJwt(token, { ...opties(f2), nu: start + 60 * 60 * 1000 + 123_000 }));
  assert.equal(f2.aantal, 1);
});

test('certs niet bereikbaar: geen toegang (en geen gegevens in de log)', async () => {
  const log = []; const w = console.warn; console.warn = (...a) => log.push(a.join(' '));
  try {
    const kapot = async () => { throw new Error('netwerk'); };
    assert.equal(await controleerJwt(await maakJwt(sleutel), opties(kapot)), null);
  } finally { console.warn = w; }
  assert.ok(log.every((r) => !r.includes('@')));
});

test('rolVoor: schrijven en lezen, zonder hoofdlettergevoeligheid', () => {
  assert.equal(rolVoor('schrijver@voorbeeld.test', ROLLEN), 'schrijven');
  assert.equal(rolVoor('MEEKIJKER@voorbeeld.TEST', ROLLEN), 'lezen');
  assert.equal(rolVoor('  meekijker@voorbeeld.test ', ROLLEN), 'lezen');
});

test('rolVoor: onbekend adres, lege of kapotte lijst geeft null', () => {
  const w = console.warn; console.warn = () => {};
  try {
    assert.equal(rolVoor('onbekend@voorbeeld.test', ROLLEN), null);
    assert.equal(rolVoor('schrijver@voorbeeld.test', undefined), null);
    assert.equal(rolVoor('schrijver@voorbeeld.test', '{kapot'), null);
    assert.equal(rolVoor('schrijver@voorbeeld.test', '[]'), null);
    assert.equal(rolVoor('', ROLLEN), null);
  } finally { console.warn = w; }
});

test('rolVoor: in beide lijsten geldt de kleinste rol (lezen)', () => {
  assert.equal(rolVoor('a@voorbeeld.test', JSON.stringify({ schrijven: ['a@voorbeeld.test'], lezen: ['A@voorbeeld.test'] })), 'lezen');
});

test('identiteitUitAccess: header + JWT + rol', async () => {
  const env = { BEHEER_ACCESS_TEAM: TEAM, BEHEER_ACCESS_AUD: AUD, BEHEER_ROLLEN: ROLLEN };
  const verzoek = async (token) => new Request('https://luxmini.nl/beheer', token ? { headers: { 'Cf-Access-Jwt-Assertion': token } } : {});
  assert.deepEqual(await identiteitUitAccess(await verzoek(await maakJwt(sleutel)), env, nepCerts(sleutel)), { email: 'schrijver@voorbeeld.test', rol: 'schrijven' });
  assert.equal(await identiteitUitAccess(await verzoek(null), env, nepCerts(sleutel)), null);
  assert.equal(await identiteitUitAccess(await verzoek(await maakJwt(sleutel, { email: 'onbekend@voorbeeld.test' })), env, nepCerts(sleutel)), null);
  assert.equal(await identiteitUitAccess(await verzoek(await maakJwt(sleutel, { email: undefined })), env, nepCerts(sleutel)), null);
});

test('eigenOrigin: alleen precies de eigen origin', () => {
  const r = (origin, url = 'https://luxmini.nl/api/beheer/x') => new Request(url, { method: 'POST', headers: origin ? { Origin: origin } : {} });
  assert.equal(eigenOrigin(r('https://luxmini.nl')), true);
  assert.equal(eigenOrigin(r(null)), false);
  assert.equal(eigenOrigin(r('null')), false);
  assert.equal(eigenOrigin(r('https://www.luxmini.nl')), false);
  assert.equal(eigenOrigin(r('http://luxmini.nl')), false);
  assert.equal(eigenOrigin(r('https://luxmini.nl.evil.example')), false);
});
