// Beheer: routes voor /beheer (statische schermen) en /api/beheer/* (gegevens).
// Brief 2026-11-07-beheer-administratie, S1.
//
// De logica krijgt van buitenaf mee (R14):
//   wieIsHet(request) → { email, rol } of null    (in src/worker.js: JWT van Cloudflare Access + BEHEER_ROLLEN)
//   opslag            → object met de opslagfuncties, of null als er nog geen database is (dan 503)
//   assets            → { fetch(request) } voor de statische bestanden in public/beheer/
// Zo blijft deze code gelijk, waar hij ook draait.
import { eigenOrigin } from './toegang.js';

export const BEVEILIGING = {
  'Cache-Control': 'no-store',
  'X-Robots-Tag': 'noindex, nofollow',
  'Referrer-Policy': 'no-referrer',
  'Content-Security-Policy': "default-src 'self'; frame-ancestors 'none'; form-action 'self'",
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000',
};

const SCHRIJVEN = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

/** Hoort dit pad bij beheer? (/beheer, /beheer/…, /api/beheer, /api/beheer/…; hoofdletters tellen niet) */
export function isBeheerPad(pad) {
  const p = String(pad || '').toLowerCase();
  return p === '/beheer' || p.startsWith('/beheer/') || p === '/api/beheer' || p.startsWith('/api/beheer/');
}

function metBeveiliging(res) {
  const uit = new Response(res.body, res);
  for (const [k, v] of Object.entries(BEVEILIGING)) uit.headers.set(k, v);
  return uit;
}

function json(data, status = 200) {
  return metBeveiliging(new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json; charset=utf-8' } }));
}

// Zonder toegang: geen gegevens en geen uitleg over waarom (R7).
const geenToegang = () => metBeveiliging(new Response('Geen toegang', { status: 403, headers: { 'Content-Type': 'text/plain; charset=utf-8' } }));

function logFout(code, pad) {
  // alleen een code en de route, nooit gegevens (R13)
  console.warn(`beheer: ${code} ${pad}`);
}

/**
 * Handelt een verzoek op /beheer* of /api/beheer/* af.
 * @param {Request} request
 * @param {{ wieIsHet: (r: Request) => Promise<{email: string, rol: 'schrijven'|'lezen'}|null>, opslag: object|null, assets: { fetch: (r: Request) => Promise<Response> } }} deps
 */
export async function behandelBeheer(request, { wieIsHet, opslag, assets }) {
  const url = new URL(request.url);
  const pad = url.pathname.toLowerCase();

  let wie = null;
  try { wie = await wieIsHet(request); } catch { logFout('identiteit-fout', pad); wie = null; }
  if (!wie || (wie.rol !== 'schrijven' && wie.rol !== 'lezen')) return geenToegang();

  // Schrijfacties: eigen Origin en rol schrijven (R8)
  if (SCHRIJVEN.has(request.method)) {
    if (!eigenOrigin(request)) return geenToegang();
    if (wie.rol !== 'schrijven') return geenToegang();
  }

  if (pad === '/api/beheer' || pad.startsWith('/api/beheer/')) {
    const route = pad.replace(/\/+$/, '');
    try {
      if (route === '/api/beheer/ik') {
        if (request.method !== 'GET') return json({ fout: 'Methode niet toegestaan' }, 405);
        return json({ rol: wie.rol, email: wie.email });
      }
      if (route === '/api/beheer/boekjaren') {
        if (request.method !== 'GET') return json({ fout: 'Methode niet toegestaan' }, 405);
        if (!opslag) return json({ fout: 'Opslag nog niet ingesteld' }, 503);
        return json({ boekjaren: await opslag.boekjaren() });
      }
      return json({ fout: 'Niet gevonden' }, 404);
    } catch {
      logFout('serverfout', route);
      return json({ fout: 'Er ging iets mis. Probeer het opnieuw.' }, 500);
    }
  }

  // Statische beheerschermen (alleen lezen; schrijven gaat via /api/beheer/*)
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return metBeveiliging(new Response('Methode niet toegestaan', { status: 405, headers: { Allow: 'GET, HEAD' } }));
  }
  return metBeveiliging(await assets.fetch(request));
}
