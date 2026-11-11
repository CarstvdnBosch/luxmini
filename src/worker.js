// LUX mini — Cloudflare Worker.
// Alle pagina's en foto's komen uit ./public (static assets).
// Deze code draait alleen voor verzoeken die geen bestand zijn, zoals POST /api/contact,
// en voor alles onder /beheer en /api/beheer (run_worker_first in wrangler.jsonc).
// Het formulier staat op /contact; na ongeldige invoer komt de bezoeker terug op /contact?verzonden=fout#formulier,
// als het versturen mislukt op /contact?verzonden=fout&reden=versturen#formulier (src/contact.js).
import { EmailMessage } from 'cloudflare:email';
import { bouwMail } from './formulier.js';
import { verwerkContact } from './contact.js';
import { behandelBeheer, isBeheerPad } from './beheer/api.js';
import { identiteitUitAccess } from './beheer/toegang.js';
import { maakD1Opslag } from './beheer/opslag.js';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/contact') {
      return verwerkContact(request, async (velden) => {
        const raw = bouwMail({ velden, afzender: env.AFZENDER, ontvanger: env.ONTVANGER });
        await env.MAIL.send(new EmailMessage(env.AFZENDER, env.ONTVANGER, raw));
      });
    }

    // Beheer: altijd de echte JWT-controle van Cloudflare Access en de echte database.
    // Zonder BEHEER_DB (nog niet ingesteld) geven routes met opslag 503.
    if (isBeheerPad(url.pathname)) {
      return behandelBeheer(request, {
        wieIsHet: (r) => identiteitUitAccess(r, env),
        opslag: env.BEHEER_DB ? maakD1Opslag(env.BEHEER_DB) : null,
        assets: env.ASSETS,
      });
    }

    return env.ASSETS.fetch(request);
  },
};
