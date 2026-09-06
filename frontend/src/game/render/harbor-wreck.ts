/** A listing cargo ship cut by a level waterline, rather than a floating silhouette. */
export function drawHarborWreck(c:CanvasRenderingContext2D){
 let seed=7301;
 const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 const poly=(p:number[][],color:string)=>{c.fillStyle=color;c.beginPath();p.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();};
 const line=(p:number[][],color:string,w=.03)=>{c.strokeStyle=color;c.lineWidth=w;c.beginPath();p.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke();};
 const rect=(x:number,y:number,w:number,h:number,color:string)=>{c.fillStyle=color;c.fillRect(x,y,w,h);};
 const waterline=13.55;
 c.save();c.beginPath();c.rect(7,7,15,waterline-7);c.clip();c.translate(8.5,12.2);c.rotate(.12);
 // The raised stern, tall sheer side and pointed bow form one continuous hull.
 const hull=[[0,-.9],[1.25,-.9],[1.6,-.65],[8.9,-.65],[9.55,-1.12],[12,-1.38],[11.25,.5],[10.1,1.45],[1.2,1.65],[.3,.7]];
 poly(hull,'#314650');
 c.save();c.beginPath();hull.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.clip();
 const steel=c.createLinearGradient(0,-1,0,1.7);steel.addColorStop(0,'#596a6b');steel.addColorStop(.23,'#354b55');steel.addColorStop(.7,'#243b47');steel.addColorStop(1,'#112b39');c.fillStyle=steel;c.fillRect(0,-1.5,12,3.3);
 rect(0,.72,12,.85,'#76544266');line([[0,.73],[12,.73]],'#ac805b55',.06);
 for(let row=0;row<4;row++){
  const y=-.55+row*.55;line([[0,y],[12,y]],'#112b3877');
  for(let x=(row%2)*.6;x<12;x+=1.15){line([[x,y],[x,y+.54]],'#0a253166');for(let k=0;k<3;k++)rect(x+.09,y+.08+k*.17,.035,.035,'#b6b6a166');}
 }
 // Rust runs from seams and scuppers, with flaking patches rather than uniform noise.
 for(let i=0;i<85;i++){
  const x=random()*11.8,y=-.5+random()*1.9,w=.035+random()*.12,h=.1+random()*.5;
  poly([[x,y],[x+w,y+.04],[x+w*.5,y+h],[x-.025,y+h*.7]],i%3?'#b07d514c':'#87988829');
 }
 for(let x=.65;x<11;x+=1.1){rect(x,-.52,.18,.08,'#102c38');line([[x+.07,-.44],[x+.03,.1+random()*.3]],'#af7e5366',.045);}
 // Torn plates curl outward around a dark, ribbed hold.
 const tear=[[5.35,-.65],[5.82,-.4],[6.16,-.57],[6.43,-.18],[7.03,-.25],[6.82,.23],[7.25,.55],[6.66,.94],[6.1,.78],[5.65,1.08],[5.37,.54],[4.98,.4],[5.27,.02]];
 poly(tear,'#091e2b');
 for(let x=5.45;x<6.9;x+=.33)line([[x,-.1],[x-.15,.7]],'#42616b88',.065);
 poly([[5.35,-.65],[5.82,-.4],[5.62,.08],[5.25,-.06]],'#7b867166');
 poly([[6.82,.23],[7.25,.55],[6.66,.94],[6.86,.48]],'#70827a88');
 line(tear.slice(0,5),'#a0a88c77',.045);
 // Stern draught marks and faded registry remain restrained at play scale.
 for(let j=0;j<6;j++)line([[.82,.06+j*.2],[1.02,.06+j*.2]],'#aab39a88',.035);
 c.font='.23px monospace';c.fillStyle='#b8bfaa88';c.fillText('NORTH STAR',1.5,.1);c.font='.16px monospace';c.fillText('07 / PORT AUTHORITY',1.53,.34);
 c.restore();
 // Deck plane and aft accommodation sit directly on the hull.
 poly([[0,-.9],[.4,-1.15],[1.55,-1.15],[1.85,-.9],[9.1,-.9],[9.55,-1.35],[12,-1.38],[9.55,-1.12],[8.9,-.65],[1.6,-.65],[1.25,-.9]],'#65787288');
 poly([[.85,-.95],[.85,-2.58],[1.2,-2.85],[3.18,-2.85],[3.65,-2.5],[3.65,-.65]],'#405760');
 poly([[3.18,-2.85],[3.65,-2.5],[3.65,-.65],[3.18,-.65]],'#243c49');
 rect(.65,-2.88,2.64,.15,'#94a29799');
 for(let j=0;j<6;j++){
  const x=.98+j*.35;rect(x,-2.56,.26,.42,'#102b3a');poly([[x,-2.56],[x+.26,-2.56],[x+.06,-2.18]],'#82a2a455');
  if(j===3)line([[x,-2.56],[x+.15,-2.37],[x+.07,-2.14]],'#a5b6a577');
 }
 for(let y=-1.94;y<-.9;y+=.44){line([[.86,y],[3.18,y]],'#90a29766');for(let j=0;j<4;j++)rect(1+j*.49,y+.1,.2,.17,'#122d3b');}
 rect(2.75,-1.53,.3,.84,'#112a38');
 for(let y=-2.05;y<-.75;y+=.19)line([[3.24,y],[3.45,y]],'#a2b0a377',.025);
 rect(3.83,-2.47,.66,1.78,'#344c55');poly([[3.83,-2.47],[3.96,-2.6],[4.55,-2.5],[4.49,-2.3],[3.83,-2.3]],'#87775c88');
 line([[4.12,-2.25],[4.08,-1.25]],'#a17a5055',.1);
 // Collapsed cargo hatch and displaced containers break the otherwise straight deck.
 poly([[4.8,-.68],[5.1,-1],[8.3,-1],[8.7,-.67]],'#101f2c');
 poly([[5.4,-.78],[6.5,-1.45],[7.6,-1.25],[6.45,-.69]],'#50626a');
 for(let j=0;j<5;j++)line([[5.6+j*.18,-.87-j*.1],[6.6+j*.18,-.77-j*.1]],'#8b9d9166');
 c.save();c.translate(7.75,-.85);c.rotate(.16);rect(0,-.72,1.43,.72,'#655c476e');for(let x=.1;x<1.4;x+=.14)line([[x,-.65],[x,-.06]],'#acac8c55',.03);line([[0,-.72],[1.43,-.72]],'#aab09888');c.restore();
 // Bent mast and loose rigging, anchored to the deck instead of floating above it.
 line([[4.72,-.7],[4.55,-3.45],[4.98,-3.89],[5.17,-3.57]],'#8ca29e99',.065);
 line([[4.58,-3.07],[5.92,-2.82],[6.24,-2.38]],'#6b858b99',.045);
 line([[1.5,-2.9],[4.55,-3.45],[8.8,-.7]],'#6c8b925e');
 c.strokeStyle='#8aa29c66';c.lineWidth=.025;c.beginPath();c.moveTo(4.98,-3.89);c.quadraticCurveTo(5.25,-1.9,6.2,-.7);c.stroke();
 for(let x=0;x<11.4;x+=.33){if(x>5&&x<7.3)continue;const y=x>9?-1.1:-.68;line([[x,y],[x+.04,y-.3]],'#9aafa18c',.025);}
 line([[.1,-1.18],[.8,-1.18]],'#a3b3a18c');line([[3.65,-.99],[4.8,-.99],[5.05,-.8]],'#a3b3a18c');line([[7.35,-1],[8.9,-1],[9.65,-1.46],[11.65,-1.6]],'#a3b3a18c');
 // Bow hawse pipe, anchor and rubbing strake establish ship scale.
 c.strokeStyle='#0e2836';c.lineWidth=.07;c.beginPath();c.ellipse(10.4,-.57,.17,.1,-.15,0,Math.PI*2);c.stroke();
 line([[10.4,-.5],[10.24,.1],[10,.27],[9.85,.09]],'#8b9b9288',.035);
 c.restore();
 // A horizontal veil and broken foam line hide the submerged bow and lower hull.
 const water=c.createLinearGradient(0,13.27,0,14.15);water.addColorStop(0,'#29495600');water.addColorStop(.4,'#29495688');water.addColorStop(1,'#16344200');c.fillStyle=water;c.fillRect(8.4,13.27,12.8,.88);
 for(let j=0;j<48;j++){const x=8.8+j*.245,y=waterline+Math.sin(j*.82)*.035;line([[x,y],[x+.08+random()*.16,y-.012]],j%3?'#b3c7b862':'#8aa8a944',.025);}
 for(let i=0;i<70;i++){const y=13.65+random()*.9,x=9+random()*11;line([[x,y],[x+.1+random()*.45,y]],i%3?'#0b253544':'#789b9c29',.025);}
}
