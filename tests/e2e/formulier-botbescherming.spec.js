// Brief 2026-11-14-formulier-botbescherming (criteria 5–10, 13–15, 20; ontwerpcriteria 1–6), blokkerend.
// Er gaat nooit een echte mail weg en er gaat niets naar Cloudflare: /api/contact loopt via de testmodus van scripts/serveer.mjs
// (x-testmail, x-testlimiet, x-testturnstile). Het script van Turnstile wordt in deze tests vervangen door een klein nep-object
// (page.route) dat bijhoudt of render en reset worden aangeroepen; alleen de test met de zichtbare uitdaging (testsleutel
// "interactie") laadt het echte script van challenges.cloudflare.com.
import { test, expect, wachtOpRust, turnstileIframe } from './hulp.js';

const INVOER = { bericht: 'Graag een box met een giraf', naam: 'Test Persoon', email: 'test@voorbeeld.test' };
const TS_HOST = 'challenges.cloudflare.com';

// Nep-Turnstile: render() zet het verborgen veld cf-turnstile-response (zoals het echte script) en geeft na 200 ms een token,
// reset() maakt het token leeg en geeft daarna een nieuw. Met window.__tsHandmatig komt er geen token vanzelf.
const NEP_TURNSTILE = `(function () {
  var ts = window.__ts = { render: [], reset: 0, tokens: 0 };
  var geef = function () { ts.tokens++; var t = 'nep-token-' + ts.tokens; ts.veld.value = t; ts.opties.callback(t); };
  ts.geef = geef;
  window.turnstile = {
    render: function (el, o) {
      ts.render.push({ sitekey: o.sitekey, appearance: o.appearance, theme: o.theme, language: o.language, size: o.size,
        refresh: o['refresh-expired'], el: el.className });
      ts.opties = o;
      ts.veld = document.createElement('input'); ts.veld.type = 'hidden'; ts.veld.name = 'cf-turnstile-response'; el.appendChild(ts.veld);
      if (!window.__tsHandmatig) setTimeout(geef, 200);
      return 'nep-widget';
    },
    reset: function () { ts.reset++; ts.veld.value = ''; if (!window.__tsHandmatig) setTimeout(geef, 200); },
    getResponse: function () { return ts.veld ? ts.veld.value : undefined; },
    remove: function () {}
  };
})();`;
const nepScript = (page) => page.route(`https://${TS_HOST}/**`, (r) => r.fulfill({ status: 200, contentType: 'text/javascript', body: NEP_TURNSTILE }));
const kop = (page, extra) => page.setExtraHTTPHeaders({ 'x-testmail': 'ok', ...extra });
const bewaarPost = (page, lijst) => page.on('request', (r) => { if (r.method() === 'POST' && new URL(r.url()).pathname === '/api/contact') lijst.push(r); });
async function postData(r) {
  return new Response(r.postDataBuffer(), { headers: { 'content-type': r.headers()['content-type'] } }).formData();
}
async function vulIn(page) {
  for (const [naam, waarde] of Object.entries(INVOER)) await page.locator(`[name="${naam}"]`).fill(waarde);
}
async function veldenGevuld(page) {
  for (const [naam, waarde] of Object.entries(INVOER)) await expect(page.locator(`[name="${naam}"]`)).toHaveValue(waarde);
}
// melding en knop samen in beeld, tekst 16 px inkt, niets scrolt horizontaal
async function meldingInBeeld(page) {
  const m = await page.locator('.formulier .melding.fout').evaluate((m) => {
    const r = m.getBoundingClientRect(); const k = document.querySelector('.formulier button.verstuur').getBoundingClientRect();
    return { boven: r.top, knopOnder: k.bottom, hoogte: innerHeight, px: parseFloat(getComputedStyle(m).fontSize), kleur: getComputedStyle(m).color,
      breed: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1 };
  });
  expect(m.boven, 'melding in beeld').toBeGreaterThanOrEqual(0);
  expect(m.knopOnder, 'knop in beeld').toBeLessThanOrEqual(m.hoogte);
  expect(m.px).toBeGreaterThanOrEqual(16);
  expect(m.kleur, 'inkt op terracotta').toBe('rgb(32, 32, 32)');
  expect(m.breed, 'niets scrolt horizontaal').toBe(false);
}
async function contactLinks(melding) {
  await expect(melding.locator('a[href="https://wa.me/31643791618"]')).toHaveText('WhatsApp');
  await expect(melding.locator('a[href="mailto:info.LUXmini@gmail.com"]')).toHaveText('mail');
}

