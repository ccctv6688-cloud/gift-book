<script setup>
import { ref } from 'vue'

const eventSwitcherTrigger = ref(null)
const currentEventTitleEl = ref(null)
const eventDropdown = ref(null)

defineExpose({
  getElements: () => ({
    eventSwitcherTrigger: eventSwitcherTrigger.value,
    currentEventTitleEl: currentEventTitleEl.value,
    eventDropdown: eventDropdown.value,
  }),
})
</script>

<template>
  <div class="flex justify-between items-start mb-4 pr-16 min-h-12">
    <div class="flex items-center gap-4 min-w-0">
      <div class="relative min-w-0">
        <div ref="eventSwitcherTrigger" class="flex items-start gap-2 cursor-pointer group min-w-0">
          <h1 ref="currentEventTitleEl" class="text-2xl font-bold themed-dropdown-text max-sm:text-xl min-w-0 break-words"></h1>
          <i class="ri-arrow-down-s-line text-2xl themed-dropdown-text shrink-0"></i>
        </div>
        <div ref="eventDropdown" class="absolute top-full left-0 mt-2 w-72 bg-white rounded-md shadow-lg z-10 hidden"></div>
      </div>
    </div>
  </div>
</template>
