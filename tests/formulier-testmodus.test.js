// Formulier (brief 2026-11-11-formulier-foutmelding, bouwen ronde 5): de testmodus van het formulier
// (header x-testmail) staat alleen in scripts/serveer.mjs, nooit in src/ of wrangler.jsonc (zoals beheer R15a),
// en de testserver gebruikt de echte afhandeling uit src/contact.js met echte 303-doorverwijzingen.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { stripJsonc } from './wrangler.test.js';

const lees = (p) => readFileSync(new URL('../' + p, import.meta.url), 'utf8');
const bestandenIn = (map) => readdirSync(new URL('../' + map, import.meta.url), { recursive: true }).map(String);
const TESTMAIL = /x-testmail|testmail/i;

test('testmail: in src/ staat geen testkeuze voor het formulier', () => {
  for (const f of bestandenIn('src').filter((f) => /\.(m?js|json)$/.test(f))) {
    assert.doesNotMatch(lees('src/' + f), TESTMAIL, `src/${f} bevat de testkeuze van het formulier`);
  }
});

test('testmail: wrangler.jsonc (ook previews) heeft geen testkeuze voor het formulier', () => {
  const tekst = stripJsonc(lees('wrangler.jsonc'));
  assert.doesNotMatch(tekst, TESTMAIL);
});

