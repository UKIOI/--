import {drawNewBoss} from './new-bosses';
import {enemyDetail} from './enemy-detail';
/** Shared normalized silhouettes used by combat and the field guide. */
export function drawEnemy(c:CanvasRenderingContext2D,type:string,x:number,y:number,w:number,h:number,time=0,reduced=false,attack=0,state='walk'){
 if(drawNewBoss(c,type,x,y,w,h,time,reduced,state))return;
 c.save();c.translate(x,y);c.scale(w,h);c.lineJoin='round';c.lineCap='round';const air=['flyer','bombardier','carrier','suicide_ship','fortress'].includes(type);const phase=time*(type==='runner'?15:7),walk=reduced?0:Math.sin(phase)*.08;const pulse=reduced?0:Math.sin(time*3)*.018;c.translate(reduced?0:-Math.sin(Math.min(1,attack/.3)*Math.PI)*.16,air?walk*.5:-Math.abs(walk)*.3);c.scale(1+pulse,1-pulse);if(state==='charge'&&!reduced)c.rotate(Math.sin(time*35)*.04);if(state==='fuse'){c.scale(1+Math.abs(walk),1+Math.abs(walk));}
 const ink='#18231f',bone='#eee0b9',metal='#72857d';
 const poly=(p:number[][],fill:string)=>{c.beginPath();p.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fillStyle=fill;c.fill();c.strokeStyle=ink;c.lineWidth=.045;c.stroke();};
 const line=(p:number[][],color:string,width=.06)=>{c.beginPath();p.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.strokeStyle=color;c.lineWidth=width;c.stroke();};
 const oval=(x:number,y:number,rx:number,ry:number,color:string)=>{c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fillStyle=color;c.fill();};
 const step=reduced?0:Math.sin(time*9)*.07;
 if(type==='burrow_nest'){if(state==='burrow'){oval(0,.35,.55,.08,'#ecb375');line([[-.5,.35],[-.2,.25],[0,.37],[.25,.28],[.5,.35]],'#ffdc96',.05);}else{for(const side of [-1,1])for(let i=0;i<3;i++)line([[side*.22,i*.15-.05],[side*.48,i*.15-.2],[side*.55,i*.12+.2]],'#b19b73',.09);oval(0,.1,.37,.4,'#636b42');for(const px of [-.2,0,.2])for(const py of [-.1,.14])oval(px,py,.09,.12,'#c8d97e');poly([[-.34,-.2],[-.2,-.5],[.22,-.5],[.35,-.18],[0,-.08]],'#a59b79');oval(0,-.25,.18,.13,'#18291d');line([[-.12,-.4],[.12,-.4]],'#ffe694',.055);}}else if(type==='fortress'){
  for(const side of [-1,1]){poly([[side*.16,-.37],[side*.48,-.3],[side*.52,.26],[side*.22,.38]],'#536e78');for(const py of [-.2,.16]){oval(side*.4,py,.12,.13,ink);oval(side*.4,py,.075,.09,'#83e1e1');line([[side*.4,py+.07],[side*.4,py+.21+Math.abs(walk)]],'#91eeed',.055);}}
  poly([[-.34,-.32],[.1,-.42],[.34,-.2],[.32,.2],[.06,.35],[-.36,.2],[-.51,-.02]],'#9eaa9d');poly([[-.45,-.04],[-.25,-.2],[.02,-.16],[-.06,.02],[-.4,.06]],'#253e49');line([[-.38,-.06],[-.13,-.1]],'#ffd49a',.04);
  poly([[-.17,.03],[.23,.03],[.21,.28],[-.15,.28]],'#27383c');for(const px of [-.09,.04,.17]){line([[px,.07],[px,.23]],'#dfb276',.035);oval(px,.28,.035,.035,'#f6c16c');}poly([[-.08,-.34],[.06,-.57],[.2,-.34]],'#657e80');line([[.07,-.49],[.07,-.66]],'#dcead3',.025);
 }else if(type==='suicide_ship'){poly([[-.52,0],[-.1,-.19],[.38,-.12],[.48,0],[.38,.12],[-.1,.19]],'#af8170');poly([[-.12,-.14],[.2,-.5],[.34,-.08]],'#597d80');poly([[-.12,.14],[.2,.5],[.34,.08]],'#597d80');oval(-.22,0,.11,.1,'#ffb580');line([[.45,0],[.7+(reduced?0:Math.abs(walk)),0]],'#ffd789',.13);}else if(['marshal','leaper','blastbeetle','reflector','spitter'].includes(type)){
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
 burrow_nest:{role:'地底孵化精英',behavior:'6 分钟后出现，基础生命 1500、护甲 10%，最多同时 2 只。锁定建筑底部，预警 6 秒后破土，直接摧毁本体出土范围内建筑并造成周边范围伤害，释放 4 只虫；之后每 12 秒生成 2 只。',counter:'潜地时无法攻击；按预警吊装关键设施，出土后用单体火力优先消灭本体，阻止持续增援。'},
 sandworm:{role:'地下 Boss',behavior:'无限模式满 15 分钟后才进入 Boss 候选池，战役按关卡安排出现。巨型沙虫锁定建筑下方，预警 5 秒后逐层钻出，摧毁三列通道内全部建筑；暴露 12 秒后再次潜地。',counter:'预警时回收高价值建筑，分散阵地；沙虫出土后集中地面火力。潜地时不可被攻击。'},
 leviathan:{role:'港湾终章 Boss',behavior:'沉船与深海甲壳共生的巨型统领，新版终章中，外星母舰坠毁后从背景沉船中爬出，固定占据建筑区中央。过场期间战斗冻结，登场后暴雨闪电覆盖港湾。生命按 20 座基础狙击塔持续 120 秒的理论伤害计算（无增益、未扣护甲），不随时间涨血；登场后经济产能提升至 3 倍。巨爪三段横扫有 2.4 秒预警，持续召唤带预警的空降虫群，半血加快横扫和召唤。三重潮汐有 3.5 秒起步的落点预警，深水雷从本体发射并造成范围伤害。半血进入狂潮，加快施法但核心受到的生命伤害增加 15%。',counter:'利用 8:00—10:00 整备窗口修复防线；母舰坠毁后的“结束了？”并非通关，真正的巨型领主还未被击败。分散高价值建筑，吊装避开蓝色落点，拦截阵列击落深水雷，狂潮阶段集中单体火力。'},
 queen:{role:'虫巢 Boss',behavior:'女王维系一座共生虫巢：虫卵脉动并显示倒计时，孵化时从巢口释放跃袭兽、隔爆甲兽等虫群；另向三处目标喷射酸液。虫巢与女王共生，击败女王即可停止孵化。',counter:'范围火力处理幼虫，用单体火力攻击女王，防止后排被酸液消耗。'},
 tempest:{role:'雷暴 Boss',behavior:'巨翼雷兽在空中蓄积电能，预警后发动三处落雷及等离子弹。',counter:'广域防空覆盖空域，分散高层建筑，注意落雷提示。'},
 marshal:{role:'协同指挥',behavior:'14 格内组织部队行进整队：落后单位最多加速 60% 追赶护盾，前排继续推进，护盾虫不停下等人。空中堡垒吸引自动防空火力；自爆飞船积攒 3 艘或等待 10 秒后齐袭同一高价值目标。没有护盾时正常推进，不因队友间距停步。',counter:'优先狙杀指挥虫可解除追赶加速与队形指挥，迫使集结飞船提前出击；护盾虫的近距离掩护仍存在，手动防空可绕过堡垒诱饵。'},
 fortress:{role:'重型空投平台',behavior:'7 分钟后出现，基础生命 1800、护甲 20%，最多同时 2 艘。进入战区后空投 4 只地面虫，之后每 18 秒增援；被击毁后预警坠落，爆炸也伤害地面虫群。',counter:'利用坠爆清理下方虫群；撤离残骸落点。指挥虫在场时堡垒会吸引自动防空，手动瞄准可攻击其他空中敌人。'},
 leaper:{role:'机动突袭',behavior:'周期性短跃避开固定炮击落点，落地会短暂停顿；不会跳过城墙。',counter:'箭塔持续输出，冰霜塔减缓跳跃。'},
 blastbeetle:{role:'隔爆重甲',behavior:'爆炸伤害降低 50%，移动缓慢。',counter:'箭塔与狙击塔没有额外伤害减免。'},
 reflector:{role:'炮弹反射',behavior:'基础生命 300、护盾 280、物理护甲 15%。护盾存在时反弹迫击炮或加农炮弹，消耗原伤害 65% 的护盾，返还 80% 炮弹伤害。无需指挥虫，为 3.2 格内普通地面友军承担 80% 伤害，消耗自身护盾；护盾不叠加，不能互保护盾虫或保护 Boss。',counter:'先用箭矢、狙击或冰霜集中破盾；破盾后掩护与反射同时失效，不会自动回盾。指挥虫仍可组织地面部队靠拢护盾。'},
 spitter:{role:'远程酸液',behavior:'在 6.5 格内停下并从口器吐出实体酸液，命中建筑后小范围溅射。',counter:'狙击远程清除，前墙可挡住酸液。'},
 suicide_ship:{role:'高速自爆飞船',behavior:'高速进入战场，优先锁定累计投入最高的设施，城墙与桥梁优先级最低。受指挥时会在堡垒后方集结，3 艘或等待 10 秒后齐袭。短暂预警后冲撞，命中造成范围爆炸。',counter:'用防空火力在冲撞前击毁，提前击落不会产生伤害爆炸。'},
 grunt:{role:'步行步兵',behavior:'披挂废铁面甲的前线步兵，遇到地面障碍便持续近战。',counter:'用城墙阻挡，再由有清晰射界的弩炮消灭。'},
 runner:{role:'高速猎手',behavior:'低伏的四肢和后掠骨刺让它迅速穿过防线缺口。',counter:'冰霜减速，配合连弩持续输出。'},
 bomber:{role:'接触自爆',behavior:'背负发光爆裂囊，接触障碍后蓄力 1.2 秒再爆炸。击杀不会引爆。',counter:'在蓄力结束前集火，避免将脆弱设施集中在最前排。'},
 flyer:{role:'空中突袭',behavior:'展开膜翼越过建筑，飞到核心上方直接攻击核心。',counter:'提前建造防空塔，地面火力无法命中它。'},
 bombardier:{role:'空中轰炸',behavior:'双旋翼运输重型炸弹，优先锁定附近累计造价最高的落稳建筑。',counter:'防空塔拦截，留意落点预警，上层建筑先承受投弹。'},
 siege:{role:'装甲攻城',behavior:'履带底盘与正面重甲缓慢推进，自带 25% 护甲。',counter:'迫击炮与寒冷伤害无视护甲，维修站维持前墙。'},
 beast:{role:'地面 Boss',behavior:'骨角与重型护臂撕开防线。蓄力破城冲撞，还会踏地震波与投掷巨岩。',counter:'用加固墙承受冲撞，后排持续输出并维修。'},
 carrier:{role:'空中 Boss',behavior:'召唤护航、导弹齐射与地毯轰炸。可破坏机库和导弹舱；发射炸弹后核心短暂暴露。死亡后残骸预警坠落，造成大范围高伤爆炸。',counter:'火控面板选择部位，用防空拆除武器；核心暴露时集火。母舰被击毁后仍须撤离残骸下方，吊装站可搬走关键建筑。'}
};
