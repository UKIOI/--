import type {Engine} from '../engine';
import {drawTidalBoss} from './tidal-boss';
const bodyLayers=new WeakMap<HTMLCanvasElement,HTMLCanvasElement>();
export function drawHarborReveal(c:CanvasRenderingContext2D,e:Engine,s:number,X:(n:number)=>number,Y:(n:number)=>number,reduced:boolean,layer:'body'|'weather'='body'){
 const m=e.s.campaign;if(m?.timelineVersion!==3)return;
 c.save();
 if(layer==='body'&&e.cinematic){const frame=m.revealFrame??0,t=Math.max(0,Math.min(1,(frame-210)/510)),ease=t*t*(3-2*t);
  if(frame>=180){const glow=c.createRadialGradient(X(14),Y(3),s*.5,X(14),Y(3),s*10);glow.addColorStop(0,'#89eafc38');glow.addColorStop(1,'#05152300');c.fillStyle=glow;c.fillRect(X(0),Y(16),36*s,16*s);
   // The source is the visible wreck at world x 8.5–20.5, waterline y 2.45.
   c.strokeStyle='#c2dfdc';c.lineWidth=2;for(let i=0;i<7;i++){const x=9+i*1.7,r=reduced?.2:Math.sin(frame*.08+i)*.12;c.beginPath();c.moveTo(X(x),Y(2.45));c.lineTo(X(x+.4+r),Y(3+t*3+(i%2)*.5));c.stroke();}
   const x=14-2*ease,y=1.3+5.7*ease,w=3+8.5*ease,h=2+12*ease;
   c.save();c.beginPath();c.rect(X(6),Y(18),20*s,(18-2.3+2.3*ease)*s);c.clip();drawTidalBoss(c,X(x),Y(y),w*s,h*s,frame/60,reduced);c.restore();
   c.strokeStyle='#a5f4f6';c.lineWidth=2;for(let i=0;i<5;i++){c.beginPath();c.ellipse(X(14),Y(2.4),s*(2+i*.5+t*2),s*(.16+i*.08),0,0,Math.PI*2);c.stroke();}
  }
 }else if(layer==='body'&&m.storm){
  const a=e.s.enemies.find(a=>a.type==='leviathan'&&a.hp>0);if(a){
   // Mask only the building footprints on an isolated body layer; never erase the battlefield.
   let layer=bodyLayers.get(c.canvas);if(!layer){layer=document.createElement('canvas');bodyLayers.set(c.canvas,layer);}
   if(layer.width!==c.canvas.width||layer.height!==c.canvas.height){layer.width=c.canvas.width;layer.height=c.canvas.height;}
   const b=layer.getContext('2d')!;b.resetTransform();b.clearRect(0,0,layer.width,layer.height);b.setTransform(c.getTransform());
   drawTidalBoss(b,X(a.x),Y(a.y),11.5*s,14*s,e.time,reduced,a.attackAnim??0);
   b.save();b.globalCompositeOperation='destination-out';b.fillStyle='rgba(0,0,0,.78)';b.beginPath();
   for(const building of e.s.buildings)if(building.hp>0)b.rect(X(building.x-.5),Y(building.y+.5),s,s);
   if(e.s.coreHp>0)b.rect(X(1),Y(2),2*s,2*s);b.fill();b.restore();
   c.save();c.resetTransform();c.drawImage(layer,0,0);c.restore();
  }
 }
 if(layer==='weather'&&m.storm){
  c.fillStyle='#06182f30';c.fillRect(X(0),Y(16),36*s,16*s);c.strokeStyle='#b5d9ed70';c.lineWidth=1;
  for(let i=0;i<(reduced?65:180);i++){const x=((i*7.37+(reduced?0:e.time*5))%38)-1,y=(i*3.71+(reduced?0:e.time*14))%17;c.beginPath();c.moveTo(X(x),Y(16-y));c.lineTo(X(x-.18),Y(16-y-.8));c.stroke();}
  const phase=e.time%11;if(!reduced&&phase<1.4){
   const intensity=Math.pow(1-phase/1.4,1.3);c.fillStyle=`rgba(177,214,240,${.2*intensity})`;c.fillRect(X(0),Y(16),36*s,16*s);
   const cycle=Math.floor(e.time/11),base=27+(cycle%3)*2;
   c.save();c.globalAlpha=intensity;c.shadowColor='#b9e9ff';c.shadowBlur=10;c.strokeStyle='#dff8ff';c.lineWidth=3;
   const bolt=(points:number[][])=>{c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(X(x),Y(y)):c.moveTo(X(x),Y(y)));c.stroke();};
   bolt([[base,16],[base-1.4,14],[base-.5,14.2],[base-2.5,11.4],[base-1.9,11.6],[base-3.3,8.5]]);
   c.lineWidth=1.5;bolt([[base-1.4,14],[base-3,13.4],[base-4,11.8]]);bolt([[base-2.5,11.4],[base-.2,10.8],[base+.8,9.3]]);c.restore();
  }
 }
 c.restore();
}
