import {NUCLEAR_RADIUS} from '../coop-buildings';
import type {Engine} from '../engine';
export function drawNuclear(c:CanvasRenderingContext2D,e:Engine,s:number,X:(x:number)=>number,Y:(y:number)=>number){
 const strike=e.s.coop?.strike;
 c.save();
 if(strike){
  c.fillStyle='#ff733333';c.strokeStyle='#ffc574';c.lineWidth=2;c.setLineDash([8,5]);c.beginPath();c.arc(X(strike.x),Y(strike.y),NUCLEAR_RADIUS*s,0,Math.PI*2);c.fill();c.stroke();c.setLineDash([]);
  const t=Math.max(0,Math.min(1,1-strike.remaining/3)),x=strike.originX+(strike.x-strike.originX)*t,y=strike.originY+(strike.y-strike.originY)*t+Math.sin(t*Math.PI)*7;
  c.strokeStyle='#ffbf71';c.lineWidth=4;c.beginPath();c.moveTo(X(x),Y(y));c.lineTo(X(x)-5,Y(y)+20);c.stroke();c.fillStyle='#fff1c3';c.beginPath();c.ellipse(X(x),Y(y),.13*s,.4*s,0,0,Math.PI*2);c.fill();
  c.font='bold 15px Microsoft YaHei';c.fillStyle='#ffe0a6';c.fillText(`☢ ${Math.ceil(strike.remaining)} 秒 · 敌我伤害 2000`,X(strike.x)-90,Y(strike.y)-12);
 }
 for(const f of e.effects.filter(f=>f.kind==='nuclear')){
  const t=Math.max(0,1-f.life/2.5),radius=f.tx*s*(.15+t);c.globalAlpha=Math.max(0,f.life/2.5);const g=c.createRadialGradient(X(f.x),Y(f.y),0,X(f.x),Y(f.y),Math.max(1,radius));g.addColorStop(0,'#fffbd3');g.addColorStop(.3,'#ffc46c');g.addColorStop(1,'#ff542000');c.fillStyle=g;c.beginPath();c.arc(X(f.x),Y(f.y),radius,0,Math.PI*2);c.fill();c.strokeStyle='#ffddac';c.lineWidth=4;c.stroke();
 }
 c.restore();
}
