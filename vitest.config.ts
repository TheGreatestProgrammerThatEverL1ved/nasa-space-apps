import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    projects: [
      { test: { name: 'engine', include: ['src/engine/**/*.test.ts', 'tests/conformance/**/*.test.ts'], environment: 'node' } },
      { test: { name: 'ui', include: ['tests/ui/**/*.test.tsx'], environment: 'jsdom' } },
    ],
  },
})
