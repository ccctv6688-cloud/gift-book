<script setup>
import 'gridjs/dist/theme/mermaid.css'
import { startGiftBook } from '~/legacy/gift-book'

definePageMeta({ alias: ['/index.html'] })

const setupPanel = ref(null)
const giftEntryPanel = ref(null)
const mainScreen = ref(null)
const eventSwitcherHeader = ref(null)
const giftBookDisplay = ref(null)
const fullscreenControl = ref(null)
const legacyModal = ref(null)
let application

function collectLegacyElements() {
  return {
    mainScreen: mainScreen.value,
    ...setupPanel.value?.getElements(),
    ...eventSwitcherHeader.value?.getElements(),
    ...giftEntryPanel.value?.getElements(),
    ...giftBookDisplay.value?.getElements(),
    ...fullscreenControl.value?.getElements(),
    ...legacyModal.value?.getElements(),
  }
}

const { error, ready } = useLegacyPage({
  title: "电子礼簿系统 - 专业版",
  bodyClass: "bg-gray-100 flex items-center justify-center min-h-screen theme-festive",
  styles: ["/styles/gift-book.css"],
  start() {
    application = startGiftBook({
      resetCreateForm: () => setupPanel.value?.reset(),
      resetGiftForm: () => giftEntryPanel.value?.reset(),
      getElements: collectLegacyElements,
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
      <div class="app-container w-full max-w-7xl mx-auto p-4">
        <EventSetupPanel ref="setupPanel" :disabled="!ready" @submit="submitEvent" @theme-change="previewTheme" />
      
        <!-- 主界面 -->
        <div ref="mainScreen" class="hidden">
          <EventSwitcherHeader ref="eventSwitcherHeader" />
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <GiftEntryPanel ref="giftEntryPanel" :disabled="!ready" @submit="submitGift" />
            <GiftBookDisplay ref="giftBookDisplay" />
          </div>
        </div>
      </div>
      <FullscreenControl ref="fullscreenControl" />
      <LegacyModal ref="legacyModal" show-close modal-class="bg-white p-6 rounded-lg shadow-xl w-full max-w-md" />
    </div>
  </div>
</template>
