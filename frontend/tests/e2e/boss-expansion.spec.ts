import {test,expect} from '@playwright/test';
import {readFileSync} from 'node:fs';
import {Engine} from '../../src/game/engine';
const config=JSON.parse(readFileSync('../content/game-config.json','utf8'));
for(const difficulty of ['easy','normal'] as const)test(`sniper limit and worm corridor warning are visible in ${difficulty}`,async({page},info)=>{
 const e=new Engine(config,123,'boss-ui');e.s.gold=2000;e.s.difficulty=difficulty;const limit=e.buildingLimit('sniper');
 for(let i=0;i<limit;i++)e.s.buildings.push({id:e.s.nextEntityId++,type:'sniper',branch:-1,spent:190,x:3.5+i,y:.5,v:0,hp:config.buildings.sniper.hp,settled:true,fallId:1,hit:[],cooldown:0});
 e.spawn('sandworm',false);e.step();
 const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
 await page.route('**/api/v1/**',r=>{const p=new URL(r.request().url()).pathname;const data=p.endsWith('/config')?config:p.endsWith('/save')?{revision:0,snapshot:e.snapshot()}:p.endsWith('/settings')?{musicVolume:0,sfxVolume:0,reducedMotion:true,tutorialSeen:true}:null;return r.fulfill({status:data?200:204,contentType:'application/json',body:data?JSON.stringify(data):undefined});});
 await page.goto('/');await page.getByRole('button',{name:/继续防守/}).click();
 await expect(page.locator('.incident-banner')).toContainText('沙虫');
 const card=page.getByRole('button',{name:new RegExp(`狙击塔.*${limit}/${limit}`)});await expect(card).toBeDisabled();
 await page.screenshot({path:`../docs/boss-expansion-${info.project.name}.png`});expect(errors).toEqual([]);
});
