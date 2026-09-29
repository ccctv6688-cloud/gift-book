<script setup>
import { startGiftBook } from '~/legacy/gift-book'

definePageMeta({ alias: ['/index.html'] })

const createForm = ref(null)
const giftForm = ref(null)
let application

const { error, ready } = useLegacyPage({
  title: "电子礼簿系统 - 专业版",
  bodyClass: "bg-gray-100 flex items-center justify-center min-h-screen theme-festive",
  styles: ["/static/mermaid.min.css","/static/remixicon.css","/styles/gift-book.css"],
  scripts: ["/static/crypto-js.min.js"],
  start() {
    application = startGiftBook({
      resetCreateForm: () => createForm.value?.reset(),
      resetGiftForm: () => giftForm.value?.reset(),
    })
    return application
  },
})

function submitEvent(data) {
  application?.createEvent(data)
}

function previewTheme(theme) {
  application?.previewTheme(theme)
}

function submitGift(data) {
  application?.addGift(data)
}
</script>

<template>
  <div>
    <p v-if="error" role="alert" class="startup-error">{{ error }}</p>
    <div>
      <div id="app-container" class="w-full max-w-7xl mx-auto p-4">
        <!-- 设置界面 -->
        <div id="setup-screen" class="bg-white p-8 rounded-lg shadow-xl max-w-2xl mx-auto hidden">
          <h1 class="text-3xl font-bold text-center themed-header mb-6">电子礼簿系统</h1>
          <div id="select-event-section" class="mb-8 hidden">
            <h2 class="text-xl font-semibold mb-4 border-b pb-2">选择事项</h2>
            <div class="flex items-center gap-3">
              <select id="event-selector" class="flex-1 p-3 border rounded-lg focus:ring-2 themed-ring">
                <option value="">请选择一个事项</option>
              </select>
              <button id="unlock-event-btn" class="themed-button-primary px-6 py-3 rounded-lg transition duration-300">进入</button>
              <button id="delete-selected-event-btn" class="themed-button-secondary border px-4 py-3 rounded-lg transition duration-300 whitespace-nowrap">删除</button>
            </div>
          </div>
          <div>
            <h2 class="text-xl font-semibold mb-4 border-b pb-2"><span id="or-text">或 </span>创建新事项</h2>
            <CreateEventForm ref="createForm" :disabled="!ready" @submit="submitEvent" @theme-change="previewTheme" />
          </div>
        </div>
      
        <!-- 主界面 -->
        <div id="main-screen" class="hidden">
          <div class="flex justify-between items-start mb-4 pr-16 min-h-12">
            <div class="flex items-center gap-4 min-w-0">
              <div class="relative min-w-0">
                <div id="event-switcher-trigger" class="flex items-start gap-2 cursor-pointer group min-w-0">
                  <h1 id="current-event-title" class="text-2xl font-bold themed-dropdown-text max-sm:text-xl min-w-0 break-words"></h1>
                  <i class="ri-arrow-down-s-line text-2xl themed-dropdown-text shrink-0"></i>
                </div>
                <div id="event-dropdown" class="absolute top-full left-0 mt-2 w-72 bg-white rounded-md shadow-lg z-10 hidden"></div>
              </div>
            </div>
          </div>
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- 左侧录入区 -->
            <div class="lg:col-span-1 bg-white p-6 rounded-lg shadow-lg">
              <h2 class="text-2xl font-bold mb-4 text-center border-b pb-2">礼金录入</h2>
              <GiftEntryForm ref="giftForm" :disabled="!ready" @submit="submitGift" />
              <div class="mt-6 pt-6 border-t">
                <h3 class="text-xl font-semibold mb-3">功能区</h3>
                <div class="space-y-3">
                  <div class="relative">
                    <input type="text" id="search-name" placeholder="按姓名查找..." class="w-full p-3 border rounded-lg focus:ring-2 themed-ring pr-10" />
                    <i id="search-icon" class="ri-search-line text-xl absolute right-3 top-3 text-gray-400 cursor-pointer"></i>
                  </div>
                  <button id="print-btn" class="w-full themed-button-primary p-3 rounded-lg">打印/另存为PDF</button>
                  <button id="export-excel-btn" class="w-full border themed-button-secondary p-3 rounded-lg">导出为 Excel</button>
                  <button id="stats-btn" class="w-full themed-button-primary p-3 rounded-lg">查看统计</button>
                  <div class="flex items-center justify-between bg-gray-100 p-3 rounded-lg">
                    <span class="font-medium text-gray-700">语音播报</span>
                    <label for="speech-toggle" class="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" id="speech-toggle" class="sr-only peer" checked />
                      <div
                        class="toggle-bg w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"
                      ></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <!-- 右侧展示区 -->
            <div class="lg:col-span-2">
              <div id="book-container-wrapper" class="gift-book-frame">
                <div id="book-footer" class="flex justify-between items-center mb-4 flex-wrap gap-y-2">
                  <div class="flex items-center flex-wrap gap-x-4">
                    <div><span class="font-bold text-md">本页小计:</span> <span id="page-subtotal" class="text-xl font-bold themed-text">￥0.00</span></div>
                    <div><span class="font-bold text-md">总金额:</span> <span id="total-amount" class="text-xl font-bold themed-text">￥0.00</span></div>
                    <div><span class="font-bold text-md">总人数:</span> <span id="total-givers" class="text-xl font-bold themed-text">0</span></div>
                  </div>
                  <div class="flex items-center space-x-2 text-lg">
                    <button id="prev-page-btn" class="themed-button-primary p-2 disabled:bg-gray-300 rounded-full w-8 h-8 flex items-center justify-center">
                      <i class="ri-arrow-left-s-line"></i>
                    </button>
                    <div id="page-info" class="font-bold flex items-center">第 1 / 1 页</div>
                    <button id="next-page-btn" class="themed-button-primary p-2 disabled:bg-gray-300 rounded-full w-8 h-8 flex items-center justify-center">
                      <i class="ri-arrow-right-s-line"></i>
                    </button>
                  </div>
                </div>
                <div id="gift-book-content"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="absolute lg:fixed top-5 right-5 flex gap-3 z-40">
        <button id="fullscreen-btn" class="bg-white/80 backdrop-blur rounded-full p-2 shadow-sm hover:shadow-md transition-all" title="全屏/退出全屏">
          <i id="fullscreen-icon" class="ri-fullscreen-line text-2xl themed-text themed-dropdown-text"></i>
        </button>
      </div>
      <!-- 模态框 -->
      <div id="modal-container" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center hidden z-50">
        <div id="modal" class="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
          <button id="modal-close-btn" type="button" aria-label="关闭弹窗" class="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition focus:outline-none">
            <i class="ri-close-line text-2xl"></i>
          </button>
          <h3 id="modal-title" class="text-xl font-bold mb-4 text-center"></h3>
          <div id="modal-content"></div>
          <div id="modal-actions" class="mt-6 flex justify-end space-x-3"></div>
        </div>
      </div>
    </div>
  </div>
</template>
