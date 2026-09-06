import type {Config} from './types';
// Half the original nominal HP, rounded up; retain the sniper-based baseline.
export const lordHealth=(config:Config)=>Math.ceil(Math.ceil(20*120*config.buildings.sniper.damage/config.buildings.sniper.interval)/2);
