// Beheer S1: de basis (brief 2026-11-07-beheer-administratie): testmodus nooit in src/ of wrangler.jsonc (R15a),
// migratie 0001 (criterium 7), het beheerscherm zonder main.js en met noindex (O1), kleuren uit style.css (O2),
// robots en sitemap (R10) en geen link naar /beheer op de publieke site.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { stripJsonc } from './wrangler.test.js';
import { maakD1Opslag } from '../src/beheer/opslag.js';

const lees = (p) => readFileSync(new URL('../' + p, import.meta.url), 'utf8');
const bestandenIn = (map) => readdirSync(new URL('../' + map, import.meta.url), { recursive: true }).map(String);

// ---------- R15a: testmodus alleen in scripts/serveer.mjs ----------
const TESTMODUS = /testmodus|test-?rol|nep-?(verificatie|identiteit|opslag)|BEHEER_TEST|voorbeeld\.test|x-test/i;

test('R15a: in src/ staat geen testmodus, nep-verificatie of testgebruiker', () => {
  for (const f of bestandenIn('src').filter((f) => /\.(m?js|json)$/.test(f))) {
    assert.doesNotMatch(lees('src/' + f), TESTMODUS, `src/${f} bevat iets van de testmodus`);
  }
});

test('R15a: wrangler.jsonc (ook previews) heeft geen testmodus-variabele', () => {
  const tekst = stripJsonc(lees('wrangler.jsonc'));
  assert.doesNotMatch(tekst, TESTMODUS);
  const config = JSON.parse(tekst);
  for (const vars of [config.vars, config.previews && config.previews.vars]) {
    for (const naam of Object.keys(vars || {})) assert.doesNotMatch(naam, /test|nep|rol/i, `variabele ${naam}`);
  }
});

test('R14: src/worker.js geeft de echte JWT-controle en D1 mee', () => {
  const w = lees('src/worker.js');
  assert.match(w, /identiteitUitAccess\(r, env\)/);
  assert.match(w, /env\.BEHEER_DB \? maakD1Opslag\(env\.BEHEER_DB\) : null/);
});

test('R14: de testmodus zit in scripts/serveer.mjs en gebruikt dezelfde beheerlogica', () => {
  const s = lees('scripts/serveer.mjs');
  assert.match(s, /from '\.\.\/src\/beheer\/api\.js'/);
  assert.match(s, /x-testrol/);
});

// ---------- Migratie 0001 ----------
let DatabaseSync = null;
try { ({ DatabaseSync } = await import('node:sqlite')); } catch { /* oudere Node */ }

function nieuweDb() {
  const db = new DatabaseSync(':memory:');
  db.exec('PRAGMA foreign_keys = ON;');
  db.exec(lees('migrations/0001_beheer.sql'));
  return db;
}

test('migratie 0001: tabellen en kolommen', { skip: !DatabaseSync && 'node:sqlite niet beschikbaar' }, () => {
  const db = nieuweDb();
  const kolommen = (t) => db.prepare(`PRAGMA table_info(${t})`).all().map((k) => k.name);
  assert.deepEqual(kolommen('boekjaren').slice(0, 4), ['jaar', 'iban', 'beginsaldo_cent', 'afgesloten']);
  for (const k of ['datum', 'omschrijving', 'dagafschrift_nr', 'rekening', 'richting', 'bedrag_cent', 'btw_code', 'aangemaakt_door', 'aangemaakt_op', 'gewijzigd_door', 'gewijzigd_op', 'versie']) {
    assert.ok(kolommen('boekingen').includes(k), `boekingen.${k}`);
  }
  assert.deepEqual(kolommen('verdeling'), ['boeking_id', 'rubriekcode', 'bedrag_cent']);
  const codes = db.prepare('SELECT code FROM rubrieken ORDER BY code').all().map((r) => r.code);
  assert.deepEqual(codes, [510, 1300, 1400, 1500, 4000, 4100, 4200, 4300, 4400, 4500, 4600, 4700, 4800]);
});

test('migratie 0001: regels in de database (centen, codes, bank/kas, jaar)', { skip: !DatabaseSync && 'node:sqlite niet beschikbaar' }, () => {
  const db = nieuweDb();
  db.exec("INSERT INTO boekjaren (jaar, beginsaldo_cent) VALUES (2026, 10000)");
  const boek = db.prepare('INSERT INTO boekingen (jaar, datum, omschrijving, rekening, richting, bedrag_cent, btw_code) VALUES (?, ?, ?, ?, ?, ?, ?)');
  const r = boek.run(2026, '2026-03-31', 'Verzonnen voorbeeld', 'bank', 'ontvangen', 1250, 1);
  db.prepare('INSERT INTO verdeling VALUES (?, 1300, 1250)').run(r.lastInsertRowid);
  const fout = (args, wat) => assert.throws(() => boek.run(...args), undefined, wat);
  fout([2026, '2026-03-31', 'x', 'spaarpot', 'ontvangen', 100, 0], 'rekening alleen bank of kas');
  fout([2026, '2026-03-31', 'x', 'kas', 'geleend', 100, 0], 'richting alleen ontvangen of uitgegeven');
  fout([2026, '2026-03-31', 'x', 'kas', 'ontvangen', 0, 0], 'bedrag > 0');
  fout([2026, '2026-03-31', 'x', 'kas', 'ontvangen', 100, 3], 'btw-code 0, 1 of 2');
  fout([2026, '2025-12-31', 'x', 'kas', 'ontvangen', 100, 0], 'datum binnen het boekjaar');
  fout([2027, '2027-01-01', 'x', 'kas', 'ontvangen', 100, 0], 'boekjaar moet bestaan');
  fout([2026, '31-03-2026', 'x', 'kas', 'ontvangen', 100, 0], 'datum als JJJJ-MM-DD');
  fout([2026, '2026-03-31', 'x'.repeat(201), 'kas', 'ontvangen', 100, 0], 'omschrijving max. 200 tekens');
  assert.throws(() => db.prepare('INSERT INTO verdeling VALUES (?, 9999, 1)').run(r.lastInsertRowid), undefined, 'rubriek moet bestaan');
  assert.throws(() => db.exec('INSERT INTO boekjaren (jaar, afgesloten) VALUES (2025, 2)'), undefined, 'afgesloten 0 of 1');
  db.prepare('DELETE FROM boekingen WHERE id = ?').run(r.lastInsertRowid);
  assert.equal(db.prepare('SELECT count(*) AS n FROM verdeling').get().n, 0, 'verdeling gaat mee bij verwijderen');
});

