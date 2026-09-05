import legacy from '../../../content/balance-v1.json' with {type:'json'};
import type {Config,World} from './types';
export function migrateBalance(s:World,c:Config){
 if((s.balanceRevision??1)>=(c.balanceRevision??1))return;
 for(const b of s.buildings){const old=legacy.buildings[b.type as keyof typeof legacy.buildings],next=c.buildings[b.type];if(!old||!next)continue;const a={...old,...(b.branch>=0?old.branches[b.branch]:{})},z={...next,...(b.branch>=0?next.branches[b.branch]:{})};b.hp*=z.hp/a.hp;}
 for(const e of s.enemies){const old=legacy.enemies[e.type as keyof typeof legacy.enemies],next=c.enemies[e.type];if(!old||!next)continue;const ratio=next.hp/old.hp;e.hp*=ratio;e.maxHp*=ratio;e.shield*=e.type==='reflector'?c.schedule.reflectShield/legacy.schedule.reflectShield:ratio;e.armor=Math.min(.6,Math.max(0,e.armor-old.armor+next.armor));e.reward=Math.round(e.reward*next.reward/old.reward);}
 s.balanceRevision=c.balanceRevision??1;
}
