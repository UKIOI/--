import {drawNewBoss} from './new-bosses';
import {enemyDetail} from './enemy-detail';
/** Shared normalized silhouettes used by combat and the field guide. */
export function drawEnemy(c:CanvasRenderingContext2D,type:string,x:number,y:number,w:number,h:number,time=0,reduced=false,attack=0,state='walk'){
 if(drawNewBoss(c,type,x,y,w,h,time,reduced,state))return;
 c.save();c.translate(x,y);c.scale(w,h);c.lineJoin='round';c.lineCap='round';const air=['flyer','bombardier','carrier'].includes(type);const phase=time*(type==='runner'?15:7),walk=reduced?0:Math.sin(phase)*.08;const pulse=reduced?0:Math.sin(time*3)*.018;c.translate(reduced?0:-Math.sin(Math.min(1,attack/.3)*Math.PI)*.16,air?walk*.5:-Math.abs(walk)*.3);c.scale(1+pulse,1-pulse);if(state==='charge'&&!reduced)c.rotate(Math.sin(time*35)*.04);if(state==='fuse'){c.scale(1+Math.abs(walk),1+Math.abs(walk));}
 const ink='#18231f',bone='#eee0b9',metal='#72857d';
 const poly=(p:number[][],fill:string)=>{c.beginPath();p.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fillStyle=fill;c.fill();c.strokeStyle=ink;c.lineWidth=.045;c.stroke();};
 const line=(p:number[][],color:string,width=.06)=>{c.beginPath();p.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.strokeStyle=color;c.lineWidth=width;c.stroke();};
 const oval=(x:number,y:number,rx:number,ry:number,color:string)=>{c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fillStyle=color;c.fill();};
 const step=reduced?0:Math.sin(time*9)*.07;
 if(['marshal','leaper','blastbeetle','reflector','spitter'].includes(type)){
 const tone=type==='marshal'?'#bc9ace':type==='leaper'?'#d9b476':type==='blastbeetle'?'#bd9982':type==='reflector'?'#88c8d1':'#a5bf70';
 for(const side of [-1,1])for(let i=0;i<3;i++)line([[side*.15,-.2+i*.18],[side*(.38+walk),-.12+i*.19],[side*.5,.03+i*.19]],tone,.06);
 if(type==='leaper'){if(state==='leap')c.translate(0,-Math.sin(Math.max(0,(time*5)%Math.PI))*.35);poly([[-.48,-.08],[-.1,-.32],[.38,-.17],[.27,.2],[-.33,.16]],tone);line([[.2,.1],[.52,-.03],[.4,.44]],bone,.11);}
 else{oval(0,0,.35,.36,tone);line([[0,-.32],[0,.32]],ink,.04);}
 oval(-.3,-.12,.13,.16,tone);oval(-.36,-.16,.04,.04,'#fff0a6');
 if(type==='marshal'){for(const sign of [-1,1]){line([[sign*.13,-.25],[sign*.3,-.64]],tone,.035);oval(sign*.3,-.64,.06,.06,'#e4c8ff');}for(const r of [.16,.25]){c.strokeStyle='#cfb9ed';c.lineWidth=.025;c.beginPath();c.arc(0,-.35,r,Math.PI,Math.PI*2);c.stroke();}}
 if(type==='blastbeetle')for(const py of [-.2,0,.2]){poly([[-.25,py-.1],[.24,py-.1],[.32,py+.06],[-.31,py+.06]],'#827f73');line([[-.2,py],[.2,py]],'#ddbd8e',.035);}
 if(type==='reflector'){poly([[-.27,-.26],[0,-.4],[.3,-.23],[.3,.21],[0,.37],[-.27,.2]],'#487f8d');line([[-.18,-.17],[.16,.15],[-.12,.2]],'#cef6ff',.07);}
 if(type==='spitter'){oval(.13,-.1,.22,.26,'#677e41');oval(.13,-.1,.14,.17,'#d2e48c');line([[-.32,-.08],[-.64,-.1]],'#a5bf70',.12);}
 }else if(type==='grunt'){
  line([[-.22,.2],[-.32+walk,.47],[-.48+walk,.47]],metal,.14);line([[.19,.2],[.28-walk,.46],[.08-walk,.46]],metal,.14);
  poly([[-.34,-.13],[-.2,-.4],[.12,-.46],[.36,-.18],[.29,.23],[-.28,.23]],'#9da286');poly([[-.42,-.13],[-.1,-.21],[.14,-.09],[-.1,.04],[-.43,.02]],'#c3bca0');line([[-.34,-.08],[-.12,-.08]],'#e89274',.07);line([[.29,-.06],[.48,.14],[.4,.3]],bone,.09);
 }else if(type==='runner'){
  line([[.24,.12],[.42,.28+step],[.19,.45]],'#bc9368',.09);line([[-.06,.1],[-.36,.28-step],[-.53,.44]],'#d6b37f',.09);poly([[-.53,-.11],[-.17,-.32],[.33,-.2],[.52,-.03],[.16,.17],[-.21,.12]],'#c9aa78');poly([[.12,-.27],[.26,-.49],[.34,-.23]],bone);poly([[-.43,-.18],[-.5,-.36],[-.2,-.27]],'#b78265');line([[-.46,-.04],[-.26,-.09]],'#f5e5a9',.07);line([[.37,-.13],[.62,-.29],[.69,-.15]],'#bc9368');
 }else if(type==='bomber'){
  for(const side of [-1,1])line([[side*.2,.23],[side*.39+walk*side,.36],[side*.43+walk*side,.48]],metal,.1);oval(0,0,.43,.37,ink);oval(0,-.02,.36,.31,'#c47859');poly([[-.32,-.22],[-.07,-.38],[.19,-.32],[.32,-.12],[.1,-.05]],'#eab06e');oval(0,.04,.2,.18,'#512e28');oval(0,.04,.11,.1,'#ffcb76');line([[-.26,.24],[.26,-.23]],metal,.07);line([[-.16,-.32],[-.21,-.49],[.05,-.55]],bone,.045);oval(.06,-.54,.055,.045,'#e89274');
 }else if(type==='flyer'){
  const flap=reduced?0:Math.sin(time*7)*.12;poly([[-.07,-.1],[-.66,-.48+flap],[-.49,.05],[-.24,-.04],[-.29,.27],[.02,.15]],'#b3a2c0');poly([[.04,-.11],[.63,-.42+flap],[.49,.12],[.27,0],[.26,.3],[-.01,.15]],'#817e9d');poly([[-.2,-.23],[.09,-.27],[.19,.18],[-.02,.4],[-.19,.12]],'#d0b9c4');line([[-.17,-.12],[-.04,-.08]],'#ffe0a4',.08);line([[0,.29],[.03,.5]],bone,.045);
 }else if(type==='bombardier'){
  line([[-.51,-.36],[.51,-.36]],metal,.045);oval(-.3,-.36,(reduced?.24:.08+Math.abs(Math.cos(time*38))*.19),.035,'#c2c7b6');oval(.3,-.36,(reduced?.24:.08+Math.abs(Math.cos(time*38))*.19),.035,'#c2c7b6');poly([[-.48,-.12],[-.27,-.31],[.25,-.31],[.48,-.1],[.32,.19],[-.34,.19]],'#8c9c9d');poly([[-.44,-.1],[-.22,-.2],[-.06,-.16],[-.1,.03],[-.4,.03]],'#d2b58c');for(const px of [-.22,.07,.33]){line([[px,.1],[px,.27]],ink,.06);oval(px,.3,.09,.17,'#c99465');line([[px-.06,.38],[px+.06,.38]],bone,.03);}
 }else if(type==='siege'){
  poly([[-.5,.23],[-.36,.48],[.36,.48],[.51,.25],[.37,.1],[-.38,.1]],'#4f655b');for(const px of [-.3,0,.3]){oval(px,.32,.09,.09,'#a9b196');line([[px,.32],[px+Math.cos(reduced?0:phase)*.075,.32+Math.sin(reduced?0:phase)*.075]],ink,.025);}poly([[-.4,-.22],[-.13,-.48],[.32,-.4],[.47,-.05],[.3,.23],[-.35,.23]],'#788b76');poly([[-.5,-.35],[-.23,-.31],[-.18,.3],[-.49,.25],[-.59,-.03]],'#bac5a5');line([[-.48,-.13],[-.29,-.12]],'#e89274',.08);line([[.12,-.27],[.3,-.21],[.31,.09]],'#d3c48b',.08);poly([[.32,-.34],[.39,-.52],[.46,-.26]],bone);
 }else if(type==='beast'){
  line([[-.25,.19],[-.34+walk,.43],[-.55+walk,.47]],'#826e61',.17);line([[.23,.21],[.39-walk,.43],[.15-walk,.47]],'#826e61',.18);poly([[-.37,-.26],[.07,-.47],[.41,-.31],[.47,.17],[.18,.32],[-.36,.22]],'#a27e64');for(const px of [-.08,.13,.33])poly([[px-.1,-.34],[px,-.58],[px+.08,-.3]],'#b8bc9f');poly([[-.57,-.24],[-.19,-.34],[.02,-.17],[-.17,.07],[-.55,.04]],'#c5a17f');poly([[-.51,-.22],[-.67,-.43],[-.34,-.24]],bone);poly([[-.53,.03],[-.59,.21],[-.38,.07]],bone);line([[-.49,-.12],[-.27,-.14]],'#ffba81',.055);poly([[.23,-.04],[.48,-.13],[.59,.26],[.35,.31]],'#7a8777');
 }else if(type==='carrier'){
  for(const px of [-.33,.29]){poly([[px-.13,-.24],[px+.12,-.24],[px+.16,.28],[px-.15,.28]],'#657c78');oval(px,.27,.07,reduced?.12:.12+Math.abs(walk),'#8fd0c5');}poly([[-.53,-.05],[-.27,-.32],[.25,-.31],[.52,-.08],[.39,.2],[-.32,.21]],'#9ba6a3');poly([[-.48,-.04],[-.17,-.14],[.32,-.13],[.43,.02],[.12,.12],[-.37,.1]],'#384d4d');poly([[-.26,-.3],[-.12,-.5],[.13,-.49],[.22,-.3]],'#809b92');line([[-.38,-.02],[-.14,-.04]],'#f0bb85',.035);for(const px of [-.06,.08,.22])oval(px,.01,.025,.045,'#d1e9d6');line([[.06,-.45],[.07,-.62]],bone,.025);
 }enemyDetail(c,type,time,reduced);c.restore();
}
export const enemyLore:Record<string,{role:string;behavior:string;counter:string}>={
 sandworm:{role:'地下 Boss',behavior:'巨型沙虫锁定建筑下方，预警 5 秒后逐层钻出，摧毁三列通道内全部建筑；暴露 12 秒后再次潜地。',counter:'预警时回收高价值建筑，分散阵地；沙虫出土后集中地面火力。潜地时不可被攻击。'},
 queen:{role:'虫巢 Boss',behavior:'定期繁殖跃袭兽、隔爆甲兽等虫群，并向三处目标喷射酸液。',counter:'范围火力处理幼虫，用单体火力攻击女王，防止后排被酸液消耗。'},
 tempest:{role:'雷暴 Boss',behavior:'巨翼雷兽在空中蓄积电能，预警后发动三处落雷及等离子弹。',counter:'广域防空覆盖空域，分散高层建筑，注意落雷提示。'},
 marshal:{role:'散阵指挥',behavior:'信号触须指挥附近地面怪物拉开间距，降低爆炸收益。',counter:'手控狙击塔优先击杀；拥堵时仍会聚集。'},
 leaper:{role:'机动突袭',behavior:'周期性短跃避开固定炮击落点，落地会短暂停顿；不会跳过城墙。',counter:'箭塔持续输出，冰霜塔减缓跳跃。'},
 blastbeetle:{role:'隔爆重甲',behavior:'爆炸伤害降低 50%，移动缓慢。',counter:'箭塔与狙击塔没有额外伤害减免。'},
 reflector:{role:'炮弹反射',behavior:'护盾存在时反弹范围内的迫击炮或加农炮弹，反射消耗护盾，返还 65% 炮弹伤害。',counter:'先用箭矢、狙击或冰霜破盾；破盾后无法反射。'},
 spitter:{role:'远程酸液',behavior:'在 6.5 格内停下并从口器吐出实体酸液，命中建筑后小范围溅射。',counter:'狙击远程清除，前墙可挡住酸液。'},
 grunt:{role:'步行步兵',behavior:'披挂废铁面甲的前线步兵，遇到地面障碍便持续近战。',counter:'用城墙阻挡，再由有清晰射界的弩炮消灭。'},
 runner:{role:'高速猎手',behavior:'低伏的四肢和后掠骨刺让它迅速穿过防线缺口。',counter:'冰霜减速，配合连弩持续输出。'},
 bomber:{role:'接触自爆',behavior:'背负发光爆裂囊，接触障碍后蓄力 1.2 秒再爆炸。击杀不会引爆。',counter:'在蓄力结束前集火，避免将脆弱设施集中在最前排。'},
 flyer:{role:'空中突袭',behavior:'展开膜翼越过建筑，飞到核心上方直接攻击核心。',counter:'提前建造防空塔，地面火力无法命中它。'},
 bombardier:{role:'空中轰炸',behavior:'双旋翼运输重型炸弹，优先锁定附近累计造价最高的落稳建筑。',counter:'防空塔拦截，留意落点预警，上层建筑先承受投弹。'},
 siege:{role:'装甲攻城',behavior:'履带底盘与正面重甲缓慢推进，自带 25% 护甲。',counter:'迫击炮与寒冷伤害无视护甲，维修站维持前墙。'},
 beast:{role:'地面 Boss',behavior:'骨角与重型护臂撕开防线。蓄力破城冲撞，还会踏地震波与投掷巨岩。',counter:'用加固墙承受冲撞，后排持续输出并维修。'},
 carrier:{role:'空中 Boss',behavior:'进入战区即准备释放三只护航怪与空降酸液虫。四枚强力导弹齐射，并轰炸最密集的连续三列，另有蓄能激光。',counter:'在母舰接近前部署防空，优先拦截护航与空降虫；分散关键设施，留意轰炸预警。'}
};