test.describe('tijdcontrole', () => {
  test('binnen 1 s ingevuld en verstuurd: wacht zelf, knop aria-busy, daarna afgeleverd zonder melding', async ({ page }) => {
    const posts = [];
    bewaarPost(page, posts);
    await kop(page);
    await page.goto('/contact#formulier');
    await vulIn(page);
    const tijd = await page.evaluate(() => performance.now());
    await page.locator('button.verstuur').click();
    // pas zinnig als de klik echt binnen de 3 s viel; anders wacht het formulier niet
    expect(tijd, 'klik binnen 3 s na het laden').toBeLessThan(2800);
    await expect(page.locator('button.verstuur')).toHaveAttribute('aria-busy', 'true');
    await expect(page.locator('button.verstuur')).toHaveCSS('cursor', 'progress');
    expect(posts.length, 'nog niet verstuurd tijdens de wachttijd').toBe(0);
    await expect(page).toHaveURL(/\/bedankt$/, { timeout: 10000 });
    expect(posts.length).toBe(1);
    const data = await postData(posts[0]);
    expect(Number(data.get('formtijd')), 'formtijd ≥ 3000 ms').toBeGreaterThanOrEqual(3000);
  });

  test('het veld formtijd bestaat vanaf het laden (verborgen, leeg)', async ({ page }) => {
    await page.goto('/contact#formulier');
    const veld = page.locator('form.formulier input[name="formtijd"]');
    await expect(veld).toHaveCount(1);
    await expect(veld).toHaveAttribute('type', 'hidden');
    await expect(veld).toHaveValue('');
  });

  test('een POST met formtijd=500 (zonder wachten in de browser) → te-snel, met eigen melding', async ({ page, baseURL }) => {
    const form = { onderwerp: 'Iets anders', ...INVOER, website: '', formtijd: '500' };
    const res = await page.request.post(`${baseURL}/api/contact`, { form, maxRedirects: 0, headers: { 'x-testmail': 'ok' } });
    expect(res.status()).toBe(303);
    expect(new URL(res.headers()['location']).search).toBe('?verzonden=fout&reden=te-snel');
    await page.goto('/contact?verzonden=fout&reden=te-snel#formulier');
    const melding = page.locator('.formulier .melding.fout');
    await expect(melding).toHaveText('Je bericht is niet verstuurd. Dat ging sneller dan we verwachten. Wacht een paar tellen en verstuur het nog eens.');
    await expect(melding).toHaveAttribute('role', 'alert');
  });
});

test.describe('rate limit', () => {
  test('x-testlimiet overschreden → melding te-veel met WhatsApp en mail, velden blijven staan', async ({ page }) => {
    await kop(page, { 'x-testlimiet': 'overschreden' });
    await page.goto('/contact#formulier');
    await wachtOpRust(page);
    await vulIn(page);
    await page.locator('button.verstuur').click();
    const melding = page.locator('.formulier .melding.fout');
    await expect(melding).toContainText('Je bericht is niet verstuurd. Er zijn in korte tijd veel berichten verstuurd. Probeer het over een minuut nog eens', { timeout: 10000 });
    await expect(melding).toHaveAttribute('role', 'alert');
    await expect(melding).toBeFocused();
    await contactLinks(melding);
    await veldenGevuld(page);
    await meldingInBeeld(page);
    await expect(page.locator('button.verstuur')).toBeEnabled();
  });
});

test.describe('Turnstile uit (lege site key)', () => {
  test('geen verzoek naar challenges.cloudflare.com, geen vak in beeld, geldig bericht komt aan', async ({ page }) => {
    const vreemd = [];
    page.on('request', (r) => { if (new URL(r.url()).hostname === TS_HOST) vreemd.push(r.url()); });
    await kop(page);
    await page.goto('/contact#formulier');
    await wachtOpRust(page);
    await expect(page.locator('.turnstile-vak')).toHaveAttribute('data-sitekey', '');
    await expect(page.locator('.turnstile-vak')).toBeHidden();
    await vulIn(page);
    await page.locator('button.verstuur').click();
    await expect(page).toHaveURL(/\/bedankt$/, { timeout: 10000 });
    expect(vreemd).toEqual([]);
  });
});

