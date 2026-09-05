import type {Building} from '../types';
export function drawBridge(c:CanvasRenderingContext2D,b:Building,all:Building[],x:number,y:number,s:number){
 const connected=(dx:number)=>b.settled&&all.some(a=>a.id!==b.id&&a.hp>0&&a.settled&&a.x===b.x+dx&&a.y===b.y);
 const left=connected(-1),right=connected(1);c.save();c.translate(x,y);c.scale(s,s);
 const steel=b.branch===0?'#c5d4bc':'#95aaa0';
 // Open truss leaves the void below the deck visible.
 c.fillStyle='#52665c';c.fillRect(-.5,-.49,1,.16);c.fillStyle='#c5c7a1';c.fillRect(-.5,-.49,1,.045);c.fillStyle='#24362e';
 for(let i=0;i<5;i++)c.fillRect(-.47+i*.2,-.42,.12,.045);
 c.strokeStyle=steel;c.lineWidth=b.branch===0?.085:.065;c.lineJoin='round';c.beginPath();c.moveTo(-.48,-.32);c.lineTo(-.48,.34);c.lineTo(.48,.34);c.lineTo(.48,-.32);c.moveTo(-.48,-.3);c.lineTo(0,.34);c.lineTo(.48,-.3);c.moveTo(-.48,.34);c.lineTo(0,-.3);c.lineTo(.48,.34);c.stroke();
 c.fillStyle='#e0d3a0';for(const px of [-.46,0,.46])for(const py of [-.29,.33]){c.beginPath();c.arc(px,py,.032,0,Math.PI*2);c.fill();}
 for(const [px,link] of [[-.49,left],[.43,right]] as const){c.fillStyle=link?'#b4c8a8':'#6e8278';c.fillRect(px,-.32,.06,.7);if(!link){c.fillStyle='#d9ba73';c.fillRect(px,-.3,.06,.12);c.fillRect(px,.05,.06,.12);}}
 if(b.branch===1){c.strokeStyle='#d0be91';c.lineWidth=.04;for(const px of [-.3,0,.3]){c.beginPath();c.moveTo(px-.07,.34);c.lineTo(px,.51);c.lineTo(px+.07,.34);c.stroke();}}
 if(b.hp<180){c.strokeStyle='#30291f';c.lineWidth=.045;c.beginPath();c.moveTo(.08,-.49);c.lineTo(.16,-.4);c.lineTo(.1,-.33);c.stroke();}c.restore();
}
