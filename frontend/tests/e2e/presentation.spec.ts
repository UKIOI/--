import {test,expect} from '@playwright/test';
import {readFileSync} from 'node:fs';
const config=JSON.parse(readFileSync('../content/game-config.json','utf8'));
test('field guide shows all distinct portraits, filters and sound preview',async({page},testInfo)=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 // UI-only test: never reads or overwrites the player's save or settings.
 await page.route('**/api/v1/**',route=>{const path=new URL(route.request().url()).pathname;const data=path.endsWith('/config')?config:path.endsWith('/settings')?{musicVolume:.3,sfxVolume:.7,reducedMotion:false,tutorialSeen:true}:null;return route.fulfill({status:data?200:204,contentType:'application/json',body:data?JSON.stringify(data):undefined});});
 await page.goto('/');await page.getByRole('button',{name:/怪物图鉴/}).click();
 await expect(page.getByRole('heading',{name:'怪物图鉴',exact:true})).toBeVisible();
 const hashes=new Set<string>();
 for(const [id,p] of Object.entries(config.enemies) as [string,{name:string}][]){await page.locator('.guide-list').getByRole('button',{name:new RegExp(p.name)}).click();await expect(page.locator('.guide-name h3')).toHaveText(p.name);await page.waitForTimeout(40);hashes.add(await page.locator('.guide-entry canvas').evaluate((c:HTMLCanvasElement)=>c.toDataURL()));}
 expect(hashes.size).toBe(Object.keys(config.enemies).length);await page.getByRole('button',{name:'Boss',exact:true}).click();await expect(page.locator('.guide-list button')).toHaveCount(Object.values(config.enemies).filter((e:any)=>e.boss).length);
 await page.screenshot({path:`../docs/guide-${testInfo.project.name}.png`});
 const box=(await page.locator('.dialog').boundingBox())!;expect(box.y).toBeGreaterThanOrEqual(0);expect(box.y+box.height).toBeLessThanOrEqual(720);
 await page.getByRole('button',{name:'关闭怪物图鉴'}).click();await page.getByRole('button',{name:'⚙ 设置'}).click();await page.getByRole('button',{name:'试听战斗音效'}).click();expect(errors).toEqual([]);
});
