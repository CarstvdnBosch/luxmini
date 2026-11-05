// Lighthouse CI: snelheid en kwaliteit per pagina (blokkerend), zie docs/kwaliteit.md.
// Meet met mobiele instellingen (trage 4G, middelmatige telefoon): zo bezoeken de meeste ouders de site.
// Grenzen zijn vastgezet na de eerste meting (nov. 2026); aanscherpen mag, verruimen alleen met akkoord van Carst.
const PAGINAS = ['/', '/werkwijze', '/kraamcadeauboxen', '/prematuurkleding', '/babynest', '/inspiratie', '/contact'];
module.exports = {
  ci: {
    collect: {
      startServerCommand: 'node scripts/serveer.mjs 4174',
      startServerReadyPattern: 'test-server',
      url: PAGINAS.map(p => `http://127.0.0.1:4174${p}`),
      numberOfRuns: 3, // mediaan van 3 metingen: minder toevallige uitschieters
      settings: { chromeFlags: '--no-sandbox --headless=new', skipAudits: ['is-crawlable'] }, // lokaal adres; crawlbaarheid test seo-veiligheid.spec.js
    },
    assert: {
      aggregationMethod: 'median-run', // toets op de middelste van 3 metingen (zelfde als het rapport); akkoord Carst 5 nov. 2026
      assertions: {
        'categories:performance': ['error', { minScore: 0.7 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 4000 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['error', { maxNumericValue: 300 }],
        'total-byte-weight': ['error', { maxNumericValue: 3500000 }],
        'uses-responsive-images': 'off',
        'unsized-images': ['warn', {}],
      },
    },
    upload: { target: 'filesystem', outputDir: 'rapport/lighthouse' },
  },
};
