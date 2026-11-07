// Tests voor .github/workflows/go-nogo.yml: de echte run-scripts uit de workflow draaien hier met bash,
// met een nep-gh (voorbeeld-JSON per API-pad) en de echte jq. Zo is te zien welke status en welk label
// de workflow zou zetten, zonder GitHub. Vereist bash en jq (staan op de GitHub-runner).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdtempSync, chmodSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const YAML = readFileSync(new URL('../.github/workflows/go-nogo.yml', import.meta.url), 'utf8');

// Het run-blok (block scalar "run: |") van een job uit de workflow halen.
function runScript(job) {
  const regels = YAML.split('\n');
  let i = regels.findIndex(r => r === `  ${job}:`);
  assert.ok(i >= 0, `job ${job} niet gevonden`);
  while (!/^\s+run: \|\s*$/.test(regels[i])) i++;
  const inspring = regels[i].match(/^\s*/)[0].length + 2;
  const uit = [];
  for (i++; i < regels.length; i++) {
    const r = regels[i];
    if (r.trim() && r.match(/^\s*/)[0].length < inspring) break;
    uit.push(r.slice(inspring));
  }
  return uit.join('\n');
}

const NEP_GH = `#!/usr/bin/env bash
printf '%s\\n' "$*" >> "$NEP/log"
case "$*" in
  *"-X "*) echo '{}' ;;
  *"/statuses"*) cat "$NEP/statuses.json" ;;
  *"/comments"*) cat "$NEP/comments.json" ;;
  *"/events"*) cat "$NEP/events.json" ;;
  *"/pulls/"*) cat "$NEP/pr.json" ;;
  *) echo "nep-gh: onbekend pad $*" >&2; exit 1 ;;
esac
`;

const SHA = 'b'.repeat(40);
const BOT = { login: 'github-actions[bot]' };
const pending = (tijd, creator = BOT) => ({ context: 'GO · Akkoord Carst', state: 'pending', created_at: tijd, creator });
const reactie = (body, tijd, extra = {}) => ({ user: { login: 'CarstvdnBosch' }, author_association: 'OWNER', body, created_at: tijd, updated_at: tijd, ...extra });

function draai(job, { env = {}, statuses = [], comments = [], events = [], pr = { head: { sha: SHA }, state: 'open' } }) {
  const nep = mkdtempSync(join(tmpdir(), 'go-nogo-'));
  writeFileSync(join(nep, 'gh'), NEP_GH); chmodSync(join(nep, 'gh'), 0o755);
  writeFileSync(join(nep, 'statuses.json'), JSON.stringify(statuses));
  writeFileSync(join(nep, 'comments.json'), JSON.stringify(comments));
  writeFileSync(join(nep, 'events.json'), JSON.stringify(events));
  writeFileSync(join(nep, 'pr.json'), JSON.stringify(pr));
  writeFileSync(join(nep, 'summary'), '');
  const r = spawnSync('bash', ['--noprofile', '--norc', '-eo', 'pipefail', '-c', runScript(job)], {
    encoding: 'utf8',
    env: { PATH: `${nep}:${process.env.PATH}`, NEP: nep, GITHUB_STEP_SUMMARY: join(nep, 'summary'),
      GH_TOKEN: 'x', REPO: 'CarstvdnBosch/luxmini', PR: '40', EIGENAAR: 'CarstvdnBosch', ...env },
  });
  assert.equal(r.status, 0, `job ${job} faalde: ${r.stderr}`);
  const log = existsSync(join(nep, 'log')) ? readFileSync(join(nep, 'log'), 'utf8') : '';
  const statusPost = log.split('\n').find(l => l.includes('-X POST') && l.includes('/statuses/')) || '';
  return {
    log, uit: r.stdout,
    status: (statusPost.match(/state=(\w+)/) || [])[1] || null,
    statusSha: (statusPost.match(/statuses\/(\w+)/) || [])[1] || null,
    labelGezet: /-X POST \S+\/labels /.test(log),
    labelWeg: /-X DELETE \S+\/labels\/GO/.test(log),
    reactieGeplaatst: /-X POST \S+\/issues\/40\/comments/.test(log),
  };
}

const reactieEnv = (body, tijd, gewijzigd = tijd) => ({ REACTIE: body, REACTIE_TIJD: tijd, REACTIE_GEWIJZIGD: gewijzigd });

// ---------- Job go-reactie ----------
test('reactie GO van vóór de push telt niet op de nieuwe versie', () => {
  // commit 10:00, reactie 10:05 (op de vorige versie), push 10:06 → pending op de nieuwe commit 10:06:20
  const r = draai('go-reactie', { env: reactieEnv('GO', '2026-11-07T10:05:00Z'), statuses: [pending('2026-11-07T10:06:20Z')] });
  assert.equal(r.status, null, 'geen status zetten');
  assert.equal(r.labelGezet, false);
  assert.ok(r.reactieGeplaatst, 'bot meldt dat de reactie niet telt');
});

