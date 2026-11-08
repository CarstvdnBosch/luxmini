// Test voor wrangler.jsonc: /api/* moet eerst naar de Worker, anders geeft Cloudflare bij een
// echte browserverzending (navigatie-POST) een 405 van de assets-laag (brief 2026-11-07-formulier-405).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// JSON met commentaar (// en /* */) en komma's aan het eind omzetten naar gewone JSON.
// Tekst tussen aanhalingstekens blijft ongemoeid (daar kan bijv. "/api/*" of "https://" in staan).
export function stripJsonc(tekst) {
  let uit = '';
  for (let i = 0; i < tekst.length; i++) {
    const c = tekst[i];
    if (c === '"') {
      let j = i + 1;
      while (j < tekst.length && tekst[j] !== '"') j += tekst[j] === '\\' ? 2 : 1;
      uit += tekst.slice(i, j + 1); i = j; continue;
    }
    if (c === '/' && tekst[i + 1] === '/') { while (i < tekst.length && tekst[i] !== '\n') i++; uit += '\n'; continue; }
    if (c === '/' && tekst[i + 1] === '*') { i = tekst.indexOf('*/', i + 2) + 1; continue; }
    uit += c;
  }
  return uit.replace(/,(\s*[}\]])/g, '$1');
}

const config = JSON.parse(stripJsonc(readFileSync(new URL('../wrangler.jsonc', import.meta.url), 'utf8')));

test('wrangler.jsonc is geldige JSONC met Worker en assets', () => {
  assert.equal(config.main, 'src/worker.js');
  assert.equal(config.assets.directory, './public');
});

test('assets.run_worker_first bevat /api/* (formulier bereikt de Worker, geen 405)', () => {
  const rwf = config.assets.run_worker_first;
  assert.ok(Array.isArray(rwf), 'run_worker_first moet een lijst met paden zijn');
  assert.ok(rwf.includes('/api/*'), 'run_worker_first moet "/api/*" bevatten');
});

test('alleen /api/* en beheer gaan eerst naar de Worker (de rest blijft statisch)', () => {
  // brief 2026-11-07-beheer-administratie, S1 criterium 6: /beheer en /beheer/* langs de inlogcontrole
  assert.deepEqual([...config.assets.run_worker_first].sort(), ['/api/*', '/beheer', '/beheer/*']);
});

test('beheer: Access-waarden als vars (geen geheimen), ook in previews; rollen nooit in de config', () => {
  for (const vars of [config.vars, config.previews.vars]) {
    assert.equal(typeof vars.BEHEER_ACCESS_TEAM, 'string');
    assert.equal(typeof vars.BEHEER_ACCESS_AUD, 'string');
    assert.equal(vars.BEHEER_ROLLEN, undefined, 'BEHEER_ROLLEN is een secret, niet in wrangler.jsonc');
    if (vars.BEHEER_ACCESS_TEAM) assert.match(vars.BEHEER_ACCESS_TEAM, /^[a-z0-9-]+\.cloudflareaccess\.com$/);
  }
});

test('beheer: D1-binding BEHEER_DB alleen met een echte database_id; previews nooit de echte database (R11)', () => {
  const d1 = (config.d1_databases || []).find((d) => d.binding === 'BEHEER_DB');
  if (d1) {
    assert.match(d1.database_id, /^[0-9a-f-]{32,36}$/, 'database_id ingevuld (geen plaatshouder)');
    assert.equal(d1.migrations_dir, 'migrations');
  }
  const preview = ((config.previews && config.previews.d1_databases) || []).find((d) => d.binding === 'BEHEER_DB');
  if (preview && d1) assert.notEqual(preview.database_id, d1.database_id, 'previews gebruiken niet de echte database');
});

test('previews overschrijven assets niet zonder run_worker_first', () => {
  const p = config.previews && config.previews.assets;
  if (p) assert.ok((p.run_worker_first || []).includes('/api/*'));
});

test('stripJsonc laat tekst tussen aanhalingstekens heel', () => {
  assert.deepEqual(JSON.parse(stripJsonc('{"a": "/api/*", // x\n "b": "http://y", /* z */ }')), { a: '/api/*', b: 'http://y' });
});
