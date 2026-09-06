import type {Engine} from '../engine';
import {enemyProjectilePosition} from '../enemy-projectiles';
export function drawTidalBoss(c:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,time:number,reduced:boolean,attack=0){
 c.save();c.translate(x,y);c.scale(w,h);c.lineJoin='round';
 const poly=(p:number[][],color:string)=>{c.beginPath();p.forEach(([a,b],i)=>i?c.lineTo(a,b):c.moveTo(a,b));c.closePath();c.fillStyle=color;c.fill();c.strokeStyle='#172c36';c.lineWidth=.025;c.stroke();};
 const oval=(x:number,y:number,rx:number,ry:number,color:string)=>{c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fillStyle=color;c.fill();};
 const pulse=reduced?0:Math.sin(time*1.7)*.012;
 // A towering abyssal predator wears the split freighter as shoulder armor.
 for(const side of [-1,1]){
  for(let i=0;i<4;i++)poly([[side*.19,.04+i*.07],[side*(.47+pulse),-.2+i*.14],[side*(.72-i*.045),.3+i*.08],[side*.48,.19+i*.08]],i%2?'#36505b':'#213943');
  poly([[side*.15,-.3],[side*.22,-.7],[side*.31,-.92],[side*.38,-.59],[side*.47,-.74],[side*.49,-.34]],'#253c46');
  poly([[side*.23,-.28],[side*.35,-.57],[side*.58,-.48],[side*.7,-.2],[side*.49,-.07]],'#526269');
  poly([[side*.34,-.55],[side*.45,-.65],[side*.56,-.49],[side*.43,-.38]],'#7d7770');
  for(let j=0;j<5;j++){
   poly([[side*(.35+j*.044),-.45+j*.035],[side*(.38+j*.044),-.43+j*.035],[side*(.36+j*.044),-.23+j*.021]],j%2?'#6e655b':'#394b52');
   oval(side*(.36+j*.05),-.38+j*.024,.009,.007,'#bc9f79');
  }
  c.save();c.translate(side*.45,-.12);c.rotate(side*(pulse*2+(reduced?0:Math.sin(Math.min(1,attack/3)*Math.PI)*.6)));
  poly([[0,-.09],[side*.2,-.02],[side*.33,.2],[side*.25,.35],[side*.11,.26],[side*.21,.23],[side*.14,.12],[side*.07,.18],[side*.06,.05]],'#5d7379');
  poly([[side*.25,.25],[side*.29,.39],[side*.17,.44],[side*.21,.32]],'#c6c4ab');
  c.restore();
 }
 poly([[-.28,-.53],[-.13,-.7],[.15,-.69],[.3,-.47],[.31,.2],[.17,.43],[-.16,.42],[-.32,.13]],'#182e39');
 for(const side of [-1,1])for(let i=0;i<5;i++)poly([[side*.05,-.08+i*.075],[side*.29,-.17+i*.087],[side*.26,-.08+i*.09],[side*.08,.015+i*.071]],i%2?'#52616a':'#344955');
 // Recessed core behind broken hull ribs, with a heavy brow and serrated jaw.
 oval(0,.15,.087,.14,'#061b28');oval(0,.15,.045+pulse,.095,'#56b7c7');oval(0,.13,.018,.043,'#cbf9eb');
 poly([[-.25,-.47],[-.17,-.62],[.15,-.64],[.27,-.47],[.2,-.23],[0,-.17],[-.2,-.24]],'#52646c');
 poly([[-.22,-.43],[0,-.38],[.22,-.44],[.16,-.28],[0,-.23],[-.17,-.29]],'#08151e');
 for(const side of [-1,1]){
  poly([[side*.035,-.46],[side*.21,-.51],[side*.18,-.44],[side*.045,-.415]],'#edb165');
  poly([[side*.02,-.49],[side*.23,-.56],[side*.24,-.51],[side*.02,-.455]],'#839091');
  for(let i=0;i<4;i++){const xx=side*(.035+i*.043);poly([[xx,-.37],[xx+side*.033,-.385],[xx+side*.014,-.29+(i%2)*.035]],'#b5c3b8');}
  poly([[side*.18,-.34],[side*.24,-.41],[side*.25,-.24],[side*.1,-.16],[side*.04,-.23]],'#758a89');
  poly([[side*.17,-.28],[side*.17,-.4],[side*.12,-.29]],'#dfd9bd');
 }
 // Ruined bridge and cables establish the scale of the creature.
 poly([[-.12,-.67],[-.13,-.81],[.09,-.84],[.15,-.68]],'#50616a');
 for(let j=0;j<4;j++)poly([[-.1+j*.052,-.79],[-.065+j*.052,-.794],[-.062+j*.052,-.75],[-.097+j*.052,-.745]],'#142b35');
 c.strokeStyle='#9b9d8c';c.lineWidth=.009;
 c.beginPath();c.moveTo(-.08,-.79);c.lineTo(-.1,-1.02);c.lineTo(.15,-.88);c.moveTo(-.1,-1.02);c.lineTo(-.36,-.58);c.stroke();
 c.strokeStyle='#93b0af';c.lineWidth=.006;
 for(const side of [-1,1])for(let j=0;j<3;j++){c.beginPath();c.moveTo(side*(.34+j*.05),-.22);c.quadraticCurveTo(side*(.42+j*.05+pulse),.02,side*(.38+j*.04),.16+j*.025);c.stroke();}
 c.restore();
}
export function drawTidalEffects(c:CanvasRenderingContext2D,e:Engine,s:number,X:(n:number)=>number,Y:(n:number)=>number,reduced:boolean){
 const ring=(x:number,y:number,r:number,color:string)=>{c.beginPath();c.ellipse(X(x),Y(y),s*r,s*r*.35,0,0,Math.PI*2);c.strokeStyle=color;c.lineWidth=2;c.stroke();};
 const label=(t:string,x:number,y:number)=>{c.font='bold 11px Microsoft YaHei';c.fillStyle='#bdfcff';c.textAlign='center';c.fillText(t,X(x),Y(y));};
 c.save();
 for(const a of e.s.enemies.filter(a=>a.type==='leviathan'&&a.hp>0)){const rage=a.hp<=a.maxHp*.5;ring(a.x,.1,2+(reduced?0:Math.sin(e.time*3)*.12),'#79eaf477');label(rage?'狂潮阶段 · 核心易伤 +15%':'深渊潮汐领主 · 沉船甲壳',a.x,a.y+2.7);}
 for(const shot of e.s.shots){if(shot.visual==='tidalClaw'){
  const t=1-shot.remaining/shot.duration;ring(shot.x,shot.y,shot.radius,'#f4b989');label(`巨爪横扫 ${shot.remaining.toFixed(1)}s`,shot.x,shot.y+1.8);
  c.strokeStyle='#f4b989';c.lineWidth=2;for(let i=-1;i<=1;i++){c.beginPath();c.moveTo(X(shot.x-.7),Y(shot.y+.6+i*.22));c.lineTo(X(shot.x+.7),Y(shot.y-.4+i*.22));c.stroke();}
  if(!reduced){c.globalAlpha=.25+t*.55;c.beginPath();c.moveTo(X(shot.originX??12),Y((shot.originY??7)+2));c.quadraticCurveTo(X(shot.x+3),Y(shot.y+4),X(shot.x),Y(shot.y));c.stroke();c.globalAlpha=1;}
 }else if(shot.visual==='tidalDrop'){
  ring(shot.x,.2,.65,'#b3eaca');label('空降虫群',shot.x,14.6);c.strokeStyle='#b3eaca66';c.setLineDash([4,6]);c.beginPath();c.moveTo(X(shot.x),Y(15));c.lineTo(X(shot.x),Y(.5));c.stroke();c.setLineDash([]);
 }else if(shot.visual==='tidal'){
  const t=1-shot.remaining/shot.duration;c.fillStyle='#5ce1eb22';c.beginPath();c.ellipse(X(shot.x),Y(shot.y),s*shot.radius,s*shot.radius*.35,0,0,Math.PI*2);c.fill();
  for(let i=0;i<3;i++)ring(shot.x,shot.y,shot.radius*(reduced?.8:((t+i/3)%1)),'#94f2f7');label(`潮汐冲击 ${Math.max(0,shot.remaining).toFixed(1)}s`,shot.x,shot.y+4.5);
 }else if(shot.visual==='depthcharge'){
  ring(shot.x,shot.y,shot.radius,'#83c9e6');if(shot.phase==='warning'){label(`深水雷 ${Math.ceil(shot.remaining)}s · 可拦截`,shot.x,shot.y+3.2);continue;}
  const p=enemyProjectilePosition(shot,1-shot.remaining/shot.duration);c.save();c.translate(X(p.x),Y(p.y));c.rotate(reduced?0:e.time*4);c.fillStyle='#263f55';c.strokeStyle='#a2f4f3';c.lineWidth=2;c.beginPath();c.arc(0,0,s*.22,0,Math.PI*2);c.fill();c.stroke();for(let i=0;i<6;i++){const a=i*Math.PI/3;c.beginPath();c.moveTo(Math.cos(a)*s*.2,Math.sin(a)*s*.2);c.lineTo(Math.cos(a)*s*.34,Math.sin(a)*s*.34);c.stroke();}c.fillStyle='#e0ffff';c.fillRect(-2,-2,4,4);c.restore();
 }}
 for(const f of e.effects.filter(f=>f.kind==='tidalBurst'||f.kind==='tidalRise')){const t=1-f.life/(f.kind==='tidalRise'?3:1.5);c.globalAlpha=Math.max(0,1-t);const size=f.kind==='tidalRise'?4:2.6;for(let i=0;i<3;i++)ring(f.x,f.y,size*(.3+t)+i*.2,'#a4faff');for(let i=0;i<9;i++){const x=f.x+(i-4)*size/5,ht=(reduced?.7:Math.sin(Math.PI*t))*(1+Math.sin(i*1.7)*.4)*size;c.strokeStyle=i%2?'#66d7eb':'#c6ffff';c.lineWidth=3;c.beginPath();c.moveTo(X(x),Y(f.y));c.quadraticCurveTo(X(x+.3),Y(f.y+ht),X(x+.5),Y(f.y+ht*.7));c.stroke();}}
 for(const a of e.s.enemies.filter(a=>a.descent&&a.hp>0)){c.strokeStyle='#b3eaca';c.lineWidth=2;c.beginPath();c.moveTo(X(a.x),Y(a.y+.6));c.lineTo(X(a.x),Y(a.y+1.7));c.stroke();ring(a.x,a.y,.35,'#b3eaca');}
 c.restore();
}
