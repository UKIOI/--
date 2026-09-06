import {coopScaling} from './coop-scaling';
import {coopConfig,NUCLEAR_RADIUS,NUCLEAR_COOLDOWN} from './coop-buildings';
import {Engine} from './engine';
import type {Config,Command,Difficulty} from './types';
export interface Player {id:string;name:string;color:string}
export interface Options {mode:'endless'|'test'|'campaign';difficulty:Difficulty;stage:number}
export class CoopGame {
 e:Engine;
 removals=new Map<string,{id:number;remaining:number}>();
 constructor(config:Config,players:Player[],options:Options,seed:number,readonly hostId=players[0]?.id){
  const scaled=coopConfig(config),rate=coopScaling(players.length,options.mode==='campaign').rate;scaled.schedule.enemyCap=Math.ceil(config.schedule.enemyCap*rate);scaled.schedule.eventReserve=Math.ceil((config.schedule.eventReserve??0)*rate);this.e=new Engine(scaled,seed,'lan-'+seed);
  if(options.mode==='campaign')this.e.startCampaign(options.stage);else{this.e.setDifficulty(options.difficulty);this.e.s.testMode=options.mode==='test';}
  this.e.s.coop={players:players.map(p=>({...p,gold:this.e.s.gold,cooldown:0}))};
 }
 apply(id:string,c:any):string{
  const e=this.e,p=e.s.coop!.players.find(p=>p.id===id);if(!p||!c||typeof c!=='object')return '无效指令';
  const owned=(n:number)=>e.s.buildings.some(b=>b.id===n&&b.owner===id&&b.hp>0);
  if(c.type==='aim'){
   if(!Array.isArray(c.ids)||c.ids.length>300||!Number.isFinite(c.x)||!Number.isFinite(c.y))return '无效瞄准';
   e.coopOrders[id]={ids:c.ids.filter((n:number)=>owned(n)&&e.stats(e.s.buildings.find(b=>b.id===n)!).damage>0),aim:{x:Math.max(-32,Math.min(36,c.x)),y:Math.max(0,Math.min(16,c.y)),fire:!!c.fire}};return '';
  }
  if(c.type==='drop'&&(typeof c.kind!=='string'||!Object.hasOwn(e.config.buildings,c.kind)))return '未知建筑';
  if(c.type==='drop'&&c.kind==='decoy'&&id!==this.hostId)return '投影塔仅房主可建造';
  if(!e.running)return '战斗暂停或已结束';
  if(c.type==='nuclear'){const b=e.s.buildings.find(b=>b.id===c.id&&b.owner===id&&b.hp>0&&b.settled&&b.type==='nuclear');if(!b)return '请选择自己的已落稳核弹发射井';if(b.cooldown>1e-7||e.s.coop!.strike)return '核弹尚在充能';if(!Number.isFinite(c.x)||!Number.isFinite(c.y)||c.x<(e.leftOpen?-32:0)||c.x>36||c.y<0||c.y>16)return '目标超出战场';b.cooldown=NUCLEAR_COOLDOWN;e.s.coop!.strike={x:c.x,y:c.y,originX:b.x,originY:b.y,remaining:3};e.alert={title:'核弹已发射 / 友军注意避让',detail:`3 秒后爆炸 · 半径 ${NUCLEAR_RADIUS} 格 · 敌我均承受 2000 伤害`,until:e.time+3};e.sounds.push('alarm');return '';}
  if(!['drop','upgrade','upgradeMany','demolish','cancelDemolish','relocate'].includes(c.type))return '未知指令';
  if(c.type==='upgradeMany'){if(!Array.isArray(c.ids)||c.ids.length>300||!c.ids.every(owned))return '只能操作自己的建筑';}
  else if(!['drop','cancelDemolish'].includes(c.type)&&!owned(c.id))return '只能操作自己的建筑';
  if(['drop','relocate'].includes(c.type)&&(!Number.isInteger(c.column)||(c.layer!==undefined&&!Number.isInteger(c.layer))))return '无效落点';
  if(c.type==='cancelDemolish'){this.removals.delete(id);return '';}
  if(c.type==='demolish'){this.removals.set(id,{id:c.id,remaining:.3});return '';}
  e.s.gold=p.gold;e.s.dropCooldown=p.cooldown;
  const before=e.s.nextEntityId;
  const error=c.type==='drop'?e.invalid(c.kind,c.column,c.layer):c.type==='relocate'?e.relocationError(c.id,c.column,c.layer):'';
  if(!error){e.s.commands.push(c as Command);e.commands();}
  for(const b of e.s.buildings)if(b.id>=before&&!b.owner){b.owner=id;if(b.type==='nuclear'){b.cooldown=NUCLEAR_COOLDOWN;e.s.coop!.nuclearBuilt=true;}}
  p.gold=e.s.gold;p.cooldown=e.s.dropCooldown;
  return error;
 }
 step(){
  const e=this.e;if(e.paused)return;const running=e.running,storm=!!e.s.campaign?.storm;
  e.step();
  if(!running)return;
  const strike=e.s.coop!.strike;if(strike){strike.remaining-=1/60;if(strike.remaining<=1e-8){e.s.coop!.strike=null;e.nuclearBlast(strike.x,strike.y,NUCLEAR_RADIUS);}}
  for(const p of e.s.coop!.players)p.cooldown=Math.max(0,p.cooldown-1/60);
  if(!storm&&e.s.campaign?.storm)for(const p of e.s.coop!.players)p.cooldown/=2;
  for(const [id,r] of this.removals){r.remaining-=1/60;if(r.remaining>1e-8)continue;const b=e.s.buildings.find(b=>b.id===r.id&&b.owner===id&&b.hp>0&&b.settled);if(b){e.creditGold(e.refund(b),id);b.hp=0;}this.removals.delete(id);}
 }
}
