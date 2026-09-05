import type {Building,Shot} from '../types';
import type {Engine} from '../engine';
import {shellPath} from '../trajectory';
export function drawWeapon(c:CanvasRenderingContext2D,e:Engine,b:Building,s:number,X:(x:number)=>number,Y:(y:number)=>number,reduced:boolean){
 const p=e.stats(b),air=b.type==='anti_air';
 const fired=[...e.effects].reverse().find(f=>f.kind===b.type&&f.x===b.x&&f.y===b.y);
 const target=b.settled?e.s.enemies.filter(a=>e.config.enemies[a.type].air===air&&Math.hypot(a.x-b.x,a.y-b.y)<=p.range&&Math.hypot(a.x-b.x,a.y-b.y)>=p.minRange).sort((a,z)=>Math.hypot(a.x-2,a.y-1)-Math.hypot(z.x-2,z.y-1)||a.id-z.id)[0]:undefined;
 const tx=e.controlled===b.id?e.aim.x:fired?.tx??target?.x??b.x+5,ty=e.controlled===b.id?e.aim.y:fired?.ty??target?.y??b.y;
 const angle=b.type==='mortar'?shellPath({originX:b.x,originY:b.y,x:tx,y:ty},0).angle:Math.atan2(ty-b.y,tx-b.x);
 const age=fired?.life??0,recoil=reduced?0:Math.max(0,age-.12)*.65;
 c.save();c.translate(X(b.x),Y(b.y));c.scale(s,s);
 c.fillStyle='#465951';c.fillRect(-.29,.23,.58,.12);c.fillStyle='#b7c1a1';c.beginPath();c.arc(0,.08,.19,0,Math.PI*2);c.fill();
 c.rotate(-angle);c.translate(-recoil,0);
 c.fillStyle=b.type==='mortar'?'#e6a577':air?'#9ed7ce':'#dbc18c';
 if(b.type==='sniper'){c.fillRect(-.2,-.07,.92,.14);c.fillStyle='#effbff';c.fillRect(.68,-.09,.09,.18);c.fillStyle='#7fbbc8';c.fillRect(-.04,-.19,.2,.1);}else if(b.type==='ballista'){c.fillRect(-.2,-.035,.69,.07);c.strokeStyle='#d9c696';c.lineWidth=.05;c.beginPath();c.moveTo(.23,-.28);c.quadraticCurveTo(.48,0,.23,.28);c.stroke();c.strokeStyle='#85978a';c.lineWidth=.018;c.beginPath();c.moveTo(.23,-.28);c.lineTo(-.17,0);c.lineTo(.23,.28);c.stroke();}
 else if(air){c.fillRect(-.1,-.15,.58,.075);c.fillRect(-.1,.075,.58,.075);}else{c.fillRect(-.15,-.12,.63,.24);c.fillStyle='#293b36';c.fillRect(.31,-.14,.1,.28);c.fillStyle='#f3cc96';c.fillRect(.44,-.13,.055,.26);}
 if(b.branch===0){c.strokeStyle='#fff0b7';c.lineWidth=.04;c.strokeRect(.04,-.17,.33,.34);if(b.type==='sniper')c.fillRect(.6,-.045,.28,.09);if(b.type==='ballista'){c.beginPath();c.moveTo(.17,-.38);c.lineTo(.4,0);c.lineTo(.17,.38);c.stroke();}}
 if(b.branch===1){c.fillStyle='#a6ded6';if(b.type==='mortar'||b.type==='cannon'||b.type==='anti_air'){c.fillRect(-.12,-.24,.59,.065);c.fillRect(-.12,.18,.59,.065);}else if(b.type==='sniper'){c.fillRect(-.1,-.23,.3,.09);}else{c.strokeStyle='#a6ded6';c.lineWidth=.035;c.beginPath();c.arc(-.15,0,.21,0,Math.PI*2);c.stroke();}}
 if(age>.16){c.globalAlpha=Math.min(1,(age-.16)*8);c.fillStyle='#fff2c0';c.beginPath();c.moveTo(.47,-.13);c.lineTo(.8,-.21);c.lineTo(.69,-.04);c.lineTo(.99,0);c.lineTo(.69,.07);c.lineTo(.79,.2);c.lineTo(.47,.13);c.closePath();c.fill();}
 c.restore();
}
export function drawShell(c:CanvasRenderingContext2D,shot:Shot,s:number,X:(x:number)=>number,Y:(y:number)=>number,reduced:boolean){
 const t=Math.max(0,Math.min(1,1-shot.remaining/shot.duration));const path=(t:number)=>(shot.kind==='cannon'||shot.kind==='arrow'||shot.kind==='bullet')?{x:(shot.originX??shot.x)+(shot.x-(shot.originX??shot.x))*t,y:(shot.originY??shot.y)+(shot.y-(shot.originY??shot.y))*t,angle:Math.atan2(shot.y-(shot.originY??shot.y),shot.x-(shot.originX??shot.x))}:shellPath(shot,t);const p=path(t);
 if(!reduced){for(let i=8;i>0;i--){const a=path(Math.max(0,t-i*.014)),b=path(Math.max(0,t-(i-1)*.014));c.strokeStyle=`rgba(246,190,111,${(9-i)/18})`;c.lineWidth=Math.max(1,s*.065);c.beginPath();c.moveTo(X(a.x),Y(a.y));c.lineTo(X(b.x),Y(b.y));c.stroke();}}
 c.save();c.translate(X(p.x),Y(p.y));c.rotate(-p.angle);
 if(shot.kind==='bullet'){c.fillStyle='#cceeff';c.strokeStyle='#fff8d6';c.lineWidth=1.3;c.beginPath();c.roundRect(-Math.max(5,s*.23),-2.5,Math.max(12,s*.6),5,2.5);c.fill();c.stroke();c.fillStyle='#fff1b7';c.fillRect(-Math.max(8,s*.36),-1,5,2);}else if(shot.kind==='arrow'){
  const unit=Math.max(s,24);c.strokeStyle='#2b241c';c.lineWidth=4;c.beginPath();c.moveTo(-unit*.38,0);c.lineTo(unit*.35,0);c.stroke();c.strokeStyle='#f0d5a1';c.lineWidth=2;c.stroke();
  c.fillStyle='#eff7e5';c.beginPath();c.moveTo(unit*.49,0);c.lineTo(unit*.23,-unit*.105);c.lineTo(unit*.28,0);c.lineTo(unit*.23,unit*.105);c.closePath();c.fill();
  c.fillStyle='#b8c8a0';for(const sign of [-1,1]){c.beginPath();c.moveTo(-unit*.22,0);c.lineTo(-unit*.36,sign*unit*.12);c.lineTo(-unit*.49,sign*unit*.12);c.lineTo(-unit*.37,0);c.closePath();c.fill();}
 }else if(shot.kind==='cannon'){
  const r=Math.max(4,s*.17);const g=c.createRadialGradient(-r*.3,-r*.4,.4,0,0,r);g.addColorStop(0,'#fbdfaa');g.addColorStop(.4,'#b7afa0');g.addColorStop(1,'#414d49');c.fillStyle=g;c.strokeStyle='#ffe6ac';c.lineWidth=1.3;c.beginPath();c.arc(0,0,r,0,Math.PI*2);c.fill();c.stroke();c.fillStyle='#ffc473';c.beginPath();c.moveTo(-r, -r*.4);c.lineTo(-r*2.1,0);c.lineTo(-r,r*.4);c.fill();
 }else{c.fillStyle='#f7cb8e';c.strokeStyle='#fff3ce';c.lineWidth=1;c.beginPath();c.moveTo(s*.2,0);c.lineTo(s*.04,-s*.085);c.lineTo(-s*.16,-s*.085);c.lineTo(-s*.16,s*.085);c.lineTo(s*.04,s*.085);c.closePath();c.fill();c.stroke();}c.restore();
}
export function drawBlast(c:CanvasRenderingContext2D,x:number,y:number,s:number,life:number,reduced:boolean){
 const t=Math.max(0,.55-life)/.55;c.save();c.translate(x,y);
 if(reduced){c.strokeStyle='#ffc68c';c.lineWidth=2;c.beginPath();c.arc(0,0,s*.7,0,Math.PI*2);c.stroke();c.restore();return;}
 c.globalAlpha=1-t;const r=s*(.18+t*1.8);const glow=c.createRadialGradient(0,0,0,0,0,r);glow.addColorStop(0,'#fff5cd');glow.addColorStop(.24,'#ffc471');glow.addColorStop(.58,'#de7e4266');glow.addColorStop(1,'#d9672700');c.fillStyle=glow;c.beginPath();c.arc(0,0,r,0,Math.PI*2);c.fill();
 c.strokeStyle='#f3c995';c.lineWidth=Math.max(1,3*(1-t));c.beginPath();c.ellipse(0,s*.1,s*(.3+t*1.6),s*(.12+t*.48),0,0,Math.PI*2);c.stroke();
 for(let i=0;i<10;i++){const a=i*2.399,dist=s*t*(.7+(i%4)*.33);c.strokeStyle=i%2?'#fed597':'#d9935f';c.lineWidth=1.5;c.beginPath();c.moveTo(Math.cos(a)*dist,Math.sin(a)*dist-t*s*.4);c.lineTo(Math.cos(a)*(dist+s*.13),Math.sin(a)*(dist+s*.13)-t*s*.4);c.stroke();}c.restore();
}

