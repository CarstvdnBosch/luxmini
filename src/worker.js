// LUX mini — Cloudflare Worker.
// Alle pagina's en foto's komen uit ./public (static assets).
// Deze code draait alleen voor verzoeken die geen bestand zijn, zoals POST /api/contact,
// en voor alles onder /beheer en /api/beheer (run_worker_first in wrangler.jsonc).
// Het formulier staat op /contact; na ongeldige invoer komt de bezoeker terug op /contact?verzonden=fout#formulier,
// als het versturen mislukt op /contact?verzonden=fout&reden=versturen#formulier, bij een ongeldige foto of link van de
// eigen stof op &reden=foto of &reden=link (src/contact.js).
// Botbescherming (brief 2026-11-14-formulier-botbescherming, docs/formulier-beveiliging.md): rate limit (binding
// CONTACT_RATELIMIT, 5 per 60 s per IP; ontbreekt hij, dan gaat het bericht door), tijdcontrole (formtijd) en Turnstile
// (alleen als de var TURNSTILE_SITEKEY én het secret TURNSTILE_SECRET zijn ingesteld; het secret staat nooit in de repo).
import { EmailMessage } from 'cloudflare:email';
import { bouwMail } from './formulier.js';
import { verwerkContact, maakSiteverify } from './contact.js';
import { behandelBeheer, isBeheerPad } from './beheer/api.js';
import { identiteitUitAccess } from './beheer/toegang.js';
import { maakD1Opslag } from './beheer/opslag.js';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/contact') {
      return verwerkContact(request, async (velden, foto) => {
        // foto (eigen stof) alleen als bijlage in de mail; nergens opgeslagen (brief 2026-11-11-c7-stofkeuze)
        const raw = bouwMail({ velden, foto, afzender: env.AFZENDER, ontvanger: env.ONTVANGER });
        await env.MAIL.send(new EmailMessage(env.AFZENDER, env.ONTVANGER, raw));
      }, {
        // null = binding ontbreekt (lokaal of fout van het platform): verwerkContact laat het bericht door
        limiet: async (sleutel) => (env.CONTACT_RATELIMIT ? (await env.CONTACT_RATELIMIT.limit({ key: sleutel })).success : null),
        turnstile: env.TURNSTILE_SITEKEY && env.TURNSTILE_SECRET ? maakSiteverify(env.TURNSTILE_SECRET) : null,
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
