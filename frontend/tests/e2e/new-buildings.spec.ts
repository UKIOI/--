import {test,expect} from '@playwright/test';import {readFileSync} from 'node:fs';import {Engine} from '../../src/game/engine';
const config=JSON.parse(readFileSync('../content/game-config.json','utf8'));
test('horizontal bridges support the new weapons and all eleven cards fit',async({page},info)=>{
 const e=new Engine(config,123,'new-buildings-preview');e.s.gold=1500;const errors:string[]=[];page.on('pageerror',x=>errors.push(x.message));
 await page.route('**/api/v1/**',r=>{const p=new URL(r.request().url()).pathname;const data=p.endsWith('/config')?config:p.endsWith('/save')?{revision:0,snapshot:e.snapshot(),savedAt:new Date().toISOString()}:p.endsWith('/settings')?{musicVolume:0,sfxVolume:0,reducedMotion:false,tutorialSeen:true}:null;return r.fulfill({status:data?200:204,contentType:'application/json',body:data?JSON.stringify(data):undefined});});
 await page.goto('/');await page.getByRole('button',{name:/继续防守/}).click();await page.getByRole('button',{name:/继续 Space/}).click();await expect(page.locator('.building-card')).toHaveCount(11);
 const box=(await page.locator('canvas').boundingBox())!,s=Math.min(box.width/36,box.height/16),ox=box.x+(box.width-36*s)/2,oy=box.y+(box.height-16*s)/2;
 const click=(x:number,y:number)=>page.mouse.click(ox+x*s,oy+(16-y)*s);
 await page.keyboard.press('9');await click(3.5,1.5);await page.waitForTimeout(1300);await click(4.5,1.5);await page.waitForTimeout(1300);
 await page.keyboard.press('0');await click(4.5,2.5);await page.waitForTimeout(1600);await page.keyboard.press('-');await click(3.5,2.5);await page.waitForTimeout(1600);await page.keyboard.press('Escape');
 await click(4.5,2.5);await expect(page.locator('.details h2')).toHaveText('加农炮');await click(3.5,2.5);await expect(page.locator('.details h2')).toHaveText('狙击塔');
 const last=(await page.locator('.building-card').last().boundingBox())!;expect(last.x+last.width).toBeLessThanOrEqual(1280);await page.screenshot({path:`../docs/new-buildings-${info.project.name}.png`});expect(errors).toEqual([]);
});
