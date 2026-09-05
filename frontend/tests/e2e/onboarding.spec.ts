import {test,expect} from '@playwright/test';
import {readFileSync} from 'node:fs';
const config=JSON.parse(readFileSync('../content/game-config.json','utf8'));
for(const skip of [false,true])test(`first run onboarding ${skip?'skip':'complete'} persists without altering saves`,async({page},info)=>{
 let settings={musicVolume:0,sfxVolume:0,reducedMotion:true,tutorialSeen:false};const writes:string[]=[];
 await page.route('**/api/v1/**',r=>{const path=new URL(r.request().url()).pathname;if(r.request().method()==='PUT'){if(path.endsWith('/settings'))settings=r.request().postDataJSON();else writes.push(path);}const data=path.endsWith('/config')?config:path.endsWith('/settings')?settings:null;return r.fulfill({status:data?200:204,contentType:'application/json',body:data?JSON.stringify(data):undefined});});
 await page.goto('/');await expect(page.getByRole('heading',{name:'欢迎来到战墙'})).toBeVisible();
 if(skip)await page.getByRole('button',{name:'跳过引导'}).click();else{
  await page.getByRole('button',{name:'开始练习'}).click();await expect(page.getByRole('button',{name:'下一步'})).toBeDisabled();await page.getByRole('button',{name:'选择城墙',exact:true}).click();await page.getByRole('button',{name:'放置城墙',exact:true}).click();await page.getByRole('button',{name:'下一步'}).click();await page.getByRole('button',{name:'选择箭塔',exact:true}).click();await page.getByRole('button',{name:'在城墙上放置箭塔'}).click();await page.getByRole('button',{name:'下一步'}).click();await page.getByRole('button',{name:/强化火力/}).click();await page.getByRole('button',{name:'下一步'}).click();await page.screenshot({path:`../docs/onboarding-${info.project.name}.png`});await page.getByRole('button',{name:'完成引导'}).click();
 }
 await expect.poll(()=>settings.tutorialSeen).toBe(true);expect(writes).toEqual([]);await page.getByRole('button',{name:'⚙ 设置'}).click();await page.getByRole('button',{name:'新手引导 · 重新体验'}).click();await expect(page.getByRole('heading',{name:'欢迎来到战墙'})).toBeVisible();await page.getByRole('button',{name:'跳过引导'}).click();await page.reload();await expect(page.getByRole('button',{name:'建立新防线'})).toBeEnabled();await expect(page.locator('.onboarding')).toHaveCount(0);await page.getByRole('button',{name:/操作说明/}).click();await page.getByRole('button',{name:'重新体验新手引导'}).click();await expect(page.getByRole('heading',{name:'欢迎来到战墙'})).toBeVisible();await page.getByRole('button',{name:'跳过引导'}).click();
});