test('testmail: de Worker verstuurt echt (env.MAIL.send) via verwerkContact', () => {
  const w = lees('src/worker.js');
  assert.match(w, /verwerkContact\(request,/);
  assert.match(w, /await env\.MAIL\.send\(/);
});

test('testmail: de testserver gebruikt de echte afhandeling uit src/contact.js', () => {
  const s = lees('scripts/serveer.mjs');
  assert.match(s, /import \{ verwerkContact \} from '\.\.\/src\/contact\.js'/);
  assert.match(s, /x-testmail/);
});

// ---------- de testserver zelf: echte 303-doorverwijzingen ----------
const POORT = 4300 + Math.floor(Math.random() * 500);
let server;
before(async () => {
  server = spawn(process.execPath, [fileURLToPath(new URL('../scripts/serveer.mjs', import.meta.url)), String(POORT)], { stdio: ['ignore', 'pipe', 'pipe'] });
  await new Promise((klaar, mis) => {
    server.stdout.on('data', (d) => { if (String(d).includes('test-server')) klaar(); });
    server.on('exit', (c) => mis(new Error('server gestopt: ' + c)));
  });
});
after(() => server && server.kill());

const GOED = { onderwerp: 'Kraamcadeaubox', naam: 'Test Persoon', email: 'test@voorbeeld.test', bericht: 'Hallo', website: '' };
const post = (velden, kop = {}) => fetch(`http://127.0.0.1:${POORT}/api/contact`, {
  method: 'POST', redirect: 'manual', body: new URLSearchParams(velden), headers: kop,
});
const naar = (res) => new URL(res.headers.get('location')).pathname + new URL(res.headers.get('location')).search;

test('testserver: x-testmail ok → 303 naar /bedankt', async () => {
  const res = await post(GOED, { 'x-testmail': 'ok' });
  assert.equal(res.status, 303);
  assert.equal(naar(res), '/bedankt');
});

test('testserver: zonder header → 303 naar /bedankt (er gaat nooit een mail weg)', async () => {
  const res = await post(GOED);
  assert.equal(res.status, 303);
  assert.equal(naar(res), '/bedankt');
});

test('testserver: x-testmail fout → 303 naar de foutpagina met reden=versturen', async () => {
  const res = await post(GOED, { 'x-testmail': 'fout' });
  assert.equal(res.status, 303);
  assert.equal(naar(res), '/contact?verzonden=fout&reden=versturen');
});

test('testserver: ongeldige invoer → 303 naar de foutpagina zonder reden (echte controle)', async () => {
  const res = await post({ ...GOED, email: 'test@voorbeeld' }, { 'x-testmail': 'fout' });
  assert.equal(res.status, 303);
  assert.equal(naar(res), '/contact?verzonden=fout');
});

// Brief 2026-11-11-c7-stofkeuze: de testmodus kan ook multipart/form-data met de foto van een eigen stof (nooit een mail)
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
const postMultipart = (velden, foto, kop = {}) => {
  const f = new FormData();
  for (const [k, v] of Object.entries(velden)) f.append(k, v);
  if (foto) f.append('stof_foto', foto);
  return fetch(`http://127.0.0.1:${POORT}/api/contact`, { method: 'POST', redirect: 'manual', body: f, headers: kop });
};
const EIGEN = { ...GOED, box_thema: 'Een eigen stof of kleur', stof_link: 'https://stof.test/a' };

test('testserver: multipart met een PNG bij eigen stof → /bedankt; x-testmail fout → reden=versturen', async () => {
  const ok = await postMultipart(EIGEN, new File([PNG], 'stof.png', { type: 'image/png' }), { 'x-testmail': 'ok' });
  assert.equal(ok.status, 303);
  assert.equal(naar(ok), '/bedankt');
  const fout = await postMultipart(EIGEN, new File([PNG], 'stof.png', { type: 'image/png' }), { 'x-testmail': 'fout' });
  assert.equal(naar(fout), '/contact?verzonden=fout&reden=versturen');
});

test('testserver: multipart met een bestand dat geen foto is → reden=foto; link zonder https → reden=link', async () => {
  const pdf = await postMultipart(EIGEN, new File([Buffer.from('%PDF-1.7 verzonnen')], 'stof.jpg', { type: 'image/jpeg' }));
  assert.equal(naar(pdf), '/contact?verzonden=fout&reden=foto');
  const link = await postMultipart({ ...EIGEN, stof_link: 'http://stof.test' });
  assert.equal(naar(link), '/contact?verzonden=fout&reden=link');
});

// ---------- Botbescherming (brief 2026-11-14-formulier-botbescherming, criterium 12) ----------
// De Turnstile-testsleutels en de testheaders staan alleen in scripts/serveer.mjs (en in de tests), nooit in src/, public/ of wrangler.jsonc.
const TESTSLEUTELS = /[123]x0{20}(AA|BB|AB|FF)|[123]x0{31}AA|x-testturnstile|x-testlimiet|XXXX\.DUMMY\.TOKEN/i;

test('botbescherming: testsleutels en testheaders niet in src/', () => {
  for (const f of bestandenIn('src').filter((f) => /\.(m?js|json|sql)$/.test(f))) {
    assert.doesNotMatch(lees('src/' + f), TESTSLEUTELS, `src/${f} bevat een Turnstile-testsleutel of testheader`);
  }
});

test('botbescherming: testsleutels en testheaders niet in public/', () => {
  for (const f of bestandenIn('public').filter((f) => /\.(html|js|css|txt|xml|json)$|^_headers$|^_redirects$/.test(f))) {
    assert.doesNotMatch(lees('public/' + f), TESTSLEUTELS, `public/${f} bevat een Turnstile-testsleutel of testheader`);
  }
});

test('botbescherming: testsleutels en testheaders niet in wrangler.jsonc (ook niet in commentaar)', () => {
  assert.doesNotMatch(lees('wrangler.jsonc'), TESTSLEUTELS);
});

test('botbescherming: de testserver kent de testmodus en geeft nepfuncties mee aan verwerkContact', () => {
  const s = lees('scripts/serveer.mjs');
  assert.match(s, /x-testturnstile/);
  assert.match(s, /x-testlimiet/);
  assert.match(s, /limiet: async/);
  assert.match(s, /turnstile: secret \?/);
});

const postBot = (velden, kop = {}) => post(velden, kop);
test('testserver: x-testlimiet overschreden → reden=te-veel', async () => {
  const res = await postBot(GOED, { 'x-testlimiet': 'overschreden' });
  assert.equal(res.status, 303);
  assert.equal(naar(res), '/contact?verzonden=fout&reden=te-veel');
});

test('testserver: formtijd 500 → reden=te-snel; 3500 → /bedankt', async () => {
  assert.equal(naar(await postBot({ ...GOED, formtijd: '500' })), '/contact?verzonden=fout&reden=te-snel');
  assert.equal(naar(await postBot({ ...GOED, formtijd: '3500' })), '/bedankt');
});

test('testserver: x-testturnstile geslaagd met token → /bedankt; zonder token of mislukt → reden=controle', async () => {
  const token = { 'cf-turnstile-response': 'nep-token' };
  assert.equal(naar(await postBot({ ...GOED, ...token }, { 'x-testturnstile': 'geslaagd' })), '/bedankt');
  assert.equal(naar(await postBot(GOED, { 'x-testturnstile': 'geslaagd' })), '/contact?verzonden=fout&reden=controle');
  assert.equal(naar(await postBot({ ...GOED, ...token }, { 'x-testturnstile': 'mislukt' })), '/contact?verzonden=fout&reden=controle');
  // ongeldige invoer blijft precies de foutpagina zonder reden, ook met Turnstile aan
  assert.equal(naar(await postBot({ ...GOED, email: 'x', ...token }, { 'x-testturnstile': 'mislukt' })), '/contact?verzonden=fout');
});

test('testserver: GET /contact met x-testturnstile zet de testsite key en maakt de <noscript>-regel actief', async () => {
  const gewoon = await (await fetch(`http://127.0.0.1:${POORT}/contact`)).text();
  assert.match(gewoon, /data-sitekey=""/);
  assert.match(gewoon, /<!--TURNSTILE-NOSCRIPT\s*<noscript>/);
  const met = await (await fetch(`http://127.0.0.1:${POORT}/contact`, { headers: { 'x-testturnstile': 'interactie' } })).text();
  assert.match(met, /data-sitekey="3x0{20}FF"/);
  assert.doesNotMatch(met, /<!--TURNSTILE-NOSCRIPT/);
  assert.match(met, /<noscript><p class="noscript-melding">/);
});
