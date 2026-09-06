<script setup lang="ts">
import {onMounted,ref} from 'vue';
import {BACKGROUNDS,paintBackground,type BackgroundId} from '../game/render/backgrounds';
defineProps<{modelValue:string}>();
defineEmits<{'update:modelValue':[value:BackgroundId]}>();
const root=ref<HTMLElement>();
onMounted(()=>{root.value?.querySelectorAll('canvas').forEach((canvas,i)=>{const c=canvas.getContext('2d')!;c.scale(canvas.width/36,canvas.height/16);paintBackground(c,BACKGROUNDS[i].id);});});
</script>

<template>
 <fieldset ref="root" class="background-picker"><legend>战场背景</legend><p>切换立即生效，自动保存你的选择。</p>
  <div class="background-options"><button v-for="b in BACKGROUNDS" :key="b.id" type="button" :aria-pressed="modelValue===b.id" :aria-label="b.name" @click="$emit('update:modelValue',b.id)"><canvas width="360" height="160" aria-hidden="true"></canvas><span>{{b.name}} <b v-if="modelValue===b.id">✓</b></span><small>{{b.description}}</small></button></div>
 </fieldset>
</template>

<style scoped>
.background-picker{border:0;padding:0;margin:8px 0 16px;min-width:0}.background-picker legend{font-size:14px;color:#d2d8bf}.background-picker p{font-size:11px;margin:5px 0 10px;color:#91a397}.background-options{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}.background-options button{min-width:0;padding:5px;text-align:left;background:#13201f;border:1px solid #35463e;border-radius:4px}.background-options button[aria-pressed=true]{border-color:#d4c78e;background:#28362a;box-shadow:0 0 0 1px #d4c78e55}.background-options button:focus-visible{outline:2px solid #f3e7b1;outline-offset:2px}.background-options canvas{display:block;width:100%;height:auto;border-radius:2px}.background-options span{display:block;font-size:12px;margin:6px 3px 3px;color:#dae0c8}.background-options b{float:right;color:#e5ce8a}.background-options small{display:block;font-size:10px;line-height:1.4;color:#98ab9e;margin:0 3px 3px}@media(max-width:520px){.background-options{grid-template-columns:repeat(2,minmax(0,1fr))}}
</style>
