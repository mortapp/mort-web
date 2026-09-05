import { defineConfig } from '@playwright/test'
export default defineConfig({
  testDir: './tests/browser', timeout: 60000, expect: { timeout: 10000 }, workers: 1,
  reporter: [['list'], ['json', { outputFile: 'qa-artifacts/browser-results.json' }]],
  use: { baseURL: 'http://localhost:3000', viewport: { width: 1440, height: 900 }, screenshot: 'only-on-failure', trace: 'retain-on-failure', launchOptions: { args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] } },
})
