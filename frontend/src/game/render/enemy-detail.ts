/** Normalized anatomy and surface details, shared by the battlefield and guide. */
export function enemyDetail(c:CanvasRenderingContext2D,type:string,time:number,reduced:boolean){
 c.save();c.lineCap='round';const line=(x:number,y:number,tx:number,ty:number,color:string,width=.025)=>{c.strokeStyle=color;c.lineWidth=width;c.beginPath();c.moveTo(x,y);c.lineTo(tx,ty);c.stroke();};
 const dot=(x:number,y:number,r:number,color:string)=>{c.fillStyle=color;c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill();};
 const pulse=reduced?1:.8+Math.sin(time*4)*.2;
 if(type==='carrier'){
  // Armored flight deck, ribbed wings, missile banks and an open luminous hangar.
  for(const side of [-1,1]){c.fillStyle='#536f73';c.beginPath();c.moveTo(side*.22,-.22);c.lineTo(side*.62,-.38);c.lineTo(side*.58,.2);c.lineTo(side*.3,.25);c.closePath();c.fill();for(let i=0;i<3;i++){line(side*.36,-.18+i*.12,side*.54,-.24+i*.12,'#a8c6c0',.025);dot(side*(.4+i*.065),.16,.022,'#f7bd88');}c.globalAlpha=pulse;c.fillStyle='#80dddb';c.fillRect(side*.35-.04,.25,.08,.18);c.globalAlpha=1;}
  c.fillStyle='#102d34';c.fillRect(-.17,-.06,.34,.23);c.strokeStyle='#c2e3d1';c.lineWidth=.025;c.strokeRect(-.17,-.06,.34,.23);for(const x of [-.1,0,.1])line(x,-.035,x,.14,'#87ddd0',.035);dot(-.35,-.065,.025,'#ffdd9d');
 }else if(type==='flyer'){
  for(const side of [-1,1])for(const [x,y] of [[.54,-.33],[.45,.05],[.26,.22]])line(0,-.1,side*x,y,'#dac2d099',.025);dot(-.13,-.13,.035,'#ffe9a7');
 }else if(type==='bombardier'){
  for(const side of [-1,1]){line(side*.12,-.25,side*.32,-.25,'#d2e0cc',.03);dot(side*.4,-.1,.035,side===1?'#99e7cf':'#f4b48a');}for(const x of [-.22,.07,.33])line(x-.025,.22,x-.025,.34,'#ffdeb0',.025);
 }else if(type==='beast'){
  for(const [x,y] of [[-.08,-.28],[.08,-.3],[.23,-.25]]){line(x,y,x+.06,y+.23,'#6a5042',.04);line(x+.02,y,x+.07,y+.12,'#edc09b',.018);}for(const x of [-.48,-.38,-.28])line(x,.02,x-.015,.1,'#eee1b6',.035);dot(-.39,-.13,.022,'#fff6c8');
 }else if(type==='spitter'){
  for(const [x,y] of [[.04,-.23],[.18,-.1],[.13,.04]])dot(x,y,.045,'#e6efa288');line(-.61,-.12,-.44,-.1,'#e2eca4',.028);dot(-.62,-.1,.055*pulse,'#cfe896');
 }else if(type==='marshal'){
  for(const sign of [-1,1]){dot(sign*.3,-.64,.03,'#fff1fd');line(sign*.08,-.2,sign*.2,.23,'#e0c9e3',.022);}dot(0,-.16,.06,'#dec5ed');
 }else if(type==='reflector'){
  for(const x of [-.2,.2])line(x,-.2,x,.19,'#9de4ed',.03);for(const y of [-.2,0,.2])dot(.2,y,.025,'#e4ffff');
 }else if(type==='blastbeetle'||type==='siege'){
  for(const y of [-.24,-.06,.12]){line(-.2,y,.22,y,'#dce0bd',.02);for(const x of [-.23,.26])dot(x,y,.025,'#ddc89f');}line(.04,-.27,.12,-.13,'#394e43',.04);
 }else if(type==='bomber'){
  c.globalAlpha=pulse;dot(0,.04,.07,'#ffedac');c.globalAlpha=1;for(const side of [-1,1])line(side*.25,-.14,side*.29,.18,'#e7c6a0',.025);
 }else{
  for(const y of [-.16,-.04,.08])line(.02,y,.2,y+.06,'#e6d4ae88',.025);dot(-.29,-.1,.027,'#fff1b9');line(-.33,.04,-.21,.09,'#493e31',.045);
 }c.restore();
}
