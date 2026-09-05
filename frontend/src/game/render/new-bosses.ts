export function drawNewBoss(c:CanvasRenderingContext2D,type:string,x:number,y:number,w:number,h:number,time:number,reduced:boolean,state:string){
 if(!['sandworm','queen','tempest'].includes(type))return false;c.save();c.translate(x,y);c.scale(w,h);c.lineJoin='round';const wave=reduced?0:Math.sin(time*4)*.035;
 const poly=(points:number[][],color:string)=>{c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fillStyle=color;c.fill();c.strokeStyle='#15221e';c.lineWidth=.025;c.stroke();};
 const oval=(x:number,y:number,rx:number,ry:number,color:string)=>{c.fillStyle=color;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fill();};
 if(type==='sandworm'){
  if(state==='burrow'){oval(0,-.01,.65,.07,'#d5a06366');oval(0,-.01,.45,.045,'#121b16');c.restore();return true;}
  for(let i=7;i>=0;i--){const py=-.33+i*.1,px=Math.sin(time*3-i*.6)*(reduced?0:.025),rx=.29-i*.012;oval(px,py,rx,.09,i%2?'#947447':'#b99662');c.strokeStyle='#e0c491';c.lineWidth=.012;c.beginPath();c.ellipse(px,py,rx*.9,.055,0,0,Math.PI);c.stroke();for(const sign of [-1,1])poly([[px+sign*rx,py-.02],[px+sign*(rx+.12),py-.09],[px+sign*rx,py+.035]],'#ddc490');}
  oval(0,-.38,.35,.16,'#d2ac74');oval(0,-.39,.24,.12,'#35291f');oval(0,-.4,.13,.065,'#101719');for(let i=0;i<12;i++){const a=i*Math.PI/6;poly([[Math.cos(a)*.24,-.39+Math.sin(a)*.12],[Math.cos(a+.2)*.25,-.39+Math.sin(a+.2)*.12],[Math.cos(a+.1)*.15,-.39+Math.sin(a+.1)*.06]],'#fff0c1');}
 }else if(type==='queen'){
  for(const sign of [-1,1])for(let i=0;i<4;i++)poly([[sign*.2,-.05+i*.075],[sign*(.46+wave),-.2+i*.15],[sign*.62,.1+i*.09],[sign*.46,.02+i*.09]],'#6f8050');
  oval(.05,.06,.34,.35,'#6c7141');for(const px of [-.16,.04,.23])for(const py of [-.04,.17])oval(px,py,.065,.095,'#d0d48a');poly([[-.27,-.18],[-.2,-.42],[.18,-.46],[.32,-.2],[.14,-.07],[-.2,-.06]],'#afa77a');for(const sign of [-1,1])poly([[sign*.12,-.38],[sign*.3,-.64],[sign*.28,-.25]],'#d6c49a');oval(-.11,-.27,.035,.03,'#ffdaa0');oval(.12,-.27,.035,.03,'#ffdaa0');
 }else{
  for(const sign of [-1,1]){poly([[0,-.13],[sign*.27,-.47-wave],[sign*.62,-.32-wave],[sign*.47,.13],[sign*.3,-.01],[sign*.25,.33],[0,.17]],'#727eac');poly([[sign*.12,-.16],[sign*.51,-.25],[sign*.33,.05]],'#b2bde0');c.strokeStyle='#b8efff';c.lineWidth=.022;c.beginPath();c.moveTo(sign*.12,-.13);c.lineTo(sign*.29,-.25);c.lineTo(sign*.25,-.04);c.lineTo(sign*.48,.05);c.stroke();}
  poly([[-.12,-.42],[.12,-.42],[.2,.12],[0,.43],[-.2,.12]],'#445a72');oval(0,-.01,.1,.19,'#bcf1ff');oval(0,-.02,.055,.11,'#f5ffff');
 }c.restore();return true;
}
