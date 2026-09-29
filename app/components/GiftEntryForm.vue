<script setup>
import { nextTick, reactive, ref } from 'vue'

const props = defineProps({
  disabled: { type: Boolean, default: false },
})
const emit = defineEmits(['submit'])

const form = reactive({
  name: '',
  amount: '',
  type: '现金',
  remarkData: { custom: '', gift: '', relation: '', phone: '', address: '' },
})
const nameInput = ref(null)
const selectedRemarkPresets = ref([])
const remarkPresets = [
  { key: 'gift', label: '礼品' },
  { key: 'relation', label: '关系' },
  { key: 'phone', label: '电话' },
  { key: 'address', label: '住址' },
]

function toggleRemarkPreset(key) {
  if (props.disabled) return
  const index = selectedRemarkPresets.value.indexOf(key)
  if (index === -1) {
    selectedRemarkPresets.value.push(key)
  } else {
    selectedRemarkPresets.value.splice(index, 1)
    form.remarkData[key] = ''
  }
}

function submit() {
  if (props.disabled) return
  const remarkData = {}
  for (const key of ['custom', ...selectedRemarkPresets.value]) {
    const value = form.remarkData[key].trim()
    if (value) remarkData[key] = value
  }
  emit('submit', {
    name: form.name.trim(),
    amount: form.amount,
    type: form.type.trim(),
    remarkData,
  })
}

async function reset() {
  form.name = ''
  form.amount = ''
  form.type = '现金'
  for (const key of Object.keys(form.remarkData)) {
    form.remarkData[key] = ''
  }
  selectedRemarkPresets.value = []
  await nextTick()
  nameInput.value?.focus()
}

defineExpose({ reset })
</script>

<template>
  <form id="add-gift-form" class="space-y-4" @submit.prevent="submit" @reset.prevent="reset">
    <fieldset :disabled="props.disabled" class="min-w-0 space-y-4">
      <input id="guest-name" ref="nameInput" v-model="form.name" type="text" placeholder="姓名" required class="w-full min-w-0 p-3 border rounded-lg focus:ring-2 themed-ring" />
      <input id="gift-amount" v-model.number="form.amount" type="number" placeholder="金额 (元)" required min="0" max="999999999999" step="0.01" class="w-full min-w-0 p-3 border rounded-lg focus:ring-2 themed-ring" />
      <div class="flex flex-wrap items-center gap-x-2 gap-y-2">
        <label class="text-sm font-medium text-gray-700 whitespace-nowrap">收款类型：</label>
        <div class="flex flex-wrap gap-x-3 gap-y-2">
          <label class="flex items-center space-x-2 cursor-pointer"><input v-model="form.type" type="radio" name="payment-type" value="现金" class="themed-text-radio themed-ring" /><span>现金</span></label>
          <label class="flex items-center space-x-2 cursor-pointer"><input v-model="form.type" type="radio" name="payment-type" value="微信" class="themed-text-radio themed-ring" /><span>微信</span></label>
          <label class="flex items-center space-x-2 cursor-pointer"><input v-model="form.type" type="radio" name="payment-type" value="支付宝" class="themed-text-radio themed-ring" /><span>支付宝</span></label>
          <label class="flex items-center space-x-2 cursor-pointer"><input v-model="form.type" type="radio" name="payment-type" value="其他" class="themed-text-radio themed-ring" /><span>其他</span></label>
        </div>
      </div>
      <textarea id="guest-remark-custom" v-model="form.remarkData.custom" class="w-full min-w-0 p-3 border rounded-lg focus:ring-2 themed-ring" rows="2" placeholder="备注内容（选填）" data-remark-type="custom"></textarea>
      <div class="flex flex-wrap items-center gap-x-1 gap-y-2">
        <label class="text-sm font-medium text-gray-700 whitespace-nowrap">更多备注：</label>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="preset in remarkPresets"
            :key="preset.key"
            type="button"
            class="remark-preset-btn px-3 py-1.5 text-xs border rounded-lg themed-ring"
            :class="selectedRemarkPresets.includes(preset.key) ? 'themed-button-primary' : 'themed-button-secondary'"
            :data-preset="preset.key"
            :aria-pressed="selectedRemarkPresets.includes(preset.key)"
            @click="toggleRemarkPreset(preset.key)"
          >{{ preset.label }}</button>
        </div>
      </div>
      <div id="remark-inputs-container" class="space-y-2 min-w-0">
        <template v-for="preset in remarkPresets" :key="preset.key">
          <div v-if="selectedRemarkPresets.includes(preset.key)" class="flex items-center min-w-0">
            <label :for="`guest-remark-${preset.key}`" class="text-sm font-medium text-gray-700 w-12 shrink-0">{{ preset.label }}:</label>
            <input :id="`guest-remark-${preset.key}`" v-model="form.remarkData[preset.key]" type="text" class="flex-1 min-w-0 p-2 border rounded themed-ring" :data-remark-type="preset.key" :placeholder="`请输入${preset.label}`" />
          </div>
        </template>
      </div>
      <button type="submit" class="w-full themed-button-primary font-bold p-4 rounded-lg transition duration-300 text-lg">确认录入</button>
    </fieldset>
  </form>
</template>
