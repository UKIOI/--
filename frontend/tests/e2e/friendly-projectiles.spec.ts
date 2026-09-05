import {test,expect} from '@playwright/test';import {readFileSync} from 'node:fs';import {Engine} from '../../src/game/engine';
const config=JSON.parse(readFileSync('../content/game-config.json','utf8'));
test('visible arrows, cannon shells, truss bridges and ambience run without errors',async({page},info)=>{
 const e=new Engine(config,123,'friendly-effects-preview');
 for(let x=3.5;x<9;x++)e.s.buildings.push({id:e.s.nextEntityId++,type:'bridge',x,y:1.5,branch:-1,spent:45,hp:350,settled:true,v:0,fallId:1,hit:[],cooldown:10});
 for(const [type,x,y] of [['ballista',8.5,2.5],['cannon',12.5,.5]] as const)e.s.buildings.push({id:e.s.nextEntityId++,type,x,y,branch:0,spent:200,hp:220,settled:true,v:0,fallId:1,hit:[],cooldown:0});
 e.spawn('siege',false,16);e.step();expect(e.s.shots.map(s=>s.kind)).toEqual(expect.arrayContaining(['arrow','cannon']));
 const errors:string[]=[];page.on('pageerror',x=>errors.push(x.message));
 await page.route('**/api/v1/**',r=>{const p=new URL(r.request().url()).pathname;const data=p.endsWith('/config')?config:p.endsWith('/save')?{revision:0,snapshot:e.snapshot(),savedAt:new Date().toISOString()}:p.endsWith('/settings')?{musicVolume:.3,sfxVolume:.7,reducedMotion:false,tutorialSeen:true}:null;return r.fulfill({status:data?200:204,contentType:'application/json',body:data?JSON.stringify(data):undefined});});
 await page.goto('/');await page.getByRole('button',{name:/继续防守/}).click();await page.getByRole('button',{name:/继续 Space/}).click();await page.waitForTimeout(50);await page.screenshot({path:`../docs/friendly-projectiles-${info.project.name}.png`});await page.waitForTimeout(2100);await page.keyboard.press('Space');await expect(page.getByText('模拟已暂停')).toBeVisible();expect(errors).toEqual([]);
});
