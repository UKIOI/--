import {it,expect} from 'vitest';import {writeFileSync} from 'node:fs';import {Engine} from '../src/game/engine';import type {Config,Difficulty} from '../src/game/types';import current from '../../content/game-config.json';import previous from '../../content/balance-v1.json';
it('compares legal build strategies across seeds and difficulty without artificial income or healing',()=>{
 const rows=[];for(const [version,config] of [['before',previous],['after',current]] as const)for(const mode of ['easy','normal','hard'] as Difficulty[])for(const seed of [123,733,20260905])for(const style of ['mixed','cannon','sniper']){
  const e=new Engine(config as Config,seed,'study');e.setDifficulty(mode);const weapons=style==='mixed'?['ballista','mortar','cannon','sniper','ballista','cannon']:Array(6).fill(style);
  const plan:[number,string][]=[[4,'mine'],[20,'wall'],[20,'ballista'],[17,'anti_air'],[5,'mine'],[19,weapons[0]],[18,'wall'],[18,weapons[1]],[16,'repair'],[6,'mine'],[17,'anti_air'],[19,'frost'],[18,weapons[2]],[19,weapons[3]],[17,'anti_air'],[16,'amplifier'],[18,weapons[4]],[19,weapons[5]],[16,'repair']];
  for(let tick=0;tick<60*720&&e.s.alive;tick++){
   if(e.s.candidates.length)e.choose(e.s.candidates.find(k=>k==='core_repair')||e.s.candidates.find(k=>k==='attack')||e.s.candidates[0]);
   if(tick%90===0){const emergency=e.s.buildings.find(b=>b.type==='wall'&&b.settled&&b.branch<0&&b.hp<e.stats(b).hp*.65&&e.s.gold>=e.stats(b).upgradeCost);if(emergency){e.command({type:'upgrade',id:emergency.id,branch:0});e.step();continue;}const counts=new Map<string,number>();const missing=plan.find(([col,k])=>{const key=col+':'+k,n=(counts.get(key)||0)+1;counts.set(key,n);return e.s.buildings.filter(b=>Math.floor(b.x)===col&&b.type===k).length<n;});
    if(missing&&!e.invalid(missing[1],missing[0]))e.command({type:'drop',kind:missing[1],column:missing[0]});else if(!missing){const b=e.s.buildings.find(b=>b.settled&&b.branch<0&&e.s.gold>=e.stats(b).upgradeCost);if(b)e.command({type:'upgrade',id:b.id,branch:0});}
   }e.step();
  }
  rows.push({version,mode,seed,style,seconds:Math.round(e.time),alive:e.s.alive,kills:e.s.kills,bossKills:e.s.bossKills,gold:e.s.gold});expect(Number.isFinite(e.s.coreHp)).toBe(true);
 }
 writeFileSync('../docs/balance-v2-study.json',JSON.stringify({simulatedLimitSeconds:720,artificialIncome:false,artificialHealing:false,notes:'Fixed legal build policies; limited seeds; not human play or proof of global balance.',rows},null,2));
},120000);
