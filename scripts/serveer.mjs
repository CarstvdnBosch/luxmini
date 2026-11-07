// Kleine statische server voor de tests: serveert public/ zoals Cloudflare dat doet
// (schone adressen: /werkwijze → werkwijze.html, 404.html bij onbekende paden,
// _redirects voor oude adressen (bijv. /producten → 301 /werkwijze), de headers uit _headers en compressie (brotli/gzip) zoals Cloudflare).
// Gebruik: node scripts/serveer.mjs [poort]   (standaard 4173)
//
// TESTMODUS BEHEER (alleen hier, nooit in src/ of op Cloudflare; brief 2026-11-07-beheer-administratie, R14):
// /beheer* en /api/beheer/* gaan door dezelfde beheerlogica als op Cloudflare (src/beheer/api.js),
// maar met een nep-verificatie met vaste rol en een opslag in het geheugen met verzonnen gegevens.
//   rol per verzoek:      header  x-testrol: schrijven | lezen | geen   (geen = niet ingelogd → 403)
//   rol voor de server:   BEHEER_TESTROL=lezen node scripts/serveer.mjs   (standaard: schrijven)
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { brotliCompressSync, gzipSync } from 'node:zlib';
import { behandelBeheer, isBeheerPad } from '../src/beheer/api.js';

const ROOT = fileURLToPath(new URL('../public/', import.meta.url));
const POORT = Number(process.argv[2] || process.env.POORT || 4173);
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml',
  '.xml': 'application/xml; charset=utf-8', '.txt': 'text/plain; charset=utf-8', '.ico': 'image/x-icon', '.json': 'application/json' };

async function bestaat(p) { try { return (await stat(p)).isFile(); } catch { return false; } }

function leesRegels(tekst) {
  return tekst.split('\n').map(r => r.trim()).filter(r => r && !r.startsWith('#'));
}
const redirects = leesRegels(await readFile(join(ROOT, '_redirects'), 'utf8').catch(() => ''))
  .map(r => r.split(/\s+/)).map(([van, naar, code]) => ({ van, naar, code: Number(code || 301) }));

// _headers: blokken "pad\n  Naam: waarde"
const headerBlokken = [];
for (const regel of (await readFile(join(ROOT, '_headers'), 'utf8').catch(() => '')).split('\n')) {
  if (!regel.trim() || regel.trim().startsWith('#')) continue;
  if (!/^\s/.test(regel)) headerBlokken.push({ pad: regel.trim(), headers: {} });
  else if (headerBlokken.length) { const i = regel.indexOf(':'); headerBlokken.at(-1).headers[regel.slice(0, i).trim()] = regel.slice(i + 1).trim(); }
}
function patroon(p) { return new RegExp('^' + p.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*') + '$'); }
function headersVoor(pad) {
  const h = {};
  for (const b of headerBlokken) if (patroon(b.pad).test(pad)) Object.assign(h, b.headers);
  return h;
}

// ---------- Testmodus beheer ----------
const TESTROL = process.env.BEHEER_TESTROL || 'schrijven';
// Verzonnen testgegevens (R1): geen echte adressen of bedragen.
const TESTGEBRUIKERS = { schrijven: 'schrijver@voorbeeld.test', lezen: 'meekijker@voorbeeld.test' };
const testOpslag = {
  boekjaren: async () => [{ jaar: 2026, afgesloten: false }],
};
async function nepIdentiteit(request) {
  const rol = request.headers.get('x-testrol') || TESTROL;
  return TESTGEBRUIKERS[rol] ? { email: TESTGEBRUIKERS[rol], rol } : null;
}
// Statische bestanden voor de beheerlogica, zoals env.ASSETS op Cloudflare (met de regels uit _headers).
const testAssets = {
  async fetch(request) {
    let p = decodeURIComponent(new URL(request.url).pathname);
    if (p.endsWith('/') && p !== '/') p = p.slice(0, -1);
    for (const k of [p, p + '.html', join(p, 'index.html')]) {
      const bestand = normalize(join(ROOT, k));
      if (!bestand.startsWith(ROOT)) break;
      if (await bestaat(bestand)) {
        return new Response(await readFile(bestand), { status: 200, headers: { 'Content-Type': TYPES[extname(bestand)] || 'application/octet-stream', ...headersVoor(p) } });
      }
    }
    return new Response(await readFile(join(ROOT, '404.html')).catch(() => 'Niet gevonden'), { status: 404, headers: { 'Content-Type': TYPES['.html'] } });
  },
};
async function beheerVerzoek(req, res) {
  const kop = new Headers();
  for (const [k, v] of Object.entries(req.headers)) if (typeof v === 'string') kop.set(k, v);
  const methode = req.method || 'GET';
  let body;
  if (!['GET', 'HEAD'].includes(methode)) { const delen = []; for await (const d of req) delen.push(d); body = Buffer.concat(delen); }
  const request = new Request(new URL(req.url, `http://${req.headers.host || '127.0.0.1'}`), { method: methode, headers: kop, body });
  const antwoord = await behandelBeheer(request, { wieIsHet: nepIdentiteit, opslag: testOpslag, assets: testAssets });
  res.writeHead(antwoord.status, Object.fromEntries(antwoord.headers));
  res.end(methode === 'HEAD' ? undefined : Buffer.from(await antwoord.arrayBuffer()));
}

createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');
  if (isBeheerPad(url.pathname)) return beheerVerzoek(req, res).catch(() => { res.writeHead(500); res.end(); });
  let pad = decodeURIComponent(url.pathname);
  for (const r of redirects) {
    const m = r.van.endsWith('*') ? pad.startsWith(r.van.slice(0, -1)) : pad === r.van || pad === r.van + '/';
    if (m) { res.writeHead(r.code, { Location: r.naar }); return res.end(); }
  }
  if (pad.endsWith('/') && pad !== '/') pad = pad.slice(0, -1);
  const kandidaten = pad === '/' ? ['index.html'] : [pad, pad + '.html', join(pad, 'index.html')];
  for (const k of kandidaten) {
    const bestand = normalize(join(ROOT, k));
    if (!bestand.startsWith(ROOT)) break;
    if (await bestaat(bestand)) {
      let body = await readFile(bestand);
      const type = TYPES[extname(bestand)] || 'application/octet-stream';
      const extra = {};
      const ae = req.headers['accept-encoding'] || '';
      if (/^(text|application\/(xml|json))|javascript|svg/.test(type)) {
        if (/\bbr\b/.test(ae)) { body = brotliCompressSync(body); extra['Content-Encoding'] = 'br'; }
        else if (/gzip/.test(ae)) { body = gzipSync(body); extra['Content-Encoding'] = 'gzip'; }
        extra['Vary'] = 'Accept-Encoding';
      }
      res.writeHead(200, { 'Content-Type': type, ...extra, ...headersVoor(pad) });
      return res.end(body);
    }
  }
  res.writeHead(404, { 'Content-Type': TYPES['.html'], ...headersVoor(pad) });
  res.end(await readFile(join(ROOT, '404.html')).catch(() => 'Niet gevonden'));
}).listen(POORT, '127.0.0.1', () => console.log(`LUX mini test-server op http://127.0.0.1:${POORT}`));
