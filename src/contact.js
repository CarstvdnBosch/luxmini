// LUX mini — afhandeling van POST /api/contact, los van Cloudflare-specifieke code,
// zodat de doeladressen met `npm test` te controleren zijn.
import { controleer, controleerFoto } from './formulier.js';

export const NA_VERZONDEN = '/bedankt';
export const NA_FOUT = '/contact?verzonden=fout#formulier'; // ongeldige invoer
export const NA_VERSTUURFOUT = '/contact?verzonden=fout&reden=versturen#formulier'; // versturen mislukt (ligt niet aan de bezoeker)
export const NA_FOTOFOUT = '/contact?verzonden=fout&reden=foto#formulier'; // foto te groot of geen foto (eigen stof)
export const NA_LINKFOUT = '/contact?verzonden=fout&reden=link#formulier'; // link naar de stof begint niet met https://
export const NA_TE_VEEL = '/contact?verzonden=fout&reden=te-veel#formulier'; // rate limit: meer dan 5 verzendingen per 60 s van hetzelfde IP
export const NA_TE_SNEL = '/contact?verzonden=fout&reden=te-snel#formulier'; // tijdcontrole: binnen 3 s na het laden verstuurd
export const NA_CONTROLE = '/contact?verzonden=fout&reden=controle#formulier'; // Turnstile: geen, afgekeurd of niet te controleren token
export const NAAR_FORMULIER = '/contact#formulier';
// Botbescherming (brief 2026-11-14-formulier-botbescherming): kleinste verstreken tijd (ms) tussen laden en versturen,
// zoals main.js die in het verborgen veld formtijd zet (performance.now(), niet de klok van het apparaat).
export const MIN_TIJD = 3000;
export const SITEVERIFY = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
export const SITEVERIFY_TIJD = 5000; // time-out van siteverify (ms); daarna telt het als "controle"
const TOKEN_MAX = 2048; // een Turnstile-token is nooit langer
// grootste verzoek dat we lezen: een foto van 5 MB plus de velden en de multipart-koppen past ruim binnen 6 MB (controle ronde 1)
export const VERZOEK_MAX = 6 * 1024 * 1024;

const terug = (request, pad) => Response.redirect(new URL(pad, request.url).toString(), 303);

// Het IP is alleen de sleutel voor de rate limit en gaat mee naar siteverify (remoteip); het wordt nooit gelogd of opgeslagen.
const ipVan = (request) => request.headers.get('cf-connecting-ip') || '';

/**
 * Controle van een Turnstile-token bij Cloudflare (siteverify). Geeft true alleen bij success: true.
 * Time-out (5 s), netwerkfout, geen JSON of geen 2xx gooit een fout; verwerkContact maakt daar "controle" van.
 * Niets van token, secret of IP wordt gelogd.
 */
export function maakSiteverify(secret, haal = fetch, tijd = SITEVERIFY_TIJD) {
  return async (token, ip) => {
    const body = new URLSearchParams({ secret, response: token });
    if (ip) body.set('remoteip', ip);
    const res = await haal(SITEVERIFY, { method: 'POST', body, signal: AbortSignal.timeout(tijd) });
    if (!res.ok) throw new Error('siteverify ' + res.status);
    const uitslag = await res.json();
    return uitslag && uitslag.success === true;
  };
}

// verstuur(velden, foto) verstuurt de mail (foto: null of { naam, type, bytes } als bijlage) en gooit een fout als dat mislukt.
// opties (brief 2026-11-14-formulier-botbescherming; src/worker.js geeft de echte functies mee, de tests en serveer.mjs nepfuncties):
//   limiet(ip)            → true (door), false (te veel) of null (rate limit niet beschikbaar: door); een fout telt als niet beschikbaar
//   turnstile(token, ip)  → true (goedgekeurd) of false; een fout (time-out, netwerk) telt als afgekeurd. Zonder deze functie staat Turnstile uit.
//   minTijd               → kleinste formtijd in ms (standaard MIN_TIJD)
export async function verwerkContact(request, verstuur, opties = {}) {
  if (request.method !== 'POST') return terug(request, NAAR_FORMULIER);
  const ip = ipVan(request);

  // rate limit: vóór het lezen van de body (fail open: zonder binding of bij een fout van het platform gaat het bericht door)
  if (typeof opties.limiet === 'function') {
    let toegestaan = null;
    try { toegestaan = await opties.limiet(ip || 'onbekend'); } catch { toegestaan = null; }
    if (toegestaan === false) {
      console.warn('Formulier geweigerd: te-veel');
      return terug(request, NA_TE_VEEL);
    }
    if (toegestaan !== true) console.warn('Rate limit niet beschikbaar');
  }

  // te groot verzoek: weigeren vóór het lezen (anders leest de Worker eerst alles in het geheugen); bijna altijd een te grote foto
  const lengte = Number(request.headers.get('content-length'));
  if (Number.isFinite(lengte) && lengte > VERZOEK_MAX) {
    console.warn('Formulier ongeldig: foto');
    return terug(request, NA_FOTOFOUT);
  }

  let form;
  try {
    form = await request.formData();
  } catch {
    console.warn('Formulier ongeldig: onleesbaar');
    return terug(request, NA_FOUT);
  }

  const { ok, spam, velden, fouten, stofFouten } = controleer(form);
  if (spam) return terug(request, NA_VERZONDEN); // spamval: doe alsof het gelukt is
  if (!ok) {
    console.warn('Formulier ongeldig:', fouten.join(', ')); // alleen de veldnamen, nooit de waarden
    return terug(request, NA_FOUT);
  }
  // eigen stof: foto (optioneel) alleen bij thema = eigen stof; anders gaat hij nooit mee. Niets opslaan, niets van de foto loggen.
  let foto = null;
  if (velden.eigenStof) {
    const f = await controleerFoto(form.get('stof_foto'));
    if (!f.ok) {
      console.warn('Formulier ongeldig: foto');
      return terug(request, NA_FOTOFOUT);
    }
    foto = f.foto;
  }
  if (stofFouten.length) {
    console.warn('Formulier ongeldig: link');
    return terug(request, NA_LINKFOUT);
  }

  // tijdcontrole: alleen als het veld er is (main.js maakt het; zonder JavaScript geen tijdcontrole). Nooit in de mail.
  const minTijd = Number.isFinite(opties.minTijd) ? opties.minTijd : MIN_TIJD;
  const formtijd = form.get('formtijd');
  if (formtijd !== null && !(typeof formtijd === 'string' && /^\d{1,12}$/.test(formtijd) && Number(formtijd) >= minTijd)) {
    console.warn('Formulier geweigerd: te-snel');
    return terug(request, NA_TE_SNEL);
  }

  // Turnstile: alleen als het aanstaat (site key en secret ingesteld); het token wordt pas hier, bij geldige invoer, verbruikt
  if (typeof opties.turnstile === 'function') {
    const token = form.get('cf-turnstile-response');
    let goed = false;
    if (typeof token === 'string' && token.length > 0 && token.length <= TOKEN_MAX) {
      try { goed = (await opties.turnstile(token, ip)) === true; } catch { goed = false; }
    }
    if (!goed) {
      console.warn('Formulier geweigerd: controle');
      return terug(request, NA_CONTROLE);
    }
  }

  try {
    await verstuur(velden, foto);
    return terug(request, NA_VERZONDEN);
  } catch (err) {
    console.error('Versturen mislukt:', err && err.message);
    return terug(request, NA_VERSTUURFOUT);
  }
}
