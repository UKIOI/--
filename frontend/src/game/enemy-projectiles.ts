import type {Shot} from './types';
/** Flight starts at the carrier's release position. No render state drives damage. */
export function enemyProjectilePosition(s:Shot,t:number){
 const x=s.originX??s.x,y=s.originY??10;
 return {x:x+(s.x-x)*t,y:s.kind==='rock'&&s.visual!=='meteor'?y+(s.y-y)*t+12*t*(1-t):y+(s.y-y)*t*t};
}
