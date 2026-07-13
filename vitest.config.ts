import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    // tests/e2e/*.spec.ts are Playwright specs; vitest's default glob would otherwise collect
    // them and fail with "Playwright Test did not expect test.describe() to be called here".
    exclude: ['tests/e2e/**', '**/node_modules/**', '**/dist/**'],
    coverage: {
      provider: 'v8',
      include: ['src/lib/**/*.ts'],
      exclude: ['src/env.d.ts'],
      thresholds: {
        lines: 80,
        branches: 80,
        functions: 80,
        statements: 80
      }
    }
  }
})
