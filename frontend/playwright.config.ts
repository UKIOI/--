import {defineConfig} from '@playwright/test';
export default defineConfig({testDir:'tests/e2e',timeout:45000,use:{baseURL:'http://127.0.0.1:4173',viewport:{width:1280,height:720}},projects:[{name:'chromium',use:{browserName:'chromium'}},{name:'firefox',use:{browserName:'firefox'}}],workers:1,reporter:'list'});