// Ontwerpcriterium 1: in rust dezelfde afstand privacyzin–knop als zonder Turnstile (de rijafstand van het formulier).
async function afstandPrivacyKnop(page) {
  return page.evaluate(() => {
    const p = document.querySelector('.formulier .melding:not(.fout)').getBoundingClientRect();
    const k = document.querySelector('.formulier button.verstuur').getBoundingClientRect();
    return { afstand: Math.round(k.top - p.bottom), gap: Math.round(parseFloat(getComputedStyle(document.querySelector('.formulier')).rowGap)) };
  });
}

test.describe('Turnstile aan (testmodus, nep-script)', () => {
  test('geslaagd: render met de juiste instellingen, token gaat mee, afgeleverd; in rust geen lege strook', async ({ page }) => {
    await nepScript(page);
    const posts = [];
    bewaarPost(page, posts);
    await kop(page, { 'x-testturnstile': 'geslaagd' });
    await page.goto('/contact#formulier');
    await wachtOpRust(page);
    await expect.poll(() => page.evaluate(() => window.__ts && window.__ts.render.length)).toBe(1);
    const r = await page.evaluate(() => window.__ts.render[0]);
    expect(r).toEqual({ sitekey: '1x00000000000000000000BB', appearance: 'interaction-only', theme: 'light', language: 'nl', size: 'normal', refresh: 'auto', el: 'turnstile-vak' });
    const a = await afstandPrivacyKnop(page);
    expect(a.afstand, 'privacyzin–knop gelijk aan de rijafstand (geen lege strook)').toBe(a.gap);
    await vulIn(page);
    await page.locator('button.verstuur').click();
    await expect(page).toHaveURL(/\/bedankt$/, { timeout: 10000 });
    const data = await postData(posts[0]);
    expect(data.get('cf-turnstile-response')).toMatch(/^nep-token-\d+$/);
  });

  test('mislukt: melding controle met WhatsApp en mail, velden blijven, turnstile.reset aangeroepen, nieuw token', async ({ page }) => {
    await nepScript(page);
    await kop(page, { 'x-testturnstile': 'mislukt' });
    await page.goto('/contact#formulier');
    await wachtOpRust(page);
    await vulIn(page);
    await page.locator('button.verstuur').click();
    const melding = page.locator('.formulier .melding.fout');
    await expect(melding).toContainText('Je bericht is niet verstuurd. De controle tegen spam lukte niet.', { timeout: 10000 });
    await expect(melding).toHaveAttribute('role', 'alert');
    await expect(melding).toBeFocused();
    await contactLinks(melding);
    await veldenGevuld(page);
    await meldingInBeeld(page);
    expect(await page.evaluate(() => window.__ts.reset), 'turnstile.reset na de fout').toBe(1);
    await expect.poll(() => page.locator('input[name="cf-turnstile-response"]').inputValue()).toBe('nep-token-2');
  });

  test('reset na elke soort fout (ook versturen mislukt)', async ({ page }) => {
    await nepScript(page);
    await kop(page, { 'x-testturnstile': 'geslaagd', 'x-testmail': 'fout' });
    await page.goto('/contact#formulier');
    await vulIn(page);
    await page.locator('button.verstuur').click();
    await expect(page.locator('.formulier .melding.fout')).toContainText('Dat ligt niet aan jou', { timeout: 10000 });
    expect(await page.evaluate(() => window.__ts.reset)).toBe(1);
  });

  test('nog geen token bij versturen: wacht met aria-busy en verstuurt zodra het token er is', async ({ page }) => {
    await nepScript(page);
    await page.addInitScript(() => { window.__tsHandmatig = true; });
    const posts = [];
    bewaarPost(page, posts);
    await kop(page, { 'x-testturnstile': 'geslaagd' });
    await page.goto('/contact#formulier');
    await wachtOpRust(page);
    await vulIn(page);
    await page.waitForTimeout(3200); // de tijdcontrole is al voorbij
    await page.locator('button.verstuur').click();
    await expect(page.locator('button.verstuur')).toHaveAttribute('aria-busy', 'true');
    await page.waitForTimeout(1500);
    expect(posts.length, 'zonder token wordt er niets verstuurd').toBe(0);
    await page.evaluate(() => window.__ts.geef());
    await expect(page).toHaveURL(/\/bedankt$/, { timeout: 10000 });
  });

  test('het token komt niet binnen 15 s: melding controle, niets verstuurd', async ({ page }, info) => {
    test.skip(info.project.name !== 'desktop' && info.project.name !== 'mobiel', 'wachttijd van 15 s: desktop en mobiel zijn genoeg');
    await nepScript(page);
    await page.addInitScript(() => { window.__tsHandmatig = true; });
    const posts = [];
    bewaarPost(page, posts);
    await kop(page, { 'x-testturnstile': 'geslaagd' });
    await page.goto('/contact#formulier');
    await wachtOpRust(page);
    await vulIn(page);
    await page.locator('button.verstuur').click();
    await expect(page.locator('button.verstuur')).toHaveAttribute('aria-busy', 'true');
    await expect(page.locator('.formulier .melding.fout')).toContainText('De controle tegen spam lukte niet.', { timeout: 25000 });
    expect(posts.length).toBe(0);
    await veldenGevuld(page);
    await expect(page.locator('button.verstuur')).toBeEnabled();
  });

  test('tabvolgorde: laatste veld → privacylink → (vak alleen als zichtbaar) → Verstuur bericht', async ({ page }, info) => {
    test.skip(info.project.name === 'iphone', 'Safari slaat links over met Tab (systeeminstelling); toetsenbord op Chromium');
    await nepScript(page);
    await kop(page, { 'x-testturnstile': 'geslaagd' });
    await page.goto('/contact#formulier');
    await wachtOpRust(page);
    await expect.poll(() => page.evaluate(() => window.__ts && window.__ts.render.length)).toBe(1);
    await page.locator('input[name="telefoon"]').focus();
    await page.keyboard.press('Tab');
    await expect(page.locator('.formulier .melding:not(.fout) a[href="privacy.html"]')).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(page.locator('button.verstuur')).toBeFocused();
  });
});

