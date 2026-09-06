import {drawHarborWreck} from './harbor-wreck';
/** Deterministic material detail, rendered once into the shared background cache. */
export function paintSunkenHarbor(c:CanvasRenderingContext2D){
 let seed=46107;
 const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 const poly=(p:number[][],color:string)=>{c.fillStyle=color;c.beginPath();p.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();};
 const line=(p:number[][],color:string,w=.03)=>{c.strokeStyle=color;c.lineWidth=w;c.beginPath();p.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke();};
 const rect=(x:number,y:number,w:number,h:number,color:string)=>{c.fillStyle=color;c.fillRect(x,y,w,h);};
 const circle=(x:number,y:number,r:number,color:string)=>{c.fillStyle=color;c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill();};
 const gradient=(a:number,b:number,top:string,bottom:string)=>{const g=c.createLinearGradient(0,a,0,b);g.addColorStop(0,top);g.addColorStop(1,bottom);return g;};
 const clip=(p:number[][],paint:()=>void)=>{c.save();c.beginPath();p.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.clip();paint();c.restore();};
 c.fillStyle=gradient(0,16,'#0e1b2b','#405a64');c.fillRect(0,0,36,16);
 const halo=c.createRadialGradient(27,4,0,27,4,6);halo.addColorStop(0,'#c3d0b92c');halo.addColorStop(1,'#b5c7c000');c.fillStyle=halo;c.fillRect(20,0,16,11);
 circle(27,4,.85,'#a9bbb33a');
 for(let i=0;i<55;i++){c.fillStyle=i%2?'#10233315':'#91a9aa05';c.beginPath();c.ellipse(random()*36,2+random()*7,1+random()*5,.03+random()*.14,-.06,0,Math.PI*2);c.fill();}
 for(let i=0;i<1500;i++)rect(random()*36,random()*16,.015+random()*.035,.018,i%2?'#ccdedc09':'#0617250c');
 // Three distances of docks and warehouses fade into salt-laden air.
 for(let layer=0;layer<2;layer++)for(let i=0;i<19;i++){
  const x=i*2.13-layer*.8,top=8+layer*1.3+random()*1.5,w=1.5+random()*.5;
  poly([[x,12.7],[x,top],[x+.2,top-.23],[x+w*.6,top-.23],[x+w,top+.16],[x+w,12.7]],layer?'#233b46':'#2d444e');
  for(let yy=top+.5;yy<12.5;yy+=.56)for(let xx=x+.16;xx<x+w-.15;xx+=.35)rect(xx,yy,.15,.24,layer?'#132b3855':'#182f3b66');
 }
 for(const x of [1,11,30]){line([[x,11],[x+.25,7],[x+2.7,7.6]],'#56707944',.07);line([[x+.25,7],[x+.8,6.2],[x+2.7,7.6],[x+2.7,9.4]],'#68808a44');}
 c.fillStyle=gradient(8,12.5,'#94afae00','#94afae1f');c.fillRect(0,8,36,4.5);
 c.fillStyle=gradient(11.8,16,'#2b4856','#102936');c.fillRect(0,11.8,36,4.2);

 drawHarborWreck(c);
 // Preserve the deterministic texture sequence for the rest of the harbor.
 for(let i=0;i<680;i++)random();

 // Main cranes have box girders, cross bracing, ladders, pulleys and broken cables.
 for(const [x,top,dir] of [[3.4,5.1,1],[23,6,1],[33.2,7,-1]]){
  const foot=14.6;
  poly([[x-.9,foot],[x-.3,top+.4],[x+.25,top+.4],[x+1.1,foot],[x+.7,foot],[x,top+1.2],[x-.5,foot]],'#243e4b');
  line([[x-.85,foot],[x-.29,top+.45],[x+.15,top+.45]],'#8aa09b88',.07);
  line([[x+.25,top+.45],[x+1.1,foot]],'#071e2b99',.08);
  for(let y=top+1;y<foot-.5;y+=.68){const half=.12+(y-top)*.073;line([[x-half,y],[x+half+.06,y+.68],[x-half-.05,y+.68],[x+half,y]],'#617f8966',.045);circle(x-half,y,.045,'#9eafa16b');}
  for(let y=top+1;y<foot;y+=.22)line([[x-.09,y],[x+.07,y]],'#79949766',.025);
  const boom=[[x-1,top+.12],[x+dir*5.6,top+.78],[x+dir*5.15,top+1.22],[x-.9,top+.62]];
  poly(boom,'#324c59');line(boom.slice(0,2),'#96aaa18c',.08);
  for(let j=0;j<10;j++){const a=j/10,b=(j+1)/10,xx=x+dir*5.2*a,yy=top+.23+.6*a;line([[xx,yy],[x+dir*5.2*b,top+.69+.48*b],[x+dir*5.2*b,top+.23+.6*b]],'#7d999c88');}
  line([[x-.2,top+.2],[x+dir*.9,top-1.3],[x+dir*5.3,top+.84]],'#8da6a28c',.045);
  line([[x+dir*.9,top-1.3],[x+dir*2.7,top+.54]],'#506f7e99');
  rect(x-.48,top+.62,.95,.57,'#1b3443');rect(x-.34,top+.7,.32,.27,'#87a49b55');rect(x+.1,top+.7,.23,.27,'#071f2e');
  for(let j=0;j<30;j++)rect(x-.25+random()*.5,top+random()*(foot-top),.035,.08+random()*.18,'#b0874e44');
  const hookX=x+dir*4.8,hookY=top+4.3;
  circle(hookX,top+1,.13,'#122d3c');circle(hookX,top+1,.055,'#95a79a88');
  line([[hookX-.05,top+1],[hookX-.05,hookY],[hookX+.06,hookY+.2],[hookX+.22,hookY+.2],[hookX+.3,hookY+.04]],'#9aaea599',.04);
  if(x===23){line([[hookX+.12,top+1],[hookX+.17,top+2.6],[hookX+.36,top+2.85]],'#7e9b9c88');poly([[x+2.8,top+.85],[x+3.25,top+.65],[x+3.08,top+1.18]],'#0b2432');}
  // Battered concrete plinths reach into the water.
  poly([[x-1.2,14.35],[x+.95,14.35],[x+1.4,14.7],[x-1.35,14.7]],'#425963');rect(x-1.35,14.7,2.75,.28,'#172f3b');
 }

 // Wet cargo stacks, dented corrugation, door locks and small hazard stripes.
 const container=(x:number,y:number,w:number,h:number,tint:string)=>{
  rect(x,y,w,h,tint);poly([[x,y],[x+.2,y-.18],[x+w+.2,y-.18],[x+w,y]],'#72847b77');poly([[x+w,y],[x+w+.2,y-.18],[x+w+.2,y+h-.1],[x+w,y+h]],'#122b37');
  for(let xx=x+.14;xx<x+w;xx+=.16){line([[xx,y+.08],[xx,y+h-.08]],'#b2b8a033',.03);line([[xx+.05,y+.08],[xx+.05,y+h-.08]],'#071f2c77');}
  for(let j=0;j<35;j++)rect(x+random()*w,y+random()*h,.025+random()*.065,.04+random()*.18,'#ac815049');
  for(const xx of [x+.09,x+w-.14]){line([[xx,y+.12],[xx,y+h-.1]],'#9eaca377',.035);rect(xx-.04,y+h*.5,.09,.13,'#132a35');}
  rect(x+.22,y+h*.64,.42,.17,'#adb49b44');
 };
 container(.1,13.1,2.5,1.45,'#394c4e');container(2.9,13.55,2.4,1.2,'#3d4843');container(.35,12.05,2.1,.95,'#4c4e4477');container(5.7,14,1.8,.83,'#344d57');container(29.6,13.75,2.1,1,'#394b50');

 // Broken reflections and perspective-scaled ripples across the flooded basin.
 for(let i=0;i<850;i++){
  const y=12+random()*3.5,x=random()*36,near=(y-12)/3.5,w=.04+random()*(.18+near*.65);
  const reflectedMoon=Math.abs(x-27)<.3+near*2.1;
  line([[x,y],[x+w,y-.006]],reflectedMoon?'#b5c9bd27':i%3?'#92b7b521':'#071e2d55',.012+near*.018);
 }
 for(const x of [3.4,23,33.2])for(let j=0;j<17;j++){const y=14.7+j*.055,w=.1+j*.023;line([[x-w+(random()-.5)*.22,y],[x+w,y]],'#0a202d66',.035);}
 // Near quay: fractured asphalt, exposed reinforcement, puddles and mooring hardware.
 const quay=[[0,15.22],[5,15.06],[8,15.3],[10,15.23],[10.4,15.55],[11.2,15.37],[12.4,15.57],[15,15.45],[17,15.55],[21,15.1],[26,15.34],[30,15.05],[36,15.18],[36,16],[0,16]];
 poly(quay,'#263b43');line(quay.slice(0,-2),'#778a8077',.055);
 clip(quay,()=>{
  for(let i=0;i<600;i++)rect(random()*36,15+random(),.02+random()*.06,.015+random()*.035,i%2?'#9daf9a22':'#081e2c55');
  for(const x of [1,7,20,31])poly([[x,15.63],[x+.55,15.42],[x+1.5,15.57],[x+2.2,15.5],[x+2,15.76],[x+.3,15.8]],'#537b8144');
  for(const x of [4,14,27])line([[x,15.25],[x-.2,15.5],[x+.17,15.7],[x+.05,16]],'#081f2caa',.045);
 });
 for(const x of [8.8,12.2])line([[x,15.34],[x+.3,15.12],[x+.58,15.4]],'#8b806466',.035);
 for(const x of [6.4,28.5,34.8]){rect(x,14.87,.18,.45,'#122a35');rect(x-.09,14.84,.37,.12,'#56685f');circle(x+.09,15.25,.27,'#0b233077');}
 c.strokeStyle='#9b9d7880';c.lineWidth=.035;c.beginPath();c.moveTo(6.48,14.95);c.bezierCurveTo(7.4,15.8,8.7,15.4,9.3,14.1);c.stroke();
 for(let i=0;i<12;i++){const x=30.8+i*.24;poly([[x,15.17],[x+.11,15.17],[x+.23,15.4],[x+.12,15.4]],i%2?'#172d35':'#9f945b55');}
 // Low horizontal mist unifies distance without hiding foreground silhouettes.
 const mist=gradient(10.9,14.7,'#91b6b500','#91b6b517');c.fillStyle=mist;c.fillRect(0,10.9,36,3.8);
}
