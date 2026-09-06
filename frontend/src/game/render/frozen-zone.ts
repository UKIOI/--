/** Painted only when the background cache changes; independent of combat randomness. */
export function paintFrozenZone(c:CanvasRenderingContext2D){
 let seed=92731;
 const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 const poly=(p:number[][],color:string)=>{c.fillStyle=color;c.beginPath();p.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();};
 const line=(p:number[][],color:string,w=.025)=>{c.strokeStyle=color;c.lineWidth=w;c.beginPath();p.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke();};
 const rect=(x:number,y:number,w:number,h:number,color:string)=>{c.fillStyle=color;c.fillRect(x,y,w,h);};
 const gradient=(top:number,bottom:number,a:string,b:string)=>{const g=c.createLinearGradient(0,top,0,bottom);g.addColorStop(0,a);g.addColorStop(1,b);return g;};
 const clip=(p:number[][],paint:()=>void)=>{c.save();c.beginPath();p.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.clip();paint();c.restore();};
 c.fillStyle=gradient(0,16,'#101e2d','#465e68');c.fillRect(0,0,36,16);
 const moon=c.createRadialGradient(27,3.4,.2,27,3.4,6);moon.addColorStop(0,'#bdd6d324');moon.addColorStop(1,'#bdd6d300');c.fillStyle=moon;c.fillRect(20,0,15,10);
 // Wisps of high cloud, with a fine grain rather than a flat sky fill.
 for(let i=0;i<48;i++){const x=random()*36,y=1+random()*6;c.fillStyle='#a1b7b503';c.beginPath();c.ellipse(x,y,2+random()*5,.025+random()*.11,-.1,0,Math.PI*2);c.fill();}
 for(let i=0;i<1900;i++)rect(random()*36,random()*16,.016+random()*.04,.016, i%2?'#c5d9d609':'#07131e0d');

 // Fractured rock faces, wind-cut snow ridges and several mountain distances.
 for(let layer=0;layer<3;layer++){
  const ridge:number[][]=[];
  for(let x=-2;x<39;x+=.48)ridge.push([x,7.8+layer*1.05-Math.pow(Math.max(0,Math.sin(x*.39+layer*1.7)),2)*(3.7-layer*.6)+(random()-.5)*.65]);
  const shape=[[-2,16],...ridge,[39,16]];
  poly(shape,['#344954','#293f4b','#243944'][layer]);
  clip(shape,()=>{
   for(let j=1;j<ridge.length-1;j++){
    const [x,y]=ridge[j],foot=y+1.1+random()*3;
    poly([[x,y],[x+.48,ridge[j+1][1]],[x+1+random(),foot],[x+.1,foot-.6]],['#566d7466','#61798255','#60777e33'][layer]);
    if(j%3===0)poly([[x,y],[x+.12,y+.5],[x-.3,y+1.2],[x+.2,y+.95],[x+.5,y+2],[x+.1,y+.5],[x+.48,ridge[j+1][1]]],'#a0b5b54a');
    line([[x+.15,y+.4],[x+.5,y+1.2],[x+.35,y+1.8],[x+1,y+2.6]],'#111f2b55',.035);
   }
  });
 }
 c.fillStyle=gradient(6,12,'#8ea6a000','#8ea6a024');c.fillRect(0,6,36,6);
 // Distant conifer belt and utility buildings behind the station.
 for(let i=0;i<55;i++){const x=i*.72,h=.5+random()*1.3;poly([[x,12.7-h],[x-.25,12.4],[x-.12,12.35],[x-.43,12.9],[x+.43,12.9],[x+.12,12.35],[x+.25,12.4]],'#263c4466');}
 for(const x of [6.5,21.2,33]){rect(x,11,2.5,3,'#263c46');poly([[x-.1,11],[x+.3,10.7],[x+2.5,10.9],[x+2.6,11.1]],'#61757a');for(let j=0;j<5;j++)rect(x+.2+j*.45,11.5,.2,.3,'#132833');}

 // The station has shaded side walls, corroded panels, broken glazing and snow load.
 for(const [x,w,roof,height] of [[.2,6.3,8.6,6.2],[8.3,5.3,9.5,5.2],[26.2,7.2,8.8,6]]){
  const eave=roof+1.3,bottom=roof+height,face=[[x,eave],[x+w*.4,roof],[x+w, eave],[x+w,bottom],[x,bottom]];
  poly(face,'#243943');
  clip(face,()=>{
   c.fillStyle=gradient(roof,bottom,'#3d5058','#1b303a');c.fillRect(x,roof,w,height);
   for(let j=0;j<34;j++){const xx=x+j*w/34;line([[xx,eave],[xx,bottom]],j%2?'#82959423':'#101f2b44',.025);}
   for(let yy=eave+.7;yy<bottom;yy+=1.15)line([[x,yy],[x+w,yy]],'#091b2566',.04);
   for(let i=0;i<210;i++){const xx=x+random()*w,yy=eave+random()*height;rect(xx,yy,.02+random()*.07,.03+random()*.18,i%4===0?'#917e5b30':'#adc0bb16');}
   for(let row=0;row<2;row++)for(let j=0;j<7;j++){
    const xx=x+.35+j*(w-.6)/7,yy=eave+.5+row*1.25,ww=(w-.9)/7-.12;
    rect(xx-.045,yy-.055,ww+.09,.83,'#687b7b66');rect(xx,yy,ww,.73,'#102330');
    poly([[xx,yy],[xx+ww,yy],[xx+ww*.65,yy+.37],[xx+.12,yy+.65]],'#617c8340');
    line([[xx+ww*.5,yy],[xx+ww*.5,yy+.7]],'#81948b44');
    if((row+j)%3===0)poly([[xx+.06,yy+.06],[xx+ww*.7,yy+.13],[xx+ww*.4,yy+.4],[xx+ww,yy+.61],[xx+.08,yy+.72]],'#0b1d29');
    line([[xx-.07,yy+.77],[xx+ww+.05,yy+.77]],'#aec1ba99',.045);
    for(let k=0;k<3;k++)line([[xx+k*ww/3,yy+.78],[xx+k*ww/3+.02,yy+.9+random()*.2]],'#9bbdc066',.025);
   }
  });
  poly([[x+w,eave],[x+w+.65,eave-.3],[x+w+.65,bottom-.2],[x+w,bottom]],'#182d38');
  // Uneven roof snow, exposed roof sheets, and icicles beneath the eaves.
  poly([[x-.18,eave],[x+w*.4,roof-.17],[x+w+.22,eave-.06],[x+w-.2,eave+.1],[x+w*.66,roof+.7],[x+w*.52,roof+.69],[x+w*.41,roof+.09],[x+w*.26,roof+.85],[x+w*.17,roof+.93],[x,eave+.23]],'#9cafa9');
  line([[x-.1,eave-.02],[x+w*.4,roof-.17],[x+w+.15,eave-.09]],'#c6d0c077',.055);
  for(let j=0;j<12;j++){const xx=x+j*w/12,yy=eave-Math.min(j/12/.4,(1-j/12)/.6)*1.3;poly([[xx,yy+.05],[xx+.09,yy+.08],[xx+.045,yy+.28+random()*.32]],'#98bac099');}
  poly([[x+w*.65,roof+.65],[x+w*.8,roof+.82],[x+w*.84,roof+1.15],[x+w*.72,roof+1.04]],'#132631');
  line([[x+w*.72,roof+.8],[x+w*.79,roof+.54],[x+w*.92,roof+.71]],'#70888b',.03);
  rect(x+w*.42,bottom-1.5,1.2,1.5,'#132732');for(let j=0;j<7;j++)line([[x+w*.42,bottom-1.4+j*.19],[x+w*.42+1.2,bottom-1.4+j*.19]],'#61797b55');
  rect(x+.3,bottom-1.6,.75,.27,'#86958855');c.fillStyle='#b6bfa077';c.font='.18px monospace';c.fillText('N-04',x+.37,bottom-1.4);
  line([[x+.15,eave+2.9],[x+.55,eave+3.2],[x+.37,eave+3.6],[x+.7,eave+3.9]],'#0d222dbb',.045);
 }

 // Radar framework: individual ribs, perforated panels, frosted rim, cables and bolts.
 poly([[16.7,15],[18.2,8.8],[18.65,8.8],[20.5,15],[19.9,15],[18.43,10.1],[17.25,15]],'#1d333f');
 for(let yy=9.8;yy<15;yy+=.65){const w=(yy-9)*.27;line([[18.45-w,yy],[18.45+w+.18,yy+.65],[18.45-w-.18,yy+.65],[18.45+w,yy]],'#69828b88',.055);rect(18.43-w,yy,.055,.055,'#a8b6b288');}
 line([[18.35,9],[16.9,14.8]],'#a0b5b288',.045);
 c.save();c.translate(18.4,8.15);c.rotate(-.35);
 const dish=[[-3.15,0],[-2.7,.65],[-1.8,1.3],[-.5,1.7],[.65,1.65],[1.9,1.15],[2.8,.4],[3.15,0]];
 poly(dish,'#486470');
 clip(dish,()=>{
  c.fillStyle=gradient(0,1.8,'#6d8990','#283f4d');c.fillRect(-3.2,0,6.4,1.8);
  for(let xx=-3;xx<=3;xx+=.22)line([[xx,0],[xx*.4,1.8]],'#b6c7c044',.025);
  for(let yy=.2;yy<1.8;yy+=.2)line([[-3,yy],[3,yy]],'#102d3a55');
  poly([[1,.1],[1.85,.1],[1.7,.65],[1.15,.9],[.8,.55]],'#142c39');
 });
 for(const xx of [-2.9,-1.8,-.7,.7,1.8,2.9])line([[xx,0],[xx*.7,1],[0,1.7]],'#a1b8b377',.04);
 line([[-3.15,0],[-1.8,-.08],[0,-.04],[1.3,-.14],[3.15,0]],'#bfd0c3bb',.11);
 line([[-2.8,0],[0,-1.7],[2.8,0]],'#8ca5a8',.045);line([[0,-1.7],[0,.6]],'#aac1be88',.07);rect(-.15,-1.86,.3,.25,'#324e5d');
 for(let i=0;i<8;i++)line([[-2.6+i*.7,.04],[-2.61+i*.7,.22+random()*.3]],'#b4d2d077',.03);
 c.restore();
 for(const x of [15,23.7]){line([[x,15],[x-.3,8],[x,5.8]],'#415e6c',.09);for(let y=6.4;y<10;y+=.6)line([[x-.22,y],[x+.32,y]],'#7b979955');line([[x,6],[x-2,14.6]],'#637e8644');}
 c.strokeStyle='#101f2ba0';c.lineWidth=.035;c.beginPath();c.moveTo(13.5,10);c.quadraticCurveTo(18.5,13.6,23.4,9.7);c.stroke();

 // Snowbanks with a blue shadow side, wind ripples, ice seams and half-buried debris.
 for(let layer=0;layer<3;layer++){
  const edge:number[][]=[];for(let x=0;x<=36;x+=.18)edge.push([x,14.05+layer*.62+Math.sin(x*.65+layer*2)*.22+Math.sin(x*2.3)*.045]);
  poly([[0,16],...edge,[36,16]],['#3c5762','#58717a','#344e5a'][layer]);
  line(edge,['#a0b6b055','#c0cebd55','#a0b8b144'][layer],.045);
 }
 for(let i=0;i<440;i++){const x=random()*36,y=14.1+random()*1.9;line([[x,y],[x+.06+random()*.3,y-.01]],i%3?'#b2c8c022':'#142e3f33',.012+random()*.025);}
 poly([[21.4,15.3],[24,15.03],[25.7,15.24],[24.4,15.7],[22.1,15.63]],'#53798466');
 line([[21.9,15.35],[22.8,15.26],[23.2,15.42],[24.3,15.35],[24.9,15.47]],'#a5c9c477',.022);
 for(const x of [6.8,14.2,30.5]){poly([[x,15.4],[x+.2,14.95],[x+.9,14.87],[x+1.3,15.3]],'#263e49');line([[x+.18,15],[x+.85,14.84],[x+1.18,15.14]],'#a5bab299',.095);}
 for(let i=0;i<11;i++){const x=7.2+i*.38,y=15.25-i*.075;line([[x,y],[x+.12,y+.025]],'#172f3b66',.08);line([[x+.1,y+.18],[x+.23,y+.2]],'#172f3b66',.075);}
 // Thin ground fog and sparse, static wind-driven snow retain combat readability.
 const fog=gradient(11.5,15.5,'#9bbab300','#9bbab31a');c.fillStyle=fog;c.fillRect(0,11.5,36,4);
 for(let i=0;i<125;i++){const x=random()*36,y=1+random()*14;line([[x,y],[x+.045+random()*.06,y-.02]],'#c6dfd42b',.015+random()*.015);}
}
