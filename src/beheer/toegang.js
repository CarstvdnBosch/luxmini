// Beheer: wie is het en mag dat? (brief 2026-11-07-beheer-administratie, R5–R8)
//
// Cloudflare Access zet na het inloggen (code per mail) een ondertekend JWT in de header
// Cf-Access-Jwt-Assertion. De Worker vertrouwt Access niet blind en controleert zelf:
//   - handtekening RS256 met de openbare sleutels van https://<team>/cdn-cgi/access/certs (met cache);
//   - aud bevat BEHEER_ACCESS_AUD, iss is https://<team>, niet verlopen (exp) en al geldig (nbf);
//   - het e-mailadres staat in het Worker-secret BEHEER_ROLLEN (rol schrijven of lezen).
// Zonder team-domein of AUD (nog niet ingesteld) is er nooit toegang.
// Alleen Web Crypto, geen externe bibliotheek. Logs bevatten alleen een code, nooit het adres.

const SLEUTEL_CACHE_MS = 60 * 60 * 1000;   // sleutels een uur bewaren
const OPNIEUW_HALEN_MS = 60 * 1000;        // onbekende kid: hooguit eens per minuut opnieuw ophalen
const sleutelCache = new Map();            // team → { sleutels: Map(kid → CryptoKey), gehaald, geprobeerd }

function b64urlNaarBytes(tekst) {
  if (typeof tekst !== 'string' || !/^[A-Za-z0-9_-]*$/.test(tekst)) throw new Error('geen base64url');
  const b64 = tekst.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((tekst.length + 3) % 4);
  const bin = atob(b64);
  const uit = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) uit[i] = bin.charCodeAt(i);
  return uit;
}
const leesJson = (deel) => JSON.parse(new TextDecoder().decode(b64urlNaarBytes(deel)));

/** Team-domein netjes maken: "https://x.cloudflareaccess.com/" → "x.cloudflareaccess.com". */
export function teamDomein(team) {
  return String(team || '').trim().replace(/^https?:\/\//i, '').replace(/\/+$/, '').toLowerCase();
}

async function haalSleutels(team, fetchImpl) {
  const res = await fetchImpl(`https://${team}/cdn-cgi/access/certs`, { headers: { accept: 'application/json' } });
  if (!res.ok) throw new Error('certs ' + res.status);
  const { keys } = await res.json();
  const sleutels = new Map();
  for (const jwk of Array.isArray(keys) ? keys : []) {
    if (jwk.kty !== 'RSA' || !jwk.kid || (jwk.alg && jwk.alg !== 'RS256') || (jwk.use && jwk.use !== 'sig')) continue;
    const { kty, n, e } = jwk;
    sleutels.set(jwk.kid, await crypto.subtle.importKey('jwk', { kty, n, e, alg: 'RS256', ext: true },
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']));
  }
  return sleutels;
}

async function sleutelVoor(team, kid, fetchImpl, nu) {
  let c = sleutelCache.get(team);
  const verlopen = !c || nu - c.gehaald > SLEUTEL_CACHE_MS;
  const onbekend = c && !c.sleutels.has(kid) && nu - c.geprobeerd > OPNIEUW_HALEN_MS;
  if (verlopen || onbekend) {
    const geprobeerd = nu;
    try {
      c = { sleutels: await haalSleutels(team, fetchImpl), gehaald: nu, geprobeerd };
      sleutelCache.set(team, c);
    } catch {
      console.warn('beheer: sleutels-niet-opgehaald');
      if (c) c.geprobeerd = geprobeerd;
      if (!c) return null;
    }
  }
  return c.sleutels.get(kid) || null;
}

/** Alleen voor de unit-tests: cache leegmaken. */
export function leegSleutelCache() { sleutelCache.clear(); }

/**
 * Controleert een Access-JWT. Geeft de claims terug, of null als er iets niet klopt.
 * @param {string} token
 * @param {{ team: string, aud: string, fetchImpl?: typeof fetch, nu?: number }} opties (nu in ms)
 */
export async function controleerJwt(token, { team, aud, fetchImpl = fetch, nu = Date.now() }) {
  team = teamDomein(team);
  aud = String(aud || '').trim();
  if (!team || !aud || typeof token !== 'string') return null;
  const delen = token.split('.');
  if (delen.length !== 3) return null;
  let kop, claims, handtekening;
  try {
    kop = leesJson(delen[0]);
    claims = leesJson(delen[1]);
    handtekening = b64urlNaarBytes(delen[2]);
  } catch { return null; }
  if (!kop || kop.alg !== 'RS256' || typeof kop.kid !== 'string') return null;
  const sleutel = await sleutelVoor(team, kop.kid, fetchImpl, nu);
  if (!sleutel) return null;
  const data = new TextEncoder().encode(`${delen[0]}.${delen[1]}`);
  let klopt = false;
  try { klopt = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', sleutel, handtekening, data); } catch { klopt = false; }
  if (!klopt || !claims || typeof claims !== 'object') return null;
  const seconden = Math.floor(nu / 1000);
  const auds = Array.isArray(claims.aud) ? claims.aud : [claims.aud];
  if (!auds.includes(aud)) return null;
  if (claims.iss !== `https://${team}`) return null;
  if (typeof claims.exp !== 'number' || claims.exp <= seconden) return null;
  if (claims.nbf !== undefined && (typeof claims.nbf !== 'number' || claims.nbf > seconden)) return null;
  return claims;
}

/**
 * Rol bij een e-mailadres, uit BEHEER_ROLLEN (JSON: { "schrijven": [...], "lezen": [...] }).
 * Hoofdletters tellen niet. Staat een adres in beide lijsten, dan geldt de kleinste rol (lezen).
 * Onbekend adres of ongeldige lijst: null.
 */
export function rolVoor(email, rollenTekst) {
  if (typeof email !== 'string' || !email.includes('@')) return null;
  let rollen;
  try { rollen = typeof rollenTekst === 'string' ? JSON.parse(rollenTekst) : rollenTekst; } catch {
    console.warn('beheer: rollen-ongeldig');
    return null;
  }
  if (!rollen || typeof rollen !== 'object') return null;
  const adres = email.trim().toLowerCase();
  const staatIn = (lijst) => Array.isArray(lijst) && lijst.some((a) => typeof a === 'string' && a.trim().toLowerCase() === adres);
  if (staatIn(rollen.lezen)) return 'lezen';
  if (staatIn(rollen.schrijven)) return 'schrijven';
  return null;
}

/**
 * De echte identiteit voor de Worker: JWT van Access + rol uit het secret.
 * Geeft { email, rol } of null (dan 403).
 */
export async function identiteitUitAccess(request, env, fetchImpl = fetch) {
  const token = request.headers.get('Cf-Access-Jwt-Assertion');
  if (!token) return null;
  const claims = await controleerJwt(token, { team: env.BEHEER_ACCESS_TEAM, aud: env.BEHEER_ACCESS_AUD, fetchImpl });
  if (!claims || typeof claims.email !== 'string') return null;
  const rol = rolVoor(claims.email, env.BEHEER_ROLLEN);
  if (!rol) return null;
  return { email: claims.email, rol };
}

/** POST/PUT/PATCH/DELETE alleen met een Origin gelijk aan de eigen host (R8). */
export function eigenOrigin(request) {
  const origin = request.headers.get('Origin');
  if (!origin) return false;
  try { return new URL(origin).origin === new URL(request.url).origin; } catch { return false; }
}
