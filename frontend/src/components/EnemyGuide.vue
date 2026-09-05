<script setup lang="ts">
import {computed,nextTick,onMounted,ref,watch} from 'vue';
import type {Config} from '../game/types';
import {drawEnemy,enemyLore} from '../game/render/enemies';
const props=defineProps<{config:Config}>();const emit=defineEmits<{close:[]}>();
const selected=ref('grunt'),filter=ref('all'),art=ref<HTMLCanvasElement>();
const entry=computed(()=>props.config.enemies[selected.value]);const lore=computed(()=>enemyLore[selected.value]);
const entries=computed(()=>Object.entries(props.config.enemies).filter(([,p])=>filter.value==='all'||(filter.value==='boss'?p.boss:filter.value==='air'?p.air&&!p.boss:!p.air&&!p.boss)));
function paint(){const canvas=art.value;if(!canvas)return;const c=canvas.getContext('2d')!;c.clearRect(0,0,560,280);c.strokeStyle='#aac59112';for(let x=0;x<560;x+=28){c.beginPath();c.moveTo(x,0);c.lineTo(x,280);c.stroke();}for(let y=0;y<280;y+=28){c.beginPath();c.moveTo(0,y);c.lineTo(560,y);c.stroke();}const p=entry.value,s=Math.min(185/p.width,170/p.height);drawEnemy(c,selected.value,280,145,p.width*s,p.height*s,0,true);}
watch(selected,()=>nextTick(paint));onMounted(paint);
</script>
<template>
 <div class="guide-heading"><div><div class="eyebrow">敌情档案 / FIELD GUIDE</div><h2>怪物图鉴</h2></div><button aria-label="关闭怪物图鉴" @click="emit('close')">✕</button></div>
 <p>识别来袭者，部署合适的防线。以下为基础数值，实战随威胁等级增强。</p>
 <div class="guide-filters"><button v-for="f in [{id:'all',name:'全部 '+Object.keys(config.enemies).length},{id:'ground',name:'地面'},{id:'air',name:'空中'},{id:'boss',name:'Boss'}]" :class="{active:filter===f.id}" @click="filter=f.id">{{f.name}}</button></div>
 <div class="guide-layout"><nav class="guide-list" aria-label="怪物列表"><button v-for="([id,p]) in entries" :key="id" :class="{active:selected===id}" @click="selected=id"><span>{{p.name}}</span><small>{{enemyLore[id]?.role}}</small></button></nav><article class="guide-entry"><canvas ref="art" width="560" height="280" role="img" :aria-label="entry.name+'外形'"/><div class="guide-name"><h3>{{entry.name}}</h3><span>{{lore.role}}</span></div><div class="guide-stats"><span>生命<strong>{{entry.hp}}</strong></span><span>基础伤害<strong>{{entry.damage}}</strong></span><span>速度 / 格每秒<strong>{{entry.speed}}</strong></span><span>击杀金币<strong>{{entry.reward}}</strong></span></div><p class="guide-unlock">{{selected==='carrier'?'第二种 Boss · 首次计划于 10:00 登场':selected==='beast'?'第一种 Boss · 首次计划于 05:00 登场':`${entry.boss?'Boss 首次计划':'解锁时间'} ${Math.floor(entry.unlock/60).toString().padStart(2,'0')}:${(entry.unlock%60).toString().padStart(2,'0')}`}}</p><p>{{lore.behavior}}</p><div class="guide-counter"><b>应对建议</b><p>{{lore.counter}}</p></div></article></div>
</template>
