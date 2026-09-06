import {test,expect} from '@playwright/test';
import {Engine} from '../../src/game/engine';
import {readFileSync} from 'node:fs';
const config=JSON.parse(readFileSync('../content/game-config.json','utf8'));
test('queen nest renders during incubation and after hatching without runtime errors',async({page},info)=>{
 const e=new Engine(config,123,'queen-visual');e.spawn('queen',false,29);e.s.enemies[0].special=1.5;e.s.enemies[0].secondary=999;e.s.nextEvent=e.s.nextPerk=e.s.nextBoss=99999;let snapshot=e.snapshot();const errors:string[]=[];page.on('pageerror',a=>errors.push(a.message));
 await page.route('**/api/v1/**',r=>{const p=new URL(r.request().url()).pathname;if(r.request().method()==='PUT'&&p.endsWith('/save'))snapshot=r.request().postDataJSON().snapshot;const data=p.endsWith('/config')?config:p.endsWith('/settings')?{tutorialSeen:true,musicVolume:0,sfxVolume:0}:p.endsWith('/save')?{revision:0,snapshot}:null;return r.fulfill({status:data?200:204,contentType:'application/json',body:data?JSON.stringify(data):undefined});});
 await page.goto('/');await page.getByRole('button',{name:/继续防守/}).click();await page.locator('.pause-button').click();await page.waitForTimeout(400);await page.screenshot({path:`../docs/queen-nest-${info.project.name}.png`});await page.waitForTimeout(1200);await page.screenshot({path:`../docs/queen-hatch-${info.project.name}.png`});expect(errors).toEqual([]);
});
