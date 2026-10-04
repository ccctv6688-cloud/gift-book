<script setup>
import { ref } from 'vue'

defineProps({
  disabled: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['submit'])

const giftForm = ref(null)
const actions = ref(null)

defineExpose({
  reset: () => giftForm.value?.reset(),
  getElements: () => ({
    ...giftForm.value?.getElements(),
    ...actions.value?.getElements(),
  }),
})
</script>

<template>
  <div class="lg:col-span-1 bg-white p-6 rounded-lg shadow-lg">
    <h2 class="text-2xl font-bold mb-4 text-center border-b pb-2">礼金录入</h2>
    <GiftEntryForm ref="giftForm" :disabled="disabled" @submit="$emit('submit', $event)" />
    <GiftBookActions ref="actions" />
  </div>
</template>
