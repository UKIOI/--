<script setup lang="ts">
import {computed} from 'vue';import type {Engine} from '../game/engine';
const props=defineProps<{engine:Engine;tick:number}>();const carrier=computed(()=>{void props.tick;return props.engine.s.enemies.find(a=>a.type==='carrier'&&a.hp>0);});const crate=computed(()=>{void props.tick;return props.engine.s.crate;});
</script>
<template><div v-if="carrier?.parts||crate" class="tactical-panel">
 <div v-if="carrier?.parts"><b>母舰火控目标</b><div class="part-options"><button v-for="(name,key) in {auto:'自动',hull:'舰体',hangar:'机库',missiles:'导弹舱',core:'主核心'}" :class="{active:engine.partTarget===key}" :disabled="(key==='hangar'||key==='missiles')&&carrier.parts[key]<=0" @click="engine.partTarget=key">{{name}}<small v-if="key==='hangar'||key==='missiles'">{{Math.ceil(carrier.parts[key]/carrier.parts.max*100)}}%</small></button></div><small>护盾破裂后可破坏部位。核心{{engine.time<(carrier.weakUntil??0)?'已暴露：×1.6':'封闭：×0.65'}}伤害；范围内对空火力生效。</small></div>
 <div v-if="crate"><b>军械箱 {{crate.falling?'正在降落':Math.floor(crate.progress)+'/20 秒回收'}}</b><small>生命 {{Math.ceil(crate.hp)}} · 剩余 {{Math.ceil(crate.remaining)}} 秒。4 格内有建筑、3 格内无敌人时回收。奖励 150 G + 一次强化。</small></div>
</div></template>
<style scoped>.tactical-panel{display:flex;gap:22px;padding:10px 18px;margin:0 24px 8px;background:#1b2a23;border:1px solid #596546;align-items:center}.tactical-panel>div{flex:1}.tactical-panel b{font-size:12px}.tactical-panel small{display:block;font-size:10px;color:#bac6a0;line-height:1.5}.part-options{display:inline-flex;gap:4px;margin:0 10px}.part-options button{padding:5px 10px;font-size:11px}.part-options small{display:inline;margin-left:4px}.part-options .active{border-color:#e9cc8b;background:#4b5035}</style>