test.describe('meldingen na een gewone POST (zonder JavaScript-verzending)', () => {
  for (const [reden, tekst, links] of [
    ['controle', 'Je bericht is niet verstuurd. De controle tegen spam lukte niet. Probeer het nog eens, of stuur Carien een WhatsApp of mail.', true],
    ['te-veel', 'Je bericht is niet verstuurd. Er zijn in korte tijd veel berichten verstuurd. Probeer het over een minuut nog eens, of stuur Carien een WhatsApp of mail.', true],
    ['te-snel', 'Je bericht is niet verstuurd. Dat ging sneller dan we verwachten. Wacht een paar tellen en verstuur het nog eens.', false],
  ]) {
    test(`reden=${reden}: eigen tekst op de plek van de foutmelding, melding en knop in beeld`, async ({ page }) => {
      await page.goto(`/contact?verzonden=fout&reden=${reden}#formulier`);
      const melding = page.locator('.formulier .melding.fout');
      await expect(melding).toHaveText(tekst);
      await expect(melding).toHaveAttribute('role', 'alert');
      await expect(melding.locator('a')).toHaveCount(links ? 2 : 0);
      if (links) await contactLinks(melding);
      await page.waitForTimeout(600);
      await meldingInBeeld(page);
      // op de plek van de bestaande foutmelding: direct boven de privacyzin
      expect(await melding.evaluate((m) => m.nextElementSibling.matches('.melding:not(.fout)'))).toBe(true);
    });
  }
});

test.describe('zonder JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('Turnstile uit: de <noscript>-regel staat er niet, een gewone POST komt aan (303 naar /bedankt)', async ({ page }, info) => {
    test.skip(info.project.name !== 'desktop' && info.project.name !== 'mobiel', 'desktop en mobiel zijn genoeg');
    await kop(page);
    await page.goto('/contact#formulier');
    await expect(page.locator('.noscript-melding')).toHaveCount(0);
    for (const [naam, waarde] of Object.entries(INVOER)) await page.locator(`[name="${naam}"]`).fill(waarde);
    await page.locator('button.verstuur').click();
    await expect(page).toHaveURL(/\/bedankt$/);
  });

  test('met testsite key: <noscript>-regel direct onder de kop van 002, vóór het eerste veld, 16 px, tikdoelen 44 px', async ({ page }, info) => {
    test.skip(info.project.name !== 'mobiel' && info.project.name !== 'iphone', 'op 390 px');
    await page.setExtraHTTPHeaders({ 'x-testturnstile': 'geslaagd' });
    await page.goto('/contact#formulier');
    const regel = page.locator('#formulier .noscript-melding');
    await expect(regel).toBeVisible();
    await expect(regel).toHaveText('Zonder JavaScript kan dit formulier je bericht niet versturen. Stuur Carien een WhatsApp, bel of mail haar, of zet JavaScript aan.');
    const m = await regel.evaluate((el) => {
      const kop = document.querySelector('#formulier .label').getBoundingClientRect();
      const veld = document.querySelector('#formulier select[name="onderwerp"]').getBoundingClientRect();
      const r = el.getBoundingClientRect();
      return { kop: kop.bottom, boven: r.top, onder: r.bottom, veld: veld.top, px: parseFloat(getComputedStyle(el).fontSize),
        links: [...el.querySelectorAll('a')].map((a) => [a.getAttribute('href'), a.getBoundingClientRect().height]),
        breed: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1 };
    });
    expect(m.boven, 'onder de kop van 002').toBeGreaterThanOrEqual(m.kop);
    expect(m.onder, 'vóór het eerste veld').toBeLessThanOrEqual(m.veld);
    expect(m.px).toBeGreaterThanOrEqual(16);
    expect(m.links.map((l) => l[0])).toEqual(['https://wa.me/31643791618', 'tel:+31643791618', 'mailto:info.LUXmini@gmail.com']);
    for (const [href, h] of m.links) expect(h, `tikdoel ${href}`).toBeGreaterThanOrEqual(44);
    expect(m.breed).toBe(false);
  });
});

