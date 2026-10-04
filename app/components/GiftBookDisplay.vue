<script setup>
import { ref } from 'vue'

const bookContainerWrapper = ref(null)
const bookFooter = ref(null)
const giftBookContent = ref(null)
const pageSubtotalEl = ref(null)
const totalAmountEl = ref(null)
const totalGiversEl = ref(null)
const totalsVisibilityBtn = ref(null)
const prevPageBtn = ref(null)
const pageInfoEl = ref(null)
const nextPageBtn = ref(null)

defineExpose({
  getElements: () => ({
    bookContainerWrapper: bookContainerWrapper.value,
    bookFooter: bookFooter.value,
    giftBookContent: giftBookContent.value,
    pageSubtotalEl: pageSubtotalEl.value,
    totalAmountEl: totalAmountEl.value,
    totalGiversEl: totalGiversEl.value,
    totalsVisibilityBtn: totalsVisibilityBtn.value,
    prevPageBtn: prevPageBtn.value,
    pageInfoEl: pageInfoEl.value,
    nextPageBtn: nextPageBtn.value,
  }),
})
</script>

<template>
  <div class="lg:col-span-2">
    <div ref="bookContainerWrapper" class="gift-book-frame">
      <div ref="bookFooter" class="flex justify-between items-center mb-4 flex-wrap gap-y-2">
        <div class="flex items-center flex-wrap gap-x-4">
          <div><span class="font-bold text-md">本页小计:</span> <span ref="pageSubtotalEl" class="text-xl font-bold themed-text">******</span></div>
          <div><span class="font-bold text-md">总金额:</span> <span ref="totalAmountEl" class="text-xl font-bold themed-text">******</span></div>
          <div><span class="font-bold text-md">总人数:</span> <span ref="totalGiversEl" class="text-xl font-bold themed-text">0</span></div>
          <button ref="totalsVisibilityBtn" type="button" class="text-sm px-3 py-1 rounded-full border themed-ring bg-white hover:bg-gray-50">
            显示金额
          </button>
        </div>
        <div class="flex items-center space-x-2 text-lg">
          <button ref="prevPageBtn" class="themed-button-primary p-2 disabled:bg-gray-300 rounded-full w-8 h-8 flex items-center justify-center">
            <i class="ri-arrow-left-s-line"></i>
          </button>
          <div ref="pageInfoEl" class="font-bold flex items-center">第 1 / 1 页</div>
          <button ref="nextPageBtn" class="themed-button-primary p-2 disabled:bg-gray-300 rounded-full w-8 h-8 flex items-center justify-center">
            <i class="ri-arrow-right-s-line"></i>
          </button>
        </div>
      </div>
      <div ref="giftBookContent"></div>
    </div>
  </div>
</template>
