import type {Building} from '../types';
/** Propagate from real anchors; a floating bridge cycle cannot support itself. */
export function supportedBuildings(buildings:Building[]):Set<number>{
 const settled=buildings.filter(b=>b.hp>0&&b.settled),supported=new Set<number>();
 let changed=true;
 while(changed){changed=false;for(const b of settled){if(supported.has(b.id))continue;
 const base=b.y===.5||((b.x===1.5||b.x===2.5)&&b.y===2.5);
 const below=settled.some(a=>supported.has(a.id)&&a.x===b.x&&Math.abs(a.y+1-b.y)<1e-6);
 const side=b.type==='bridge'&&(((b.x===.5||b.x===3.5)&&b.y<2)||settled.some(a=>supported.has(a.id)&&Math.abs(a.x-b.x)===1&&a.y===b.y));
 if(base||below||side){supported.add(b.id);changed=true;}
 }}return supported;
}
