import {test,expect} from '@playwright/test';
test('new game, deploy, pause, save, reload and continue',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');
 await expect(page.getByRole('button',{name:'建立新防线'})).toBeEnabled();if(await page.getByRole('button',{name:'跳过引导'}).isVisible())await page.getByRole('button',{name:'跳过引导'}).click();await page.getByRole('button',{name:'建立新防线'}).click();
 if(await page.getByRole('button',{name:'确认新游戏'}).isVisible())await page.getByRole('button',{name:'确认新游戏'}).click();
 await expect(page.locator('canvas')).toBeVisible();const tutorial=page.getByRole('button',{name:/明白了，开始指挥/});if(await tutorial.isVisible())await tutorial.click();await expect(page.locator('.overlay')).toHaveCount(0);
 await expect(page.locator('canvas')).toBeVisible();await page.screenshot({path:'../docs/game-1280.png'});const box=(await page.locator('canvas').boundingBox())!;
 await page.keyboard.press('1');await page.mouse.click(box.x+box.width*.42,box.y+box.height*.65);await page.waitForTimeout(1700);
 await page.keyboard.press('2');await page.mouse.click(box.x+box.width*.38,box.y+box.height*.65);await page.waitForTimeout(1700);
 await page.keyboard.press('5');await page.mouse.click(box.x+box.width*.2,box.y+box.height*.65);await page.waitForTimeout(1700);await expect(page.locator('.sector-stats strong').first()).toHaveText('03');await page.screenshot({path:'../docs/game-1280.png'});
 await page.keyboard.press('Escape');
 const scale=Math.min(box.width/36,box.height/16),ox=(box.width-36*scale)/2,oy=(box.height-16*scale)/2,col=Math.floor((box.width*.42-ox)/scale);
 await page.mouse.click(box.x+ox+(col+.5)*scale,box.y+oy+15.5*scale);await expect(page.locator('.details h2')).toHaveText('城墙');await page.getByRole('button',{name:/加固墙/}).click();await expect(page.locator('.details h2')).toHaveText('加固墙');
 const demolition=await page.locator('.demolish').boundingBox();await page.mouse.move(demolition!.x+30,demolition!.y+15);await page.mouse.down();await page.waitForTimeout(1200);await page.mouse.up();await expect(page.locator('.sector-stats strong').first()).toHaveText('02');
 await page.keyboard.press('Space');await expect(page.getByText('模拟已暂停')).toBeVisible();await page.getByRole('button',{name:'游戏菜单'}).click();await page.getByRole('button',{name:'保存并返回主菜单'}).click();
 await expect(page.getByRole('button',{name:/继续防守/})).toBeEnabled();await page.reload();await page.getByRole('button',{name:/继续防守/}).click();await expect(page.getByText('模拟已暂停')).toBeVisible();expect(errors).toEqual([]);
});
test('menu fits supported desktop resolutions',async({page})=>{for(const size of [{width:1280,height:720},{width:1920,height:1080}]){await page.setViewportSize(size);await page.goto('/');await expect(page.getByRole('heading',{name:/筑起高墙/})).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.screenshot({path:`../docs/menu-${size.width}.png`});}});
