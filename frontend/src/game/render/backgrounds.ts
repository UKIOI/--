import {paintCity} from './ruined-city';
import {paintFrozenZone} from './frozen-zone';
import {paintSunkenHarbor} from './sunken-harbor';

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
 if(id==='snow'){paintFrozenZone(c);c.restore();return;}
 if(id==='harbor'){paintSunkenHarbor(c);c.restore();return;}
 const poly=(p:number[][],color:string)=>{c.fillStyle=color;c.beginPath();p.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();};
 const line=(p:number[][],color:string,width=.045)=>{c.strokeStyle=color;c.lineWidth=width;c.beginPath();p.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke();};
 const rect=(x:number,y:number,w:number,h:number,color:string)=>{c.fillStyle=color;c.fillRect(x,y,w,h);};
 const circle=(x:number,y:number,r:number,color:string)=>{c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fillStyle=color;c.fill();};
 const sky=c.createLinearGradient(0,0,0,16);
 const palette=id==='desert'?['#2c2325','#61513d']:['#101918','#24332c'];
 sky.addColorStop(0,palette[0]);sky.addColorStop(1,palette[1]);c.fillStyle=sky;c.fillRect(0,0,36,16);
 if(id==='classic'){
  const hills=[[0,16]];for(let i=0;i<=36;i++)hills.push([i,12-Math.sin(i*.5)*1.6-Math.cos(i*1.7)*.5]);hills.push([36,16]);poly(hills,'#1d2a25');
  for(let i=0;i<15;i++){const x=i*2.7,h=2+(i*7%5)*.6;rect(x,16-h,.9,h,'#17241f');rect(x-.15,16-h-.25,1.2,.2,'#17241f');}
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
 }
 c.restore();
}
