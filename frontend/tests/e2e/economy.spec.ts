import {test,expect} from '@playwright/test';
import {Engine} from '../../src/game/engine';
import {readFileSync} from 'node:fs';
const config=JSON.parse(readFileSync('../content/game-config.json','utf8'));
test('economy displays totals, selected mine loss and new construction gain',async({page},info)=>{
 const e=new Engine(config,123,'economy-ui');e.s.gold=2000;
 for(let i=0;i<8;i++)e.s.buildings.push({id:e.s.nextEntityId++,type:'mine',branch:i===0?0:-1,spent:95,x:10.5+i,y:.5,v:0,hp:200,settled:true,fallId:1,hit:[],cooldown:10});
 let snapshot=e.snapshot();const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/api/v1/**',r=>{const p=new URL(r.request().url()).pathname;if(r.request().method()==='PUT'&&p.endsWith('/save'))snapshot=r.request().postDataJSON().snapshot;const data=p.endsWith('/config')?config:p.endsWith('/settings')?{tutorialSeen:true,musicVolume:0,sfxVolume:0}:p.endsWith('/save')?{revision:0,snapshot}:null;return r.fulfill({status:data?200:204,contentType:'application/json',body:data?JSON.stringify(data):undefined});});
 await page.goto('/');await page.getByRole('button',{name:/继续防守/}).click();
 await expect(page.locator('.income-total')).toContainText(e.economy().total.toFixed(1));
 await page.locator('.economy-panel summary').click();await expect(page.locator('.economy-panel').first()).toContainText('递减损失');await page.locator('.economy-panel summary').click();
 // Restored games are paused. Resume to choose a building, then hover a valid column.
 await page.locator('.pause-button').click();await page.locator('.building-card').filter({hasText:'矿场'}).click();
 const rect=await page.locator('canvas').boundingBox();await page.mouse.move(rect!.x+rect!.width*.4,rect!.y+rect!.height*.7);
 await expect(page.locator('.economy-panel').last()).toContainText('已有矿场损失');
 await expect(page.locator('.economy-panel').last()).toContainText('0 G/分');
 await expect(page.locator('.economy-panel').last()).toContainText('总产能净增加');
 await expect(page.getByText('总产能净增加',{exact:true})).toBeInViewport();await page.screenshot({path:`../docs/economy-${info.project.name}.png`});expect(errors).toEqual([]);
});
