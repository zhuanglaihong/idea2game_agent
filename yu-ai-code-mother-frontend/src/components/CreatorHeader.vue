<script setup lang="ts">
defineProps<{ mode: string }>()
</script>
<template>
  <header class="creator-header">
    <a href="/" class="creator-brand">✦ <strong>Idea2Game</strong><small>把想法变成游戏</small></a>
    <div class="creator-context"><span>{{ mode }}</span><slot name="context" /></div>
    <div class="creator-actions"><slot /></div>
  </header>
</template>
<style scoped>
.creator-header{display:flex;align-items:center;gap:24px;padding:18px 24px;background:#fff;border-bottom:1px solid #e6e1ee;flex-wrap:wrap;color:#38294b}.creator-brand{display:flex;align-items:center;gap:9px;color:#7052c9;text-decoration:none;font-size:23px}.creator-brand small{font-size:11px;color:#93859f;margin-left:8px}.creator-context{display:flex;gap:12px;align-items:center;font-size:12px;color:#8b779d}.creator-actions{margin-left:auto;display:flex;gap:10px;align-items:center;flex-wrap:wrap}@media(max-width:700px){.creator-header{padding:14px;gap:12px}.creator-actions{margin-left:0;width:100%}.creator-brand small{display:none}}
</style>
