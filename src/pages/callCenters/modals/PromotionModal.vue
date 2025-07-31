<template>
  <VaModal
    :model-value="true"
    :mobile-fullscreen="false"
    size="large"
    hide-default-actions
    close-button
    @update:modelValue="emits('cancel')"
  >
    <div class="px-6 py-4">
      <h3 class="va-h3 mb-1 text-gray-800">Promotion Codes</h3>
      <p class="text-base font-semibold text-gray-700 mb-4">Available Codes:</p>

      <div v-if="promotion.length" class="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3">
        <template v-for="(promo, i) in promotion" :key="i">
          <template v-for="(code, j) in promo.codes" :key="j">
            <div
              class="flex items-center justify-between px-3 py-2 bg-gray-100 rounded-full shadow-sm cursor-pointer"
              @click="selectCode(code)"
            >
              <span class="text-sm font-medium text-gray-800 truncate">{{ code }}</span>
              <VaIcon
                name="copy"
                class="ml-2 cursor-pointer text-gray-500 hover:text-primary transition"
                @click.stop="copyToClipboard(code)"
              />
            </div>
          </template>
        </template>
      </div>

      <div v-else class="text-center text-gray-500 py-6">No promotion codes available.</div>
    </div>
  </VaModal>
</template>

<script setup>
import { useToast } from 'vuestic-ui'

const emits = defineEmits(['cancel', 'select-code'])
const { init } = useToast()

defineProps({
  promotion: {
    type: Array,
    default: () => [],
  },
})

function copyToClipboard(text) {
  navigator.clipboard
    .writeText(text)
    .then(() => {
      init({ message: 'Copied', color: 'success' })
    })
    .catch(() => {
      init({ message: 'Copy failed.', color: 'danger' })
    })
}
function selectCode(code) {
  emits('select-code', code)
  emits('cancel')
  init({ message: `Promo code selected`, color: 'success' })
}
</script>
