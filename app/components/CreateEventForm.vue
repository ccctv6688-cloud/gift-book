<script setup>
import { onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'

const props = defineProps({
  disabled: { type: Boolean, default: false },
})
const emit = defineEmits(['submit', 'theme-change'])

function defaultValues() {
  const now = new Date()
  // Date inputs use the local calendar date; UTC conversion can shift the day.
  const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  return {
    name: '',
    startDate: date,
    startTime: '00:00',
    endDate: date,
    endTime: '23:59',
    password: '',
    theme: 'theme-festive',
    voiceName: '',
    recorder: '',
  }
}

const form = reactive(defaultValues())
const voices = ref([])
const speechSupported = ref(false)
let synthesis = null

watch(
  () => form.theme,
  (theme) => emit('theme-change', theme),
)

function refreshVoices() {
  voices.value = synthesis.getVoices()
    .filter((voice) => voice.lang.startsWith('zh'))
    .map((voice) => ({ name: voice.name, lang: voice.lang }))
  if (form.voiceName && !voices.value.some((voice) => voice.name === form.voiceName)) {
    form.voiceName = ''
  }
}

onMounted(() => {
  speechSupported.value = Boolean(window.speechSynthesis && window.SpeechSynthesisUtterance)
  if (!speechSupported.value) return
  synthesis = window.speechSynthesis
  synthesis.addEventListener('voiceschanged', refreshVoices)
  refreshVoices()
})

onBeforeUnmount(() => {
  synthesis?.removeEventListener('voiceschanged', refreshVoices)
})

function previewVoice() {
  if (props.disabled || !speechSupported.value) return
  synthesis.cancel()
  const utterance = new window.SpeechSynthesisUtterance('张三贺礼五百元整')
  utterance.lang = 'zh-CN'
  const voice = synthesis.getVoices().find((voice) => voice.name === form.voiceName)
  if (voice) utterance.voice = voice
  synthesis.speak(utterance)
}

function submit() {
  if (props.disabled) return
  emit('submit', {
    name: form.name.trim(),
    startDate: form.startDate.trim(),
    startTime: form.startTime.trim(),
    endDate: form.endDate.trim(),
    endTime: form.endTime.trim(),
    password: form.password,
    theme: form.theme.trim(),
    voiceName: form.voiceName.trim(),
    recorder: form.recorder.trim(),
  })
}

function reset() {
  Object.assign(form, defaultValues())
  emit('theme-change', form.theme)
}

defineExpose({ reset })
</script>

<template>
  <form id="create-event-form" class="space-y-4" @submit.prevent="submit" @reset.prevent="reset">
    <fieldset :disabled="props.disabled" class="min-w-0 space-y-4">
      <input id="event-name" v-model="form.name" type="text" placeholder="事项名称 (例如: 张三李四新婚之喜)" required class="w-full min-w-0 p-3 border rounded-lg focus:ring-2 themed-ring" />
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 min-w-0">
        <div class="min-w-0">
          <label class="block text-sm font-medium text-gray-700">开始时间</label>
          <div class="flex gap-2 min-w-0">
            <input id="start-date" v-model="form.startDate" type="date" required class="w-full min-w-0 p-3 border rounded-lg focus:ring-2 themed-ring" />
            <input id="start-time" v-model="form.startTime" type="time" required class="w-full min-w-0 p-3 border rounded-lg focus:ring-2 themed-ring" />
          </div>
        </div>
        <div class="min-w-0">
          <label class="block text-sm font-medium text-gray-700">结束时间</label>
          <div class="flex gap-2 min-w-0">
            <input id="end-date" v-model="form.endDate" type="date" required class="w-full min-w-0 p-3 border rounded-lg focus:ring-2 themed-ring" />
            <input id="end-time" v-model="form.endTime" type="time" required class="w-full min-w-0 p-3 border rounded-lg focus:ring-2 themed-ring" />
          </div>
        </div>
      </div>
      <input id="admin-password" v-model="form.password" type="password" autocomplete="new-password" placeholder="设置管理密码 (请牢记)" required class="w-full min-w-0 p-3 border rounded-lg focus:ring-2 themed-ring" />

      <details class="group">
        <summary class="cursor-pointer text-sm font-medium text-gray-600 group-hover:text-gray-900 list-none">
          <div class="flex items-center">
            <span>更多设置</span>
            <i class="ri-arrow-down-s-line text-lg ml-1 transition-transform transform group-open:rotate-180"></i>
          </div>
        </summary>
        <div class="mt-4 p-4 bg-gray-50 rounded-lg border min-w-0">
          <div>
            <label for="event-theme" class="block text-sm font-medium text-gray-700">界面风格</label>
            <select id="event-theme" v-model="form.theme" class="mt-1 w-full min-w-0 p-3 border rounded-lg focus:ring-2 themed-ring">
              <option value="theme-festive">喜庆红 (喜事)</option>
              <option value="theme-solemn">肃穆灰 (白事)</option>
            </select>
            <p class="text-xs text-gray-500 mt-2">为不同性质的事项选择合适的界面配色风格。</p>
          </div>
          <div class="mt-4 min-w-0">
            <label for="event-voice" class="block text-sm font-medium text-gray-700">语音播报音色</label>
            <div class="flex items-center gap-2 mt-1 min-w-0">
              <select id="event-voice" v-model="form.voiceName" class="text-sm flex-grow w-full min-w-0 p-3 border rounded-lg focus:ring-2 themed-ring">
                <option value="">{{ speechSupported ? '默认音色' : '设备不支持语音' }}</option>
                <option v-for="voice in voices" :key="`${voice.name}-${voice.lang}`" :value="voice.name">{{ voice.name }} ({{ voice.lang }})</option>
              </select>
              <button id="preview-create-voice-btn" type="button" :disabled="!speechSupported" class="themed-button-secondary border p-3 rounded-lg whitespace-nowrap text-xl shrink-0" @click="previewVoice"><i class="ri-volume-up-line"></i> 预览</button>
            </div>
            <p class="text-xs text-gray-500 mt-2">选择一个喜欢的播报声音。</p>
          </div>
          <div class="mt-4">
            <label class="block text-sm font-medium text-gray-700">记账人</label>
            <input id="event-recorder" v-model="form.recorder" type="text" placeholder="记账人 (例如: 王五，选填)" class="w-full min-w-0 mt-1 p-3 border rounded-lg focus:ring-2 themed-ring" />
          </div>
        </div>
      </details>

      <button type="submit" class="w-full themed-button-primary p-3 rounded-lg transition duration-300 font-bold">创建并进入</button>
    </fieldset>
  </form>
</template>