test('maakD1Opslag: boekjaren (nieuwste eerst) via de D1-vorm prepare().all()', { skip: !DatabaseSync && 'node:sqlite niet beschikbaar' }, async () => {
  const db = nieuweDb();
  db.exec('INSERT INTO boekjaren (jaar, afgesloten) VALUES (2025, 1), (2026, 0)');
  const d1 = { prepare: (sql) => ({ all: async () => ({ results: db.prepare(sql).all() }) }) };
  assert.deepEqual(await maakD1Opslag(d1).boekjaren(), [{ jaar: 2026, afgesloten: false }, { jaar: 2025, afgesloten: true }]);
});

// ---------- Beheerscherm (O1, O2) ----------
test('O1: beheerscherm zonder main.js, style.css, intro, overgang, kleurlaag, balk of collage; met noindex', () => {
  const html = lees('public/beheer/index.html');
  assert.match(html, /<meta name="robots" content="noindex, nofollow">/);
  assert.doesNotMatch(html, /main\.js|assets\/css\/style\.css/);
  assert.doesNotMatch(html, /intro-scherm|class="overgang|class="achtergrond|class="balk|hero|tegel|menu-scherm/);
  assert.doesNotMatch(html, /<script(?![^>]*\bsrc=)[^>]*>/, 'geen inline script (CSP)');
  assert.doesNotMatch(html, /\sstyle=|<style/, 'geen inline stijl (CSP)');
  assert.doesNotMatch(lees('public/beheer/beheer.css'), /scroll-behavior:\s*smooth/);
});

test('O2: beheer.css gebruikt dezelfde kleurwaarden als style.css', () => {
  const vars = (css) => Object.fromEntries([...css.matchAll(/--([a-z-]+):\s*(#[0-9A-Fa-f]{3,6})/g)].map((m) => [m[1], m[2].toUpperCase()]));
  const site = vars(lees('public/assets/css/style.css'));
  const beheer = vars(lees('public/beheer/beheer.css'));
  assert.ok(Object.keys(beheer).length >= 4);
  for (const [naam, waarde] of Object.entries(beheer)) assert.equal(waarde, site[naam], `--${naam}`);
  // geen losse kleurcodes buiten de variabelen
  const zonderRoot = lees('public/beheer/beheer.css').replace(/:root\s*\{[^}]*\}/, '');
  assert.doesNotMatch(zonderRoot, /#[0-9A-Fa-f]{3,6}\b|rgb\(/);
});

// ---------- R10 en publieke site ----------
test('R10: robots.txt sluit /beheer uit; sitemap noemt /beheer niet', () => {
  assert.match(lees('public/robots.txt'), /^Disallow: \/beheer$/m);
  assert.doesNotMatch(lees('public/sitemap.xml'), /beheer/);
});

test('R10: geen link naar /beheer op de publieke site', () => {
  for (const f of readdirSync(new URL('../public/', import.meta.url)).filter((f) => f.endsWith('.html'))) {
    assert.doesNotMatch(lees('public/' + f), /beheer/i, `public/${f}`);
  }
  assert.doesNotMatch(lees('public/assets/js/main.js'), /\/beheer/);
});

test('R9: _headers heeft de beheerheaders als extra laag', () => {
  const h = lees('public/_headers');
  for (const pad of ['/beheer', '/beheer/*', '/api/beheer/*']) {
    const blok = h.split(/\n(?=\S)/).find((b) => b.split('\n')[0].trim() === pad) || '';
    assert.match(blok, /Cache-Control: no-store/, pad);
    assert.match(blok, /X-Robots-Tag: noindex, nofollow/, pad);
    assert.match(blok, /Referrer-Policy: no-referrer/, pad);
    assert.match(blok, /Content-Security-Policy: default-src 'self'; frame-ancestors 'none'; form-action 'self'/, pad);
  }
});

test('R1: geen echte e-mailadressen in de beheerbestanden en tests (alleen voorbeeld.test)', () => {
  const bestanden = [
    ...bestandenIn('src/beheer').map((f) => 'src/beheer/' + f),
    ...bestandenIn('public/beheer').map((f) => 'public/beheer/' + f),
    'tests/beheer-toegang.test.js', 'tests/beheer-worker.test.js', 'tests/hulp/jwt.js', 'scripts/serveer.mjs', 'migrations/0001_beheer.sql',
  ];
  for (const f of bestanden) {
    for (const m of lees(f).matchAll(/[\w.+-]+@[\w-]+(\.[\w-]+)+/g)) {
      assert.match(m[0], /@voorbeeld\.test$/i, `${f}: ${m[0]}`);
    }
  }
});
