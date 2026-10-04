<script setup>
import { ref } from 'vue'

const fullscreenBtn = ref(null)
const fullscreenIcon = ref(null)

defineExpose({
  getElements: () => ({
    fullscreenBtn: fullscreenBtn.value,
    fullscreenIcon: fullscreenIcon.value,
  }),
})
</script>

<template>
  <div class="absolute lg:fixed top-5 right-5 flex gap-3 z-40">
    <button ref="fullscreenBtn" class="bg-white/80 backdrop-blur rounded-full p-2 shadow-sm hover:shadow-md transition-all" title="全屏/退出全屏">
      <i ref="fullscreenIcon" class="ri-fullscreen-line text-2xl themed-text themed-dropdown-text"></i>
    </button>
  </div>
</template>