// De zichtbare uitdaging (testsleutel "interactie") kan alleen met het echte script van Cloudflare. In CI draait deze test altijd;
// lokaal alleen als challenges.cloudflare.com bereikbaar is (in de bouwomgeving van de agents is dat niet zo).
async function cloudflareBereikbaar() {
  if (process.env.CI) return true;
  try { await fetch(`https://${TS_HOST}/turnstile/v0/api.js`, { signal: AbortSignal.timeout(3000) }); return true; } catch { return false; }
}
test.describe('zichtbare uitdaging (echt script, testsleutel interactie)', () => {
  for (const breedte of [390, 320]) {
    test(`${breedte} px: vak gecentreerd boven de knop, geen horizontaal scrollen, knop ≥ 44 px`, async ({ page }, info) => {
      test.skip(info.project.name !== 'mobiel' && info.project.name !== 'iphone', 'telefoonbreedtes');
      test.skip(!(await cloudflareBereikbaar()), 'challenges.cloudflare.com niet bereikbaar (alleen lokaal; in CI draait deze test altijd)');
      await page.setViewportSize({ width: breedte, height: 844 });
      await page.setExtraHTTPHeaders({ 'x-testturnstile': 'interactie' });
      await page.goto('/contact#formulier');
      const vak = page.locator('.turnstile-vak');
      await expect(vak).toHaveClass(/zichtbaar/, { timeout: 30000 });
      await vak.scrollIntoViewIfNeeded();
      // het iframe zit in een gesloten shadow root van Cloudflare: via de frames van de pagina (hulp.js)
      const iframe = await turnstileIframe(page);
      const m = await page.evaluate((iframeEl) => {
        const v = document.querySelector('.turnstile-vak').getBoundingClientRect();
        const i = iframeEl.getBoundingClientRect();
        const k = document.querySelector('.formulier button.verstuur').getBoundingClientRect();
        const p = document.querySelector('.formulier .melding:not(.fout)').getBoundingClientRect();
        return { midden: Math.abs((i.left + i.right) / 2 - (k.left + k.right) / 2), vakOnder: v.bottom, knopBoven: k.top, privacyOnder: p.bottom, vakBoven: v.top,
          links: i.left, rechts: i.right, knopHoogte: k.height, breed: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1, vw: innerWidth };
      }, iframe);
      expect(m.midden, 'vak gecentreerd boven de knop').toBeLessThanOrEqual(2);
      expect(m.vakOnder, 'vak boven de knop').toBeLessThanOrEqual(m.knopBoven);
      expect(m.vakBoven, 'vak onder de privacyzin').toBeGreaterThanOrEqual(m.privacyOnder);
      expect(m.links).toBeGreaterThanOrEqual(0);
      expect(m.rechts).toBeLessThanOrEqual(m.vw);
      expect(m.breed, 'niets scrolt horizontaal').toBe(false);
      expect(m.knopHoogte).toBeGreaterThanOrEqual(44);
      // tabvolgorde met zichtbaar vak: privacylink → vak (iframe) (op Chromium)
      if (info.project.name === 'mobiel') {
        await page.locator('.formulier .melding:not(.fout) a[href="privacy.html"]').focus();
        await page.keyboard.press('Tab');
        expect(await page.evaluate(() => !!document.activeElement.closest('.turnstile-vak'))).toBe(true);
      }
    });
  }
});
