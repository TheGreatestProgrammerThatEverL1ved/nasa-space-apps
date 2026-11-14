import react from '@vitejs/plugin-react'
import { readFileSync } from 'node:fs'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/nasa-space-apps/',
  // No production assets use public/: preserve unused local starter files
  // without silently copying them into the delivery artifact.
  publicDir: false,
  plugins: [
    react(),
    {
      name: 'runtime-license-notices',
      generateBundle() {
        this.emitFile({
          type: 'asset',
          fileName: 'THIRD-PARTY-NOTICES.txt',
          source: readFileSync(new URL('./docs/third-party-notices.md', import.meta.url), 'utf8'),
        })
      },
    },
  ],
})
