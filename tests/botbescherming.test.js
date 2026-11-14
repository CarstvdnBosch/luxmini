// Brief 2026-11-14-formulier-botbescherming (criteria 11, 12, 13 en 19): bewaking van de Turnstile-site key, het secret en de CSP.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { stripJsonc } from './wrangler.test.js';

const lees = (p) => readFileSync(new URL('../' + p, import.meta.url), 'utf8');
const config = JSON.parse(stripJsonc(lees('wrangler.jsonc')));
const contact = lees('public/contact.html');

test('site key: data-sitekey in contact.html is gelijk aan TURNSTILE_SITEKEY in wrangler.jsonc', () => {
  const m = contact.match(/class="turnstile-vak" data-sitekey="([^"]*)"/g);
  assert.equal(m && m.length, 1, 'precies één Turnstile-vak in contact.html');
  const sleutel = /data-sitekey="([^"]*)"/.exec(m[0])[1];
  assert.equal(sleutel, config.vars.TURNSTILE_SITEKEY);
  // previews: gelijk, of leeg (Turnstile uit op previews zolang de preview-host niet in de widget staat)
  assert.ok(['', sleutel].includes(config.previews.vars.TURNSTILE_SITEKEY), 'previews: leeg of dezelfde site key');
  if (sleutel) assert.match(sleutel, /^0x[0-9A-Za-z_-]{10,40}$/, 'een echte site key van Cloudflare');
});

test('site key gevuld ⇔ <noscript>-regel actief (markeringen weg), zoals scripts/controleer.py', () => {
  const sleutel = /class="turnstile-vak" data-sitekey="([^"]*)"/.exec(contact)[1];
  const zonderCommentaar = contact.replace(/<!--[\s\S]*?-->/g, '');
  const actief = /<noscript><p class="noscript-melding">/.test(zonderCommentaar);
  assert.equal(actief, !!sleutel, sleutel ? 'site key ingevuld: haal de TURNSTILE-NOSCRIPT-markeringen weg' : 'geen site key: de <noscript>-regel hoort in commentaar');
  if (!sleutel) assert.match(contact, /<!--TURNSTILE-NOSCRIPT\s*<noscript><p class="noscript-melding">[\s\S]*?<\/noscript>\s*TURNSTILE-NOSCRIPT-->/);
});

// Een secret van Turnstile is langer dan een site key (site key ca. 24 tekens, secret ca. 35). Nergens in de repo.
function bestanden(map, uit = []) {
  for (const naam of readdirSync(new URL('../' + map, import.meta.url))) {
    if (['node_modules', '.git', 'rapport', 'test-results', '.lighthouseci', '.wrangler'].includes(naam)) continue;
    const pad = map ? `${map}/${naam}` : naam;
    const st = statSync(new URL('../' + pad, import.meta.url));
    if (st.isDirectory()) bestanden(pad, uit);
    else if (/\.(m?js|cjs|json|jsonc|html|md|yml|yaml|toml|txt|sh|py|css)$|^_headers$|^\.dev\.vars/.test(naam) && st.size < 2_000_000) uit.push(pad);
  }
  return uit;
}
test('geen echt Turnstile-secret in de repo', () => {
  for (const f of bestanden('')) {
    const t = lees(f);
    assert.doesNotMatch(t, /0x4[0-9A-Za-z_-]{31,}/, `${f}: lijkt een echt Turnstile-secret`);
    assert.doesNotMatch(t, /TURNSTILE_SECRET["']?\s*[:=]\s*["'][^"'\s]{8,}/, `${f}: TURNSTILE_SECRET met een waarde`);
  }
});

// CSP (criterium 19): er is nu geen CSP voor de publieke pagina's. Komt die er (voor /* of /contact), dan moet Turnstile erdoor.
test('CSP voor /* of /contact laat challenges.cloudflare.com toe in script-src en frame-src', () => {
  const blokken = [];
  for (const regel of lees('public/_headers').split('\n')) {
    if (!regel.trim() || regel.trim().startsWith('#')) continue;
    if (!/^\s/.test(regel)) blokken.push({ pad: regel.trim(), headers: {} });
    else if (blokken.length) { const i = regel.indexOf(':'); blokken.at(-1).headers[regel.slice(0, i).trim().toLowerCase()] = regel.slice(i + 1).trim(); }
  }
  for (const b of blokken.filter((b) => ['/*', '/contact', '/contact.html', '/contact*'].includes(b.pad))) {
    const csp = b.headers['content-security-policy'];
    if (!csp) continue;
    const richtlijn = (naam) => (csp.split(';').map((d) => d.trim()).find((d) => d.startsWith(naam + ' ')) || '');
    const script = richtlijn('script-src') || richtlijn('default-src');
    const frame = richtlijn('frame-src') || richtlijn('child-src') || richtlijn('default-src');
    assert.match(script, /https:\/\/challenges\.cloudflare\.com/, `${b.pad}: script-src zonder Turnstile`);
    assert.match(frame, /https:\/\/challenges\.cloudflare\.com/, `${b.pad}: frame-src zonder Turnstile`);
  }
});
