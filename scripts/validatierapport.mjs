// Validatierapport voor GO / NO-GO (zie docs/kwaliteit.md).
// Bundelt alle gates van een pull request in één rapport dat Carst beoordeelt vóór productie.
//   node scripts/validatierapport.mjs            → rapport/validatierapport.md en .html
// Leest (alles optioneel): rapport/playwright.json, rapport/visueel.json, .lighthouseci/,
// de brief van de wijziging in docs/wijzigingen/ en omgevingsvariabelen uit GitHub Actions:
//   GATE1, GATE2, GATE4, GATE5 (success|failure|skipped), PR_NUMMER, PR_TITEL, BRANCH, SHA, PREVIEW_URL, RUN_URL
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { execSync } from 'node:child_process';

const E = process.env;
const leesJson = async p => { try { return JSON.parse(await readFile(p, 'utf8')); } catch { return null; } };
const sh = c => { try { return execSync(c, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); } catch { return ''; } };
const ICOON = { success: '✅', failure: '❌', cancelled: '⚠️', skipped: '➖', warn: '⚠️', onbekend: '❔' };
const STATUS = { success: 'groen', failure: 'rood', cancelled: 'afgebroken', skipped: 'niet gedraaid', warn: 'waarschuwing', onbekend: 'onbekend' };

