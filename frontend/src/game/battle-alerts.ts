import {EVENTS} from './incidents';
import type {Engine} from './engine';
export function battleAlert(e:Engine|undefined){if(!e||e.cinematic)return null;if(e.s.event)return {title:EVENTS[e.s.event.kind].title,detail:'距抵达 '+Math.ceil(e.s.event.remaining)+' 秒 · '+EVENTS[e.s.event.kind].detail};const worm=e.s.enemies.find(a=>a.type==='sandworm'&&a.state==='burrow'&&a.hp>0);if(worm)return {title:'裂地沙虫 / 建筑下方巨震',detail:'距钻出 '+Math.ceil(worm.timer)+' 秒 · 红色通道内建筑将被摧毁'};if(e.s.campaign?.stage===4&&e.s.campaign.timelineVersion===3&&e.s.campaign.spawned===1&&e.time>=590&&e.time<600)return {title:'最后的攻势 / 母舰即将抵达',detail:'距决战 '+Math.ceil(600-e.time)+' 秒 · 全体坚守，守住最后的航道'};if(e.s.bossWarning>=0)return {title:'巨型敌军信号 / BOSS 接近',detail:'距抵达 '+Math.ceil(e.s.bossWarning)+' 秒 · 调整阵型、检查防空'};return e.alert.until>e.time?e.alert:null;}
export function battleWarning(e:Engine|undefined){
 if(!e||battleAlert(e)||e.cinematic)return '';
 const t=e.time,n=e.s.campaign?undefined:Object.values(e.config.enemies).filter(p=>!p.boss&&p.unlock>t&&p.unlock-t<=15).sort((a,b)=>a.unlock-b.unlock)[0];
 return n?`${n.name}将在 ${Math.ceil(n.unlock-t)} 秒后加入刷怪池`:e.s.coreHp<=900?'核心生命危急 · 请立即维修':e.message||'';
}
export function prioritySound(sounds:string[]){return ['hullCollision','oceanSurge','thunder','failure','alarm','explosion'].find(k=>sounds.includes(k))??sounds.at(-1);}
