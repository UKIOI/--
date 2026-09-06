import type {Engine} from '../engine';
export function drawQueenNests(c:CanvasRenderingContext2D,e:Engine,s:number,X:(n:number)=>number,Y:(n:number)=>number,reduced:boolean){
 for(const queen of e.s.enemies.filter(a=>a.type==='queen'&&a.hp>0)){
  const x=e.queenNestX(queen),remaining=Math.max(0,queen.special??5),charging=remaining<=3,pulse=reduced?0:Math.sin(e.time*(charging?10:3))*.07;
  c.save();c.strokeStyle='#a6c56b80';c.lineWidth=2;c.setLineDash([4,5]);c.beginPath();c.moveTo(X(queen.x),Y(queen.y));c.lineTo(X(x),Y(.5));c.stroke();c.setLineDash([]);
  c.fillStyle=charging?'#badb6638':'#79944226';c.beginPath();c.ellipse(X(x),Y(.12),s*1.8,s*.32,0,0,Math.PI*2);c.fill();
  c.fillStyle='#56633b';c.strokeStyle='#b8cd76';c.lineWidth=2;c.beginPath();c.ellipse(X(x),Y(.45),s*1.35,s*.58,0,0,Math.PI*2);c.fill();c.stroke();
  for(let i=0;i<5;i++){const px=x+(i-2)*.46,py=.55+(i%2)*.23;c.fillStyle=charging?'#e3ee9b':'#a1b967';c.beginPath();c.ellipse(X(px),Y(py),s*(.21+pulse),s*(.32+pulse),-.2+i*.1,0,Math.PI*2);c.fill();c.strokeStyle='#3f5031';c.beginPath();c.moveTo(X(px-.1),Y(py+.12));c.lineTo(X(px+.05),Y(py));c.lineTo(X(px-.02),Y(py-.15));c.stroke();}
  c.fillStyle='#18281a';c.beginPath();c.ellipse(X(x),Y(.25),s*.38,s*.18,0,0,Math.PI*2);c.fill();
  c.font='bold 12px Microsoft YaHei';c.textAlign='center';c.fillStyle=charging?'#efffaf':'#cbd99a';c.fillText(charging?`虫巢即将孵化 · ${remaining.toFixed(1)}s`:`女王共生虫巢 · ${Math.ceil(remaining)}s`,X(x),Y(1.9));c.font='10px Microsoft YaHei';c.fillText('击败女王 · 停止孵化',X(x),Y(1.35));c.restore();
 }
 for(const f of e.effects.filter(f=>f.kind==='hatch')){const t=1-f.life/1.5;c.save();c.globalAlpha=Math.max(0,1-t);c.strokeStyle='#deef93';c.lineWidth=2;for(let i=0;i<8;i++){const a=i*Math.PI/4,spread=reduced?.7:.3+t*1.5;c.beginPath();c.moveTo(X(f.x+Math.cos(a)*spread),Y(.5+Math.abs(Math.sin(a))*spread));c.lineTo(X(f.x+Math.cos(a)*spread+.15),Y(.7+Math.abs(Math.sin(a))*spread));c.stroke();}c.fillStyle='#efffb7';c.font='bold 14px Microsoft YaHei';c.fillText('破卵 · 虫群涌出',X(f.x-1.5),Y(2.5+t));c.restore();}
}
