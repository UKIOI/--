import type {Engine} from '../engine';
export function drawProjection(c:CanvasRenderingContext2D,e:Engine,s:number,X:(x:number)=>number,Y:(y:number)=>number,reduced:boolean){const h=e.s.projection;if(!h||h.remaining<=0||e.cinematic)return;const source=e.s.buildings.find(b=>b.id===h.owner&&b.hp>0&&b.settled);if(!source)return;c.save();const alpha=Math.min(1,h.remaining);c.globalAlpha=alpha;
 c.strokeStyle='#93fff288';c.lineWidth=1;c.setLineDash([5,7]);c.beginPath();c.moveTo(X(source.x),Y(source.y));c.lineTo(X(h.x),Y(2));c.stroke();c.setLineDash([]);
 const glow=c.createRadialGradient(X(h.x),Y(1.5),s*.2,X(h.x),Y(1.5),s*3);glow.addColorStop(0,'#65fce94d');glow.addColorStop(1,'#65fce900');c.fillStyle=glow;c.fillRect(X(h.x-3),Y(4.5),6*s,5*s);
 c.fillStyle='#52dfd32e';c.strokeStyle='#8ffff0';c.lineWidth=2;c.fillRect(X(h.x-1),Y(3),2*s,2.8*s);c.strokeRect(X(h.x-1),Y(3),2*s,2.8*s);
 c.beginPath();c.ellipse(X(h.x),Y(.15),s*1.7,s*.28,0,0,Math.PI*2);c.stroke();c.beginPath();c.arc(X(h.x),Y(1.6),s*.55,0,Math.PI*2);c.stroke();
 for(let i=0;i<9;i++){const y=.3+((i*.3+(reduced?0:e.time*.5))%2.7);c.strokeStyle='#aefff766';c.beginPath();c.moveTo(X(h.x-.95),Y(y));c.lineTo(X(h.x+.95),Y(y));c.stroke();}
 c.font='bold 12px Microsoft YaHei';c.textAlign='center';c.fillStyle='#bffff3';c.fillText(`虚假核心 · ${h.remaining.toFixed(1)}s`,X(h.x),Y(4.1));c.font='10px Microsoft YaHei';c.fillText('诱敌投影 / 无实体',X(h.x),Y(3.45));c.restore();}
