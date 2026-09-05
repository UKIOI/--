import {it,expect} from 'vitest';
import {Engine} from '../src/game/engine';
import config from '../../content/game-config.json';
const make=()=>new Engine(config,123,'progression');
it('easy allows twenty snipers including falling ones and switches limits without deleting towers',()=>{
 const e=make();e.s.gold=10000;
 for(let i=0;i<19;i++)e.s.buildings.push({id:e.s.nextEntityId++,type:'sniper',branch:-1,spent:190,x:i+.5,y:4.5,v:0,hp:config.buildings.sniper.hp,settled:false,fallId:1,hit:[],cooldown:0});
 e.command({type:'drop',kind:'sniper',column:20});e.command({type:'drop',kind:'sniper',column:21});e.step();
 expect(e.buildingCount('sniper')).toBe(20);expect(e.s.gold).toBe(9810);expect(e.invalid('sniper',21)).toContain('20');
 e.setDifficulty('hard');expect(e.buildingLimit('sniper')).toBe(20);expect(e.buildingCount('sniper')).toBe(20);
 e.setDifficulty('normal');expect(e.buildingLimit('sniper')).toBe(20);
 e.setDifficulty('easy');expect(e.buildingLimit('sniper')).toBe(20);
 const copy=new Engine(config,1,'',e.snapshot());expect(copy.buildingLimit('sniper')).toBe(20);
});
it('ordinary enemies and every boss continue growing beyond an hour',()=>{
 for(const type of ['grunt','beast','carrier','sandworm','queen','tempest']){
  const values=[10,30,60,120].map(m=>{const e=make();e.s.tick=m*3600;e.spawn(type,false);return e.s.enemies[0];});
  for(let i=1;i<values.length;i++){expect(values[i].maxHp).toBeGreaterThan(values[i-1].maxHp);expect(values[i].attackScale).toBeGreaterThan(values[i-1].attackScale);}
 }
 const e=make();e.spawn('beast',false);const first=e.s.enemies[0];e.s.enemies=[];e.spawn('beast',false);expect(e.s.enemies[0].maxHp/first.maxHp).toBeCloseTo(1.15);expect(e.s.enemies[0].attackScale/first.attackScale).toBeCloseTo(1.08);
});
it('living enemies grow at minute boundaries without healing ratios; save and pause remain deterministic',()=>{
 const e=make();e.s.tick=59*60+59;e.s.nextBoss=99999;e.s.nextEvent=99999;e.s.nextPerk=99999;e.spawn('reflector',false);const a=e.s.enemies[0];a.hp=a.maxHp*.4;a.shield*=.5;
 const oldHp=a.maxHp,oldShield=a.shield,oldDamage=a.attackScale;const copy=new Engine(config,1,'',e.snapshot());copy.step();expect(copy.s.tick).toBe(e.s.tick);copy.paused=false;e.step();copy.step();
 expect(a.maxHp/oldHp).toBeCloseTo(1.12);expect(a.hp/a.maxHp).toBeCloseTo(.4);expect(a.shield/oldShield).toBeCloseTo(1.12);expect(a.attackScale/oldDamage).toBeCloseTo(1.07);expect(e.snapshot()).toEqual(copy.snapshot());
});
