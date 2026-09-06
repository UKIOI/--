import {CoopGame} from '../../src/game/coop';
import {Engine} from '../../src/game/engine';
import {EVENTS} from '../../src/game/incidents';
import {test,expect} from '@playwright/test';
import {readFileSync} from 'node:fs';
const config=JSON.parse(readFileSync('../content/game-config.json','utf8'));
test('two players share buildings with separate wallets and owner colors',async({browser},info)=>{
 const context=await browser.newContext({viewport:{width:1440,height:1000}}),host=await context.newPage(),guest=await context.newPage();
 const errors:string[]=[];let world:any;
 for(const page of [host,guest]){
  page.on('pageerror',e=>errors.push(e.message));
  page.on('websocket',ws=>ws.on('framereceived',event=>{const m=JSON.parse(String(event.payload));if(m.type==='state')world=m.world;}));
  await page.route('**/api/v1/**',r=>{const p=new URL(r.request().url()).pathname;return r.fulfill({contentType:'application/json',body:JSON.stringify(p.endsWith('config')?config:p.endsWith('settings')?{tutorialSeen:true}:null)});});
  await page.goto('http://127.0.0.1:8011/?lan=');
  await page.getByLabel('服务地址').fill('http://127.0.0.1:8011');
 }
 await host.getByLabel('你的称呼').fill('蓝队');await host.getByRole('button',{name:'创建房间'}).click();
 const room=host.getByRole('heading',{name:/房间码/});await expect(room).toBeVisible();const code=(await room.innerText()).split(' ').at(-1)!;
 const invite=host.locator('.invite a').first();await expect(invite).toBeVisible();const inviteUrl=new URL((await invite.getAttribute('href'))!);expect(inviteUrl.hostname).not.toBe('127.0.0.1');expect(inviteUrl.port).toBe('8011');expect(inviteUrl.searchParams.get('lan')).toBe(code);
 await guest.getByLabel('你的称呼').fill('金队');await guest.getByPlaceholder('六位房间码').fill(code);await guest.getByRole('button',{name:'加入房间'}).click();
 await expect(host.getByRole('button',{name:'开始合作（2 人）'})).toBeVisible();await host.getByRole('button',{name:'开始合作（2 人）'}).click();
 await expect(guest.locator('canvas')).toBeVisible();
 await expect(host.locator('.tray button').filter({hasText:config.buildings.decoy.name})).toBeEnabled();
 const guestDecoy=guest.locator('.tray button').filter({hasText:config.buildings.decoy.name});await expect(guestDecoy).toBeDisabled();await expect(guestDecoy).toContainText('仅房主可建造');
 await host.bringToFront();if(await host.getByRole('button',{name:'继续战斗',exact:true}).count())await host.getByRole('button',{name:'继续战斗',exact:true}).click();
 await host.keyboard.press('1');
 await expect(host.locator('.tray button').filter({hasText:config.buildings.wall.name})).toHaveAttribute('aria-pressed','true');
 const rect=(await host.locator('canvas').boundingBox())!,scale=Math.min(rect.width/36,rect.height/16),ox=(rect.width-36*scale)/2;
 await host.mouse.click(rect.x+ox+8.5*scale,rect.y+rect.height/2);
 await expect.poll(()=>world?.buildings?.length).toBe(1);
 await expect(host.locator('.bar').first()).toContainText('你的金币 255 G');
 const firstOwner=world.buildings[0].owner;
 // Browser automation can operate the guest without foregrounding it; the host remains active.
 await guest.keyboard.press('1');
 const r=(await guest.locator('canvas').boundingBox())!,gs=Math.min(r.width/36,r.height/16);
 await guest.locator('canvas').dispatchEvent('pointerdown',{button:0,pointerId:1,clientX:r.x+(r.width-36*gs)/2+9.5*gs,clientY:r.y+r.height/2});
 await expect.poll(()=>world?.buildings?.length).toBe(2);
 await expect(guest.locator('.bar').first()).toContainText('你的金币 255 G');
 expect(world.buildings[1].owner).not.toBe(firstOwner);expect(world.coop.players[0].gold).toBeCloseTo(world.coop.players[1].gold,1);
 expect(world.coop.players[0].color).not.toBe(world.coop.players[1].color);
 await expect(host.getByRole('region',{name:'联机操作栏'})).toBeVisible();
 await host.getByRole('button',{name:/选择 \/ 自动防御/}).click();
 await expect.poll(()=>world.buildings[0].settled).toBe(true);
 const wall=world.buildings[0];
 await host.mouse.click(rect.x+ox+wall.x*scale,rect.y+(rect.height-16*scale)/2+(16-wall.y)*scale);
 await expect(host.locator('.selection-panel')).toBeVisible();
 await host.getByRole('button',{name:'加入部队 1',exact:true}).click();
 await expect(host.locator('.squad-slot').first()).toContainText('1 座');
 await host.getByRole('button',{name:/吊装位移/}).click();
 await expect(host.locator('.deck-heading')).toContainText('吊装位移');
 await host.locator('.tray button').filter({hasText:config.buildings.wall.name}).click();
 await expect(host.locator('.deck-heading')).toContainText('建造');
 await host.locator('.squad-slot').first().getByRole('button').first().click();
 await expect(host.locator('.deck-heading')).toContainText('手动接管 · 1 座');
 await host.keyboard.press('Escape');
 await expect(host.locator('.deck-heading strong')).toHaveText('自动防御');
 await host.keyboard.press('F1');
 await expect(host.locator('.deck-heading')).toContainText('手动接管 · 1 座');
 await host.keyboard.press('Control+2');
 await expect(host.locator('.squad-slot').nth(1)).toContainText('1 座');
 await expect(host.locator('.deck-heading')).toContainText('手动接管 · 1 座');
 for(const [i,k] of Object.keys(config.buildings).entries()){
  const key=k==='decoy'?'d':'1234567890-[]'[i];
  await host.keyboard.press(key);
  await expect(host.locator('.tray button').filter({hasText:config.buildings[k].name})).toHaveAttribute('aria-pressed','true');
 }
 await guest.keyboard.press('d');
 await expect(guestDecoy).toHaveAttribute('aria-pressed','false');
 await host.getByRole('slider',{name:'音量'}).focus();
 await host.keyboard.press('1');
 await expect(host.locator('.tray button').filter({hasText:config.buildings.decoy.name})).toHaveAttribute('aria-pressed','true');
 await host.getByRole('slider',{name:'音量'}).blur();
 await guest.setViewportSize({width:600,height:900});
 expect(await guest.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
 await guest.screenshot({path:`../docs/lan-toolbar-narrow-${info.project.name}.png`});
 await host.screenshot({path:`../docs/lan-${info.project.name}.png`});expect(errors).toEqual([]);
 await host.getByRole('button',{name:'关闭房间 / 返回首页'}).click();await expect(guest.locator('header')).toContainText(/结束|断开/);
 await context.close();
});

test('guest displays all special-event warnings, boss countdown and critical core alert',async({page})=>{
 const e=new Engine(config,42);let peer:any;const errors:string[]=[];page.on('pageerror',err=>errors.push(err.message));
 await page.route('**/api/v1/**',r=>r.fulfill({contentType:'application/json',body:JSON.stringify(r.request().url().endsWith('config')?config:r.request().url().endsWith('settings')?{tutorialSeen:true}:null)}));
 const state=()=>peer.send(JSON.stringify({type:'state',world:e.snapshot(),paused:true,effects:[],sounds:['drop','alarm'],alert:e.alert,message:''}));
 await page.routeWebSocket('**/api/lan',ws=>{peer=ws;ws.onMessage(()=>{
  ws.send(JSON.stringify({type:'welcome',id:'guest',host:'host',code:'ABCDEF',lanAddresses:[]}));
  ws.send(JSON.stringify({type:'start',players:[],options:{mode:'endless',difficulty:'easy',stage:0},seed:42}));state();
 });});
 await page.goto('http://127.0.0.1:8011/?lan=ABCDEF');await page.getByRole('button',{name:'加入房间',exact:true}).click();await expect(page.locator('canvas')).toBeVisible();
 for(const kind of Object.keys(EVENTS) as (keyof typeof EVENTS)[]){e.s.event={kind,remaining:6.2,columns:[10,16,22]};state();await expect(page.locator('.incident-banner')).toContainText(EVENTS[kind].title);await expect(page.locator('.incident-banner')).toContainText('7 秒');}
 e.s.event=null;e.s.bossWarning=4.2;state();await expect(page.locator('.incident-banner')).toContainText('BOSS 接近');await expect(page.locator('.incident-banner')).toContainText('5 秒');
 e.s.bossWarning=-1;e.s.coreHp=800;state();await expect(page.locator('.incident-banner')).toHaveCount(0);await expect(page.locator('.warning')).toContainText('核心生命危急');expect(errors).toEqual([]);
});

test('nuclear silo can be selected, aimed and manually fired with synchronized charge and blast',async({page},info)=>{
 const g=new CoopGame(config,[{id:'host',name:'房主',color:'#77ddff'},{id:'guest',name:'队友',color:'#ffc56e'}],{mode:'endless',difficulty:'easy',stage:0},42,'host');
 g.e.s.coop!.players[1].gold=3000;g.apply('guest',{type:'drop',kind:'nuclear',column:8});const b=g.e.s.buildings[0];b.y=.5;b.v=0;b.settled=true;b.cooldown=0;g.e.s.nextEvent=g.e.s.nextBoss=g.e.s.nextPerk=999999;g.e.spawn('grunt',false,28,.5);g.e.s.enemies[0].hp=g.e.s.enemies[0].maxHp=5000;
 let peer:any,fired:any;const errors:string[]=[];page.on('pageerror',err=>errors.push(err.message));
 const sendState=()=>peer.send(JSON.stringify({type:'state',world:g.e.snapshot(),paused:false,effects:g.e.effects,sounds:[],alert:g.e.alert,message:''}));
 await page.route('**/api/v1/**',r=>r.fulfill({contentType:'application/json',body:JSON.stringify(r.request().url().endsWith('config')?config:r.request().url().endsWith('settings')?{tutorialSeen:true}:null)}));
 await page.routeWebSocket('**/api/lan',ws=>{peer=ws;ws.onMessage(raw=>{const m=JSON.parse(String(raw));if(m.type==='command'){if(m.command.type==='nuclear')fired=m.command;g.apply('guest',m.command);sendState();return;}ws.send(JSON.stringify({type:'welcome',id:'guest',host:'host',code:'ABCDEF',lanAddresses:[]}));ws.send(JSON.stringify({type:'start',players:[],options:{mode:'endless',difficulty:'easy',stage:0},seed:42}));sendState();});});
 await page.goto('http://127.0.0.1:8011/?lan=ABCDEF');await page.getByRole('button',{name:'加入房间',exact:true}).click();await expect(page.locator('canvas')).toBeVisible();
 const r=(await page.locator('canvas').boundingBox())!,scale=Math.min(r.width/36,r.height/16),ox=(r.width-36*scale)/2,oy=(r.height-16*scale)/2;
 const click=async(x:number,y:number)=>page.mouse.click(r.x+ox+x*scale,r.y+oy+(16-y)*scale);
 await click(8.5,.5);await page.getByRole('button',{name:'选择核弹落点',exact:true}).click();
 // Bring the canvas back into view after the controls scrolled it offscreen.
 await page.locator('canvas').scrollIntoViewIfNeeded();const targetRect=(await page.locator('canvas').boundingBox())!;
 await page.mouse.click(targetRect.x+ox+28*scale,targetRect.y+oy+15.5*scale);
 await expect(page.getByRole('button',{name:'确认发射 · 2000 范围伤害',exact:true})).toBeVisible();await page.getByRole('button',{name:'确认发射 · 2000 范围伤害',exact:true}).click();
 await expect.poll(()=>fired?.type).toBe('nuclear');expect(fired.x).toBeCloseTo(28,1);expect(g.e.s.coop!.strike).toBeTruthy();expect(b.cooldown).toBe(180);
 for(let i=0;i<180;i++)g.step();sendState();expect(g.e.s.enemies[0].hp).toBe(3000);await page.locator('canvas').scrollIntoViewIfNeeded();await page.screenshot({path:`../docs/nuclear-${info.project.name}.png`});expect(errors).toEqual([]);
});
