import {it,expect} from 'vitest';
import {writeFileSync,mkdirSync} from 'node:fs';
import {Engine} from '../src/game/engine';import type {Config,Building} from '../src/game/types';import config from '../../content/game-config.json';
function add(e:Engine,col:number,layer:number,type:string){const p=e.config.buildings[type];const b:Building={id:e.s.nextEntityId++,type,branch:-1,spent:p.cost,x:col+.5,y:layer+.5,v:0,hp:p.hp,settled:true,fallId:1,hit:[],cooldown:type==='mine'?10:0};e.s.buildings.push(b);}
it('simulates a full hour under a sustained artificial stress load',async()=>{
 const e=new Engine(config as Config,20260905,'stability');const kinds=Object.keys(config.buildings);for(let c=3;c<23;c++)for(let h=0;h<7;h++)add(e,c,h,kinds[(c+h)%8]);for(let h=0;h<10;h++)add(e,0,h,'wall');
 for(let i=0;i<180;i++)e.spawn(i%4===0?'flyer':'siege',false,25+(i%10),i%4===0?5:undefined);e.spawn('beast',false);
 let totalMs=0,maxBuildings=0,maxEnemies=0,maxShots=0,maxEffects=0;const start=performance.now();
 for(let tick=0;tick<216000;tick++){
  // This is an artificial workload, not a claimed survival or balance result.
  e.s.coreHp=1_000_000_000;if(e.s.candidates.length)e.choose(e.s.candidates[0]);
  if(tick%600===0){while(e.s.enemies.filter(x=>!e.config.enemies[x.type].boss).length<180)e.spawn(tick%1200===0?'siege':'flyer',false);}
  if(tick%3600===0){for(let c=3;c<23;c++){if(!e.s.buildings.some(b=>Math.floor(b.x)===c)){for(let h=0;h<7;h++)add(e,c,h,kinds[(c+h)%8]);}}}
  const t=performance.now();e.step();totalMs+=performance.now()-t;
  maxBuildings=Math.max(maxBuildings,e.s.buildings.length);maxEnemies=Math.max(maxEnemies,e.s.enemies.length);maxShots=Math.max(maxShots,e.s.shots.length);maxEffects=Math.max(maxEffects,e.effects.length);
  if(tick%1000===0){expect(e.s.alive).toBe(true);expect(e.s.enemies.length).toBeLessThanOrEqual(181);expect(e.s.buildings.every(b=>Number.isFinite(b.hp)&&Number.isFinite(b.y)&&b.y>=.5)).toBe(true);await new Promise(resolve=>setTimeout(resolve,0));}
 }
 expect(e.time).toBe(3600);mkdirSync('../docs',{recursive:true});writeFileSync('../docs/stability-result.json',JSON.stringify({seed:20260905,simulatedSeconds:e.time,steps:216000,elapsedMs:performance.now()-start,averageStepMs:totalMs/216000,maxBuildings,maxEnemies,maxShots,maxEffects,artificialCoreRefill:true,artificialCoreHp:1_000_000_000,artificialEnemyRefill:true,rendered:false},null,2));
},300000);
it('records two deterministic build strategies and a no-build baseline',()=>{
 const results=[];for(const layout of [0,1,2]){const e=new Engine(config as Config,20260905,'balance-'+layout);let bossSeen=false;
 for(let i=0;i<60*600&&e.s.alive;i++){
 if(e.s.candidates.length)e.choose(e.s.candidates.find(k=>k==='core_repair'||k==='attack')||e.s.candidates[0]);
 if(layout&&i%90===0){const plans=layout===1?[[5,'mine'],[21,'wall'],[21,'ballista'],[6,'mine'],[20,'wall'],[20,'ballista'],[19,'anti_air'],[18,'mortar'],[4,'mine'],[17,'repair'],[16,'frost']]:[[4,'mine'],[19,'wall'],[19,'ballista'],[5,'mine'],[18,'wall'],[18,'mortar'],[17,'anti_air'],[6,'mine'],[16,'repair'],[15,'ballista']];
 const plan=plans.find(([c,k])=>!e.s.buildings.some(b=>b.type===k&&Math.floor(b.x)===c)&&!e.invalid(String(k),Number(c)));if(plan)e.command({type:'drop',kind:String(plan[1]),column:Number(plan[0])});else{const b=e.s.buildings.find(b=>b.settled&&b.branch<0&&e.s.gold>=e.stats(b).upgradeCost);if(b)e.command({type:'upgrade',id:b.id,branch:0});}}
 e.step();if(e.s.enemies.some(a=>e.config.enemies[a.type].boss))bossSeen=true;
 }results.push({layout:layout===0?'no-build':`strategy-${layout}`,seconds:e.time,bossSeen,alive:e.s.alive,kills:e.s.kills,gold:e.s.gold});}
 mkdirSync('../docs',{recursive:true});writeFileSync('../docs/balance-result.json',JSON.stringify(results,null,2));expect(results[0].alive).toBe(false);
},120000);
