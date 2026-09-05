<script setup lang="ts">
import {computed,onMounted,ref} from 'vue';
const emit=defineEmits<{finish:[]}>();
const step=ref(0),selected=ref(false),wall=ref(false),tower=ref(false),branch=ref(''),heading=ref<HTMLElement>();
const titles=['欢迎来到战墙','先筑起一道城墙','在高处部署火力','选择你的升级方向','准备开始指挥'];
const canNext=computed(()=>step.value===0||step.value===1&&wall.value||step.value===2&&tower.value||step.value===3&&!!branch.value||step.value===4);
function place(){if(!selected.value)return;if(step.value===1)wall.value=true;if(step.value===2)tower.value=true;selected.value=false;}
onMounted(()=>heading.value?.focus());
</script>

<template>
 <div class="onboarding" role="dialog" aria-modal="true" aria-labelledby="guide-title" @keydown.esc.prevent="emit('finish')">
  <div class="guide-top"><span class="eyebrow">新手引导 · {{step+1}} / 5</span><button @click="emit('finish')">跳过引导</button></div>
  <div class="guide-progress" aria-hidden="true"><i v-for="n in 5" :class="{done:n<=step+1}"></i></div>
  <h2 id="guide-title" ref="heading" tabindex="-1" aria-live="polite">{{titles[step]}}</h2>
  <template v-if="step===0"><p>敌人从右侧进攻，保护左侧核心，坚持得越久越好。先用一分钟学会建造和升级。</p><div class="guide-scene"><span>✧<small>你的核心</small></span><b>← 敌人进攻方向 ←</b><span>♟<small>敌军</small></span></div><p class="muted">这是独立练习，不消耗金币，也不改变战局或已有存档。任何一步都可以跳过。</p></template>
  <template v-else-if="step===1||step===2">
   <p>{{step===1?'① 点击城墙卡片，② 点击虚线落点。正式战局也这样操作，建筑会从顶部落下。':'先选箭塔，再点击城墙上方的落点。塔落稳后会自动攻击射程内的地面敌人。'}}</p>
   <div class="guide-practice"><div class="practice-stack"><button v-if="step===2&&!tower" class="practice-slot" :disabled="!selected" aria-label="在城墙上放置箭塔" @click="place">＋ 箭塔落点</button><div v-if="tower" class="practice-building">➶ {{branch||'箭塔'}}</div><div v-if="wall" class="practice-building">▥ 城墙</div><button v-else class="practice-slot" :disabled="!selected" aria-label="放置城墙" @click="place">＋ 城墙落点</button><div class="practice-ground">地面</div></div><button :class="['practice-card',{selected}]" :disabled="step===1?wall:tower" @click="selected=true">{{step===1?'选择城墙':'选择箭塔'}}</button></div>
   <p role="status">{{(step===1?wall:tower)?'✓ 建造成功，可以进入下一步。':selected?'已选择建筑，请点击虚线落点。':'等待选择建筑…'}}</p>
  </template>
  <template v-else-if="step===3"><p>正式战局中，右键取消投放后点击建筑，在右侧选择一种升级。升级需要金币，每座建筑只能选择一个方向。</p><div class="guide-upgrades"><button :class="{selected:branch==='强化火力'}" @click="branch='强化火力'">➶ 强化火力<small>提高单次伤害</small></button><button :class="{selected:branch==='快速射击'}" @click="branch='快速射击'">➶ 快速射击<small>缩短攻击间隔</small></button></div><p role="status">{{branch?'✓ 已体验升级：'+branch:'请选择一个练习方向。实际升级名称和数值以建筑侧栏为准。'}}</p><p class="muted">Shift + 点击可多选建筑统一升级；选中防御塔后按 E，可以瞄准敌人并按住左键手动射击。</p></template>
  <template v-else><ul class="guide-tips"><li><b>发展经济：</b>矿场持续产金币，留一些资金用于维修与重建。</li><li><b>混合防御：</b>对空敌人部署防空塔；所有难度狙击塔最多 20 座。</li><li><b>注意预警：</b>怪物与 Boss 持续增强，危险区域出现时及时调整防线。</li><li><b>穿墙规则：</b>简单、普通武器可穿友方建筑；困难只有子弹穿城墙，箭矢和炮弹可穿其他友方建筑。</li><li><b>暂停与保存：</b>Space 暂停；每 15 秒自动保存，也可通过游戏菜单保存退出。</li></ul><p>主菜单和游戏菜单的「操作说明」中，随时可以重新体验引导。</p></template>
  <div class="guide-actions"><button v-if="step>0" @click="step--;selected=false">上一步</button><button class="primary" :disabled="!canNext" @click="step===4?emit('finish'):(step++,selected=false)">{{step===4?'完成引导':step===0?'开始练习':'下一步'}}</button></div>
 </div>
</template>

<style scoped>
.onboarding{max-width:640px}.guide-top,.guide-actions{display:flex;align-items:center;justify-content:space-between;gap:16px}.guide-top button{margin:0;font-size:12px}.guide-progress{display:flex;gap:6px;margin:16px 0}.guide-progress i{height:3px;flex:1;background:#394637}.guide-progress .done{background:#d8bf7e}.guide-scene{display:flex;align-items:center;justify-content:space-around;padding:35px 12px;background:#101d17;border:1px solid #415340;color:#dfc884}.guide-scene span{font-size:36px;text-align:center}.guide-scene small{display:block;font-size:12px}.guide-scene b{font-size:14px}.guide-practice{display:flex;gap:40px;align-items:center;justify-content:center;min-height:200px;background:#101d17;padding:18px}.practice-stack{width:155px;align-self:end}.practice-slot{width:100%;border:2px dashed #d8bf7e!important;min-height:55px}.practice-building{padding:16px;text-align:center;border:2px solid #829270;background:#354c3b;color:#eedca6}.practice-ground{text-align:center;border-top:3px solid #83936f;font-size:12px}.selected{outline:2px solid #e6c776;background:#42563c!important}.guide-upgrades{display:flex;gap:16px}.guide-upgrades button{flex:1}.guide-upgrades small{display:block;margin-top:10px}.guide-actions{justify-content:flex-end;margin-top:20px}.guide-tips{padding-left:20px;line-height:1.65}.guide-tips li{margin:10px 0}h2:focus{outline:none}
</style>
