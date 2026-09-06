import {test,expect} from '@playwright/test';
import {readFileSync} from 'node:fs';
import {Engine} from '../../src/game/engine';
import {BACKGROUNDS} from '../../src/game/render/backgrounds';
const config=JSON.parse(readFileSync('../content/game-config.json','utf8'));

test('background picker switches live, restores settings and supports legacy settings',async({page},info)=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 let settings:Record<string,unknown>={musicVolume:0,sfxVolume:0,reducedMotion:true,tutorialSeen:true};
 const e=new Engine(config,123,'background-preview');
 e.s.buildings.push({id:e.s.nextEntityId++,type:'wall',x:12.5,y:.5,branch:-1,spent:40,hp:650,settled:true,v:0,fallId:1,hit:[],cooldown:0});
 e.spawn('grunt',false,25);e.spawn('flyer',false,28);
 await page.route('**/api/v1/**',r=>{
  const path=new URL(r.request().url()).pathname;
  if(path.endsWith('/settings')&&r.request().method()==='PUT')settings=r.request().postDataJSON();
  const data=path.endsWith('/config')?config:path.endsWith('/settings')?settings:path.endsWith('/save')?{revision:0,snapshot:e.snapshot(),savedAt:new Date().toISOString()}:null;
  return r.fulfill({status:data?200:204,contentType:'application/json',body:data?JSON.stringify(data):undefined});
 });
 await page.goto('/');await page.getByRole('button',{name:/继续防守/}).click();
 await page.getByRole('button',{name:'⚙ 设置'}).click();
 await expect(page.getByRole('button',{name:'灰烬之城',exact:true})).toHaveAttribute('aria-pressed','true');
 await expect(page.locator('.background-options button')).toHaveCount(5);
 await page.screenshot({path:`../docs/background-settings-${info.project.name}.png`});
 const images=new Set<string>();
 for(const b of BACKGROUNDS){
  await page.getByRole('button',{name:b.name,exact:true}).click();
  await expect.poll(()=>settings.background).toBe(b.id);
  await expect(page.getByRole('button',{name:b.name,exact:true})).toHaveAttribute('aria-pressed','true');
  await page.getByRole('button',{name:'完成',exact:true}).click();
  await page.waitForTimeout(80);
  images.add(await page.locator('.battle canvas').evaluate((c:HTMLCanvasElement)=>c.toDataURL()));
  await page.screenshot({path:`../docs/background-${b.id}-${info.project.name}.png`});
  await page.getByRole('button',{name:'⚙ 设置'}).click();
 }
 expect(images.size).toBe(5);
 await page.reload();await page.getByRole('button',{name:'⚙ 设置'}).click();
 await expect(page.getByRole('button',{name:'旧日荒原',exact:true})).toHaveAttribute('aria-pressed','true');
 await page.setViewportSize({width:1920,height:1080});
 await page.screenshot({path:`../docs/background-settings-${info.project.name}-1920.png`});
 const box=(await page.locator('.dialog').boundingBox())!;expect(box.y).toBeGreaterThanOrEqual(0);expect(box.y+box.height).toBeLessThanOrEqual(1080);
 expect(errors).toEqual([]);
});

