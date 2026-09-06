<script setup lang="ts">
import {computed} from 'vue';
import notes from '../../../content/changelog.json';
const props=defineProps<{unlocked?:boolean}>();
const releases=computed(()=>notes.releases.map(r=>!props.unlocked&&r.publicItems?{...r,title:r.publicTitle,items:r.publicItems}:r));
defineEmits<{close:[]}>();
</script>

<template>
  <section class="changelog" aria-labelledby="changelog-title">
    <header><div><div class="eyebrow">WARWALL / 更新档案</div><h2 id="changelog-title">更新日志 <span>v{{notes.version}}</span></h2></div><button aria-label="关闭更新日志" @click="$emit('close')">关闭 ✕</button></header>
    <div class="changelog-scroll" tabindex="0" aria-label="更新内容">
      <article v-for="release in releases" :key="release.version" class="release">
        <small>{{release.version===notes.version?'当前版本':'历史版本'}} · v{{release.version}}</small>
        <h3>{{release.title}}</h3>
        <ul><li v-for="item in release.items" :key="item">{{item}}</li></ul>
      </article>
      <h3 class="history-heading">此前更新回顾</h3>
      <p class="history-note">早期更新未记录独立版本号与发布日期，以下按主题汇总，最近的功能排在前面。</p>
      <details v-for="entry in notes.history" :key="entry.title">
        <summary>{{entry.title}}</summary>
        <ul><li v-for="item in entry.items" :key="item">{{item}}</li></ul>
      </details>
    </div>
    <footer>每一道防线，都在变得更好。<button class="primary" @click="$emit('close')">返回首页</button></footer>
  </section>
</template>

<style scoped>
.changelog{display:flex;flex-direction:column;max-height:calc(100vh - 120px);text-align:left}
header{display:flex;align-items:center;justify-content:space-between;gap:20px;padding-bottom:20px;flex-shrink:0}
.eyebrow{margin-bottom:10px}h2{margin:0!important}h2 span{font-size:14px;color:#d5c28e;margin-left:12px}
header button{padding:9px 14px;white-space:nowrap}.changelog-scroll{min-height:0;overflow:auto;padding-right:14px;overscroll-behavior:contain}
.release{padding:20px;background:linear-gradient(120deg,#34453088,#27332766);border:1px solid #b4bd7755;border-radius:4px}.release small{color:#d9ca91;font-size:11px}.release h3{font-size:21px;margin:10px 0 16px}
ul{padding-left:20px;margin:0}li{color:#bbc9ac;font-size:13px;line-height:1.9;margin-bottom:11px}li:last-child{margin-bottom:0}
.history-heading{margin:24px 0 8px;font-size:17px}.history-note{color:#8e9e82;line-height:1.8}details{border-top:1px solid #81956c33;padding:14px 0}summary{cursor:pointer;font-size:14px;color:#d0daba}details ul{margin-top:14px}
footer{display:flex;align-items:center;justify-content:space-between;gap:16px;padding-top:20px;font-size:11px;color:#93a481;flex-shrink:0}footer button{padding:12px 24px}
</style>
