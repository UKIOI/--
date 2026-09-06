import {paintCity} from './ruined-city';

export const BACKGROUNDS=[
 {id:'city',name:'灰烬之城',description:'残破楼群 · 坍塌高架'},
 {id:'harbor',name:'沉没港湾',description:'冷蓝海雾 · 断裂吊机'},
 {id:'desert',name:'黄沙旧都',description:'落日沙丘 · 掩埋街区'},
 {id:'snow',name:'凛冬禁区',description:'积雪厂房 · 冰封雷达'},
 {id:'classic',name:'旧日荒原',description:'最初背景 · 山丘与烟囱'},
] as const;
export type BackgroundId=typeof BACKGROUNDS[number]['id'];
export function normalizeBackground(value:unknown):BackgroundId{return BACKGROUNDS.some(b=>b.id===value)?value as BackgroundId:'city';}

/** One cached scene per renderer; switching theme or display resolution rebuilds it. */
export class Background {
 private surface?:HTMLCanvasElement;private key='';
 draw(target:CanvasRenderingContext2D,x:number,y:number,scale:number,dpr:number,theme:unknown='city'){
  const id=normalizeBackground(theme),width=Math.max(1,Math.round(36*scale*dpr)),height=Math.max(1,Math.round(16*scale*dpr)),key=`${id}/${width}/${height}`;
  if(!this.surface||key!==this.key){
   this.surface=document.createElement('canvas');this.surface.width=width;this.surface.height=height;
   const c=this.surface.getContext('2d')!;c.scale(width/36,height/16);paintBackground(c,id);this.key=key;
  }
  target.drawImage(this.surface,x,y,36*scale,16*scale);
 }
}

