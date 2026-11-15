// Brief 2026-11-15-instagram-pakje-schommelt: de twee uitsneden voor het schommelen van het broekje.
// Het origineel blijft bytegelijk; elke uitsnede is kleiner dan het origineel (px en bytes), samen hooguit 1,5 × het origineel;
// geen EXIF; het script en de polygonen staan buiten public/.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';

const IMG = new URL('../public/assets/img/', import.meta.url);
const lees = (naam) => readFileSync(new URL(naam, IMG));
const ORIGINEEL = 'ig-outfit-ladder.jpg';
const ACHTERGROND = 'ig-outfit-ladder-achtergrond.jpg';
const BROEKJE = 'ig-outfit-broekje.webp';

function jpegMaat(buf) {
  for (let i = 2; i < buf.length;) {
    if (buf[i] !== 0xff) throw new Error('geen JPEG-marker');
    const m = buf[i + 1], len = buf.readUInt16BE(i + 2);
    if (m >= 0xc0 && m <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(m)) return { h: buf.readUInt16BE(i + 5), w: buf.readUInt16BE(i + 7) };
    i += 2 + len;
  }
  throw new Error('geen SOF');
}
function jpegHeeftExif(buf) {
  for (let i = 2; i < buf.length;) {
    const m = buf[i + 1];
    if (m === 0xda) return false; // begin van de beelddata
    if (m === 0xe1 && buf.subarray(i + 4, i + 8).toString('latin1') === 'Exif') return true;
    i += 2 + buf.readUInt16BE(i + 2);
  }
  return false;
}
function webpInfo(buf) {
  assert.equal(buf.subarray(0, 4).toString('latin1'), 'RIFF');
  assert.equal(buf.subarray(8, 12).toString('latin1'), 'WEBP');
  const soort = buf.subarray(12, 16).toString('latin1');
  assert.equal(soort, 'VP8X', 'WebP met alfa heeft een VP8X-kop');
  const vlag = buf[20];
  return { w: 1 + buf.readUIntLE(24, 3), h: 1 + buf.readUIntLE(27, 3), alfa: !!(vlag & 0x10), exif: !!(vlag & 0x08) };
}

test('het origineel is onveranderd (zelfde bytes)', () => {
  const hash = createHash('sha256').update(lees(ORIGINEEL)).digest('hex');
  assert.equal(hash, '791393cc53e1c1269887d0b7f8e426e3b608b60c6a7d9d2c268ea856f15d8419');
});

test('twee uitsneden, elk kleiner dan het origineel in px en bytes, samen hooguit 1,5 × het origineel', () => {
  const o = lees(ORIGINEEL), a = lees(ACHTERGROND), b = lees(BROEKJE);
  const mo = jpegMaat(o), ma = jpegMaat(a), mb = webpInfo(b);
  assert.deepEqual(mo, { w: 480, h: 640 });
  for (const [naam, m, buf] of [[ACHTERGROND, ma, a], [BROEKJE, mb, b]]) {
    assert.ok(m.w < mo.w && m.h < mo.h, `${naam}: ${m.w} × ${m.h} is kleiner dan 480 × 640`);
    assert.ok(buf.length < o.length, `${naam}: ${buf.length} bytes < ${o.length}`);
  }
  assert.ok(a.length + b.length <= 1.5 * o.length, `samen ${a.length + b.length} bytes ≤ 1,5 × ${o.length}`);
  // beide lagen hebben dezelfde uitsnede (de CSS legt ze met dezelfde percentages over de foto)
  assert.deepEqual({ w: ma.w, h: ma.h }, { w: 384, h: 224 });
  assert.deepEqual({ w: mb.w, h: mb.h }, { w: 384, h: 224 });
  assert.equal(mb.alfa, true, 'het broekje heeft alfa');
});

test('geen EXIF in de nieuwe bestanden', () => {
  assert.equal(jpegHeeftExif(lees(ACHTERGROND)), false);
  assert.equal(webpInfo(lees(BROEKJE)).exif, false);
});

test('het script met de vaste polygonen staat buiten public/', () => {
  const script = new URL('../scripts/broekje-uitknippen.py', import.meta.url);
  assert.ok(existsSync(script));
  const tekst = readFileSync(script, 'utf8');
  for (const naam of ['LINKERPIJP', 'RECHTERPIJP', 'SCHADUW_LINKS', 'SCHADUW_RECHTS', 'UITSNEDE = (32, 400, 416, 624)', 'DRAAIPUNT_Y = 423']) {
    assert.ok(tekst.includes(naam), `${naam} staat in het script`);
  }
});

test('de CSS legt de lagen op de uitsnede van het script', () => {
  const css = readFileSync(new URL('../public/assets/css/style.css', import.meta.url), 'utf8');
  // x 32/480, y 400/640, 384/480, 224/640; draaipunt (423 − 400) / 224
  assert.match(css, /\.insta-foto \.insta-laag \{[^}]*left: 6\.6667%; top: 62\.5%; width: 80%; height: 35%;/);
  assert.match(css, /\.insta-foto \.insta-broekje \{ transform-origin: 50% 10\.2679%; \}/);
});
