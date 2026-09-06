import {NUCLEAR_RADIUS} from '../src/game/coop-buildings';
import {it,expect} from 'vitest';
import {CoopGame} from '../src/game/coop';
import {Engine} from '../src/game/engine';
import config from '../../content/game-config.json';
function make(n=2){const g=new CoopGame(config,Array.from({length:n},(_,i)=>({id:String(i),name:String(i),color:'#fff'})),{mode:'test',difficulty:'easy',stage:0},42);g.e.s.coop!.players.forEach(p=>p.gold=100000);g.e.s.nextBoss=g.e.s.nextEvent=g.e.s.nextPerk=999999;g.e.s.spawnCredit=-999999;return g;}
function add(g:CoopGame,type:string,column=8){g.e.s.coop!.players[0].cooldown=0;expect(g.apply('0',{type:'drop',kind:type,column})).toBe('');const b=g.e.s.buildings.at(-1)!;b.y=.5;b.v=0;b.settled=true;return b;}
it('scales sniper caps and opens eight interceptors only after the left front opens',()=>{
 for(let n=1;n<=4;n++){const g=make(n);expect(g.e.buildingLimit('sniper')).toBe(n*20);expect(g.e.buildingLimit('interceptor')).toBe(4);g.e.s.tick=600*60;expect(g.e.buildingLimit('interceptor')).toBe(8);}
 expect(new Engine(config).buildingLimit('sniper')).toBe(20);
});
it('upgrades walls to level five and mines to four without changing branch or healing damage',()=>{
 for(const [kind,max] of [['wall',5],['mine',4]] as const){const g=make(),b=add(g,kind);b.hp/=2;let last=g.e.stats(b);
  for(let level=2;level<=max;level++){expect(g.apply('0',{type:'upgradeMany',ids:[b.id],branch:0})).toBe('');expect(g.e.buildingLevel(b)).toBe(level);const stats=g.e.stats(b);expect(b.hp/stats.hp).toBeCloseTo(.5);expect(stats.hp).toBeGreaterThan(last.hp);if(kind==='mine')expect(stats.production).toBeGreaterThan(last.production);last=stats;}
  expect(g.e.upgradeSelection([b.id],0).buildings).toHaveLength(0);expect(g.e.upgradeSelection([b.id],1).buildings).toHaveLength(0);
 }
});
it('nuclear silo is once per team per run, needs charge, and only its owner can fire',()=>{
 const g=make(),b=add(g,'nuclear');expect(b.cooldown).toBe(180);expect(g.apply('0',{type:'nuclear',id:b.id,x:35,y:12})).toContain('充能');b.cooldown=0;
 expect(g.apply('1',{type:'nuclear',id:b.id,x:35,y:12})).toContain('自己的');expect(g.apply('0',{type:'nuclear',id:b.id,x:35,y:12})).toBe('');expect(b.cooldown).toBe(180);expect(g.e.s.coop!.strike?.x).toBe(35);
 b.hp=0;g.e.s.coop!.players[1].cooldown=0;expect(g.apply('1',{type:'drop',kind:'nuclear',column:10})).toContain('不能重建');
 for(let i=0;i<180;i++)g.step();expect(g.e.s.coop!.strike).toBeNull();expect(g.e.effects.some(f=>f.kind==='nuclear')).toBe(true);
});
it('nuclear explosion deals fixed damage to air, ground and friendly structures, including the core',()=>{
 const g=make(),wall=add(g,'wall',4);wall.hp=5000;const nearEdge=add(g,'wall',17);nearEdge.hp=5000;const outside=add(g,'wall',20);outside.hp=5000;
 for(const type of ['grunt','flyer']){g.e.spawn(type,false,4,1);const enemy=g.e.s.enemies.at(-1)!;enemy.hp=enemy.maxHp=5000;enemy.shield=0;enemy.armor=.5;}
 g.e.nuclearBlast(4,1,NUCLEAR_RADIUS);expect(g.e.s.enemies.map(e=>e.hp)).toEqual([3000,3000]);expect(wall.hp).toBe(3000);expect(nearEdge.hp).toBe(3000);expect(outside.hp).toBe(5000);expect(g.e.s.coreHp).toBe(config.world.coreHp-2000);
});
