// LUX mini — afhandeling van POST /api/contact, los van Cloudflare-specifieke code,
// zodat de doeladressen met `npm test` te controleren zijn.
import { controleer } from './formulier.js';

export const NA_VERZONDEN = '/bedankt';
export const NA_FOUT = '/contact?verzonden=fout#formulier';
export const NAAR_FORMULIER = '/contact#formulier';

const terug = (request, pad) => Response.redirect(new URL(pad, request.url).toString(), 303);

// verstuur(velden) verstuurt de mail en gooit een fout als dat mislukt.
export async function verwerkContact(request, verstuur) {
  if (request.method !== 'POST') return terug(request, NAAR_FORMULIER);

  let form;
  try {
    form = await request.formData();
  } catch {
    return terug(request, NA_FOUT);
  }

  const { ok, spam, velden } = controleer(form);
  if (spam) return terug(request, NA_VERZONDEN); // spamval: doe alsof het gelukt is
  if (!ok) return terug(request, NA_FOUT);

  try {
    await verstuur(velden);
    return terug(request, NA_VERZONDEN);
  } catch (err) {
    console.error('Versturen mislukt:', err && err.message);
    return terug(request, NA_FOUT);
  }
}