test('reactie GO terwijl de nieuwe versie nog geen pending-status heeft: niet groen, wel wachten en label weg', () => {
  const r = draai('go-reactie', { env: reactieEnv('GO', '2026-11-07T10:06:30Z'), statuses: [] });
  assert.equal(r.status, 'pending');
  assert.equal(r.labelGezet, false);
  assert.ok(r.labelWeg);
  assert.ok(r.reactieGeplaatst);
  assert.match(r.uit, /wordt nog verwerkt/);
});

test('reactie GO na de pending-status: groen op de actuele head-SHA en label GO', () => {
  const r = draai('go-reactie', { env: reactieEnv('  go\r\n', '2026-11-07T10:30:00Z'), statuses: [pending('2026-11-07T10:06:20Z')] });
  assert.equal(r.status, 'success');
  assert.equal(r.statusSha, SHA);
  assert.ok(r.labelGezet);
});

test('pending-status van iemand anders dan de workflow telt niet als grens', () => {
  const r = draai('go-reactie', { env: reactieEnv('GO', '2026-11-07T10:30:00Z'), statuses: [pending('2026-11-07T10:06:20Z', { login: 'CarstvdnBosch' })] });
  assert.notEqual(r.status, 'success');
  assert.equal(r.labelGezet, false);
});

test('gewijzigde reactie of andere tekst telt niet', () => {
  for (const [body, gewijzigd] of [['GO', '2026-11-07T10:31:00Z'], ['GO!', undefined], ['GO graag', undefined], ['ok GO', undefined], ['> GO', undefined]]) {
    const r = draai('go-reactie', { env: reactieEnv(body, '2026-11-07T10:30:00Z', gewijzigd), statuses: [pending('2026-11-07T10:06:20Z')] });
    assert.equal(r.status, null, `"${body}" mag niets zetten`);
    assert.equal(r.labelGezet, false);
  }
});

test('gesloten pull request: er verandert niets', () => {
  const r = draai('go-reactie', { env: reactieEnv('GO', '2026-11-07T10:30:00Z'), statuses: [pending('2026-11-07T10:06:20Z')], pr: { head: { sha: SHA }, state: 'closed' } });
  assert.equal(r.status, null);
});

// ---------- Job besluit ----------
const labelEnv = (actie = 'labeled', heeftGo = 'true') => ({ ACTIE: actie, HEEFT_GO: heeftGo, SHA });
const labelEvent = (login, tijd) => ({ event: 'labeled', label: { name: 'GO' }, actor: { login }, created_at: tijd });

test('nieuwe commit (synchronize): status wachten en label weg', () => {
  const r = draai('besluit', { env: labelEnv('synchronize') });
  assert.equal(r.status, 'pending');
  assert.ok(r.labelWeg);
});

test('label van de bot zonder pending-status op de nieuwe versie: wachten en label weg', () => {
  const r = draai('besluit', { env: labelEnv(), statuses: [],
    events: [labelEvent('github-actions[bot]', '2026-11-07T10:05:10Z')], comments: [reactie('GO', '2026-11-07T10:05:00Z')] });
  assert.equal(r.status, 'pending');
  assert.ok(r.labelWeg);
});

test('label van de bot met een ongewijzigde reactie GO na de pending-status: groen', () => {
  const r = draai('besluit', { env: labelEnv(), statuses: [pending('2026-11-07T10:06:20Z')],
    events: [labelEvent('github-actions[bot]', '2026-11-07T10:30:05Z')], comments: [reactie('GO', '2026-11-07T10:30:00Z')] });
  assert.equal(r.status, 'success');
});

test('label van de bot met alleen een oude of gewijzigde reactie GO: wachten', () => {
  for (const c of [reactie('GO', '2026-11-07T10:05:00Z'), reactie('GO', '2026-11-07T10:30:00Z', { updated_at: '2026-11-07T10:40:00Z' })]) {
    const r = draai('besluit', { env: labelEnv(), statuses: [pending('2026-11-07T10:06:20Z')],
      events: [labelEvent('github-actions[bot]', '2026-11-07T10:30:05Z')], comments: [c] });
    assert.equal(r.status, 'pending');
  }
});

test('label van de eigenaar: groen als het na de pending-status kwam, anders wachten', () => {
  const na = draai('besluit', { env: labelEnv(), statuses: [pending('2026-11-07T10:06:20Z')], events: [labelEvent('CarstvdnBosch', '2026-11-07T10:30:00Z')] });
  assert.equal(na.status, 'success');
  const voor = draai('besluit', { env: labelEnv(), statuses: [pending('2026-11-07T10:06:20Z')], events: [labelEvent('CarstvdnBosch', '2026-11-07T10:05:00Z')] });
  assert.equal(voor.status, 'pending');
});

test('label van iemand anders: wachten', () => {
  const r = draai('besluit', { env: labelEnv(), statuses: [pending('2026-11-07T10:06:20Z')],
    events: [labelEvent('iemand', '2026-11-07T10:30:00Z')], comments: [reactie('GO', '2026-11-07T10:20:00Z')] });
  assert.equal(r.status, 'pending');
});
