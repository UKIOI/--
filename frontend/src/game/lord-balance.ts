import type {Config} from './types';
// Nominal sustained damage: 20 unupgraded towers, 120 seconds, before armor or buffs.
export const lordHealth=(config:Config)=>Math.ceil(20*120*config.buildings.sniper.damage/config.buildings.sniper.interval);
