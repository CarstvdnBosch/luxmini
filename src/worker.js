// LUX mini — Cloudflare Worker.
// Alle pagina's en foto's komen uit ./public (static assets).
// Deze code draait alleen voor verzoeken die geen bestand zijn, zoals POST /api/contact.
// Het formulier staat op /contact; na een fout komt de bezoeker terug op /contact?verzonden=fout#formulier.
import { EmailMessage } from 'cloudflare:email';
import { bouwMail } from './formulier.js';
import { verwerkContact } from './contact.js';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/contact') {
      return verwerkContact(request, async (velden) => {
        const raw = bouwMail({ velden, afzender: env.AFZENDER, ontvanger: env.ONTVANGER });
        await env.MAIL.send(new EmailMessage(env.AFZENDER, env.ONTVANGER, raw));
      });
    }

    return env.ASSETS.fetch(request);
  },
};
