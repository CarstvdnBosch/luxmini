// Playwright Test: de kwaliteitsharness van LUX mini (zie docs/kwaliteit.md).
// Draait tegen een lokale kopie van public/ (scripts/serveer.mjs), op drie schermen.
//   npm run test:e2e            toegankelijkheid, SEO, veiligheid, links (blokkerend)
//   npm run test:visueel        schermvergelijking met de goedgekeurde basis (waarschuwing)
import { defineConfig, devices } from '@playwright/test';

const POORT = 4173;
const VISUEEL = !!process.env.VISUEEL;

export default defineConfig({
  testDir: 'tests/e2e',
  outputDir: 'rapport/playwright-resultaten',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  timeout: 60_000,
  // Visuele tests alleen als VISUEEL=1; de rest altijd.
  grep: VISUEEL ? /@visueel/ : undefined,
  grepInvert: VISUEEL ? undefined : /@visueel/,
  snapshotPathTemplate: 'tests/e2e/basis/{projectName}/{arg}{ext}',
  expect: { toHaveScreenshot: { maxDiffPixelRatio: 0.01, animations: 'disabled', caret: 'hide' } },
  reporter: [
    ['list'],
    ['json', { outputFile: VISUEEL ? 'rapport/visueel.json' : 'rapport/playwright.json' }],
    ['html', { outputFolder: VISUEEL ? 'rapport/visueel-html' : 'rapport/playwright-html', open: 'never' }],
  ],
  use: {
    baseURL: `http://127.0.0.1:${POORT}`,
    locale: 'nl-NL',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'desktop', use: { viewport: { width: 1440, height: 900 } } },
    { name: 'tablet', use: { viewport: { width: 768, height: 1024 }, hasTouch: true, isMobile: true } },
    { name: 'mobiel', use: { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true } },
    // Safari op de iPhone (WebKit, de motor van Safari): veel bezoekers gebruiken dit. Viewport met de balken van Safari.
    { name: 'iphone', use: { ...devices['iPhone 13'] } },
  ],
  webServer: {
    command: `node scripts/serveer.mjs ${POORT}`,
    url: `http://127.0.0.1:${POORT}/`,
    reuseExistingServer: !process.env.CI,
    timeout: 20_000,
  },
});
