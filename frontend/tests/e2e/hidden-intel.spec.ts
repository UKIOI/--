import {test,expect} from '@playwright/test';
import {readFileSync} from 'node:fs';
const config=JSON.parse(readFileSync('../content/game-config.json','utf8'));
for(const unlocked of [false,true])test(`hidden intel unlocked=${unlocked}`,async({page})=>{
 await page.route('**/api/v1/**',r=>{const p=new URL(r.request().url()).pathname;const data=p.endsWith('/config')?config:p.endsWith('/settings')?{tutorialSeen:true,campaignCleared:4,falseEndingAchievement:unlocked}:p.endsWith('/save')?{revision:0,snapshot:null}:[];return r.fulfill({status:200,contentType:'application/json',body:JSON.stringify(data)});});
 await page.goto('/');await page.getByRole('button',{name:/更新日志/}).click();
 const log=page.locator('.changelog');await expect(log).toContainText('0.3.1');
 if(unlocked)await expect(log).toContainText('潮汐领主');else {await expect(log).not.toContainText('潮汐领主');await expect(log).not.toContainText('结束了？');await expect(log).not.toContainText('沉船苏醒');}
 await page.getByRole('button',{name:'关闭更新日志'}).click();await page.getByRole('button',{name:/怪物图鉴/}).click();
 await expect(page.locator('.guide-list button').filter({hasText:'深渊潮汐领主'})).toHaveCount(unlocked?1:0);
 await page.getByRole('button',{name:'关闭怪物图鉴'}).click();await page.getByRole('button',{name:/故事战役/}).click();
 if(unlocked)await expect(page.locator('.campaign-map article')).toContainText('潮汐领主');else await expect(page.locator('.campaign-map article')).not.toContainText('潮汐领主');
});
