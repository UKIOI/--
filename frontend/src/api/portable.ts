import config from '../../../content/game-config.json' with {type:'json'};
import {ApiError} from './error';
import {normalizeBackground} from '../game/render/backgrounds';
const defaults={musicVolume:.3,sfxVolume:.7,reducedMotion:false,tutorialSeen:false,campaignCleared:0,layout:'expanded',background:'city'};
interface Store {revision:number;snapshot:any;savedAt:string|null;settings:typeof defaults;runs:any[]}
const initial=():Store=>({revision:0,snapshot:null,savedAt:null,settings:{...defaults},runs:[]});
/** A separate local database: never imports a developer's save or contacts a server. */
function open(){return new Promise<IDBDatabase>((resolve,reject)=>{const r=indexedDB.open('warwall-portable-game',1);r.onupgradeneeded=()=>r.result.createObjectStore('state');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(new ApiError(503,'浏览器未允许本地存档，请使用普通窗口打开游戏。'));});}
export async function portableApi<T>(path:string,method='GET',body?:unknown):Promise<{data:T;revision:number}>{
 if(path==='/config')return {data:structuredClone(config) as T,revision:0};
 const db=await open();return new Promise((resolve,reject)=>{
  const tx=db.transaction('state',method==='GET'?'readonly':'readwrite'),store=tx.objectStore('state'),read=store.get('game');let answer:{data:T;revision:number};let failure:unknown;
  read.onsuccess=()=>{try{const s:Store=read.result??initial(),b=body as any,url=new URL(path,'https://offline.invalid'),key=url.pathname;let data:any=null;
   if(key==='/settings'){
    if(method==='PUT'){if(!b||!Number.isFinite(b.musicVolume)||!Number.isFinite(b.sfxVolume)||b.musicVolume<0||b.musicVolume>1||b.sfxVolume<0||b.sfxVolume>1)throw new ApiError(422,'音量必须在 0 到 1 之间');s.settings={musicVolume:b.musicVolume,sfxVolume:b.sfxVolume,reducedMotion:!!b.reducedMotion,tutorialSeen:!!b.tutorialSeen,campaignCleared:Math.max(s.settings.campaignCleared??0,Math.max(0,Math.min(5,Math.floor(Number(b.campaignCleared)||0)))),layout:b.layout==='classic'?'classic':'expanded',background:normalizeBackground(b.background)};}
    else if(method!=='GET')throw new ApiError(405,'操作不支持');data={...defaults,...s.settings,background:normalizeBackground(s.settings.background)};
   }else if(key==='/save'){
    if(method==='PUT'){
     if(b?.expectedRevision!==s.revision)throw new ApiError(409,'存档已在其他窗口更新，请选择要保留的进度');
     if(!b.snapshot||b.snapshot.schemaVersion!==1||b.snapshot.configVersion!==config.configVersion||!b.snapshot.alive||!Array.isArray(b.snapshot.buildings)||!Array.isArray(b.snapshot.enemies))throw new ApiError(422,'存档内容无效');
     s.revision++;s.snapshot=structuredClone(b.snapshot);s.snapshot.revision=s.revision;s.savedAt=new Date().toISOString();data={revision:s.revision,savedAt:s.savedAt};
    }else if(method==='DELETE'){
     if(Number(url.searchParams.get('expectedRevision'))!==s.revision||url.searchParams.get('runId')!==s.snapshot?.runId)throw new ApiError(409,'存档版本不一致');s.revision++;s.snapshot=null;s.savedAt=null;
    }else if(method==='GET')data=s.snapshot?{revision:s.revision,savedAt:s.savedAt,snapshot:s.snapshot}:null;
    else throw new ApiError(405,'操作不支持');
   }else if(key==='/runs'){
    if(method==='POST'){
     if(!b||typeof b.runId!=='string'||!['durationTicks','kills','bossKills','maxThreat'].every(k=>Number.isInteger(b[k])&&b[k]>=0))throw new ApiError(422,'战绩内容无效');
     data=s.runs.find(r=>r.runId===b.runId);if(!data){data={...b,endedAt:new Date().toISOString(),survivalSeconds:b.durationTicks/60,score:Math.floor(b.durationTicks/60)*10+b.kills*5+b.bossKills*500};s.runs.unshift(data);if(s.snapshot?.runId===b.runId){s.snapshot=null;s.savedAt=null;s.revision++;}}
    }else if(method==='GET')data={items:s.runs.slice(0,Math.max(1,Math.min(100,Number(url.searchParams.get('limit'))||20))),bestScore:s.runs.reduce((n,r)=>Math.max(n,r.score),0)};
    else throw new ApiError(405,'操作不支持');
   }else throw new ApiError(404,'离线版不支持该操作');
   answer={data:structuredClone(data),revision:s.revision};if(method!=='GET')store.put(s,'game');
  }catch(e){failure=e;tx.abort();}};
  tx.oncomplete=()=>{db.close();resolve(answer);};tx.onabort=()=>{db.close();reject(failure??new ApiError(503,'本地保存失败，可能是浏览器存储空间不足。'));};tx.onerror=()=>{failure??=new ApiError(503,'本地存储不可用');};
 });
}
