import { defineConfig } from '@playwright/test'

const preview = process.env.MISSION_FORGE_PREVIEW === '1'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  // A four-worker WebGL acceptance run crashed Chrome on this host.
  // Bound renderer concurrency while retaining parallel coverage (see QA dossier).
  workers: 2,
  use: { baseURL: 'http://127.0.0.1:4173/nasa-space-apps/', trace: 'retain-on-failure' },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium', channel: 'chrome' } },
  ],
  webServer: {
    command: `npm run ${preview ? 'preview' : 'dev'} -- --host 127.0.0.1 --port 4173 --strictPort`,
    url: 'http://127.0.0.1:4173/nasa-space-apps/',
    reuseExistingServer: false,
  },
})
