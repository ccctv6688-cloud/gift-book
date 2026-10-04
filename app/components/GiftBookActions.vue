<script setup>
import { ref } from 'vue'

const searchNameInput = ref(null)
const searchIcon = ref(null)
const printBtn = ref(null)
const exportExcelBtn = ref(null)
const statsBtn = ref(null)
const speechToggle = ref(null)

defineExpose({
  getElements: () => ({
    searchNameInput: searchNameInput.value,
    searchIcon: searchIcon.value,
    printBtn: printBtn.value,
    exportExcelBtn: exportExcelBtn.value,
    statsBtn: statsBtn.value,
    speechToggle: speechToggle.value,
  }),
})
</script>

<template>
  <div class="mt-6 pt-6 border-t">
    <h3 class="text-xl font-semibold mb-3">功能区</h3>
    <div class="space-y-3">
      <div class="relative">
        <input ref="searchNameInput" type="text" placeholder="按姓名查找..." class="w-full p-3 border rounded-lg focus:ring-2 themed-ring pr-10" />
        <i ref="searchIcon" class="ri-search-line text-xl absolute right-3 top-3 text-gray-400 cursor-pointer"></i>
      </div>
      <button ref="printBtn" class="w-full themed-button-primary p-3 rounded-lg">打印/另存为PDF</button>
      <button ref="exportExcelBtn" class="w-full border themed-button-secondary p-3 rounded-lg">导出为 Excel</button>
      <button ref="statsBtn" class="w-full themed-button-primary p-3 rounded-lg">查看统计</button>
      <div class="flex items-center justify-between bg-gray-100 p-3 rounded-lg">
        <span class="font-medium text-gray-700">语音播报</span>
        <label class="relative inline-flex items-center cursor-pointer">
          <input ref="speechToggle" type="checkbox" class="sr-only peer" checked />
          <div
            class="toggle-bg w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"
          ></div>
        </label>
      </div>
    </div>
  </div>
</template>
