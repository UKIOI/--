import {test,expect} from '@playwright/test';
import {readFileSync} from 'node:fs';
import {Engine} from '../../src/game/engine';
const config=JSON.parse(readFileSync('../content/game-config.json','utf8'));
test('mortar renders its aimed barrel and traveling shell after save restore',async({page},info)=>{
 const e=new Engine(config,42,'weapons-preview');e.command({type:'drop',kind:'mortar',column:15});for(let i=0;i<150;i++)e.step();e.spawn('siege',false,23);for(let i=0;i<20;i++)e.step();expect(e.s.shots.length).toBe(1);expect(e.s.shots[0].originX).toBeDefined();
 const errors:string[]=[];page.on('pageerror',x=>errors.push(x.message));
 await page.route('**/api/v1/**',r=>{const path=new URL(r.request().url()).pathname;const data=path.endsWith('/config')?config:path.endsWith('/save')?{revision:0,savedAt:new Date().toISOString(),snapshot:e.snapshot()}:path.endsWith('/settings')?{musicVolume:0,sfxVolume:0,reducedMotion:false,tutorialSeen:true}:null;return r.fulfill({status:data?200:204,contentType:'application/json',body:data?JSON.stringify(data):undefined});});
 await page.goto('/');await page.getByRole('button',{name:/继续防守/}).click();await expect(page.locator('canvas')).toBeVisible();const before=await page.locator('canvas').evaluate((c:HTMLCanvasElement)=>c.toDataURL());
 await page.getByRole('button',{name:/继续 Space/}).click();await page.waitForTimeout(150);await page.screenshot({path:`../docs/mortar-${info.project.name}.png`});const after=await page.locator('canvas').evaluate((c:HTMLCanvasElement)=>c.toDataURL());expect(after).not.toBe(before);expect(errors).toEqual([]);
});
