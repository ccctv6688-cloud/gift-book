<script setup>
defineProps({
  showClose: {
    type: Boolean,
    default: false,
  },
  modalClass: {
    type: String,
    default: 'bg-white p-6 rounded-lg shadow-xl',
  },
})

const modalContainer = ref(null)
const modal = ref(null)
const modalCloseBtn = ref(null)
const modalTitle = ref(null)
const modalContent = ref(null)
const modalActions = ref(null)

defineExpose({
  getElements: () => ({
    modalContainer: modalContainer.value,
    modal: modal.value,
    modalCloseBtn: modalCloseBtn.value,
    modalTitle: modalTitle.value,
    modalContent: modalContent.value,
    modalActions: modalActions.value,
  }),
})
</script>

<template>
  <div ref="modalContainer" class="legacy-modal-container fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center hidden z-50">
    <div ref="modal" :class="['legacy-modal', modalClass]">
      <button
        v-if="showClose"
        ref="modalCloseBtn"
        type="button"
        aria-label="关闭弹窗"
        class="legacy-modal-close w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition focus:outline-none"
      >
        <i class="ri-close-line text-2xl"></i>
      </button>
      <h3 ref="modalTitle" class="legacy-modal-title text-xl font-bold mb-4 text-center"></h3>
      <div ref="modalContent" class="legacy-modal-content"></div>
      <div ref="modalActions" class="legacy-modal-actions mt-6 flex justify-end space-x-3"></div>
    </div>
  </div>
</template>
