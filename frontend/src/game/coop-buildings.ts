import type {Config,Stats} from './types';
export const NUCLEAR_RADIUS=14;
export const NUCLEAR_COOLDOWN=180;
export function coopConfig(config:Config):Config{
 const c=structuredClone(config);
 c.buildings.nuclear={...c.buildings.interceptor,name:'核弹发射井',icon:'☢',description:'2000 G，全队每局仅能建造一次。落稳后充能 180 秒，手动瞄准任意位置；半径 14 格内敌我单位、建筑与核心均承受 2000 伤害。',cost:2000,hp:600,impact:0,damage:0,range:0,interval:NUCLEAR_COOLDOWN,radius:NUCLEAR_RADIUS,limit:1,upgradeCost:0,branches:[]} as Stats;
 return c;
}
