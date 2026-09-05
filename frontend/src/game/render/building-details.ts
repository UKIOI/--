import type {Building} from '../types';
/** Structural damage overlays and distinct equipment for every upgrade path. */
export function buildingDetails(c:CanvasRenderingContext2D,b:Building,maxHp:number,x:number,y:number,s:number,time:number,reduced:boolean){
 c.save();c.translate(x,y);c.scale(s,s);const ratio=b.hp/maxHp,heavy=b.branch===0;
 c.strokeStyle=heavy?'#e9ce92':'#a3e0da';c.fillStyle=heavy?'#ac9260':'#6bacac';c.lineWidth=.045;
 const line=(x:number,y:number,tx:number,ty:number)=>{c.beginPath();c.moveTo(x,y);c.lineTo(tx,ty);c.stroke();};
 if(b.branch>=0){
  if(b.type==='wall'){if(heavy){for(const x of [-.29,.29]){c.fillRect(x-.055,-.4,.11,.8);for(const y of [-.3,0,.3]){c.fillStyle='#e7d4a1';c.fillRect(x-.025,y,.05,.05);}}}else for(const y of [-.3,0,.3]){c.beginPath();c.moveTo(.3,y-.1);c.lineTo(.61,y);c.lineTo(.3,y+.1);c.closePath();c.fill();}}
  else if(b.type==='mine'){if(heavy){line(-.32,-.3,.32,.3);line(.32,-.3,-.32,.3);c.fillRect(-.4,.25,.8,.1);}else{for(const x of [-.27,.27]){c.beginPath();c.arc(x,.2,.13,0,Math.PI*2);c.stroke();}line(-.25,-.25,.25,-.25);}}
  else if(b.type==='repair'){if(heavy){for(const x of [-.34,.25]){c.fillRect(x,-.2,.09,.48);line(x,-.2,0,-.36);}}else{c.beginPath();c.arc(0,0,.39,0,Math.PI*2);c.stroke();line(0,-.39,0,-.6);}}
  else if(b.type==='frost'){for(let i=0;i<(heavy?4:6);i++){const a=i*Math.PI*2/(heavy?4:6);line(Math.cos(a)*.23,Math.sin(a)*.23,Math.cos(a)*.47,Math.sin(a)*.47);}if(!heavy){c.beginPath();c.arc(0,0,.38,0,Math.PI*2);c.stroke();}}
  else if(b.type==='amplifier'){if(heavy){c.fillRect(-.35,.23,.16,.15);c.fillRect(.19,.23,.16,.15);line(-.27,.22,0,-.3);line(.27,.22,0,-.3);}else for(const r of [.32,.46]){c.beginPath();c.arc(0,-.08,r,Math.PI*1.1,Math.PI*1.9);c.stroke();}}
  else if(b.type!=='bridge'){if(heavy){c.fillRect(-.4,.18,.16,.18);c.fillRect(.24,.18,.16,.18);}else{c.beginPath();c.arc(-.26,.2,.14,0,Math.PI*2);c.stroke();line(-.3,-.22,-.3,-.46);}}
 }
 if(ratio<.7){c.strokeStyle='#101915';c.lineWidth=.075;line(-.32,-.37,-.12,-.15);line(-.12,-.15,-.23,.05);line(-.23,.05,.04,.23);c.strokeStyle='#bd835f';c.lineWidth=.025;line(-.29,-.37,-.09,-.15);}
 if(ratio<.35){c.fillStyle='#101915';c.beginPath();c.moveTo(.48,.05);c.lineTo(.21,.17);c.lineTo(.32,.39);c.lineTo(.48,.46);c.closePath();c.fill();c.strokeStyle='#d38858';line(.21,.17,.15,.35);
  if(!reduced){for(let i=0;i<3;i++){const t=(time*.55+i*.3+b.id*.07)%1;c.globalAlpha=(1-t)*.5;c.fillStyle='#9d9885';c.beginPath();c.arc(-.16+t*.15,-.32-t*.9,.06+t*.12,0,Math.PI*2);c.fill();}c.globalAlpha=1;}c.fillStyle='#f6ae67';c.fillRect(-.23,-.2,.06,.08);
 }c.restore();
}
