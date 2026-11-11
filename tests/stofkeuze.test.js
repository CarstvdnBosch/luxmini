// Brief 2026-11-11-c7-stofkeuze: eigen stof met foto (bijlage) en/of link. Foto alleen bij thema = eigen stof,
// type en eerste bytes gecontroleerd, max. 5 MB, bestandsnaam opgeschoond, niets opgeslagen of gelogd.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { controleer, controleerFoto, controleerLink, fotoType, schoneNaam, bouwMail, FOTO_MAX, EIGEN_STOF } from '../src/formulier.js';
import { verwerkContact } from '../src/contact.js';

// een echt PNG-plaatje van 1 × 1 pixel (verzonnen, geen foto van iemand)
const PNG = Uint8Array.from(Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64'));
const met = (kop, lengte = 32) => { const b = new Uint8Array(lengte); b.set(kop); return b; };
const JPEG = met([0xff, 0xd8, 0xff, 0xe0]);
const WEBP = met([...Buffer.from('RIFF'), 0, 0, 0, 0, ...Buffer.from('WEBPVP8 ')]);
const heic = (merk) => met([0, 0, 0, 24, ...Buffer.from('ftyp' + merk)]);
// ftyp-box zoals in echte HEIC/AVIF-bestanden: grootte, 'ftyp', hoofdmerk, versie 0 en de compatibele merken
const ftyp = (hoofd, merken) => { const n = 16 + 4 * merken.length; return met([0, 0, 0, n, ...Buffer.from('ftyp' + hoofd), 0, 0, 0, 0, ...Buffer.from(merken.join(''))], Math.max(32, n + 8)); };
const bestand = (bytes, naam, type) => new File([bytes], naam, { type });

const geldig = { naam: 'Zoë de Vries', email: 'zoe@example.nl', telefoon: '', onderwerp: 'Kraamcadeaubox', bericht: 'Graag een box', website: '' };
const formulier = (velden, foto) => { const f = new FormData(); for (const [k, v] of Object.entries(velden)) f.append(k, v); if (foto) f.append('stof_foto', foto); return f; };
const post = (velden, foto) => new Request('https://luxmini.nl/api/contact', { method: 'POST', body: formulier(velden, foto) });
const doel = (res) => { const u = new URL(res.headers.get('location')); return u.pathname + u.search + u.hash; };
async function metLog(fn) {
  const regels = [], warn = console.warn, error = console.error, log = console.log;
  console.warn = console.error = console.log = (...a) => regels.push(a.join(' '));
  try { return { uit: await fn(), regels }; } finally { console.warn = warn; console.error = error; console.log = log; }
}

/* ---------- eerste bytes, type en grootte ---------- */
test('fotoType: mif1 alleen met een heic-merk is HEIC; AVIF (mif1 + avif, of hoofdmerk avif) wordt geweigerd', () => {
  assert.equal(fotoType(ftyp('mif1', ['mif1', 'heic'])), 'image/heic');
  assert.equal(fotoType(ftyp('msf1', ['msf1', 'heix'])), 'image/heic');
  assert.equal(fotoType(ftyp('heic', ['mif1', 'heic'])), 'image/heic');
  assert.equal(fotoType(ftyp('mif1', ['mif1', 'avif', 'miaf'])), null);
  assert.equal(fotoType(ftyp('avif', ['avif', 'mif1', 'miaf'])), null);
  assert.equal(fotoType(ftyp('mif1', ['mif1'])), null);
});

test('controleerFoto: AVIF met type image/heic of leeg type wordt geweigerd', async () => {
  const avif = ftyp('mif1', ['mif1', 'avif', 'miaf']);
  assert.equal((await controleerFoto(bestand(avif, 'stof.heic', 'image/heic'))).ok, false);
  assert.equal((await controleerFoto(bestand(avif, 'stof.avif', ''))).ok, false);
  assert.equal((await controleerFoto(bestand(avif, 'stof.avif', 'image/avif'))).ok, false);
});

test('controleerLink weigert gebruikersgegevens in de link', () => {
  for (const l of ['https://naam:geheim@stof.nl/x', 'https://naam@stof.nl', 'https://:geheim@stof.nl', 'https://stof.nl@kwaad.nl/']) {
    assert.equal(controleerLink(l).ok, false, l);
  }
  assert.equal(controleerLink('https://stof.nl/stoffen?kleur=mint&a=b@c').ok, true);
});

test('te groot verzoek (Content-Length > 6 MB) → reden=foto, zonder het formulier te lezen', async () => {
  let gelezen = false, verstuurd = false;
  const req = new Request('https://luxmini.nl/api/contact', { method: 'POST', headers: { 'content-length': String(6 * 1024 * 1024 + 1), 'content-type': 'multipart/form-data; boundary=x' }, body: 'x' });
  Object.defineProperty(req, 'formData', { value: async () => { gelezen = true; return new FormData(); } });
  const { uit, regels } = await metLog(() => verwerkContact(req, async () => { verstuurd = true; }));
  assert.equal(doel(uit), '/contact?verzonden=fout&reden=foto#formulier');
  assert.equal(gelezen, false);
  assert.equal(verstuurd, false);
  assert.ok(regels.every((r) => r === 'Formulier ongeldig: foto'));
});

test('Content-Length tot 6 MB gaat gewoon door de controle', async () => {
  let verstuurd = false;
  const req = post({ ...geldig, box_thema: EIGEN_STOF }, bestand(PNG, 'stof.png', 'image/png'));
  const res = await verwerkContact(req, async () => { verstuurd = true; });
  assert.equal(doel(res), '/bedankt');
  assert.equal(verstuurd, true);
});
test('fotoType herkent JPEG, PNG, WEBP en HEIC aan de eerste bytes', () => {
  assert.equal(fotoType(JPEG), 'image/jpeg');
  assert.equal(fotoType(PNG), 'image/png');
  assert.equal(fotoType(WEBP), 'image/webp');
  for (const m of ['heic', 'heix']) assert.equal(fotoType(heic(m)), 'image/heic', m);
  for (const b of [met([...Buffer.from('%PDF-1.7')]), met([...Buffer.from('GIF89a')]), heic('avif'), met([...Buffer.from('RIFF'), 0, 0, 0, 0, ...Buffer.from('WAVE')]), new Uint8Array(4), null]) {
    assert.equal(fotoType(b), null);
  }
});

test('controleerFoto: geldige foto → naam, type en bytes; zonder foto → null', async () => {
  const r = await controleerFoto(bestand(PNG, 'Mijn stof.png', 'image/png'));
  assert.equal(r.ok, true);
  assert.deepEqual([r.foto.naam, r.foto.type, r.foto.bytes.length], ['mijn-stof.png', 'image/png', PNG.length]);
  assert.deepEqual(await controleerFoto(null), { ok: true, foto: null });
  assert.deepEqual(await controleerFoto(''), { ok: true, foto: null });
  assert.deepEqual(await controleerFoto(bestand(new Uint8Array(0), '', 'application/octet-stream')), { ok: true, foto: null }); // leeg bestandsveld (zonder JS)
  // HEIC zonder type (sommige systemen) mag, de eerste bytes beslissen
  assert.equal((await controleerFoto(bestand(heic('heic'), 'IMG_1234.HEIC', ''))).foto.type, 'image/heic');
});

test('controleerFoto weigert: te groot, verkeerd opgegeven type, of eerste bytes die geen foto zijn', async () => {
  const groot = new Uint8Array(FOTO_MAX + 1); groot.set(PNG);
  assert.equal((await controleerFoto(bestand(groot, 'groot.png', 'image/png'))).ok, false);
  const precies = new Uint8Array(FOTO_MAX); precies.set(PNG);
  assert.equal((await controleerFoto(bestand(precies, 'precies.png', 'image/png'))).ok, true, 'precies 5 MB mag');
  assert.equal((await controleerFoto(bestand(PNG, 'stof.gif', 'image/gif'))).ok, false);
  assert.equal((await controleerFoto(bestand(met([...Buffer.from('%PDF-1.7')]), 'stof.jpg', 'image/jpeg'))).ok, false, 'PDF met .jpg-naam');
  assert.equal((await controleerFoto(bestand(met([...Buffer.from('<script>')]), 'stof.png', 'image/png'))).ok, false);
});

test('schoneNaam: geen map, geen vreemde tekens, juiste extensie', () => {
  assert.equal(schoneNaam('C:\\fakepath\\Stof Één (1).JPG', 'image/jpeg'), 'stof-een-1.jpg');
  assert.equal(schoneNaam('../../etc/passwd', 'image/png'), 'passwd.png');
  assert.equal(schoneNaam('a"\r\nContent-Type: x.png', 'image/png'), 'a-content-type-x.png');
  assert.equal(schoneNaam('', 'image/webp'), 'stof.webp');
  assert.equal(schoneNaam('foto.pdf', 'image/heic'), 'foto.heic');
  assert.ok(schoneNaam('x'.repeat(500), 'image/jpeg').length <= 64);
});

/* ---------- link ---------- */
test('controleerLink: alleen https://, max. 300 tekens, zonder regeleinden', () => {
  assert.deepEqual(controleerLink(''), { ok: true, link: '' });
  assert.deepEqual(controleerLink(' https://www.stoffenwinkel.test/giraf?kleur=oker '), { ok: true, link: 'https://www.stoffenwinkel.test/giraf?kleur=oker' });
  for (const l of ['http://stof.test', 'www.stof.test', 'javascript:alert(1)', 'https://stof.test/a\r\nBcc: x@y.nl', 'https://stof.test/' + 'a'.repeat(300), 'https://', 'https://localhost', 'https://stof.test/<b>', 'ftp://stof.test']) {
    assert.equal(controleerLink(l).ok, false, JSON.stringify(l));
  }
});

test('link komt alleen bij thema eigen stof als platte tekst in de mail; ongeldig → stofFouten', () => {
  const eigen = controleer({ ...geldig, box_thema: EIGEN_STOF, stof_link: 'https://stof.test/vos' });
  assert.deepEqual(eigen.velden.extra, [['Thema', EIGEN_STOF], ['Link naar de stof', 'https://stof.test/vos']]);
  assert.deepEqual(eigen.stofFouten, []);
  const ander = controleer({ ...geldig, box_thema: 'Giraf', stof_link: 'https://stof.test/vos' });
  assert.deepEqual(ander.velden.extra, [['Thema', 'Giraf']]);
  assert.deepEqual(controleer({ ...geldig, box_thema: 'Giraf', stof_link: 'geen link' }).stofFouten, [], 'bij een ander thema telt de link niet');
  assert.deepEqual(controleer({ ...geldig, box_thema: EIGEN_STOF, stof_link: 'http://stof.test' }).stofFouten, ['link']);
  assert.deepEqual(controleer({ ...geldig, onderwerp: 'Babynest', box_thema: EIGEN_STOF, stof_link: 'kapot' }).stofFouten, [], 'ander onderwerp');
});

/* ---------- mail ---------- */
const MAIL = { afzender: 'website@luxmini.nl', ontvanger: 'info.luxmini@gmail.com', id: 'test-1', nu: new Date('2026-11-11T12:00:00Z') };
const tekstUit = (b64) => new TextDecoder().decode(Uint8Array.from(atob(b64.replace(/\r\n/g, '')), (c) => c.charCodeAt(0)));

test('mail zonder foto blijft precies zoals hij was (text/plain, geen multipart)', () => {
  const { velden } = controleer(geldig);
  const zonder = bouwMail({ velden, ...MAIL });
  assert.equal(bouwMail({ velden, foto: null, ...MAIL }), zonder);
  assert.match(zonder, /\r\nMIME-Version: 1\.0\r\nContent-Type: text\/plain; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n/);
  assert.doesNotMatch(zonder, /multipart|Content-Disposition|Foto van de stof/);
});

test('mail met foto: multipart/mixed met dezelfde tekst en de foto als base64-bijlage (regels van 76)', () => {
  const { velden } = controleer({ ...geldig, box_thema: EIGEN_STOF });
  const foto = { naam: 'mijn-stof.png', type: 'image/png', bytes: PNG };
  const raw = bouwMail({ velden, foto, ...MAIL });
  const [koppen, ...rest] = raw.split('\r\n\r\n');
  assert.match(koppen, /\r\nMIME-Version: 1\.0\r\nContent-Type: multipart\/mixed; boundary="=_luxmini_test1"$/);
  assert.match(koppen, /^From: .+\r\nTo: <info\.luxmini@gmail\.com>\r\nReply-To: <zoe@example\.nl>\r\n/);
  const lijf = rest.join('\r\n\r\n');
  const delen = lijf.split('--=_luxmini_test1');
  assert.equal(delen.length, 4, 'tekst, bijlage en het einde');
  assert.equal(delen[3], '--\r\n');
  const [tekstKop, tekstB64] = delen[1].replace(/^\r\n/, '').split('\r\n\r\n');
  assert.equal(tekstKop, 'Content-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: base64');
  const tekst = tekstUit(tekstB64.trim());
  assert.match(tekst, /Thema: Een eigen stof of kleur\nFoto van de stof: bijlage \(mijn-stof\.png\)\n\nBericht:\nGraag een box\n$/);
  const [bijlageKop, bijlageB64] = delen[2].replace(/^\r\n/, '').split('\r\n\r\n');
  assert.equal(bijlageKop, 'Content-Type: image/png; name="mijn-stof.png"\r\nContent-Disposition: attachment; filename="mijn-stof.png"\r\nContent-Transfer-Encoding: base64');
  for (const r of bijlageB64.trim().split('\r\n')) assert.ok(r.length <= 76, 'base64-regel langer dan 76');
  assert.deepEqual(Buffer.from(bijlageB64.replace(/\r\n/g, ''), 'base64'), Buffer.from(PNG));
  for (const r of raw.split('\r\n')) assert.ok(r.length <= 998, 'mailregel te lang');
});

test('mail met een foto van 5 MB: bijlage klopt en blijft ruim binnen de 25 MB van Cloudflare', () => {
  const bytes = new Uint8Array(FOTO_MAX); bytes.set(JPEG); for (let i = 32; i < bytes.length; i++) bytes[i] = i % 251;
  const { velden } = controleer({ ...geldig, box_thema: EIGEN_STOF });
  const raw = bouwMail({ velden, foto: { naam: 'groot.jpg', type: 'image/jpeg', bytes }, ...MAIL });
  assert.ok(raw.length < 8 * 1024 * 1024, `mail is ${raw.length} tekens`);
  const b64 = raw.split('filename="groot.jpg"\r\nContent-Transfer-Encoding: base64\r\n\r\n')[1].split('\r\n--')[0];
  assert.deepEqual(Buffer.from(b64.replace(/\r\n/g, ''), 'base64'), Buffer.from(bytes));
});

/* ---------- afhandeling (src/contact.js) ---------- */
test('foto bij thema eigen stof gaat mee naar het versturen', async () => {
  let mee;
  const res = await verwerkContact(post({ ...geldig, box_thema: EIGEN_STOF, stof_link: 'https://stof.test/a' }, bestand(PNG, 'stof.png', 'image/png')), async (v, f) => { mee = [v, f]; });
  assert.equal(doel(res), '/bedankt');
  assert.equal(mee[1].naam, 'stof.png');
  assert.equal(mee[1].type, 'image/png');
  assert.deepEqual(mee[0].extra.at(-1), ['Link naar de stof', 'https://stof.test/a']);
});

test('geen bijlage bij een ander thema of ander onderwerp (ook niet als er een foto meekomt)', async () => {
  for (const velden of [{ ...geldig, box_thema: 'Giraf' }, { ...geldig, box_thema: '' }, { ...geldig, onderwerp: 'Babynest', box_thema: EIGEN_STOF }]) {
    let foto = 'niet aangeroepen';
    const res = await verwerkContact(post(velden, bestand(met([...Buffer.from('%PDF')]), 'x.pdf', 'application/pdf')), async (v, f) => { foto = f; });
    assert.equal(doel(res), '/bedankt', JSON.stringify(velden));
    assert.equal(foto, null);
  }
});

test('ongeldige foto → reden=foto, ongeldige link → reden=link; log zonder naam of inhoud', async () => {
  const geheim = 'geheime-naam-van-de-bezoeker';
  let verstuurd = false;
  const fout = await metLog(() => verwerkContact(post({ ...geldig, box_thema: EIGEN_STOF }, bestand(met([...Buffer.from('%PDF-1.7')]), `${geheim}.jpg`, 'image/jpeg')), async () => { verstuurd = true; }));
  assert.equal(doel(fout.uit), '/contact?verzonden=fout&reden=foto#formulier');
  assert.deepEqual(fout.regels, ['Formulier ongeldig: foto']);
  const groot = new Uint8Array(FOTO_MAX + 10); groot.set(PNG);
  const teGroot = await metLog(() => verwerkContact(post({ ...geldig, box_thema: EIGEN_STOF }, bestand(groot, `${geheim}.png`, 'image/png')), async () => { verstuurd = true; }));
  assert.equal(doel(teGroot.uit), '/contact?verzonden=fout&reden=foto#formulier');
  const link = await metLog(() => verwerkContact(post({ ...geldig, box_thema: EIGEN_STOF, stof_link: `http://${geheim}.test` }), async () => { verstuurd = true; }));
  assert.equal(doel(link.uit), '/contact?verzonden=fout&reden=link#formulier');
  assert.deepEqual(link.regels, ['Formulier ongeldig: link']);
  assert.equal(verstuurd, false);
  for (const r of [...fout.regels, ...teGroot.regels, ...link.regels]) assert.ok(!r.includes(geheim));
});

test('ongeldige invoer gaat voor een foutieve foto (de gewone melding)', async () => {
  const res = await verwerkContact(post({ ...geldig, naam: '', box_thema: EIGEN_STOF }, bestand(met([...Buffer.from('%PDF')]), 'x.jpg', 'image/jpeg')), async () => {});
  assert.equal(doel(res), '/contact?verzonden=fout#formulier');
});

test('de Worker slaat niets op: geen KV, R2, D1 of logs van de foto in de formuliercode', () => {
  const lees = (p) => readFileSync(new URL('../' + p, import.meta.url), 'utf8');
  for (const f of ['src/formulier.js', 'src/contact.js']) {
    const code = lees(f);
    assert.doesNotMatch(code, /\.put\(|\.prepare\(|BEHEER_DB|R2|KV|caches\./, `${f} slaat iets op`);
    for (const r of code.split('\n').filter((r) => /console\./.test(r))) assert.doesNotMatch(r, /foto\.|bestand|naam|bytes/, `${f} logt iets van de foto: ${r.trim()}`);
  }
  const worker = lees('src/worker.js');
  assert.match(worker, /bouwMail\(\{ velden, foto,/);
  assert.ok(readdirSync(new URL('../src', import.meta.url)).length > 0);
});
