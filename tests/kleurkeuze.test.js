// Brief 2026-11-14-kleurkeuze: hoofdkleur en tweede kleur bij Prematuurkleding, Babynest en Iets op maat laten maken.
// Alleen toegestane waarden; "Anders" via het vrije veld (max. 80 tekens, zonder regeleinden); tweede kleur alleen bij een hoofdkleur.
import test from 'node:test';
import assert from 'node:assert/strict';
import { controleer, bouwMail, KLEUREN, KLEUREN_TWEEDE } from '../src/formulier.js';

const geldig = { naam: 'Zoë de Vries', email: 'zoe@example.nl', telefoon: '', onderwerp: 'Prematuurkleding', bericht: 'Graag iets moois', website: '' };
const PREFIX = { Prematuurkleding: 'prem', Babynest: 'nest', 'Iets op maat laten maken': 'op' };
const LIJST = ['Naturel/wit', 'Oud roze', 'Bordeaux', 'Roest', 'Oker', 'Salie', 'Olijfgroen', 'Lichtblauw', 'Grijs'];
const kleurRegels = (velden) => controleer({ ...geldig, ...velden }).velden.extra.filter(([k]) => /kleur/i.test(k));
const leesTekst = (raw) => { const body = raw.split('\r\n\r\n')[1].replace(/\r\n/g, '');
  return new TextDecoder().decode(Uint8Array.from(atob(body), (c) => c.charCodeAt(0))); };
const mail = (velden) => bouwMail({ velden, afzender: 'website@luxmini.nl', ontvanger: 'info.luxmini@gmail.com', id: 'test' });

test('de lijst is precies de lijst van de brief (zonder "Weet ik nog niet"); "Geen" alleen bij de tweede kleur', () => {
  assert.deepEqual(KLEUREN, [...LIJST, 'anders']);
  assert.deepEqual(KLEUREN_TWEEDE, ['Geen', ...LIJST, 'anders']);
});

test('per onderwerp een toegestane hoofd- en tweede kleur in de mail', () => {
  for (const [onderwerp, p] of Object.entries(PREFIX)) {
    for (const kleur of LIJST) {
      const r = controleer({ ...geldig, onderwerp, [`${p}_kleur`]: kleur, [`${p}_kleur2`]: 'Oker' });
      assert.equal(r.ok, true);
      assert.deepEqual(r.velden.extra.filter(([k]) => /kleur/i.test(k)), [['Hoofdkleur', kleur], ['Tweede kleur', 'Oker']], `${onderwerp} ${kleur}`);
    }
    const tekst = leesTekst(mail(controleer({ ...geldig, onderwerp, [`${p}_kleur`]: 'Salie', [`${p}_kleur2`]: 'Naturel/wit' }).velden));
    assert.match(tekst, /\nHoofdkleur: Salie\n/);
    assert.match(tekst, /\nTweede kleur: Naturel\/wit\n/);
  }
});

test('"Weet ik nog niet" (leeg) geeft geen regel; onbekende waarden vallen weg', () => {
  for (const [onderwerp, p] of Object.entries(PREFIX)) {
    assert.deepEqual(kleurRegels({ onderwerp, [`${p}_kleur`]: '', [`${p}_kleur2`]: '' }), []);
    for (const w of ['Paars', 'salie', 'SALIE', 'Salie ', 'Geen', 'Weet ik nog niet', '<b>Salie</b>', 'Salie\r\nBcc: x@y.nl', 'anders', 'x'.repeat(500)]) {
      const regels = kleurRegels({ onderwerp, [`${p}_kleur`]: w });
      // "Salie " wordt door schoon() bijgesneden tot "Salie" en is dus toegestaan
      if (w === 'Salie ') assert.deepEqual(regels, [['Hoofdkleur', 'Salie']]);
      else assert.deepEqual(regels, [], `${onderwerp} hoofdkleur ${JSON.stringify(w)}`);
    }
    for (const w of ['Paars', 'geen', 'Weet ik nog niet', '<i>Oker</i>']) {
      assert.deepEqual(kleurRegels({ onderwerp, [`${p}_kleur`]: 'Bordeaux', [`${p}_kleur2`]: w }), [['Hoofdkleur', 'Bordeaux']], `${onderwerp} tweede ${JSON.stringify(w)}`);
    }
  }
});

test('"Geen" alleen bij de tweede kleur: "Tweede kleur: Geen"', () => {
  for (const [onderwerp, p] of Object.entries(PREFIX)) {
    assert.deepEqual(kleurRegels({ onderwerp, [`${p}_kleur`]: 'Roest', [`${p}_kleur2`]: 'Geen' }), [['Hoofdkleur', 'Roest'], ['Tweede kleur', 'Geen']]);
    assert.deepEqual(kleurRegels({ onderwerp, [`${p}_kleur`]: 'Geen' }), []);
  }
});

test('"Anders" met tekst geeft "Hoofdkleur anders: …" en "Tweede kleur anders: …"', () => {
  for (const [onderwerp, p] of Object.entries(PREFIX)) {
    assert.deepEqual(kleurRegels({ onderwerp, [`${p}_kleur`]: 'anders', [`${p}_kleur_anders`]: 'mintgroen', [`${p}_kleur2`]: 'anders', [`${p}_kleur2_anders`]: 'goud' }),
      [['Hoofdkleur anders', 'mintgroen'], ['Tweede kleur anders', 'goud']]);
    const tekst = leesTekst(mail(controleer({ ...geldig, onderwerp, [`${p}_kleur`]: 'anders', [`${p}_kleur_anders`]: 'petrol' }).velden));
    assert.match(tekst, /\nHoofdkleur anders: petrol\n/);
    assert.doesNotMatch(tekst, /\nHoofdkleur: /);
    // "Anders" zonder tekst: geen regel
    assert.deepEqual(kleurRegels({ onderwerp, [`${p}_kleur`]: 'anders', [`${p}_kleur_anders`]: '   ' }), []);
    // zonder keuze (zonder JS/zonder :has) telt het vrije veld wel
    assert.deepEqual(kleurRegels({ onderwerp, [`${p}_kleur_anders`]: 'petrol' }), [['Hoofdkleur anders', 'petrol']]);
  }
});

