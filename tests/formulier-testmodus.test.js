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
