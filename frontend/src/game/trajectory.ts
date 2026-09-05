import type {Shot} from './types';
export function shellPath(s:Pick<Shot,'x'|'y'|'originX'|'originY'>,t:number){
 const x=s.originX??s.x,y=s.originY??s.y;
 const arc=Math.min(4,Math.max(1.8,Math.abs(s.x-x)*.35));
 return {x:x+(s.x-x)*t,y:y+(s.y-y)*t+4*arc*t*(1-t),angle:Math.atan2(s.y-y+4*arc*(1-2*t),s.x-x)};
}
export function mortarLaunch(x:number,y:number,tx:number,ty:number){const angle=shellPath({originX:x,originY:y,x:tx,y:ty},0).angle;return {originX:x+Math.cos(angle)*.46,originY:y+Math.sin(angle)*.46};}
