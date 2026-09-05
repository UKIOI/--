import type {Config,World} from './types';
import {api,ApiError,localPut} from '../api/client';
export function validateSnapshot(s:World,c:Config){if(!s||s.schemaVersion!==1||s.configVersion!==c.configVersion||!Array.isArray(s.buildings)||!Array.isArray(s.enemies)||!s.alive||s.coreHp<=0||s.rng<=0)throw Error('存档版本或内容不兼容。请导出备份后新开游戏。');if(s.buildings.some(b=>!c.buildings[b.type])||s.enemies.some(e=>!c.enemies[e.type]))throw Error('存档含未知实体');return s;}
export class SaveQueue {
 pending:World|null=null;busy:Promise<boolean>|null=null;revision=0;blocked=false;
 constructor(public status:(message:string)=>void,public conflict:()=>void,public updated:(revision:number)=>void){}
 save(snapshot:World){this.pending=structuredClone(snapshot);if(!this.busy)this.busy=this.drain().finally(()=>this.busy=null);return this.busy;}
 private async drain(){let success=true;while(this.pending){const s=this.pending;this.pending=null;s.revision=this.revision;try{await localPut('save',s);}catch{this.status('浏览器备份失败，请勿关闭页面');success=false;continue;}if(this.blocked){this.status('存档冲突：已保留浏览器副本');success=false;continue;}try{const {data}=await api<{revision:number}>('/save','PUT',{expectedRevision:this.revision,snapshot:s});this.revision=data.revision;s.revision=data.revision;await localPut('save',s);this.updated(data.revision);this.status('已保存 · 本机与浏览器');}catch(e){success=false;if(e instanceof ApiError&&e.status===409){this.blocked=true;this.conflict();}this.status(e instanceof ApiError?e.message:'服务离线 · 已保留浏览器副本');}}return success;}
}
