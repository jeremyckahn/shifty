import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.js'],
    coverage: {
      reporter: ['text', 'json', 'html'],
    },
    reporters: ['default', 'junit'],
    outputFile: 'reports/vitest-junit.xml',
  },
})
