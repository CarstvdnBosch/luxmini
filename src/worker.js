// LUX mini — Cloudflare Worker.
// Alle pagina's en foto's komen uit ./public (static assets).
// Deze code draait alleen voor verzoeken die geen bestand zijn, zoals POST /api/contact.
import { EmailMessage } from 'cloudflare:email';
import { controleer, bouwMail } from './formulier.js';

const terug = (request, pad) => Response.redirect(new URL(pad, request.url).toString(), 303);

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/contact') {
      if (request.method !== 'POST') return terug(request, '/#contact');

      let form;
      try {
        form = await request.formData();
      } catch {
        return terug(request, '/?verzonden=fout#contact');
      }

      const { ok, spam, velden } = controleer(form);
      if (spam) return terug(request, '/bedankt'); // spamval: doe alsof het gelukt is
      if (!ok) return terug(request, '/?verzonden=fout#contact');

      try {
        const raw = bouwMail({ velden, afzender: env.AFZENDER, ontvanger: env.ONTVANGER });
        await env.MAIL.send(new EmailMessage(env.AFZENDER, env.ONTVANGER, raw));
        return terug(request, '/bedankt');
      } catch (err) {
        console.error('Versturen mislukt:', err && err.message);
        return terug(request, '/?verzonden=fout#contact');
      }
    }

    return env.ASSETS.fetch(request);
  },
};
