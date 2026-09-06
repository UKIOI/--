import data from '../../../content/campaigns.json' with {type:'json'};
import type {Difficulty} from './types';import type {BackgroundId} from './render/backgrounds';import {EVENTS} from './incidents';
export interface Campaign {title:string;map:string;background:BackgroundId;difficulty:Difficulty;gold:number;bossAt:number;bosses:string[];newBuildings:string[];newEnemies:string[];events:(keyof typeof EVENTS)[];buildings:string[];enemies:string[];story:string;hint:string;outro:string}
export const CAMPAIGNS=data as Campaign[];
