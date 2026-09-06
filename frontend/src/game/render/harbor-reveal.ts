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
  const phase=e.time%11;if(!reduced&&phase<.2){c.fillStyle=`rgba(177,214,240,${.15*(1-phase/.2)})`;c.fillRect(X(0),Y(16),36*s,16*s);c.strokeStyle='#d5f6ff';c.lineWidth=2;c.beginPath();c.moveTo(X(29),Y(16));c.lineTo(X(27.6),Y(13.7));c.lineTo(X(28.6),Y(13.8));c.lineTo(X(26),Y(10));c.stroke();}
 }
 c.restore();
}
