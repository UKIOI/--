import type {Engine} from '../engine';
import {enemyProjectilePosition} from '../enemy-projectiles';
export function drawEnemyAttacks(c:CanvasRenderingContext2D,e:Engine,s:number,X:(x:number)=>number,Y:(y:number)=>number,reduced:boolean){
 const line=(x:number,y:number,tx:number,ty:number,color:string,width=1)=>{c.beginPath();c.moveTo(X(x),Y(y));c.lineTo(X(tx),Y(ty));c.strokeStyle=color;c.lineWidth=width;c.stroke();};
 const ring=(x:number,y:number,r:number,color:string)=>{c.beginPath();c.ellipse(X(x),Y(y),r*s,r*s*.35,0,0,Math.PI*2);c.strokeStyle=color;c.lineWidth=2;c.stroke();};
 const label=(text:string,x:number,y:number,color:string)=>{c.fillStyle=color;c.font='11px Microsoft YaHei';c.fillText(text,X(x),Y(y));};
 for(const a of e.s.enemies){const p=e.config.enemies[a.type];if(!p.boss)continue;if(a.type==='sandworm'&&(a.state==='burrow'||a.state==='erupt')){c.fillStyle='#ed8d6333';c.fillRect(X(a.x-1.5),Y(12),3*s,12*s);c.setLineDash([5,4]);line(a.x-1.5,0,a.x-1.5,12,'#ffc492',2);line(a.x+1.5,0,a.x+1.5,12,'#ffc492',2);c.setLineDash([]);ring(a.x,.1,1.5,'#ffbf7c');label(a.state==='burrow'?`沙虫钻出 ${Math.max(0,a.timer).toFixed(1)}`:'通道摧毁中',a.x-1.4,12.5,'#ffd3a0');continue;}
  if(a.state==='charge'||a.state==='dash'){line(a.x,a.y,a.x-8,a.y,'#f39b6844',s*.6);if(!reduced&&a.state==='dash')for(let i=1;i<=4;i++)line(a.x+i*.5,a.y-.3+i*.12,a.x+i*.5+.8,a.y-.3+i*.12,'#ffc28a88',2);}
  ring(a.x,a.y-p.height/2,.7+p.width*.3,a.type==='carrier'?'#9acbdf55':'#ef956a55');
  if(a.type==='carrier'){const pulse=reduced?1:.75+Math.sin(e.time*4)*.2;c.globalAlpha=pulse;line(a.x-.9,a.y-.65,a.x-.9,a.y-1.3,'#9befd555',s*.12);line(a.x+.9,a.y-.65,a.x+.9,a.y-1.3,'#9befd555',s*.12);c.globalAlpha=1;}
 }
 const warningRows=new Map<number,number>();for(const shot of e.s.shots){if(!['bomb','rock','shockwave','laser'].includes(shot.kind))continue;
  const color=shot.visual==='acid'?'#c5eb89':shot.visual==='reflected'?'#a4e6ff':shot.kind==='laser'?'#bfbcff':shot.kind==='shockwave'?'#ec9e6c':'#efba7e';
  if(shot.phase==='flight'){
   const t=Math.max(0,Math.min(1,1-shot.remaining/shot.duration)),p=enemyProjectilePosition(shot,t),prev=enemyProjectilePosition(shot,Math.max(0,t-.04));
   if(!reduced)for(let i=1;i<=5;i++){const q=enemyProjectilePosition(shot,Math.max(0,t-i*.035));c.globalAlpha=(6-i)*.085;c.fillStyle=shot.kind==='rock'?'#ae9c86':'#f5ce96';c.beginPath();c.arc(X(q.x),Y(q.y),s*(.04+i*.014),0,Math.PI*2);c.fill();}c.globalAlpha=1;
   c.save();c.translate(X(p.x),Y(p.y));c.rotate(Math.atan2(-(p.y-prev.y),p.x-prev.x));c.scale(s,s);c.strokeStyle='#ffe1aa';c.lineWidth=.04;
   if(shot.visual==='plasma'){c.fillStyle='#ab9fff';c.beginPath();c.arc(0,0,.24,0,Math.PI*2);c.fill();c.stroke();}else if(shot.visual==='reflected'){c.fillStyle='#8cb7c4';c.strokeStyle='#d9faff';c.lineWidth=.06;c.beginPath();c.arc(0,0,.22,0,Math.PI*2);c.fill();c.stroke();}else if(shot.visual==='acid'){c.fillStyle='#b7db70';c.beginPath();c.ellipse(0,0,.23,.14,0,0,Math.PI*2);c.fill();}else if(shot.kind==='rock'){c.rotate(reduced?0:t*5);c.fillStyle='#aa8c6d';c.beginPath();c.moveTo(.28,0);c.lineTo(.13,-.23);c.lineTo(-.19,-.18);c.lineTo(-.26,.13);c.lineTo(.05,.25);c.closePath();c.fill();c.stroke();}
   else{c.fillStyle=shot.visual==='missile'?'#afc3c8':'#d9a16e';c.beginPath();c.moveTo(.29,0);c.lineTo(.1,-.11);c.lineTo(-.19,-.11);c.lineTo(-.19,.11);c.lineTo(.1,.11);c.closePath();c.fill();c.stroke();c.fillStyle='#f5d486';c.fillRect(-.27,-.16,.1,.32);if(shot.visual==='missile'){c.fillStyle='#fff0b5';c.beginPath();c.moveTo(-.25,-.07);c.lineTo(-.52,0);c.lineTo(-.25,.07);c.fill();}}
   c.restore();continue;
  }
  const column=Math.floor(shot.x),row=warningRows.get(column)||0;warningRows.set(column,row+1);const top=e.top(column);
  if(shot.kind==='shockwave'){ring(shot.x,shot.y,shot.radius,color);label(`踏地震波 ${Math.max(0,shot.remaining).toFixed(1)}`,shot.x-2,shot.y+2,color);}
  else{ring(shot.x,shot.kind==='rock'?shot.y:top,shot.radius,color);c.setLineDash([4,5]);line(shot.originX??shot.x,shot.originY??10,shot.x,shot.kind==='rock'?shot.y:top,color+'88');c.setLineDash([]);label(`${shot.visual==='lightning'?'雷暴落点':shot.visual==='acid'?'酸液喷射':shot.visual==='plasma'?'等离子弹':shot.kind==='laser'?'蓄能激光':shot.kind==='rock'?'投掷巨岩':shot.visual==='missile'?'导弹齐射':'炸弹锁定'} ${Math.max(0,shot.remaining).toFixed(1)}`,shot.x-.8,Math.min(14.5,top+1.6+row*.65),color);}
 }
 for(const f of e.effects){const age=(.3-f.life)/.3;
  if(['clawAttack','runnerAttack','beastAttack'].includes(f.kind)){
   const size=f.kind==='beastAttack'?.9:.45;for(let i=0;i<3;i++){const offset=i*.14;line(f.tx-size*.4+offset,f.ty+size*.65,f.tx+size*.3+offset,f.ty-size*.4,'#ffd0a7',reduced?1:2);}
  }else if(f.kind==='siegeAttack'){ring(f.tx,f.ty,.15+age*.7,'#ffcf91');line(f.x,f.y,f.tx,f.ty,'#c3c5a8',4);}
  else if(f.kind==='flyerAttack'){line(f.x,f.y,f.tx,f.ty,'#d9a2dd66',5);line(f.x,f.y,f.tx,f.ty,'#ffe0ff',1.5);}
  else if(f.kind==='bossLaser'){line(f.x,f.y,f.tx,f.ty,'#9387ff55',s*.6);line(f.x,f.y,f.tx,f.ty,'#d7c7ff',s*.18);line(f.x,f.y,f.tx,f.ty,'#fff5ff',2);}
  else if(f.kind==='shockwave'){ring(f.x,f.y,reduced?Math.abs(f.tx-f.x):Math.abs(f.tx-f.x)*Math.max(.2,age),'#ffcc98');}
  else if(f.kind==='bombRelease'){ring(f.x,f.y,.2,'#dfbc87');}
 }
}

