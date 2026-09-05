import {test,expect} from '@playwright/test';import {Engine} from '../../src/game/engine';import {readFileSync} from 'node:fs';
const config=JSON.parse(readFileSync('../content/game-config.json','utf8'));
for(const kind of ['meteor','airdrop','sabotage','siege'] as const)test(`${kind} warning and active scene are visible`,async({page},info)=>{
 const e=new Engine(config,123,'pressure-ui');e.s.nextBoss=99999;e.s.nextPerk=99999;e.s.event={kind,remaining:6,columns:[10,16,22]};const errors:string[]=[];page.on('pageerror',a=>errors.push(a.message));
 await page.route('**/api/v1/**',r=>{const p=new URL(r.request().url()).pathname,data=p.endsWith('/config')?config:p.endsWith('/save')?{revision:0,snapshot:e.snapshot()}:p.endsWith('/settings')?{musicVolume:0,sfxVolume:0,reducedMotion:false,tutorialSeen:true}:null;return r.fulfill({status:data?200:204,contentType:'application/json',body:data?JSON.stringify(data):undefined});});
 await page.goto('/');await page.getByRole('button',{name:/继续防守/}).click();await expect(page.locator('.incident-banner')).toContainText(kind==='meteor'?'陨石':kind==='airdrop'?'空降入侵':kind==='sabotage'?'矿区爆破':'精英空投');
 if(kind!=='sabotage'){e.s.event.remaining=1/60;for(let i=0;i<50;i++)e.step();await page.reload();await page.getByRole('button',{name:/继续防守/}).click();if(kind==='meteor')expect(e.s.shots).toHaveLength(3);else await expect(page.locator('.sector-stats strong').last()).toHaveText(kind==='airdrop'?'06':'09');}
 await page.screenshot({path:`../docs/pressure-${kind}-${info.project.name}.png`});expect(errors).toEqual([]);
});
