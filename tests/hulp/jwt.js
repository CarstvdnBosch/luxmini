// Hulp voor de unit-tests van beheer: een zelf gemaakt RSA-sleutelpaar en ondertekende JWT's,
// zoals Cloudflare Access ze maakt. Geen netwerk: de "certs" komen uit een nep-fetch in de test.
export const TEAM = 'voorbeeld-team.cloudflareaccess.com';
export const AUD = 'aud-voorbeeld-0123456789abcdef';

const b64url = (bytes) => Buffer.from(bytes).toString('base64url');
const tekst = (obj) => b64url(new TextEncoder().encode(JSON.stringify(obj)));

export async function maakSleutel(kid = 'sleutel-1') {
  const paar = await crypto.subtle.generateKey(
    { name: 'RSASSA-PKCS1-v1_5', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' },
    true, ['sign', 'verify']);
  const jwk = await crypto.subtle.exportKey('jwk', paar.publicKey);
  return { kid, privateKey: paar.privateKey, jwk: { kty: 'RSA', n: jwk.n, e: jwk.e, kid, alg: 'RS256', use: 'sig' } };
}

export async function maakJwt(sleutel, claims = {}, kop = {}) {
  const nu = Math.floor(Date.now() / 1000);
  const h = tekst({ alg: 'RS256', kid: sleutel.kid, typ: 'JWT', ...kop });
  const p = tekst({ aud: [AUD], iss: `https://${TEAM}`, email: 'schrijver@voorbeeld.test', iat: nu, nbf: nu - 5, exp: nu + 3600, ...claims });
  const handtekening = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', sleutel.privateKey, new TextEncoder().encode(`${h}.${p}`));
  return `${h}.${p}.${b64url(new Uint8Array(handtekening))}`;
}

/** Nep-fetch die alleen de certs van het team geeft en telt hoe vaak hij is aangeroepen. */
export function nepCerts(...sleutels) {
  const f = async (url) => {
    f.aantal++;
    if (url !== `https://${TEAM}/cdn-cgi/access/certs`) return new Response('nee', { status: 404 });
    return Response.json({ keys: sleutels.map((s) => s.jwk) });
  };
  f.aantal = 0;
  return f;
}

export const ROLLEN = JSON.stringify({ schrijven: ['Schrijver@Voorbeeld.test'], lezen: ['meekijker@voorbeeld.test'] });
