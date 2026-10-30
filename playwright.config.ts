import { defineConfig } from '@playwright/test';
import { existsSync } from 'node:fs';
export default defineConfig({testDir:'./e2e',timeout:60000,workers:1,use:{baseURL:'http://localhost:3100',headless:true,launchOptions:{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || (existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined),args:['--no-sandbox']}},webServer:{command:'npm run dev -- --port 3100',url:'http://localhost:3100',reuseExistingServer:!process.env.CI},reporter:'list'});
