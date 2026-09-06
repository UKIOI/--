import {defineStore} from 'pinia';
export const useSession=defineStore('session',{state:()=>({page:'menu',modal:'',saveStatus:'正在连接本地服务…',selectedKind:'',selectedId:0,settings:{musicVolume:.3,sfxVolume:.7,reducedMotion:false,tutorialSeen:false,campaignCleared:0,falseEndingAchievement:false,layout:'expanded',background:'city'}})});