// ---------- Playwright: tellen per bestand en per scherm ----------
function playwrightTellen(json) {
  if (!json) return null;
  const uit = { totaal: 0, goed: 0, fout: 0, wankel: 0, overgeslagen: 0, fouten: [], perBestand: {} };
  const loop = (suite, bestand) => {
    const f = suite.file || bestand;
    for (const spec of suite.specs || []) for (const t of spec.tests || []) {
      const b = (uit.perBestand[f] ||= { goed: 0, fout: 0 });
      uit.totaal++;
      if (t.status === 'skipped') { uit.overgeslagen++; continue; }
      if (t.status === 'expected') { uit.goed++; b.goed++; }
      else if (t.status === 'flaky') { uit.wankel++; uit.goed++; b.goed++; }
      else {
        uit.fout++; b.fout++;
        const r = (t.results || []).at(-1) || {};
        const melding = ((r.error && r.error.message) || '').replace(/\u001b\[[0-9;]*m/g, '').split('\n').filter(Boolean).slice(0, 3).join(' · ');
        uit.fouten.push(`[${t.projectName}] ${spec.title}: ${melding.slice(0, 300)}`);
      }
    }
    for (const s of suite.suites || []) loop(s, f);
  };
  for (const s of json.suites || []) loop(s, s.file);
  return uit;
}

// ---------- Lighthouse ----------
async function lighthouse() {
  const manifest = await leesJson('rapport/lighthouse/manifest.json');
  const asserties = (await leesJson('.lighthouseci/assertion-results.json')) || [];
  if (!manifest) return null;
  const rijen = [];
  for (const m of manifest.filter(x => x.isRepresentativeRun !== false)) { // bij meerdere metingen alleen de mediaan
    const lhr = (await leesJson(m.jsonPath)) || (await leesJson(`rapport/lighthouse/${m.jsonPath.split('/').pop()}`));
    const a = n => lhr && lhr.audits[n] ? lhr.audits[n].numericValue : null;
    const item = (n, i = 0) => { try { const it = lhr.audits[n].details.items; const x = it[i] && (it[i].node || (it[i].items && it[i].items[0] && it[i].items[0].node)); return x ? (x.selector || x.snippet || '').slice(0, 90) : ''; } catch { return ''; } };
    rijen.push({ pad: new URL(m.url).pathname, s: m.summary, lcp: a('largest-contentful-paint'), cls: a('cumulative-layout-shift'), kb: a('total-byte-weight'),
      lcpEl: lhr ? item('largest-contentful-paint-element') : '', clsEl: lhr ? item('layout-shift-elements') || item('layout-shifts') : '' });
  }
  const fout = asserties.filter(x => x.level === 'error' && !x.passed).map(x => `${new URL(x.url).pathname}: ${x.auditId} (${x.actual} ${x.operator} ${x.expected})`);
  const waarschuwing = asserties.filter(x => x.level === 'warn' && !x.passed).map(x => `${new URL(x.url).pathname}: ${x.auditId}`);
  return { rijen, fout, waarschuwing };
}

// ---------- AI-PDLC: brief en oordelen ----------
async function brief() {
  const basis = E.BASE_REF ? `origin/${E.BASE_REF}` : 'origin/main';
  let bestanden = sh(`git diff --name-only ${basis}...HEAD -- docs/wijzigingen`).split('\n').filter(f => f.endsWith('.md') && !f.endsWith('_sjabloon.md'));
  if (!bestanden.length) bestanden = (await readdir('docs/wijzigingen').catch(() => [])).filter(f => /^\d{4}-.*\.md$/.test(f)).sort().slice(-1).map(f => `docs/wijzigingen/${f}`);
  const uit = [];
  for (const f of bestanden) {
    const t = await readFile(f, 'utf8').catch(() => '');
    const titel = (t.match(/^#\s+(.+)$/m) || [, f])[1];
    const rijen = t.split('\n').filter(r => /^\|/.test(r) && !/^\|\s*-/.test(r)).map(r => r.split('|').slice(1, -1).map(c => c.trim()));
    const laatste = woord => [...rijen].reverse().find(r => r[0] && r[0].toLowerCase().includes(woord) && r[2]);
    uit.push({ bestand: f, titel, controleur: laatste('controle'), ontwerp: laatste('ontwerpgate') });
  }
  return uit;
}
const oordeel = rij => {
  if (!rij) return { tekst: 'nog niet uitgevoerd', ok: false };
  const t = rij[2];
  const ok = (/\bAKKOORD\b/.test(t) && !/NIET AKKOORD/.test(t)) || /\bn\.v\.t\./i.test(t);
  return { tekst: t.length > 220 ? t.slice(0, 220) + '…' : t, ok };
};

// ---------- Open punten in de site ----------
async function openPunten() {
  const punten = [];
  for (const f of (await readdir('public')).filter(f => f.endsWith('.html'))) {
    const t = await readFile(`public/${f}`, 'utf8');
    for (const m of t.matchAll(/<!--\s*LET OP:?([\s\S]*?)-->/g)) punten.push(`${f}: ${m[1].replace(/\s+/g, ' ').trim().slice(0, 160)}`);
    if (t.includes('[nummer]')) punten.push(`${f}: KvK-nummer nog [nummer]`);
  }
  return [...new Set(punten)];
}

// ---------- Rapport ----------
const e2e = playwrightTellen(await leesJson('rapport/playwright.json'));
const vis = playwrightTellen(await leesJson('rapport/visueel.json'));
const lh = await lighthouse();
const briefs = await brief();
const open = await openPunten();

const gate = (naam, waarde, toelichting, blokkerend = true) => ({ naam, status: waarde || 'onbekend', toelichting, blokkerend });
const gates = [
  gate('Gate 1 · Tests (formulier + Cloudflare-configuratie)', E.GATE1, 'npm test en wrangler dry-run'),
  gate('Gate 2 · Sitecontrole', E.GATE2, 'scripts/controleer.py: links, foto’s, interacties, pagina’s'),
  gate('Gate 4 · Kwaliteit', E.GATE4 || (e2e ? (e2e.fout ? 'failure' : 'success') : undefined),
    e2e ? `${e2e.goed} van ${e2e.totaal - e2e.overgeslagen} tests groen${e2e.wankel ? ` (${e2e.wankel} pas bij herhaling)` : ''}; Lighthouse ${lh ? (lh.fout.length ? `${lh.fout.length} grens(en) overschreden` : 'binnen alle grenzen') : 'niet gemeten'}` : 'toegankelijkheid, SEO, veiligheid, kernpaden, snelheid'),
  gate('Gate 5 · Visuele vergelijking', vis ? (vis.fout ? 'warn' : 'success') : (E.GATE5 || 'onbekend'),
    vis ? (vis.fout ? `${vis.fout} scherm(en) wijken af van de basis: bekijk ze in het artefact "visueel"` : 'geen verschil met de goedgekeurde basis') : 'niet gedraaid', false),
];
const pdlc = briefs.map(b => ({ b, c: oordeel(b.controleur), o: oordeel(b.ontwerp) }));
const blokkerendRood = gates.filter(g => g.blokkerend && g.status !== 'success');
const pdlcOpen = pdlc.filter(p => !p.c.ok || !p.o.ok);
const advies = blokkerendRood.length || !pdlc.length || pdlcOpen.length ? 'NO-GO' : 'GO';

const md = [];
md.push(`# Validatierapport LUX mini${E.PR_NUMMER ? ` · PR #${E.PR_NUMMER}` : ''}`);
md.push('');
md.push(`**Wijziging:** ${E.PR_TITEL || briefs.map(b => b.titel).join(', ') || '-'}  `);
md.push(`**Branch / versie:** \`${E.BRANCH || sh('git rev-parse --abbrev-ref HEAD')}\` · \`${(E.SHA || sh('git rev-parse HEAD')).slice(0, 7)}\`  `);
md.push(`**Gemaakt:** ${new Date().toLocaleString('nl-NL', { timeZone: 'Europe/Amsterdam' })}  `);
if (E.PREVIEW_URL) md.push(`**Preview (Cloudflare):** ${E.PREVIEW_URL}  `);
if (E.RUN_URL) md.push(`**Alle details en artefacten:** ${E.RUN_URL}`);
md.push('');
md.push(`## Advies: ${advies === 'GO' ? '🟢 GO' : '🔴 NO-GO'}`);
md.push('');
md.push(advies === 'GO'
  ? 'Alle blokkerende controles zijn groen en de controleur en ontwerper gaven akkoord. Het besluit is aan jou: bekijk de preview en de punten hieronder.'
  : 'Nog niet klaar voor productie: ' + [
      ...blokkerendRood.map(g => `${g.naam} is ${STATUS[g.status] || g.status}`),
      ...(pdlc.length ? pdlcOpen.map(p => `brief "${p.b.titel}": ${!p.c.ok ? 'controleur' : ''}${!p.c.ok && !p.o.ok ? ' en ' : ''}${!p.o.ok ? 'ontwerpgate' : ''} nog zonder akkoord`) : ['geen brief gevonden']),
    ].join('; ') + '.');
md.push('');
md.push('## 1. Automatische controles');
md.push('');
md.push('| Controle | Uitkomst | Blokkerend | Toelichting |');
md.push('|---|---|---|---|');
for (const g of gates) md.push(`| ${g.naam} | ${ICOON[g.status] || '❔'} ${STATUS[g.status] || g.status} | ${g.blokkerend ? 'ja' : 'nee'} | ${g.toelichting} |`);
md.push('');
if (e2e) {
  md.push('**Kwaliteit per onderwerp** (Playwright, desktop 1440 · tablet 768 · mobiel 390):');
  md.push('');
  const NAMEN = { 'toegankelijkheid.spec.js': 'Toegankelijkheid (WCAG 2.1 AA, axe)', 'seo-veiligheid.spec.js': 'SEO, beveiligingsheaders, links, sitemap', 'kernpaden.spec.js': 'Kernpaden (navigatie, contact, prijzen, geen fouten, mobiel)' };
  for (const [f, b] of Object.entries(e2e.perBestand)) md.push(`- ${b.fout ? '❌' : '✅'} ${NAMEN[f] || f}: ${b.goed} groen${b.fout ? `, **${b.fout} fout**` : ''}`);
  if (e2e.fouten.length) { md.push(''); md.push('<details><summary>Gevonden fouten</summary>'); md.push(''); for (const f of e2e.fouten.slice(0, 30)) md.push(`- ${f}`); md.push(''); md.push('</details>'); }
  md.push('');
}
if (lh) {
  md.push('**Snelheid en kwaliteit** (Lighthouse, mobiel, trage 4G):');
  md.push('');
  md.push('| Pagina | Snelheid | Toegankelijk | Best practices | SEO | LCP | CLS | Gewicht |');
  md.push('|---|---|---|---|---|---|---|---|');
  const pct = v => v == null ? '-' : Math.round(v * 100);
  for (const r of lh.rijen) md.push(`| ${r.pad} | ${pct(r.s.performance)} | ${pct(r.s.accessibility)} | ${pct(r.s['best-practices'])} | ${pct(r.s.seo)} | ${r.lcp == null ? '-' : (r.lcp / 1000).toFixed(1) + ' s'} | ${r.cls == null ? '-' : r.cls.toFixed(3)} | ${r.kb == null ? '-' : Math.round(r.kb / 1024) + ' kB'} |`);
  md.push('');
  const details = lh.rijen.filter(r => r.lcpEl || r.clsEl);
  if (details.length) { md.push(''); md.push('<details><summary>Grootste element (LCP) en verspringen (CLS) per pagina</summary>'); md.push(''); for (const r of details) md.push(`- ${r.pad}: LCP \`${r.lcpEl || '-'}\`; verspringt het meest: \`${r.clsEl || '-'}\``); md.push(''); md.push('</details>'); md.push(''); }
  md.push('Grenzen: snelheid ≥ 70, toegankelijk ≥ 95, best practices ≥ 90, SEO ≥ 90, LCP ≤ 4,0 s, CLS ≤ 0,1, gewicht ≤ 3,5 MB per pagina.');
  if (lh.fout.length) { md.push(''); for (const f of lh.fout) md.push(`- ❌ ${f}`); }
  if (lh.waarschuwing.length) { md.push(''); md.push(`Waarschuwingen: ${lh.waarschuwing.join('; ')}`); }
  md.push('');
}
md.push('## 2. AI-PDLC: onafhankelijke controle en ontwerpgate');
md.push('');
if (!pdlc.length) md.push('❔ Geen brief gevonden in `docs/wijzigingen/`.');
for (const p of pdlc) {
  md.push(`**${p.b.titel}** (\`${p.b.bestand}\`)`);
  md.push(`- ${p.c.ok ? '✅' : '❌'} Controleur: ${p.c.tekst}`);
  md.push(`- ${p.o.ok ? '✅' : '❌'} Ontwerpgate: ${p.o.tekst}`);
  md.push('');
}
md.push('## 3. Wacht nog op Carien of Carst');
md.push('');
md.push(open.length ? 'Deze punten staan in de site gemarkeerd. Ze houden een release niet tegen, maar beslis bewust of ze zo live mogen:' : 'Geen gemarkeerde open punten.');
md.push('');
for (const p of open.slice(0, 40)) md.push(`- [ ] ${p}`);
md.push('');
md.push('## 4. Jouw controle op de preview');
md.push('');
for (const c of [
  'Op je telefoon: menu, kraamcadeaubox, prijzen en contact werken en lezen prettig',
  'Op je laptop: navigatie, kleuren bij aanwijzen en de intro voelen goed',
  'Teksten kloppen en Carien kan zich erin vinden (geen verzonnen feiten)',
  'Prijzen kloppen: € 35, € 50, € 65 en € 80',
  'WhatsApp-, bel- en maillink openen de juiste gegevens',
  'Visuele verschillen (Gate 5) zijn bedoeld',
]) md.push(`- [ ] ${c}`);
md.push('');
md.push('## 5. Jouw besluit');
md.push('');
md.push('- **GO:** zet het label **`GO`** op deze pull request. De verplichte controle "GO · Akkoord Carst" wordt groen; daarna kun jij mergen (of Claude op jouw uitdrukkelijke verzoek). Cloudflare zet live, de rooktest controleert.');
md.push('- **NO-GO:** zet geen label en schrijf in een reactie wat er anders moet. Elke nieuwe commit haalt een eerder `GO` automatisch weg, zodat je altijd de laatste versie goedkeurt.');
md.push('');

await mkdir('rapport', { recursive: true });
const tekst = md.join('\n');
await writeFile('rapport/validatierapport.md', tekst);
await writeFile('rapport/advies.txt', advies);

// Eenvoudige HTML-versie (om te openen of te printen)
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const inline = s => esc(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/`(.+?)`/g, '<code>$1</code>').replace(/(https?:\/\/[^\s<)]+)/g, '<a href="$1">$1</a>');
let html = '', inTabel = false, inLijst = false;
for (const r of tekst.split('\n')) {
  if (/^\|/.test(r)) {
    if (/^\|---/.test(r)) continue;
    const cellen = r.split('|').slice(1, -1).map(c => c.trim());
    if (!inTabel) { html += '<table><tr>' + cellen.map(c => `<th>${inline(c)}</th>`).join('') + '</tr>'; inTabel = true; continue; }
    html += '<tr>' + cellen.map(c => `<td>${inline(c)}</td>`).join('') + '</tr>'; continue;
  }
  if (inTabel) { html += '</table>'; inTabel = false; }
  if (/^- /.test(r)) { if (!inLijst) { html += '<ul>'; inLijst = true; } html += `<li>${inline(r.slice(2).replace(/^\[ \] /, '☐ '))}</li>`; continue; }
  if (inLijst) { html += '</ul>'; inLijst = false; }
  if (/^# /.test(r)) html += `<h1>${inline(r.slice(2))}</h1>`;
  else if (/^## /.test(r)) html += `<h2>${inline(r.slice(3))}</h2>`;
  else if (/^<\/?details|^<summary/.test(r)) html += r;
  else if (r.trim()) html += `<p>${inline(r.replace(/\s+$/, ''))}</p>`;
}
if (inTabel) html += '</table>'; if (inLijst) html += '</ul>';
await writeFile('rapport/validatierapport.html', `<!doctype html><html lang="nl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Validatierapport LUX mini</title>
<style>body{font:16px/1.55 system-ui,sans-serif;color:#202020;max-width:960px;margin:40px auto;padding:0 16px}h1{font-family:Georgia,serif;font-weight:400}h2{font-family:Georgia,serif;font-weight:400;border-top:1px solid #ddd;padding-top:16px;margin-top:32px}table{border-collapse:collapse;width:100%;font-size:14px}th,td{border-bottom:1px solid #e5e5e5;padding:6px 8px;text-align:left;vertical-align:top}code{background:#f4f1ee;padding:1px 4px;border-radius:4px}a{color:#8a5a3c}</style></head><body>${html}</body></html>`);
console.log(tekst);
console.log(`\nAdvies: ${advies}`);
