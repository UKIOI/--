export class Spatial<T extends {x:number;y:number}> {
 private cells=new Map<string,T[]>();
 rebuild(items:T[]){this.cells.clear();for(const a of items){const key=`${Math.floor(a.x/3)},${Math.floor(a.y/3)}`;const bucket=this.cells.get(key)||[];bucket.push(a);this.cells.set(key,bucket);}}
 query(x:number,y:number,r:number):T[]{const out:T[]=[];for(let i=Math.floor((x-r)/3);i<=Math.floor((x+r)/3);i++)for(let j=Math.floor((y-r)/3);j<=Math.floor((y+r)/3);j++)out.push(...this.cells.get(`${i},${j}`)||[]);return out;}
}
export const distance=(a:{x:number;y:number},b:{x:number;y:number})=>Math.hypot(a.x-b.x,a.y-b.y);
export function rayBox(x:number,y:number,tx:number,ty:number,cx:number,cy:number,w:number,h:number):number {let lo=0,hi=1;for(const [o,d,min,max] of [[x,tx-x,cx-w/2,cx+w/2],[y,ty-y,cy-h/2,cy+h/2]]){if(Math.abs(d)<1e-9){if(o<min||o>max)return Infinity;}else{const a=(min-o)/d,b=(max-o)/d;lo=Math.max(lo,Math.min(a,b));hi=Math.min(hi,Math.max(a,b));if(lo>hi)return Infinity;}}return lo;}
