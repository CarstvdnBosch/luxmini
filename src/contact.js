// LUX mini — afhandeling van POST /api/contact, los van Cloudflare-specifieke code,
// zodat de doeladressen met `npm test` te controleren zijn.
import { controleer, controleerFoto } from './formulier.js';

export const NA_VERZONDEN = '/bedankt';
export const NA_FOUT = '/contact?verzonden=fout#formulier'; // ongeldige invoer
export const NA_VERSTUURFOUT = '/contact?verzonden=fout&reden=versturen#formulier'; // versturen mislukt (ligt niet aan de bezoeker)
export const NA_FOTOFOUT = '/contact?verzonden=fout&reden=foto#formulier'; // foto te groot of geen foto (eigen stof)
export const NA_LINKFOUT = '/contact?verzonden=fout&reden=link#formulier'; // link naar de stof begint niet met https://
export const NAAR_FORMULIER = '/contact#formulier';

const terug = (request, pad) => Response.redirect(new URL(pad, request.url).toString(), 303);

// verstuur(velden, foto) verstuurt de mail (foto: null of { naam, type, bytes } als bijlage) en gooit een fout als dat mislukt.
export async function verwerkContact(request, verstuur) {
  if (request.method !== 'POST') return terug(request, NAAR_FORMULIER);

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

  try {
    await verstuur(velden, foto);
    return terug(request, NA_VERZONDEN);
  } catch (err) {
    console.error('Versturen mislukt:', err && err.message);
    return terug(request, NA_VERSTUURFOUT);
  }
}