test('vrije tekst bij een vaste kleur valt weg', () => {
  for (const [onderwerp, p] of Object.entries(PREFIX)) {
    assert.deepEqual(kleurRegels({ onderwerp, [`${p}_kleur`]: 'Salie', [`${p}_kleur_anders`]: 'petrol', [`${p}_kleur2`]: 'Grijs', [`${p}_kleur2_anders`]: 'goud' }),
      [['Hoofdkleur', 'Salie'], ['Tweede kleur', 'Grijs']]);
    assert.deepEqual(kleurRegels({ onderwerp, [`${p}_kleur`]: 'Salie', [`${p}_kleur2`]: 'Geen', [`${p}_kleur2_anders`]: 'goud' }),
      [['Hoofdkleur', 'Salie'], ['Tweede kleur', 'Geen']]);
  }
});

test('het vrije veld: afgekapt op 80 tekens en zonder regeleinden', () => {
  const r = kleurRegels({ prem_kleur: 'anders', prem_kleur_anders: 'licht\r\nBcc: x@y.nl' + 'g'.repeat(500) });
  assert.equal(r.length, 1);
  assert.equal(r[0][0], 'Hoofdkleur anders');
  assert.equal(r[0][1].length, 80);
  assert.ok(!/[\r\n]/.test(r[0][1]));
  assert.ok(r[0][1].startsWith('licht Bcc: x@y.nl'));
  const t = kleurRegels({ prem_kleur: 'Salie', prem_kleur2: 'anders', prem_kleur2_anders: 'a\nb'.repeat(100) });
  assert.equal(t[1][1].length, 80);
  assert.ok(!/[\r\n]/.test(t[1][1]));
});

test('tweede kleur alleen als er een hoofdkleur is (vaste kleur of "Anders" met tekst)', () => {
  for (const [onderwerp, p] of Object.entries(PREFIX)) {
    // geen hoofdkleur: een oude waarde uit een verborgen Tweede kleur gaat niet mee
    assert.deepEqual(kleurRegels({ onderwerp, [`${p}_kleur`]: '', [`${p}_kleur2`]: 'Oker' }), [], onderwerp);
    assert.deepEqual(kleurRegels({ onderwerp, [`${p}_kleur2`]: 'Geen' }), [], onderwerp);
    assert.deepEqual(kleurRegels({ onderwerp, [`${p}_kleur`]: '', [`${p}_kleur2`]: 'anders', [`${p}_kleur2_anders`]: 'goud' }), [], onderwerp);
    assert.deepEqual(kleurRegels({ onderwerp, [`${p}_kleur`]: 'Paars', [`${p}_kleur2`]: 'Oker' }), [], `${onderwerp} onbekende hoofdkleur`);
    assert.deepEqual(kleurRegels({ onderwerp, [`${p}_kleur`]: 'anders', [`${p}_kleur_anders`]: '', [`${p}_kleur2`]: 'Oker' }), [], `${onderwerp} anders zonder tekst`);
    // wel een hoofdkleur
    assert.deepEqual(kleurRegels({ onderwerp, [`${p}_kleur`]: 'anders', [`${p}_kleur_anders`]: 'petrol', [`${p}_kleur2`]: 'Oker' }),
      [['Hoofdkleur anders', 'petrol'], ['Tweede kleur', 'Oker']]);
  }
});

test('kleurvelden van een ander onderwerp komen nooit mee; bij Kraamcadeaubox en Iets anders nooit een kleurregel', () => {
  const alle = {};
  for (const p of Object.values(PREFIX)) Object.assign(alle, { [`${p}_kleur`]: 'Salie', [`${p}_kleur2`]: 'Oker', [`${p}_kleur_anders`]: 'x', [`${p}_kleur2_anders`]: 'y' });
  for (const [onderwerp, p] of Object.entries(PREFIX)) {
    const velden = { ...alle, [`${p}_kleur`]: 'Bordeaux', [`${p}_kleur2`]: 'Grijs' };
    assert.deepEqual(kleurRegels({ onderwerp, ...velden }), [['Hoofdkleur', 'Bordeaux'], ['Tweede kleur', 'Grijs']], onderwerp);
    const anderen = Object.fromEntries(Object.entries(alle).filter(([k]) => !k.startsWith(`${p}_`)));
    assert.deepEqual(kleurRegels({ onderwerp, ...anderen }), [], `${onderwerp} met alleen kleurvelden van andere onderwerpen`);
  }
  for (const onderwerp of ['Kraamcadeaubox', 'Iets anders', 'hack']) {
    const r = controleer({ ...geldig, onderwerp, ...alle });
    assert.deepEqual(r.velden.extra.filter(([k]) => /kleur/i.test(k)), [], onderwerp);
    assert.doesNotMatch(leesTekst(mail(r.velden)), /kleur/i, onderwerp);
  }
});

test('Babynest: het stofveld heet in de mail "Stof"', () => {
  const r = controleer({ ...geldig, onderwerp: 'Babynest', nest_stof: 'wafelkatoen', nest_kleur: 'Salie' });
  assert.deepEqual(r.velden.extra, [['Stof', 'wafelkatoen'], ['Hoofdkleur', 'Salie']]);
  assert.match(leesTekst(mail(r.velden)), /\nStof: wafelkatoen\n/);
});
