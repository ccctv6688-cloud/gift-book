<script setup>
import 'pell/dist/pell.min.css'
import { startGuestScreen } from '~/legacy/guest-screen'

definePageMeta({ alias: ['/guest-screen.html'] })

const layoutRoot = ref(null)
const qrCodeArea = ref(null)
const alipayQrContainer = ref(null)
const qrAlipayImg = ref(null)
const wechatQrContainer = ref(null)
const qrWechatImg = ref(null)
const customTextDisplay = ref(null)
const appContainer = ref(null)
const eventTitle = ref(null)
const giftBookContent = ref(null)
const settingsBtn = ref(null)
const settingsIcon = ref(null)
const fullscreenBtn = ref(null)
const fullscreenIcon = ref(null)
const fullscreenHint = ref(null)
const legacyModal = ref(null)

function collectGuestElements() {
  return {
    layoutRoot: layoutRoot.value,
    qrCodeArea: qrCodeArea.value,
    qrAlipayContainer: alipayQrContainer.value,
    qrAlipayImg: qrAlipayImg.value,
    qrWechatContainer: wechatQrContainer.value,
    qrWechatImg: qrWechatImg.value,
    customTextDisplay: customTextDisplay.value,
    appContainer: appContainer.value,
    eventTitle: eventTitle.value,
    giftBookContent: giftBookContent.value,
    settingsBtn: settingsBtn.value,
    settingsIcon: settingsIcon.value,
    fullscreenBtn: fullscreenBtn.value,
    fullscreenIcon: fullscreenIcon.value,
    fullscreenHint: fullscreenHint.value,
    ...legacyModal.value?.getElements(),
  }
}

const { error } = useLegacyPage({
  title: "礼簿展示屏",
  bodyClass: "theme-festive",
  styles: ["/styles/guest-screen.css"],
  start() {
    return startGuestScreen({
      getElements: collectGuestElements,
    })
  },
})
</script>

<template>
  <div>
    <p v-if="error" role="alert" class="startup-error">{{ error }}</p>
    <div>
      <div ref="layoutRoot" class="guest-layout-root flex flex-row w-screen h-screen">
        <div ref="qrCodeArea" class="guest-qr-code-area">
          <div class="flex flex-1 flex-col min-h-0">
            <div ref="alipayQrContainer" class="qr-container" style="display: none">
              <p class="vertical-text">支付宝</p>
              <img ref="qrAlipayImg" src="" alt="Alipay" />
            </div>
            <div ref="wechatQrContainer" class="qr-container" style="display: none">
              <p class="vertical-text">微信</p>
              <img ref="qrWechatImg" src="" alt="WeChat Pay" />
            </div>
          </div>
          <div ref="customTextDisplay" class="custom-text-area"></div>
        </div>
      
        <div ref="appContainer" class="guest-app-container hidden flex-1 h-full">
          <div class="gift-book-frame">
            <div class="text-center mb-6">
              <h1 ref="eventTitle" class="text-4xl font-bold" style="color: var(--primary-color); letter-spacing: 8px">礼簿</h1>
            </div>
            <div ref="giftBookContent" class="gift-book-content"></div>
          </div>
          
      <div class="top-right-controls">
        <button ref="settingsBtn" class="screen-icon-btn" title="设置">
          <i ref="settingsIcon" class="ri-settings-3-line text-2xl screen-icon"></i>
        </button>
        <button ref="fullscreenBtn" class="screen-icon-btn" title="全屏/退出全屏">
          <i ref="fullscreenIcon" class="ri-fullscreen-line text-2xl screen-icon"></i>
        </button>
      </div>
        </div>
      </div>
      <div ref="fullscreenHint" class="fullscreen-hint">按 F11 进入全屏以获得最佳效果</div>
    </div>
    <LegacyModal ref="legacyModal" />
  </div>
</template>
