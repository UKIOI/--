import finaleV2 from '../../../content/campaign-finale-v2.json' with {type:'json'};
import legacyFinale from '../../../content/campaign-finale-legacy.json' with {type:'json'};
import data from '../../../content/campaigns.json' with {type:'json'};
import type {Difficulty} from './types';import type {BackgroundId} from './render/backgrounds';import {EVENTS} from './incidents';
export interface Campaign {bossTimes?:number[];reliefStart?:number;reliefEnd?:number;title:string;map:string;background:BackgroundId;difficulty:Difficulty;gold:number;bossAt:number;bosses:string[];newBuildings:string[];newEnemies:string[];events:(keyof typeof EVENTS)[];buildings:string[];enemies:string[];story:string;hint:string;outro:string}
export const CAMPAIGNS=data as Campaign[];

export function campaignFor(stage:number,timelineVersion?:number|null):Campaign{return stage!==4?CAMPAIGNS[stage]:timelineVersion===3?CAMPAIGNS[stage]:timelineVersion===2?finaleV2 as Campaign:legacyFinale as Campaign;}

// Presentation only: never change the encounter schedule or saved campaign data.
export function campaignIntel(chapter:Campaign,unlocked:boolean):Campaign{
 if(unlocked||!chapter.bosses.includes('leviathan'))return chapter;
 return {...chapter,bosses:chapter.bosses.filter(k=>k!=='leviathan'),story:'黎明计划抵达最后的港湾。守住海岸核心，在废弃船坞建立防线，迎击虫群与敌方舰队。',hint:'4:00 虫巢女王登场；8:00—10:00 来袭压力减弱，抓紧整备；10:00 外星母舰抵达，准备拦截导弹与轰炸。'};
}
