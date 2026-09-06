export function paintCity(c:CanvasRenderingContext2D){
 const polygon=(points:number[][],color:string)=>{c.fillStyle=color;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();};
 const line=(points:number[][],color:string,width=.035)=>{c.strokeStyle=color;c.lineWidth=width;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke();};
 const rect=(x:number,y:number,w:number,h:number,color:string)=>{c.fillStyle=color;c.fillRect(x,y,w,h);};
 const sky=c.createLinearGradient(0,0,0,16);sky.addColorStop(0,'#101b20');sky.addColorStop(.55,'#2c3938');sky.addColorStop(1,'#222e2a');c.fillStyle=sky;c.fillRect(0,0,36,16);
 const glow=c.createRadialGradient(28,8,0,28,8,13);glow.addColorStop(0,'#a8865a20');glow.addColorStop(1,'#a8865a00');c.fillStyle=glow;c.fillRect(0,0,36,16);

 // A distant, dense skyline: irregular roofs, antennas and dark window bands.
 for(let i=0;i<27;i++){
  const x=i*1.43-.4,w=1.05+(i*7%5)*.16,top=5.4+(i*13%11)*.35;
  polygon([[x,13],[x,top+.35],[x+w*.28,top+.35],[x+w*.28,top],[x+w*.67,top+.13],[x+w*.8,top-.15],[x+w,top+.3],[x+w,13]],i%3===0?'#263332':'#293636');
  if(i%4===0)line([[x+w*.6,top],[x+w*.6,top-.7]],'#30403d',.04);
  for(let yy=top+.7;yy<12;yy+=.52)for(let xx=x+.17;xx<x+w-.12;xx+=.32)rect(xx,yy,.11,.22,'#1b292a55');
 }
 const haze=c.createLinearGradient(0,7,0,14);haze.addColorStop(0,'#70807700');haze.addColorStop(.7,'#70807712');haze.addColorStop(1,'#70807700');c.fillStyle=haze;c.fillRect(0,7,36,7);

 // Broad apartment / office blocks with missing corners and exposed floors.
 const blocks=[
  {x:-.6,w:3.6,top:7.1,cut:1.1},{x:3.6,w:3.1,top:8.7,cut:.7},
  {x:7.5,w:3.8,top:5.1,cut:1.5},{x:12.2,w:2.8,top:7.6,cut:1},
  {x:16.2,w:4.1,top:8.4,cut:1.2},{x:21.2,w:3.2,top:5.9,cut:1.8},
  {x:25.5,w:4.1,top:7.5,cut:1.4},{x:31.1,w:4.5,top:6.3,cut:1.3},
 ];
 blocks.forEach(({x,w,top,cut},i)=>{
  const outline=[[x,14.5],[x,top+.2],[x+w*.18,top+.2],[x+w*.23,top],[x+w*.49,top+.18],[x+w*.54,top+.65],[x+w*.69,top+.5],[x+w*.62,top+cut],[x+w*.84,top+cut+.35],[x+w,top+cut+.2],[x+w,14.5]];
  polygon(outline,i%2?'#1b2828':'#1e2b2c');
  c.save();c.beginPath();outline.forEach(([xx,yy],j)=>j?c.lineTo(xx,yy):c.moveTo(xx,yy));c.closePath();c.clip();
  rect(x+w-.34,top,.34,15-top,'#142123');
  for(let yy=top+.65,row=0;yy<14;yy+=.76,row++){
   line([[x+.08,yy+.56],[x+w-.12,yy+.56]],'#40504a55',.045);
   for(let xx=x+.23,col=0;xx<x+w-.35;xx+=.54,col++){
    const broken=(row*7+col*3+i)%5===0;
    rect(xx,yy,.29,.4,'#0f1c20');
    if(broken)polygon([[xx,yy+.4],[xx+.1,yy+.22],[xx+.14,yy+.3],[xx+.29,yy+.12],[xx+.29,yy+.4]],'#34413b');
    if((row*11+col+i*7)%29===0)rect(xx+.04,yy+.2,.15,.13,'#82704b55');
   }
  }
  // Large shell impact opens the facade rather than merely marking its surface.
  const bx=x+w*.6,by=top+2.8;
  polygon([[bx-.48,by-.25],[bx-.14,by-.62],[bx+.16,by-.42],[bx+.49,by-.48],[bx+.32,by-.02],[bx+.62,by+.3],[bx+.24,by+.38],[bx+.04,by+.81],[bx-.16,by+.45],[bx-.55,by+.53],[bx-.37,by+.12]],'#101c20');
  line([[bx-.14,by-.62],[bx-.31,by-.95],[bx-.21,by-1.25]],'#54605266');
  line([[bx+.24,by+.38],[bx+.48,by+.85],[bx+.38,by+1.2]],'#53605266');
  c.restore();
  line(outline.slice(1,-1),'#53605770',.055);
  // Reinforcing bars protrude from shattered roof edges.
  for(let j=0;j<3;j++)line([[x+w*.68+j*.16,top+cut+.17],[x+w*.68+j*.16,top+cut-.35-j*.12],[x+w*.68+j*.16+.1,top+cut-.48-j*.12]],'#4c595077',.025);
 });

 // Collapsed elevated road: surviving deck, pillars and a fallen slab.
 for(const x of [12,15.5,19.8]){polygon([[x,12.15],[x+.3,12.15],[x+.45,15],[x-.15,15]],'#182524');line([[x+.06,12.4],[x+.13,14.5]],'#44504666');}
 polygon([[10.5,11.65],[15.9,11.65],[16.3,11.86],[15.8,12.13],[10.5,12.13]],'#34403a');
 polygon([[17.3,12.1],[20.9,11.66],[21.2,12.06],[17.6,12.53]],'#303d37');
 polygon([[15.85,12.35],[16.2,12.14],[18.3,14.15],[17.9,14.4]],'#25332f');
 line([[10.5,11.65],[15.9,11.65],[16.15,11.8]],'#60675466',.06);
 for(let x=10.6;x<15.9;x+=.55)line([[x,11.65],[x,11.3]],'#4a574866');
 line([[10.6,11.3],[15.65,11.3]],'#4a574866');
 line([[15.9,11.9],[16.5,12.1],[17.1,12.07]],'#66715b66',.025);

 // Street-level ruins, broken shop fronts, a wreck and leaning lamp posts.
 polygon([[0,14.8],[0,12.7],[1.2,12.7],[1.6,13.1],[2,12.9],[2.3,13.45],[4.9,13.45],[5.2,13.05],[6.7,13.05],[7,13.6],[7,15]],'#142221');
 for(const x of [.4,2.7,4.2,5.6]){rect(x,13.65,.8,1.15,'#0d1a1c');line([[x,13.65],[x+.8,13.65],[x+.8,14.8]],'#3b4a3f88');}
 rect(.35,13.07,.85,.25,'#5c605044');
 polygon([[27.7,15],[27.7,12.7],[28.4,12.7],[28.5,13.1],[28.9,12.9],[29.3,13.65],[30.7,13.65],[30.7,15]],'#182622');
 line([[28.1,12.75],[28.05,12.25],[28.2,12.05]],'#56604c88');
 polygon([[23.2,14.65],[23.4,14.25],[24.05,14.19],[24.35,13.85],[25.2,13.85],[25.6,14.27],[26.1,14.39],[26.2,14.72]],'#111e20');
 polygon([[24.25,14.21],[24.47,13.99],[24.8,13.99],[24.8,14.21]],'#39483e');
 for(const x of [23.8,25.6]){c.beginPath();c.arc(x,14.65,.21,0,Math.PI*2);c.fillStyle='#0b181b';c.fill();}
 for(const [x,lean] of [[6.9,-.32],[30.9,.45]]){line([[x,15],[x+lean,11.9],[x+lean+.55,11.9]],'#415044',.075);rect(x+lean+.4,11.88,.4,.1,'#64705a77');}
 c.strokeStyle='#4b574b77';c.lineWidth=.025;c.beginPath();c.moveTo(6.58,12.05);c.quadraticCurveTo(8.7,13.2,10.5,12.3);c.stroke();

 polygon([[0,15.1],[5,14.92],[9,15.15],[14,14.9],[19,15.1],[25,14.85],[31,15.12],[36,14.9],[36,16],[0,16]],'#182520');
 for(let i=0;i<78;i++){
  const x=(i*7.137)%36,y=14.85+(i*13%9)*.105,w=.09+(i*7%6)*.065;
  polygon([[x,y],[x+w*.22,y-.12-(i%3)*.065],[x+w*.7,y-.08],[x+w,y+.07]],i%3===0?'#45504366':'#2e3c3266');
 }
 for(const x of [4,11,20,29])line([[x,15.45],[x+.6,15.35],[x+.9,15.53],[x+1.4,15.58]],'#0e1c1c',.035);
 const shade=c.createLinearGradient(0,12,0,16);shade.addColorStop(0,'#0c171800');shade.addColorStop(1,'#0c171833');c.fillStyle=shade;c.fillRect(0,12,36,4);
}
