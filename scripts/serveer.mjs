// Kleine statische server voor de tests: serveert public/ zoals Cloudflare dat doet
// (schone adressen: /werkwijze → werkwijze.html, 404.html bij onbekende paden,
// _redirects voor oude adressen (bijv. /producten → 301 /werkwijze), de headers uit _headers en compressie (brotli/gzip) zoals Cloudflare).
// Gebruik: node scripts/serveer.mjs [poort]   (standaard 4173)
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { brotliCompressSync, gzipSync } from 'node:zlib';

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

createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');
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