export function paintBackground(c:CanvasRenderingContext2D,id:BackgroundId){
 c.save();
 if(id==='city'){paintCity(c);c.restore();return;}
 const poly=(p:number[][],color:string)=>{c.fillStyle=color;c.beginPath();p.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();};
 const line=(p:number[][],color:string,width=.045)=>{c.strokeStyle=color;c.lineWidth=width;c.beginPath();p.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke();};
 const rect=(x:number,y:number,w:number,h:number,color:string)=>{c.fillStyle=color;c.fillRect(x,y,w,h);};
 const circle=(x:number,y:number,r:number,color:string)=>{c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fillStyle=color;c.fill();};
 const sky=c.createLinearGradient(0,0,0,16);
 const palette=id==='harbor'?['#101c29','#304650']:id==='desert'?['#2c2325','#61513d']:id==='snow'?['#172431','#43555a']:['#101918','#24332c'];
 sky.addColorStop(0,palette[0]);sky.addColorStop(1,palette[1]);c.fillStyle=sky;c.fillRect(0,0,36,16);
 if(id==='classic'){
  const hills=[[0,16]];for(let i=0;i<=36;i++)hills.push([i,12-Math.sin(i*.5)*1.6-Math.cos(i*1.7)*.5]);hills.push([36,16]);poly(hills,'#1d2a25');
  for(let i=0;i<15;i++){const x=i*2.7,h=2+(i*7%5)*.6;rect(x,16-h,.9,h,'#17241f');rect(x-.15,16-h-.25,1.2,.2,'#17241f');}
 }else if(id==='harbor'){
  circle(27,4.4,1.15,'#80959b20');
  for(let i=0;i<18;i++){const x=i*2.1,top=8+(i*7%5)*.55;rect(x,top,1.5,13-top,'#263a45');rect(x+.2,top-.3,.7,.4,'#263a45');}
  rect(0,12,36,4,'#1a303b');
  // Flooded quays, sunken freighter and gantry cranes.
  poly([[9,12.3],[19,12.3],[17.4,14.05],[10.4,13.65]],'#152933');
  poly([[11,12.3],[11,10.9],[13.4,10.9],[13.4,11.6],[15,11.6],[15,12.3]],'#203540');
  for(let x=11.2;x<13.3;x+=.45)rect(x,11.15,.25,.3,'#101f2b');
  line([[14.3,11.6],[14.3,8.8],[15.2,9.5]],'#53616a88',.065);
  for(const [x,h,dir] of [[3,5.3,1],[22,6.4,1],[33,7.2,-1]]){
   poly([[x-.8,14.7],[x-.12,h],[x+.3,h],[x+1,14.7],[x+.6,14.7],[x,h+1.5],[x-.45,14.7]],'#1c313c');
   line([[x,h+.4],[x+dir*5,h+1.1],[x+dir*4.6,h+1.5],[x,h+.9]],'#4c616777',.12);
   line([[x,h+.4],[x+dir*1.2,h-1],[x+dir*4.8,h+1.1]],'#475e6788');
   for(let j=1;j<5;j++)line([[x,h+j*1.6],[x+.4,h+j*1.6+.8],[x-.35,h+j*1.6+.8]],'#3e545c99');
   line([[x+dir*4.5,h+1.4],[x+dir*4.5,h+4.2],[x+dir*4.3,h+4.4]],'#68747788');
  }
  for(let i=0;i<6;i++){const x=i*1.45+.4,y=13.8-(i%2)*.6;rect(x,y,1.35,.85,i%2?'#354444':'#2d3f47');for(let j=0;j<5;j++)line([[x+.15+j*.23,y+.1],[x+.15+j*.23,y+.7]],'#61707133');}
  for(let i=0;i<65;i++){const x=i*7.71%36,y=12.5+(i%11)*.25;line([[x,y],[x+.3+(i%4)*.3,y]],'#617d842b',.035);}
  poly([[0,15.4],[7,15.1],[11,15.6],[19,15.3],[26,15.5],[29,15],[36,15.1],[36,16],[0,16]],'#13262c');
 }else if(id==='desert'){
  circle(27,5.6,1.65,'#b6976740');
  for(let i=0;i<15;i++){const x=i*2.6,top=8+(i*11%7)*.42;poly([[x,14],[x,top],[x+1.1,top],[x+1.3,top+.6],[x+1.9,top+.4],[x+1.9,14]],'#494437');}
  // Old masonry quarter: broken arches, a shattered dome and buried avenues.
  for(const [x,w,top] of [[1,5,9],[8,4,7.3],[16,6,9.6],[25,4,8.5],[32,4,10]]){
   poly([[x,15],[x,top],[x+w*.38,top],[x+w*.42,top+.65],[x+w*.58,top+.45],[x+w*.7,top+1],[x+w,top+.8],[x+w,15]],'#302f2b');
   for(let yy=top+1.5;yy<14;yy+=.85)for(let xx=x+.35;xx<x+w-.35;xx+=.65){rect(xx,yy,.32,.45,'#202727');line([[xx,yy+.45],[xx+.36,yy+.45]],'#79705755');}
   line([[x,top],[x+w*.38,top],[x+w*.42,top+.65]],'#8f7b5366',.07);
  }
  poly([[16.3,9.6],[16.8,8.4],[17.7,7.65],[18.4,7.4],[18.8,7.65],[18.4,8.4],[19.1,8.1],[20.3,9.6]],'#39382f');
  for(const x of [2,4.1,17,19.1]){rect(x,12.1,1.1,2.7,'#1e2625');c.beginPath();c.arc(x+.55,12.1,.55,Math.PI,0);c.fillStyle='#1e2625';c.fill();}
  poly([[12.6,14.5],[13.4,6.2],[14,6.2],[14.5,7.1],[14.1,7.8],[14.7,14.5]],'#35352e');
  line([[13.4,6.2],[14,6.2],[14.5,7.1]],'#8c795666',.07);
  for(let layer=0;layer<3;layer++){const p=[[0,16]];for(let x=0;x<=36;x+=.5)p.push([x,13.4+layer*.65+Math.sin(x*.33+layer*2)*.7]);p.push([36,16]);poly(p,['#4b4433','#3e3b2e','#302f27'][layer]);}
  for(let i=0;i<36;i++){const x=i*3.17%36,y=14.4+(i%7)*.18;line([[x,y],[x+.55,y-.04],[x+1.2,y]],'#9b80552b');}
  poly([[28,15.1],[28.3,14.3],[30,14.1],[30.4,14.55],[31.7,14.55],[31.9,15.25]],'#252c28');
 }else{
  poly([[0,12],[0,8],[4,5.4],[6,7.2],[10,3.7],[14,7.7],[19,4.8],[23,8],[29,4.3],[36,8],[36,16],[0,16]],'#34474f');
  poly([[7.5,6],[10,3.7],[12,5.7],[10.4,5.25],[9.6,5.6],[9.7,4.7]],'#697a7b44');
  for(const x of [1,8,26]){
   poly([[x,15],[x,10],[x+2,8.5],[x+5,10],[x+5,15]],'#20343e');
   line([[x,10],[x+2,8.5],[x+5,10]],'#788c8b99',.17);
   for(let xx=x+.5;xx<x+4.7;xx+=.7){rect(xx,10.7,.4,.7,'#111f2c');rect(xx,12,.4,.7,'#111f2c');}
   rect(x+1.7,13,1.5,2,'#152733');
  }
  // Exposed radar dish and skeletal communications tower.
  poly([[17,15],[18.3,8.2],[18.7,8.2],[20,15],[19.5,15],[18.5,9.7],[17.5,15]],'#20353e');
  for(let yy=10;yy<15;yy++)line([[18.5-(yy-9)*.2,yy],[18.5+(yy-9)*.2,yy+1],[18.5-(yy-8)*.2,yy+1]],'#526c7488');
  c.save();c.translate(18.5,7.8);c.rotate(-.45);c.beginPath();c.ellipse(0,0,2.5,.95,0,0,Math.PI);c.fillStyle='#435c66';c.fill();line([[-2.5,0],[2.5,0]],'#80949388',.1);line([[-2,0],[0,-1.3],[2,0]],'#677f8788');c.restore();
  line([[23,15],[23,5.5],[22.4,6.5],[23.6,6.5]],'#46606c',.08);
  for(const x of [5.5,14.4,24,33]){line([[x,15],[x,11]],'#263c43',.1);for(let j=0;j<4;j++)poly([[x,10.6+j*.7],[x-.65-j*.12,12+j*.65],[x+.65+j*.12,12+j*.65]],'#293f46');}
  poly([[0,15],[4,14.7],[9,15.15],[14,14.7],[21,15],[26,14.6],[32,15],[36,14.7],[36,16],[0,16]],'#4c6366');
  for(let i=0;i<70;i++)circle(i*7.17%36,2+(i*11.13%13),.018+(i%3)*.008,'#9eaead33');
  for(let i=0;i<23;i++){const x=i*3.7%36,y=15+(i%4)*.2;line([[x,y],[x+.4,y+.02]],'#263e4644',.065);}
 }
 c.restore();
}
