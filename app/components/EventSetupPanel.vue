<script setup>
import { ref } from 'vue'

defineProps({
  disabled: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['submit', 'theme-change'])

const createForm = ref(null)
const setupScreen = ref(null)
const selectEventSection = ref(null)
const eventSelector = ref(null)
const unlockEventBtn = ref(null)
const deleteSelectedEventBtn = ref(null)
const orText = ref(null)

defineExpose({
  reset: () => createForm.value?.reset(),
  getElements: () => ({
    setupScreen: setupScreen.value,
    selectEventSection: selectEventSection.value,
    eventSelector: eventSelector.value,
    unlockEventBtn: unlockEventBtn.value,
    deleteSelectedEventBtn: deleteSelectedEventBtn.value,
    orText: orText.value,
    ...createForm.value?.getElements(),
  }),
})
</script>

<template>
  <div ref="setupScreen" class="bg-white p-8 rounded-lg shadow-xl max-w-2xl mx-auto hidden">
    <h1 class="text-3xl font-bold text-center themed-header mb-6">电子礼簿系统</h1>
    <div ref="selectEventSection" class="mb-8 hidden">
      <h2 class="text-xl font-semibold mb-4 border-b pb-2">选择事项</h2>
      <div class="flex items-center gap-3">
        <select ref="eventSelector" class="flex-1 p-3 border rounded-lg focus:ring-2 themed-ring">
          <option value="">请选择一个事项</option>
        </select>
        <button ref="unlockEventBtn" class="themed-button-primary px-6 py-3 rounded-lg transition duration-300">进入</button>
        <button ref="deleteSelectedEventBtn" class="themed-button-secondary border px-4 py-3 rounded-lg transition duration-300 whitespace-nowrap">删除</button>
      </div>
    </div>
    <div>
      <h2 class="text-xl font-semibold mb-4 border-b pb-2"><span ref="orText">或 </span>创建新事项</h2>
      <CreateEventForm ref="createForm" :disabled="disabled" @submit="$emit('submit', $event)" @theme-change="$emit('theme-change', $event)" />
    </div>
  </div>
</template>
