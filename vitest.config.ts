import { defineConfig } from 'vitest/config'

// kept separate from vite.config.ts so tests never load the app's framework plugins
export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
  },
})
