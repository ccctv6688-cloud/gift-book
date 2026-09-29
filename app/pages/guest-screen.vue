<script setup>
import { startGuestScreen } from '~/legacy/guest-screen'

definePageMeta({ alias: ['/guest-screen.html'] })

const { error } = useLegacyPage({
  title: "礼簿展示屏",
  bodyClass: "theme-festive",
  styles: ["/static/remixicon.css","/static/pell.min.css","/styles/guest-screen.css"],
  scripts: ["/static/pell.min.js"],
  start: startGuestScreen,
})
</script>

<template>
  <div>
    <p v-if="error" role="alert" class="startup-error">{{ error }}</p>
    <!-- Legacy markup is managed by the existing application during migration. -->
    <div v-pre>
      <div id="layout-root" class="flex flex-row w-screen h-screen">
        <div id="qr-code-area">
          <div class="flex flex-1 flex-col min-h-0">
            <div id="alipay-qr-container" class="qr-container" style="display: none">
              <p class="vertical-text">支付宝</p>
              <img id="qr-alipay-img" src="" alt="Alipay" />
            </div>
            <div id="wechat-qr-container" class="qr-container" style="display: none">
              <p class="vertical-text">微信</p>
              <img id="qr-wechat-img" src="" alt="WeChat Pay" />
            </div>
          </div>
          <div id="custom-text-display" class="custom-text-area"></div>
        </div>
      
        <div id="app-container" class="hidden flex-1 h-full">
          <div class="gift-book-frame">
            <div class="text-center mb-6">
              <h1 id="event-title" class="text-4xl font-bold" style="color: var(--primary-color); letter-spacing: 8px">礼簿</h1>
            </div>
            <div id="gift-book-content" class="gift-book-content"></div>
          </div>
          
      <div id="top-right-controls">
        <button id="settings-btn" title="设置">
          <i id="settings-icon" class="ri-settings-3-line text-2xl"></i>
        </button>
        <button id="fullscreen-btn" title="全屏/退出全屏">
          <i id="fullscreen-icon" class="ri-fullscreen-line text-2xl"></i>
        </button>
      </div>
        </div>
      </div>
      <div id="fullscreen-hint">按 F11 进入全屏以获得最佳效果</div>
      <div id="modal-container" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center hidden z-50">
        <div id="modal" class="bg-white p-6 rounded-lg shadow-xl">
          <h3 id="modal-title" class="text-xl font-bold mb-4 text-center"></h3>
          <div id="modal-content"></div>
          <div id="modal-actions" class="mt-6 flex justify-end space-x-3"></div>
        </div>
      </div>
    </div>
  </div>
</template>
