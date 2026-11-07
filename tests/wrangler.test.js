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

test('alleen /api/* gaat eerst naar de Worker (de rest blijft statisch)', () => {
  assert.ok(config.assets.run_worker_first.every((p) => p.startsWith('/api/')));
});

test('previews overschrijven assets niet zonder run_worker_first', () => {
  const p = config.previews && config.previews.assets;
  if (p) assert.ok((p.run_worker_first || []).includes('/api/*'));
});

test('stripJsonc laat tekst tussen aanhalingstekens heel', () => {
  assert.deepEqual(JSON.parse(stripJsonc('{"a": "/api/*", // x\n "b": "http://y", /* z */ }')), { a: '/api/*', b: 'http://y' });
});
