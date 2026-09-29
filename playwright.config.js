const { defineConfig } = require('@playwright/test');
module.exports = defineConfig({
  testDir: './tests',
  timeout: 60000,
  use: { baseURL: 'http://127.0.0.1:8080', headless: true },
  webServer: { command: 'node server.js', url: 'http://127.0.0.1:8080', reuseExistingServer: true },
});
